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

// Pricing locked from the Shaklek business dossier (Section 9):
// Shirt 290 · Skirt 320 · Pants 350 · Dress 490 · Dress — Elaborate ~670 AED
// Same fixed tiers apply to uploaded designs, by category — no separate
// stylist quote needed, matching how catalog items are priced.
export const BASE_PRICE_BY_CATEGORY: Record<CatalogItem["category"], number> = {
  Shirt: 290,
  Skirt: 320,
  Pants: 350,
  Dress: 490,
};

export const catalog: CatalogItem[] = [
  {
    slug: "oversized-shirt",
    name: "Oversized Shirt",
    category: "Shirt",
    price: 290,
    descriptor: "Relaxed fit",
    badge: "TRENDING",
    gradient: ["#f5f0e8", "#e8e4dc"],
    image: "/catalog/oversized-shirt-front.png",
    backImage: "/catalog/oversized-shirt-back.png",
    colorImages: {
      Ivory: { front: "/catalog/oversized-shirt-front.png", back: "/catalog/oversized-shirt-back.png" },
      White: { front: "/catalog/oversized-shirt-white-front.png", back: "/catalog/oversized-shirt-white-back.png" },
      Navy: { front: "/catalog/oversized-shirt-navy-front.png", back: "/catalog/oversized-shirt-navy-back.png" },
      Burgundy: { front: "/catalog/oversized-shirt-burgundy-front.png", back: "/catalog/oversized-shirt-burgundy-back.png" },
    },
    // Pilot for real per-combo rendering (Sleeves x Length) -- see
    // [[project_shaklek_customization_params]] and parameterSliders.ts.
    // "long:normal" isn't generated -- it's identical to colorImages above.
    comboImages: {
      Ivory: {
        "short:normal": { front: "/catalog/oversized-shirt-ivory-combo-short-normal-front.png", back: "/catalog/oversized-shirt-ivory-combo-short-normal-back.png" },
        "long:longer": { front: "/catalog/oversized-shirt-ivory-combo-long-longer-front.png", back: "/catalog/oversized-shirt-ivory-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/oversized-shirt-ivory-combo-short-longer-front.png", back: "/catalog/oversized-shirt-ivory-combo-short-longer-back.png" },
      },
      White: {
        "short:normal": { front: "/catalog/oversized-shirt-white-combo-short-normal-front.png", back: "/catalog/oversized-shirt-white-combo-short-normal-back.png" },
        "long:longer": { front: "/catalog/oversized-shirt-white-combo-long-longer-front.png", back: "/catalog/oversized-shirt-white-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/oversized-shirt-white-combo-short-longer-front.png", back: "/catalog/oversized-shirt-white-combo-short-longer-back.png" },
      },
      Navy: {
        "short:normal": { front: "/catalog/oversized-shirt-navy-combo-short-normal-front.png", back: "/catalog/oversized-shirt-navy-combo-short-normal-back.png" },
        "long:longer": { front: "/catalog/oversized-shirt-navy-combo-long-longer-front-v2.png", back: "/catalog/oversized-shirt-navy-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/oversized-shirt-navy-combo-short-longer-front-v2.png", back: "/catalog/oversized-shirt-navy-combo-short-longer-back-v2.png" },
      },
      Burgundy: {
        "short:normal": { front: "/catalog/oversized-shirt-burgundy-combo-short-normal-front.png", back: "/catalog/oversized-shirt-burgundy-combo-short-normal-back.png" },
        "long:longer": { front: "/catalog/oversized-shirt-burgundy-combo-long-longer-front.png", back: "/catalog/oversized-shirt-burgundy-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/oversized-shirt-burgundy-combo-short-longer-front.png", back: "/catalog/oversized-shirt-burgundy-combo-short-longer-back.png" },
      },
    },
  },
  {
    slug: "wide-leg-trousers",
    name: "Wide-leg Trousers",
    category: "Pants",
    price: 350,
    descriptor: "High waist",
    gradient: ["#ede8e4", "#e0dcd8"],
    image: "/catalog/wide-leg-trousers-ivory-front.png",
    backImage: "/catalog/wide-leg-trousers-ivory-back.png",
    colorImages: {
      Ivory: { front: "/catalog/wide-leg-trousers-ivory-front.png", back: "/catalog/wide-leg-trousers-ivory-back.png" },
      White: { front: "/catalog/wide-leg-trousers-white-front.png", back: "/catalog/wide-leg-trousers-white-back.png" },
      Navy: { front: "/catalog/wide-leg-trousers-navy-front.png", back: "/catalog/wide-leg-trousers-navy-back.png" },
      Burgundy: { front: "/catalog/wide-leg-trousers-burgundy-front.png", back: "/catalog/wide-leg-trousers-burgundy-back.png" },
    },
  },
  {
    slug: "structured-blouse",
    name: "Structured Blouse",
    category: "Shirt",
    price: 290,
    descriptor: "Minimal dart",
    gradient: ["#efeae4", "#e2ded8"],
    image: "/catalog/structured-blouse-front.png",
    backImage: "/catalog/structured-blouse-back.png",
    colorImages: {
      Ivory: { front: "/catalog/structured-blouse-front.png", back: "/catalog/structured-blouse-back.png" },
      White: { front: "/catalog/structured-blouse-white-front-v2.png", back: "/catalog/structured-blouse-white-back.png" },
      Navy: { front: "/catalog/structured-blouse-navy-front.png", back: "/catalog/structured-blouse-navy-back.png" },
      Burgundy: { front: "/catalog/structured-blouse-burgundy-front-v2.png", back: "/catalog/structured-blouse-burgundy-back.png" },
    },
    // "short:normal" isn't generated -- it's identical to colorImages above
    // (the existing photo's half sleeve is the "short" option for this item).
    comboImages: {
      Ivory: {
        "long:normal": { front: "/catalog/structured-blouse-ivory-combo-long-normal-front.png", back: "/catalog/structured-blouse-ivory-combo-long-normal-back.png" },
        "long:longer": { front: "/catalog/structured-blouse-ivory-combo-long-longer-front.png", back: "/catalog/structured-blouse-ivory-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/structured-blouse-ivory-combo-short-longer-front.png", back: "/catalog/structured-blouse-ivory-combo-short-longer-back.png" },
      },
      White: {
        "long:normal": { front: "/catalog/structured-blouse-white-combo-long-normal-front.png", back: "/catalog/structured-blouse-white-combo-long-normal-back.png" },
        "long:longer": { front: "/catalog/structured-blouse-white-combo-long-longer-front.png", back: "/catalog/structured-blouse-white-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/structured-blouse-white-combo-short-longer-front.png", back: "/catalog/structured-blouse-white-combo-short-longer-back.png" },
      },
      Navy: {
        "long:normal": { front: "/catalog/structured-blouse-navy-combo-long-normal-front.png", back: "/catalog/structured-blouse-navy-combo-long-normal-back.png" },
        "long:longer": { front: "/catalog/structured-blouse-navy-combo-long-longer-front.png", back: "/catalog/structured-blouse-navy-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/structured-blouse-navy-combo-short-longer-front.png", back: "/catalog/structured-blouse-navy-combo-short-longer-back.png" },
      },
      Burgundy: {
        "long:normal": { front: "/catalog/structured-blouse-burgundy-combo-long-normal-front.png", back: "/catalog/structured-blouse-burgundy-combo-long-normal-back.png" },
        "long:longer": { front: "/catalog/structured-blouse-burgundy-combo-long-longer-front.png", back: "/catalog/structured-blouse-burgundy-combo-long-longer-back.png" },
        "short:longer": { front: "/catalog/structured-blouse-burgundy-combo-short-longer-front.png", back: "/catalog/structured-blouse-burgundy-combo-short-longer-back.png" },
      },
    },
    // The base photo is a half sleeve, not SHIRT_PARAMS' "long" default.
    defaultChanges: { sleeve_length: "short" },
  },
  {
    slug: "banded-trousers",
    name: "Banded Trousers",
    category: "Pants",
    price: 350,
    descriptor: "Tailored, cuffed hem",
    gradient: ["#f0ece4", "#e2ddd4"],
    image: "/catalog/banded-trousers-ivory-front.png",
    backImage: "/catalog/banded-trousers-ivory-back.png",
    colorImages: {
      Ivory: { front: "/catalog/banded-trousers-ivory-front.png", back: "/catalog/banded-trousers-ivory-back.png" },
      White: { front: "/catalog/banded-trousers-white-front.png", back: "/catalog/banded-trousers-white-back.png" },
      Navy: { front: "/catalog/banded-trousers-navy-front.png", back: "/catalog/banded-trousers-navy-back.png" },
      Burgundy: { front: "/catalog/banded-trousers-burgundy-front.png", back: "/catalog/banded-trousers-burgundy-back.png" },
    },
  },
  {
    slug: "wrap-top",
    name: "Wrap Top",
    category: "Shirt",
    price: 290,
    descriptor: "Soft drape, tie waist",
    badge: "NEW",
    gradient: ["#f2ede4", "#e6e0d6"],
    image: "/catalog/wrap-top-ivory-front-v3.png",
    backImage: "/catalog/wrap-top-ivory-back-v3.png",
    colorImages: {
      Ivory: { front: "/catalog/wrap-top-ivory-front-v3.png", back: "/catalog/wrap-top-ivory-back-v3.png" },
      White: { front: "/catalog/wrap-top-white-front-v3.png", back: "/catalog/wrap-top-white-back-v3.png" },
      Navy: { front: "/catalog/wrap-top-navy-front-v3.png", back: "/catalog/wrap-top-navy-back-v3.png" },
      Burgundy: { front: "/catalog/wrap-top-burgundy-front-v3.png", back: "/catalog/wrap-top-burgundy-back-v3.png" },
    },
  },
  {
    slug: "pleated-trousers",
    name: "Pleated Trousers",
    category: "Pants",
    price: 350,
    descriptor: "Relaxed leg, pleated",
    badge: "NEW",
    gradient: ["#efe9df", "#e2ddd2"],
    image: "/catalog/pleated-trousers-ivory-front-v3.png",
    backImage: "/catalog/pleated-trousers-ivory-back-v2.png",
    colorImages: {
      Ivory: { front: "/catalog/pleated-trousers-ivory-front-v3.png", back: "/catalog/pleated-trousers-ivory-back-v2.png" },
      White: { front: "/catalog/pleated-trousers-white-front-v2.png", back: "/catalog/pleated-trousers-white-back-v2.png" },
      Navy: { front: "/catalog/pleated-trousers-navy-front-v3.png", back: "/catalog/pleated-trousers-navy-back-v2.png" },
      Burgundy: { front: "/catalog/pleated-trousers-burgundy-front-v2.png", back: "/catalog/pleated-trousers-burgundy-back-v2.png" },
    },
  },
  {
    slug: "cargo-trousers",
    name: "Cargo Trousers",
    category: "Pants",
    price: 350,
    descriptor: "Wide leg, side pockets",
    badge: "NEW",
    gradient: ["#e9e2d2", "#ddd3bd"],
    image: "/catalog/cargo-trousers-ivory-front-v2.png",
    backImage: "/catalog/cargo-trousers-ivory-back-v2.png",
    colorImages: {
      Ivory: { front: "/catalog/cargo-trousers-ivory-front-v2.png", back: "/catalog/cargo-trousers-ivory-back-v2.png" },
      White: { front: "/catalog/cargo-trousers-white-front.png", back: "/catalog/cargo-trousers-white-back-v3.png" },
      Navy: { front: "/catalog/cargo-trousers-navy-front.png", back: "/catalog/cargo-trousers-navy-back-v3.png" },
      Burgundy: { front: "/catalog/cargo-trousers-burgundy-front.png", back: "/catalog/cargo-trousers-burgundy-back-v2.png" },
    },
  },
  {
    slug: "utility-shirt",
    name: "Utility Shirt",
    category: "Shirt",
    price: 290,
    descriptor: "Chest pockets, tie waist",
    badge: "NEW",
    gradient: ["#ede6d9", "#ddd4c4"],
    image: "/catalog/utility-shirt-ivory-front-v3.png",
    backImage: "/catalog/utility-shirt-ivory-back-v3.png",
    colorImages: {
      Ivory: { front: "/catalog/utility-shirt-ivory-front-v3.png", back: "/catalog/utility-shirt-ivory-back-v3.png" },
      White: { front: "/catalog/utility-shirt-white-front-v3.png", back: "/catalog/utility-shirt-white-back-v3.png" },
      Navy: { front: "/catalog/utility-shirt-navy-front-v3.png", back: "/catalog/utility-shirt-navy-back-v4.png" },
      Burgundy: { front: "/catalog/utility-shirt-burgundy-front-v3.png", back: "/catalog/utility-shirt-burgundy-back-v3.png" },
    },
  },
];
