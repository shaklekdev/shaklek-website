// Derive one combination cell from an APPROVED colour master, changing exactly
// one feature of the garment, with the matching ivory cell as the reference.
//
//   node derive-cell.mjs --master <navy master.jpg> --ref <ivory sibling.jpg> --colour Navy \
//     --change "<what changes, described as the end state>" --out <file.jpg> [--pro] [--dry]
//
// CLAUDE.md §3/§4b: every cell of a colourway comes FROM its approved master, so
// the woman, pose and expression are the master's and a slider changes only the
// garment. Build each cell from the cell that already has the property: a
// shorter cell with five closures comes from the five-closure cell, never from
// the four-closure master shortened and then asked for a fifth.
//
// The reference is the IVORY photograph of the target cell, because that is the
// approved shape of that option -- references beat descriptions (§4b).
// Afterwards the result is toned onto the swatch by pose-gen.mjs --verify, the
// same toning the master had, so cells of one colourway cannot drift apart.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const master = arg("master"), ref = arg("ref"), colour = arg("colour", "Navy"), change = arg("change"), out = arg("out");
// ⚠️ PRO BY DEFAULT. Flash returned all three midi cells at full length and the
// V-neck still round (2026-10-11, $0.16 wasted) -- exactly what OPEN.md's
// abaya-generation-method already said: Flash cannot reshape a garment.
// Pass --flash only for a pure recolour.
const PRO = !process.argv.includes("--flash"), DRY = process.argv.includes("--dry");
if (!master || !ref || !change || !out) throw new Error("--master, --ref, --change and --out are required");
const HERE = path.dirname(new URL(import.meta.url).pathname);
const WEBSITE = path.resolve(HERE, "../../..");

const prompt = `Edit IMAGE 1 and return the SAME photograph with ONE change to the garment.

THE CHANGE: ${change}
IMAGE 2 shows exactly this version of the same garment, in ivory. Copy that feature's shape and proportions from IMAGE 2 precisely. Do NOT copy IMAGE 2's colour, woman, pose or background.

EVERYTHING ELSE STAYS EXACTLY AS IN IMAGE 1:
- the same woman, the same face and expression, the same hair, the same pose, the same hands and arms
- the garment's ${colour.toUpperCase()} linen colour and its visible weave, slubs and creases, everywhere it still exists
- every other detail of the garment that is not part of the change
- the same shoes, the same framing and crop, the same backdrop, floor, light and shadow

ONE SINGLE PHOTOGRAPH. No text, no panels, no border.`;

console.log(`\n${path.basename(out)}  <- ${path.basename(master)}  (ref ${path.basename(ref)}, ${PRO ? "pro $0.134" : "flash $0.039"})`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out.replace(/\.[a-z]+$/i, ".prompt.txt"), prompt);
if (DRY) { console.log(prompt); process.exit(0); }

// ⚠️ CROP THE REFERENCE TO THE FEATURE. With the whole ivory photograph as
// IMAGE 2, Pro made the change correctly AND copied that photograph's square,
// arms-down pose -- and closed the abaya -- in three of four cells (2026-10-11).
// --ref-crop "top,bottom" (fractions of height) sends only the band that holds
// the feature: the chest for closures or a neckline, the legs for a length.
const crop = arg("ref-crop");
let refUsed = ref;
if (crop) {
  const [t, b] = crop.split(",").map(Number);
  const m = await sharp(ref).metadata();
  refUsed = out.replace(/\.[a-z]+$/i, ".refcrop.jpg");
  await sharp(ref).extract({ left: 0, top: Math.round(m.height * t), width: m.width, height: Math.round(m.height * (b - t)) }).jpeg({ quality: 92 }).toFile(refUsed);
}
const tmp = out.replace(/\.[a-z]+$/i, ".raw.png");
execFileSync("node", [path.join(WEBSITE, "scripts/catalog/edit2.mjs"), master, refUsed, tmp, prompt, PRO ? "gemini-3-pro-image" : "gemini-2.5-flash-image"], {
  stdio: "inherit",
  env: {
    ...process.env,
    EDIT2_INPUT_LABEL: `IMAGE 1 -- the approved ${colour} photograph. Return THIS photograph with only the stated change.`,
    EDIT2_REF_LABEL: "IMAGE 2 -- a CROP of the same garment in ivory, showing only the target version of the ONE feature that changes. Reference for that feature's shape only; it says nothing about pose.",
  },
});

// Tone exactly as the master was toned.
execFileSync("node", [path.join(HERE, "pose-gen.mjs"), "--src", master, "--colour", colour, "--garment", "x", "--pose", "x", "--verify", tmp, "--out", out], { stdio: "inherit" });

// Did the pose survive? Compare with the master outside the garment.
const W = 200, H = 300;
const a = await sharp(master).resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer();
const b = await sharp(out).resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer();
let d = 0;
for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
const mean = d / a.length;
console.log(`whole-frame mean diff vs master ${mean.toFixed(1)} / 255 ${mean > 18 ? "-- HIGH: the woman or pose may have moved, look before using" : ""}`);
