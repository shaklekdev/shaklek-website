import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getStripe } from "@/lib/stripe";
import {
  sendOrderNotificationEmail,
  sendCustomerConfirmationEmail,
  type NotifyOrderItem,
} from "@/lib/orderEmail";

type OrderItem = NotifyOrderItem & { category?: string };

// Persists the order to Postgres and returns the new order id. No RDS/Neon
// instance exists yet in every environment -- DATABASE_URL unset means
// getDb() returns null and the caller falls back to the pre-DB demo flow.
async function persistOrder(items: OrderItem[], method: string, total: number, email: string) {
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
    items.map((item) => ({
      orderId: orderRow.id,
      name: item.name,
      category: item.category,
      fabric: item.fabric,
      color: item.color,
      size: item.size,
      measurements: item.measurements,
      changes: item.changes ?? [],
      freeformNotes: item.freeformNotes,
      priceAed: String(item.price),
      hasReferenceImage: Boolean(item.previewImage),
    })),
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
// - Fallback (Stripe not configured yet, e.g. still waiting on the Wio
//   business account / Stripe merchant approval): behaves exactly like
//   before Stripe existed -- persists to DB if available, emails
//   orders@shaklek.com immediately, returns { emailed }.
export async function POST(req: NextRequest) {
  const order = await req.json();
  const { items, method, total, email } = order as {
    items: OrderItem[];
    method: string;
    total: number;
    email: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "No items in order" }, { status: 400 });
  }

  let orderId: string | null = null;
  try {
    orderId = await persistOrder(items, method, total, email);
  } catch (err) {
    console.error("[orders] Failed to persist order to DB:", err);
  }

  const stripe = getStripe();

  if (orderId && stripe) {
    const origin = req.headers.get("origin") ?? "https://www.shaklek.com";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      integration_identifier: "shaklek-checkout-rqkazmjg",
      customer_email: email,
      client_reference_id: orderId,
      // Nothing was collecting a delivery address -- orders were being paid
      // for with no idea where the garment should go. Stripe collects and
      // validates it on the hosted page; the webhook persists it.
      shipping_address_collection: { allowed_countries: ["AE"] },
      phone_number_collection: { enabled: true },
      line_items: items.map((item) => ({
        quantity: 1,
        price_data: {
          currency: "aed",
          unit_amount: Math.round(item.price * 100),
          product_data: { name: item.name },
        },
      })),
      success_url: `${origin}/order-confirmed?order_id=${orderId}`,
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

  const { emailed } = await sendOrderNotificationEmail(items, method, total, email);
  await sendCustomerConfirmationEmail(items, total, email);
  return NextResponse.json({ ok: true, emailed });
}
