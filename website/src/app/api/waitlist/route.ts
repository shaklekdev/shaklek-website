import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";

// Waitlist signups. TWO sources as of 2026-09-12: Shaklek+ early access, and
// the pre-launch page (source "coming-soon").
//
// WHERE AN ADDRESS GOES. Two places, on purpose:
//   1. the Resend CONTACT BOOK -- the durable list. It is what the dashboard's
//      "Audience" page shows and what a Broadcast sends to, so launch day is
//      one Broadcast rather than anyone reading an inbox. Needs no id and no
//      configuration; RESEND_SEGMENT_ID is optional on top of it.
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
  // removed in the future" -- checked 2026-09-12, because every half-remembered
  // example still uses POST /audiences/:id/contacts.
  //
  // ⚠️ AND `segments` IS OPTIONAL, WHICH IS THE WHOLE POINT. A bare
  // POST /contacts adds to the account's contact book, which is what the
  // dashboard's "Audience" page shows and what a Broadcast sends to. So this
  // needs NO id, NO build-spec change and NO redeploy: it works the moment it
  // deploys. That was verified against the real account on 2026-09-12 by
  // creating a contact (201) and deleting it again (200), not assumed from the
  // docs -- an earlier draft of this route required an id it did not need and
  // would have sat inert behind three manual steps.
  //
  // RESEND_SEGMENT_ID stays supported and stays OPTIONAL, for the day she wants
  // pre-launch signups kept apart from Shaklek+ ones. Setting it needs the
  // build-spec allowlist as well as the console
  // (node scripts/amplify-allow-env.mjs RESEND_SEGMENT_ID --apply) plus a
  // redeploy. Until then every signup lands in the one contact book, which is
  // the right default.
  const segmentId = process.env.RESEND_SEGMENT_ID;
  let stored = false;
  try {
    const contact = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        unsubscribed: false,
        ...(segmentId ? { segments: [segmentId] } : {}),
      }),
    });
    if (contact.ok) {
      stored = true;
    } else {
      const detail = await contact.text();
      // A repeat signup is a SUCCESS, not an error: somebody typing the same
      // address twice must not see a failure, and a list is deduplicated by
      // definition. Resend's docs do not state the duplicate behaviour, so this
      // reads the response rather than assuming a status code.
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
