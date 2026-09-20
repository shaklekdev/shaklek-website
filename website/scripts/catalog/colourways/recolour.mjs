// Every colourway, from the masks she corrected. No Photoshop involved.
//
//   node scripts/catalog/colourways/recolour.mjs            all missing colours
//   node scripts/catalog/colourways/recolour.mjs --only Navy
//
// ⚠️ THIS IS A RECOLOUR, NOT A REGENERATION, AND THE DIFFERENCE IS THE PRODUCT.
// Each pixel keeps its own LUMINOSITY and receives the target's hue and
// saturation, so every fold, crease and slub of the linen survives exactly. The
// generative attempt on 2026-09-19 flattened the weave and invented a hem that
// is not on the garment: "back pictures are a total messs, you only had to
// recolor wtf".
//
// ⚠️ LUMINOSITY IS REMAPPED, NOT REPLACED. Setting every masked pixel to the
// target's lightness would produce a flat silhouette. The garment's own
// lightness spread is measured inside the mask and rescaled onto the target's,
// so contrast is preserved and only the level moves.
//
// ⚠️ DARK TO LIGHT IS THE RISKY DIRECTION AND IT IS NOT A BUG TO FIX HERE. The
// Open Abaya is burgundy at l~0.25 and Ivory sits at l~0.94; stretching that
// far amplifies whatever noise the shadows hold. `contrastKeep` limits how much
// the spread is allowed to grow. Judge Open Abaya / Ivory before trusting the
// batch -- if the linen goes plastic there, that colourway wants a real
// photograph, not a recolour.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import { COLORS } from "./_shared.mjs";

const WORK = process.env.SHAKLEK_MASK_DIR ?? path.join(os.homedir(), "Shaklek-colourways");
const OUT = path.join(WORK, "out");
const only = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;

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
function hsl2rgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

const CONTRAST_KEEP = 1.35;

export async function recolourOne(jpegPath, maskPath, target, outPath) {
  const hex = COLORS[target];
  const [tr, tg, tb] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
  const [th, ts, tl] = rgb2hsl(tr, tg, tb);

  const { data, info } = await sharp(jpegPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // A soft mask, not a hard one: the blur gives a feathered edge so the new
  // colour does not leave a staircase against skin or backdrop. Values in
  // between are blend weights, which is exactly what a feather is.
  const soft = await sharp(maskPath).resize(w, h).greyscale().blur(1.4).raw().toBuffer();
  if (soft.length !== w * h) throw new Error(`mask came back ${soft.length / (w * h)} channels`);

  // Measure the garment's own lightness inside the mask before changing it.
  let sum = 0, sum2 = 0, n = 0;
  for (let i = 0; i < soft.length; i++) {
    if (soft[i] < 200) continue;
    const l = rgb2hsl(data[i * 3], data[i * 3 + 1], data[i * 3 + 2])[2];
    sum += l; sum2 += l * l; n++;
  }
  if (!n) throw new Error(`${path.basename(maskPath)}: mask is empty`);
  const mean = sum / n;
  const sd = Math.sqrt(Math.max(1e-6, sum2 / n - mean * mean));

  // Target spread: keep the garment's own, but never stretch it more than
  // CONTRAST_KEEP, and never past what the target lightness leaves room for.
  const headroom = Math.min(tl, 1 - tl);
  const scale = Math.min(CONTRAST_KEEP, Math.max(0.6, Math.min(headroom / (2.2 * sd), CONTRAST_KEEP)));

  const out = Buffer.from(data);
  for (let i = 0; i < soft.length; i++) {
    const a = soft[i] / 255;
    if (a < 0.004) continue;
    const p = i * 3;
    const [, , l] = rgb2hsl(data[p], data[p + 1], data[p + 2]);
    const nl = Math.min(0.995, Math.max(0.005, tl + (l - mean) * scale));
    const [nr, ng, nb] = hsl2rgb(th, ts, nl);
    out[p] = Math.round(data[p] * (1 - a) + nr * a);
    out[p + 1] = Math.round(data[p + 1] * (1 - a) + ng * a);
    out[p + 2] = Math.round(data[p + 2] * (1 - a) + nb * a);
  }

  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outPath);
  return { mean, sd, scale };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const manifest = JSON.parse(await readFile(path.join(WORK, "manifest.json"), "utf8"));
  await mkdir(OUT, { recursive: true });
  let n = 0;
  for (const f of manifest.files) {
    const jpeg = path.join(WORK, `${f.stem}.jpg`);
    const mask = path.join(WORK, `${f.stem}-mask.png`);
    if (!existsSync(mask)) { console.log(`SKIP ${f.stem}: no mask`); continue; }
    for (const target of f.targets) {
      if (only && target !== only) continue;
      const name = f.stem.replace(
        new RegExp(`-${f.sourceColour.toLowerCase()}-`),
        `-${target.toLowerCase()}-`,
      );
      const r = await recolourOne(jpeg, mask, target, path.join(OUT, `${name}.jpg`));
      console.log(`${name}.jpg   garment l ${r.mean.toFixed(2)} sd ${r.sd.toFixed(3)} -> scale ${r.scale.toFixed(2)}`);
      n++;
    }
  }
  console.log(`\n${n} files in ${OUT}`);
}
