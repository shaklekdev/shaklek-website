import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { verifyOrderAccessToken } from "@/lib/orderAccess";

// Used by /order-confirmed to render a real order once Stripe redirects back.
//
// AUTHORIZATION: this route returns a customer's email, measurements and
// order contents, so an order id on its own is not enough to read it. The
// caller must present either
//   - the signed access token minted at checkout (?t=...), which is what the
//     Stripe success_url carries -- this covers guest checkouts, or
//   - a Clerk session whose email owns the order.
// Anything else gets the same 404 as a nonexistent order, so the endpoint
// cannot be used to test whether a given order id exists.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const db = getDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 501 });
  }

  // uuid() would throw a Postgres cast error on a non-uuid id, which is both
  // a 500 and an existence oracle. Reject the shape first.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  const notFound = NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });

  const [order] = await db
    .select()
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.orders.id, id));

  if (!order) return notFound;

  const hasToken = verifyOrderAccessToken(id, req.nextUrl.searchParams.get("t"));

  let authorized = hasToken;
  if (!authorized) {
    // ⚠️ THIS USED TO READ `currentUser().primaryEmailAddress` DIRECTLY, and it
    // was the only customer-facing route that did. Two problems, both fixed by
    // going through the helper:
    //
    // 1. It skipped the VERIFICATION check. `getVerifiedEmail` exists precisely
    //    so authorization never trusts an unverified address -- customers are
    //    keyed by email, so anyone who registers a victim's address and knows
    //    the order UUID would read her measurements and order contents. Not
    //    reachable today, because the production Clerk instance requires
    //    verification at sign-up; but that is a Dashboard toggle, and this file
    //    was the one place the code depended on it staying set.
    // 2. It compared CASE-SENSITIVELY against a key that is now always stored
    //    lowercase, so a customer whose Clerk address carries a capital would
    //    fail to match her own order.
    //
    // Both found by the security review, 2026-08-30.
    const email = await getVerifiedEmailLower();
    authorized = Boolean(email && email === order.customers.email.toLowerCase());
  }

  if (!authorized) return notFound;

  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id));

  return NextResponse.json({
    ok: true,
    order: {
      id: order.orders.id,
      status: order.orders.status,
      total: Number(order.orders.totalAed),
      email: order.customers.email,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        fabric: item.fabric,
        color: item.color,
        size: item.size,
        measurements: item.measurements,
        changes: item.changes ?? [],
        price: Number(item.priceAed),
      })),
    },
  });
}
