// ONLINE FITTING: body measurements from two photos and a height.
//
// Founder, 2026-11-13: "now your highest priority is to make that fitting
// online because many people don't want home fitting". Plan agreed 2026-11-12
// (planning/OPEN.md camera-measuring-TOP-PRIORITY).
//
// PURE FUNCTIONS, NO BROWSER APIs, so the maths can be tested with
// `npx tsx` against synthetic silhouettes (no test file yet: write one before
// changing the bands or the calibration).
// The browser side (components/OnlineFitting.tsx) runs MediaPipe's pose
// landmarker ON THE PHONE and hands this file a person mask + 33 landmarks
// per photo. ⚠️ THE PHOTOS NEVER LEAVE THE DEVICE. Only the resulting
// numbers travel, in the order's existing `measurements` string.
//
// HOW IT WORKS
//   1. Scale: her height in cm / her height in pixels (top of the mask to the
//      bottom of the mask). Each photo gets its own scale, so the two photos
//      may be taken at different distances.
//   2. Levels are matched between the photos as a FRACTION OF HEIGHT, not as
//      pixel rows, for the same reason.
//   3. Bust = the level with the greatest side depth in the bust band; waist =
//      the narrowest front width in the waist band; hip = the widest front
//      width in the hip band. Bands come from the front photo's shoulder and
//      hip landmarks, so they follow her proportions rather than a fixed %.
//   4. Circumference = ellipse through front width x side depth (Ramanujan).
//   5. Lengths (sleeve, outseam, inseam) are straight pixel distances x scale.
//
// ⚠️ THESE ARE ESTIMATES AND ARE NOT YET VALIDATED. An ellipse is a model of a
// torso, not a torso. Before customers rely on the numbers, compare against
// tape measurements on 5-10 real women and set CALIBRATION below from the
// mean ratio tape/estimate. Until then every number is labelled "estimated"
// and the tailor confirms on WhatsApp. NEVER tune these factors by feel.

export type Landmark = { x: number; y: number; visibility?: number }; // x,y normalised 0..1

export type View = {
  /** Person mask, row-major, 1 = person. width*height entries. */
  mask: Uint8Array;
  width: number;
  height: number;
  /** MediaPipe pose landmarks (33), normalised to the image. */
  landmarks: Landmark[];
};

export type Estimate = {
  bust: number;
  waist: number;
  hip: number;
  height: number;
  shoulder: number;
  sleeve: number;
  outseam: number; // natural waist to floor
  inseam: number; // crotch to floor
};

/** tape / estimate, per measurement. 1 = uncalibrated. Set from validation data only. */
// hip / waist: ANSUR II women (1,986, public CSV), real circumference divided
// by the ellipse through the same breadth and depth: buttock 1.0966 (sd
// 0.0175), waist 1.0610 (sd 0.0221). The ellipse systematically
// under-reads; founder's own photos read hip 86 against her tape 100
// (2026-11-13). Bust is NOT corrected yet: ANSUR's chest ratio is 1.165 and
// would move a bust by ~15cm, too much to apply without a tape check.
export const CALIBRATION: Record<keyof Estimate, number> = {
  bust: 1,
  waist: 1,
  hip: 1,
  height: 1,
  shoulder: 1,
  sleeve: 1,
  outseam: 1,
  inseam: 1,
};

// MediaPipe pose landmark indices.
const L = {
  nose: 0,
  lShoulder: 11,
  rShoulder: 12,
  lElbow: 13,
  rElbow: 14,
  lWrist: 15,
  rWrist: 16,
  lHip: 23,
  rHip: 24,
  lAnkle: 27,
  rAnkle: 28,
} as const;

export type Problem =
  | "no-person"
  | "not-full-body"
  | "front-not-facing"
  | "side-not-profile"
  | "arms-touching"
  | "legs-together"
  | "implausible";

export class MeasureError extends Error {
  constructor(
    public problem: Problem,
    public view: "front" | "side" | "both",
  ) {
    super(`${view}: ${problem}`);
  }
}

/** First and last row containing any person pixel. */
export function verticalExtent(v: View): { top: number; bottom: number } | null {
  let top = -1;
  let bottom = -1;
  for (let y = 0; y < v.height; y++) {
    const row = y * v.width;
    for (let x = 0; x < v.width; x++) {
      if (v.mask[row + x]) {
        if (top < 0) top = y;
        bottom = y;
        break;
      }
    }
  }
  return top < 0 ? null : { top, bottom };
}

/**
 * Width of the contiguous run of person pixels on row y that contains column
 * cx (or the nearest person pixel to it). Taking the run, not the outermost
 * pixels, is what keeps arms held away from the body out of a torso width.
 */
export function runWidthAt(v: View, y: number, cx: number): number {
  const yi = Math.round(y);
  if (yi < 0 || yi >= v.height) return 0;
  const row = yi * v.width;
  let c = Math.round(cx);
  if (c < 0 || c >= v.width || !v.mask[row + c]) {
    // nearest person pixel within 10% of the width
    const reach = Math.round(v.width * 0.1);
    let found = -1;
    for (let d = 1; d <= reach && found < 0; d++) {
      if (c - d >= 0 && v.mask[row + c - d]) found = c - d;
      else if (c + d < v.width && v.mask[row + c + d]) found = c + d;
    }
    if (found < 0) return 0;
    c = found;
  }
  let l = c;
  let r = c;
  while (l > 0 && v.mask[row + l - 1]) l--;
  while (r < v.width - 1 && v.mask[row + r + 1]) r++;
  return r - l + 1;
}

/** Left and right edge of the run containing cx on row y, or null. */
export function runEdgesAt(v: View, y: number, cx: number): { l: number; r: number } | null {
  const w = runWidthAt(v, y, cx);
  if (!w) return null;
  const yi = Math.round(y);
  const row = yi * v.width;
  let c = Math.round(cx);
  if (c < 0 || c >= v.width || !v.mask[row + c]) {
    const reach = Math.round(v.width * 0.1);
    for (let d = 1; d <= reach; d++) {
      if (c - d >= 0 && v.mask[row + c - d]) { c = c - d; break; }
      if (c + d < v.width && v.mask[row + c + d]) { c = c + d; break; }
    }
  }
  let l = c;
  let r = c;
  while (l > 0 && v.mask[row + l - 1]) l--;
  while (r < v.width - 1 && v.mask[row + r + 1]) r++;
  return { l, r };
}

/** Mean of a few rows around y, to smooth a ragged mask edge. */
function smoothWidth(v: View, y: number, cx: number): number {
  let s = 0;
  let n = 0;
  for (let d = -2; d <= 2; d++) {
    const w = runWidthAt(v, y + d, cx);
    if (w > 0) {
      s += w;
      n++;
    }
  }
  return n ? s / n : 0;
}

/** Ramanujan's approximation for the perimeter of an ellipse with axes a, b (full widths). */
export function ellipsePerimeter(width: number, depth: number): number {
  const a = width / 2;
  const b = depth / 2;
  return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
}

const px = (v: View, p: Landmark) => ({ x: p.x * v.width, y: p.y * v.height });
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

function checkFull(v: View, view: "front" | "side") {
  const ext = verticalExtent(v);
  if (!ext || v.landmarks.length < 33) throw new MeasureError("no-person", view);
  // Head and feet must both be inside the frame with a little margin, or the
  // height (and so the scale) is wrong.
  if (ext.top < v.height * 0.005 || ext.bottom > v.height * 0.995)
    throw new MeasureError("not-full-body", view);
  // One of each PAIR must be visible, not both: in profile the far shoulder,
  // hip and ankle are hidden behind the body by definition (realistic test
  // photos, 2026-11-13, were all refused as "not full body" for this).
  const vis = (i: number) => v.landmarks[i].visibility ?? 1;
  for (const [a, b] of [
    [L.lShoulder, L.rShoulder],
    [L.lHip, L.rHip],
    [L.lAnkle, L.rAnkle],
  ]) {
    if (Math.max(vis(a), vis(b)) < 0.3) throw new MeasureError("not-full-body", view);
  }
  return ext;
}

/**
 * The whole estimate. Throws MeasureError with a problem the UI can turn into
 * a plain instruction ("step back so your feet are in the photo").
 */
export function estimate(front: View, side: View, heightCm: number): Estimate {
  const fe = checkFull(front, "front");
  const se = checkFull(side, "side");
  const fH = fe.bottom - fe.top;
  const sH = se.bottom - se.top;
  const fScale = heightCm / fH;
  const sScale = heightCm / sH;

  const f = (i: number) => px(front, front.landmarks[i]);
  const s = (i: number) => px(side, side.landmarks[i]);

  const fShoulderL = f(L.lShoulder);
  const fShoulderR = f(L.rShoulder);
  const fHipL = f(L.lHip);
  const fHipR = f(L.rHip);
  const fShoulder = mid(fShoulderL, fShoulderR);
  const fHip = mid(fHipL, fHipR);

  // Facing the camera: shoulders well apart relative to height.
  if (dist(fShoulderL, fShoulderR) / fH < 0.12) throw new MeasureError("front-not-facing", "front");
  // A-POSE IS REQUIRED, and it is checked rather than hoped for. Measured on
  // a test photo (2026-11-13): with the arms hanging close, the bust row ran
  // straight through the upper arms (front width flat at ~38cm from shoulder
  // to bust) and the bust came out ~10cm high; with the legs together the
  // first gap between them was at the KNEE, and the inside leg read 47cm.
  // Arms ~45deg out and feet apart remove both, the same pose measuring apps
  // ask for.
  // ⚠️ POSE IS TOLERATED, NOT POLICED (founder, 2026-11-13: "not every
  // customer will stand perfectly like that"). Arms hanging against the body
  // are cut out of the front width below (arm lines), so the only pose still
  // refused is hands raised ABOVE the shoulders, which puts the arms across
  // the shoulder row.
  for (const wr of [L.lWrist, L.rWrist]) {
    if (f(wr).y < Math.min(fShoulderL.y, fShoulderR.y)) throw new MeasureError("arms-touching", "front");
  }
  // Feet together is NOT rejected (founder, 2026-11-13: being sent back to
  // photo 1 again and again is what makes people give up). It only means the
  // inside leg cannot be seen, so it is left blank (0) for us to confirm.
  const feetApart = Math.abs(f(L.lAnkle).x - f(L.rAnkle).x) / fH >= 0.06;
  // In profile: shoulders nearly on top of each other.
  if (Math.abs(s(L.lShoulder).x - s(L.rShoulder).x) / sH > 0.09)
    throw new MeasureError("side-not-profile", "side");

  // Fractions of height (0 = top of head) for the bands.
  const frac = (y: number) => (y - fe.top) / fH;
  const shoulderF = frac(fShoulder.y);
  const hipF = frac(fHip.y);
  const torso = hipF - shoulderF;
  if (torso <= 0.1) throw new MeasureError("implausible", "front");

  // Body centre column at a given fraction, per view.
  const fCx = (fr: number) => {
    const t = (fr - shoulderF) / torso;
    return fShoulder.x + (fHip.x - fShoulder.x) * Math.max(0, Math.min(1.3, t));
  };
  const sShoulder = mid(s(L.lShoulder), s(L.rShoulder));
  const sHip = mid(s(L.lHip), s(L.rHip));
  const sFrac = (y: number) => (y - se.top) / sH;
  const sShoulderF = sFrac(sShoulder.y);
  const sHipF = sFrac(sHip.y);
  const sCx = (fr: number) => {
    const t = (fr - sShoulderF) / Math.max(0.1, sHipF - sShoulderF);
    return sShoulder.x + (sHip.x - sShoulder.x) * Math.max(0, Math.min(1.3, t));
  };

  const fRow = (fr: number) => fe.top + fr * fH;
  const sRow = (fr: number) => se.top + fr * sH;
  // ⚠️ ARMS ARE CUT OUT OF THE FRONT WIDTH. Even in an A-pose the upper arm
  // touches the body just under the armpit, so the raw silhouette at bust
  // level is torso + both arms: the test photo read bust 110 for a slim
  // model. Each arm is a line shoulder -> elbow -> wrist; the torso edge can
  // be no further out than that line minus half an upper arm. Upper-arm half
  // width = forearm half width (measured where the forearm hangs free)
  // x 1.3, an approximation to be corrected by CALIBRATION, not by feel.
  const armX = (sh: number, el: number, wr: number, y: number) => {
    const a = f(sh), b = f(el), c = f(wr);
    const seg = y <= b.y ? [a, b] : [b, c];
    const t = (y - seg[0].y) / Math.max(1, seg[1].y - seg[0].y);
    return seg[0].x + (seg[1].x - seg[0].x) * Math.max(0, Math.min(1, t));
  };
  // Typical upper-arm half width, from ANSUR II women: flexed biceps
  // circumference = 0.1878 x stature on average, so half its diameter is
  // 0.1878 / (2 pi) = 0.0299 x stature. Used whenever the forearm cannot be
  // measured on its own -- hands resting on the hips make the forearm's run
  // the WHOLE TORSO, and the first version then cut the entire body out
  // (front width 0 on both realistic test photos).
  const typicalHalf = 0.0299 * fH;
  const forearmHalf = (el: number, wr: number) => {
    const m = mid(f(el), f(wr));
    const half = runWidthAt(front, m.y, m.x) / 2;
    return half > 0 && half < typicalHalf ? half : 0;
  };
  const measuredHalf =
    Math.max(forearmHalf(L.lElbow, L.lWrist), forearmHalf(L.rElbow, L.rWrist)) * 1.3;
  const upperHalf = measuredHalf > 0 ? Math.min(measuredHalf, typicalHalf * 1.5) : typicalHalf;
  // Rows where an arm had to be cut out: the front width there is a guess,
  // so the circumference falls back to side depth + height (see below).
  let armsTouched = false;
  const frontWidthPx = (y: number, cx: number) => {
    let sum = 0;
    let n = 0;
    for (let d = -2; d <= 2; d++) {
      const e = runEdgesAt(front, y + d, cx);
      if (!e) continue;
      let { l, r } = e;
      for (const [sh, el, wr] of [
        [L.lShoulder, L.lElbow, L.lWrist],
        [L.rShoulder, L.rElbow, L.rWrist],
      ] as const) {
        const ax = armX(sh, el, wr, y + d);
        const l0 = l;
        const r0 = r;
        if (ax < cx) l = Math.max(l, ax + upperHalf);
        else r = Math.min(r, ax - upperHalf);
        if (l - l0 > 2 || r0 - r > 2) armsTouched = true;
      }
      if (r > l) {
        sum += r - l + 1;
        n++;
      }
    }
    return n ? sum / n : 0;
  };
  const W = (fr: number) => frontWidthPx(fRow(fr), fCx(fr)) * fScale;
  const D = (fr: number) => smoothWidth(side, sRow(fr), sCx(fr)) * sScale;

  // LEVELS. Bust and hip = fullest point in PROFILE (side depth), which the
  // arms never hide. Waist = ANSUR II waist height (omphalion) = 0.6017 x
  // stature (sd 0.0135): the narrowest front width moved with the arms and
  // put the founder's waist 6cm too high (waist-to-floor 108 vs tape 102).
  // ALL THREE LEVELS ARE ANSUR II HEIGHTS, as a fraction of stature:
  // chest 0.7194 (sd 0.0140), waist/omphalion 0.6017 (sd 0.0135), buttock
  // 0.5118 (sd 0.0156). Searching for the "fullest point" instead was fooled
  // by long loose hair down the back in profile (a slim test model read bust
  // 106) and by arms; a fixed level is wrong by ~1.5% of height at most.
  const bustF = 1 - 0.7194;
  const waistF = 1 - 0.6017;
  const hipLevelF = 1 - 0.5118;

  // CIRCUMFERENCES: least-squares fits on ANSUR II women (1,986, public CSV,
  // all in mm), not the ellipse. Two models per level:
  //   depth + breadth   residual sd: bust 21, waist 18, hip 15 mm
  //   depth + stature   residual sd: bust 27, waist 36, hip 35 mm
  // Depth comes from the side photo. The front width is used ONLY when no arm
  // had to be cut out of it; otherwise the depth + height model. Founder's
  // tape (2026-11-13) read waist 76 where front-width-with-arms gave 90.
  const MODELS = {
    // maxDB / maxDS: 99th percentile of depth/breadth and depth/stature in
    // ANSUR II. A side depth beyond them is not a body: it is hair hanging
    // down the back or an arm swung forward (a slim test model with loose
    // long hair read bust 106). Depth is capped there before the model.
    bust: { c: 50.361, depth: 2.32, breadth: 1.198, c2: 153.757, depth2: 2.827, stature: 0.058, maxDB: 1.105, maxDS: 0.1932 },
    waist: { c: 29.56, depth: 1.402, breadth: 1.776, c2: 19.098, depth2: 2.921, stature: 0.135, maxDB: 0.869, maxDS: 0.1853 },
    hip: { c: 74.341, depth: 1.238, breadth: 1.861, c2: 74.845, depth2: 2.586, stature: 0.211, maxDB: 0.786, maxDS: 0.1834 },
  };
  const circ = (m: (typeof MODELS)["bust"], fr: number) => {
    armsTouched = false;
    const wMm = W(fr) * 10;
    const frontOk = !armsTouched && wMm > 0;
    const dMm = Math.min(D(fr) * 10, m.maxDS * heightCm * 10, frontOk ? m.maxDB * wMm : Infinity);
    const mm = frontOk
      ? m.c + m.depth * dMm + m.breadth * wMm
      : m.c2 + m.depth2 * dMm + m.stature * heightCm * 10;
    return mm / 10;
  };
  const bust = circ(MODELS.bust, bustF);
  const waist = circ(MODELS.waist, waistF);
  const hip = circ(MODELS.hip, hipLevelF);

  // Silhouette width at the shoulder joints' row (in an A-pose the arms have
  // already left the body there), not the joint-to-joint distance, which sits
  // inside the shoulder and read 30cm on the test photo.
  const shoulder = smoothWidth(front, fShoulder.y, fShoulder.x) * fScale;
  // ARM LENGTH FROM HEIGHT, NOT FROM THE PHOTO. Joint-to-joint in the photo
  // read 48-52 on every test and 50 against the founder's tape 60: the
  // detected shoulder sits inside the shoulder bone and a hanging arm is
  // foreshortened. ANSUR II women: sleeve outseam = 0.3337 x stature
  // (sd 0.0111, i.e. about +/-2cm at 170cm), tighter than the photo.
  const sleeve = 0.3337 * heightCm;

  const outseam = 0.6017 * heightCm; // ANSUR II waist height, see LEVELS above

  // Crotch: first row below the hip joints where the body centre is background
  // (the gap between the legs).
  let crotchY = -1;
  const crotchLimit = Math.min(fe.bottom, fHip.y + torso * fH * 0.5);
  if (feetApart) {
    for (let y = Math.round(fHip.y); y < crotchLimit; y++) {
      if (!front.mask[y * front.width + Math.round(fHip.x)]) {
        crotchY = y;
        break;
      }
    }
  }
  // No visible gap (feet together, loose trousers): place the crotch from the
  // hip joint instead. ANSUR II, 1,986 women measured by the US Army (public
  // file ANSUR_II_FEMALE_Public.csv, openlab.psu.edu/ansur2): crotch height =
  // trochanterion height - 0.0388 x stature on average (sd 0.0100). The
  // detected hip joint stands in for the trochanter -- an approximation,
  // corrected by CALIBRATION once tape data exists.
  if (crotchY < 0) crotchY = fHip.y + 0.0388 * fH;
  const inseam = (fe.bottom - crotchY) * fScale;

  const raw: Estimate = { bust, waist, hip, height: heightCm, shoulder, sleeve, outseam, inseam };
  const out = {} as Estimate;
  for (const k of Object.keys(raw) as (keyof Estimate)[]) {
    out[k] = Math.round(raw[k] * CALIBRATION[k]);
  }

  // Sanity: the same ranges the manual fields accept, plus ordering a body obeys.
  const ok =
    out.bust >= 60 && out.bust <= 160 &&
    out.waist >= 50 && out.waist <= 150 &&
    out.hip >= 60 && out.hip <= 170 &&
    // No waist < hip rule: some bodies have a waist equal to or above the hip,
    // and the check refused them forever (bug review 2026-11-14).
    out.sleeve > 30 && out.sleeve < 90 &&
    out.inseam > 40 && out.inseam < out.outseam;
  if (!ok) throw new MeasureError("implausible", "both");
  return out;
}
