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
      Navy: { front: "/catalog/oversized-shirt-navy-front.png", back: "/catalog/oversized-shirt-navy-back.png" },
      Burgundy: { front: "/catalog/oversized-shirt-burgundy-front.png", back: "/catalog/oversized-shirt-burgundy-back.png" },
    },
  },
  {
    slug: "structured-blouse",
    name: "Structured Blouse",
    category: "Shirt",
    price: 290,
    descriptor: "Minimal dart",
    gradient: ["#efeae4", "#e2ded8"],
  },
  {
    slug: "wrap-skirt",
    name: "Wrap Skirt",
    category: "Skirt",
    price: 320,
    descriptor: "Asymmetric",
    badge: "NEW",
    gradient: ["#f2efe8", "#e6e2dc"],
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
      Navy: { front: "/catalog/wide-leg-trousers-navy-front.png", back: "/catalog/wide-leg-trousers-navy-back.png" },
      Burgundy: { front: "/catalog/wide-leg-trousers-burgundy-front.png", back: "/catalog/wide-leg-trousers-burgundy-back.png" },
    },
  },
  {
    slug: "midi-a-line-dress",
    name: "Midi A-line Dress",
    category: "Dress",
    price: 490,
    descriptor: "Minimal",
    dressTier: "standard",
    gradient: ["#f0ede8", "#e4e0d8"],
  },
  {
    slug: "shift-dress",
    name: "Shift Dress",
    category: "Dress",
    price: 490,
    descriptor: "Boxy",
    badge: "TRENDING",
    dressTier: "standard",
    gradient: ["#f4f0ea", "#e8e4de"],
  },
  {
    slug: "draped-evening-dress",
    name: "Draped Evening Dress",
    category: "Dress",
    price: 670,
    descriptor: "Elaborate silhouette",
    dressTier: "elaborate",
    gradient: ["#efe8e0", "#ded4c8"],
  },
];
