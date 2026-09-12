import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";
import { getDb, schema } from "@/db/client";
import { issueWaitlistToken } from "@/lib/waitlistToken";
import { appUrl } from "@/lib/appUrl";

async function sendMail(
  apiKey: string,
  msg: { to: string; subject: string; text: string; headers?: Record<string, string> },
) {
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Shaklek <orders@shaklek.com>", ...msg }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

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

// ⚠️ The old shape was /^[^\s@]+@[^\s@]+\.[^\s@]+$/, which accepts
// `a@b.com,c@d.com` and `"x"<y>@z.io`. Those pass here, reach Resend, and come
// back as a validation error whose body may echo the address -- into CloudWatch,
// which this file says must never happen. Security review, 2026-09-12.
const EMAIL = /^[^\s@,<>()"'\\;:]+@[^\s@,<>()"'\\;:]+\.[^\s@,<>()"'\\;:]{2,}$/;
function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 320 && EMAIL.test(value);
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
  // 1. OUR DATABASE. This is the list. Everything else is a copy of it.
  //
  // Founder, 2026-09-12, and she was right: an address someone chose to give is
  // the asset, and it must not live only inside a third party we might leave.
  // Resend is how the launch mail is SENT; this table is where the truth is.
  //
  // ⚠️ THE ROW IS WRITTEN UNCONFIRMED AND IS NOT MAILABLE YET. Anyone can type
  // anyone's address into a public form. Only the click in the real inbox sets
  // confirmed_at, and only confirmed rows are pushed to Resend. Without that, a
  // few hundred scripted signups turn the launch Broadcast into spam complaints
  // against shaklek.com -- the domain that also sends every order confirmation.
  //
  // A repeat signup UPDATES rather than duplicating (unique on email) and
  // re-sends the confirm link, because the commonest reason to sign up twice is
  // that the first email was never found.
  const db = getDb();
  let row: { id: string; confirmedAt: Date | null } | null = null;
  if (db) {
    try {
      const [saved] = await db
        .insert(schema.waitlist)
        .values({ email, source })
        .onConflictDoUpdate({
          target: schema.waitlist.email,
          set: { source },
        })
        .returning({ id: schema.waitlist.id, confirmedAt: schema.waitlist.confirmedAt });
      row = saved ?? null;
    } catch (err) {
      // Never the address -- CloudWatch outlives the signup.
      console.error("[waitlist] db write failed:", err instanceof Error ? err.message : "unknown");
    }
  } else {
    console.error("[waitlist] no DATABASE_URL — signup NOT stored.");
  }

  // ---------------------------------------------------------------------
  // 2. THE CONFIRM LINK, unless she has already confirmed, in which case
  // sending another would be noise.
  const alreadyConfirmed = Boolean(row?.confirmedAt);

  // Branch on `row` itself rather than on a derived string, so the compiler
  // narrows it for the whole block. The first version built two URLs from
  // `row.id` inside `if (confirmUrl)`, which TypeScript could not narrow.
  if (row && !alreadyConfirmed) {
    const confirmUrl = `${appUrl()}/api/waitlist/confirm?id=${row.id}&t=${issueWaitlistToken(row.id)}`;
    // ⚠️ EVERY SEND CARRIES List-Unsubscribe, and this one is transactional.
    // Resend adds an unsubscribe to a BROADCAST; it adds nothing to a
    // POST /emails send like this one, and a one-off drop announcement sent the
    // same way would carry nothing either. The copy below promises she can
    // leave whenever she likes, so the header makes that true however the mail
    // was sent, rather than depending on anyone remembering to use Broadcasts.
    //
    // List-Unsubscribe-Post is RFC 8058 one-click: Gmail and Apple Mail call
    // the URL themselves from their own unsubscribe button. That is the header
    // that actually keeps complaints down, because it turns "mark as spam" into
    // "unsubscribe" inside the client.
    const unsubUrl = `${appUrl()}/api/waitlist/unsubscribe?id=${row.id}&t=${issueWaitlistToken(row.id, "unsubscribe")}`;
    const sent = await sendMail(apiKey, {
      to: email,
      subject: "One click, and we will tell you when we open",
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      // ⚠️ ONE LINE PER PARAGRAPH, NEVER HARD-WRAPPED AT 75 CHARACTERS. The
      // first version wrapped by hand, which looks tidy in a code editor and
      // ragged on a phone: the client re-wraps to its own width and the manual
      // breaks survive, so every paragraph ends in a short orphan line. The
      // founder's screenshot showed exactly that. Let the mail client wrap.
      //
      // ⚠️ AND THE UNSUBSCRIBE IS IN THE BODY, not only in the header. Gmail
      // shows a header-based unsubscribe only for mail it classifies as bulk,
      // and a first transactional send is not bulk -- so the promise made two
      // lines above it was invisible in her inbox. The header stays for the
      // one-click button; this is what a person can actually see.
      text: [
        "Thank you for asking.",
        "",
        "Shaklek is 100% linen, cut to your shape, and sewn here in the UAE after you order it.",
        "",
        "Confirm your address and we will tell you the day we open, and now and then when there is something new.",
        "",
        confirmUrl,
        "",
        "Did not ask for this? Ignore this email and you will never hear from us again.",
        "",
        "Shaklek, Dubai",
        `Leave the list: ${unsubUrl}`,
      ].join("\n"),
    });
    if (!sent) {
      console.error("[waitlist] confirm email failed to send");
    }
  }

  // ---------------------------------------------------------------------
  // 3. THE PING to the founder, so she sees a signup the moment it happens.
  // It now says whether the address is confirmed, because an unconfirmed one
  // is a number and not yet a person who can be emailed.
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Shaklek <orders@shaklek.com>",
      to: "hello@shaklek.com",
      reply_to: email,
      subject:
        source === "coming-soon"
          ? "Pre-launch signup (tell me when you open)"
          : `Waitlist signup (${source})`,
      text: [
        email,
        `Source: ${source}`,
        alreadyConfirmed
          ? "Already confirmed (signed up again)"
          : row
            ? "Stored, confirm email sent. Not on the mailing list until she clicks."
            : "⚠️ NOT STORED — the database write failed. See CloudWatch.",
        `Received: ${new Date().toISOString()}`,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("[waitlist] notification email failed:", (await res.text()).slice(0, 300));
  }

  // Honest only if her address was actually recorded. The DB row is what
  // matters now -- saying "thank you" when nothing stored her address is the
  // exact failure this route exists to avoid. The founder's notification
  // failing is an operational problem, not a reason to tell her it went wrong.
  if (!row && !res.ok) {
    return NextResponse.json(
      { ok: false, error: "We couldn't record that right now. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
