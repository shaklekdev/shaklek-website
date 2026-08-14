import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

// Used by /order-confirmed to render a real order once Stripe redirects
// back with ?order_id=... -- only reachable when the DB is configured,
// since that's also a requirement for the Stripe checkout path itself.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 501 });
  }

  const [order] = await db
    .select()
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.orders.id, id));

  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

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
