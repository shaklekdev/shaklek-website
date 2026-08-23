import { catalog, BASE_PRICE_BY_CATEGORY, type CatalogItem } from "@/data/catalog";

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
};

export type PricedItem = {
  slug: string;
  // Resolved from the catalog, not from the request -- otherwise a caller
  // could put arbitrary text on the Stripe hosted page and on the stylist's
  // notification email.
  name: string;
  category: string;
  price: number;
};

const bySlug = new Map<string, CatalogItem>(catalog.map((item) => [item.slug, item]));

function isPricedCategory(value: unknown): value is keyof typeof BASE_PRICE_BY_CATEGORY {
  return typeof value === "string" && value in BASE_PRICE_BY_CATEGORY;
}

// Uploaded designs (src/app/upload/page.tsx) legitimately carry no slug --
// they are priced off the category ladder instead, the same fixed tiers as
// catalog items. Everything else must match a real catalog slug.
export function resolveItem(item: IncomingItem): PricedItem | null {
  const slug = typeof item.slug === "string" ? item.slug : "";

  if (slug) {
    const catalogItem = bySlug.get(slug);
    if (!catalogItem) return null;
    return {
      slug: catalogItem.slug,
      name: catalogItem.name,
      category: catalogItem.category,
      price: catalogItem.price,
    };
  }

  if (!isPricedCategory(item.category)) return null;
  return {
    slug: "",
    name: `Custom ${item.category}`,
    category: item.category,
    price: BASE_PRICE_BY_CATEGORY[item.category],
  };
}

export function resolveOrderPricing(items: IncomingItem[]):
  | { ok: true; priced: PricedItem[]; total: number }
  | { ok: false; error: string } {
  const priced: PricedItem[] = [];

  for (const item of items) {
    const resolved = resolveItem(item);
    if (!resolved) {
      return { ok: false, error: "Unrecognised item in order" };
    }
    priced.push(resolved);
  }

  const total = priced.reduce((sum, item) => sum + item.price, 0);
  return { ok: true, priced, total };
}
