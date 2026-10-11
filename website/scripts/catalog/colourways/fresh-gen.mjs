// A GENUINELY NEW photograph of a catalogue garment in a new colour.
//
//   node fresh-gen.mjs --shape <photo showing the garment's exact design> --face <photo of the model>
//     --colour Navy --view front|back --garment "<what it is, in words>" --pose "<pose>"
//     --scene "<hair + placement in frame>" --out <file.jpg>
//
// WHY THIS EXISTS. pose-gen.mjs handed Pro the ivory photograph as IMAGE 1 and
// Pro treated it as a canvas to edit: framing, hair and backdrop survived and
// only the mouth and arms moved. Founder, 2026-10-11: "you kept the model at
// the exact same place so we would see the hair, the background everything the
// same and only face expression moving from the nose to down the face... it's so
// bad". Measured: head-and-background difference from the ivory source was
// 1.1-3.1 on every one of them, where two genuinely different photographs score ~34.
//
// So no reference here is a whole photograph:
//   IMAGE 1  the GARMENT, cropped from the neck down (no face, so no head to copy)
//   IMAGE 2  the real linen swatch (colour and texture)
//   IMAGE 3  the FACE, cropped head-and-shoulders (identity only)
// and the result must pass NOVELTY: the head-and-background region has to differ
// from the shape source by more than 5 (the approved test scored 7.6). Then it is
// toned onto the swatch exactly as pose-gen.mjs does (burgundy x0.8).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const shape = arg("shape"), face = arg("face"), colour = arg("colour"), view = arg("view", "front");
const garment = arg("garment"), pose = arg("pose"), scene = arg("scene", ""), out = arg("out");
const extra = arg("keep", "");
if (!shape || !face || !colour || !garment || !pose || !out) throw new Error("--shape --face --colour --garment --pose --out are required");
const HERE = path.dirname(new URL(import.meta.url).pathname);
const WEBSITE = path.resolve(HERE, "../../..");
const swatch = path.join(WEBSITE, `public/fabric/linen-${colour.toLowerCase()}.jpg`);
fs.mkdirSync(path.dirname(out), { recursive: true });
const stem = out.replace(/\.[a-z]+$/i, "");

// ---- references: garment from the neck down, face head-and-shoulders
const m = await sharp(shape).metadata();
await sharp(shape).extract({ left: Math.round(m.width * 0.1), top: Math.round(m.height * 0.16), width: Math.round(m.width * 0.8), height: Math.round(m.height * 0.84) }).toFile(`${stem}.ref-garment.jpg`);
const fm = await sharp(face).metadata();
await sharp(face).extract({ left: Math.round(fm.width * 0.25), top: Math.round(fm.height * 0.01), width: Math.round(fm.width * 0.5), height: Math.round(fm.height * 0.22) }).toFile(`${stem}.ref-face.jpg`);

const VIEW = view === "back"
  ? `⚠️ A BACK VIEW: she faces AWAY from the camera and we see the BACK of the garment, copied from IMAGE 1 (which is itself a back view). Her face is turned only slightly, so at most the edge of her cheek shows.`
  : `A FRONT view: she faces the camera (her body may turn a little) so the whole FRONT of the garment is clearly visible.`;

const prompt = `Create a BRAND NEW catalogue photograph. This is NOT an edit of any image: do not reproduce any image's framing, crop, camera position or background.

THE WOMAN is the woman in IMAGE 3: the same face, features, skin tone and hair colour. Photographed in a new moment. ${scene}

${VIEW}

SHE WEARS the garment in IMAGE 1, made in the ${colour.toUpperCase()} linen of IMAGE 2: ${garment}. Copy its cut, every seam and detail, and its LENGTH relative to her body exactly from IMAGE 1. ${extra} Nothing added that IMAGE 1 does not have.

THE COLOUR is IMAGE 2: a deep, muted ${colour.toLowerCase()} linen with visible weave, slubs and soft creases. Matte, even in tone.

POSE AND EXPRESSION: ${pose}. A realistic, subtle expression, as in a real editorial photograph: relaxed, believable, never an exaggerated grin or a blank stare. Natural anatomy: five fingers on each hand, normal feet, the shoes from IMAGE 1.

THE STUDIO: a pale, soft, neutral studio with a seamless backdrop and light floor, soft daylight from one side, a gentle shadow. Full length, head to shoes in frame, portrait. ONE SINGLE PHOTOGRAPH, no text, no panels, no border.`;
fs.writeFileSync(`${stem}.prompt.txt`, prompt);

const raw = `${stem}.raw.png`;
if (!arg("verify")) execFileSync("node", [path.join(WEBSITE, "scripts/catalog/edit3.mjs"), `${stem}.ref-garment.jpg`, swatch, `${stem}.ref-face.jpg`, raw, prompt, "gemini-3-pro-image"], {
  stdio: ["ignore", "ignore", "inherit"],
  env: {
    ...process.env,
    EDIT3_INPUT_LABEL: "IMAGE 1 -- the GARMENT ONLY: copy its cut, details and length. Ignore its colour, framing and crop.",
    EDIT3_REF1_LABEL: "IMAGE 2 -- the real cloth: copy its COLOUR and TEXTURE only.",
    EDIT3_REF2_LABEL: "IMAGE 3 -- the WOMAN: copy her identity only, not this crop and not this exact hair placement.",
  },
});

// ---- novelty, BEFORE toning (toning cannot move a head)
const g = async (p) => sharp(p).resize(64, 96, { fit: "fill" }).greyscale().raw().toBuffer();
const A = await g(shape), B = await g(arg("verify") ?? raw);
let d = 0, n = 0;
for (let y = 0; y < 96; y++) for (let x = 0; x < 64; x++) if (y < 21 || x < 12 || x > 51) { d += Math.abs(A[y * 64 + x] - B[y * 64 + x]); n++; }
const novelty = d / n;

// ---- tone onto the swatch, same as pose-gen (burgundy x0.8 is applied there)
execFileSync("node", [path.join(HERE, "pose-gen.mjs"), "--src", arg("verify") ?? raw, "--colour", colour, "--garment", "x", "--pose", "x", "--verify", arg("verify") ?? raw, "--out", out], { stdio: "ignore" });
console.log(`${path.basename(out)}  novelty ${novelty.toFixed(1)} ${novelty > 5 ? "ok" : "TOO CLOSE TO THE SOURCE -- reject"}`);
process.exit(novelty > 5 ? 0 : 3);
