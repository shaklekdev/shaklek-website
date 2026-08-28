import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
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
 * 2. IT WRITES ONLY FOR A CUSTOMER WHO HAS ACTUALLY PAID FOR SOMETHING. The
 *    insert selects from her own paid orders, so an address with no paid order
 *    inserts nothing at all -- the endpoint cannot be used to seed the database
 *    with junk, and it cannot create a customer.
 *
 * 3. THE WORST CASE IS BOUNDED AND VISIBLE. Someone who knows a customer's
 *    email can ADD a false entry. They cannot read anything back -- the
 *    response says nothing -- and since 2026-08-28 they cannot destroy a real
 *    one either, because nothing here overwrites. The damage surfaces on a
 *    tech pack a human reads before cutting cloth, and on her own account page
 *    where she can see and delete it. Weighed against a login wall that collects
 *    nothing, that is the right trade. If it is ever abused, the fix is a
 *    signed per-order link printed as variable data on the tag, not a password.
 *
 * Rate limited hard, because unlike the waitlist there is no reason on earth
 * for one person to send this more than a few times.
 *
 * ⚠️ CASE-INSENSITIVE ON THE EMAIL, and it has to be. /api/orders stores a
 * guest's address EXACTLY AS TYPED -- nothing on that path lowercases it -- so
 * a customer who typed "Nada@Gmail.com" at checkout has a mixed-case row. This
 * route lowercases what she types here, and a case-sensitive match would then
 * find nothing, insert nothing, and answer ok. Her feedback would vanish with
 * no signal to her, to staff, or to any log, precisely because the response is
 * identical for every outcome. Found by a security review.
 *
 * ⚠️ ACCEPTED RESIDUAL, stated rather than implied: one statement is constant
 * in SHAPE but not in TIME -- a matching customer causes a row insert, a
 * stranger does not, and a patient attacker averaging many samples could still
 * distinguish the two. That is far weaker than the 1-vs-3 round-trip oracle
 * this replaced, and every probe costs rate-limit budget. Closing it properly
 * means signed per-order links, which is the fix defence 3 already names.
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
    // ⚠️ ONE STATEMENT, ALWAYS, WHATEVER THE OUTCOME -- and an INSERT, never an
    // UPDATE. Two separate rules meet in this query, both learned the hard way.
    //
    // APPEND ONLY. This was an UPDATE of three columns on `customers`, which
    // meant a second submission destroyed the first. Founder: "i don't want
    // anything to be overwritten, i don't want to lose any data." A row per
    // submission, forever.
    //
    // CONSTANT WORK. A security review found a customer-list oracle rebuilt out
    // of LATENCY: the old code did one round trip for an unknown email, two for
    // a customer with no paid order, three for a real customer. The bodies were
    // byte-identical and the timings were not, so the route still answered
    // "does this woman shop here". This is one statement that inserts either
    // one row or none, doing the same work either way.
    //
    // The join picks the order for us -- the founder's own rule, and the only
    // safe one: /fit has no sign-in, so it must never show a visitor a list of
    // orders for a typed email. Her most recent PAID order is the parcel she is
    // holding while she scans the card.
    await db.execute(sql`
      insert into fit_feedback (customer_id, order_id, answers, note)
      select o.customer_id, o.id, ${JSON.stringify(answers)}, ${note}
      from orders o
      join customers c on c.id = o.customer_id
      where lower(c.email) = ${email}
        and o.status = 'paid'
        -- ⚠️ A CEILING ON AN APPEND-ONLY TABLE WITH AN UNAUTHENTICATED WRITE.
        -- Nothing here overwrites, by the founder's instruction, so without a
        -- cap someone who knows a paying customer's address can add rows until
        -- her account page is too large to render -- and her orders and
        -- measurements live on that same page. The limiter alone does not stop
        -- it: it is per-IP and per-container in memory (see rateLimit.ts), so
        -- rotating addresses raises the ceiling. This keeps the statement
        -- single and constant-shaped.
        and (select count(*) from fit_feedback f where f.customer_id = o.customer_id) < 100
      order by o.created_at desc
      limit 1
    `);
  } catch (err) {
    // ⚠️ NO REQUEST BODY IN THIS LOG. It carries an email address and a
    // sentence about someone's body, and CloudWatch outlives the order.
    console.error("fit-feedback: write failed", err instanceof Error ? err.message : "unknown");
  }

  return NextResponse.json(SAME_ANSWER_FOR_EVERYONE);
}
