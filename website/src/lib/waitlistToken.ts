import { createHmac, timingSafeEqual } from "crypto";

// Signed confirm links for the waitlist, deliberately the SAME PATTERN as
// src/lib/orderAccess.ts rather than a second invention. Founder, 2026-09-12:
// "we already have a confirmation process done for signup, why aren't we just
// using that code". This is that code, with its own domain-separation label.
//
// ⚠️ NOT CLERK. Clerk's email verification creates a USER ACCOUNT, which is far
// too much to ask of someone whose entire request is "tell me when you open" --
// and it would leave a customers row for every curious visitor.
//
// WHAT THE TOKEN IS FOR. Anyone can type anyone's address into a public form,
// so a waitlist row starts unconfirmed and is not mailable. Only a click from
// the real inbox proves ownership. Without that, a few hundred scripted
// signups turn the launch Broadcast into spam complaints against shaklek.com --
// the same domain that sends every order confirmation.
//
// The row id is already an unguessable uuid; the HMAC is what stops someone
// who has seen ONE confirm link from minting others, and it means the link is
// stateless: no pending-token table, nothing to expire, nothing to clean up.
//
// Key: WAITLIST_TOKEN_SECRET if set, otherwise derived from
// STRIPE_WEBHOOK_SECRET, which is present anywhere this can run. The label
// differs from orderAccess's, so a token from one is useless against the other.
function signingKey(): string | null {
  const dedicated = process.env.WAITLIST_TOKEN_SECRET;
  if (dedicated) return dedicated;

  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (stripeSecret) {
    return createHmac("sha256", stripeSecret).update("shaklek:waitlist-confirm:v1").digest("hex");
  }
  return null;
}

export function issueWaitlistToken(rowId: string): string {
  const key = signingKey();
  if (!key) return "";
  return createHmac("sha256", key).update(rowId).digest("hex").slice(0, 32);
}

export function verifyWaitlistToken(rowId: string, token: unknown): boolean {
  if (typeof token !== "string" || !token) return false;

  const expected = issueWaitlistToken(rowId);
  if (!expected) return false;

  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  // Compare lengths first: timingSafeEqual throws on a mismatch rather than
  // returning false, and a thrown 500 is itself an oracle.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
