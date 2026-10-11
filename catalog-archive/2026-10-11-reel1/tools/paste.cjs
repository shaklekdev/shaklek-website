// paste.cjs master edited out [thresh]
// Align `edited` to `master` (scale to master width, best vertical shift), then
// take edited pixels only where they differ strongly from master (the garment
// change), with a soft dilated mask. Everything else stays master's pixels.
const sharp = require("/Users/nadatlohi/dev/Shaklek/website/node_modules/sharp");
const [master, edited, out, th = "28"] = process.argv.slice(2);
(async () => {
  const M = await sharp(master).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = M.info.width, H = M.info.height;
  const em = await sharp(edited).metadata();
  const eh = Math.round(em.height * W / em.width);
  const E0 = await sharp(edited).removeAlpha().resize(W, eh).raw().toBuffer();
  // best vertical offset on the top 25% (sky/rocks, no garment)
  let best = 0, bs = Infinity;
  for (let d = -40; d <= 40; d++) { let s = 0, n = 0;
    for (let y = 40; y < H * 0.25; y += 2) { const ye = y + d; if (ye < 0 || ye >= eh) continue;
      for (let x = 0; x < W; x += 4) { const i = (y * W + x) * 3, j = (ye * W + x) * 3; s += Math.abs(M.data[i] - E0[j]) + Math.abs(M.data[i+1] - E0[j+1]) + Math.abs(M.data[i+2] - E0[j+2]); n++; } }
    if (s / n < bs) { bs = s / n; best = d; } }
  const E = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) { const ye = Math.min(eh - 1, Math.max(0, y + best)); E0.copy(E, y * W * 3, ye * W * 3, (ye + 1) * W * 3); }
  // raw mask of strong differences
  const m = new Float32Array(W * H);
  for (let p = 0; p < W * H; p++) { const i = p * 3; const d = Math.abs(M.data[i] - E[i]) + Math.abs(M.data[i+1] - E[i+1]) + Math.abs(M.data[i+2] - E[i+2]); m[p] = d / 3 > +th ? 1 : 0; }
  // keep only the largest connected blob region: restrict to bounding box of the figure (central 70% columns, rows 15%..95%)
  const mb = Buffer.alloc(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const p = y * W + x; mb[p] = (m[p] && x > W * 0.15 && x < W * 0.9 && y > H * 0.15 && y < H * 0.95) ? 255 : 0; }
  // close + dilate + feather
  const mask = await sharp(mb, { raw: { width: W, height: H, channels: 1 } }).blur(6).threshold(40).blur(10).raw().toBuffer();
  const o = Buffer.alloc(W * H * 3);
  let cover = 0;
  for (let p = 0; p < W * H; p++) { const a = mask[p] / 255; cover += a; for (let c = 0; c < 3; c++) o[p*3+c] = Math.round(M.data[p*3+c] * (1 - a) + E[p*3+c] * a); }
  await sharp(o, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out);
  await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).png().toFile(out.replace(/\.png$/, "-mask.png"));
  console.log(`shift ${best}px, bg diff ${bs.toFixed(1)}, mask covers ${(100 * cover / (W * H)).toFixed(1)}%`);
})();
