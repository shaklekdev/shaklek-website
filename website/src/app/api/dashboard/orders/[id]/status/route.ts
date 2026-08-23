import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { rejectCrossOrigin } from "@/lib/requestGuards";
import { isUuid } from "@/lib/requestGuards";

// Fulfillment statuses a staff member can set by hand -- payment statuses
// (pending_payment/paid/payment_failed) stay webhook-only, see schema.ts.
const ALLOWED_STATUSES = ["paid", "in_progress", "shipped", "canceled"];

const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;

  const email = await getVerifiedEmailLower();
  if (!email || !STAFF_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let status: unknown;
  try {
    ({ status } = await req.json());
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }
  if (typeof status !== "string" || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { id } = await params;
  // An id that isn't a uuid makes Postgres throw a cast error, which surfaces
  // as a 500. Reject the shape first, and report a miss honestly rather than
  // returning ok:true for an order that doesn't exist.
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(schema.orders)
    .set({ status })
    .where(eq(schema.orders.id, id))
    .returning({ id: schema.orders.id });

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
