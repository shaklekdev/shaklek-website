// Deterministic 2:3 centre-crop for the landscape catalog images.
//
// Crop, not pad: padding adds a band in a sampled colour that does not match
// the studio backdrop (tested, it looks worse than the problem). Cropping only
// ever removes backdrop.
//
// Centred on the SUBJECT, not the frame. The model is not reliably centred --
// several of these are three-quarter poses -- so a naive centre crop can clip
// an elbow. Each row's own background is estimated from its outer 6% of
// columns and the subject is the span of pixels differing from it by >14,
// which is the one measure CLAUDE.md section 4b says works on both dark and
// pale garments.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const TARGET = 2 / 3;

export async function subjectBounds(file) {
  const im = sharp(file);
  const { width, height } = await im.metadata();
  const { data, info } = await im.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels, edge = Math.max(2, Math.round(width * 0.06));
  let minX = width, maxX = 0;
  for (let y = 0; y < height; y += 2) {
    const row = y * width * ch;
    let bg = 0, n = 0;
    for (let x = 0; x < edge; x++) { bg += data[row + x * ch]; n++; }
    for (let x = width - edge; x < width; x++) { bg += data[row + x * ch]; n++; }
    bg /= n;
    for (let x = 0; x < width; x++) {
      if (Math.abs(data[row + x * ch] - bg) > 14) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
    }
  }
  if (maxX <= minX) { minX = 0; maxX = width - 1; }
  return { width, height, minX, maxX };
}

export async function cropTo23(file, outFile) {
  const b = await subjectBounds(file);
  const { width, height, minX, maxX } = b;
  if (width / height <= TARGET + 0.001) return { skipped: true, ...b };
  const cropW = Math.min(width, Math.round(height * TARGET));
  const subjectMid = Math.round((minX + maxX) / 2);
  let left = Math.round(subjectMid - cropW / 2);
  left = Math.max(0, Math.min(width - cropW, left));
  // How much of the subject would fall outside the crop?
  const clippedL = Math.max(0, left - minX);
  const clippedR = Math.max(0, maxX - (left + cropW - 1));
  const buf = await sharp(file).extract({ left, top: 0, width: cropW, height })
    .jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  if (outFile) fs.writeFileSync(outFile, buf);
  return { skipped: false, width, height, cropW, left, subjectW: maxX - minX + 1, clippedL, clippedR, bytes: buf.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dirs = ["public/catalog/utility-shirt", "public/catalog/wrap-top"];
  const OUT = process.argv[2];
  // The eight wrap-top BACKS at "normal" length are a pose defect, not a
  // framing one -- they are over-shoulder close-ups with no hem in frame.
  // Cropping cannot fix that, so they are excluded here and regenerated.
  const isDefectiveBack = f => /wrap-top/.test(f) && /back/.test(f) && !/longer/.test(f);
  let done = 0, clipped = 0;
  for (const d of dirs) {
    for (const f of fs.readdirSync(d).filter(x => /\.png$/.test(x)).sort()) {
      const src = path.join(d, f);
      if (isDefectiveBack(src)) { console.log(`  SKIP (regenerate) ${f}`); continue; }
      const r = await cropTo23(src, path.join(OUT, f.replace(/\.png$/, ".jpg")));
      if (r.skipped) { console.log(`  skip (already portrait) ${f}`); continue; }
      done++;
      const warn = (r.clippedL || r.clippedR) ? `  <-- CLIPS SUBJECT L${r.clippedL} R${r.clippedR}` : "";
      if (warn) clipped++;
      console.log(`  ${f.padEnd(52)} ${r.width}x${r.height} -> ${r.cropW}x${r.height}  subject ${r.subjectW}px${warn}`);
    }
  }
  console.log(`\n  ${done} cropped, ${clipped} clip the subject`);
}
