import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";

// Waitlist signups. TWO sources as of 2026-09-12: Shaklek+ early access, and
// the pre-launch page (source "coming-soon").
//
// ⚠️ WHERE AN ADDRESS ACTUALLY GOES, since this is the whole answer to "where
// do we store it": NOWHERE BUT AN INBOX. Each signup is one email to
// hello@shaklek.com via Resend, with reply-to set to the address that signed
// up so a reply goes straight back to her. No table, no export, no list.
//
// ⏳ THAT STOPS BEING SOUND THE DAY THE PRE-LAUNCH PAGE GETS TRAFFIC. To tell
// two hundred people "we are open", somebody has to find two hundred emails in
// an inbox and retype the addresses. Fix it BEFORE driving traffic, and prefer
// Resend Audiences to a table: it dedupes, it stores, and it sends the
// broadcast. It needs an audience id, which means the build spec allowlist AND
// the console AND a redeploy -- see the RECONCILE_TOKEN warning in CLAUDE.md.
//
// ⚠️ AND A SIGNUP IS LOST IF RESEND IS DOWN. The caller gets an honest error
// and can retry, but nothing queues it. Same fix.
//
// Deliberately no database table. There is no migrate step in the Amplify
// build (see src/lib/envGuard.ts and planning/aws-infrastructure-todo.md), so a
// schema change and the code that needs it cannot ship atomically -- a new
// table would have to be applied to the live Neon branch by hand first. An
// email to the founder's inbox is a perfectly good list at this volume, and it
// can be moved into a table later without changing anything a customer sees.
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
    console.error("[waitlist] Resend call failed:", await res.text());
    return NextResponse.json(
      { ok: false, error: "We couldn't record that right now. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
