import { includedWith } from "@/data/catalog";
import type { LineIconName } from "@/components/LineIcon";

// ⚠️ ONE SOURCE FOR "THE PRICE INCLUDES EVERYTHING". Founder priority,
// 2026-11-12: it must be OBVIOUS that the price is the whole price. The product
// page (next to Add to cart), checkout (near the total) and the home rail all
// read from here, so the claim cannot drift between surfaces. Copy cleared by
// shaklek-marketing the same day; use verbatim, do not reword per surface.
// Rendered by components/IncludedInPrice.tsx.
//
// No numbers here. The price lives in catalog.ts; the alteration window and the
// linen claim are repeated from /legal and fabrics.ts and must be changed there
// FIRST if they ever change.
export const INCLUDED_HEADING = "Included in the price";

export type IncludedLine = { icon: LineIconName; label: string };

const INCLUDED_LINES: IncludedLine[] = [
  { icon: "home", label: "Private home fitting, in Dubai" },
  { icon: "sliders", label: "Every customisation option" },
  { icon: "flax", label: "100% natural linen" },
  { icon: "parcel", label: "Delivery across the UAE" },
  { icon: "needle", label: "One fit alteration, within 10 days" },
];

// Abaya only (catalog.ts includedWith): sits right after the linen line because
// it is cut from that linen.
const INCLUDED_SHAYLA_LINE: IncludedLine = {
  icon: "shayla",
  label: "Shayla included, cut from the same linen in your colour",
};

/** The lines for one garment, in display order. */
export function includedLines(category: string | null | undefined): IncludedLine[] {
  if (includedWith(category).length === 0) return INCLUDED_LINES;
  const i = INCLUDED_LINES.findIndex((l) => l.icon === "flax") + 1;
  return [...INCLUDED_LINES.slice(0, i), INCLUDED_SHAYLA_LINE, ...INCLUDED_LINES.slice(i)];
}

/** Checkout, under the order lines, before paying. */
export const INCLUDED_CHECKOUT_LINE =
  "The price includes fitting in Dubai, every option, linen, UAE delivery and one alteration.";

/** Home page and ads: the sentence, verbatim, for ads and for screen readers. */
export const INCLUDED_HOME_LINE =
  "One price. Fitting, every option, delivery and one alteration included.";

/** The same sentence as the home rail draws it: a lead and four chips. The
 *  words are the sentence's own words, so the two never disagree. */
export const INCLUDED_HOME_LEAD = "One price.";
export const INCLUDED_HOME_CHIPS: IncludedLine[] = [
  { icon: "home", label: "Fitting" },
  { icon: "sliders", label: "Every option" },
  { icon: "parcel", label: "Delivery" },
  { icon: "needle", label: "One alteration" },
];
