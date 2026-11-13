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
  nape:     { label: "Back neck to waist", how: "neck bone at the back down to the natural waist", derive: (m) => (0.857 - 0.6017) * m.height, pm: 2.5 },
};

/** Which body measurements each category needs. */
export const NEEDS = {
  Shirt: ["height", "bust", "waist", "hip", "shoulder", "arm", "neck", "upperarm", "wrist", "nape"],
  Pants: ["height", "waist", "hip", "outseam", "inseam", "thigh", "knee", "calf", "ankle", "rise"],
  Dress: ["height", "bust", "waist", "hip", "shoulder", "neck", "nape", "outseam"],
  Abaya: ["height", "bust", "hip", "shoulder", "arm", "upperarm", "wrist", "neck"],
};

// Body landmarks as a share of height (ANSUR II women means). Size M = 165 cm.
const H = 165;
const r = (k) => Math.round(k * H);
export const LANDMARK = {
  waistFromFloor: r(0.6017), kneeFromFloor: r(0.2756), ankleBoneFromFloor: r(0.0385),
  midCalfFromFloor: Math.round((0.2756 + 0.0385) / 2 * H), neckToWaist: r(0.857 - 0.6017),
  crotchFromFloor: r(0.4802),
};

// DESIGN VALUES per piece. [option, what, value at size M, how to measure on the garment]
// "all" = every option. Grade widths with her body: + the ease stated, not a fixed cm.
const L = LANDMARK;
export const DESIGN = {
  "oversized-shirt": [
    ["all", "Chest ease", "+30 cm over her bust", "garment chest, laid flat x2"],
    ["all", "Shoulder drop", "6 cm past her shoulder point", "from shoulder point down the arm"],
    ["all", "Collar", "back 5 cm, points 8 cm, stand 3.2 cm", "on the finished collar"],
    ["Length NORMAL", "Hem", "upper thigh: HPS to hem 72 cm (M)", "from high shoulder point, centre back"],
    ["Length LONGER", "Hem", "+8 cm: HPS to hem 80 cm (M)", "same"],
    ["Sleeve LONG", "Sleeve", "to wrist bone + 2 cm, incl. 6 cm cuff", "from the dropped seam"],
    ["Sleeve SHORT", "Sleeve", "22 cm from the dropped seam, opening 34 cm around", "seam to hem; opening laid flat x2"],
  ],
  "structured-blouse": [
    ["all", "Bodice ease", "bust +6 cm, waist +3 cm", "garment, laid flat x2"],
    ["all", "V opening", "16 cm below the base of the collar band", "from the band, down centre front"],
    ["all", "Waistband", "5 cm high, at her natural waist", ""],
    ["Length NORMAL", "Peplum", "15 cm below the waistband", "waistband seam to hem"],
    ["Length LONGER", "Peplum", "22 cm below the waistband", "same"],
    ["Sleeve SHORT", "Puff sleeve", "20 cm, gathered into a 3 cm band = upper arm +3 cm", "shoulder seam to band edge"],
    ["Sleeve LONG", "Sleeve", "to wrist bone +2 cm; cuff 8 cm deep, 3 buttons, wrist +4 cm", ""],
  ],
  "wrap-top": [
    ["all", "Bust ease", "+8 cm", "garment closed and tied"],
    ["all", "V crossover", "point 22 cm below high shoulder point", "from HPS down to where the fronts cross"],
    ["all", "Tie", "2 ties x 60 cm, 2.5 cm wide", ""],
    ["Length NORMAL", "Hem", "hip: waist + 18 cm", "natural waist to hem, at the side"],
    ["Length LONGER", "Hem", "low hip: waist + 26 cm", "same"],
    ["Sleeve SHORT", "Sleeve", "18 cm, plain hem", "shoulder seam to hem"],
    ["Sleeve LONG", "Sleeve", "to wrist bone; band 3 cm = wrist +6 cm", ""],
  ],
  "utility-shirt": [
    ["all", "Chest ease", "+12 cm", "garment chest laid flat x2"],
    ["all", "Chest pockets", "13 x 15 cm, top 22 cm below HPS, flap 6 cm", ""],
    ["all", "Sleeve pocket", "9 x 12 cm, top 10 cm below shoulder seam", ""],
    ["all", "Drawstring channel", "at her natural waist, 2.5 cm wide", ""],
    ["Length NORMAL", "Hem", "waist + 20 cm", "natural waist to hem, at the side"],
    ["Length LONGER", "Hem", "waist + 28 cm", "same"],
    ["Sleeve SHORT", "Sleeve", "20 cm incl. 3 cm turn-up, opening = upper arm +8 cm", ""],
    ["Sleeve LONG", "Sleeve", "to wrist bone +2 cm, cuff 6 cm", ""],
  ],
  "wide-leg-trousers": [
    ["all", "Hip ease", "+6 cm", ""], ["all", "Waistband", "4 cm, at her natural waist", ""],
    ["Leg STRAIGHT", "Leg opening", "48 cm around (M)", "hem laid flat x2"],
    ["Leg WIDE", "Leg opening", "62 cm around (M)", "hem laid flat x2"],
    ["Length FULL", "Hem", `touches the top of the foot: waist to hem = waist-to-floor - 2 cm (M ${L.waistFromFloor - 2})`, "at the side seam"],
    ["Length CROPPED", "Hem", `5 cm above the ankle bone: waist to hem = waist-to-floor - ${L.ankleBoneFromFloor + 5} cm (M ${L.waistFromFloor - L.ankleBoneFromFloor - 5})`, "at the side seam"],
  ],
  "banded-trousers": [
    ["all", "Hip ease", "+4 cm", ""], ["all", "Cuff", "4 cm turned up, flat", "finished cuff height"],
    ["Leg STRAIGHT", "Leg opening", "42 cm around (M)", "hem laid flat x2"],
    ["Leg WIDE", "Leg opening", "52 cm around (M)", "hem laid flat x2"],
    ["Length FULL", "Hem (bottom of cuff)", `top of the foot (M waist to hem ${L.waistFromFloor - 2})`, ""],
    ["Length CROPPED", "Hem (bottom of cuff)", `5 cm above the ankle bone (M ${L.waistFromFloor - L.ankleBoneFromFloor - 5})`, ""],
  ],
  "pleated-trousers": [
    ["all", "Hip ease", "+10 cm (pleats)", ""], ["all", "Pleats", "2 per side, 3 cm and 2.5 cm deep, toward the side", ""],
    ["Leg STRAIGHT", "Leg opening", "40 cm around (M), tapering from the knee", ""],
    ["Leg WIDE", "Leg opening", "54 cm around (M), no taper", ""],
    ["Length FULL", "Hem", `top of the foot (M waist to hem ${L.waistFromFloor - 2})`, ""],
    ["Length CROPPED", "Hem", `5 cm above the ankle bone (M ${L.waistFromFloor - L.ankleBoneFromFloor - 5})`, ""],
  ],
  "cargo-trousers": [
    ["all", "Hip ease", "+8 cm", ""], ["all", "Cargo pocket", "16 x 20 cm, top 8 cm below crotch level, outer side", ""],
    ["all", "Drawstring", "cord through the front waistband, 2 x 35 cm ends", ""],
    ["Leg STRAIGHT", "Leg opening", "46 cm around (M)", "hem laid flat x2"],
    ["Leg WIDE", "Leg opening", "58 cm around (M)", "hem laid flat x2"],
    ["Length FULL", "Hem", `top of the foot (M waist to hem ${L.waistFromFloor - 2})`, ""],
    ["Length CROPPED", "Hem", `5 cm above the ankle bone (M ${L.waistFromFloor - L.ankleBoneFromFloor - 5})`, ""],
  ],
  "slip-dress": [
    ["all", "Ease", "bust +8 cm, hip +12 cm, no waist shaping", ""],
    ["all", "Armhole", "cut in: shoulder 5 cm wide, armhole 2 cm below armpit", ""],
    ["Neckline ROUND", "Neck", "high: 6 cm below the base of the neck at centre front", "from HPS line to neck edge at CF"],
    ["Neckline V", "Neck", "V point 18 cm below high shoulder point", "HPS to V point"],
    ["Length MAXI", "Hem", "3 cm above the floor (barefoot); sweep 190 cm around", "hem circumference"],
    ["Length MIDI", "Hem", `mid-calf (M ${L.midCalfFromFloor} cm from floor); sweep 160 cm around`, ""],
  ],
  "buttoned-dress": [
    ["all", "Bodice ease", "bust +5 cm, waist +3 cm (FITTED)", ""],
    ["all", "Buttons", "1.2 cm covered buttons, 2 cm apart, elastic cord loops", "centre to centre"],
    ["all", "Opening at bottom", "last button at knee level, open below", ""],
    ["all", "Band behind buttons", "3.5 cm wide, same linen", ""],
    ["all", "Pockets", "opening 14 cm, top 5 cm below waist seam, bag 18 cm deep", ""],
    ["Neckline ROUND", "Neck", "8 cm below the base of the neck at centre front", ""],
    ["Neckline V", "Neck", "V point 16 cm below high shoulder point", ""],
    ["Length MAXI", "Hem", "3 cm above the floor; skirt WIDE: sweep 240 cm around", ""],
    ["Length MIDI", "Hem", `mid-calf (M ${L.midCalfFromFloor} cm from floor); sweep 200 cm around`, ""],
  ],
  "open-abaya": [
    ["all", "Ease", "bust +24 cm, hem sweeps wider than chest", ""],
    ["all", "Fold-back band", "9 cm at the neck, 6 cm at the hem, continuous", "band width, folded"],
    ["all", "Shoulder drop", "6 cm", ""],
    ["Length MAXI", "Hem", "2 cm above the floor in her shoes", ""],
    ["Length MIDI", "Hem", `mid-calf (M ${L.midCalfFromFloor} cm from floor)`, ""],
    ["Sleeve NARROW", "Sleeve", "opening 36 cm around; cuff 10 cm deep", ""],
    ["Sleeve WIDE", "Sleeve", "opening 52 cm around; cuff 10 cm deep", ""],
  ],
  "buttoned-abaya": [
    ["all", "Ease", "bust +20 cm, straight column: hem = chest width", ""],
    ["all", "Neck + V", "round neck 9 cm deep; V point at the first bar, 20 cm below HPS", ""],
    ["all", "Closure bars", "black cord, 10 cm long, small black button, 8 cm apart", ""],
    ["all", "Shoulder drop", "6 cm; plain sleeve end, opening 40 cm around", ""],
    ["Length MAXI", "Hem", "2 cm above the floor in her shoes", ""],
    ["Length MIDI", "Hem", `mid-calf (M ${L.midCalfFromFloor} cm from floor)`, ""],
    ["Closures FOUR", "Bars", "4 bars from the V point down", ""],
    ["Closures FIVE", "Bars", "5 bars, same spacing", ""],
  ],
};
