import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getStripe } from "@/lib/stripe";
import { sendOrderNotificationEmail, sendCustomerConfirmationEmail } from "@/lib/orderEmail";

// Stripe calls this once it has actually confirmed a payment -- this is the
// only trustworthy point to mark an order paid and notify the stylist,
// unlike the old flow which emailed as soon as the customer clicked Pay.
// Needs STRIPE_WEBHOOK_SECRET (from the Stripe dashboard, once this URL is
// registered as an endpoint there) to verify the request actually came
// from Stripe. Without it, this route just 501s -- Stripe can't be
// configured to call it yet anyway if the secret doesn't exist.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.log("[webhooks/stripe] Stripe not fully configured — ignoring webhook call.");
    return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  } catch (err) {
    console.error("[webhooks/stripe] Signature verification failed:", err);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.expired") {
    return NextResponse.json({ ok: true, skipped: event.type });
  }

  type StripeAddress = {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  };
  type ShippingDetails = { name?: string | null; address?: StripeAddress | null };

  const session = event.data.object as {
    client_reference_id: string | null;
    // What Stripe actually collected, in the currency's smallest unit (fils
    // for AED), AFTER any promotion code. The order row was written at
    // checkout with the catalog total, before a discount could exist -- so
    // without this a 99%-off welcome-offer order records AED 390 when 3.90
    // was collected, and every discounted order overstates revenue.
    //
    // This is the only trustworthy source for the figure: it arrives on a
    // Stripe-signed payload that constructEvent() has already verified. The
    // discount is never read from, or asserted by, the request body.
    amount_total?: number | null;
    currency?: string | null;
    // The 2026-07-29 API nests this under collected_information; older
    // versions put it at the top level. Read both so a future API version
    // bump on the account cannot silently drop the delivery address.
    collected_information?: { shipping_details?: ShippingDetails | null } | null;
    shipping_details?: ShippingDetails | null;
    customer_details?: { phone?: string | null; name?: string | null } | null;
  };
  const orderId = session.client_reference_id;

  if (!orderId) {
    console.error(`[webhooks/stripe] ${event.type} with no client_reference_id`);
    return NextResponse.json({ ok: false, error: "Missing order id" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    console.error("[webhooks/stripe] DATABASE_URL not set — cannot finalize order", orderId);
    return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });
  }

  // A session expiring (customer abandoned checkout, ~24h timeout) just means
  // the order stops sitting at pending_payment forever -- nothing was made,
  // so no stylist notification, unlike the paid path below.
  if (event.type === "checkout.session.expired") {
    // Same gate: an expiry event arriving after a successful payment (or a
    // replay of one) must not flip a paid order to failed.
    await db
      .update(schema.orders)
      .set({ status: "payment_failed" })
      .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending_payment")));
    return NextResponse.json({ ok: true });
  }

  // AED is a two-decimal currency, so amount_total is in fils. Guard the
  // currency rather than assuming: if the account ever charges a zero-decimal
  // currency (JPY has no minor unit), dividing by 100 would under-record the
  // charge by 100x. Anything unexpected leaves the total untouched and says
  // so, which is recoverable -- a silently wrong revenue figure is not.
  let chargedAed: string | null = null;
  if (typeof session.amount_total === "number") {
    const currency = (session.currency ?? "aed").toLowerCase();
    if (currency === "aed") {
      chargedAed = (session.amount_total / 100).toFixed(2);
    } else {
      console.error(
        `[webhooks/stripe] order ${orderId} settled in unexpected currency ${currency} — total left as booked`,
      );
    }
  }

  const shipping = session.collected_information?.shipping_details ?? session.shipping_details ?? null;
  const address = shipping?.address ?? null;
  if (!address?.line1) {
    // Loud, because a paid order with nowhere to send it needs a human.
    console.error(`[webhooks/stripe] order ${orderId} paid with NO shipping address`);
  }

  // Stripe delivers events AT LEAST ONCE -- it retries any non-2xx, and staff
  // can resend an event by hand from the Dashboard. This update used to be
  // unconditional, so a retry re-sent both the stylist notification and the
  // customer confirmation, and could drag an already-canceled order back to
  // "paid". Gating on the pending_payment -> paid transition makes the whole
  // handler idempotent without needing an events table: the second delivery
  // updates zero rows, returns nothing, and skips the emails.
  const [transitioned] = await db
    .update(schema.orders)
    .set({
      status: "paid",
      // Only overwrite when Stripe told us a figure. Falling back to the
      // booked total is right for a session that carries no amount_total.
      ...(chargedAed !== null ? { totalAed: chargedAed } : {}),
      shippingName: shipping?.name ?? session.customer_details?.name ?? null,
      shippingPhone: session.customer_details?.phone ?? null,
      shippingLine1: address?.line1 ?? null,
      shippingLine2: address?.line2 ?? null,
      shippingCity: address?.city ?? null,
      shippingState: address?.state ?? null,
      shippingPostalCode: address?.postal_code ?? null,
      shippingCountry: address?.country ?? null,
    })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending_payment")))
    .returning({ id: schema.orders.id });

  if (!transitioned) {
    console.log(`[webhooks/stripe] order ${orderId} already finalized — duplicate delivery ignored`);
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const [order] = await db
    .select()
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.orders.id, orderId));

  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, orderId));

  if (order) {
    const emailItems = items.map((item) => ({
      name: item.name,
      fabric: item.fabric,
      color: item.color,
      size: item.size,
      measurements: item.measurements,
      changes: item.changes,
      freeformNotes: item.freeformNotes,
      price: Number(item.priceAed),
    }));

    await sendOrderNotificationEmail(
      emailItems,
      order.orders.paymentMethod,
      Number(order.orders.totalAed),
      order.customers.email,
    );

    // Guest customers get no login space -- this email plus the sign-up
    // offer inside it is the entire "did I place this order" record they
    // have unless they create an account.
    await sendCustomerConfirmationEmail(
      emailItems,
      Number(order.orders.totalAed),
      order.customers.email,
    );
  }

  return NextResponse.json({ ok: true });
}
