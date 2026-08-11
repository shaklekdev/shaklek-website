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
};

// Pricing locked from the Shaklek business dossier (Section 9):
// Shirt 290 · Skirt 320 · Pants 350 · Dress 490 · Dress — Elaborate ~670 AED
export const catalog: CatalogItem[] = [
  {
    slug: "oversized-shirt",
    name: "Oversized Shirt",
    category: "Shirt",
    price: 290,
    descriptor: "Relaxed fit",
    badge: "TRENDING",
    gradient: ["#f5f0e8", "#e8e4dc"],
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
