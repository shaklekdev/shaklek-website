import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";

// Waitlist signups. TWO sources as of 2026-09-12: Shaklek+ early access, and
// the pre-launch page (source "coming-soon").
//
// WHERE AN ADDRESS GOES. Two places, on purpose:
//   1. a Resend SEGMENT -- the durable list. Stores, deduplicates, and can be
//      sent a broadcast at launch without anyone reading an inbox.
//   2. an email to hello@shaklek.com, reply-to the signer, so she sees it live
//      and so there is still a copy if (1) fails.
//
// ✅ (1) ADDED 2026-09-12. Founder: "I don't want anything manual." Until then
// the inbox WAS the list, which was fine at a handful and would have meant
// finding two hundred addresses by hand the day the page got traffic.
//
// Still no database table, and still for the same reason: there is no migrate
// step in the Amplify build (see src/lib/envGuard.ts), so a schema change and
// the code needing it cannot ship together. A hosted list needs no migration.
//
// Public and unauthenticated by design, so it carries the same guards as the
// other public write routes: origin check, body cap, rate limit, and a real
// email format check.
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;

function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;

  const oversized = rejectOversizedBody(req, 8_000);
  if (oversized) return oversized;

  const limited = rateLimit(req, "waitlist", MAX_PER_WINDOW, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) ?? {};
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request" }, { status: 400 });
  }

  if (!isEmail(body.email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  const email = body.email;
  const source = boundedText(body.source, 40) ?? "unknown";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Don't log the address itself -- see the PII note in src/lib/orderEmail.ts.
    console.error("[waitlist] RESEND_API_KEY not set — signup NOT recorded.");
    return NextResponse.json(
      { ok: false, error: "We couldn't record that right now. Please try again later." },
      { status: 503 },
    );
  }

  // ---------------------------------------------------------------------
  // 1. THE LIST. This is the part that makes launch day not manual.
  //
  // ⚠️ SEGMENTS, NOT AUDIENCES. Resend's own docs say "Audiences are
  // deprecated in favor of Segments. These endpoints still work, but will be
  // removed in the future" -- checked 2026-09-12 before writing this, because
  // every half-remembered example still uses POST /audiences/:id/contacts. The
  // current call is POST /contacts with a `segments` array.
  //
  // ⚠️ THE POLARITY HERE IS THE OPPOSITE OF STORE_OPEN's, deliberately. A
  // missing RESEND_SEGMENT_ID must NOT stop a signup. Failing closed on the
  // switch that decides whether money can move is right; failing closed on the
  // one that decides whether a stranger can leave an email just loses her. So
  // this degrades to the inbox and shouts in the log.
  //
  // ⚠️ RESEND_SEGMENT_ID NEEDS THE BUILD SPEC, NOT JUST THE CONSOLE.
  //   aws amplify get-app --app-id dqcptedylrif0 --query 'app.buildSpec'
  // carries an explicit `env | grep -e ... >> .env.production` allowlist. Add
  // `-e RESEND_SEGMENT_ID`, set it in the console, then REDEPLOY -- the spec is
  // read at build time. Until all three are done this logs "not set" on every
  // signup and the list stays empty while the console shows the variable.
  const segmentId = process.env.RESEND_SEGMENT_ID;
  let stored = false;
  if (!segmentId) {
    console.error("[waitlist] RESEND_SEGMENT_ID not set — signup is inbox-only, no list.");
  } else {
    try {
      const contact = await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, unsubscribed: false, segments: [segmentId] }),
      });
      if (contact.ok) {
        stored = true;
      } else {
        const detail = await contact.text();
        // A repeat signup is a SUCCESS, not an error: somebody typing the same
        // address twice must not see a failure, and a list is deduplicated by
        // definition. Resend's docs do not state the duplicate behaviour, so
        // this reads the response rather than assuming a status code.
        if (/exists|duplicate|already/i.test(detail)) {
          stored = true;
        } else {
          // Never the address itself -- CloudWatch outlives the signup.
          console.error("[waitlist] contact create failed:", contact.status, detail.slice(0, 300));
        }
      }
    } catch (err) {
      console.error("[waitlist] contact create threw:", err);
    }
  }

  // ---------------------------------------------------------------------
  // 2. THE PING. Kept now the list exists: it is how she sees a signup the
  // moment it happens, and it is the only copy if step 1 failed.
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Shaklek <orders@shaklek.com>",
      to: "hello@shaklek.com",
      reply_to: email,
      // The subject carries the SOURCE, because this route now serves two
      // different things: Shaklek+ early access, and the pre-launch page's
      // "tell me when you open". They need different replies and will be read
      // months apart, so an inbox search has to be able to separate them. Every
      // signup said "Shaklek+ early access request" until 2026-09-12.
      subject:
        source === "coming-soon"
          ? "Pre-launch signup (tell me when you open)"
          : `Waitlist signup (${source})`,
      text: `${email}\nSource: ${source}\nReceived: ${new Date().toISOString()}`,
    }),
  });

  if (!res.ok) {
    console.error("[waitlist] notification email failed:", (await res.text()).slice(0, 300));
  }

  // Honest only if at least one of the two actually worked. Saying "thank you"
  // when nothing recorded her address is the exact failure this route exists
  // to avoid.
  if (!stored && !res.ok) {
    return NextResponse.json(
      { ok: false, error: "We couldn't record that right now. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
