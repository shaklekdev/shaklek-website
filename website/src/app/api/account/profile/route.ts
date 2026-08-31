import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { getDb, schema } from "@/db/client";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";

// Verified primary address only -- see src/lib/authEmail.ts. These rows are
// matched to a customer by email, so an unverified address must never
// authorize a read or a write.
// Lowercased: the customers row is keyed by the canonical address (see the
// note in /api/orders persistOrder). Looking up by the as-typed address would
// miss the row and upsert a duplicate customer.
const getEmail = getVerifiedEmailLower;

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
  const oversized = rejectOversizedBody(req, 8_000);
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

  const name = boundedText(body.name, 120);
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
  }

  // Same upsert pattern as /api/account/measurements -- signing up doesn't
  // create a customers row, only checkout does, so one may not exist yet.
  await db
    .insert(schema.customers)
    .values({ email, name })
    .onConflictDoUpdate({ target: schema.customers.email, set: { name } });

  return NextResponse.json({ ok: true });
}
