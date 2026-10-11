// A NEW photograph of the same woman in a new pose, wearing the approved ivory
// garment re-made in a real linen colour, then toned onto the swatch.
//
//   node pose-gen.mjs --src <ivory.jpg> --colour Navy --garment "..." --keep "..." --pose "..." --out <file.jpg> [--flash] [--dry]
//   node pose-gen.mjs ... --verify <existing.png>     re-tone and re-check, no API call
//
// WHY NOT recolour-gen.mjs. That one returns the SAME photograph recoloured, and
// the founder rejected it on sight, 2026-10-11: "if we're regenerating anyway,
// why aren't you changing the pose of the model and facial expression !! it
// shows tooooo ai like this". The same frame in three colours reads as a
// filter, not as a shoot. So every colourway gets its own pose and expression;
// within one colourway, the other cells are then derived FROM this master so
// that a slider changes the garment and not the woman (CLAUDE.md §3, §4b).
//
// ⚠️ THE GARMENT'S SHAPE IS THE PRODUCT. A new pose is allowed; a new hem, a new
// neckline, a lost seam or a different button count is a return item. Every
// result goes side by side with its ivory source before it is shown to anyone.
//
// ⚠️ TONING. Generation loses saturation going ivory -> dark (first Navy tries
// came back s=0.04-0.10 against the swatch's 0.54), so the colour is set here
// from the real cloth: Lab a*/b* from the swatch, lightness from the generation.
// Lab, not HSL: setting HSL saturation turned every lit fold royal blue. With no
// ivory frame aligned underneath, the garment is found by its own colour, and
// skin is excluded by its warmth (b* high), which burgundy needs most -- its
// hue window wraps into skin (CLAUDE.md §5).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const src = arg("src"), colour = arg("colour", "Navy"), garment = arg("garment"), keep = arg("keep", ""), pose = arg("pose"), out = arg("out");
const FLASH = process.argv.includes("--flash"), DRY = process.argv.includes("--dry"), VERIFY = arg("verify");
if (!src || !garment || !pose || !out) throw new Error("--src, --garment, --pose and --out are required");

const WEBSITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
const swatch = path.join(WEBSITE, `public/fabric/linen-${colour.toLowerCase()}.jpg`);
if (!fs.existsSync(swatch)) throw new Error(`no swatch photograph for ${colour}`);

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
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];

const swRaw = await sharp(swatch).resize(200, 200, { fit: "cover" }).removeAlpha().raw().toBuffer();
const sw = { L: [], a: [], b: [] };
for (let i = 0; i < swRaw.length; i += 3) { const [L, a, b] = rgb2lab(swRaw[i], swRaw[i + 1], swRaw[i + 2]); sw.L.push(L); sw.a.push(a); sw.b.push(b); }
const SW = { L: med(sw.L), a: med(sw.a), b: med(sw.b) };

const prompt = `A new catalogue photograph from the same studio shoot as IMAGE 1.

THE SAME WOMAN as IMAGE 1: the same face, the same features, the same skin tone, the same hair. She is photographed in a NEW pose and with a NEW, natural expression: ${pose}. A real model between shots, relaxed and human, not a mannequin and not a copy of IMAGE 1's stance. Her expression is REALISTIC and subtle: a relaxed, believable face as in a real editorial photograph -- softly closed lips or a slight genuine smile. No exaggerated grin, no wide-open laugh, no blank mannequin stare (founder, 2026-10-11: "keep the face expression as realistic as possible").

SHE WEARS THE ${garment.toUpperCase()} FROM IMAGE 1, made in the ${colour.toUpperCase()} linen of IMAGE 2. The garment's design is copied exactly from IMAGE 1:
- the same length: the hem falls at exactly the same point on her body as in IMAGE 1
- the same neckline, the same armholes or sleeves, the same width and the same way it falls
- every seam and every detail of IMAGE 1 in the same place${keep ? `\n- ${keep}` : ""}
- nothing added: no belt, no pockets, no buttons, no trim, no print, no logo that IMAGE 1 does not have

THE COLOUR is the cloth in IMAGE 2: a deep, MUTED ${colour.toLowerCase()} linen. Not bright, not electric, not royal, not glossy. Matte, and even in tone across the whole garment.

IT IS LINEN. The weave is visible: slubs, grain, soft natural creases, real shadow inside the folds. Photographed cloth, never a smooth fill.

THE SAME STUDIO AND CAMERA as IMAGE 1: the same backdrop and floor, the same soft light, the same camera height and lens. Full length, head and shoes fully in frame with the same margins as IMAGE 1. The same shoes as IMAGE 1. Her face sharp and in focus with natural, symmetrical anatomy; hands with five natural fingers.

ONE SINGLE PHOTOGRAPH. No text, no panels, no border.`;

console.log(`\n${path.basename(src)} -> ${colour}, new pose  (${FLASH ? "flash $0.039" : "gemini-3-pro-image $0.134"})`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out.replace(/\.[a-z]+$/i, ".prompt.txt"), prompt);
if (DRY) { console.log(prompt); process.exit(0); }

const tmp = out.replace(/\.[a-z]+$/i, ".raw.png");
if (!VERIFY) execFileSync("node", [path.join(WEBSITE, "scripts/catalog/edit2.mjs"), src, swatch, tmp, prompt, FLASH ? "gemini-2.5-flash-image" : "gemini-3-pro-image"], {
  stdio: "inherit",
  env: {
    ...process.env,
    EDIT2_INPUT_LABEL: "IMAGE 1 -- the approved catalogue photograph: the woman, the garment's exact design, the studio.",
    EDIT2_REF_LABEL: "IMAGE 2 -- the real cloth, for its COLOUR and TEXTURE only. Do not copy anything else from it.",
  },
});

const meta = await sharp(src).metadata();
const gen = await sharp(VERIFY ?? tmp).resize(meta.width, meta.height, { fit: "cover" }).removeAlpha().raw().toBuffer();

// Garment mask by colour family, skin excluded by warmth. Soft edges.
const ramp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const FAMILY = {
  // "Dark and not warm": Flash returned the slip near-black at b*≈-1, which a
  // "blue" test missed (1% of frame). Hair is warm (b* > 0), so it stays out.
  // ⚠️ But "not warm" also caught Flash's greyed hair and tinted it blue at
  // the neck (slip v-maxi, 2026-10-11). Structural edits now go to Pro, which
  // returns a properly blue garment, so the mask asks for real blue again.
  Navy: (L, a, b) => ramp(-b, 1, 5) * ramp(-L, -66, -56), // no a* limit: the real navy sits at a*=+7.6, and b*<-1 already excludes skin and hair
  Burgundy: (L, a, b) => ramp(a, 6, 11) * ramp(-b, -12, -6) * ramp(-L, -48, -40),
}[colour];
if (!FAMILY) throw new Error(`no garment mask for ${colour}`);
const toned = Buffer.from(gen);
let n = 0, ab = 0;
for (let i = 0; i < gen.length; i += 3) {
  const [L, a, b] = rgb2lab(gen[i], gen[i + 1], gen[i + 2]);
  const m = FAMILY(L, a, b);
  if (!m) continue;
  n += m;
  const [r, g, bb] = lab2rgb(L, SW.a, SW.b);
  toned[i] = Math.round(gen[i] * (1 - m) + r * m);
  toned[i + 1] = Math.round(gen[i + 1] * (1 - m) + g * m);
  toned[i + 2] = Math.round(gen[i + 2] * (1 - m) + bb * m);
}
await sharp(toned, { raw: { width: meta.width, height: meta.height, channels: 3 } }).jpeg({ quality: 92, mozjpeg: true }).toFile(out);
const frac = n / (meta.width * meta.height);
console.log(`garment mask ${(frac * 100).toFixed(1)}% of frame   swatch Lab a=${SW.a.toFixed(1)} b=${SW.b.toFixed(1)}`);
if (frac < 0.05) { console.log("CHECK FAILED -- almost nothing reads as the garment colour"); process.exit(2); }
console.log("toned. NOT VERIFIED: put it beside its ivory source and look (shape, hem, neckline, hands, face).");
