import { NextRequest, NextResponse } from "next/server";
import { and, eq, exists, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { rateLimit } from "@/lib/rateLimit";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";
import { FIT_NOTE_MAX, resolveFitFeedback } from "@/data/fitFeedback";

/**
 * Post-delivery fit feedback, reached by the QR on the thank-you card.
 *
 * ⚠️ THIS IS THE SITE'S ONLY UNAUTHENTICATED WRITE TO A CUSTOMER RECORD, and
 * every unusual thing below is there because of that. It cannot require a
 * sign-in: the whole point is a woman standing in her bedroom with a garment
 * in one hand and a phone in the other, and a login wall there means no
 * feedback at all. So it is keyed by an email address that nobody has proved
 * they own, which forces three defences.
 *
 * 1. IT CANNOT ANSWER "IS THIS ONE OF YOUR CUSTOMERS?". Every request gets the
 *    same body and the same status, whether the email is a paying customer, a
 *    stranger, or nonsense. A route that 404s on an unknown email is a
 *    customer-list oracle: feed it addresses and it tells you which ones shop
 *    here. That matters more than usual for a small brand in a small city.
 *    ⚠️ Do not add a helpful "we could not find your order" message here.
 *
 * 2. IT WRITES ONLY TO A CUSTOMER WHO HAS ACTUALLY PAID FOR SOMETHING. No row
 *    is created and nothing is stored for an address with no paid order, so
 *    the endpoint cannot be used to seed the customers table with junk.
 *
 * 3. THE WORST CASE IS BOUNDED AND VISIBLE. Someone who knows a customer's
 *    email can overwrite her fit notes. They cannot read them back -- the
 *    response says nothing -- and the damage surfaces on a tech pack a human
 *    reads before cutting cloth. Weighed against a login wall that collects
 *    nothing, that is the right trade. If it is ever abused, the fix is a
 *    signed per-order link printed as variable data on the tag, not a password.
 *
 * Rate limited hard, because unlike the waitlist there is no reason on earth
 * for one person to send this more than a few times.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;

// Deliberately identical for every outcome. See defence 1 above.
const SAME_ANSWER_FOR_EVERYONE = { ok: true } as const;

/**
 * Strip control and bidirectional-override characters from the free-text note.
 *
 * NOT an injection defence -- pdfkit renders this as literal text and a review
 * confirmed nothing here can break the document's structure. It is a SPOOFING
 * defence. U+202E reverses everything after it, so "cut 5cm \u202Eshorter\u202C
 * please" can be made to read as its own opposite on the tailor's document,
 * which is a made-to-order instruction that says one thing and prints another.
 *
 * Newlines go too: the note is set as a single quoted sentence in a fixed
 * block, and a note of forty blank lines pushes the rest of the page around.
 *
 * Kept here rather than in boundedText() on purpose -- boundedText guards every
 * write route on the site, and widening it is a change to checkout.
 */
function sanitise(value: string | null): string | null {
  if (!value) return null;
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  const cross = rejectCrossOrigin(req);
  if (cross) return cross;
  const oversized = rejectOversizedBody(req, 4 * 1024);
  if (oversized) return oversized;

  const limited = rateLimit(req, "fit-feedback", MAX_PER_WINDOW, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(SAME_ANSWER_FOR_EVERYONE);
  }
  const payload = (body ?? {}) as Record<string, unknown>;

  const email = boundedText(payload.email, 254)?.trim().toLowerCase();
  // Shape check only. Anything stricter rejects real addresses, and this is
  // not the place that decides whether an address is deliverable.
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(SAME_ANSWER_FOR_EVERYONE);
  }

  const answers = resolveFitFeedback(payload.answers);
  const note = sanitise(boundedText(payload.note, FIT_NOTE_MAX)) || null;
  // Nothing to record. Still answered identically.
  if (Object.keys(answers).length === 0 && !note) {
    return NextResponse.json(SAME_ANSWER_FOR_EVERYONE);
  }

  const db = getDb();
  if (!db) return NextResponse.json(SAME_ANSWER_FOR_EVERYONE);

  try {
    // ⚠️ ONE STATEMENT, ALWAYS, WHATEVER THE OUTCOME. This was a SELECT for the
    // customer, then a SELECT for a paid order, then an UPDATE -- and a
    // security review found the oracle that defence 1 above says cannot exist,
    // rebuilt out of LATENCY. An unknown email did one round trip to Neon, a
    // customer without a paid order did two, a real customer did three. The
    // bodies were byte-identical and the response time was not, so timing the
    // route still answered "does this woman shop here".
    //
    // Now every well-formed request executes exactly this one UPDATE. It
    // matches nothing for a stranger and nothing for someone who never paid,
    // and the work done is the same either way. Do not "optimise" this back
    // into a lookup followed by a conditional write.
    await db
      .update(schema.customers)
      .set({
        fitFeedback: JSON.stringify(answers),
        fitFeedbackNote: note,
        fitFeedbackAt: new Date(),
      })
      .where(
        and(
          eq(schema.customers.email, email),
          // A paid order, not merely a customers row: a row exists the moment
          // someone opens a checkout they never complete.
          exists(
            db
              .select({ one: sql`1` })
              .from(schema.orders)
              .where(
                and(
                  eq(schema.orders.customerId, schema.customers.id),
                  eq(schema.orders.status, "paid"),
                ),
              ),
          ),
        ),
      );
  } catch (err) {
    // ⚠️ NO REQUEST BODY IN THIS LOG. It carries an email address and a
    // sentence about someone's body, and CloudWatch outlives the order.
    console.error("fit-feedback: write failed", err instanceof Error ? err.message : "unknown");
  }

  return NextResponse.json(SAME_ANSWER_FOR_EVERYONE);
}
