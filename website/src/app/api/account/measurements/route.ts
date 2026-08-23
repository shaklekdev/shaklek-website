import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmail } from "@/lib/authEmail";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";

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

  // These were stored with no length cap at all -- `notes` in particular is a
  // free-text field on an authenticated-but-public-signup endpoint.
  const values = {
    measurementBust: boundedText(body.bust, 20),
    measurementWaist: boundedText(body.waist, 20),
    measurementHip: boundedText(body.hip, 20),
    measurementHeight: boundedText(body.height, 20),
    measurementNotes: boundedText(body.notes, 1000),
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
