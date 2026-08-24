// Construction detail per catalog garment and per customizer option.
//
// This is the text the tailor reads on the tech pack, and it is also what
// pins the technical-flat prompts in scripts/catalog/gen-flat.mjs -- one
// source, so the drawing and the written instruction cannot describe two
// different garments.
//
// PROVENANCE -- read this before treating any line here as a specification.
// These notes are derived from the catalog photography and each item's
// `descriptor` in catalog.ts, plus the construction details that were pinned
// in every image-generation prompt (CLAUDE.md 4b): cargo side pockets, simple
// welt back pockets with no flaps or buttons, a flat turned-up cuff that is
// never gathered or elasticated. They describe what the garment visibly IS.
//
// They are NOT measured from Shaklek's patterns, and they carry no seam
// allowance, stitch density or tolerance -- those belong to the tailor's own
// standard and are deliberately left blank on the tech pack rather than
// invented here. A confident wrong number costs a remake; a blank costs a
// question. Same reasoning as the warning at the top of sizeChart.ts.

/**
 * A construction detail. `view` says which technical flat it belongs on --
 * omitted means both. Without this the front flat gets told to draw the welt
 * back pockets, and the model obliges.
 */
export type ConstructionDetail = { text: string; view?: "front" | "back" };

export type ConstructionNotes = {
  /** One line naming the garment's defining construction, for the flat prompt. */
  silhouette: string;
  /** Details that must survive on every drawing and be built on every unit. */
  details: ConstructionDetail[];
};

export const ITEM_CONSTRUCTION: Record<string, ConstructionNotes> = {
  "oversized-shirt": {
    silhouette: "Relaxed straight-cut shirt, dropped shoulder, no waist shaping",
    details: [
      { text: "Full-length front placket with buttons", view: "front" },
      { text: "Convertible collar with stand" },
      { text: "Dropped shoulder seam sitting below the natural shoulder point" },
      { text: "Straight hem, equal front and back" },
    ],
  },
  "structured-blouse": {
    silhouette: "Clean blouse with light waist shaping from a single dart pair",
    details: [
      { text: "One bust dart pair only — no princess seam, no side dart stack", view: "front" },
      { text: "Full-length front placket with buttons", view: "front" },
      { text: "Set-in sleeve at the natural shoulder point" },
      { text: "Straight hem, equal front and back" },
    ],
  },
  "wrap-top": {
    silhouette: "Wrap-front top with a self-fabric tie closing at the waist",
    details: [
      { text: "Front wraps left over right and ties at the side seam", view: "front" },
      { text: "Self-fabric tie cut from the same cloth, not a purchased band" },
      { text: "No buttons and no zip — the tie is the only closure" },
      { text: "Plain single back panel, no opening", view: "back" },
    ],
  },
  "utility-shirt": {
    silhouette: "Utility shirt with patch chest pockets and a self-fabric waist tie",
    details: [
      { text: "Two patch chest pockets, square-cut, topstitched", view: "front" },
      { text: "Full-length front placket with buttons", view: "front" },
      { text: "Self-fabric waist tie" },
      { text: "Straight hem, equal front and back" },
    ],
  },
  "wide-leg-trousers": {
    silhouette: "High-waisted trouser falling straight from the hip with no taper",
    details: [
      { text: "High waistband sitting at the natural waist" },
      { text: "Simple welt back pockets — no flaps, no buttons", view: "back" },
      { text: "No taper anywhere in the leg" },
      { text: "Plain hem, no cuff" },
    ],
  },
  "banded-trousers": {
    silhouette: "Tailored trouser with a flat turned-up cuff at the hem",
    details: [
      { text: "Flat turned-up cuff — never gathered, elasticated or tapered" },
      { text: "Simple welt back pockets — no flaps, no buttons", view: "back" },
      { text: "Leg falls straight to the cuff" },
    ],
  },
  "pleated-trousers": {
    silhouette: "Relaxed trouser with front pleats falling from the waistband",
    details: [
      { text: "Front pleats released from the waistband, pressed at the top only", view: "front" },
      { text: "Simple welt back pockets — no flaps, no buttons", view: "back" },
      { text: "Plain hem, no cuff" },
    ],
  },
  "cargo-trousers": {
    silhouette: "Wide-leg cargo trouser with patch pockets on the outside of each leg",
    details: [
      { text: "Cargo side pockets on the outer thigh, both legs" },
      { text: "Simple welt back pockets — no flaps, no buttons", view: "back" },
      { text: "Plain hem, no cuff" },
    ],
  },
};

// Construction note per customizer option, keyed by
// `${category}:${SilhouetteChangeType}:${value}` exactly as those are declared
// in parameterSliders.ts. The category has to be part of the key: Shirt and
// Pants both have a `closure:button` option and they are not the same thing —
// one is a placket, the other is a fly.
//
// Every option the customer can reach — and every premium option that is
// committed at its default without being customer-editable — has a line here,
// because a choice nobody prints is a choice the tailor cannot honour.
// scripts/test-construction.mjs fails if any option is missing one.
export const OPTION_CONSTRUCTION: Record<string, string> = {
  // Shirt — render tier
  "Shirt:sleeve_length:short": "Short sleeve, finishing above the elbow, plain turned hem.",
  "Shirt:sleeve_length:long": "Long sleeve, finishing at the wrist bone, plain turned hem.",
  "Shirt:garment_length:normal": "Standard body length, hem sitting at the high hip.",
  "Shirt:garment_length:longer": "Extended body length, hem sitting at the low hip.",
  // Shirt — premium tier (committed at its default, not customer-editable)
  "Shirt:pocket:0": "No pockets. Omit entirely — do not topstitch a pocket outline.",
  "Shirt:pocket:1": "One patch chest pocket, left side as worn.",
  "Shirt:pocket:2": "Two patch chest pockets, one each side, matched height.",
  "Shirt:closure:button": "Button closure through the full front placket, evenly spaced.",
  "Shirt:closure:zip": "Concealed zip closure in place of the button placket.",

  // Pants — render tier
  "Pants:leg_width:straight":
    "Straight leg. Constant width from knee to hem — no flare and no taper.",
  "Pants:leg_width:wide":
    "Wide leg. Widening from the hip through to the hem — no taper at the ankle.",
  "Pants:garment_length:cropped": "Cropped length, hem finishing above the ankle bone.",
  "Pants:garment_length:full": "Full length, hem finishing at the top of the foot.",
  // Pants — premium tier
  "Pants:waist_rise:normal": "Waistband sitting at the natural waist.",
  "Pants:waist_rise:high": "High-rise waistband sitting above the natural waist.",
  "Pants:closure:button": "Button fly.",
  "Pants:closure:zip": "Zip fly, with an inner button at the waistband.",
  "Pants:pocket:none": "No pockets. Omit entirely — do not topstitch a pocket outline.",
  "Pants:pocket:yes":
    "Side seam pockets, plus simple welt back pockets — no flaps, no buttons.",
};

export function constructionFor(slug: string): ConstructionNotes | null {
  return ITEM_CONSTRUCTION[slug] ?? null;
}

/** The construction line for one committed slider choice, if one is written. */
export function noteForOption(category: string, type: string, value: string): string | null {
  return OPTION_CONSTRUCTION[`${category}:${type}:${value}`] ?? null;
}
