import Stripe from "stripe";

// No Stripe account is wired up in production yet (payment-auth-todo.md --
// merchant account needs the Wio business bank account first). Same
// graceful-degradation pattern as getDb()/RESEND_API_KEY: callers check
// getStripe() for null and fall back to the pre-Stripe demo checkout flow.
let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe = new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
  return stripe;
}
