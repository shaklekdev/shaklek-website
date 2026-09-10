import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { rejectCrossOrigin, rejectOversizedBody, isUuid } from "@/lib/requestGuards";

/**
 * Spend, or give back, ONE GARMENT'S fit guarantee.
 *
 * The promise is printed on the thank-you card and cannot be recalled: "one
 * free alteration or remake within 14 days of delivery". Two columns make it
 * computable -- orders.delivered_at starts the clock, and this sets the other
 * one. Until something wrote it, "one" was unenforceable and the columns were
 * inert.
 *
 * ⚠️ THE FIT GUARANTEE ONLY. /shipping is explicit that a faulty or wrong-item
 * remake "is separate from the fit guarantee and does not use it up". If a
 * garment arrives damaged, or is not what she ordered, remake it and DO NOT
 * call this route -- she still has her fit remake.
 *
 * ⚠️ PER GARMENT, NOT PER ORDER. /legal/terms files the promise under "If the
 * fit isn't right" and /shipping opens it "Try it on promptly", so a customer
 * whose shirt and trousers both fit badly gets both fixed. Quantity expands to
 * one order_items row per garment, so two of the same shirt carry one each.
 *
 * The remedy itself is not a flow and should not become one. She agrees it on
 * WhatsApp, where a photo is free and is the best abuse filter available; this
 * only records the outcome.
 */
const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;

  // CLAUDE.md's rule is "EVERY write route", and both staff routes were missing
  // it. Low risk here -- the body is only read after the origin check and the
  // STAFF_EMAILS check, so an unauthenticated caller is turned away before a
  // byte is buffered -- but a rule with two quiet exceptions stops being a rule.
  const oversized = rejectOversizedBody(req, 1024);
  if (oversized) return oversized;

  const email = await getVerifiedEmailLower();
  if (!email || !STAFF_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let used: unknown;
  try {
    ({ used } = await req.json());
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }
  // ⚠️ BOTH DIRECTIONS, DELIBERATELY. Marking it used is the normal case, but a
  // mis-click TAKES A PROMISE AWAY FROM A CUSTOMER, and a record with no undo
  // would make that permanent and invisible. Clearing restores what she is
  // owed, which is the safe direction to allow.
  if (typeof used !== "boolean") {
    return NextResponse.json({ error: "Expected { used: boolean }" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { id, itemId } = await params;
  // An id that isn't a uuid makes Postgres throw a cast error, which surfaces
  // as a 500. Reject the shape first.
  if (!isUuid(id) || !isUuid(itemId)) {
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  // ⚠️ THE ORDER ID IS PART OF THE WHERE, NOT DECORATION. Matching on the item
  // alone would let a correct-looking request spend the guarantee on a garment
  // belonging to a different order.
  //
  // coalesce on the way in, so re-clicking Used does not move the date to the
  // second click -- the first time it was spent is the true one.
  // ⚠️ AND THE ORDER MUST ACTUALLY HAVE BEEN DELIVERED. The guarantee runs from
  // delivery, so there is nothing to spend before it. This stops a mis-click
  // taking a promise away from a customer whose parcel has not arrived.
  //
  // Clearing is NOT gated -- giving a guarantee back must always be possible,
  // including on an order whose status was later corrected.
  const delivered = sql`exists (
    select 1 from orders o
    where o.id = ${schema.orderItems.orderId} and o.delivered_at is not null
  )`;

  const [updated] = await db
    .update(schema.orderItems)
    .set({
      fitRemakeUsedAt: used
        ? sql`coalesce(${schema.orderItems.fitRemakeUsedAt}, now())`
        : null,
    })
    .where(
      used
        ? and(eq(schema.orderItems.id, itemId), eq(schema.orderItems.orderId, id), delivered)
        : and(eq(schema.orderItems.id, itemId), eq(schema.orderItems.orderId, id)),
    )
    .returning({
      id: schema.orderItems.id,
      fitRemakeUsedAt: schema.orderItems.fitRemakeUsedAt,
    });

  if (!updated) {
    // Error path only. Distinguish "no such garment" from "not delivered yet",
    // because the second one is a workflow step she can take.
    const [exists] = await db
      .select({ deliveredAt: schema.orders.deliveredAt })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orders.id, schema.orderItems.orderId))
      .where(and(eq(schema.orderItems.id, itemId), eq(schema.orderItems.orderId, id)));
    if (exists && !exists.deliveredAt) {
      return NextResponse.json(
        { error: "Mark the order delivered first — the 14 days run from delivery" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, fitRemakeUsedAt: updated.fitRemakeUsedAt });
}
