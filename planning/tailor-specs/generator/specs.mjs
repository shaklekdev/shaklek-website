// What the tailor needs, per piece and per option, so he improvises nothing
// (founder 2026-11-13: "pense à tout").
//
// THREE KINDS OF NUMBER, never mixed up:
//   1. HER BODY  — measured on her (live fitting) or by the virtual fitting
//      tool (branch online-fitting, src/lib/bodyMeasure.ts `Estimate`), or
//      DERIVED from those with an ANSUR II regression when neither has it.
//   2. LANDMARK LENGTHS — where a hem/cuff ends ON HER BODY (knee, mid-calf,
//      ankle bone...). Written as a landmark so it works for every height,
//      with the size-M number beside it (165 cm, ANSUR II women ratios).
//   3. DESIGN VALUES — the garment's own widths/depths (leg opening, V depth,
//      band width...). ⚠️ PROPOSED, NOT MEASURED: industry-standard values
//      chosen per style. An attempt to read them off the catalogue photos
//      returned leg openings of 19-21 cm (impossible: a foot cannot pass), so
//      the photo instrument was rejected. The founder validates these once on
//      the first piece of each design; then they are fixed here.
//
// ANSUR II: tools.openlab.psu.edu/publicData/ANSUR_II_FEMALE_Public.csv,
// 1,986 women, least squares fitted 2026-11-13. ± is one residual SD.

/** Body measurements: label, how to take it, virtual-fitting field, derivation. */
export const MEASURES = {
  height:   { label: "Height", how: "barefoot, against a wall", virtual: "height" },
  bust:     { label: "Bust", how: "around the fullest part, tape level", virtual: "bust" },
  underbust:{ label: "Under bust (bra band)", how: "around the ribcage just under the bust, tape snug", virtual: "bra band (EU size = cm)", note: "online: from her bra size; essential for FITTED pieces" },
  waist:    { label: "Waist", how: "around the narrowest part, natural waist", virtual: "waist" },
  hip:      { label: "Hip", how: "around the fullest part of the seat", virtual: "hip" },
  shoulder: { label: "Shoulder width", how: "shoulder point to shoulder point, across the back", virtual: "shoulder" },
  arm:      { label: "Arm length", how: "shoulder point to wrist bone, arm relaxed", virtual: "sleeve" },
  outseam:  { label: "Waist to floor", how: "natural waist to floor, at the side, barefoot", virtual: "outseam" },
  inseam:   { label: "Inside leg", how: "crotch to floor, barefoot", virtual: "inseam" },
  neck:     { label: "Neck", how: "around the base of the neck", derive: (m) => 11.0 + 0.1402 * m.bust + 0.0789 * m.height, pm: 1.4 },
  upperarm: { label: "Upper arm", how: "around the fullest part, arm relaxed", derive: (m) => 5.72 + 0.1379 * m.bust + 0.1369 * m.waist - 1.5, pm: 1.9, note: "ANSUR is flexed; -1.5 cm for relaxed" },
  wrist:    { label: "Wrist", how: "around the wrist bone", derive: (m) => 3.13 + 0.0389 * m.bust + 0.0532 * m.height, pm: 0.6 },
  thigh:    { label: "Thigh", how: "around the fullest part, just below the crotch", derive: (m) => -8.77 + 0.6826 * m.hip + 0.0079 * m.waist, pm: 1.9 },
  knee:     { label: "Above knee", how: "around the leg just above the knee", derive: (m) => 0.44 + 0.3709 * m.hip + 0.0107 * m.height, pm: 2.1 },
  calf:     { label: "Calf", how: "around the fullest part of the calf", derive: (m) => 4.77 + 0.2662 * m.hip + 0.0329 * m.height, pm: 1.9 },
  ankle:    { label: "Ankle", how: "around the ankle bone", derive: (m) => 5.04 + 0.0901 * m.hip + 0.0451 * m.height, pm: 1.2 },
  rise:     { label: "Rise (front waist, between the legs, to back waist)", how: "tape from front waist, through the legs, to back waist", derive: (m) => 8.53 + 0.4196 * m.hip + 0.2756 * m.height, pm: 5.1, liveOnly: true },
  bustline: { label: "Neck to bust line", how: "side of the neck (high shoulder point) straight down to the bust point", derive: (m) => (0.857 - 0.7194) * m.height, pm: 2.3 },
  kneeH:    { label: "Knee height", how: "middle of the knee cap to the floor, barefoot", derive: (m) => 0.2756 * m.height, pm: 1.5 },
  nape:     { label: "Back neck to waist", how: "neck bone at the back down to the natural waist", derive: (m) => (0.857 - 0.6017) * m.height, pm: 2.5 },
};

/** Which body measurements each category needs. */
export const NEEDS = {
  Shirt: ["height", "bust", "underbust", "waist", "hip", "shoulder", "arm", "inseam", "neck", "upperarm", "wrist", "nape", "bustline"],
  Pants: ["height", "waist", "hip", "outseam", "inseam", "thigh", "knee", "calf", "ankle", "rise", "kneeH"],
  Dress: ["height", "bust", "underbust", "waist", "hip", "shoulder", "neck", "nape", "bustline", "outseam", "kneeH", "calf"],
  Abaya: ["height", "bust", "hip", "shoulder", "arm", "upperarm", "wrist", "neck", "bustline", "kneeH"],
};

// Body landmarks as a share of height (ANSUR II women means). Size M = 165 cm.
const H = 165;
const r = (k) => Math.round(k * H);
export const LANDMARK = {
  waistFromFloor: r(0.6017), kneeFromFloor: r(0.2756), ankleBoneFromFloor: r(0.0385),
  midCalfFromFloor: Math.round((0.2756 + 0.0385) / 2 * H), neckToWaist: r(0.857 - 0.6017),
  crotchFromFloor: r(0.4802),
};

// DESIGN RULES per piece, founder 2026-11-13: "le plus clair pour moi et pour
// le tailleur" -> NO size in them. Every width is HER measurement + an amount,
// every depth/length is a point ON HER BODY. Small details that do not change
// with size (cuff depth, button spacing...) stay in fixed cm.
// [option, what, rule, how to check on the garment]. "all" = every option.
// ⚠️ PROPOSED: industry practice per style, to validate on the first piece.
export const DESIGN = {
  "oversized-shirt": [
    ["all", "Chest", "her bust + 30 cm", "garment chest, all round"],
    ["all", "Shoulder seam", "6 cm past her shoulder point, down the arm", ""],
    ["all", "Collar", "back 5 cm high, points 8 cm, stand 3.2 cm", "fixed"],
    ["Length NORMAL", "Hem", "10 cm below her crotch level", "at centre back"],
    ["Length LONGER", "Hem", "18 cm below her crotch level", "at centre back"],
    ["Sleeve LONG", "Sleeve end", "2 cm past her wrist bone (cuff 6 cm incl.)", ""],
    ["Sleeve SHORT", "Sleeve end", "halfway down her upper arm; opening = her upper arm + 8 cm", ""],
  ],
  "structured-blouse": [
    ["all", "Bodice", "her bust + 6 cm, her waist + 3 cm (fitted)", ""],
    ["all", "V opening", "point 3 cm above her bust line", "from the collar band down"],
    ["all", "Waistband", "5 cm high, ON her natural waist", "fixed height"],
    ["Length NORMAL", "Peplum", "ends at her high hip (waist + 15 cm)", ""],
    ["Length LONGER", "Peplum", "ends at her hip (waist + 22 cm)", ""],
    ["Sleeve SHORT", "Puff sleeve", "ends halfway down her upper arm; band = her upper arm + 3 cm", ""],
    ["Sleeve LONG", "Sleeve", "2 cm past her wrist bone; cuff 8 cm deep, 3 buttons, = her wrist + 4 cm", ""],
  ],
  "wrap-top": [
    ["all", "Bust", "her bust + 8 cm (tied)", ""],
    ["all", "V crossover", "the fronts cross ON her bust line", ""],
    ["all", "Ties", "2 ties, 60 cm long, 2.5 cm wide", "fixed"],
    ["Length NORMAL", "Hem", "her hip (waist + 18 cm)", "at the side"],
    ["Length LONGER", "Hem", "her low hip (waist + 26 cm)", "at the side"],
    ["Sleeve SHORT", "Sleeve end", "halfway down her upper arm, plain hem", ""],
    ["Sleeve LONG", "Sleeve end", "at her wrist bone, gathered into a 3 cm band = her wrist + 6 cm", ""],
  ],
  "utility-shirt": [
    ["all", "Chest", "her bust + 12 cm", ""],
    ["all", "Chest pockets", "13 x 15 cm, top of pocket at her armpit level, flap 6 cm", "fixed size"],
    ["all", "Sleeve pocket", "9 x 12 cm, top 10 cm below the shoulder seam", "fixed size"],
    ["all", "Drawstring channel", "ON her natural waist, 2.5 cm wide", ""],
    ["Length NORMAL", "Hem", "her waist + 20 cm", "at the side"],
    ["Length LONGER", "Hem", "her waist + 28 cm", "at the side"],
    ["Sleeve SHORT", "Sleeve end", "halfway down her upper arm, 3 cm turn-up; opening = her upper arm + 8 cm", ""],
    ["Sleeve LONG", "Sleeve end", "2 cm past her wrist bone, cuff 6 cm", ""],
  ],
  "wide-leg-trousers": [
    ["all", "Hip", "her hip + 6 cm", ""], ["all", "Waistband", "4 cm high, ON her natural waist", ""],
    ["Leg STRAIGHT", "Bottom of the leg", "24 cm laid FLAT, edge to edge (= 48 cm all round)", "one leg flat on the table"],
    ["Leg WIDE", "Bottom of the leg", "31 cm laid FLAT, edge to edge (= 62 cm all round)", "one leg flat on the table"],
    ["Length FULL", "Hem", "touches the top of her foot", ""],
    ["Length CROPPED", "Hem", "5 cm above her ankle bone", ""],
  ],
  "banded-trousers": [
    ["all", "Hip", "her hip + 4 cm", ""], ["all", "Cuff", "4 cm, turned up flat", "fixed"],
    ["Leg STRAIGHT", "Bottom of the leg", "21 cm laid FLAT, edge to edge (= 42 cm all round)", "one leg flat on the table"],
    ["Leg WIDE", "Bottom of the leg", "26 cm laid FLAT, edge to edge (= 52 cm all round)", "one leg flat on the table"],
    ["Length FULL", "Bottom of cuff", "touches the top of her foot", ""],
    ["Length CROPPED", "Bottom of cuff", "5 cm above her ankle bone", ""],
  ],
  "pleated-trousers": [
    ["all", "Hip", "her hip + 10 cm (pleats)", ""], ["all", "Pleats", "2 each side, 3 cm and 2.5 cm deep, folded toward the side", "fixed"],
    ["Leg STRAIGHT", "Bottom of the leg", "20 cm laid FLAT, edge to edge (= 40 cm all round), narrowing from the knee", "one leg flat on the table"],
    ["Leg WIDE", "Bottom of the leg", "27 cm laid FLAT, edge to edge (= 54 cm all round), no narrowing", "one leg flat on the table"],
    ["Length FULL", "Hem", "touches the top of her foot", ""],
    ["Length CROPPED", "Hem", "5 cm above her ankle bone", ""],
  ],
  "cargo-trousers": [
    ["all", "Hip", "her hip + 8 cm", ""], ["all", "Cargo pocket", "16 x 20 cm, outer side, top 8 cm below her crotch level", "fixed size"],
    ["all", "Drawstring", "cord through the front waistband, ends 35 cm", "fixed"],
    ["Leg STRAIGHT", "Bottom of the leg", "23 cm laid FLAT, edge to edge (= 46 cm all round)", "one leg flat on the table"],
    ["Leg WIDE", "Bottom of the leg", "29 cm laid FLAT, edge to edge (= 58 cm all round)", "one leg flat on the table"],
    ["Length FULL", "Hem", "touches the top of her foot", ""],
    ["Length CROPPED", "Hem", "5 cm above her ankle bone", ""],
  ],
  "slip-dress": [
    ["all", "Body", "her bust + 8 cm, her hip + 12 cm, no waist shaping", ""],
    ["all", "Armhole", "cut in: 5 cm of fabric on the shoulder; bottom 2 cm below her armpit", ""],
    ["Neckline ROUND", "Neck", "high: follows the base of her neck at the front", ""],
    ["Neckline V", "Neck", "V point 4 cm above her bust line", ""],
    ["Length MAXI", "Hem", "3 cm above the floor (barefoot); hem all round = her hip x 2", ""],
    ["Length MIDI", "Hem", "her mid-calf; hem all round = her hip x 1.7", ""],
  ],
  "buttoned-dress": [
    ["all", "Bodice", "her bust + 5 cm, her waist + 3 cm (FITTED)", ""],
    ["all", "Buttons", "1.2 cm covered buttons, 2 cm apart, elastic cord loops", "fixed"],
    ["all", "Opening at the bottom", "last button at her knee, open below", ""],
    ["all", "Band behind buttons", "3.5 cm wide, same linen", "fixed"],
    ["all", "Pockets", "opening 14 cm, top 5 cm below the waist seam, bag 18 cm deep", "fixed"],
    ["Neckline ROUND", "Neck", "2 cm below the base of her neck at the front", ""],
    ["Neckline V", "Neck", "V point 6 cm above her bust line", ""],
    ["Length MAXI", "Hem", "3 cm above the floor; skirt WIDE: hem all round = her hip x 2.5", ""],
    ["Length MIDI", "Hem", "her mid-calf; hem all round = her hip x 2.1", ""],
  ],
  "open-abaya": [
    ["all", "Body", "her bust + 24 cm; hem wider than the chest (it sweeps)", ""],
    ["all", "Fold-back band", "9 cm wide at the neck, 6 cm at the hem, one piece, to the floor", "fixed"],
    ["all", "Shoulder seam", "6 cm past her shoulder point", ""],
    ["Length MAXI", "Hem", "2 cm above the floor in her shoes", ""],
    ["Length MIDI", "Hem", "her mid-calf", ""],
    ["Sleeve NARROW", "Sleeve end", "all round = her upper arm + 8 cm; cuff 10 cm", ""],
    ["Sleeve WIDE", "Sleeve end", "all round = her upper arm + 24 cm; cuff 10 cm", ""],
  ],
  "buttoned-abaya": [
    ["all", "Body", "her bust + 20 cm; straight column, hem = chest", ""],
    ["all", "Neck + V", "round neck 2 cm below the base of her neck; V point at the first bar, at her bust line", ""],
    ["all", "Closure bars", "black cord, 10 cm long, small black button, 8 cm apart", "fixed"],
    ["all", "Sleeve", "shoulder seam 6 cm past her shoulder; plain end = her upper arm + 12 cm", ""],
    ["Length MAXI", "Hem", "2 cm above the floor in her shoes", ""],
    ["Length MIDI", "Hem", "her mid-calf", ""],
    ["Closures FOUR", "Bars", "4 bars from the V point down", ""],
    ["Closures FIVE", "Bars", "5 bars, same spacing", ""],
  ],
};
