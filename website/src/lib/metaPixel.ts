/**
 * Meta Pixel event helper.
 *
 * Two rules govern everything here:
 *
 * 1. IT MUST NEVER THROW. These calls sit on the add-to-cart and pay paths.
 *    An analytics library that raises inside a click handler takes the
 *    purchase with it, and this site takes live card payments. Every entry
 *    point is wrapped, and a missing/blocked/ad-blocked fbq is a silent no-op
 *    rather than an error.
 *
 * 2. IT MUST NEVER CARRY PII. No email, no name, no address, no measurements.
 *    Meta's own terms prohibit sending personal data in event parameters, and
 *    CLAUDE.md forbids logging PII generally. Only product identifiers,
 *    currency and value go out. Advanced Matching is deliberately NOT enabled;
 *    turning it on would hash and send the customer's email, which is a
 *    decision for the founder and a privacy-policy change, not a default.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const pixelEnabled = Boolean(PIXEL_ID);
export const PIXEL = PIXEL_ID;

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const f = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof f === "function" ? f : null;
}

/** Standard Meta event. Silently does nothing when the pixel is not configured. */
export function track(event: string, params?: Record<string, unknown>) {
  try {
    const f = fbq();
    if (!f) return;
    f("track", event, params ?? {});
  } catch {
    // Deliberately swallowed. See rule 1.
  }
}

/** Value in AED, rounded to fils, for the events Meta optimises against. */
export function money(aed: number) {
  return { value: Math.round(aed * 100) / 100, currency: "AED" };
}
