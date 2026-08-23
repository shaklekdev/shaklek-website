import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rateLimit";
import { rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";

// Looks up a customer-entered promotion code so the cart can show the
// discount BEFORE the redirect to Stripe. Nothing here applies a discount --
// it only reports what Stripe says a code is worth. The actual reduction is
// applied by Stripe when /api/orders passes the resolved promotion code id
// into the Checkout Session, and the amount finally charged is read back off
// the signed webhook. A caller who lies to this endpoint changes nothing.
//
// Codes are short and guessable by design, so this is a brute-force surface:
// it answers "is this a valid code" for anyone who asks. Rate limited
// accordingly, and it never reveals anything beyond the discount itself.
const MAX_CODE_LENGTH = 64;

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "promo", 15, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;

  const oversized = rejectOversizedBody(req, 4_000);
  if (oversized) return oversized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request" }, { status: 400 });
  }

  const raw = (body as { code?: unknown })?.code;
  const code = typeof raw === "string" ? raw.trim() : "";
  if (!code || code.length > MAX_CODE_LENGTH) {
    return NextResponse.json({ ok: false, error: "Enter a code" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "Discounts are unavailable" }, { status: 501 });
  }

  try {
    // `active: true` excludes archived codes, ones past expires_at, and ones
    // that hit max_redemptions. Stripe treats codes case-insensitively but
    // this lookup is exact, so normalise to upper case the way the Dashboard
    // displays them.
    // The 2026-07-29 API nests the coupon under `promotion` and returns it
    // as a bare id, so it has to be expanded to read the discount off it.
    const found = await stripe.promotionCodes.list({
      code: code.toUpperCase(),
      active: true,
      limit: 1,
      expand: ["data.promotion.coupon"],
    });
    const promo = found.data[0];
    const coupon = promo?.promotion?.coupon;

    // Deliberately the same message for "no such code" and "code is not
    // usable": telling a stranger which codes exist but are expired is free
    // reconnaissance for guessing the live ones. `active: true` already
    // excludes archived, expired and fully-redeemed codes -- a promotion code
    // is only active while its coupon is valid.
    if (!promo || !coupon || typeof coupon === "string" || !coupon.valid) {
      return NextResponse.json({ ok: false, error: "That code isn't valid" }, { status: 404 });
    }

    const { percent_off: percentOff, amount_off: amountOff } = coupon;

    return NextResponse.json({
      ok: true,
      // Echo Stripe's own casing back, not the customer's.
      code: promo.code,
      percentOff: percentOff ?? null,
      // amount_off is in fils; the cart talks in dirhams.
      amountOffAed: typeof amountOff === "number" ? amountOff / 100 : null,
    });
  } catch (err) {
    console.error("[promo] lookup failed:", err);
    return NextResponse.json({ ok: false, error: "Could not check that code" }, { status: 502 });
  }
}
