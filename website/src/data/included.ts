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
  { key: "sliders", label: "Every customisation" },
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
  "All included: every customisation, UAE delivery and one alteration, plus a free fitting (home in Dubai or virtual) on Tailored pieces. Ready in 10 working days.";
// No "linen" here (founder 2026-11-14): she is already buying linen, it is in the item line above.

/** Home page and ads: the sentence, verbatim, for ads and for screen readers. */
export const INCLUDED_HOME_LINE =
  "All included: private home fitting in Dubai, virtual fitting, every customisation and UAE delivery.";

/** The same sentence as the home rail draws it: a lead and four items. The
 *  words are the sentence's own words, so the two never disagree. */
export const INCLUDED_HOME_LEAD = "All included";
export const INCLUDED_HOME_CHIPS: IncludedLine[] = [
  { key: "home", label: "Private home fitting*" },
  { key: "virtual", label: "Virtual fitting" }, // founder 2026-11-13
  { key: "sliders", label: "Every customisation" },
  { key: "parcel", label: "UAE delivery" },
];

/** Footnote for the asterisk on "Private home fitting*" (founder, 2026-11-12). */
export const INCLUDED_HOME_FOOTNOTE = "*In Dubai";

/** Product page (founder, 2026-11-13): only what the page does not already
 *  say -- the shayla has its own photo block above and the linen is in the
 *  name and Product information, so both are left out here ("remove repetitive
 *  stuff, it's too low cost showing").
 *
 *  ⚠️ THESE FIVE LINES ARE VERBATIM (founder 2026-11-20, checked against the
 *  terms by shaklek-marketing). They say "in Dubai" and "from your phone" in
 *  the line itself, so the "*In Dubai" footnote is no longer drawn under
 *  them. ONE list for both layouts: the always-open section at the top of the
 *  phone sheet and the folded card on desktop (IncludedInPrice). */
export const INCLUDED_PRODUCT_LINES: { key: string; label: string }[] = [
  { key: "home", label: "Private home fitting, in Dubai" },
  { key: "virtual", label: "Virtual fitting, from your phone" },
  { key: "sliders", label: "Every customisation you choose" },
  { key: "parcel", label: "Delivery across the UAE" },
  { key: "needle", label: "One free alteration, within 10 days of delivery" },
];

/** "After you order", in the phone details sheet on the product page, between
 *  All included and Size (founder 2026-11-20). Friends on opening night did
 *  not understand how they get measured; this is the three-step answer.
 *
 *  ⏳ ONE CONSTANT ON PURPOSE: these strings get a shaklek-marketing check
 *  against the terms before shipping. Change them here and nowhere else.
 *  "10 working days" (founder 2026-11-20) matches INCLUDED_CHECKOUT_LINE and
 *  the product page. Tailored counts from the fitting, as the terms do. */
export const AFTER_ORDER = {
  heading: "After you order",
  steps: [
    "You order.",
    "We contact you to arrange your fitting: at home in Dubai, or virtual from your phone.",
    "We cut to your measurements and deliver within 10 working days of your fitting.",
  ],
  // Standard sizes get no fitting (terms 120-126), so their steps must not
  // promise one. Marketing check 2026-11-20.
  standardSteps: [
    "You order.",
    "We contact you to confirm your details.",
    "We make your piece and deliver in 10 working days.",
  ],
};

/** PHONES, details sheet: ONE block that merges "All included" and "After
 *  you order" (founder 2026-11-20: the two repeated each other). Lines reuse
 *  the marketing-checked wording; Standard has no fitting (terms 120-126). */
export const SHEET_INCLUDED = {
  heading: "All included",
  tailored: [
    "Fitting after you order: at home in Dubai, or virtual from your phone",
    "Cut to your measurements, with every customisation you choose",
    "Delivery across the UAE, 10 working days after your fitting",
    "One free alteration, within 10 days of delivery",
  ],
  standard: [
    "Made in your size, with every customisation you choose",
    "Delivery across the UAE, in 10 working days",
    "One free alteration, within 10 days of delivery",
  ],
  shayla: "Shayla included, cut from the same linen in your colour",
};
