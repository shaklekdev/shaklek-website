// align.cjs master edited out : search scale + shift on downsampled greyscale,
// whole frame, then write edited resampled into master's frame.
const sharp = require("/Users/nadatlohi/dev/Shaklek/website/node_modules/sharp");
const [master, edited, out] = process.argv.slice(2);
(async () => {
  const mm = await sharp(master).metadata(), W = mm.width, H = mm.height, k = 4, w = W / k | 0, h = H / k | 0;
  const M = await sharp(master).greyscale().resize(w, h).raw().toBuffer();
  const em = await sharp(edited).metadata();
  const E = await sharp(edited).greyscale().resize(em.width / k | 0, em.height / k | 0).raw().toBuffer();
  const ew = em.width / k | 0, eh = em.height / k | 0;
  // map master pixel (x,y) -> edited (x*s+dx, y*s+dy), s relative to width-fit
  const base = ew / w;
  let best = null;
  for (let s = 0.94; s <= 1.06; s += 0.005) for (let dx = -12; dx <= 12; dx++) for (let dy = -20; dy <= 20; dy++) {
    let sum = 0, n = 0;
    for (let y = 2; y < h; y += 3) for (let x = 2; x < w; x += 3) {
      const xe = Math.round(x * base * s + dx), ye = Math.round(y * base * s + dy);
      if (xe < 0 || ye < 0 || xe >= ew || ye >= eh) continue;
      sum += Math.abs(M[y * w + x] - E[ye * ew + xe]); n++; }
    const v = sum / n; if (n > w * h / 12 && (!best || v < best.v)) best = { v, s, dx, dy };
  }
  const S = base * best.s; // in full-res units: edited = master*S + d*k
  const scaledW = Math.round(em.width / S), scaledH = Math.round(em.height / S);
  const left = Math.round(best.dx * k / S), top = Math.round(best.dy * k / S);
  const R = await sharp(edited).resize(scaledW, scaledH).toBuffer();
  // place so that master (x,y) = scaled (x+left, y+top); pad if needed
  const pad = 200;
  const big = await sharp(R).extend({ top: pad, bottom: pad, left: pad, right: pad, extendWith: "mirror" }).toBuffer();
  await sharp(big).extract({ left: left + pad, top: top + pad, width: W, height: H }).png().toFile(out);
  console.log(`scale ${best.s.toFixed(3)} dx ${best.dx * k} dy ${best.dy * k} meanAbs ${best.v.toFixed(1)}`);
})();
