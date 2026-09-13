import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { boundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";
import { getDb, schema } from "@/db/client";
import { issueWaitlistToken } from "@/lib/waitlistToken";
import { appUrl } from "@/lib/appUrl";
import { buildEmail, unsubscribeHeaders } from "@/lib/mail";

async function sendMail(
  apiKey: string,
  msg: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    headers?: Record<string, string>;
  },
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
  // Stripped of CR/LF before it can reach a Subject header. boundedText trims
  // and caps length but does not remove newlines, and this value is
  // interpolated into a subject line.
  const source = (boundedText(body.source, 40) ?? "unknown").replace(/[\r\n]+/g, " ");

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
  let row: { id: string; confirmedAt: Date | null; unsubscribedAt: Date | null } | null = null;
  if (db) {
    try {
      const [saved] = await db
        .insert(schema.waitlist)
        .values({ email, source })
        .onConflictDoUpdate({
          target: schema.waitlist.email,
          set: { source },
        })
        .returning({
          id: schema.waitlist.id,
          confirmedAt: schema.waitlist.confirmedAt,
          // ⚠️ READ THIS, DO NOT JUST WRITE IT. It was written by the
          // unsubscribe route and read by nothing, so a person who had opted
          // out still received the "you are already on the list" marketing mail
          // the moment anyone re-entered her address on a public form. Security
          // review, 2026-09-13. That is a PDPL direct-marketing problem and a
          // spam complaint against the domain that carries order confirmations.
          unsubscribedAt: schema.waitlist.unsubscribedAt,
        });
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
  // Somebody who has left the list gets NOTHING from this route. Not a
  // confirmation, not a "you are already on the list". Re-joining has to start
  // from a deliberate act of hers, not from anyone typing her address into a
  // public form.
  const hasUnsubscribed = Boolean(row?.unsubscribedAt);

  // ⚠️ SOMEONE WHO SIGNS UP AND RECEIVES NOTHING BELIEVES THE FORM IS BROKEN.
  // The first version sent no email at all to an address that was already
  // confirmed, reasoning that a second confirmation is noise. It is -- but
  // silence is worse. The founder hit exactly this testing her own form: she
  // had confirmed already (the click DID reach production; only the redirect
  // was broken), signed up again, got nothing, and reported the email as not
  // working. Every signup now gets an answer; an already-confirmed one just
  // gets a different, shorter answer with no link to click.
  if (row && alreadyConfirmed && !hasUnsubscribed) {
    const unsubUrl = `${appUrl()}/api/waitlist/unsubscribe?id=${row.id}&t=${issueWaitlistToken(row.id, "unsubscribe")}`;
    // MARKETING, so it carries a visible unsubscribe: she is already on the
    // list, so this is a note to somebody on a list rather than an answer to a
    // request. The confirmation below is the opposite and carries none.
    const body = buildEmail({
      kind: "marketing",
      preheader: "You are already on the list.",
      lines: [
        "You are already on the list, so there is nothing to do.",
        "We will write when we open, and now and then when there is something new.",
      ],
      unsubscribeUrl: unsubUrl,
    });
    await sendMail(apiKey, {
      to: email,
      subject: "You are already on the list",
      headers: unsubscribeHeaders(unsubUrl),
      text: body.text,
      html: body.html,
    });
  }

  // Branch on `row` itself rather than on a derived string, so the compiler
  // narrows it for the whole block. The first version built two URLs from
  // `row.id` inside `if (confirmUrl)`, which TypeScript could not narrow.
  if (row && !alreadyConfirmed && !hasUnsubscribed) {
    const confirmUrl = `${appUrl()}/api/waitlist/confirm?id=${row.id}&t=${issueWaitlistToken(row.id)}`;
    const unsubUrl = `${appUrl()}/api/waitlist/unsubscribe?id=${row.id}&t=${issueWaitlistToken(row.id, "unsubscribe")}`;

    // ⚠️ TRANSACTIONAL: NO VISIBLE UNSUBSCRIBE. Founder, 2026-09-13: "we put
    // the link for confirmation, and then on any future emails we put the
    // option to unsubscribe, this is how it works." She is right and the first
    // version had it backwards -- offering to remove somebody from a list she
    // has not joined yet, in the same breath as asking her to join it, reads as
    // a mistake. The HEADER still goes on, so Gmail's own button works and the
    // send still looks well-behaved to a mailbox provider.
    //
    // ⚠️ AND THE LINK IS BEHIND A BUTTON. A 90-character signed URL printed in
    // full wrapped across four lines on her phone and looked like phishing.
    // Plain text cannot do that, which is why there is an HTML version now.
    const body = buildEmail({
      kind: "transactional",
      preheader: "One tap and you are on the list.",
      lines: [
        "Thank you for asking.",
        "We are Shaklek. 100% linen, cut to your shape, sewn here in the UAE, and nothing made before somebody wants it.",
        "Tap below and we will tell you the day we open.",
        "If you did not ask for this, ignore this and you will never hear from us again.",
      ],
      button: { label: "Confirm my email", url: confirmUrl },
    });
    const sent = await sendMail(apiKey, {
      to: email,
      subject: "Confirm your email, and we will tell you when we open",
      headers: unsubscribeHeaders(unsubUrl),
      text: body.text,
      html: body.html,
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
    // Status and a parsed code only. This payload carries reply_to: email, so a
    // validation error that echoes the request would put a customer's address
    // in CloudWatch. confirm/route.ts already does it this way.
    let code = "unknown";
    try {
      const parsed = JSON.parse(await res.text());
      code = String(parsed?.name ?? parsed?.code ?? "unknown").slice(0, 60);
    } catch {
      /* not JSON */
    }
    console.error("[waitlist] notification email failed:", res.status, code);
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
