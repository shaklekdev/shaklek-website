// THE LINEN WE HAVE, AND WHAT EACH PIECE USES. Founder, 2026-11-12: "we have
// a limited amount of fabric, and when someone orders, the fabric is reserved
// for her, so nobody else can buy it."
//
// STOCK IS COMPUTED, NOT STORED. Available = the metres below minus what live
// orders placed since STOCK_SINCE consume (src/lib/fabricStock.ts). There is
// no counter column to drift and no migration: cancel an order in the
// dashboard and its fabric comes back by itself.
//
// ⚠️ TO RECORD A NEW ROLL OR A MANUAL CUT (a sample, a shoot piece, an order
// taken on WhatsApp), change the number here AND move STOCK_SINCE to today,
// so orders already counted in the old figure are not subtracted twice.
//
// Source: the single Shirley Gz roll per colour, article W300235, 124m,
// invoiced 2026-09-09 (planning/spend.md). Founder 2026-11-12: nothing has
// been cut from it yet.
export const STOCK_SINCE = "2026-11-11T00:00:00+04:00";

export const STOCK_METRES: Record<string, number> = {
  Ivory: 43,
  Navy: 32,
  Burgundy: 27,
  White: 22,
};

// Same figures as planning/margins.mjs metresPerGarment (founder + tailor
// confirmed; the abaya's 5.4 includes the 0.9m shayla cut with it). If one
// changes, change both.
export const METRES_PER_GARMENT: Record<string, number> = {
  Shirt: 2.0,
  Skirt: 1.5,
  Pants: 2.0,
  Dress: 2.75,
  Abaya: 5.4,
};

// An unknown category reserves the most cloth any piece uses, never zero: a
// new category added to the catalogue without a figure here must not sell
// fabric we do not have.
export function metresFor(category: string | null | undefined): number {
  return (category && Object.hasOwn(METRES_PER_GARMENT, category) && METRES_PER_GARMENT[category]) || Math.max(...Object.values(METRES_PER_GARMENT));
}

// A colour with no stock line has no stock. Fail closed.
export function stockFor(color: string | null | undefined): number {
  return (color && Object.hasOwn(STOCK_METRES, color) && STOCK_METRES[color]) || 0;
}
