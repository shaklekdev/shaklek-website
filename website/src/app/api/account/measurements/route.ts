import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

async function getEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

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
  const email = await getEmail();
  if (!email) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

  const { bust, waist, hip, height, notes } = await req.json();
  const values = {
    measurementBust: bust || null,
    measurementWaist: waist || null,
    measurementHip: hip || null,
    measurementHeight: height || null,
    measurementNotes: notes || null,
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
