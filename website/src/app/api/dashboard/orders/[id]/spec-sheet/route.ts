import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { isUuid } from "@/lib/requestGuards";
import { and, desc, eq, lt } from "drizzle-orm";
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

  // Fit feedback from /fit, carried onto the tailor's document -- this is the
  // half that makes the thank-you card's promise true.
  //
  // ⚠️ ONLY ENTRIES THAT PREDATE THIS ORDER. She opens the parcel and scans the
  // card, so the newest entry is very often ABOUT THIS ORDER. Printing that on
  // this order's own tech pack heads it "how her last piece fitted" over a
  // description of the piece on the table, which is worse than printing
  // nothing: a tailor who believes it will alter a garment to correct a fault
  // it does not have yet.
  //
  // The comparison is against this order's createdAt. orders.delivered_at now
  // exists (added 2026-09-05) and this rule deliberately does NOT use it: the
  // question here is "could this entry be about the garment on the table", and
  // anything submitted before the order was even placed certainly is not. It
  // errs conservative -- feedback about an older piece that happens to arrive
  // after this order was placed is dropped rather than risked.
  //
  // ⚠️ MATCHED BY GARMENT SINCE 2026-09-05, and that is the whole point of
  // fit_feedback.order_item_id. This used to take the single most recent entry
  // and print it on EVERY spec in the order, because the block below sits
  // inside the per-spec loop. On a two-piece parcel that put "the length was
  // shorter than I like" -- said about a shirt -- on the trousers spec, under
  // a heading telling the tailor it describes her last piece. Wrong
  // instructions to the person cutting, which is worse than printing nothing.
  //
  // So: the latest entry PER CATEGORY, plus the latest entry that names no
  // garment at all. A spec takes its own category's entry, falls back to the
  // unattributed one (everything written before this column existed), and
  // otherwise prints nothing. It must never fall back to a DIFFERENT
  // garment's entry -- that is the defect being fixed.
  //
  // 20 rows is a bound, not a page: it only has to be deep enough to find the
  // newest entry for each of four categories, and this route is staff-only so
  // the constant-work rule that governs /api/fit-feedback does not apply.
  const recent = await db
    .select({
      answers: schema.fitFeedback.answers,
      note: schema.fitFeedback.note,
      createdAt: schema.fitFeedback.createdAt,
      category: schema.orderItems.category,
    })
    .from(schema.fitFeedback)
    .leftJoin(schema.orderItems, eq(schema.fitFeedback.orderItemId, schema.orderItems.id))
    .where(
      and(
        eq(schema.fitFeedback.customerId, row.customers.id),
        lt(schema.fitFeedback.createdAt, row.orders.createdAt),
      ),
    )
    .orderBy(desc(schema.fitFeedback.createdAt))
    .limit(20);

  // SHAPE, not just syntax. JSON.parse("null") succeeds and returns null,
  // sails through a catch, and then throws inside buildPdf when the print
  // block reads a property off it -- so the guard added to keep a bad row from
  // taking down a tech pack did not stop the one value that takes down a tech
  // pack. Found by a security review. A bad row must not take down the
  // document the tailor cuts from, so it is skipped, not raised.
  function parseEntry(r: (typeof recent)[number]) {
    try {
      const parsed: unknown = JSON.parse(r.answers);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
      return {
        answers: parsed as Record<string, string>,
        note: r.note,
        at: r.createdAt,
      };
    } catch {
      return null;
    }
  }

  // Newest first, so the first entry seen for a category is the latest one.
  let pastFit = null;
  const pastFitByCategory: Record<string, NonNullable<ReturnType<typeof parseEntry>>> = {};
  for (const r of recent) {
    const entry = parseEntry(r);
    if (!entry) continue;
    if (r.category) {
      if (!pastFitByCategory[r.category]) pastFitByCategory[r.category] = entry;
    } else if (!pastFit) {
      pastFit = entry;
    }
  }

  const pdf = await buildPdf({
    id: row.orders.id,
    createdAt: row.orders.createdAt,
    items,
    pastFit,
    pastFitByCategory,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="techpack-${id.slice(0, 8)}.pdf"`,
    },
  });
}
