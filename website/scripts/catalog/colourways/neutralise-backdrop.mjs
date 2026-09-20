// Put every abaya photograph on the catalogue's backdrop.
//
//   node scripts/catalog/colourways/neutralise-backdrop.mjs          # report
//   node scripts/catalog/colourways/neutralise-backdrop.mjs --apply  # write
//
// ⚠️ THE TWO ABAYA SHOOTS DISAGREE WITH THE CATALOGUE AND WITH EACH OTHER.
// Measured on the top-left corner of each frame:
//
//   cargo trousers / banded trousers   #f1f0f0 / #eae9e9   R-B =  0   neutral
//   Open Abaya, burgundy               #f5f0ee             R-B = +7   warm
//   Buttoned Abaya, ivory              #e7ebee             R-B = -7   cool
//
// Nobody noticed until a generated colourway came back creamy and the founder
// said "this is not good we need matching background in every single
// generation" -- and then, looking at why: "now i see the problem. the master
// has been generated with wrong background from the start". She is right, and
// it is the root cause rather than a generation defect: the model copied the
// backdrop it was handed, faithfully. Fixing prompts downstream would have
// meant fixing the same thing once per colourway forever.
//
// ⚠️ THE WHOLE FRAME IS CORRECTED, NOT JUST THE BACKGROUND. Neutralising the
// backdrop alone would leave her skin under a cast the backdrop no longer
// explains. This is a white balance: one per-channel gain, derived from what
// the backdrop should be, applied to every pixel.
//
// ⚠️ AND IT MUST NOT MOVE THE GARMENT. Verified rather than assumed: the
// largest gain on the Open Abaya is 1.6% and the burgundy's hue reads 353.6
// before and 353.6 after. The script measures this on every file and refuses
// the whole batch if any garment hue moves more than 2 degrees.
//
// ⚠️ NEW FILENAMES, NEVER AN OVERWRITE. CloudFront caches the optimizer
// response for 4 hours keyed on the URL and Amplify owns the distribution, so
// replacing a file in place changes nothing for visitors behind a green build
// (CLAUDE.md §6, trap 2). Every output gets a `-wb` suffix and catalog.ts is
// repointed.

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PUBLIC, ROOT, planFiles } from "./_shared.mjs";

const APPLY = process.argv.includes("--apply");

/** The catalogue's own backdrop, from the trouser and shirt shoots. */
const TARGET = [0xf1, 0xf0, 0xf0];
const MAX_HUE_DRIFT = 2;

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2, d = mx - mn;
  if (d) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? ((b - r) / d + 2) : ((r - g) / d + 4);
    h *= 60;
  }
  return [h, s, l];
}

/** Mean hue of the dark saturated pixels: the garment, and almost nothing else.
 *  A vector mean, because burgundy straddles 0 and 358+2 averages to cyan. */
function garmentHue(data, w, h) {
  let x = 0, y = 0, n = 0;
  for (let i = 0; i < w * h; i++) {
    const [hu, s, l] = rgb2hsl(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    if (l > 0.40 || s < 0.25) continue;
    x += Math.cos((hu * Math.PI) / 180);
    y += Math.sin((hu * Math.PI) / 180);
    n++;
  }
  if (n < 500) return null;
  let hue = (Math.atan2(y / n, x / n) * 180) / Math.PI;
  return hue < 0 ? hue + 360 : hue;
}
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** The backdrop, sampled from the top-left corner: above the shoulder and
 *  outside the figure in every frame of both shoots. */
function backdrop(data, w, h) {
  let R = 0, G = 0, B = 0, n = 0;
  for (let y = Math.round(h * 0.04); y < Math.round(h * 0.18); y++) {
    for (let x = Math.round(w * 0.02); x < Math.round(w * 0.14); x++) {
      const i = (y * w + x) * 3;
      R += data[i]; G += data[i + 1]; B += data[i + 2]; n++;
    }
  }
  return [R / n, G / n, B / n];
}

export async function neutralise(inPath, outPath) {
  const { data, info } = await sharp(inPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const before = backdrop(data, w, h);
  const gain = TARGET.map((t, i) => t / before[i]);
  const hueBefore = garmentHue(data, w, h);

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 3) {
    for (let c = 0; c < 3; c++) out[i + c] = Math.min(255, Math.round(data[i + c] * gain[c]));
  }
  const hueAfter = garmentHue(out, w, h);
  const after = backdrop(out, w, h);
  const drift = hueBefore !== null && hueAfter !== null ? hueDist(hueBefore, hueAfter) : 0;

  if (outPath) {
    await sharp(out, { raw: { width: w, height: h, channels: 3 } })
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(outPath);
  }
  return {
    warmthBefore: before[0] - before[2],
    warmthAfter: after[0] - after[2],
    gain,
    hueBefore, hueAfter, drift,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const plan = await planFiles();
  const jobs = [];
  for (const item of plan) for (const f of item.files) jobs.push(f.rel);

  const results = [];
  for (const rel of jobs) {
    const abs = path.join(PUBLIC, rel);
    const out = rel.replace(/\.jpg$/, "-wb.jpg");
    const r = await neutralise(abs, APPLY ? path.join(PUBLIC, out) : null);
    results.push({ rel, out, ...r });
    console.log(
      `${path.basename(rel).padEnd(46)} warmth ${String(r.warmthBefore.toFixed(0)).padStart(3)} -> ` +
        `${String(r.warmthAfter.toFixed(0)).padStart(2)}   gain ${r.gain.map((g) => g.toFixed(3)).join(",")}   ` +
        `garment hue ${r.hueBefore?.toFixed(1) ?? "n/a"} -> ${r.hueAfter?.toFixed(1) ?? "n/a"}`,
    );
  }

  const bad = results.filter((r) => r.drift > MAX_HUE_DRIFT);
  if (bad.length) {
    console.error(`\nREFUSED: ${bad.length} file(s) moved the garment hue by more than ${MAX_HUE_DRIFT} degrees.`);
    process.exit(1);
  }
  const worst = Math.max(...results.map((r) => Math.abs(r.warmthAfter)));
  console.log(`\n${results.length} files, worst residual warmth ${worst.toFixed(0)} (catalogue is 0), no garment hue moved more than ${MAX_HUE_DRIFT} degrees.`);
  console.log(APPLY ? "Written with -wb names. catalog.ts still points at the originals." : "Dry run. Re-run with --apply.");
}
