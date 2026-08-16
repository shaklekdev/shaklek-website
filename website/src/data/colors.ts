export type ColorOption = {
  name: string;
  hex: string;
};

export const colors: ColorOption[] = [
  { name: "Ivory", hex: "#f5f0e8" },
  { name: "White", hex: "#fafafa" },
  { name: "Navy", hex: "#0a2d4a" },
  { name: "Burgundy", hex: "#4a1a2d" },
];

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof sizes)[number];

export const FREE_QUICK_CUSTOMIZE_TAPS = 5;
