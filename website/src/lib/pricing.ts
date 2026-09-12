import { catalog, type CatalogItem } from "@/data/catalog";

// The server-side pricing authority. NOTHING about money may come from the
// request body -- /api/orders used to pass items[].price straight into
// Stripe's unit_amount, so anyone could edit one number in devtools (or in
// the shaklek-cart localStorage entry) and buy an AED 450 trouser for AED 5.
// That was live, against real cards. Prices are now always recomputed here
// from src/data/catalog.ts, which is the same source the UI renders from.

export type IncomingItem = {
  slug?: unknown;
  name?: unknown;
  category?: unknown;
  quantity?: unknown;
};

// A cart line can now be ordered more than once. Quantity is money -- it
// multiplies unit_amount -- so it gets the same treatment as price: never
// trusted from the request, always coerced to a whole number in a fixed
// range before it can reach Stripe or the database. A non-integer, a
// negative, a NaN or a missing value all collapse to 1 rather than being
// rejected, so a stale client can't block a legitimate checkout; anything
// above the cap is refused outright rather than silently trimmed, because
// silently charging for fewer garments than the customer asked for is
// worse than making them try again.
export const MAX_QUANTITY_PER_ITEM = 10;

export function resolveQuantity(value: unknown): number | null {
  if (value === undefined || value === null) return 1;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  const whole = Math.floor(n);
  if (whole < 1) return 1;
  if (whole > MAX_QUANTITY_PER_ITEM) return null;
  return whole;
}

export type PricedItem = {
  slug: string;
  // Units of this line. Always server-resolved -- see resolveQuantity.
  quantity: number;
  // Resolved from the catalog, not from the request -- otherwise a caller
  // could put arbitrary text on the Stripe hosted page and on the stylist's
  // notification email.
  name: string;
  category: string;
  price: number;
};

const bySlug = new Map<string, CatalogItem>(catalog.map((item) => [item.slug, item]));

// EVERY ORDER LINE MUST MATCH A REAL CATALOGUE ITEM. There is no other way to
// price anything, and that is the point.
//
// Until 2026-09-12 a line could carry NO slug and be priced off a per-category
// ladder instead, for the /upload "send us your own design" page. That page is
// gone (founder's decision, 2026-09-12) and the slugless branch went with it.
// It is worth recording what that branch actually cost, because it looked
// harmless for weeks:
//   - having a PRICE in the ladder was the same as being ON SALE, so Skirt
//     (449), Dress (599) and a same-day Abaya (690) were all purchasable with
//     no product, no photography and no quoted stitching
//   - the ladder itself went stale at 389/419/429/619 while the catalogue moved
//     to 449/519, so uploads sold 60-90 AED under the same garment
//   - `in` on that ladder let prototype keys through as categories, writing
//     orders rows with a NaN total
// All three were the same root cause: a second, parallel source of truth for
// price. Now there is one, `catalog.ts`, keyed by slug.
//
// ⚠️ DO NOT REINTRODUCE A CATEGORY-PRICED PATH. If custom work comes back, give
// it a real catalogue entry with a slug and a price, like everything else.
export function resolveItem(item: IncomingItem): PricedItem | null {
  const quantity = resolveQuantity(item.quantity);
  if (quantity === null) return null;

  const slug = typeof item.slug === "string" ? item.slug : "";
  const catalogItem = slug ? bySlug.get(slug) : undefined;
  if (!catalogItem) return null;

  return {
    slug: catalogItem.slug,
    quantity,
    name: catalogItem.name,
    category: catalogItem.category,
    price: catalogItem.price,
  };
}

export function resolveOrderPricing(items: IncomingItem[]):
  | { ok: true; priced: PricedItem[]; total: number }
  | { ok: false; error: string } {
  const priced: PricedItem[] = [];

  for (const item of items) {
    // Check the quantity cap first so the customer is told the real reason.
    // resolveItem() returns null for both an unknown slug and an over-cap
    // quantity, so without this an honest request for 11 shirts came back as
    // "Unrecognised item in order" -- a refusal, as intended, but for a
    // reason that is not true and that the customer cannot act on.
    if (resolveQuantity(item.quantity) === null) {
      return {
        ok: false,
        error: `You can order up to ${MAX_QUANTITY_PER_ITEM} of one piece. Please reduce the quantity or add it as a second line.`,
      };
    }

    const resolved = resolveItem(item);
    if (!resolved) {
      return { ok: false, error: "Unrecognised item in order" };
    }
    priced.push(resolved);
  }

  const total = priced.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { ok: true, priced, total };
}
