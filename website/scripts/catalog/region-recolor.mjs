import sharp from "../../node_modules/sharp/dist/index.cjs";

// Region-based recolor. Identifies the garment as a *connected region* grown
// from a seed point, rather than by per-pixel color similarity. This is the
// only thing that works for pale garments: ivory fabric and skin share a hue,
// and fabric in shadow overlaps skin in lightness, so no per-pixel colour rule
// can separate them -- but shadowed fabric is physically contiguous with lit
// fabric, so a flood fill picks it up and never jumps to a disconnected arm.

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

const [, , inputPath, outputPath, seedXStr, seedYStr, targetHex, minLStr] = process.argv;
// Hard lightness floor for the flood fill. Hair is the sneaky leak path on
// pale garments: its saturation is nearly identical to ivory fabric, so the
// saturation test alone lets the fill walk hair -> face -> arms. Fabric stays
// bright even in shadow, while hair and skin sit well below it.
const minL = minLStr ? parseFloat(minLStr) : 0;
const seedX = parseInt(seedXStr, 10);
const seedY = parseInt(seedYStr, 10);

const tr = parseInt(targetHex.slice(1, 3), 16);
const tg = parseInt(targetHex.slice(3, 5), 16);
const tb = parseInt(targetHex.slice(5, 7), 16);
const [targetH, targetS, targetL] = rgbToHsl(tr, tg, tb);

// Remap lightness proportionally so the recolor can cross between pale and
// dark colours (ivory <-> navy), not just swap hue within one brightness
// family. Multiplicative in the darkening direction and mirrored in the
// lightening direction, so folds and highlights keep their relative order
// instead of clipping to a flat block of colour.
function remapLightness(l, fromL, toL) {
  if (toL <= fromL) return l * (toL / Math.max(fromL, 0.01));
  return 1 - (1 - l) * ((1 - toL) / Math.max(1 - fromL, 0.01));
}

const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const px = (x, y) => {
  const i = (y * width + x) * channels;
  return rgbToHsl(data[i], data[i + 1], data[i + 2]);
};

const [seedH, seedS, seedL] = px(seedX, seedY);
console.error(`seed hsl: h=${seedH.toFixed(1)} s=${seedS.toFixed(2)} l=${seedL.toFixed(2)}`);

// Classifiers for the two things the garment must never bleed into.
const isBackground = (h, s, l) => s < 0.06 && l > 0.85;
// Skin/hair: warm hue, clearly more saturated than the fabric, and darker.
const isSkin = (h, s, l) => (h < 45 || h > 330) && s > seedS + 0.06 && l < 0.68;

const inRegion = new Uint8Array(width * height);
const stack = [seedY * width + seedX];
inRegion[seedY * width + seedX] = 1;

while (stack.length) {
  const idx = stack.pop();
  const x = idx % width;
  const y = (idx - x) / width;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const nidx = ny * width + nx;
    if (inRegion[nidx]) continue;
    const [h, s, l] = px(nx, ny);
    if (l < minL) continue;
    if (isBackground(h, s, l) || isSkin(h, s, l)) continue;
    inRegion[nidx] = 1;
    stack.push(nidx);
  }
}

let count = 0;
for (let i = 0; i < inRegion.length; i++) if (inRegion[i]) count++;
console.error(`region: ${count} / ${width * height} px (${(100 * count / (width * height)).toFixed(1)}%)`);

const out = Buffer.from(data);
for (let i = 0; i < inRegion.length; i++) {
  if (!inRegion[i]) continue;
  const o = i * channels;
  const [h, s, l] = rgbToHsl(data[o], data[o + 1], data[o + 2]);
  const newS = Math.min(1, s * (targetS / Math.max(seedS, 0.01)));
  const newL = Math.max(0, Math.min(1, remapLightness(l, seedL, targetL)));
  const [nr, ng, nb] = hslToRgb(targetH, newS, newL);
  out[o] = Math.round(nr);
  out[o + 1] = Math.round(ng);
  out[o + 2] = Math.round(nb);
}

await sharp(out, { raw: { width, height, channels } })
  .toFormat(inputPath.endsWith(".png") ? "png" : "jpeg")
  .toFile(outputPath);

console.log("wrote", outputPath);
