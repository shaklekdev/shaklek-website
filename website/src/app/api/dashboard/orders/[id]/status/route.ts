import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";
import { isUuid } from "@/lib/requestGuards";

// Fulfillment statuses a staff member can set by hand -- payment statuses
// (pending_payment/paid/payment_failed) stay webhook-only, see schema.ts.
//
// "delivered" is the founder's own step: the courier collects from her and
// hands to the customer, so she is the only system that knows it happened.
// It is not cosmetic -- it is what starts the 14-day clock on the alteration
// promise printed on the thank-you card.
const ALLOWED_STATUSES = ["paid", "in_progress", "shipped", "delivered", "canceled"];

// The only statuses a parcel can be delivered FROM. Excludes pending_payment,
// payment_failed and canceled -- see the guard below.
const DELIVERABLE_FROM = ["paid", "in_progress", "shipped", "delivered"];

const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // ⚠️ THE DATE IS WRITTEN HERE, AND ONLY EVER ONCE.
  //
  // `status` is a single overwritable field: delivered today, canceled
  // tomorrow, and the delivery date is gone -- along with the only evidence of
  // when a promise printed on an uncorrectable card started running. So the
  // transition into `delivered` stamps a column of its own.
  //
  // coalesce, not now(), because clicking Delivered twice must not move the
  // deadline. The first mark wins; a genuine mis-click is rare enough to be
  // corrected in the database by hand, and that is the safer failure -- the
  // alternative silently hands back days a customer was not owed, or takes
  // away days she was.
  // ⚠️ A PARCEL CANNOT ARRIVE BEFORE IT IS PAID FOR. Without this, one mis-click
  // stamps delivered_at on a pending_payment or canceled order, starts a 14-day
  // alteration clock, and shows a remake control for a garment nobody bought.
  // Only this transition is gated: the rest of the line is staff judgement,
  // but "delivered" is the one that creates an obligation.
  const guarded =
    status === "delivered"
      ? and(eq(schema.orders.id, id), inArray(schema.orders.status, DELIVERABLE_FROM))
      : eq(schema.orders.id, id);

  const [updated] = await db
    .update(schema.orders)
    .set(
      status === "delivered"
        ? { status, deliveredAt: sql`coalesce(${schema.orders.deliveredAt}, now())` }
        : { status },
    )
    .where(guarded)
    .returning({ id: schema.orders.id, deliveredAt: schema.orders.deliveredAt });

  if (!updated) {
    // Only reached on the error path, so the extra round trip costs nothing in
    // the normal case -- and "not found" for an order that plainly exists is
    // the kind of wrong message that sends someone hunting the wrong problem.
    const [exists] = await db
      .select({ status: schema.orders.status })
      .from(schema.orders)
      .where(eq(schema.orders.id, id));
    if (exists) {
      return NextResponse.json(
        { error: `Cannot mark delivered from "${exists.status}"` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
