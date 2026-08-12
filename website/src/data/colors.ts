export type ColorOption = {
  name: string;
  hex: string;
};

export const colors: ColorOption[] = [
  { name: "Ivory", hex: "#f5f0e8" },
  { name: "Emerald", hex: "#1a5c40" },
  { name: "Black", hex: "#1a1a1a" },
  { name: "Navy", hex: "#0a2d4a" },
  { name: "Burgundy", hex: "#4a1a2d" },
  { name: "Gold", hex: "#c9a84c" },
];

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof sizes)[number];

export const LINEN_UPCHARGE = 60;
export const FREE_QUICK_CUSTOMIZE_TAPS = 5;
