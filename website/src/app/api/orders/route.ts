import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getStripe } from "@/lib/stripe";
import { resolveOrderPricing, type PricedItem } from "@/lib/pricing";
import { resolveFabric } from "@/data/fabrics";
import { resolveFitNotes } from "@/data/fitNotes";
import { issueOrderAccessToken } from "@/lib/orderAccess";
import { rateLimit } from "@/lib/rateLimit";
import { canonicalOrigin, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";
import {
  sendOrderNotificationEmail,
  sendCustomerConfirmationEmail,
  type NotifyOrderItem,
} from "@/lib/orderEmail";

// fitNotes is `unknown` deliberately: resolveFitNotes() takes anything and
// returns only ids that exist for the category, so typing it as string[] here
// would be a claim about the request body that nothing has checked.
type OrderItem = NotifyOrderItem & { category?: string; slug?: string; fitNotes?: unknown };

// Free-text fields go into the DB, the stylist's email and the spec sheet.
// Cap them so a scripted POST can't push megabytes through any of those.
const MAX_ITEMS = 20;
const MAX_TEXT = 2000;
const MAX_CHANGES = 40;
// MAX_ITEMS caps cart *lines*; quantity means one line can now be many
// garments, so the real bench load needs its own ceiling. Without this,
// 20 lines x 10 units is a 200-garment order against a solo tailor -- and
// 200 order_items rows written from a single request.
const MAX_UNITS = 20;

function text(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Persists the order to Postgres and returns the new order id. No RDS/Neon
// instance exists yet in every environment -- DATABASE_URL unset means
// getDb() returns null and the caller falls back to the pre-DB demo flow.
//
// `priced` is the server-resolved pricing, positionally aligned with `items`.
// The prices written here are always the catalog's, never the request's.
//
// A line ordered twice becomes two order_items rows rather than one row with
// a count. Each row is one garment to cut, which is what the tailor's spec
// sheet and the dashboard already assume -- so quantity needs no schema
// change, and no migration has to land before this can deploy.
async function persistOrder(
  items: OrderItem[],
  priced: PricedItem[],
  method: string,
  total: number,
  email: string,
) {
  const db = getDb();
  if (!db) return null;

  const [customer] = await db
    .insert(schema.customers)
    .values({ email })
    .onConflictDoNothing({ target: schema.customers.email })
    .returning();

  const customerRow =
    customer ??
    (await db.select().from(schema.customers).where(eq(schema.customers.email, email)))[0];

  const [orderRow] = await db
    .insert(schema.orders)
    .values({
      customerId: customerRow.id,
      totalAed: String(total),
      paymentMethod: method,
    })
    .returning();

  await db.insert(schema.orderItems).values(
    items.flatMap((item, index) =>
      Array.from({ length: priced[index].quantity }, () => ({
        orderId: orderRow.id,
        name: priced[index].name,
        category: priced[index].category,
        // Resolved against what we can actually make, never taken from the
        // request -- see resolveFabric in src/data/fabrics.ts.
        fabric: resolveFabric(item.fabric),
        color: text(item.color, 40),
        size: text(item.size, 40),
        measurements: text(item.measurements),
        // Re-resolved against the category the SERVER priced, not the one the
        // request claimed, and reduced to ids that genuinely exist for it.
        // This reaches a tailor's document, so nothing a client can type may
        // survive -- same rule as price, quantity and fabric.
        fitNotes: resolveFitNotes(priced[index].category, item.fitNotes),
        changes: Array.isArray(item.changes)
          ? item.changes.slice(0, MAX_CHANGES).map((change) => text(change, 200))
          : [],
        freeformNotes: text(item.freeformNotes),
        priceAed: String(priced[index].price),
        hasReferenceImage: Boolean(item.previewImage),
      })),
    ),
  );

  return orderRow.id as string;
}

// Receives checkout data from CheckoutForm. Two modes:
//
// - Full pipeline (DB + Stripe both configured): persists a pending_payment
//   order, creates a Stripe Checkout Session against it, and returns
//   { checkoutUrl } for the client to redirect to. Nothing is emailed here
//   -- /api/webhooks/stripe does that once Stripe actually confirms payment,
//   which is the only trustworthy signal that money moved.
// - Fallback (Stripe not configured yet): persists to DB if available,
//   emails orders@shaklek.com immediately, returns { emailed }.
//
// SECURITY: the request body is untrusted. `items[].price` and `total` are
// read only to be compared against the server's own figures -- see
// src/lib/pricing.ts. They never reach Stripe or the database.
export async function POST(req: NextRequest) {
  // Each accepted request creates a live Stripe session and can send email.
  // 10 per 10 minutes is far above any real customer's checkout rate.
  const limited = rateLimit(req, "orders", 10, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many checkout attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  // Guest checkout is deliberately unauthenticated, but it should still only
  // be callable from our own pages -- this endpoint creates live Stripe
  // sessions and, on the fallback path, sends mail to a caller-supplied
  // address.
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;

  // The fallback path base64s an uploaded reference photo into an email
  // attachment, so the body is not trivially small -- but it is not
  // megabytes either.
  const oversized = rejectOversizedBody(req, 6_000_000);
  if (oversized) return oversized;

  let order: unknown;
  try {
    order = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request" }, { status: 400 });
  }

  const { items, method, total, email, promotionCode } = (order ?? {}) as {
    items: OrderItem[];
    method: string;
    total: number;
    email: string;
    promotionCode?: unknown;
  };

  // Only ever a code *string* from the client. It is looked up against
  // Stripe below and the discount comes from there -- a caller cannot assert
  // a discount, a percentage, or an amount. Same rule as price and quantity.
  const requestedCode =
    typeof promotionCode === "string" && promotionCode.trim().length > 0
      ? promotionCode.trim().slice(0, 64)
      : null;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "No items in order" }, { status: 400 });
  }
  if (items.length > MAX_ITEMS) {
    return NextResponse.json({ ok: false, error: "Too many items in order" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, error: "A valid email is required" }, { status: 400 });
  }

  const pricing = resolveOrderPricing(items);
  if (!pricing.ok) {
    return NextResponse.json({ ok: false, error: pricing.error }, { status: 400 });
  }
  const { priced, total: serverTotal } = pricing;

  // Checked against the server-resolved quantities, never the request's.
  const units = priced.reduce((sum, item) => sum + item.quantity, 0);
  if (units > MAX_UNITS) {
    return NextResponse.json(
      { ok: false, error: `Orders are limited to ${MAX_UNITS} garments. Please split this into two orders.` },
      { status: 400 },
    );
  }

  // The client's total is advisory only. A mismatch means the cart and the
  // catalog disagree (a stale tab after a price change, or tampering), and
  // either way the customer should re-read the price before paying rather
  // than be silently charged a different number than the one on screen.
  if (typeof total === "number" && Math.abs(total - serverTotal) > 0.01) {
    console.warn(`[orders] total mismatch: client sent ${total}, catalog says ${serverTotal}`);
    return NextResponse.json(
      { ok: false, error: "Prices have changed since this cart was created. Please refresh." },
      { status: 409 },
    );
  }

  const paymentMethod = text(method, 40) || "unknown";

  let orderId: string | null = null;
  try {
    orderId = await persistOrder(items, priced, paymentMethod, serverTotal, email);
  } catch (err) {
    console.error("[orders] Failed to persist order to DB:", err);
  }

  const stripe = getStripe();

  // ⚠️ IF STRIPE IS CONFIGURED, A NULL orderId IS A HARD FAILURE. IT MUST NOT
  // FALL THROUGH.
  //
  // Everything below `if (orderId && stripe)` is the PRE-STRIPE demo flow: it
  // emails a confirmation and returns ok:true without ever creating a Checkout
  // Session. That was correct while there was no Stripe account (see
  // src/lib/stripe.ts). There has been one since 2026-08-22.
  //
  // So from that date, any failure that nulls `orderId` -- the catch above
  // swallows it -- silently turned a checkout into a FREE CONFIRMED ORDER. The
  // customer is told "order confirmed", is never asked for a card, is emailed a
  // confirmation, and the row sits at `pending_payment` with no line items and
  // no session. Nothing surfaces it: no error to the customer, no 5xx, and
  // nothing on the dashboard distinguishing it from an abandoned checkout.
  //
  // FOUND ON STAGING, 2026-08-30, on its first real checkout. The trigger was
  // a missing `order_items.fit_notes` column on the dev database, which made
  // the line-item insert throw. The missing column was a staging accident; the
  // fallback is a production defect, and the same code path runs against live
  // cards. Any transient database error does the same thing.
  //
  // Deliberately gated on `stripe` rather than made unconditional: with no
  // Stripe key -- a local checkout of this repo with no secrets -- the demo
  // flow is still the intended behaviour and still works.
  if (stripe && !orderId) {
    console.error("[orders] order could not be persisted while Stripe is configured — refusing to confirm");
    return NextResponse.json(
      {
        ok: false,
        error: "We could not start your order. You have not been charged. Please try again.",
      },
      { status: 500 },
    );
  }

  // Resolve the customer's code to a real Stripe promotion code id. A code
  // that has expired or been archived between the cart and here simply drops
  // out: the order is still placed, at full price, which is the honest
  // outcome -- refusing the whole checkout over a bad code would lose a sale
  // the customer still wants to make. The total they were shown is the
  // catalog total either way; the discount only ever reduces it.
  let promotionCodeId: string | null = null;
  if (requestedCode && stripe) {
    try {
      const found = await stripe.promotionCodes.list({
        code: requestedCode.toUpperCase(),
        active: true,
        limit: 1,
      });
      promotionCodeId = found.data[0]?.id ?? null;
      if (!promotionCodeId) {
        console.warn("[orders] promotion code not active at checkout");
      }
    } catch (err) {
      console.error("[orders] promotion code lookup failed:", err);
    }
  }

  if (orderId && stripe) {
    // Don't trust the Origin header for the redirect target. An attacker
    // controls it, and it becomes the URL Stripe sends the customer to after
    // paying -- carrying the order id and its access token to whatever host
    // was named. Only echo it back when it is one of ours; otherwise pin to
    // the canonical site.
    const origin = canonicalOrigin(req.headers.get("origin"));
    const accessToken = issueOrderAccessToken(orderId);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      integration_identifier: "shaklek-checkout-rqkazmjg",
      customer_email: email,
      client_reference_id: orderId,
      // Shaklek prices in AED and settles in AED. Adaptive Pricing lets Stripe
      // present a converted local price instead, at a 2-4% conversion fee paid
      // by the customer -- so a garment listed at AED 429 can be shown as some
      // other number in some other currency, and the price on the site stops
      // being the price at the till.
      //
      // This is set here rather than left to the Dashboard toggle on purpose.
      // The API default IS the Dashboard setting, which means the currency a
      // customer is charged in would otherwise depend on a checkbox that leaves
      // no trace in git, differs per account, and nobody reviews -- exactly the
      // failure mode CLAUDE.md records for credential state.
      //
      // What was actually verified, 2026-08-24: the SANDBOX
      // (acct_1U4N3HFDCtKouREX) already had it OFF. A standing note in
      // planning/session-log.md claimed it was ON there; that note was stale.
      // The check is sound -- a session created without the flag came back
      // `enabled: false`, and the field is responsive, since asking for
      // `enabled: true` returns true.
      //
      // LIVE was NOT verified. Reading it means creating a Checkout Session
      // against production, which CLAUDE.md forbids. Pinning the value here is
      // what makes that acceptable: the line decides the presentment currency
      // regardless of what either Dashboard says, so neither setting has to be
      // trusted or checked again.
      adaptive_pricing: { enabled: false },
      // Nothing was collecting a delivery address -- orders were being paid
      // for with no idea where the garment should go. Stripe collects and
      // validates it on the hosted page; the webhook persists it.
      shipping_address_collection: { allowed_countries: ["AE"] },
      phone_number_collection: { enabled: true },
      // The discount code is entered on OUR checkout page and nowhere else.
      // Asking for it again on Stripe's page meant the same code was requested
      // twice, two screens apart, and a customer could not tell which one
      // counted. Founder decision 2026-08-24: our field stays, Stripe's is
      // hidden.
      //
      // Stripe rejects a session that sets both `discounts` and
      // `allow_promotion_codes`, so this is an either/or by necessity as well
      // as by choice. With no code applied we send neither, which leaves
      // Stripe's field hidden rather than empty.
      //
      // Nothing about the discount is decided here: the amount actually
      // collected comes back on the signed webhook payload (see
      // api/webhooks/stripe). The order row is written with the catalog total,
      // because no discount exists yet at this point; the webhook corrects it
      // to what Stripe charged.
      ...(promotionCodeId ? { discounts: [{ promotion_code: promotionCodeId }] } : {}),
      line_items: priced.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "aed",
          unit_amount: Math.round(item.price * 100),
          product_data: { name: item.name },
        },
      })),
      success_url: `${origin}/order-confirmed?order_id=${orderId}&t=${accessToken}`,
      cancel_url: `${origin}/checkout`,
    });

    const db = getDb();
    if (db) {
      await db
        .update(schema.orders)
        .set({ stripeSessionId: session.id })
        .where(eq(schema.orders.id, orderId));
    }

    if (!session.url) {
      return NextResponse.json({ ok: false, error: "Stripe session had no URL" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, checkoutUrl: session.url });
  }

  const emailItems = items.map((item, index) => ({
    ...item,
    name: priced[index].name,
    price: priced[index].price,
    quantity: priced[index].quantity,
  }));
  const { emailed } = await sendOrderNotificationEmail(
    emailItems,
    paymentMethod,
    serverTotal,
    email,
  );
  await sendCustomerConfirmationEmail(emailItems, serverTotal, email, orderId ?? undefined);
  return NextResponse.json({ ok: true, emailed });
}
