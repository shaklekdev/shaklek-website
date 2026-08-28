import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmail } from "@/lib/authEmail";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";
import { parseMeasurements } from "@/lib/measurements";

// Verified primary address only -- see src/lib/authEmail.ts. These rows are
// matched to a customer by email, so an unverified address must never
// authorize a read or a write.
const getEmail = getVerifiedEmail;

export async function GET() {
  const email = await getEmail();
  if (!email) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: true, measurements: null });

  const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.email, email));
  if (!customer) return NextResponse.json({ ok: true, measurements: null });

  return NextResponse.json({
    ok: true,
    measurements: {
      bust: customer.measurementBust ?? "",
      waist: customer.measurementWaist ?? "",
      hip: customer.measurementHip ?? "",
      height: customer.measurementHeight ?? "",
      notes: customer.measurementNotes ?? "",
    },
  });
}

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
  const oversized = rejectOversizedBody(req, 32_000);
  if (oversized) return oversized;

  const email = await getEmail();
  if (!email) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) ?? {};
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request" }, { status: 400 });
  }

  // TWO CALLERS, TWO SHAPES, AND ONLY ONE OF THEM USED TO WORK.
  //
  // /account's MeasurementsForm posts the fields individually
  // ({bust, waist, hip, height, notes}). SaveMeasurements -- the button on
  // the customizer and the size guide -- posts the FLATTENED string that a
  // cart line carries ({measurements: "Bust / chest: 90cm, Waist: 74cm, ..."}),
  // because that is the value it has in hand.
  //
  // This handler only ever read the field shape. A flattened post therefore
  // matched nothing, wrote five empty columns, and returned {ok: true} -- so
  // the button said "Saved. Next time these are filled in for you." and
  // nothing had been saved. Silent, and indistinguishable from success from
  // the customer's side.
  //
  // parseMeasurements is the inverse of the composeMeasurements that built
  // the string, and it is the same parser the tailor's tech pack uses, so
  // there is no second format to keep in step.
  const flattened =
    typeof body.measurements === "string" ? parseMeasurements(body.measurements) : undefined;
  const source: Record<string, unknown> = flattened ?? body;

  // These were stored with no length cap at all -- `notes` in particular is a
  // free-text field on an authenticated-but-public-signup endpoint.
  const values = {
    measurementBust: boundedText(source.bust, 20),
    measurementWaist: boundedText(source.waist, 20),
    measurementHip: boundedText(source.hip, 20),
    measurementHeight: boundedText(source.height, 20),
    measurementNotes: boundedText(source.notes, 1000),
  };

  // Signing up doesn't create a customers row -- only checkout does (see
  // /api/orders) -- so a customer saving measurements before their first
  // order needs one created here.
  await db
    .insert(schema.customers)
    .values({ email, ...values })
    .onConflictDoUpdate({ target: schema.customers.email, set: values });

  return NextResponse.json({ ok: true });
}

/**
 * Clear the saved measurements.
 *
 * ⚠️ THIS EXISTS BECAUSE legal/privacy ALREADY PROMISED IT. That page has told
 * customers they "can delete saved measurements from your account at any time"
 * for as long as it has existed, and until now there was no control anywhere
 * that did it -- the promise was simply untrue. A security review of the fit
 * feedback surfaced it, on the way to the same gap for the new column.
 *
 * Blanked, not deleted as a row: the customer row also carries her name, her
 * orders and her email, and dropping it would take her order history with it.
 * Nulls, not empty strings, so "she cleared this" and "she never entered it"
 * are the same state to every reader -- MeasurementsForm, the tech pack, and
 * /api/orders all already treat null as absent.
 */
export async function DELETE(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;

  const email = await getEmail();
  if (!email) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

  // Scoped to her own verified address. There is no id in this request at all,
  // so there is nothing for a customer to tamper with to reach another row.
  await db
    .update(schema.customers)
    .set({
      measurementBust: null,
      measurementWaist: null,
      measurementHip: null,
      measurementHeight: null,
      measurementNotes: null,
    })
    .where(eq(schema.customers.email, email));

  return NextResponse.json({ ok: true });
}
