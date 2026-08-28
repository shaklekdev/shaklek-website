import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getVerifiedEmail } from "@/lib/authEmail";
import { getDb, schema } from "@/db/client";
import { rejectCrossOrigin } from "@/lib/requestGuards";

/**
 * Delete the fit feedback this customer sent from /fit.
 *
 * ⚠️ NOT THE SAME ROUTE AS /api/fit-feedback, AND THE DIFFERENCE IS THE WHOLE
 * POINT. That one is unauthenticated on purpose -- it is reached by a QR on a
 * card, by someone who has not signed in and should not have to. It can only
 * ever WRITE, to a row it never reads back, and it answers every request
 * identically so it cannot be asked who our customers are.
 *
 * This one is the opposite: it requires a verified signed-in address, and it
 * only ever removes. Keeping them apart is what stops the unauthenticated
 * endpoint from growing a delete, which would let anyone who knows an email
 * erase a customer's fit history.
 *
 * There is no id in the request. The row is found from the session's own
 * verified email, so there is nothing here for a customer to change in order
 * to reach somebody else's record.
 */
export async function DELETE(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;

  const email = await getVerifiedEmail();
  if (!email) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

  // Every entry she has ever sent, not just the latest. "Delete my fit notes"
  // cannot leave four of the five behind.
  //
  // This is the ONLY delete in the system. The write path never overwrites, so
  // a customer's history can be destroyed by exactly one action: her own,
  // taken while signed in, from her own account.
  const [customer] = await db
    .select({ id: schema.customers.id })
    .from(schema.customers)
    .where(eq(schema.customers.email, email));
  if (customer) {
    await db.delete(schema.fitFeedback).where(eq(schema.fitFeedback.customerId, customer.id));
  }

  return NextResponse.json({ ok: true });
}
