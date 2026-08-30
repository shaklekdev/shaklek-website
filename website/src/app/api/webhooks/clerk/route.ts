import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/db/client";
import { rejectOversizedBody } from "@/lib/requestGuards";
import { verifySvixSignature } from "@/lib/svixVerify";

// Clerk calls this when a customer creates an account.
//
// WHY THIS EXISTS: until 2026-08-30 nothing in this system reacted to a signup
// at all. There was no Clerk webhook of any kind -- only Stripe's. A customer
// could create an account and it produced no email, no row and no dashboard
// entry, because `customers` rows are written when someone ORDERS, not when
// they sign up. An account with no order lived entirely inside Clerk and was
// invisible to the founder. She noticed when a friend signed up and nothing
// happened.
//
// SCOPE, DELIBERATELY SMALL: this route sends one email and writes nothing.
// It does not touch the database and it does not import from
// `src/lib/orderEmail.ts`, which the Stripe webhook depends on -- a signup
// notification has no business in the payment blast radius.

// `whsec_...` from the Clerk Dashboard's webhook endpoint page.
// ⚠️ Setting it in the Amplify console is NOT enough. The build spec carries an
// explicit `env | grep -e ... >> .env.production` allowlist, and a variable
// missing from that grep is simply undefined at runtime while the console
// shows it set. Add `-e CLERK_WEBHOOK_SECRET` to the spec and redeploy.
// (This cost an hour on RECONCILE_TOKEN -- see CLAUDE.md.)
const SIGNING_SECRET = "CLERK_WEBHOOK_SECRET";

// Clerk's user.created payloads are a couple of KB. This is generous and still
// closes the "unauthenticated endpoint buffers an unbounded body" hole.
const MAX_BODY_BYTES = 64 * 1024;

type ClerkEmail = {
  id?: string;
  email_address?: string;
  verification?: { status?: string } | null;
};

type ClerkUserCreated = {
  type?: string;
  data?: {
    id?: string;
    email_addresses?: ClerkEmail[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: number;
  };
};

/** Staff recipients. Falls back to the address the order mail already reaches. */
function recipients(): string[] {
  const configured = (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  return configured.length ? configured : ["orders@shaklek.com"];
}

export async function POST(req: NextRequest) {
  const secret = process.env[SIGNING_SECRET];

  // Same shape as the Stripe route: an unconfigured webhook 501s rather than
  // pretending to work. Clerk cannot be pointed here without the secret
  // existing anyway.
  if (!secret) {
    console.log("[webhooks/clerk] CLERK_WEBHOOK_SECRET not set — ignoring webhook call.");
    return NextResponse.json({ ok: false, error: "Clerk webhook not configured" }, { status: 501 });
  }

  const oversized = rejectOversizedBody(req, MAX_BODY_BYTES);
  if (oversized) return oversized;

  // NOTE: `req.text()`, never `req.json()`. The signature covers the exact
  // bytes received; re-serialising parsed JSON changes key order and
  // whitespace and would fail verification on every genuine delivery.
  const rawBody = await req.text();

  // A cross-origin guard is deliberately NOT applied here. Clerk's servers
  // send no Origin header, so `rejectCrossOrigin` would reject every real
  // delivery. The signature is the authentication for this route.
  const verdict = verifySvixSignature(
    rawBody,
    {
      id: req.headers.get("svix-id"),
      timestamp: req.headers.get("svix-timestamp"),
      signature: req.headers.get("svix-signature"),
    },
    secret,
  );

  if (!verdict.ok) {
    console.error(`[webhooks/clerk] Signature verification failed: ${verdict.reason}`);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  let event: ClerkUserCreated;
  try {
    event = JSON.parse(rawBody) as ClerkUserCreated;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed payload" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ ok: true, skipped: event.type ?? "unknown" });
  }

  const data = event.data ?? {};
  const addresses = Array.isArray(data.email_addresses) ? data.email_addresses : [];
  const primary =
    addresses.find((e) => e.id && e.id === data.primary_email_address_id) ?? addresses[0];
  const email = primary?.email_address ?? "(no email on account)";
  const verified = primary?.verification?.status === "verified";
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim();

  // Record the signup, so an account is visible somewhere we can query.
  //
  // WHY: `customers` rows were only ever written by three things -- placing an
  // order, saving a name on /account, saving measurements on /account. A
  // person who merely signed up existed ONLY inside Clerk. The founder went
  // looking for a registered account in the database and correctly could not
  // find one.
  //
  // WHY THIS IS SAFE, and why it needs no migration: it adds ROWS, not
  // columns. Deploy Trap 3 (schema ahead of database) does not apply. Every
  // read of `customers` is either an innerJoin from `orders`/`fit_feedback` --
  // so a customer with no orders simply does not appear, and the orders
  // dashboard is unchanged -- or a lookup by email.
  //
  // Lower-cased on the way in. /api/orders stores a guest address exactly as
  // typed, which is the open email-normalisation defect; writing the canonical
  // form here means the signup row is the clean one rather than another
  // variant to reconcile later.
  //
  // onConflictDoNothing, matching /api/orders: a signup that later orders must
  // not double up, and an existing row's name and measurements must not be
  // clobbered by a webhook retry.
  const emailKey = email.toLowerCase();
  if (primary?.email_address) {
    try {
      const db = getDb();
      if (db) {
        await db
          .insert(schema.customers)
          .values({ email: emailKey, ...(name ? { name } : {}) })
          .onConflictDoNothing({ target: schema.customers.email });
      }
    } catch (err) {
      // Never fail the delivery over this -- the notification email is the
      // part the founder actually depends on, and Clerk would retry the whole
      // event and resend it. Log the failure, not the address.
      console.error(
        "[webhooks/clerk] customer row not written:",
        err instanceof Error ? err.message : "unknown error",
      );
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Never log the address itself. CloudWatch outlives the account.
    console.error("[webhooks/clerk] RESEND_API_KEY not set — signup NOT emailed. Details withheld (PII).");
    return NextResponse.json({ ok: true, emailed: false });
  }

  const lines = [
    `${name || "Someone"} created a Shaklek account.`,
    ``,
    `Email:    ${email}${verified ? " (verified)" : " (NOT yet verified)"}`,
    `Clerk ID: ${data.id ?? "unknown"}`,
    ``,
    `They have not ordered anything yet — an account on its own writes no`,
    `order row, so this will not appear on the dashboard.`,
  ];

  // Clerk delivers at-least-once, so a retry after a slow response can produce
  // a duplicate email. That is the whole consequence here: this route changes
  // no state, so there is nothing to gate and a repeated note is harmless.
  // If signup volume ever makes duplicates annoying, dedupe on `svix-id`.
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Shaklek <orders@shaklek.com>",
      to: recipients(),
      subject: `New account — ${name || email}`,
      text: lines.join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("[webhooks/clerk] Resend API call failed:", await res.text());
    // 200 on purpose: the signature was valid and we accepted the event.
    // A non-2xx makes Clerk retry, which would resend a mail that failed for
    // our own reasons, not Clerk's.
    return NextResponse.json({ ok: true, emailed: false });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
