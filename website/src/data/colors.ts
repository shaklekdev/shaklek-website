export type ColorOption = {
  name: string;
  /** Flat fallback. Used where a photograph cannot be: email, the Meta feed,
   *  the tech pack, and any surface that cannot load an image. */
  hex: string;
  /** ⚠️ A PHOTOGRAPH OF THE ACTUAL CLOTH. This is the swatch a customer sees. */
  swatch: string;
};

// ⚠️ THE COLOUR CHIPS ARE PHOTOGRAPHS OF THE REAL LINEN, NOT FLAT HEX.
// Founder, 2026-09-20, after seeing the catalogue colours beside the swatch
// card: "we have to add the exact real shade of each of the four colors...
// because the shades vary on the generations, not all ivory are the same".
//
// Cut from her supplier's swatch card W300235, the one she actually ordered
// (navy #440, NOT the #560 card -- both are archived in
// planning/fabric/swatches/). White-balanced against the card paper and lifted
// to a true white point, because the photograph was shot at rgb(204) paper
// where white card is ~242.
//
// ⚠️ AND THE HEXES BELOW ARE NOW MEASURED, not chosen. Every one of the old
// values predates the cloth existing. The big error was NAVY at #0a2d4a, which
// is h=207 -- a petrol blue. The real linen is h=228, deeper and more violet.
// Nineteen degrees is a colour a customer would notice and reject.
//
// ⚠️ THE LIGHTNESS IS INHERITED, NOT MEASURED. Hue and saturation survive an
// exposure error because they are ratios; lightness does not. If the cloth is
// ever reshot in proper daylight, lightness is the value to revisit.
//
// ⚠️ THE GARMENT PHOTOGRAPHS STILL SHOW THE OLD SHADES. Every navy cell in the
// catalogue was generated against #0a2d4a. The chips are right and the pictures
// are not yet -- see fabric-swatch-per-colour in planning/OPEN.md.
export const colors: ColorOption[] = [
  { name: "Ivory", hex: "#f3f0ec", swatch: "/fabric/linen-ivory.jpg" },
  { name: "White", hex: "#fafafa", swatch: "/fabric/linen-white.jpg" },
  { name: "Navy", hex: "#121b3f", swatch: "/fabric/linen-navy.jpg" },
  { name: "Burgundy", hex: "#4e1825", swatch: "/fabric/linen-burgundy.jpg" },
];

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof sizes)[number];

export const FREE_QUICK_CUSTOMIZE_TAPS = 5;
