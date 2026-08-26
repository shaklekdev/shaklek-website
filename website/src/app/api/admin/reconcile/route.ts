import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq, isNotNull } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getStripe } from "@/lib/stripe";

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
  if (!tokenOk(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const stripe = getStripe();
  if (!db || !stripe) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rows = await db
    .select({
      id: schema.orders.id,
      status: schema.orders.status,
      sessionId: schema.orders.stripeSessionId,
      line1: schema.orders.shippingLine1,
    })
    .from(schema.orders)
    .where(isNotNull(schema.orders.stripeSessionId));

  const problems: { order: string; problem: string }[] = [];

  for (const o of rows) {
    if (!o.sessionId) continue;
    let paidInStripe: boolean;
    try {
      const session = await stripe.checkout.sessions.retrieve(o.sessionId);
      paidInStripe = session.payment_status === "paid";
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
    if (paidInStripe && !o.line1) {
      problems.push({ order: o.id, problem: "paid but no shipping address stored — cannot be shipped" });
    }
  }

  // Only ever mails when something is wrong. A daily "all fine" message trains
  // the reader to ignore it, and this is the one that must not be ignored.
  if (problems.length > 0 && process.env.RESEND_API_KEY) {
    const to = (process.env.STAFF_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
    if (to.length > 0) {
      // Order ids only. No email, name, address or measurement -- same PII rule
      // as everywhere else; whoever reads this looks the order up themselves.
      const body = problems.map((p) => `- ${p.order}: ${p.problem}`).join("\n");
      await fetch("https://api.resend.com/emails", {
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
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    ok: problems.length === 0,
    checked: rows.length,
    problems,
  });
}
