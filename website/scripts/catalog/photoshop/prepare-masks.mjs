// Step 1 of the Photoshop colourway pipeline.
//
// Copies every abaya photograph into a working folder OUTSIDE the repo and
// writes a CANDIDATE garment mask beside each one, so the founder refines a
// selection instead of cutting one from scratch. Sixteen photographs, sixteen
// masks, and the masks are the only artefact that has to be made by hand --
// once they exist, every colour is free forever.
//
// ⚠️ WHY A HUMAN MASK AT ALL, AFTER ALL THE AUTOMATED ATTEMPTS. Colour alone
// cannot find the edge of this garment. Burgundy sits at h~353 and its hue
// window wraps past 360 into skin; shadowed skin and shadowed burgundy are
// genuinely the same colour, so no threshold separates them. That is what
// produced "hands are still blue claude" and "it's very very bad" on
// 2026-09-19 after a day of trying. The founder's own conclusion was
// "for the other colors we will use photoshop", and she is right: the boundary
// is a judgement, and the cheapest correct move is to make it once by hand.
//
// ⚠️ AND WHY THE WORKING FOLDER IS OUTSIDE THE REPO. PSDs with alpha channels
// run to several MB each; sixteen of them would put ~60MB of derivable binary
// into git forever. The MASKS get committed instead, as 8-bit PNGs of a few KB
// -- that is the part that cost human time and the part worth keeping.
//
// ⚠️ AND WHY NOT ~/Desktop. iCloud Desktop & Documents syncs it, and a file
// syncer writing the same bytes as another process is what corrupted this
// repo's git index nineteen times over (CLAUDE.md §6). Photoshop writing PSDs
// into a synced folder is the same hazard with a different victim.

import { mkdir, writeFile, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import { PUBLIC, COLORS, planFiles } from "./_shared.mjs";

const WORK = process.env.SHAKLEK_MASK_DIR ?? path.join(os.homedir(), "Shaklek-colourways");

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
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/**
 * ⚠️ THE TOP 15% IS NEVER GARMENT, in this framing, on either abaya. It is the
 * face, and lipstick sits at almost exactly burgundy's hue and passes every
 * lightness test. Without this cut the model gets blue lips. Measured on the
 * approved set: the highest point of either garment is its collar, at ~17%.
 */
const FACE_FRACTION = 0.15;

/**
 * Lit skin sits at h 6-60 with real saturation. Shadowed skin does NOT, which
 * is the whole reason this produces a CANDIDATE and not a finished mask.
 *
 * ⚠️ THE UPPER LIGHTNESS BOUND IS LOAD-BEARING AND WAS MISSING. Ivory linen is
 * warm, pale and barely saturated, which puts it in the SAME hue band as skin:
 * measured across the Buttoned Abaya's garment, rgb(214,207,191) reads h=42,
 * s=0.22, l=0.79. With only a lower bound the exclusion ate the entire garment
 * and the candidate mask covered 2.8% of the frame -- edges, and nothing else.
 *
 * Lightness separates them cleanly on these photographs: skin measured 0.42,
 * 0.49 and 0.59 along one row, the fabric 0.79. 0.70 sits in the gap with room
 * on both sides. Hue alone never will, which is the same lesson as the failed
 * pixel recolour, arriving from the opposite direction: there it could not keep
 * skin OUT of a dark garment, here it could not keep a pale garment IN.
 */
const isSkinish = (h, s, l) => h >= 6 && h <= 60 && s >= 0.15 && l >= 0.30 && l <= 0.70;

/** A dark garment on a pale backdrop: find it by hue. */
function maskDarkGarment(data, w, h, { hue, window = 45, maxL = 0.62, minS = 0.10 }) {
  const out = Buffer.alloc(w * h);
  const faceCut = Math.round(h * FACE_FRACTION);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      if (y < faceCut) continue;
      const [hu, s, l] = rgb2hsl(data[i], data[i + 1], data[i + 2]);
      if (l > maxL || s < minS) continue;
      if (hueDist(hu, hue) > window) continue;
      if (isSkinish(hu, s, l)) continue;
      out[y * w + x] = 255;
    }
  }
  return out;
}

/**
 * A pale garment on a pale backdrop: hue cannot see it, so subtract the
 * background instead. Each ROW estimates its own backdrop from its outer 6% of
 * columns -- the one width measure in CLAUDE.md §4b that works on both dark and
 * pale garments -- and anything differing by more than `tol` is subject.
 * Subject minus skin is, roughly, garment plus hair plus shoes.
 */
function maskPaleGarment(data, w, h, { tol = 16 }) {
  const out = Buffer.alloc(w * h);
  const faceCut = Math.round(h * FACE_FRACTION);
  const edge = Math.max(2, Math.round(w * 0.06));
  for (let y = 0; y < h; y++) {
    let br = 0, bg = 0, bb = 0, n = 0;
    for (let x = 0; x < edge; x++) {
      for (const xx of [x, w - 1 - x]) {
        const i = (y * w + xx) * 3;
        br += data[i]; bg += data[i + 1]; bb += data[i + 2]; n++;
      }
    }
    br /= n; bg /= n; bb /= n;
    if (y < faceCut) continue;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      const diff = Math.abs(data[i] - br) + Math.abs(data[i + 1] - bg) + Math.abs(data[i + 2] - bb);
      if (diff < tol * 3) continue;
      const [hu, s, l] = rgb2hsl(data[i], data[i + 1], data[i + 2]);
      if (isSkinish(hu, s, l)) continue;
      out[y * w + x] = 255;
    }
  }
  return out;
}

/**
 * Drop specks and fill pinholes, so she is not erasing confetti by hand.
 *
 * ⚠️ `.greyscale()` BEFORE `.raw()`, AND THE ASSERT IS NOT DECORATION. sharp
 * hands back a THREE-channel buffer here even though the input was declared
 * one-channel, so `blurred[i]` walked the interleaved bytes and every index
 * landed on the wrong pixel. The mask that came out was a horizontally
 * squeezed silhouette sitting over nothing in particular -- 11.7% of the frame,
 * and the pixels it selected averaged rgb(192,176,176), the pale floor, while
 * the pixels it rejected averaged rgb(187,171,170). Identical. The mask had no
 * relationship to the photograph at all.
 *
 * It looked plausible enough to ship: the coverage number was in range, the
 * mask rendered as a garment-ish shape, and the founder had to say "magenta is
 * everywhere" before anyone checked. The correct mask is 25.4% and its pixels
 * average rgb(66,25,30), which is the burgundy. **A length assertion would have
 * caught this at the first run, and now does.**
 */
async function despeckle(mask, w, h) {
  const blurred = await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
    .blur(2.5)
    .greyscale()
    .raw()
    .toBuffer();
  if (blurred.length !== w * h) {
    throw new Error(
      `despeckle: expected ${w * h} bytes back, got ${blurred.length}. ` +
        `sharp returned ${blurred.length / (w * h)} channels; indexing it as one ` +
        `silently misaligns every pixel.`,
    );
  }
  const out = Buffer.alloc(w * h);
  for (let i = 0; i < out.length; i++) out[i] = blurred[i] > 128 ? 255 : 0;
  return out;
}

const pct = (mask) => ((mask.reduce((n, v) => n + (v ? 1 : 0), 0) / mask.length) * 100).toFixed(1);

const plan = await planFiles();
await mkdir(WORK, { recursive: true });

const manifest = [];
for (const item of plan) {
  const srcHex = COLORS[item.source];
  const [sr, sg, sb] = [1, 3, 5].map((k) => parseInt(srcHex.slice(k, k + 2), 16));
  const [srcHue, , srcL] = rgb2hsl(sr, sg, sb);
  const dark = srcL < 0.5;

  for (const file of item.files) {
    const abs = path.join(PUBLIC, file.rel);
    const stem = path.basename(file.rel, ".jpg");
    const img = sharp(abs);
    const { width: w, height: h } = await img.metadata();
    const { data } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });

    let mask = dark
      ? maskDarkGarment(data, w, h, { hue: srcHue })
      : maskPaleGarment(data, w, h, {});
    mask = await despeckle(mask, w, h);

    await copyFile(abs, path.join(WORK, `${stem}.jpg`));
    await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(WORK, `${stem}-mask.png`));

    // ⚠️ SANITY CHECK, because a misaligned mask is invisible in a coverage
    // number. If the pixels the mask selects do not differ from the pixels it
    // rejects, it is not selecting a garment -- it is selecting noise.
    let inR = 0, outR = 0, inN = 0, outN = 0;
    for (let i = 0; i < mask.length; i++) {
      const lum = (data[i * 3] + data[i * 3 + 1] + data[i * 3 + 2]) / 3;
      if (mask[i]) { inR += lum; inN++; } else { outR += lum; outN++; }
    }
    const gap = Math.abs(inR / (inN || 1) - outR / (outN || 1));
    if (gap < 20) {
      throw new Error(
        `${stem}: masked and unmasked pixels differ by only ${gap.toFixed(1)} in mean ` +
          `luminance. The mask is not tracking the garment.`,
      );
    }

    manifest.push({
      stem,
      item: item.slug,
      sourceColour: item.source,
      targets: item.missing,
      rel: file.rel,
      width: w,
      height: h,
      candidateCoverage: Number(pct(mask)),
    });
    console.log(`${stem.padEnd(46)} ${dark ? "hue" : "bg-subtract"}  candidate covers ${pct(mask)}% of frame`);
  }
}

await writeFile(
  path.join(WORK, "manifest.json"),
  JSON.stringify({ colours: COLORS, files: manifest }, null, 2),
);
console.log(`\n${manifest.length} photographs and masks in ${WORK}`);
