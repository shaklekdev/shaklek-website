// Put every cell of a colourway on the SAME colour.
//
//   node scripts/catalog/colourways/normalise-set.mjs <files...> [--apply]
//
// ⚠️ FOUR CELLS GENERATED SEPARATELY PICK FOUR DIFFERENT NAVIES. Nothing in the
// prompt forces them to agree, and they did not: measured inside the garment,
// s=0.39 / 0.49 / 0.39 / 0.28 and l=0.14 / 0.13 / 0.14 / 0.11 across one set.
// The founder saw it immediately -- "the blue color of midi wide sleeves is not
// the same as the rest" -- while every individual cell measured fine against
// the target on its own. A per-cell check cannot find a per-SET problem.
//
// This is CLAUDE.md §3's two-master strategy arriving too late: when cells are
// derived from one master they match BY CONSTRUCTION. When they are generated
// independently they have to be reconciled afterwards, which is this file.
//
// ⚠️ IT SHIFTS, IT DOES NOT REPAINT. Each pixel keeps its own deviation from
// its cell's mean and receives the set's mean instead, so every fold, slub and
// shadow survives untouched. Hue is rotated by a constant, saturation and
// lightness are offset. Nothing is regenerated and nothing costs money.
//
// ⚠️ THE TARGET IS THE SET'S OWN MEDIAN, not a swatch. Recolouring to a hex is
// the mistake that produced a paint-bucket fill earlier in this same session.
// The median cell is a real photograph of the real fabric; the others move to
// meet it.

import path from "node:path";
import sharp from "sharp";

const APPLY = process.argv.includes("--apply");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));

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
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** The garment: dark saturated pixels below the face band. Same test the mask
 *  builder uses, so "the garment" means the same thing everywhere. */
async function read(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const faceCut = Math.round(h * 0.15);
  let x = 0, y = 0, n = 0;
  for (let py = faceCut; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 3;
      const [hu, s, l] = rgb2hsl(data[i], data[i + 1], data[i + 2]);
      if (l > 0.40 || s < 0.25) continue;
      x += Math.cos((hu * Math.PI) / 180); y += Math.sin((hu * Math.PI) / 180); n++;
    }
  }
  let hue = (Math.atan2(y / n, x / n) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  // The garment mask, and its mean h/s/l.
  const mask = new Uint8Array(w * h);
  let hx = 0, hy = 0, ss = 0, ls = 0, c = 0;
  for (let py = faceCut; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 3;
      const [hu, s, l] = rgb2hsl(data[i], data[i + 1], data[i + 2]);
      if (l > 0.62 || s < 0.10 || hueDist(hu, hue) > 20) continue;
      mask[py * w + px] = 1;
      hx += Math.cos((hu * Math.PI) / 180); hy += Math.sin((hu * Math.PI) / 180);
      ss += s; ls += l; c++;
    }
  }
  let mh = (Math.atan2(hy / c, hx / c) * 180) / Math.PI;
  if (mh < 0) mh += 360;
  // ⚠️ `hue`, not `h`. Returning the mean hue as `h` silently overwrote the
  // image HEIGHT in the same object, and the only symptom was sharp refusing a
  // raw buffer three functions later. Two meanings for one letter.
  return { data, w, h, mask, hue: mh, s: ss / c, l: ls / c, n: c };
}

const cells = [];
for (const f of files) cells.push({ file: f, ...(await read(f)) });

const median = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
// Hue median as a vector, because a set straddling 0 has no arithmetic median.
let tx = 0, ty = 0;
for (const c of cells) { tx += Math.cos((c.hue * Math.PI) / 180); ty += Math.sin((c.hue * Math.PI) / 180); }
let TH = (Math.atan2(ty / cells.length, tx / cells.length) * 180) / Math.PI;
if (TH < 0) TH += 360;
const TS = median(cells.map((c) => c.s));
const TL = median(cells.map((c) => c.l));

console.log(`set target  h=${TH.toFixed(0)}  s=${TS.toFixed(2)}  l=${TL.toFixed(2)}\n`);

for (const c of cells) {
  const dh = TH - c.hue, ds = TS - c.s, dl = TL - c.l;
  console.log(
    `${path.basename(c.file).padEnd(26)} h ${c.hue.toFixed(0)} s ${c.s.toFixed(2)} l ${c.l.toFixed(2)}` +
      `   shift  h ${dh >= 0 ? "+" : ""}${dh.toFixed(0)}  s ${ds >= 0 ? "+" : ""}${ds.toFixed(2)}  l ${dl >= 0 ? "+" : ""}${dl.toFixed(2)}`,
  );
  if (!APPLY) continue;

  const out = Buffer.from(c.data);
  for (let i = 0; i < c.mask.length; i++) {
    if (!c.mask[i]) continue;
    const p = i * 3;
    const [hu, s, l] = rgb2hsl(c.data[p], c.data[p + 1], c.data[p + 2]);
    // Each pixel keeps its own deviation and gains the set's mean.
    const [r, g, b] = hsl2rgb(
      hu + dh,
      Math.min(1, Math.max(0, s + ds)),
      Math.min(0.995, Math.max(0.005, l + dl)),
    );
    out[p] = Math.round(r); out[p + 1] = Math.round(g); out[p + 2] = Math.round(b);
  }
  const dest = c.file.replace(/\.(jpg|png)$/i, "-norm.jpg");
  await sharp(out, { raw: { width: c.w, height: c.h, channels: 3 } })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(dest);
}
console.log(APPLY ? "\nWritten with -norm names." : "\nDry run. Re-run with --apply.");
