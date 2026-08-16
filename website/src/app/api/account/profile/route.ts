import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

async function getEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

export async function POST(req: NextRequest) {
  const email = await getEmail();
  if (!email) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

  const { name } = await req.json();
  if (!name || !String(name).trim()) {
    return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
  }

  // Same upsert pattern as /api/account/measurements -- signing up doesn't
  // create a customers row, only checkout does, so one may not exist yet.
  await db
    .insert(schema.customers)
    .values({ email, name: String(name).trim() })
    .onConflictDoUpdate({ target: schema.customers.email, set: { name: String(name).trim() } });

  return NextResponse.json({ ok: true });
}
