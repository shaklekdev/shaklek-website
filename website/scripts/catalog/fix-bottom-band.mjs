#!/usr/bin/env node
/**
 * Remove the flat grey bar across the bottom of a catalogue photo.
 *
 * WHY THIS EXISTS. The wide:full trouser photos were produced by padding the
 * canvas and asking the model to complete the figure into it (CLAUDE.md §4b,
 * "Backs framed above the hem"). The pad colour never matched the backdrop,
 * so seven of the eight live wide:full files end in a hard horizontal line --
 * founder, 2026-08-28: "we see the picture cropped from the bottom, like a
 * different line with different colour, not the white background."
 *
 * WHY NOT CROP. The heels dip into the band on the white and navy backs.
 * Cropping at the band line clips them.
 *
 * THE METHOD. Take the strip of rows immediately above the band -- real
 * backdrop pixels, already the right colour -- and extend it down over the
 * band, leaving anything that is part of the figure alone.
 *
 * Two earlier versions of this failed, both by modelling instead of copying:
 *
 *  1. A per-column median from the rows above. On ivory and white the
 *     trousers sit within a few levels of the backdrop, so they counted as
 *     background and painted pale vertical streaks below the hem.
 *  2. A straight line fitted across x to carry the backdrop's real 22-level
 *     left-to-right gradient. The slope came out too steep and the anchor
 *     drifted, so the bar was replaced by a differently-toned bar.
 *
 * Copying the adjacent strip needs neither a gradient model nor an anchor,
 * because the pixels it copies already carry both.
 *
 * Deterministic. No generation, no money.
 */
import sharp from "sharp";

const STRIP = 26;    // rows above the band used as the source of backdrop
const DARK = 38;     // how far below the backdrop a pixel must sit to be the figure

export async function fixBottomBand(input, output) {
  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const at = (y, x, c) => data[(y * W + x) * C + c];

  const edge = Math.round(W * 0.06);
  // A row's own backdrop, from its outer columns only -- never the figure.
  // Median rather than mean: the mean is dragged down by the soft floor
  // shadow, which is what made an earlier version repaint the band too dark.
  const rowBg = (y) => {
    const out = [];
    for (let c = 0; c < 3; c++) {
      const v = [];
      for (let x = 0; x < edge; x++) v.push(at(y, x, c));
      for (let x = W - edge; x < W; x++) v.push(at(y, x, c));
      v.sort((a, b) => a - b);
      out.push(v[v.length >> 1]);
    }
    return out;
  };

  // The band is the run of rows at the very bottom whose backdrop does not move.
  const last = rowBg(H - 1);
  let flat = H;
  while (flat > 0) {
    const r = rowBg(flat - 1);
    if (Math.abs(r[0] - last[0]) + Math.abs(r[1] - last[1]) + Math.abs(r[2] - last[2]) > 9) break;
    flat--;
  }
  if (H - flat < 6) return { bandH: H - flat, step: 0, changed: 0, skipped: true };

  // Flatness alone finds the bar but not the RAMP above it. On burgundy and
  // the navy back the pad fades into the backdrop over ~8 rows, so the flat
  // test stopped inside the transition -- the source strip then sampled bad
  // rows and the repaint kept a 21-38 level step at the seam.
  //
  // So take a clean reference well above the bar and walk down to where the
  // backdrop first departs from it. That is the real top of the artifact.
  const refTop = Math.max(0, flat - 70), refBot = Math.max(0, flat - 35);
  const clean = [0, 1, 2].map((c) => {
    const v = [];
    for (let y = refTop; y < refBot; y++) v.push(rowBg(y)[c]);
    v.sort((a, b) => a - b);
    return v[v.length >> 1];
  });
  let top = flat;
  for (let y = refBot; y < H; y++) {
    const r = rowBg(y);
    if (Math.abs(r[0] - clean[0]) + Math.abs(r[1] - clean[1]) + Math.abs(r[2] - clean[2]) > 15) { top = y; break; }
  }
  const bandH = H - top;
  const step = clean[0] - last[0];
  if (bandH < 6 || Math.abs(step) < 8) return { bandH, step, changed: 0, skipped: true };

  // Source strip: real backdrop rows just above the band.
  const sTop = Math.max(0, top - STRIP);
  const ref = [];                       // per column, per channel
  for (let x = 0; x < W; x++) {
    const ch = [];
    for (let c = 0; c < 3; c++) {
      const v = [];
      for (let y = sTop; y < top; y++) v.push(at(y, x, c));
      v.sort((a, b) => a - b);
      ch.push(v[v.length >> 1]);
    }
    ref.push(ch);
  }

  // Which columns of that strip are the figure? Only shoes reach this low, and
  // shoes are dark against every colourway -- so darkness is a safe test here
  // in a way it is not higher up the frame.
  const grey = ref.map((c) => (c[0] + c[1] + c[2]) / 3);
  const sorted = [...grey].sort((a, b) => a - b);
  const base = sorted[Math.round(sorted.length * 0.75)];
  const good = grey.map((g) => g > base - DARK);

  // Fill the figure columns by interpolating between the nearest backdrop
  // columns either side, so no shoe colour is ever carried downward.
  const left = new Array(W).fill(-1), right = new Array(W).fill(-1);
  for (let x = 0, l = -1; x < W; x++) { if (good[x]) l = x; left[x] = l; }
  for (let x = W - 1, r = -1; x >= 0; x--) { if (good[x]) r = x; right[x] = r; }
  const bg = [];
  for (let x = 0; x < W; x++) {
    if (good[x]) { bg.push(ref[x]); continue; }
    const l = left[x], r = right[x];
    if (l < 0 && r < 0) { bg.push(ref[x]); continue; }
    if (l < 0) { bg.push(ref[r]); continue; }
    if (r < 0) { bg.push(ref[l]); continue; }
    const t = (x - l) / (r - l);
    bg.push([0, 1, 2].map((c) => ref[l][c] * (1 - t) + ref[r][c] * t));
  }

  const out = Buffer.from(data);
  let changed = 0;
  for (let y = top; y < H; y++) {
    const rb = rowBg(y);
    for (let x = 0; x < W; x++) {
      // Leave the figure alone. In the band that means the heels, which are
      // dark -- the same test used to pick the source columns.
      const g = (at(y, x, 0) + at(y, x, 1) + at(y, x, 2)) / 3;
      if (g < (rb[0] + rb[1] + rb[2]) / 3 - DARK) continue;
      for (let c = 0; c < 3; c++) out[(y * W + x) * C + c] = Math.max(0, Math.min(255, Math.round(bg[x][c])));
      changed++;
    }
  }

  await sharp(out, { raw: { width: W, height: H, channels: C } })
    .jpeg({ quality: 92, mozjpeg: true })   // catalogue convention -- CLAUDE.md §6 trap 1
    .toFile(output);
  return { bandH, step, changed, skipped: false };
}

if (process.argv[1] && process.argv[1].endsWith("fix-bottom-band.mjs")) {
  const [, , input, output] = process.argv;
  if (!input || !output) { console.error("usage: fix-bottom-band.mjs <in> <out>"); process.exit(1); }
  console.log(JSON.stringify(await fixBottomBand(input, output)));
}
