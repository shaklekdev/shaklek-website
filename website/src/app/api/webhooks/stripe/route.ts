import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getStripe } from "@/lib/stripe";
import { sendOrderNotificationEmail } from "@/lib/orderEmail";

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

  const session = event.data.object as { client_reference_id: string | null };
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
    await db
      .update(schema.orders)
      .set({ status: "payment_failed" })
      .where(eq(schema.orders.id, orderId));
    return NextResponse.json({ ok: true });
  }

  await db.update(schema.orders).set({ status: "paid" }).where(eq(schema.orders.id, orderId));

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
    await sendOrderNotificationEmail(
      items.map((item) => ({
        name: item.name,
        fabric: item.fabric,
        color: item.color,
        size: item.size,
        measurements: item.measurements,
        changes: item.changes,
        freeformNotes: item.freeformNotes,
        price: Number(item.priceAed),
      })),
      order.orders.paymentMethod,
      Number(order.orders.totalAed),
      order.customers.email,
    );
  }

  return NextResponse.json({ ok: true });
}
