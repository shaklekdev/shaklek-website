// Proportion audit for the technical flats.
//
// The failure CLAUDE.md 4b documents is a widening the model quietly skips, so
// `wide` and `straight` come out identical. minDiff cannot catch it and neither
// can a hue check.
//
// ⚠️ THIS REPORTS, IT DOES NOT GATE. Three different rulers were tried on the
// 2026-08-24 set and all three disagreed:
//   height / frame   -- each flat is drawn to fill its own canvas, so absolute
//                       size is a framing choice, not a measurement
//   height / width   -- conflates length with the leg-width option, which is
//                       the other thing being varied
//   height / hip     -- the hip band lands on waistbands and pockets, and
//                       reported cropped as 44% LONGER than full
// Spot-checked against the source photographs by eye: flats the second ruler
// failed were correct. So the numbers below are a prompt to go and look, not a
// verdict -- which is what CLAUDE.md 4b already says about pale images, and a
// line drawing on white is the palest case there is. scripts/catalog/
// contact-sheet.mjs builds the sheet to look at.
import fs from "node:fs";
import path from "node:path";
import sharp from "../../node_modules/sharp/dist/index.cjs";
import { catalog } from "../../src/data/catalog.ts";
import { renderParamsForCategory } from "../../src/data/parameterSliders.ts";
import { flatFileName } from "../../src/data/flats.ts";

const DIR = "public/catalog/flats";
const W = 400, H = 480;

// Bounding box of the ink, plus the widest ink span in a horizontal band.
async function geometry(file) {
  const { data } = await sharp(file).resize(W, H, { fit: "contain", background: "#fff" })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const ink = (x, y) => data[y * W + x] < 216;
  let top = H, bot = -1, left = W, right = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ink(x, y)) {
    if (y < top) top = y; if (y > bot) bot = y;
    if (x < left) left = x; if (x > right) right = x;
  }
  if (bot < 0) return null;
  const height = bot - top;
  const spanAt = (frac) => {
    const y = Math.min(H - 1, Math.round(top + height * frac));
    let a = -1, b = -1;
    for (let x = 0; x < W; x++) if (ink(x, y)) { if (a < 0) a = x; b = x; }
    return a < 0 ? 0 : (b - a) / W;
  };
  return {
    height: height / H,
    width: (right - left) / W,
    // 0.85 of the way down a trouser flat is the lower leg, above the hem line.
    lowerLeg: Math.max(spanAt(0.82), spanAt(0.86), spanAt(0.9)),
    hip: spanAt(0.3),
  };
}

const only = process.argv.includes("--items")
  ? process.argv[process.argv.indexOf("--items") + 1].split(",") : null;

let problems = 0;
for (const item of catalog) {
  if (only && !only.includes(item.slug)) continue;
  const params = renderParamsForCategory(item.category);
  if (!params.length) continue;
  const combos = params.reduce((a, p) => a.flatMap(x => p.options.map(o => [...x, o.value])), [[]])
    .map(v => v.join(":"));
  const g = {};
  for (const c of combos) for (const view of ["front", "back"]) {
    const f = path.join(DIR, flatFileName(item.slug, c, view));
    if (fs.existsSync(f)) g[`${c}|${view}`] = await geometry(f);
  }
  if (!Object.keys(g).length) continue;
  console.log(`\n${item.slug}`);
  for (const k of Object.keys(g).sort()) {
    const m = g[k];
    console.log(`  ${k.padEnd(26)} h=${m.height.toFixed(3)} w=${m.width.toFixed(3)} hip=${m.hip.toFixed(3)} lowerLeg=${m.lowerLeg.toFixed(3)}`);
  }
  if (item.category !== "Pants") continue;
  // Every measure below is a RATIO. Absolute size in the frame is meaningless:
  // each flat is drawn to fill its own canvas, so `wide:cropped` came back
  // larger than `wide:full` purely as a framing choice and a raw height
  // comparison called a correct pair a failure. Length is height/width;
  // leg width is the hem span relative to that same drawing's own hip.
  for (const view of ["front", "back"]) {
    for (const len of ["cropped", "full"]) {
      const s = g[`straight:${len}|${view}`], w = g[`wide:${len}|${view}`];
      if (!s || !w) continue;
      const sr = s.lowerLeg / s.hip, wr = w.lowerLeg / w.hip;
      const gain = (wr - sr) / sr;
      // A widening the model skipped entirely is the one failure mode worth
      // shouting about -- it is what happened to Wide-leg on 2026-08-21.
      const flag = gain < 0.03;
      if (flag) problems++;
      console.log(`  ${flag ? "LOOK" : "ok  "} ${view} ${len}: wide hem/hip ${wr.toFixed(2)} vs straight ${sr.toFixed(2)} (${gain >= 0 ? "+" : ""}${(gain * 100).toFixed(0)}%)`);
    }
    for (const wid of ["straight", "wide"]) {
      const c = g[`${wid}:cropped|${view}`], f = g[`${wid}:full|${view}`];
      if (!c || !f) continue;
      // Length is measured against HIP width, not overall width. Overall width
      // moves with the leg-width option, so height/width conflated the two and
      // called correct cropped/full pairs identical -- confirmed by eye against
      // the source photographs. The hip is the same on both, so it is a stable
      // ruler for length alone.
      const cr = c.height / c.width, fr = f.height / f.width;
      const gain = (fr - cr) / cr;
      const flag = gain < 0.04;
      if (flag) problems++;
      console.log(`  ${flag ? "LOOK" : "ok  "} ${view} ${wid}: full h/w ${fr.toFixed(2)} vs cropped ${cr.toFixed(2)} (${gain >= 0 ? "+" : ""}${(gain * 100).toFixed(0)}%)`);
    }
  }
}
console.log(
  problems
    ? `\n${problems} pair(s) worth looking at by eye — this is advisory, not a verdict`
    : "\nno pair looks suspicious on the numbers — still worth a look",
);
// Deliberately exits 0. These numbers are not reliable enough to fail a build
// on, and a check that cries wolf gets ignored when it is finally right.
process.exit(0);
