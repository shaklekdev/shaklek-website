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

/**
 * A dark garment on a pale backdrop: find it by hue.
 *
 * ⚠️ THE WINDOW IS 14 DEGREES, NOT 45, AND THE NUMBER IS MEASURED. At 45 the
 * recoloured Open Abaya came back with navy on her NECK and on her TOES -- the
 * small version of the failure that killed the automated attempt on 2026-09-19.
 * Shadowed skin is reddish and dark enough to pass a lightness ceiling, and
 * saturation does not separate it either: her neck reads s=0.45 against the
 * garment's 0.48.
 *
 * Hue does, cleanly:
 *
 *   garment body   h=348   4 degrees from burgundy
 *   garment collar h=356   3
 *   garment hem    h=349   4
 *   neck shadow    h=13   20
 *   sandal strap   h=19   26
 *
 * And the fabric's own spread is tight: inside the mask the median distance is
 * 4-5 degrees and p90 is 9 on both the front and a back. The 20-26 tail WAS the
 * contamination. 14 keeps every real thread and drops skin and leather.
 *
 * ⚠️ AND THE CENTRE IS MEASURED FROM THE PHOTOGRAPH, NOT TAKEN FROM THE SWATCH.
 * The first attempt at a narrow window centred it on #4a1a2d, the burgundy in
 * colors.ts, which is h=337 -- while the photographed fabric sits at h=353.
 * Sixteen degrees of disagreement between a colour and its own swatch, and a
 * 45-degree window had been papering over it. Coverage fell from 25% to 9% and
 * the garment came out in tatters. A narrow window is only safe if it is
 * centred on the thing itself. CLAUDE.md §4b says the same in different words:
 * reference the BASE PHOTO of that colour, never a hex target.
 *
 * ⚠️ MEASURE BEFORE WIDENING THIS. A window is the one knob that looks harmless
 * and puts colour on a person.
 */
function measureGarmentHue(data, w, h) {
  // Dark, saturated, below the face: that is fabric and almost nothing else.
  // The median is taken as a VECTOR so a hue straddling 0 does not average to
  // its own opposite -- 358 and 2 arithmetically mean 180, which is cyan.
  const faceCut = Math.round(h * FACE_FRACTION);
  let x = 0, y = 0, n = 0;
  for (let py = faceCut; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 3;
      const [hu, s, l] = rgb2hsl(data[i], data[i + 1], data[i + 2]);
      if (l > 0.40 || s < 0.25) continue;
      x += Math.cos((hu * Math.PI) / 180);
      y += Math.sin((hu * Math.PI) / 180);
      n++;
    }
  }
  if (!n) return null;
  let hue = (Math.atan2(y / n, x / n) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return hue;
}

function maskDarkGarment(data, w, h, { hue, window = 16, maxL = 0.62, minS = 0.10 }) {
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
 * A pale garment on a pale backdrop, found by WARMTH rather than by brightness.
 *
 * ⚠️ BACKGROUND SUBTRACTION FAILED HERE AND IT FAILED PLAUSIBLY. Estimating
 * each row's backdrop from its outer columns and marking everything that
 * differs is the technique CLAUDE.md §4b endorses for MEASURING a garment's
 * width, and it is the wrong tool for cutting one out: ivory linen on a white
 * cyclorama differs from its background by almost nothing across large lit
 * areas, so the mask came out moth-eaten, caught the hair and the shadow puddle
 * at her feet, and missed the middle of the garment. Founder: "still not good".
 *
 * Measured on the Buttoned Abaya, and the separation is not subtle:
 *
 *   garment chest  rgb(231,232,221)   R-B = +10   l = 0.89
 *   garment hem    rgb(220,212,194)   R-B = +26   l = 0.81
 *   backdrop       rgb(232,233,238)   R-B =  -6   l = 0.92
 *   floor          rgb(246,250,253)   R-B =  -7   l = 0.98
 *   hair           rgb(163,120,97)    R-B = +66   l = 0.51
 *   dress under it rgb(154,126,101)   R-B = +53   l = 0.50
 *
 * The linen is WARM and the studio is COOL: backdrop and floor are lit
 * daylight-balanced and read blue, the undyed linen reads yellow. Two
 * thresholds separate all six -- warm enough to be fabric, light enough not to
 * be hair, skin, or the slip dress underneath.
 *
 * ⚠️ THIS IS A PROPERTY OF THESE PHOTOGRAPHS, NOT OF IVORY. A warm-lit set
 * inverts it. Re-measure before trusting it on a new shoot; the numbers above
 * are the instrument, and printing them is what made the rule obvious.
 */
function maskPaleGarment(data, w, h, { minWarmth = 3, minL = 0.60 } = {}) {
  const out = Buffer.alloc(w * h);
  const faceCut = Math.round(h * FACE_FRACTION);
  for (let y = faceCut; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      const R = data[i], G = data[i + 1], B = data[i + 2];
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      if ((mx + mn) / 2 / 255 < minL) continue;
      if (R - B < minWarmth) continue;
      out[y * w + x] = 255;
    }
  }
  return out;
}

/**
 * Keep every substantial connected blob, and drop the rest.
 *
 * ⚠️ THIS IS WHAT REMOVES THE THINGS A THRESHOLD CANNOT. The shadow puddle at
 * her feet, her hair, the sandals and every stray speck all pass the colour
 * test on their own merits and all of them are SEPARATE from the garment. No
 * amount of threshold tuning distinguishes "warm and light" hair from "warm and
 * light" linen; being a different object does. One flood fill does what an
 * hour of hand-erasing would.
 *
 * ⚠️ EVERY SUBSTANTIAL BLOB, NOT THE LARGEST ONE. Keeping only the largest
 * threw away half of abaya-burgundy-combo-midi-wide-front: BOTH abayas are worn
 * OPEN, so the left and right front panels are two separate objects with a slip
 * dress between them, and "the garment" is routinely two blobs rather than one.
 * That run kept 52% of the masked pixels and the coverage fell to 10.8% against
 * 20-26% everywhere else -- the number said so plainly, which is the only
 * reason it was caught.
 *
 * `minShare` is relative to the LARGEST blob, so it scales with the garment
 * instead of with the frame. Hair, sandals and speckle are one to two orders of
 * magnitude smaller than a panel and fall well below it.
 */
function keepBlobs(mask, w, h, minShare = 0.12) {
  const label = new Int32Array(w * h).fill(-1);
  const stack = new Int32Array(w * h);
  const sizes = [];
  let current = 0, total = 0;
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || label[start] !== -1) continue;
    let sp = 0, size = 0;
    stack[sp++] = start;
    label[start] = current;
    while (sp) {
      const i = stack[--sp];
      size++;
      const x = i % w, y = (i / w) | 0;
      // 4-connectivity: 8 would bridge the garment to a sandal touching it at
      // a single diagonal pixel, which is exactly the join we want to break.
      if (x > 0 && mask[i - 1] && label[i - 1] === -1) { label[i - 1] = current; stack[sp++] = i - 1; }
      if (x < w - 1 && mask[i + 1] && label[i + 1] === -1) { label[i + 1] = current; stack[sp++] = i + 1; }
      if (y > 0 && mask[i - w] && label[i - w] === -1) { label[i - w] = current; stack[sp++] = i - w; }
      if (y < h - 1 && mask[i + w] && label[i + w] === -1) { label[i + w] = current; stack[sp++] = i + w; }
    }
    total += size;
    sizes.push(size);
    current++;
  }
  const biggest = sizes.length ? Math.max(...sizes) : 0;
  const keep = sizes.map((n) => n >= biggest * minShare);
  const out = Buffer.alloc(w * h);
  let kept = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] && keep[label[i]]) { out[i] = 255; kept++; }
  }
  return { mask: out, share: total ? kept / total : 0, blobs: current, keptBlobs: keep.filter(Boolean).length };
}

/**
 * Close pinholes without swallowing what the garment is worn OVER.
 *
 * ⚠️ A FULL HOLE-FILL IS WRONG ON BOTH OF THESE GARMENTS. Both abayas are worn
 * open over a slip dress, so the dress shows through the middle as a genuine
 * hole in the garment -- fill it and the recolour turns her dress navy too.
 * This closes gaps up to `r` pixels and leaves anything larger alone, which
 * fixes the weave speckle and keeps the dress.
 */
function closeGaps(mask, w, h, r = 3) {
  const dil = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          dil[yy * w + xx] = 255;
        }
      }
    }
  }
  const out = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!dil[y * w + x]) continue;
      let all = true;
      for (let dy = -r; dy <= r && all; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) { continue; }
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          if (!dil[yy * w + xx]) { all = false; break; }
        }
      }
      if (all) out[y * w + x] = 255;
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

    // The fabric's own hue, not the swatch's. See measureGarmentHue.
    const measured = dark ? measureGarmentHue(data, w, h) : null;
    if (dark && measured === null) throw new Error(`${stem}: found no dark saturated pixels to measure`);

    let mask = dark
      ? maskDarkGarment(data, w, h, { hue: measured })
      : maskPaleGarment(data, w, h, {});
    mask = await despeckle(mask, w, h);
    mask = closeGaps(mask, w, h, 3);
    const blob = keepBlobs(mask, w, h);
    mask = blob.mask;

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
    console.log(
      `${stem.padEnd(46)} ${dark ? `hue ${measured.toFixed(0)}` : "warmth"}  ${pct(mask)}% of frame  ` +
        `(kept ${(blob.share * 100).toFixed(0)}% of pixels, ${blob.keptBlobs}/${blob.blobs} blobs)`,
    );
  }
}

await writeFile(
  path.join(WORK, "manifest.json"),
  JSON.stringify({ colours: COLORS, files: manifest }, null, 2),
);
console.log(`\n${manifest.length} photographs and masks in ${WORK}`);
