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
  // The comparison is against createdAt rather than a delivery date because no
  // fulfilment timestamp exists yet (see the status comment in schema.ts). It
  // errs conservative: feedback about an older piece that happens to arrive
  // after this order was placed is dropped rather than risked.
  //
  // The most recent qualifying entry only. The table keeps every submission,
  // and a tailor cutting one garment needs the latest read on this body, not a
  // year of them -- the full history is on her account page and in the table.
  const [previous] = await db
    .select()
    .from(schema.fitFeedback)
    .where(
      and(
        eq(schema.fitFeedback.customerId, row.customers.id),
        lt(schema.fitFeedback.createdAt, row.orders.createdAt),
      ),
    )
    .orderBy(desc(schema.fitFeedback.createdAt))
    .limit(1);

  let pastFit = null;
  if (previous) {
    try {
      const parsed: unknown = JSON.parse(previous.answers);
      // SHAPE, not just syntax. JSON.parse("null") succeeds and returns null,
      // sails through this catch, and then throws inside buildPdf when the
      // print block reads a property off it -- so the guard added to keep a bad
      // row from taking down a tech pack did not stop the one value that takes
      // down a tech pack. Found by a security review.
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("unexpected shape");
      }
      pastFit = {
        answers: parsed as Record<string, string>,
        note: previous.note,
        at: previous.createdAt,
      };
    } catch {
      // A bad row must not take down the document the tailor cuts from.
      pastFit = null;
    }
  }

  const pdf = await buildPdf({
    id: row.orders.id,
    createdAt: row.orders.createdAt,
    items,
    pastFit,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="techpack-${id.slice(0, 8)}.pdf"`,
    },
  });
}
