import { createHmac, timingSafeEqual } from "crypto";

// /api/orders/:id had no authorization at all -- it returned the customer's
// email, items, measurements and total to anyone who presented an order id.
// Order ids leak the ordinary ways URLs leak: shared confirmation links,
// browser history, CloudFront access logs, analytics that capture query
// strings. This makes the id alone insufficient.
//
// The token is a keyed HMAC of the order id, minted when the Checkout Session
// is created and carried in Stripe's success_url. It is stateless, so it
// needs no schema change and works for guest checkouts, which have no Clerk
// session to authorize against.
//
// Key: ORDER_TOKEN_SECRET if set. Otherwise it is derived from
// STRIPE_WEBHOOK_SECRET, which is already present in every environment that
// can create an order at all -- with a domain-separation label so the derived
// key cannot be used to forge anything Stripe-related, or vice versa.
function signingKey(): string | null {
  const dedicated = process.env.ORDER_TOKEN_SECRET;
  if (dedicated) return dedicated;

  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (stripeSecret) {
    return createHmac("sha256", stripeSecret).update("shaklek:order-access:v1").digest("hex");
  }
  return null;
}

export function issueOrderAccessToken(orderId: string): string {
  const key = signingKey();
  if (!key) return "";
  return createHmac("sha256", key).update(orderId).digest("hex").slice(0, 32);
}

export function verifyOrderAccessToken(orderId: string, token: unknown): boolean {
  if (typeof token !== "string" || !token) return false;

  const expected = issueOrderAccessToken(orderId);
  if (!expected) return false;

  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
