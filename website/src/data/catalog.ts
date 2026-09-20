export type DressTier = "standard" | "elaborate";

export type CatalogItem = {
  slug: string;
  name: string;
  category: "Shirt" | "Skirt" | "Pants" | "Dress" | "Abaya";
  // ⚠️ OVERRIDES WHICH SLIDERS THIS ITEM OFFERS, without changing its category.
  // Two products can share a category and still customise differently: the Open
  // Abaya is length x sleeve width, the Jacket Abaya is length x closure. Left
  // unset, the item uses its category's sliders, which is what all eight
  // original products do. See paramsForCategory() in parameterSliders.ts for
  // why this is a separate key rather than a new category.
  paramSet?: string;
  price: number;
  descriptor: string;
  badge?: "TRENDING" | "NEW";
  gradient: [string, string];
  dressTier?: DressTier;
  // Real photography, once generated -- falls back to the gradient when
  // absent so items can be migrated one at a time. image/backImage are the
  // default (Ivory) pair shown on the catalog grid; colorImages holds
  // additional color variants shown once a customer picks a color on the
  // design page -- keyed by the color names in src/data/colors.ts.
  image?: string;
  backImage?: string;
  colorImages?: Partial<Record<string, { front: string; back: string }>>;
  // Real per-combo renders for the "render" tier sliders (see
  // parameterSliders.ts) -- keyed by color, then by comboKeyForCategory().
  // Falls back to colorImages when a combo hasn't been generated yet, so
  // items can be migrated one at a time same as colorImages itself.
  comboImages?: Partial<Record<string, Partial<Record<string, { front: string; back: string }>>>>;
  // Overrides parameterSliders.ts's defaultIndex per slider type, for items
  // whose base photo doesn't match the category-wide default -- e.g.
  // Structured Blouse's photo is a half sleeve, not SHIRT_PARAMS' "long"
  // default, so its initial slider position/preview would otherwise be
  // wrong on first load.
  defaultChanges?: Partial<Record<string, string>>;
};

// Pricing set 2026-08-22, revised 2026-08-26 -- see planning/pricing-todo.md
// for the model, the CAC assumptions and the capacity constraint behind it.
//
// DO NOT restate the ladder in this comment. It said "Shirt 390 · Skirt 420 ·
// Pants 450 · Dress 620" for four days while the object below said 389/419/
// 429/619, and the margin case was argued from the comment. The numbers are
// three lines down; read them there.
//
// These are LIST prices, and they are LINEN prices -- linen is the only
// sellable fabric (src/data/fabrics.ts). Any discount is applied as a Stripe
// promotion code at checkout, never by discounting these. As of 2026-08-26
// there is NO active promotion code: the founder withdrew the 20% welcome
// offer, and WELCOME20 is deactivated in live Stripe with 0 redemptions.
// Supersedes the dossier's Section 9 ladder (290/320/350/490 + elaborate 670);
// the elaborate dress tier is dropped -- simple designs only.
// ⚠️ DISPLAY ONLY, AS OF 2026-09-12. Nothing charges off this any more.
// `/upload` was removed and `src/lib/pricing.ts` now prices EVERY line from a
// real catalogue slug, so this ladder is read by `/faq` and nowhere else.
// Keep it true anyway -- it is a published price list.
// It sat at 389/419/429/619 from 2026-08-26 to 2026-09-12 while the catalogue
// below moved to 449/519 on 2026-09-08 -- so an uploaded shirt was sold at 389
// and uploaded trousers at 429, 60 and 90 AED under the same garment bought
// from the catalogue, and the FAQ published the old ladder as fact.
// KEEP THESE IN STEP WITH THE ITEMS BELOW. A price lives in exactly two places
// in this file and they must agree.
export const BASE_PRICE_BY_CATEGORY: Record<CatalogItem["category"], number> = {
  Shirt: 449,
  Skirt: 449, // no skirt ships yet; less cloth than a shirt, more stitching, so it lands on the same number
  Pants: 519,
  Dress: 599, // ⚠️ NO DRESS AT LAUNCH. Founder, 2026-09-12: abayas only. The entry stays
              // because removing it is churn; nothing is photographed, priced or listed.
  Abaya: 699, // ✅ QUOTED AND SETTLED, and the founder set the shelf price at 699 on
              // 2026-09-14: "we need to keep the price below 700 I feel, maybe we will
              // not make the same margins as the other items but it's okay". At 3.5m of
              // cloth that is ~56%, against ~58% on the shirt, and at 3.0m it is ~58.7%,
              // so the give is at most two points for sitting under a round number.
              // ⏳ METRES ARE STILL AN ESTIMATE. 3.5m is a reasoned guess at 138cm
              // width; the tailor's sample settles it, and every 0.5m is ~50 AED.
              // The tailor quoted 80-90 for a dress AND an abaya on
              // 2026-09-12; modelled at 90, the worse end, which puts 699 at ~57% -- the
              // strongest margin in the range. The earlier "assumes 100, not quoted" note
              // was stale by a day. ⏳ THE GILET IS NOW THE ONLY UNQUOTED NUMBER.
              // ⚠️ This price is PUBLISHED in the journal article
              // "how-much-does-an-abaya-cost-in-dubai". Change one, change both.
};

// ⚠️ NAMES ARE PLAIN AND DESCRIPTIVE ON PURPOSE, AND THAT WAS CHECKED RATHER
// THAN ASSUMED. Renamed 2026-09-20 after the founder asked whether the naming
// could be "more fancy".
//
// Invented per-garment names were proposed (Layla Abaya, Noor Shirt) and she
// rejected them on sight: "it feels random". She was right -- they were, and
// the brands this range is compared to do the opposite. Toteme sells "Linen
// Dress" and "Linen Tent Dress", The Row "cashmere wool tank dress", COS the
// same. Invented names belong to a different tier and are earned over decades
// (the Birkin, the 2.55); applied at launch they read as trying.
//
// Putting the MATERIAL in every name was proposed next, which is what those
// brands actually do, and she killed that too: "ours is all linen so doesn't
// make sense to add linen to every one". Also right -- Toteme names the
// material because it sells wool and silk as well. Everything here is linen,
// so the word carries no information.
//
// WHAT CHANGED, and every one is the garment's OWN descriptor rather than a
// style reference:
//   Pants -> Trousers on all four. UAE follows British English, and "pants"
//     reads as underwear to a large share of the market.
//   Banded -> Cuffed Trousers        (its descriptor already said "cuffed hem")
//   Utility -> Tie-Waist Shirt       ("chest pockets, tie waist")
//   Structured -> Peplum Blouse      it IS a peplum -- checked against the
//     photograph, not the old name. "Structured" also fought the product: the
//     cloth is soft 145gsm linen and nothing about it is structured.
//
// ⚠️ SLUGS DID NOT CHANGE, deliberately. /design/banded-trousers still resolves
// and keeps its search history; renaming a URL throws that away for nothing.
// So slug and name now disagree on three items, and that is intended.
export const catalog: CatalogItem[] = [
  {
    slug: "oversized-shirt",
    name: "Oversized Shirt",
    category: "Shirt",
    price: 449,
    descriptor: "Relaxed fit",
    badge: "TRENDING",
    gradient: ["#f5f0e8", "#e8e4dc"],
    image: "/catalog/oversized-shirt/oversized-shirt-front.jpg",
    backImage: "/catalog/oversized-shirt/oversized-shirt-back-v2.jpg",
    colorImages: {
      Ivory: { front: "/catalog/oversized-shirt/oversized-shirt-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-back-v2.jpg" },
      White: { front: "/catalog/oversized-shirt/oversized-shirt-white-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-white-back-v2.jpg" },
      Navy: { front: "/catalog/oversized-shirt/oversized-shirt-navy-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-navy-back-v2.jpg" },
      Burgundy: { front: "/catalog/oversized-shirt/oversized-shirt-burgundy-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-burgundy-back-v2.jpg" },
    },
    // Pilot for real per-combo rendering (Sleeves x Length) -- see
    // [[project_shaklek_customization_params]] and parameterSliders.ts.
    // "long:normal" isn't generated -- it's identical to colorImages above.
    comboImages: {
      Ivory: {
        "short:normal": { front: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-normal-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-long-longer-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-longer-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-longer-back-v2.jpg" },
      },
      White: {
        "short:normal": { front: "/catalog/oversized-shirt/oversized-shirt-white-combo-short-normal-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-white-combo-short-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/oversized-shirt/oversized-shirt-white-combo-long-longer-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-white-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/oversized-shirt/oversized-shirt-white-combo-short-longer-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-white-combo-short-longer-back-v2.jpg" },
      },
      Navy: {
        "short:normal": { front: "/catalog/oversized-shirt/oversized-shirt-navy-combo-short-normal-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-navy-combo-short-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/oversized-shirt/oversized-shirt-navy-combo-long-longer-front-v2.jpg", back: "/catalog/oversized-shirt/oversized-shirt-navy-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/oversized-shirt/oversized-shirt-navy-combo-short-longer-front-v3.jpg", back: "/catalog/oversized-shirt/oversized-shirt-navy-combo-short-longer-back-v3.jpg" },
      },
      Burgundy: {
        "short:normal": { front: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-short-normal-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-short-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-long-longer-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-short-longer-front.jpg", back: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-short-longer-back-v2.jpg" },
      },
    },
  },
  {
    slug: "wide-leg-trousers",
    name: "Wide-leg Trousers",
    category: "Pants",
    price: 519,
    descriptor: "High waist",
    gradient: ["#ede8e4", "#e0dcd8"],
    image: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-cropped-front-v2.jpg",
    backImage: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-cropped-back-v2.jpg",
    colorImages: {
      Ivory: { front: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-back-v2.jpg" },
      White: { front: "/catalog/wide-leg-trousers/wide-leg-trousers-white-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-white-back-v2.jpg" },
      Navy: { front: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-front-v3.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-back-v2.jpg" },
      Burgundy: { front: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-front.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-back-v2.jpg" },
    },
    // "wide:full" isn't generated -- it's identical to colorImages above.
    // Navy and Ivory are the generated masters; Burgundy/White are derived
    // from them by recolour and not wired up yet.
    comboImages: {
      Ivory: {
        "straight:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-straight-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-full-front-v3.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-full-back-v3.jpg" },
        "wide:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-cropped-back-v2.jpg" },
      },
      Burgundy: {
        "straight:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-straight-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-wide-full-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-wide-full-back-v2.jpg" },
        "wide:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-wide-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-wide-cropped-back-v2.jpg" },
      },
      White: {
        "straight:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-straight-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-wide-full-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-wide-full-back-v2.jpg" },
        "wide:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-wide-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-wide-cropped-back-v2.jpg" },
      },
      Navy: {
        "straight:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-straight-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-wide-full-front-v3.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-wide-full-back-v3.jpg" },
        "wide:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-wide-cropped-front-v3.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-wide-cropped-back-v3.jpg" },
      },
    },
    defaultChanges: { leg_width: "wide", garment_length: "cropped" },
  },
  {
    slug: "structured-blouse",
    name: "Peplum Blouse",
    category: "Shirt",
    price: 449,
    descriptor: "Minimal dart",
    gradient: ["#efeae4", "#e2ded8"],
    image: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-front.jpg",
    backImage: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-back.jpg",
    colorImages: {
      Ivory: { front: "/catalog/structured-blouse/structured-blouse-front.jpg", back: "/catalog/structured-blouse/structured-blouse-back.jpg" },
      White: { front: "/catalog/structured-blouse/structured-blouse-white-front-v2.jpg", back: "/catalog/structured-blouse/structured-blouse-white-back.jpg" },
      Navy: { front: "/catalog/structured-blouse/structured-blouse-navy-front.jpg", back: "/catalog/structured-blouse/structured-blouse-navy-back.jpg" },
      Burgundy: { front: "/catalog/structured-blouse/structured-blouse-burgundy-front-v2.jpg", back: "/catalog/structured-blouse/structured-blouse-burgundy-back.jpg" },
    },
    // "short:normal" isn't generated -- it's identical to colorImages above
    // (the existing photo's half sleeve is the "short" option for this item).
    comboImages: {
      Ivory: {
        "long:normal": { front: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-front.jpg", back: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-back.jpg" },
        "long:longer": { front: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-longer-front.jpg", back: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-longer-back.jpg" },
        "short:longer": { front: "/catalog/structured-blouse/structured-blouse-ivory-combo-short-longer-front.jpg", back: "/catalog/structured-blouse/structured-blouse-ivory-combo-short-longer-back.jpg" },
      },
      White: {
        "long:normal": { front: "/catalog/structured-blouse/structured-blouse-white-combo-long-normal-front-v2.jpg", back: "/catalog/structured-blouse/structured-blouse-white-combo-long-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/structured-blouse/structured-blouse-white-combo-long-longer-front-v2.jpg", back: "/catalog/structured-blouse/structured-blouse-white-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/structured-blouse/structured-blouse-white-combo-short-longer-front.jpg", back: "/catalog/structured-blouse/structured-blouse-white-combo-short-longer-back.jpg" },
      },
      Navy: {
        "long:normal": { front: "/catalog/structured-blouse/structured-blouse-navy-combo-long-normal-front.jpg", back: "/catalog/structured-blouse/structured-blouse-navy-combo-long-normal-back.jpg" },
        "long:longer": { front: "/catalog/structured-blouse/structured-blouse-navy-combo-long-longer-front.jpg", back: "/catalog/structured-blouse/structured-blouse-navy-combo-long-longer-back.jpg" },
        "short:longer": { front: "/catalog/structured-blouse/structured-blouse-navy-combo-short-longer-front.jpg", back: "/catalog/structured-blouse/structured-blouse-navy-combo-short-longer-back.jpg" },
      },
      Burgundy: {
        "long:normal": { front: "/catalog/structured-blouse/structured-blouse-burgundy-combo-long-normal-front.jpg", back: "/catalog/structured-blouse/structured-blouse-burgundy-combo-long-normal-back.jpg" },
        "long:longer": { front: "/catalog/structured-blouse/structured-blouse-burgundy-combo-long-longer-front.jpg", back: "/catalog/structured-blouse/structured-blouse-burgundy-combo-long-longer-back.jpg" },
        "short:longer": { front: "/catalog/structured-blouse/structured-blouse-burgundy-combo-short-longer-front.jpg", back: "/catalog/structured-blouse/structured-blouse-burgundy-combo-short-longer-back.jpg" },
      },
    },
    // The base photo is a half sleeve, not SHIRT_PARAMS' "long" default.
  },
  {
    slug: "banded-trousers",
    name: "Cuffed Trousers",
    category: "Pants",
    price: 519,
    descriptor: "Tailored, cuffed hem",
    gradient: ["#f0ece4", "#e2ddd4"],
    image: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-cropped-front.jpg",
    backImage: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-cropped-back.jpg",
    colorImages: {
      Ivory: { front: "/catalog/banded-trousers/banded-trousers-ivory-front-v2.jpg", back: "/catalog/banded-trousers/banded-trousers-ivory-back-v2.jpg" },
      White: { front: "/catalog/banded-trousers/banded-trousers-white-front-v2.jpg", back: "/catalog/banded-trousers/banded-trousers-white-back-v2.jpg" },
      Navy: { front: "/catalog/banded-trousers/banded-trousers-navy-front.jpg", back: "/catalog/banded-trousers/banded-trousers-navy-back-v2.jpg" },
      Burgundy: { front: "/catalog/banded-trousers/banded-trousers-burgundy-front-v2.jpg", back: "/catalog/banded-trousers/banded-trousers-burgundy-back-v2.jpg" },
    },
    comboImages: {
      Ivory: {
        "straight:cropped": { front: "/catalog/banded-trousers/banded-trousers-ivory-combo-straight-cropped-front.jpg", back: "/catalog/banded-trousers/banded-trousers-ivory-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-full-front.jpg", back: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-cropped-front.jpg", back: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-cropped-back.jpg" },
      },
      White: {
        "straight:cropped": { front: "/catalog/banded-trousers/banded-trousers-white-combo-straight-cropped-front.jpg", back: "/catalog/banded-trousers/banded-trousers-white-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/banded-trousers/banded-trousers-white-combo-wide-full-front.jpg", back: "/catalog/banded-trousers/banded-trousers-white-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/banded-trousers/banded-trousers-white-combo-wide-cropped-front.jpg", back: "/catalog/banded-trousers/banded-trousers-white-combo-wide-cropped-back.jpg" },
      },
      Navy: {
        "straight:cropped": { front: "/catalog/banded-trousers/banded-trousers-navy-combo-straight-cropped-front.jpg", back: "/catalog/banded-trousers/banded-trousers-navy-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-full-front.jpg", back: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-cropped-front.jpg", back: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-cropped-back.jpg" },
      },
      Burgundy: {
        "straight:cropped": { front: "/catalog/banded-trousers/banded-trousers-burgundy-combo-straight-cropped-front.jpg", back: "/catalog/banded-trousers/banded-trousers-burgundy-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/banded-trousers/banded-trousers-burgundy-combo-wide-full-front.jpg", back: "/catalog/banded-trousers/banded-trousers-burgundy-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/banded-trousers/banded-trousers-burgundy-combo-wide-cropped-front.jpg", back: "/catalog/banded-trousers/banded-trousers-burgundy-combo-wide-cropped-back.jpg" },
      },
    },
    defaultChanges: { leg_width: "wide", garment_length: "cropped" },
  },
  {
    slug: "wrap-top",
    name: "Wrap Top",
    category: "Shirt",
    price: 449,
    descriptor: "Soft drape, tie waist",
    badge: "NEW",
    gradient: ["#f2ede4", "#e6e0d6"],
    image: "/catalog/wrap-top/wrap-top-ivory-combo-long-normal-front-v2.jpg",
    backImage: "/catalog/wrap-top/wrap-top-ivory-back-v4.jpg",
    colorImages: {
      Ivory: { front: "/catalog/wrap-top/wrap-top-ivory-front-v4.jpg", back: "/catalog/wrap-top/wrap-top-ivory-back-v4.jpg" },
      White: { front: "/catalog/wrap-top/wrap-top-white-front-v4.jpg", back: "/catalog/wrap-top/wrap-top-white-back-v4.jpg" },
      Navy: { front: "/catalog/wrap-top/wrap-top-navy-front-v4.jpg", back: "/catalog/wrap-top/wrap-top-navy-back-v4.jpg" },
      Burgundy: { front: "/catalog/wrap-top/wrap-top-burgundy-front-v4.jpg", back: "/catalog/wrap-top/wrap-top-burgundy-back-v4.jpg" },
    },
    // "short:normal" isn't generated -- it's identical to colorImages above
    // (the existing photo's short sleeve is the "short" option for this item).
    comboImages: {
      Ivory: {
        "long:normal": { front: "/catalog/wrap-top/wrap-top-ivory-combo-long-normal-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-ivory-back-v4.jpg" },
        "long:longer": { front: "/catalog/wrap-top/wrap-top-ivory-combo-long-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-ivory-combo-long-longer-back-v3.jpg" },
        "short:longer": { front: "/catalog/wrap-top/wrap-top-ivory-combo-short-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-ivory-combo-short-longer-back-v3.jpg" },
      },
      White: {
        "long:normal": { front: "/catalog/wrap-top/wrap-top-white-combo-long-normal-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-white-back-v4.jpg" },
        "long:longer": { front: "/catalog/wrap-top/wrap-top-white-combo-long-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-white-combo-long-longer-back-v3.jpg" },
        "short:longer": { front: "/catalog/wrap-top/wrap-top-white-combo-short-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-white-combo-short-longer-back-v3.jpg" },
      },
      Navy: {
        "long:normal": { front: "/catalog/wrap-top/wrap-top-navy-combo-long-normal-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-navy-back-v4.jpg" },
        "long:longer": { front: "/catalog/wrap-top/wrap-top-navy-combo-long-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-navy-combo-long-longer-back-v4.jpg" },
        "short:longer": { front: "/catalog/wrap-top/wrap-top-navy-combo-short-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-navy-combo-short-longer-back-v4.jpg" },
      },
      Burgundy: {
        "long:normal": { front: "/catalog/wrap-top/wrap-top-burgundy-combo-long-normal-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-burgundy-back-v4.jpg" },
        "long:longer": { front: "/catalog/wrap-top/wrap-top-burgundy-combo-long-longer-front-v3.jpg", back: "/catalog/wrap-top/wrap-top-burgundy-combo-long-longer-back-v3.jpg" },
        "short:longer": { front: "/catalog/wrap-top/wrap-top-burgundy-combo-short-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-burgundy-combo-short-longer-back-v3.jpg" },
      },
    },
    // The base photo is a short sleeve, not SHIRT_PARAMS' "long" default.
  },
  {
    slug: "pleated-trousers",
    name: "Pleated Trousers",
    category: "Pants",
    price: 519,
    descriptor: "Relaxed leg, pleated",
    badge: "NEW",
    gradient: ["#efe9df", "#e2ddd2"],
    image: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-cropped-front.jpg",
    backImage: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-cropped-back-v2.jpg",
    colorImages: {
      Ivory: { front: "/catalog/pleated-trousers/pleated-trousers-ivory-front-v3.jpg", back: "/catalog/pleated-trousers/pleated-trousers-ivory-back-v3.jpg" },
      White: { front: "/catalog/pleated-trousers/pleated-trousers-white-front-v3.jpg", back: "/catalog/pleated-trousers/pleated-trousers-white-back-v3.jpg" },
      Navy: { front: "/catalog/pleated-trousers/pleated-trousers-navy-front-v3.jpg", back: "/catalog/pleated-trousers/pleated-trousers-navy-back-v2.jpg" },
      Burgundy: { front: "/catalog/pleated-trousers/pleated-trousers-burgundy-front-v2.jpg", back: "/catalog/pleated-trousers/pleated-trousers-burgundy-back-v2.jpg" },
    },
    comboImages: {
      Ivory: {
        "straight:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-straight-cropped-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-full-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-full-back-v2.jpg" },
        "wide:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-cropped-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-cropped-back-v2.jpg" },
      },
      White: {
        "straight:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-white-combo-straight-cropped-front-v2.jpg", back: "/catalog/pleated-trousers/pleated-trousers-white-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/pleated-trousers/pleated-trousers-white-combo-wide-full-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-white-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-white-combo-wide-cropped-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-white-combo-wide-cropped-back.jpg" },
      },
      Navy: {
        "straight:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-navy-combo-straight-cropped-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-navy-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/pleated-trousers/pleated-trousers-navy-combo-wide-full-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-navy-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-navy-combo-wide-cropped-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-navy-combo-wide-cropped-back.jpg" },
      },
      Burgundy: {
        "straight:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-straight-cropped-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-wide-full-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-wide-cropped-front.jpg", back: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-wide-cropped-back.jpg" },
      },
    },
    defaultChanges: { leg_width: "wide", garment_length: "cropped" },
  },
  {
    slug: "cargo-trousers",
    name: "Cargo Trousers",
    category: "Pants",
    price: 519,
    descriptor: "Wide leg, side pockets",
    badge: "NEW",
    gradient: ["#e9e2d2", "#ddd3bd"],
    image: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-full-front.jpg",
    backImage: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-full-back.jpg",
    colorImages: {
      Navy: { front: "/catalog/cargo-trousers/cargo-trousers-navy-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-navy-back-v4.jpg" },
      Ivory: { front: "/catalog/cargo-trousers/cargo-trousers-ivory-front-v2.jpg", back: "/catalog/cargo-trousers/cargo-trousers-ivory-back-v3.jpg" },
      Burgundy: { front: "/catalog/cargo-trousers/cargo-trousers-burgundy-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-burgundy-back-v3.jpg" },
      White: { front: "/catalog/cargo-trousers/cargo-trousers-white-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-white-back-v5.jpg" },
    },
    comboImages: {
      Navy: {
        "straight:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-navy-combo-straight-cropped-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-navy-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/cargo-trousers/cargo-trousers-navy-combo-wide-full-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-navy-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-navy-combo-wide-cropped-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-navy-combo-wide-cropped-back.jpg" },
      },
      Ivory: {
        "straight:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-straight-cropped-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-full-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-cropped-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-cropped-back.jpg" },
      },
      Burgundy: {
        "straight:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-straight-cropped-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-straight-cropped-back.jpg" },
        "wide:full": { front: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-wide-full-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-wide-cropped-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-wide-cropped-back.jpg" },
      },
      White: {
        "straight:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-white-combo-straight-cropped-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-white-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/cargo-trousers/cargo-trousers-white-combo-wide-full-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-white-combo-wide-full-back.jpg" },
        "wide:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-white-combo-wide-cropped-front.jpg", back: "/catalog/cargo-trousers/cargo-trousers-white-combo-wide-cropped-back.jpg" },
      },
    },
    defaultChanges: { leg_width: "wide" },
  },
  {
    slug: "utility-shirt",
    name: "Tie-Waist Shirt",
    category: "Shirt",
    price: 449,
    descriptor: "Chest pockets, tie waist",
    badge: "NEW",
    gradient: ["#ede6d9", "#ddd4c4"],
    image: "/catalog/utility-shirt/utility-shirt-ivory-combo-short-longer-front-v2.jpg",
    backImage: "/catalog/utility-shirt/utility-shirt-ivory-combo-short-longer-back-v2.jpg",
    colorImages: {
      Ivory: { front: "/catalog/utility-shirt/utility-shirt-ivory-front-v4.jpg", back: "/catalog/utility-shirt/utility-shirt-ivory-back-v4.jpg" },
      White: { front: "/catalog/utility-shirt/utility-shirt-white-front-v4.jpg", back: "/catalog/utility-shirt/utility-shirt-white-back-v4.jpg" },
      Navy: { front: "/catalog/utility-shirt/utility-shirt-navy-front-v4.jpg", back: "/catalog/utility-shirt/utility-shirt-navy-back-v5.jpg" },
      Burgundy: { front: "/catalog/utility-shirt/utility-shirt-burgundy-front-v4.jpg", back: "/catalog/utility-shirt/utility-shirt-burgundy-back-v4.jpg" },
    },
    // "short:normal" isn't generated -- it's identical to colorImages above
    // (the existing photo's short sleeve + tie-waist length is the "short:normal"
    // option for this item).
    comboImages: {
      Ivory: {
        "long:normal": { front: "/catalog/utility-shirt/utility-shirt-ivory-combo-long-normal-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-ivory-combo-long-normal-back-v2.jpg" },
        "short:longer": { front: "/catalog/utility-shirt/utility-shirt-ivory-combo-short-longer-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-ivory-combo-short-longer-back-v2.jpg" },
        "long:longer": { front: "/catalog/utility-shirt/utility-shirt-ivory-combo-long-longer-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-ivory-combo-long-longer-back-v2.jpg" },
      },
      White: {
        "long:normal": { front: "/catalog/utility-shirt/utility-shirt-white-combo-long-normal-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-white-combo-long-normal-back-v2.jpg" },
        "short:longer": { front: "/catalog/utility-shirt/utility-shirt-white-combo-short-longer-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-white-combo-short-longer-back-v2.jpg" },
        "long:longer": { front: "/catalog/utility-shirt/utility-shirt-white-combo-long-longer-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-white-combo-long-longer-back-v2.jpg" },
      },
      Navy: {
        "long:normal": { front: "/catalog/utility-shirt/utility-shirt-navy-combo-long-normal-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-navy-combo-long-normal-back-v2.jpg" },
        "short:longer": { front: "/catalog/utility-shirt/utility-shirt-navy-combo-short-longer-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-navy-combo-short-longer-back-v2.jpg" },
        "long:longer": { front: "/catalog/utility-shirt/utility-shirt-navy-combo-long-longer-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-navy-combo-long-longer-back-v2.jpg" },
      },
      Burgundy: {
        "long:normal": { front: "/catalog/utility-shirt/utility-shirt-burgundy-combo-long-normal-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-burgundy-combo-long-normal-back-v2.jpg" },
        "short:longer": { front: "/catalog/utility-shirt/utility-shirt-burgundy-combo-short-longer-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-burgundy-combo-short-longer-back-v2.jpg" },
        "long:longer": { front: "/catalog/utility-shirt/utility-shirt-burgundy-combo-long-longer-front-v2.jpg", back: "/catalog/utility-shirt/utility-shirt-burgundy-combo-long-longer-back-v2.jpg" },
      },
    },
    defaultChanges: { sleeve_length: "short", garment_length: "longer" },
  },
  // ⚠️ THE ABAYA, ADDED 2026-09-19. FIRST ITEM THAT IS NOT A SHIRT OR A PAIR OF
  // TROUSERS, and the first that ships with ONE colourway.
  //
  // ⚠️ BURGUNDY ONLY, AND THAT IS DELIBERATE, NOT UNFINISHED. colorImages is a
  // Partial record and DesignCustomizer gates the colour picker on
  // Object.hasOwn(item.colorImages, name), so the customizer simply offers the
  // one colour that exists. Navy, Ivory and White get added when their
  // photography exists; nothing else has to change when they do.
  //
  // ⚠️ 699 IS NOT A NEW NUMBER. The cost article already publishes it and the
  // header of this file records it: "Today: Shirt 449, Pants 519, Abaya 699.
  // Change one, change both." It is still modelled on 3.2m of cloth that has
  // never been quoted -- see abaya-metres in planning/OPEN.md -- so if the
  // quote lands differently this price moves BEFORE the shop opens.
  //
  // ⚠️ THE DEFAULT COMBO IS maxi:narrow AND IS NOT IN comboImages. It falls
  // back to colorImages, same as every other item. The other three cells are
  // generated; see catalog-archive/2026-09-19-abaya for all 45 attempts and
  // planning/OPEN.md for what the garment actually is.
  {
    slug: "open-abaya",
    name: "Open Abaya",
    category: "Abaya",
    price: 699,
    descriptor: "Folded edge, open front",
    badge: "NEW",
    gradient: ["#f2ede4", "#e6e0d6"],
    image: "/catalog/abaya/abaya-burgundy-front-wb.jpg",
    backImage: "/catalog/abaya/abaya-burgundy-back-wb.jpg",
    colorImages: {
      Burgundy: { front: "/catalog/abaya/abaya-burgundy-front-wb.jpg", back: "/catalog/abaya/abaya-burgundy-back-wb.jpg" },
      // ⚠️ NAVY IS GENERATED, NOT PHOTOGRAPHED, and it is held to the burgundy
      // set's own measurements rather than to a description. See
      // scripts/catalog/colourways/generate-cell.mjs: each prompt is BUILT from
      // the burgundy cell it copies, so a midi cell cannot be told to reach the
      // floor -- which is exactly the mistake that cost $0.27 in bad backs.
      Navy: { front: "/catalog/abaya/abaya-navy-front.jpg", back: "/catalog/abaya/abaya-navy-back.jpg" },
    },
    comboImages: {
      Burgundy: {
        "maxi:wide": { front: "/catalog/abaya/abaya-burgundy-combo-maxi-wide-front-wb.jpg", back: "/catalog/abaya/abaya-burgundy-combo-maxi-wide-back-wb.jpg" },
        "midi:narrow": { front: "/catalog/abaya/abaya-burgundy-combo-midi-narrow-front-wb.jpg", back: "/catalog/abaya/abaya-burgundy-combo-midi-narrow-back-wb.jpg" },
        "midi:wide": { front: "/catalog/abaya/abaya-burgundy-combo-midi-wide-front-wb.jpg", back: "/catalog/abaya/abaya-burgundy-combo-midi-wide-back-wb.jpg" },
      },
      Navy: {
        "maxi:wide": { front: "/catalog/abaya/abaya-navy-combo-maxi-wide-front.jpg", back: "/catalog/abaya/abaya-navy-combo-maxi-wide-back.jpg" },
        "midi:narrow": { front: "/catalog/abaya/abaya-navy-combo-midi-narrow-front.jpg", back: "/catalog/abaya/abaya-navy-combo-midi-narrow-back.jpg" },
        "midi:wide": { front: "/catalog/abaya/abaya-navy-combo-midi-wide-front.jpg", back: "/catalog/abaya/abaya-navy-combo-midi-wide-back.jpg" },
      },
    },
    // ⚠️ THE BASE PHOTO IS maxi:narrow, NOT THE CATEGORY DEFAULT. Left off,
    // defaultChangesForCategory("Abaya") resolves to maxi:WIDE and
    // verify-catalog.mjs correctly failed the build, because the grid hero
    // then pointed at a cell that is not this photograph. The photographed
    // base is the NARROW sleeve, so it is declared here.
    //
    // ⚠️ IT RESOLVES BY `defaultIndex`, NOT by the first option -- this comment
    // claimed "the first option of each render slider" and that is wrong. Both
    // ABAYA_PARAMS sliders carry defaultIndex 1, so the default is the SECOND
    // option of each: maxi, wide. The number was right for the wrong reason,
    // and the wrong reason was copied into the Buttoned Abaya's comment before
    // anyone checked defaultChangesForCategory.
    defaultChanges: { garment_length: "maxi", sleeve_width: "narrow" },
  },
  // ⚠️ THE SECOND ABAYA, AND IT IS A DIFFERENT PRODUCT, NOT A VARIANT.
  // category stays "Abaya" for pricing and fabric, but `paramSet` sends it to
  // ABAYA_JACKET_PARAMS: this one customises LENGTH x CLOSURE, while the Open
  // Abaya customises LENGTH x SLEEVE WIDTH. Before paramKeyFor() existed the
  // sliders were keyed by category alone and these two could not coexist.
  //
  // ⚠️ CLOSURE COUNT IS NOT DECORATION, AND THE PHOTOGRAPHY DEPENDS ON IT.
  // Founder, 2026-09-19: the five-closure option "is meant for people who want
  // to cover more so we need to show that it closes properly and covers more".
  // So FOUR is photographed WORN OPEN and FIVE is photographed WORN CLOSED.
  // They are different photographs, not the same frame with an extra bar.
  //
  // ⚠️ THE BACKS ARE SHARED ACROSS CLOSURE COUNTS -- her observation, and it
  // halves the shoot. The back is one unbroken panel with no closures on it, so
  // maxi:4 and maxi:5 use the SAME back file, and so do midi:4 and midi:5.
  // Four fronts plus two backs is six photographs per colourway, not eight.
  //
  // ⚠️ IVORY ONLY, AND THE OTHER THREE COLOURWAYS ARE PHOTOSHOP. Her decision
  // the same day: navy, burgundy and white are recolours of these exact frames,
  // never new generations, so hem, pose and framing match by construction.
  {
    slug: "buttoned-abaya",
    name: "Buttoned Abaya",
    category: "Abaya",
    paramSet: "AbayaJacket",
    // 699, confirmed by the founder on 2026-09-19: "keep the same price for
    // now". Deliberately the same as the Open Abaya -- same cloth, the same
    // 3.5m in margins.mjs, the same 90 AED tailoring, and cord-and-button
    // closures that do not move the cost. It also follows her own positioning,
    // "one price per piece type, fabric and every option included": two abayas
    // at two prices invites a question the page cannot answer.
    //
    // ⚠️ "FOR NOW" IS PART OF THE ANSWER. The metres behind both abayas are
    // still modelled, never quoted -- see abaya-metres on the board -- so this
    // is a confirmed price on an unconfirmed cost, not a settled margin. When
    // the fabric is quoted, re-check both abayas together, and change this line
    // and margins.mjs in the same commit.
    price: 699,
    descriptor: "Frog closures, worn open or closed",
    badge: "NEW",
    gradient: ["#f2ede4", "#e6e0d6"],
    image: "/catalog/abaya-jacket/abaya-jacket-ivory-front-v1-wb.jpg",
    backImage: "/catalog/abaya-jacket/abaya-jacket-ivory-back-v1-wb.jpg",
    colorImages: {
      Ivory: { front: "/catalog/abaya-jacket/abaya-jacket-ivory-front-v1-wb.jpg", back: "/catalog/abaya-jacket/abaya-jacket-ivory-back-v1-wb.jpg" },
    },
    comboImages: {
      Ivory: {
        "maxi:5": { front: "/catalog/abaya-jacket/abaya-jacket-ivory-combo-maxi-5-front-v1-wb.jpg", back: "/catalog/abaya-jacket/abaya-jacket-ivory-combo-maxi-5-back-v1-wb.jpg" },
        "midi:4": { front: "/catalog/abaya-jacket/abaya-jacket-ivory-combo-midi-4-front-v1-wb.jpg", back: "/catalog/abaya-jacket/abaya-jacket-ivory-combo-midi-4-back-v1-wb.jpg" },
        "midi:5": { front: "/catalog/abaya-jacket/abaya-jacket-ivory-combo-midi-5-front-v1-wb.jpg", back: "/catalog/abaya-jacket/abaya-jacket-ivory-combo-midi-5-back-v1-wb.jpg" },
      },
    },
    // The photographed base is the LONG one worn OPEN, which is maxi:4, and
    // that is ALSO what the sliders resolve to on their own -- both
    // ABAYA_JACKET_PARAMS declare defaultIndex 1. So this line is a no-op
    // today and it is kept deliberately: reorder an option list or move a
    // defaultIndex and the resolved default silently becomes a cell nobody
    // photographed, which is how the Open Abaya broke the build on 2026-09-19.
    // Declaring the base out loud costs nothing and survives that edit.
    //
    // ⚠️ THE DEFAULT IS `defaultIndex`, NOT the first option. This comment
    // said "first option" and so did the Open Abaya's above; both were wrong
    // and the right answer only happened to agree. See defaultChangesForCategory.
    defaultChanges: { garment_length: "maxi", closure: "4" },
  },

  {
    slug: "slip-dress",
    name: "Slip Dress",
    category: "Dress",
    // ⚠️ PRICE 649, AND IT IS THE SAME ON BOTH DRESSES ON PURPOSE. Founder,
    // 2026-09-20, after the first proposal priced them 599 and 699: "why are
    // both dresses 100 aed difference???" She was right -- the real cost gap
    // is about 30 AED of tailoring on identical cloth, and the 100 came from
    // rounding each to a clean number. Both inputs are QUOTED, not estimated:
    // 2.5-3m of cloth (founder and tailor independently) and 90 to make (the
    // tailor's "abaya and dress" rate, which covers both of ours). Change one,
    // change the other, and change margins.mjs with them.
    price: 649,
    descriptor: "Sleeveless, cut to fall",
    badge: "NEW",
    gradient: ["#f5f0e8", "#e8e4dc"],
    // ⚠️ SLEEVELESS, ALWAYS, AND THERE IS NO SLEEVE SLIDER FOR A DRESS. Both
    // dresses are sleeveless on every neckline and every length.
    // ⚠️ NO POCKETS ON THIS ONE, deliberately: it is fitted straight through
    // the hip and a pocket bag in linen bulges there. The buttoned dress has
    // them because its skirt flares away from the body.
    // ⚠️ AND THE ZIP IS IN THE LEFT SIDE SEAM, invisible in every photograph,
    // so it exists only if the tailor sheet says so. Linen does not stretch.
    image: "/catalog/slip-dress/slip-dress-ivory-front-v1.jpg",
    backImage: "/catalog/slip-dress/slip-dress-ivory-back-v1.jpg",
    colorImages: {
      Ivory: { front: "/catalog/slip-dress/slip-dress-ivory-front-v1.jpg", back: "/catalog/slip-dress/slip-dress-ivory-back-v1.jpg" },
    },
    comboImages: {
      Ivory: {
        "v:maxi": { front: "/catalog/slip-dress/slip-dress-ivory-combo-v-maxi-front-v1.jpg", back: "/catalog/slip-dress/slip-dress-ivory-combo-v-maxi-back-v1.jpg" },
        "round:midi": { front: "/catalog/slip-dress/slip-dress-ivory-combo-round-midi-front-v1.jpg", back: "/catalog/slip-dress/slip-dress-ivory-combo-round-midi-back-v1.jpg" },
        "v:midi": { front: "/catalog/slip-dress/slip-dress-ivory-combo-v-midi-front-v1.jpg", back: "/catalog/slip-dress/slip-dress-ivory-combo-v-midi-back-v1.jpg" },
      },
    },
    // ⚠️ THE BACKS ARE SHARED ACROSS NECKLINES -- her call, and it is why each
    // back file is referenced twice. The back is the same plain curve whichever
    // neck the front has, so the neckline axis multiplies FRONTS ONLY: 2 fronts
    // + 1 back per length = 6 frames per colourway, not 8.
    defaultChanges: { neckline: "round", garment_length: "maxi" },
  },

  {
    slug: "buttoned-dress",
    name: "Buttoned Dress",
    category: "Dress",
    // ⚠️ PRICE 649, AND IT IS THE SAME ON BOTH DRESSES ON PURPOSE. Founder,
    // 2026-09-20, after the first proposal priced them 599 and 699: "why are
    // both dresses 100 aed difference???" She was right -- the real cost gap
    // is about 30 AED of tailoring on identical cloth, and the 100 came from
    // rounding each to a clean number. Both inputs are QUOTED, not estimated:
    // 2.5-3m of cloth (founder and tailor independently) and 90 to make (the
    // tailor's "abaya and dress" rate, which covers both of ours). Change one,
    // change the other, and change margins.mjs with them.
    price: 649,
    descriptor: "Sleeveless, buttons to the hem, with pockets",
    badge: "NEW",
    gradient: ["#f5f0e8", "#e8e4dc"],
    // ⚠️ SLEEVELESS, ALWAYS. The neckline choice is ROUND (buttons running
    // right up to the neckline) or V (a pointed shirt collar with the buttons
    // starting below the V).
    // ⚠️ POCKETS ARE STANDARD HERE, NEVER AN OPTION -- as a slider they would
    // double the shoot. The model has her hands in them in every frame,
    // because a side-seam pocket is invisible in a straight-on photograph and
    // an unseen feature is one nobody pays for.
    image: "/catalog/buttoned-dress/buttoned-dress-ivory-front-v1.jpg",
    backImage: "/catalog/buttoned-dress/buttoned-dress-ivory-back-v1.jpg",
    colorImages: {
      Ivory: { front: "/catalog/buttoned-dress/buttoned-dress-ivory-front-v1.jpg", back: "/catalog/buttoned-dress/buttoned-dress-ivory-back-v1.jpg" },
    },
    comboImages: {
      Ivory: {
        "v:maxi": { front: "/catalog/buttoned-dress/buttoned-dress-ivory-combo-v-maxi-front-v1.jpg", back: "/catalog/buttoned-dress/buttoned-dress-ivory-combo-v-maxi-back-v1.jpg" },
        "round:midi": { front: "/catalog/buttoned-dress/buttoned-dress-ivory-combo-round-midi-front-v1.jpg", back: "/catalog/buttoned-dress/buttoned-dress-ivory-combo-round-midi-back-v1.jpg" },
        "v:midi": { front: "/catalog/buttoned-dress/buttoned-dress-ivory-combo-v-midi-front-v1.jpg", back: "/catalog/buttoned-dress/buttoned-dress-ivory-combo-v-midi-back-v1.jpg" },
      },
    },
    // ⚠️ THE BACKS ARE SHARED ACROSS NECKLINES -- her call, and it is why each
    // back file is referenced twice. The back is the same plain curve whichever
    // neck the front has, so the neckline axis multiplies FRONTS ONLY: 2 fronts
    // + 1 back per length = 6 frames per colourway, not 8.
    defaultChanges: { neckline: "round", garment_length: "maxi" },
  },
];
