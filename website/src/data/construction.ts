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
  // From the founder-corrected tailor sheets (planning/tailor-specs/sent/*-MAXI.jpg).
  "open-abaya": {
    silhouette: "Open abaya with no neckline and no closures, sweeping wider to the hem",
    details: [
      { text: "No neckline, no collar, no lapel: two front panels hang free, always worn open" },
      { text: "Front edge folded back to the OUTSIDE in one continuous band, up the front, round the back neck, down to the hem; not sewn on, no interfacing" },
      { text: "Shoulder seam dropped about 6 cm down the arm; set-in sleeve" },
      { text: "Deep cuff: sleeve end turned back to the outside" },
      { text: "Back is one panel: no seam, no vent, no slit", view: "back" },
      { text: "Plain hem, no band, no turn-up" },
    ],
  },
  "buttoned-abaya": {
    silhouette: "Straight-column abaya with four black cord closures, worn open or closed",
    details: [
      { text: "Round collarless neck, then a V wide at the neck tapering to a point at the first closure bar", view: "front" },
      { text: "Four short flat bars of BLACK cord, each with a small BLACK button, about a fifth of the body width; open below the last bar", view: "front" },
      { text: "Shoulder seam dropped about 6 cm down the arm; set-in sleeve; plain soft sleeve end, no cuff" },
      { text: "Back is one unbroken panel: no yoke, no seam, no vent, no closures", view: "back" },
      { text: "Straight horizontal hem, soft edge, no band" },
    ],
  },
  // Written 2026-11-13 from the catalogue photographs (navy, round:maxi).
  "slip-dress": {
    silhouette: "Sleeveless A-line maxi dress, high round neck, falling straight from the bust",
    details: [
      { text: "High round neckline, no collar" },
      { text: "Sleeveless with cut-in armholes, faced" },
      { text: "Princess seams on the front, from the armhole to the hem", view: "front" },
      { text: "Centre-back seam, shoulder to hem", view: "back" },
      { text: "No waist seam, no belt; A-line skirt widening to the hem" },
    ],
  },
  "buttoned-dress": {
    silhouette: "Sleeveless fit-and-flare maxi dress with a seamed waist and buttons to the hem",
    details: [
      { text: "Round neckline, no collar, sleeveless with faced armholes" },
      { text: "Seamed waist at the natural waist, front and back" },
      { text: "Small fabric-covered buttons close together, centre front from the neck to the hem", view: "front" },
      { text: "Side-seam pockets in the skirt" },
      { text: "Back bodice with a centre-back seam; A-line skirt widening to the hem", view: "back" },
    ],
  },
  "oversized-shirt": {
    silhouette: "Relaxed straight-cut shirt, dropped shoulder, no waist shaping",
    // Corrected 2026-11-13 against the catalogue photographs (founder): the
    // back photo shows a ROUNDED shirt-tail hem with shorter sides, a straight
    // back yoke, a centre-back box pleat and a buttoned sleeve placket. This
    // entry said "Straight hem, equal front and back" and "Convertible collar",
    // and it pins the flat prompts, so the generated back flats came out
    // straight-hemmed too. The photograph wins.
    details: [
      { text: "Full-length front placket with buttons", view: "front" },
      { text: "Pointed shirt collar on a collar stand, soft (light or no interfacing)" },
      { text: "Dropped shoulder seam sitting below the natural shoulder point" },
      { text: "Straight back yoke, shoulder to shoulder", view: "back" },
      { text: "Centre-back box pleat below the yoke", view: "back" },
      { text: "Long sleeve: buttoned sleeve placket and buttoned cuff" },
      { text: "Rounded shirt-tail hem, sides shorter than centre front and back" },
    ],
  },
  // ⚠️ Corrected 2026-11-13 against the catalogue photographs. The blouse entry
  // described a different garment ("single dart pair, no princess seam, set-in
  // sleeve, straight hem"); the photos show front waist darts, back princess seams, a waistband, a
  // gathered peplum and puff sleeves. The photograph wins.
  "structured-blouse": {
    silhouette: "Fitted blouse: front waist darts, back princess seams, seamed waistband, gathered peplum, puff sleeves",
    details: [
      { text: "Band (mandarin) collar, open in a deep V below it — no buttons in the V", view: "front" },
      { text: "Front: one vertical waist dart each side, from under the bust to the waistband", view: "front" },
      { text: "Back: princess seams from the shoulders to the waistband", view: "back" },
      { text: "Separate waistband seamed at the natural waist, front and back" },
      { text: "Gathered peplum below the waistband" },
      { text: "Buttons down the centre front from the bottom of the V through the waistband and peplum", view: "front" },
      { text: "Puff sleeve gathered at the head. Short: gathered into a narrow band. Long: gathered into a deep cuff with 3 buttons" },
    ],
  },
  "wrap-top": {
    silhouette: "Wrap-front top with a self-fabric tie closing at the side",
    details: [
      { text: "Front wraps over in a soft crossover V and ties at the side seam", view: "front" },
      { text: "Self-fabric tie cut from the same cloth, not a purchased band" },
      { text: "No buttons and no zip — the tie is the only closure" },
      { text: "Long sleeve gathered into a narrow band at the wrist" },
      { text: "Plain single back panel, no opening", view: "back" },
    ],
  },
  "utility-shirt": {
    silhouette: "Utility shirt with flap chest pockets and a drawstring waist",
    details: [
      { text: "Pointed shirt collar on a stand" },
      { text: "Two chest pockets WITH FLAPS, topstitched", view: "front" },
      { text: "Full-length front placket with buttons", view: "front" },
      { text: "Drawstring cord through a channel at the waist, gathering front and back, tied at centre front" },
      { text: "Back yoke", view: "back" },
      { text: "Flap pocket on the upper sleeve" },
      { text: "Long sleeve: buttoned cuff. Short sleeve: turned-up cuff" },
    ],
  },
  "wide-leg-trousers": {
    silhouette: "High-waisted pant falling straight from the hip with no taper",
    details: [
      { text: "Zip fly, closed at the waistband with one button", view: "front" },
      { text: "High waistband sitting at the natural waist, with belt loops" },
      { text: "One front pleat each side, released below the waistband", view: "front" },
      { text: "Simple welt back pockets — no flaps, no buttons", view: "back" },
      { text: "No taper anywhere in the leg" },
      { text: "Plain hem, no cuff" },
    ],
  },
  "banded-trousers": {
    silhouette: "Tailored pant with a flat turned-up cuff at the hem",
    details: [
      { text: "Zip fly, closed at the waistband with one button", view: "front" },
      { text: "Flat turned-up cuff — never gathered, elasticated or tapered" },
      { text: "Simple welt back pockets — no flaps, no buttons", view: "back" },
      { text: "Leg falls straight to the cuff" },
    ],
  },
  "pleated-trousers": {
    silhouette: "Relaxed pant with front pleats falling from the waistband",
    details: [
      { text: "Zip fly, closed at the waistband with one button", view: "front" },
      { text: "Two deep front pleats each side, released from the waistband, pressed at the top only", view: "front" },
      { text: "Belt loops on the waistband" },
      { text: "Full at the hip, gently narrower towards the ankle" },
      { text: "Simple welt back pockets — no flaps, no buttons", view: "back" },
      { text: "Plain hem, no cuff" },
    ],
  },
  "cargo-trousers": {
    silhouette: "Wide-leg cargo pant with patch pockets on the outside of each leg",
    details: [
      { text: "Zip fly, closed at the waistband with one button", view: "front" },
      { text: "Cargo pockets on the outer thigh, both legs: bellows patch pocket with a flap and one button" },
      { text: "BELT LOOPS: CONFIRM WITH THE CUSTOMER before cutting (the back photos show them; default is none, the drawstring replaces them)" },
      { text: "Cord drawstring through the front waistband, tied in a bow at centre front over the zip", view: "front" },
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
  "Shirt:sleeve_length:short": "Short sleeve, finishing above the elbow. Sleeve end as in this piece's construction (band, cuff or plain turned hem).",
  "Shirt:sleeve_length:long": "Long sleeve, finishing at the wrist bone. Sleeve end as in this piece's construction (cuff or plain turned hem).",
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
  "Pants:closure:zip": "Zip fly, closed at the waistband with one button.",
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
