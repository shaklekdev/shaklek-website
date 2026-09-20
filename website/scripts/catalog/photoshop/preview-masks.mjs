// A contact sheet of every candidate mask, tinted over its own photograph, so
// the masks can be judged by eye in one look instead of opening sixteen files.
//
// ⚠️ THIS IS THE VERIFICATION STEP AND IT IS NOT OPTIONAL. Coverage percentages
// caught the skin-exclusion bug that hid the whole ivory garment (2.8% of frame
// where 10% was right), but a number cannot tell you the mask has swallowed a
// hand or stopped at a fold. CLAUDE.md §1: let the founder review, do not burn
// context reading catalog photos. One sheet, one look, one round of feedback.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const WORK = process.env.SHAKLEK_MASK_DIR ?? path.join(os.homedir(), "Shaklek-colourways");
const { files } = JSON.parse(await readFile(path.join(WORK, "manifest.json"), "utf8"));

const COLS = 4;
const TILE_W = 300;

const tiles = [];
for (const f of files) {
  const photo = path.join(WORK, `${f.stem}.jpg`);
  const mask = path.join(WORK, `${f.stem}-mask.png`);
  // ⚠️ .greyscale() BEFORE .raw(). sharp writes a 1-channel raw buffer out as a
  // 3-channel PNG, so reading it back gives RGB and the byte count is 3x what
  // the loop below assumes -- which silently produced a transparent overlay and
  // then a dimension mismatch, not an obvious error.
  const m = await sharp(mask).resize(f.width, f.height).greyscale().raw().toBuffer();
  // Magenta over the masked area: it appears nowhere in these photographs, so
  // anything magenta is mask and anything not is not. A green or red tint would
  // sit inside the skin and burgundy ranges and read as ambiguous.
  const tint = Buffer.alloc(f.width * f.height * 4);
  for (let i = 0; i < m.length; i++) {
    tint[i * 4] = 255; tint[i * 4 + 1] = 0; tint[i * 4 + 2] = 255;
    tint[i * 4 + 3] = m[i] ? 110 : 0;
  }
  // ⚠️ TWO PASSES, AND THE ORDER IS NOT A STYLE CHOICE. sharp runs resize
  // BEFORE composite whatever order you call them in, so chaining them here
  // shrank the photo to 300px and then tried to lay an 843px overlay on it:
  // "Image to composite must have same dimensions or smaller". Composite at
  // full size, then resize the result.
  const full = await sharp(photo)
    .composite([{ input: tint, raw: { width: f.width, height: f.height, channels: 4 } }])
    .png()
    .toBuffer();
  const tile = await sharp(full).resize(TILE_W).jpeg({ quality: 86 }).toBuffer();
  tiles.push({ buf: tile, label: f.stem });
}

const meta = await sharp(tiles[0].buf).metadata();
const TH = meta.height;
const rows = Math.ceil(tiles.length / COLS);
const sheet = sharp({
  create: { width: COLS * TILE_W, height: rows * TH, channels: 3, background: "#ffffff" },
}).composite(
  tiles.map((t, i) => ({
    input: t.buf,
    left: (i % COLS) * TILE_W,
    top: Math.floor(i / COLS) * TH,
  })),
);

const out = path.join(WORK, "mask-preview.jpg");
await sheet.jpeg({ quality: 88 }).toFile(out);
console.log(out);
for (const [i, t] of tiles.entries()) console.log(`  ${String(i + 1).padStart(2)}. ${t.label}`);
