import { includedWith } from "@/data/catalog";

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
// Founder, 2026-11-12: "one price is not clear" -> lead with "All included".
export const INCLUDED_HEADING = "All included in the price";

// Text only, no icons: founder, 2026-11-12, "those emojis look cheap not high end".
export type IncludedLine = { key: string; label: string };

const INCLUDED_LINES: IncludedLine[] = [
  { key: "home", label: "Private home fitting, in Dubai" },
  { key: "sliders", label: "Every customisation option" },
  { key: "flax", label: "100% natural linen" },
  { key: "parcel", label: "Delivery across the UAE" },
  { key: "needle", label: "One fit alteration, within 10 days" },
];

// Abaya only (catalog.ts includedWith): sits right after the linen line because
// it is cut from that linen.
const INCLUDED_SHAYLA_LINE: IncludedLine = {
  key: "shayla",
  label: "Shayla included, cut from the same linen in your colour",
};

/** The lines for one garment, in display order. */
export function includedLines(category: string | null | undefined): IncludedLine[] {
  if (includedWith(category).length === 0) return INCLUDED_LINES;
  const i = INCLUDED_LINES.findIndex((l) => l.key === "flax") + 1;
  return [...INCLUDED_LINES.slice(0, i), INCLUDED_SHAYLA_LINE, ...INCLUDED_LINES.slice(i)];
}

/** Checkout, under the order lines, before paying. */
export const INCLUDED_CHECKOUT_LINE =
  "All included: private home fitting in Dubai, every option, linen, UAE delivery and one alteration.";

/** Home page and ads: the sentence, verbatim, for ads and for screen readers. */
export const INCLUDED_HOME_LINE =
  "All included: private home fitting in Dubai, every customisation and delivery.";

/** The same sentence as the home rail draws it: a lead and four items. The
 *  words are the sentence's own words, so the two never disagree. */
export const INCLUDED_HOME_LEAD = "All included";
export const INCLUDED_HOME_CHIPS: IncludedLine[] = [
  { key: "home", label: "Private home fitting*" },
  { key: "sliders", label: "Every customisation" },
  { key: "parcel", label: "Delivery" },
];

/** Footnote for the asterisk on "Private home fitting*" (founder, 2026-11-12). */
export const INCLUDED_HOME_FOOTNOTE = "*In Dubai";
