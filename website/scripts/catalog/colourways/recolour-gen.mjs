// Generative recolour of ONE approved ivory photograph onto a real linen swatch.
//
//   node recolour-gen.mjs --src <ivory.jpg> --colour Navy --garment "abaya" --keep "..." --out <file.jpg> [--pro] [--dry]
//
// WHY THIS AND NOT recolour.mjs. The deterministic recolour needs a hand-made
// mask per photograph, and the September navy pass on the Buttoned Abaya shows
// what an unrefined mask does: ivory holes on the sleeve and hip, the feet and
// floor painted blue. Nobody refined the masks, so it never shipped.
//
// WHY THIS AND NOT generate-cell.mjs. That one is written for the Open Abaya's
// garment and lets "the pose and the model differ". Here the ivory photograph is
// already approved, so the job is narrower: SAME photograph, only the garment's
// colour changes. Hem, sleeve, pose and backdrop then match the ivory cell by
// construction instead of by measurement.
//
// ⚠️ THE COLOUR REFERENCE IS THE REAL CLOTH (public/fabric/linen-<c>.jpg), never a
// hex and never another catalogue photo. generate-cell.mjs referenced the cargo
// navy, which was itself generated against the old #0a2d4a petrol navy.
//
// ⚠️ AND THE CHECK RUNS ON WHAT CHANGED, NOT ON A CROP. "Garment" = pixels whose
// lightness fell by more than 0.25 from the ivory source. That region's hue is
// compared with the swatch, and everything OUTSIDE it must be near-identical to
// the source (mean diff <= 8; a DIFFERENT photo on the same pale backdrop
// measured 14.4), which catches a model that re-rendered the frame (§7: a masked
// edit called "a real success" had regenerated the face).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const src = arg("src"), colour = arg("colour", "Navy"), garment = arg("garment"), keep = arg("keep", ""), out = arg("out");
const PRO = process.argv.includes("--pro"), DRY = process.argv.includes("--dry");
if (!src || !garment || !out) throw new Error("--src, --garment and --out are required");

const WEBSITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
const swatch = path.join(WEBSITE, `public/fabric/linen-${colour.toLowerCase()}.jpg`);
if (!fs.existsSync(swatch)) throw new Error(`no swatch photograph for ${colour}: ${swatch}`);

// ------------------------------------------------------------ measuring
function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return [h, s, l];
}
const circMedian = (hs) => {
  // Burgundy straddles 0/360, so take the median on a rotated circle.
  const rot = hs.map((h) => (h + 180) % 360).sort((a, b) => a - b);
  const plain = [...hs].sort((a, b) => a - b);
  const spread = (a) => a[Math.floor(a.length * 0.9)] - a[Math.floor(a.length * 0.1)];
  return spread(rot) < spread(plain) ? (rot[rot.length >> 1] + 180) % 360 : plain[plain.length >> 1];
};
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
async function raw(p, w, h) {
  const { data } = await sharp(p).resize(w, h, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return data;
}
export async function swatchHSL(p) {
  const { data } = await sharp(p).resize(200, 200, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const H = [], S = [], L = [];
  for (let i = 0; i < data.length; i += 3) { const [h, s, l] = hsl(data[i], data[i + 1], data[i + 2]); H.push(h); S.push(s); L.push(l); }
  return { h: circMedian(H), s: med(S), l: med(L) };
}
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const ref = await swatchHSL(swatch);

// ------------------------------------------------------------ the words
// Target end state, every element that must stay named (CLAUDE.md §5).
const prompt = `Edit IMAGE 1 and return the SAME photograph with exactly ONE change: the ${garment} she is wearing is now made in the ${colour.toUpperCase()} linen shown in IMAGE 2.

THE COLOUR is the cloth in IMAGE 2: a deep, MUTED ${colour.toLowerCase()} linen, about hue ${ref.h.toFixed(0)}, saturation near ${ref.s.toFixed(2)}, lightness near ${ref.l.toFixed(2)}. Not bright, not electric, not royal, not glossy. Highlights fall soft and greyed. Matte, uniform, and identical in tone across the whole garment, both sides, front panels, sleeves and back.

IT IS LINEN. Keep the weave visible: slubs, grain, soft creases, real shadow inside every fold. Every fold, crease, drape and shadow of the ${garment} stays exactly where it is in IMAGE 1. It must read as the same cloth photographed in a darker dye, not as colour filled in.

EVERYTHING ELSE IS IDENTICAL TO IMAGE 1, pixel for pixel where possible:
- the same woman, the same face, the same expression, the same hair, the same skin tone; her hands and feet keep their natural skin colour
- the same pose, the same framing, the same crop, the same camera angle
- the ${garment}'s exact shape: the same length and hem height, the same sleeve length, the same width, the same neckline, the same seams
- the same shoes${keep ? `\n- ${keep}` : ""}
- the same backdrop and floor, the same light and the same shadow under her. Do NOT tint the background, the floor or the skin.

IMAGE 2 is a flat photograph of the cloth only. Do not copy anything else from it.`;

console.log(`\n${path.basename(src)} -> ${colour}  (${PRO ? "gemini-3-pro-image $0.134" : "flash $0.039"})`);
console.log(`swatch target h=${ref.h.toFixed(0)} s=${ref.s.toFixed(2)} l=${ref.l.toFixed(2)}`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out.replace(/\.[a-z]+$/i, ".prompt.txt"), prompt);
if (DRY) { console.log(prompt); process.exit(0); }

// ------------------------------------------------------------ generate
// --verify <file>: run only the checks on an existing result. Used to test the
// checks themselves against known-bad pictures before trusting a pass.
const VERIFY = arg("verify");
const tmp = out.replace(/\.[a-z]+$/i, ".raw.png");
if (!VERIFY) execFileSync("node", [path.join(WEBSITE, "scripts/catalog/edit2.mjs"), src, swatch, tmp, prompt, PRO ? "gemini-3-pro-image" : "gemini-2.5-flash-image"], {
  stdio: "inherit",
  env: {
    ...process.env,
    EDIT2_INPUT_LABEL: "IMAGE 1 -- the approved catalogue photograph. Return THIS photograph with only the garment colour changed.",
    EDIT2_REF_LABEL: "IMAGE 2 -- the real cloth, for its COLOUR and TEXTURE only. Do not copy anything else from it.",
  },
});

// Back to the source's exact size, so the cell drops in beside its siblings.
const meta = await sharp(src).metadata();
const sized = await sharp(VERIFY ?? tmp).resize(meta.width, meta.height, { fit: "fill" }).removeAlpha().raw().toBuffer();

// ------------------------------------------------------------ tone onto the cloth
// ⚠️ GENERATION LOSES SATURATION GOING IVORY -> DARK. The first three Navy tries
// (2026-10-11) kept shape, face and backdrop perfectly (rest diff 1.4-2.2) and
// came back near-black: s=0.04-0.10 against the swatch's 0.54. So the model is
// trusted for the hard part -- folds, weave and shadow at a new lightness -- and
// the colour is set here, deterministically, from the real cloth.
//
// The mask is free and needs no human: the ivory source says where the garment
// is, because the garment is the only thing that went dark. Skin, backdrop and
// floor did not change, so they get alpha 0 and cannot be tinted -- the failure
// that sank the September pixel recolour ("hands are still blue").
// Lightness is the generation's own; only hue and saturation are set (see
// colors.ts: hue and saturation survive an exposure error, lightness does not).
function hsl2rgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
// ⚠️ IN LAB, NOT HSL. The first toning set HSL hue+saturation to the swatch's
// and kept lightness: every highlight fold then carried s=0.54 and the dresses
// read ROYAL blue beside a muted swatch (looked at, 2026-10-11). HSL saturation
// is relative to lightness; Lab a/b is absolute chroma, so a lighter fold gets
// the same amount of colour and simply reads lighter, the way cloth does.
function rgb2lab(r, g, b) {
  const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const R = f(r), G = f(g), B = f(b);
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  return [116 * t(Y) - 16, 500 * (t(X) - t(Y)), 200 * (t(Y) - t(Z))];
}
function lab2rgb(L, a, b) {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const inv = (t) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);
  const X = inv(fx) * 0.95047, Y = inv(fy), Z = inv(fz) * 1.08883;
  const g = (c) => 255 * Math.min(1, Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055));
  return [g(X * 3.2406 - Y * 1.5372 - Z * 0.4986), g(-X * 0.9689 + Y * 1.8758 + Z * 0.0415), g(X * 0.0557 - Y * 0.204 + Z * 1.057)];
}
const swRaw = await sharp(swatch).resize(200, 200, { fit: "cover" }).removeAlpha().raw().toBuffer();
const sa = [], sb = [];
for (let i = 0; i < swRaw.length; i += 3) { const [, a, b] = rgb2lab(swRaw[i], swRaw[i + 1], swRaw[i + 2]); sa.push(a); sb.push(b); }
const SW_A = med(sa), SW_B = med(sb);
const NOTONE = process.argv.includes("--no-tone");
const srcRaw = await sharp(src).removeAlpha().raw().toBuffer();
const toned = Buffer.from(sized);
// ⚠️ THE WEAVE COMES FROM THE IVORY PHOTOGRAPH, not from the generation. Flash
// smoothed the slip dress to a flat fill and dropped its centre seam (looked at
// 2026-10-11) -- the same "generative recolour flattened the linen" that pushed
// September to Photoshop. So the generation supplies only the broad shading at
// the new depth (blurred), and the fine detail -- slubs, grain, seams -- is the
// source photograph's own, added back at WEAVE x its amplitude.
const WEAVE = Number(arg("weave", "1.3"));
const lOf = (buf) => { const L = new Float32Array(buf.length / 3); for (let i = 0, j = 0; i < buf.length; i += 3, j++) L[j] = rgb2lab(buf[i], buf[i + 1], buf[i + 2])[0]; return L; };
const blurL = async (L) => {
  const b = await sharp(Buffer.from(L.map((v) => Math.round(v * 2.55))), { raw: { width: meta.width, height: meta.height, channels: 1 } }).blur(2.5).extractChannel(0).raw().toBuffer(); // sharp widens 1 channel to 3 without this
  return Float32Array.from(b, (v) => v / 2.55);
};
const Lsrc = lOf(srcRaw), Lgen = lOf(sized);
// Blur INSIDE the garment only (normalised convolution). A plain blur mixed lit
// skin into the dress edge and drew a pale blue outline round every hand.
const M = new Float32Array(Lsrc.length);
for (let j = 0; j < M.length; j++) M[j] = Math.min(1, Math.max(0, (Lsrc[j] - Lgen[j] - 15) / 15));
const masked = async (L) => {
  const num = await blurL(L.map((v, j) => v * M[j]));
  const den = await blurL(M.map((m) => m * 100));
  return num.map((v, j) => (den[j] > 0.5 ? (v * 100) / den[j] : L[j]));
};
const Bsrc = await masked(Lsrc), Bgen = await masked(Lgen);
if (!NOTONE) {
  for (let i = 0, j = 0; i < sized.length; i += 3, j++) {
    const la = hsl(srcRaw[i], srcRaw[i + 1], srcRaw[i + 2])[2];
    const l = hsl(sized[i], sized[i + 1], sized[i + 2])[2];
    const a = Math.min(1, Math.max(0, (la - l - 0.15) / 0.15));
    if (!a) continue;
    const L = Math.max(0, Bgen[j] + WEAVE * (Lsrc[j] - Bsrc[j]));
    const [r, g, b] = lab2rgb(L, SW_A, SW_B);
    toned[i] = Math.round(sized[i] * (1 - a) + r * a);
    toned[i + 1] = Math.round(sized[i + 1] * (1 - a) + g * a);
    toned[i + 2] = Math.round(sized[i + 2] * (1 - a) + b * a);
  }
}
await sharp(toned, { raw: { width: meta.width, height: meta.height, channels: 3 } }).jpeg({ quality: 92, mozjpeg: true }).toFile(out);

// ------------------------------------------------------------ verify
const W = 240, H = Math.round((240 * meta.height) / meta.width);
const A = await raw(src, W, H), B = await raw(out, W, H);
const gH = [], gS = [], gL = [];
let changed = 0, outsideDiff = 0, outsideN = 0;
for (let i = 0; i < A.length; i += 3) {
  const la = hsl(A[i], A[i + 1], A[i + 2])[2], [h, s, l] = hsl(B[i], B[i + 1], B[i + 2]);
  if (la - l > 0.25) { changed++; gH.push(h); gS.push(s); gL.push(l); }
  else { outsideDiff += (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2])) / 3; outsideN++; }
}
const frac = changed / (W * H);
const got = gH.length ? { h: circMedian(gH), s: med(gS), l: med(gL) } : null;
const rest = outsideDiff / Math.max(outsideN, 1);
const verdict = [];
if (frac < 0.05) verdict.push(`only ${(frac * 100).toFixed(1)}% of the frame changed -- the garment was not recoloured`);
// ⚠️ After toning, hue and saturation are values WE set, so checking them is
// circular (CLAUDE.md §4b). The gate is an independent one on raw channels:
// navy must be blue over red, burgundy red over blue, in the changed region.
let rSum = 0, bSum = 0;
for (let i = 0; i < A.length; i += 3) {
  const la = hsl(A[i], A[i + 1], A[i + 2])[2], l = hsl(B[i], B[i + 1], B[i + 2])[2];
  if (la - l > 0.25) { rSum += B[i]; bSum += B[i + 2]; }
}
const family = { Navy: bSum > rSum * 1.4, Burgundy: rSum > bSum * 1.4 }[colour];
if (family === false) verdict.push(`raw channels do not read as ${colour} (red ${rSum}, blue ${bSum})`);
if (NOTONE && got && hueDist(got.h, ref.h) > 12) verdict.push(`garment hue ${got.h.toFixed(0)} vs swatch ${ref.h.toFixed(0)}`);
if (NOTONE && got && Math.abs(got.s - ref.s) > 0.18) verdict.push(`garment saturation ${got.s.toFixed(2)} vs swatch ${ref.s.toFixed(2)}`);
if (rest > 8) verdict.push(`the rest of the frame moved by ${rest.toFixed(1)} on average -- the photograph was re-rendered, not edited`);
console.log(`changed   ${(frac * 100).toFixed(1)}% of frame`);
if (got) console.log(`garment   h=${got.h.toFixed(0)} s=${got.s.toFixed(2)} l=${got.l.toFixed(2)}   (swatch h=${ref.h.toFixed(0)} s=${ref.s.toFixed(2)} l=${ref.l.toFixed(2)})`);
console.log(`rest      mean diff ${rest.toFixed(1)} / 255`);
console.log(verdict.length ? `CHECK FAILED\n  - ${verdict.join("\n  - ")}` : "CHECK OK");
process.exit(verdict.length ? 2 : 0);
