// zonepaste.cjs master aligned out zonesJSON : take aligned pixels only inside
// zones (fractions [x0,y0,x1,y1]) where either image is garment-coloured
// (mode "ivory": bright low-sat; "any": every pixel in the zone), feathered.
const sharp = require("/Users/nadatlohi/dev/Shaklek/website/node_modules/sharp");
const [master, aligned, out, zonesJ, mode = "ivory"] = process.argv.slice(2);
const zones = JSON.parse(zonesJ);
(async () => {
  const M = await sharp(master).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = M.info.width, H = M.info.height;
  const E = await sharp(aligned).removeAlpha().raw().toBuffer();
  const garment = (b, i) => { const r = b[i], g = b[i + 1], bl = b[i + 2], mx = Math.max(r, g, bl), mn = Math.min(r, g, bl); return mode === "any" || (mx > 165 && (mx - mn) < 45); };
  const mb = Buffer.alloc(W * H);
  for (const [x0, y0, x1, y1] of zones)
    for (let y = y0 * H | 0; y < y1 * H; y++) for (let x = x0 * W | 0; x < x1 * W; x++) {
      const p = y * W + x; if (garment(M.data, p * 3) || garment(E, p * 3)) mb[p] = 255; }
  const mask = await sharp(mb, { raw: { width: W, height: H, channels: 1 } }).blur(4).threshold(30).blur(5).raw().toBuffer();
  const o = Buffer.alloc(W * H * 3);
  for (let p = 0; p < W * H; p++) { const a = mask[p] / 255; for (let c = 0; c < 3; c++) o[p * 3 + c] = Math.round(M.data[p * 3 + c] * (1 - a) + E[p * 3 + c] * a); }
  await sharp(o, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out);
  console.log("ok");
})();
