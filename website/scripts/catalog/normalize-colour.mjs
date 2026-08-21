import sharp from "../../node_modules/sharp/dist/index.cjs";

// Normalise one garment colour across many photos. Each photo is measured for
// its dominant garment hue/saturation/lightness, then those pixels are nudged
// onto a shared target. This is a small corrective shift, not a recolour --
// which is what keeps folds, shadows and fabric texture intact.
//
// Only pixels close to the measured garment hue are touched, so skin (~20 deg)
// and hair are excluded automatically for a burgundy/navy garment.

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

function hueDist(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export async function measure(path, minSat = 0.18) {
  const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
  const bins = new Array(36).fill(0), sh = new Array(36).fill(0),
        ss = new Array(36).fill(0), sl = new Array(36).fill(0);
  for (let i = 0; i < data.length; i += info.channels) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < minSat) continue;
    const b = Math.floor(h / 10) % 36;
    bins[b]++; sh[b] += h; ss[b] += s; sl[b] += l;
  }
  let bi = 0;
  for (let b = 1; b < 36; b++) if (bins[b] > bins[bi]) bi = b;
  return { h: sh[bi] / bins[bi], s: ss[bi] / bins[bi], l: sl[bi] / bins[bi], count: bins[bi] };
}

// maxL guards skin: a burgundy garment sits around l=0.20-0.27 while lit skin
// measures l=0.33+. Without this, the hue window around a garment at h~353
// wraps past 360 into the skin hues near 20 deg and tints the model's arms.
export async function normalise(inPath, outPath, target, window = 34, maxL = 0.36) {
  const src = await measure(inPath);
  const dh = target.h - src.h;
  const sScale = target.s / src.s;
  const lScale = target.l / src.l;

  const { data, info } = await sharp(inPath).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  let touched = 0;

  for (let i = 0; i < data.length; i += info.channels) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < 0.10) continue;
    if (l > maxL) continue;
    // A garment up near 350 deg has a hue window that wraps past 360 straight
    // into the warm skin hues, which tints shadowed faces and hands pink. The
    // garment colours we normalise never live in that band, so exclude it.
    if (src.h > 300 && h < 50) continue;
    const d = hueDist(h, src.h);
    if (d > window) continue;

    // Feather the outer third of the window so the correction has no hard edge.
    const w = d <= window * 0.66 ? 1 : 1 - (d - window * 0.66) / (window * 0.34);

    const nh = h + dh * w;
    const ns = Math.min(1, s * (1 + (sScale - 1) * w));
    const nl = Math.min(1, l * (1 + (lScale - 1) * w));
    const [r, g, b] = hslToRgb(nh, ns, nl);
    out[i] = Math.round(r); out[i + 1] = Math.round(g); out[i + 2] = Math.round(b);
    touched++;
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png().toFile(outPath);

  const after = await measure(outPath);
  return { src, after, touched };
}

if (process.argv[2] === "--measure") {
  for (const f of process.argv.slice(3)) {
    const m = await measure(f);
    console.log(f.split("/").pop().padEnd(50), `h=${m.h.toFixed(0)} s=${m.s.toFixed(2)} l=${m.l.toFixed(2)}`);
  }
}
