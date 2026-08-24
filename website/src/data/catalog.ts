export type DressTier = "standard" | "elaborate";

export type CatalogItem = {
  slug: string;
  name: string;
  category: "Shirt" | "Skirt" | "Pants" | "Dress";
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

// Pricing set 2026-08-22 from real unit costs -- see planning/pricing-todo.md
// for the model, the CAC assumptions and the capacity constraint behind it.
// Shirt 390 · Skirt 420 · Pants 450 · Dress 620 AED.
// These are LIST prices. The welcome offer (20% off a first order) is applied
// as a Stripe promotion code at checkout, never by discounting these.
// Supersedes the dossier's Section 9 ladder (290/320/350/490 + elaborate 670);
// the elaborate dress tier is dropped -- simple designs only.
// Same fixed tiers apply to uploaded designs, by category — no separate
// stylist quote needed, matching how catalog items are priced.
export const BASE_PRICE_BY_CATEGORY: Record<CatalogItem["category"], number> = {
  Shirt: 389,
  Skirt: 419,
  Pants: 429,
  Dress: 619,
};

export const catalog: CatalogItem[] = [
  {
    slug: "oversized-shirt",
    name: "Oversized Shirt",
    category: "Shirt",
    price: 389,
    descriptor: "Relaxed fit",
    badge: "TRENDING",
    gradient: ["#f5f0e8", "#e8e4dc"],
    image: "/catalog/oversized-shirt/oversized-shirt-front.png",
    backImage: "/catalog/oversized-shirt/oversized-shirt-back-v2.jpg",
    colorImages: {
      Ivory: { front: "/catalog/oversized-shirt/oversized-shirt-front.png", back: "/catalog/oversized-shirt/oversized-shirt-back-v2.jpg" },
      White: { front: "/catalog/oversized-shirt/oversized-shirt-white-front.png", back: "/catalog/oversized-shirt/oversized-shirt-white-back-v2.jpg" },
      Navy: { front: "/catalog/oversized-shirt/oversized-shirt-navy-front.png", back: "/catalog/oversized-shirt/oversized-shirt-navy-back-v2.jpg" },
      Burgundy: { front: "/catalog/oversized-shirt/oversized-shirt-burgundy-front.png", back: "/catalog/oversized-shirt/oversized-shirt-burgundy-back-v2.jpg" },
    },
    // Pilot for real per-combo rendering (Sleeves x Length) -- see
    // [[project_shaklek_customization_params]] and parameterSliders.ts.
    // "long:normal" isn't generated -- it's identical to colorImages above.
    comboImages: {
      Ivory: {
        "short:normal": { front: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-normal-front.png", back: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-long-longer-front.png", back: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-longer-front.png", back: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-longer-back-v2.jpg" },
      },
      White: {
        "short:normal": { front: "/catalog/oversized-shirt/oversized-shirt-white-combo-short-normal-front.png", back: "/catalog/oversized-shirt/oversized-shirt-white-combo-short-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/oversized-shirt/oversized-shirt-white-combo-long-longer-front.png", back: "/catalog/oversized-shirt/oversized-shirt-white-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/oversized-shirt/oversized-shirt-white-combo-short-longer-front.png", back: "/catalog/oversized-shirt/oversized-shirt-white-combo-short-longer-back-v2.jpg" },
      },
      Navy: {
        "short:normal": { front: "/catalog/oversized-shirt/oversized-shirt-navy-combo-short-normal-front.png", back: "/catalog/oversized-shirt/oversized-shirt-navy-combo-short-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/oversized-shirt/oversized-shirt-navy-combo-long-longer-front-v2.png", back: "/catalog/oversized-shirt/oversized-shirt-navy-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/oversized-shirt/oversized-shirt-navy-combo-short-longer-front-v3.png", back: "/catalog/oversized-shirt/oversized-shirt-navy-combo-short-longer-back-v3.jpg" },
      },
      Burgundy: {
        "short:normal": { front: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-short-normal-front.png", back: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-short-normal-back-v2.jpg" },
        "long:longer": { front: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-long-longer-front.png", back: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-long-longer-back-v2.jpg" },
        "short:longer": { front: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-short-longer-front.png", back: "/catalog/oversized-shirt/oversized-shirt-burgundy-combo-short-longer-back-v2.jpg" },
      },
    },
  },
  {
    slug: "wide-leg-trousers",
    name: "Wide-leg Trousers",
    category: "Pants",
    price: 429,
    descriptor: "High waist",
    gradient: ["#ede8e4", "#e0dcd8"],
    image: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-cropped-front-v2.jpg",
    backImage: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-cropped-back-v2.jpg",
    colorImages: {
      Ivory: { front: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-back-v2.jpg" },
      White: { front: "/catalog/wide-leg-trousers/wide-leg-trousers-white-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-white-back-v2.jpg" },
      Navy: { front: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-front-v3.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-back-v2.jpg" },
      Burgundy: { front: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-front.png", back: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-back-v2.jpg" },
    },
    // "wide:full" isn't generated -- it's identical to colorImages above.
    // Navy and Ivory are the generated masters; Burgundy/White are derived
    // from them by recolour and not wired up yet.
    comboImages: {
      Ivory: {
        "straight:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-straight-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-full-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-full-back-v2.jpg" },
        "wide:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-wide-cropped-back-v2.jpg" },
      },
      Burgundy: {
        "straight:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-straight-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-wide-full-front.png", back: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-wide-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-burgundy-combo-wide-cropped-back-v2.jpg" },
      },
      White: {
        "straight:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-straight-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-wide-full-front.png", back: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-wide-full-back-v2.jpg" },
        "wide:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-wide-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-white-combo-wide-cropped-back-v2.jpg" },
      },
      Navy: {
        "straight:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-straight-cropped-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-wide-full-front-v2.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-wide-full-back-v2.png" },
        "wide:cropped": { front: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-wide-cropped-front-v3.jpg", back: "/catalog/wide-leg-trousers/wide-leg-trousers-navy-combo-wide-cropped-back-v3.jpg" },
      },
    },
    defaultChanges: { leg_width: "wide", garment_length: "cropped" },
  },
  {
    slug: "structured-blouse",
    name: "Structured Blouse",
    category: "Shirt",
    price: 389,
    descriptor: "Minimal dart",
    gradient: ["#efeae4", "#e2ded8"],
    image: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-front.png",
    backImage: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-back.png",
    colorImages: {
      Ivory: { front: "/catalog/structured-blouse/structured-blouse-front.png", back: "/catalog/structured-blouse/structured-blouse-back.png" },
      White: { front: "/catalog/structured-blouse/structured-blouse-white-front-v2.png", back: "/catalog/structured-blouse/structured-blouse-white-back.png" },
      Navy: { front: "/catalog/structured-blouse/structured-blouse-navy-front.png", back: "/catalog/structured-blouse/structured-blouse-navy-back.png" },
      Burgundy: { front: "/catalog/structured-blouse/structured-blouse-burgundy-front-v2.png", back: "/catalog/structured-blouse/structured-blouse-burgundy-back.png" },
    },
    // "short:normal" isn't generated -- it's identical to colorImages above
    // (the existing photo's half sleeve is the "short" option for this item).
    comboImages: {
      Ivory: {
        "long:normal": { front: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-front.png", back: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-back.png" },
        "long:longer": { front: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-longer-front.png", back: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/structured-blouse/structured-blouse-ivory-combo-short-longer-front.png", back: "/catalog/structured-blouse/structured-blouse-ivory-combo-short-longer-back.png" },
      },
      White: {
        "long:normal": { front: "/catalog/structured-blouse/structured-blouse-white-combo-long-normal-front-v2.png", back: "/catalog/structured-blouse/structured-blouse-white-combo-long-normal-back-v2.png" },
        "long:longer": { front: "/catalog/structured-blouse/structured-blouse-white-combo-long-longer-front-v2.png", back: "/catalog/structured-blouse/structured-blouse-white-combo-long-longer-back-v2.png" },
        "short:longer": { front: "/catalog/structured-blouse/structured-blouse-white-combo-short-longer-front.png", back: "/catalog/structured-blouse/structured-blouse-white-combo-short-longer-back.png" },
      },
      Navy: {
        "long:normal": { front: "/catalog/structured-blouse/structured-blouse-navy-combo-long-normal-front.png", back: "/catalog/structured-blouse/structured-blouse-navy-combo-long-normal-back.png" },
        "long:longer": { front: "/catalog/structured-blouse/structured-blouse-navy-combo-long-longer-front.png", back: "/catalog/structured-blouse/structured-blouse-navy-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/structured-blouse/structured-blouse-navy-combo-short-longer-front.png", back: "/catalog/structured-blouse/structured-blouse-navy-combo-short-longer-back.png" },
      },
      Burgundy: {
        "long:normal": { front: "/catalog/structured-blouse/structured-blouse-burgundy-combo-long-normal-front.png", back: "/catalog/structured-blouse/structured-blouse-burgundy-combo-long-normal-back.png" },
        "long:longer": { front: "/catalog/structured-blouse/structured-blouse-burgundy-combo-long-longer-front.png", back: "/catalog/structured-blouse/structured-blouse-burgundy-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/structured-blouse/structured-blouse-burgundy-combo-short-longer-front.png", back: "/catalog/structured-blouse/structured-blouse-burgundy-combo-short-longer-back.png" },
      },
    },
    // The base photo is a half sleeve, not SHIRT_PARAMS' "long" default.
  },
  {
    slug: "banded-trousers",
    name: "Banded Trousers",
    category: "Pants",
    price: 429,
    descriptor: "Tailored, cuffed hem",
    gradient: ["#f0ece4", "#e2ddd4"],
    image: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-cropped-front.png",
    backImage: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-cropped-back.png",
    colorImages: {
      Ivory: { front: "/catalog/banded-trousers/banded-trousers-ivory-front-v2.png", back: "/catalog/banded-trousers/banded-trousers-ivory-back-v2.png" },
      White: { front: "/catalog/banded-trousers/banded-trousers-white-front-v2.png", back: "/catalog/banded-trousers/banded-trousers-white-back-v2.png" },
      Navy: { front: "/catalog/banded-trousers/banded-trousers-navy-front.png", back: "/catalog/banded-trousers/banded-trousers-navy-back-v2.png" },
      Burgundy: { front: "/catalog/banded-trousers/banded-trousers-burgundy-front-v2.png", back: "/catalog/banded-trousers/banded-trousers-burgundy-back-v2.png" },
    },
    comboImages: {
      Ivory: {
        "straight:cropped": { front: "/catalog/banded-trousers/banded-trousers-ivory-combo-straight-cropped-front.png", back: "/catalog/banded-trousers/banded-trousers-ivory-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-full-front.png", back: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-cropped-front.png", back: "/catalog/banded-trousers/banded-trousers-ivory-combo-wide-cropped-back.png" },
      },
      White: {
        "straight:cropped": { front: "/catalog/banded-trousers/banded-trousers-white-combo-straight-cropped-front.png", back: "/catalog/banded-trousers/banded-trousers-white-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/banded-trousers/banded-trousers-white-combo-wide-full-front.png", back: "/catalog/banded-trousers/banded-trousers-white-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/banded-trousers/banded-trousers-white-combo-wide-cropped-front.png", back: "/catalog/banded-trousers/banded-trousers-white-combo-wide-cropped-back.png" },
      },
      Navy: {
        "straight:cropped": { front: "/catalog/banded-trousers/banded-trousers-navy-combo-straight-cropped-front.png", back: "/catalog/banded-trousers/banded-trousers-navy-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-full-front.png", back: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-cropped-front.png", back: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-cropped-back.png" },
      },
      Burgundy: {
        "straight:cropped": { front: "/catalog/banded-trousers/banded-trousers-burgundy-combo-straight-cropped-front.png", back: "/catalog/banded-trousers/banded-trousers-burgundy-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/banded-trousers/banded-trousers-burgundy-combo-wide-full-front.png", back: "/catalog/banded-trousers/banded-trousers-burgundy-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/banded-trousers/banded-trousers-burgundy-combo-wide-cropped-front.png", back: "/catalog/banded-trousers/banded-trousers-burgundy-combo-wide-cropped-back.png" },
      },
    },
    defaultChanges: { leg_width: "wide", garment_length: "cropped" },
  },
  {
    slug: "wrap-top",
    name: "Wrap Top",
    category: "Shirt",
    price: 389,
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
        "long:longer": { front: "/catalog/wrap-top/wrap-top-burgundy-combo-long-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-burgundy-combo-long-longer-back-v3.jpg" },
        "short:longer": { front: "/catalog/wrap-top/wrap-top-burgundy-combo-short-longer-front-v2.jpg", back: "/catalog/wrap-top/wrap-top-burgundy-combo-short-longer-back-v3.jpg" },
      },
    },
    // The base photo is a short sleeve, not SHIRT_PARAMS' "long" default.
  },
  {
    slug: "pleated-trousers",
    name: "Pleated Trousers",
    category: "Pants",
    price: 429,
    descriptor: "Relaxed leg, pleated",
    badge: "NEW",
    gradient: ["#efe9df", "#e2ddd2"],
    image: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-cropped-front.png",
    backImage: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-cropped-back-v2.jpg",
    colorImages: {
      Ivory: { front: "/catalog/pleated-trousers/pleated-trousers-ivory-front-v3.png", back: "/catalog/pleated-trousers/pleated-trousers-ivory-back-v3.jpg" },
      White: { front: "/catalog/pleated-trousers/pleated-trousers-white-front-v3.jpg", back: "/catalog/pleated-trousers/pleated-trousers-white-back-v3.jpg" },
      Navy: { front: "/catalog/pleated-trousers/pleated-trousers-navy-front-v3.png", back: "/catalog/pleated-trousers/pleated-trousers-navy-back-v2.png" },
      Burgundy: { front: "/catalog/pleated-trousers/pleated-trousers-burgundy-front-v2.png", back: "/catalog/pleated-trousers/pleated-trousers-burgundy-back-v2.png" },
    },
    comboImages: {
      Ivory: {
        "straight:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-straight-cropped-front.png", back: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-full-front.png", back: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-full-back-v2.jpg" },
        "wide:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-cropped-front.png", back: "/catalog/pleated-trousers/pleated-trousers-ivory-combo-wide-cropped-back-v2.jpg" },
      },
      White: {
        "straight:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-white-combo-straight-cropped-front-v2.jpg", back: "/catalog/pleated-trousers/pleated-trousers-white-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/pleated-trousers/pleated-trousers-white-combo-wide-full-front.png", back: "/catalog/pleated-trousers/pleated-trousers-white-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-white-combo-wide-cropped-front.png", back: "/catalog/pleated-trousers/pleated-trousers-white-combo-wide-cropped-back.png" },
      },
      Navy: {
        "straight:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-navy-combo-straight-cropped-front.png", back: "/catalog/pleated-trousers/pleated-trousers-navy-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/pleated-trousers/pleated-trousers-navy-combo-wide-full-front.png", back: "/catalog/pleated-trousers/pleated-trousers-navy-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-navy-combo-wide-cropped-front.png", back: "/catalog/pleated-trousers/pleated-trousers-navy-combo-wide-cropped-back.png" },
      },
      Burgundy: {
        "straight:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-straight-cropped-front.png", back: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-wide-full-front.png", back: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-wide-cropped-front.png", back: "/catalog/pleated-trousers/pleated-trousers-burgundy-combo-wide-cropped-back.png" },
      },
    },
    defaultChanges: { leg_width: "wide", garment_length: "cropped" },
  },
  {
    slug: "cargo-trousers",
    name: "Cargo Trousers",
    category: "Pants",
    price: 429,
    descriptor: "Wide leg, side pockets",
    badge: "NEW",
    gradient: ["#e9e2d2", "#ddd3bd"],
    image: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-full-front.png",
    backImage: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-full-back.png",
    colorImages: {
      Navy: { front: "/catalog/cargo-trousers/cargo-trousers-navy-front.png", back: "/catalog/cargo-trousers/cargo-trousers-navy-back-v4.png" },
      Ivory: { front: "/catalog/cargo-trousers/cargo-trousers-ivory-front-v2.png", back: "/catalog/cargo-trousers/cargo-trousers-ivory-back-v3.png" },
      Burgundy: { front: "/catalog/cargo-trousers/cargo-trousers-burgundy-front.png", back: "/catalog/cargo-trousers/cargo-trousers-burgundy-back-v3.png" },
      White: { front: "/catalog/cargo-trousers/cargo-trousers-white-front.png", back: "/catalog/cargo-trousers/cargo-trousers-white-back-v5.jpg" },
    },
    comboImages: {
      Navy: {
        "straight:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-navy-combo-straight-cropped-front.png", back: "/catalog/cargo-trousers/cargo-trousers-navy-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/cargo-trousers/cargo-trousers-navy-combo-wide-full-front.png", back: "/catalog/cargo-trousers/cargo-trousers-navy-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-navy-combo-wide-cropped-front.png", back: "/catalog/cargo-trousers/cargo-trousers-navy-combo-wide-cropped-back.png" },
      },
      Ivory: {
        "straight:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-straight-cropped-front.png", back: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-full-front.png", back: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-cropped-front.png", back: "/catalog/cargo-trousers/cargo-trousers-ivory-combo-wide-cropped-back.png" },
      },
      Burgundy: {
        "straight:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-straight-cropped-front.png", back: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-straight-cropped-back.png" },
        "wide:full": { front: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-wide-full-front.png", back: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-wide-cropped-front.png", back: "/catalog/cargo-trousers/cargo-trousers-burgundy-combo-wide-cropped-back.png" },
      },
      White: {
        "straight:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-white-combo-straight-cropped-front.png", back: "/catalog/cargo-trousers/cargo-trousers-white-combo-straight-cropped-back-v2.jpg" },
        "wide:full": { front: "/catalog/cargo-trousers/cargo-trousers-white-combo-wide-full-front.png", back: "/catalog/cargo-trousers/cargo-trousers-white-combo-wide-full-back.png" },
        "wide:cropped": { front: "/catalog/cargo-trousers/cargo-trousers-white-combo-wide-cropped-front.png", back: "/catalog/cargo-trousers/cargo-trousers-white-combo-wide-cropped-back.png" },
      },
    },
    defaultChanges: { leg_width: "wide" },
  },
  {
    slug: "utility-shirt",
    name: "Utility Shirt",
    category: "Shirt",
    price: 389,
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
];
