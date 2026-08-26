import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { and, gte, isNotNull, notInArray } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Daily check that every payment Stripe took has a complete, shippable order.
 *
 * WHY THIS EXISTS. An order is only marked paid, and only gets its shipping
 * address, when Stripe's webhook reaches us. Stripe retries a failing delivery
 * for about three days and then gives up. If it never lands, the customer has
 * been charged and our row still says pending_payment with nowhere to ship to
 * -- money taken, order invisible.
 *
 * The realistic cause is not a blip. It is a wrong STRIPE_WEBHOOK_SECRET after
 * a key rotation, or a handler bug that throws on every payload: both fail
 * EVERY delivery until someone notices, which is precisely why noticing needs
 * to be automatic. CloudWatch cannot see it -- the site is healthy, the data
 * is wrong.
 *
 * AUTH. Bearer token in RECONCILE_TOKEN, compared in constant time. This route
 * reads order and payment state, so it is not public. It is deliberately NOT
 * behind Clerk: the caller is a scheduler, not a person, and giving a machine
 * a staff session would be worse. Returns 404 rather than 401 when the token
 * is unset, so an unconfigured deployment does not advertise the endpoint.
 *
 * SAFE TO CALL REPEATEDLY. It only reads; nothing here writes to the database
 * or to Stripe.
 */
export const dynamic = "force-dynamic";

function tokenOk(header: string | null): boolean {
  const expected = process.env.RECONCILE_TOKEN;
  if (!expected) return false;
  const given = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, so compare lengths first -- but
  // still run the comparison on equal-length buffers so a wrong-length token
  // cannot be distinguished by timing alone.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!process.env.RECONCILE_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Brute-forcing a 43-char random token is infeasible, so this is hardening
  // rather than a hole -- but a token holder triggers DB reads plus one live
  // Stripe call per order, and Stripe's rate limits are per ACCOUNT, so a
  // tight loop here would compete with real checkouts.
  const limited = rateLimit(req, "reconcile", 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  if (!tokenOk(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const stripe = getStripe();
  if (!db || !stripe) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // BOUNDED, on purpose. Every order ever placed would otherwise stay in the
  // checked set forever, one sequential Stripe read each, against Amplify's
  // ~30s response cap -- so this control would break silently somewhere around
  // 100-200 orders, i.e. exactly as the shop starts succeeding. And because
  // the email is composed after the loop, a timeout would kill the alert too.
  //
  // 35 days is generous: Stripe abandons webhook retries after about three, so
  // anything older than that is settled one way or the other and re-reporting
  // it is noise. Ageing out is also what stops the pre-2026-08-24 order (paid
  // before shipping_address_collection existed) alarming every night forever.
  const WINDOW_DAYS = 35;
  const MAX_ORDERS = 300;
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      id: schema.orders.id,
      status: schema.orders.status,
      sessionId: schema.orders.stripeSessionId,
      line1: schema.orders.shippingLine1,
    })
    .from(schema.orders)
    .where(
      and(
        isNotNull(schema.orders.stripeSessionId),
        gte(schema.orders.createdAt, since),
        // A cancelled order is neither paid nor pending in any way this check
        // can reason about -- staff can cancel a never-paid order, which would
        // otherwise flag nightly forever.
        notInArray(schema.orders.status, ["canceled"]),
      ),
    )
    .limit(MAX_ORDERS);

  const problems: { order: string; problem: string }[] = [];
  if (rows.length === MAX_ORDERS) {
    problems.push({
      order: "-",
      problem: `hit the ${MAX_ORDERS}-order cap: some orders in the window were NOT checked`,
    });
  }

  for (const o of rows) {
    if (!o.sessionId) continue;
    let paidInStripe: boolean;
    try {
      const session = await stripe.checkout.sessions.retrieve(o.sessionId);
      // no_payment_required is what a 100%-off promotion code produces, and
      // the webhook already marks any completed session paid regardless.
      // Treating it as unpaid would flag every such order nightly.
      paidInStripe =
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required";
    } catch {
      problems.push({ order: o.id, problem: "Stripe session could not be read" });
      continue;
    }
    const paidHere = o.status !== "pending_payment" && o.status !== "payment_failed";

    // The dangerous one: money moved, our records do not show it.
    if (paidInStripe && !paidHere) {
      problems.push({ order: o.id, problem: `PAID IN STRIPE but stored status is "${o.status}" — money taken, order not recorded` });
    }
    if (!paidInStripe && paidHere) {
      problems.push({ order: o.id, problem: `stored status is "${o.status}" but Stripe has not been paid` });
    }
    // Only for orders nobody has picked up yet. Once staff have moved one to
    // in_progress or shipped they have the address by other means, and
    // re-reporting it is the noise that gets an alert mail-ruled away.
    const untouched = o.status === "paid";
    if (paidInStripe && untouched && !o.line1) {
      problems.push({ order: o.id, problem: "paid but no shipping address stored — cannot be shipped" });
    }
  }

  // Only ever mails when something is wrong. A daily "all fine" message trains
  // the reader to ignore it, and this is the one that must not be ignored.
  // ⚠️ THE ALERT MUST NOT FAIL SILENTLY. This is RCA finding #2's exact shape:
  // a fetch whose failure falls through to the success path. A revoked
  // RESEND_API_KEY returns 401, which RESOLVES the promise, so a bare .catch()
  // would never even fire -- the route would answer 200 and the one message
  // that must not be missed would ring into a void. EventBridge only sees the
  // status code, never the body, so a failed send has to be a failed request.
  let alertFailed: string | null = null;
  if (problems.length > 0 && process.env.RESEND_API_KEY) {
    const to = (process.env.STAFF_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
    if (to.length > 0) {
      // Order ids only. No email, name, address or measurement -- same PII rule
      // as everywhere else; whoever reads this looks the order up themselves.
      const body = problems.map((p) => `- ${p.order}: ${p.problem}`).join("\n");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Shaklek <hello@shaklek.com>",
          to,
          subject: `Shaklek: ${problems.length} order(s) need attention`,
          text: `The daily reconciliation found orders where Stripe and our database disagree.\n\n${body}\n\nLook these up in the dashboard and in Stripe. Nothing has been changed automatically.`,
        }),
      }).catch(() => null);
      if (!res || !res.ok) {
        alertFailed = res ? `HTTP ${res.status}` : "request failed";
        // No PII: a status code and nothing else.
        console.error(`[reconcile] alert email FAILED (${alertFailed})`);
      }
    } else {
      alertFailed = "STAFF_EMAILS is empty — nobody to alert";
      console.error("[reconcile] problems found but STAFF_EMAILS is empty");
    }
  } else if (problems.length > 0) {
    alertFailed = "RESEND_API_KEY is unset — nobody to alert";
    console.error("[reconcile] problems found but RESEND_API_KEY is unset");
  }

  // A non-2xx so EventBridge retries and its failed-invocation metric moves.
  // The JSON body is a signal nobody receives; the status code is the only
  // thing a scheduler acts on.
  if (alertFailed) {
    return NextResponse.json(
      { ok: false, checked: rows.length, problems, alertFailed },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: problems.length === 0,
    checked: rows.length,
    problems,
  });
}
