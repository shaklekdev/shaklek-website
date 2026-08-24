import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { isUuid } from "@/lib/requestGuards";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { buildPdf } from "@/lib/techPack";

const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const email = await getVerifiedEmailLower();
  if (!email || !STAFF_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { id } = await params;
  // A non-uuid id makes Postgres throw a cast error, surfacing as a 500.
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.orders.id, id));

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id));

  const pdf = await buildPdf({
    id: row.orders.id,
    createdAt: row.orders.createdAt,
    items,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="shaklek-techpack-${id.slice(0, 8)}.pdf"`,
    },
  });
}
