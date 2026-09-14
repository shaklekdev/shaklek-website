import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema";
import { rejectCrossOrigin, rejectOversizedBody, isUuid } from "@/lib/requestGuards";

/**
 * Staff write route for the tailor's measurement set.
 *
 * WHY IT EXISTS. The founder takes these at the fitting and types them in
 * herself: "whenever i go to size someone, i will fill the measurements there
 * and it needs to update the database." She called it "our MOST IMPORTANT
 * DATA", which is also why this route is written to the same bar as the money
 * routes rather than as an internal convenience.
 *
 * ⚠️ THIS IS PII AND IT IS NEVER LOGGED. Not the values, not the email, not on
 * an error path. CloudWatch outlives the order and a measurement in a log line
 * is a measurement we cannot delete. The catch blocks below return a generic
 * message on purpose; if you need to debug this, do it locally.
 */

// Same list and same comparison as dashboard/layout.tsx, deliberately
// duplicated rather than shared: the layout guards the PAGE and this guards the
// WRITE, and a single import would let one change silently widen the other.
const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// ⚠️ THE ALLOWLIST IS THE WHOLE INPUT VALIDATION. Anything not named here is
// dropped, so a caller cannot reach another column by inventing a key, and
// cannot reach `email` or `id` at all. Add a field here AND to schema.ts, never
// to just one.
const FIELDS = [
  "measurementBust",
  "measurementWaist",
  "measurementHip",
  "measurementHeight",
  "measurementStomach",
  "measurementShoulder",
  "measurementNeck",
  "measurementThigh",
  "measurementCrotch",
  "measurementShirtLength",
  "measurementSleeveLength",
  "measurementTrouserLength",
  "measurementFittingNotes",
] as const;

// A measurement is "92" or "92.5" or "92 (over the bust)". 120 is generous for
// that and mean for anything else. Notes get more room because a posture note
// is a sentence.
const CAP = 120;
const NOTES_CAP = 2000;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;

  // Sized for thirteen short fields plus a notes paragraph, with room to spare.
  const oversized = rejectOversizedBody(req, 8 * 1024);
  if (oversized) return oversized;

  const email = await getVerifiedEmailLower();
  if (!email || !STAFF_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an object" }, { status: 400 });
  }
  const input = body as Record<string, unknown>;

  const patch: Record<string, string | null | Date> = {};
  for (const field of FIELDS) {
    if (!(field in input)) continue;
    const raw = input[field];
    // null and "" both mean "clear it". She must be able to remove a number she
    // wrote down wrong, and a route that only ever sets values cannot.
    if (raw === null || raw === "") {
      patch[field] = null;
      continue;
    }
    if (typeof raw !== "string") {
      return NextResponse.json({ error: `${field} must be text` }, { status: 400 });
    }
    const value = raw.trim();
    const cap = field === "measurementFittingNotes" ? NOTES_CAP : CAP;
    if (value.length > cap) {
      return NextResponse.json({ error: `${field} is too long` }, { status: 400 });
    }
    patch[field] = value;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Stamped on any save that writes at least one BODY measurement, which is
  // what the list uses to tell "measured" from "not measured yet". A save that
  // only touches the fitting notes does not count as having measured someone.
  // ⚠️ CLEARING A FIELD IS NOT MEASURING SOMEBODY. This counted any touched
  // key, so PATCH {"measurementWaist": ""} on an unmeasured customer stamped
  // measured_at and the list then showed her as done, hiding her from the only
  // question that list answers. Only a field that ends up with a VALUE counts.
  const wroteABodyValue = Object.entries(patch).some(
    ([k, v]) => k !== "measurementFittingNotes" && typeof v === "string" && v.length > 0,
  );
  if (wroteABodyValue) patch.measuredAt = new Date();

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { id } = await params;
  // A non-uuid makes Postgres throw a cast error that surfaces as a 500.
  // Reject the shape before it reaches a query.
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const updated = await db
      .update(customers)
      .set(patch)
      .where(eq(customers.id, id))
      .returning({ id: customers.id, measuredAt: customers.measuredAt });

    if (updated.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Returns only what the page needs to re-render its "measured" state. No
    // measurement values travel back in the response.
    return NextResponse.json({ ok: true, measuredAt: updated[0].measuredAt });
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
