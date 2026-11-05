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

import { marketingAllowed } from "@/lib/consent";

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
export function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  try {
    // Defence in depth. Gating the script already means fbq never exists
    // without consent, but a visitor who accepts and then declines within the
    // same page view leaves fbq loaded. Checking here too means the answer is
    // honoured immediately rather than until the next navigation.
    // marketingAllowed() reads guarded storage and cannot throw, so rule 1
    // still holds.
    if (!marketingAllowed()) return;
    const f = fbq();
    if (!f) return;
    // eventID lets Meta drop the server (Conversions API) copy of the same event.
    f("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
  } catch {
    // Deliberately swallowed. See rule 1.
  }
}

/** A fresh id shared by a pixel event and its server twin (lib/metaCapi.ts). */
export function newEventId(prefix: string): string {
  try {
    return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
  } catch {
    return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * What checkout hands the server for the Conversions API -- ONLY when the
 * visitor accepted the cookie bar, and only the pixel's own cookie ids. No
 * consent: undefined, and the server sends nothing (lib/metaCapi.ts).
 */
export function capiHandoff(eventId: string): { consent: true; eventId: string; fbp: string | null; fbc: string | null } | undefined {
  try {
    if (!marketingAllowed()) return undefined;
    const jar = Object.fromEntries(document.cookie.split("; ").map((c) => [c.slice(0, c.indexOf("=")), c.slice(c.indexOf("=") + 1)]));
    return { consent: true, eventId, fbp: jar._fbp ?? null, fbc: jar._fbc ?? null };
  } catch {
    return undefined;
  }
}

/** Value in AED, rounded to fils, for the events Meta optimises against. */
export function money(aed: number) {
  return { value: Math.round(aed * 100) / 100, currency: "AED" };
}
