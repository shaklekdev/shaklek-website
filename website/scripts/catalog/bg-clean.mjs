#!/usr/bin/env node
// Studio-backdrop cleanup for catalogue photos. Free and deterministic.
//
//   node bg-clean.mjs --measure <files...>         prints grain/blotch per file (TSV)
//   node bg-clean.mjs --clean <in> <out> [--mask <maskOut>]
//
// Method (the one approved on public/coming-soon/utility-shirt-burgundy-curvy-v2.jpg):
// flood-fill the pale, low-saturation backdrop from the image edges, erode a few
// px off hair/skin, replace the backdrop with a sigma-30 blur of the backdrop
// ONLY (normalised convolution, so no garment/skin colour bleeds in), feathered
// blend. Pixels outside the mask are untouched.
import sharp from "sharp";

const ERODE = 4, SIGMA = 30, FEATHER = 6, EDGE = 6, CHROMA = 6;

async function load(p) {
  const { data, info } = await sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
async function blurRaw(buf, w, h, ch, sigma) {
  return sharp(buf, { raw: { width: w, height: h, channels: ch } }).blur(sigma).raw().toBuffer();
}

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  const s = mx === mn ? 0 : (l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn));
  return [s, l];
}

// Pale garments (white/ivory) sit within a few levels of the backdrop, so they
// get a strict tolerance; at 22 the fill flooded the lower half of a white
// shirt (2026-11-07). Dark garments cannot be mistaken for the backdrop, and
// warm beige sweeps need the looser value to be cleaned at all.
const tolFor = (p) => (/-(white|ivory)-/.test(p) ? 14 : 22);

export async function backdropMask(p) {
  const TOL = tolFor(p);
  const { data, w, h } = await load(p);
  const sm = await blurRaw(data, w, h, 3, 1.5);
  const n = w * h, mask = new Uint8Array(n);
  // Backdrop model: per row, linear between the median of the outer 6% columns
  // on each side (the studio sweep has a left-right light falloff). Smoothed
  // vertically so a hand at the frame edge does not poison one row.
  const edgeW = Math.max(4, Math.round(w * 0.06));
  const side = (y, x0) => {
    const v = [[], [], []];
    for (let x = x0; x < x0 + edgeW; x++) for (let c = 0; c < 3; c++) v[c].push(sm[(y * w + x) * 3 + c]);
    return v.map((a) => a.sort((p, q) => p - q)[a.length >> 1]);
  };
  let L = [], R = [];
  for (let y = 0; y < h; y++) { L.push(side(y, 0)); R.push(side(y, w - edgeW)); }
  const vsmooth = (A) => A.map((_, y) => [0, 1, 2].map((c) => {
    const v = []; for (let k = Math.max(0, y - 40); k <= Math.min(h - 1, y + 40); k += 4) v.push(A[k][c]);
    return v.sort((p, q) => p - q)[v.length >> 1];
  }));
  L = vsmooth(L); R = vsmooth(R);
  // edge barrier: gradient magnitude on the sigma-1.5 image
  const lum = (i) => 0.299 * sm[i * 3] + 0.587 * sm[i * 3 + 1] + 0.114 * sm[i * 3 + 2];
  const edge = new Uint8Array(n);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, gx = lum(i + 1) - lum(i - 1), gy = lum(i + w) - lum(i - w);
    if (gx * gx + gy * gy > EDGE * EDGE) edge[i] = 1;
  }
  const ok = (i) => {
    if (edge[i]) return false;
    const x = i % w, y = (i / w) | 0, t = x / (w - 1);
    const r = sm[i * 3], g = sm[i * 3 + 1], b = sm[i * 3 + 2];
    const bg = [0, 1, 2].map((c) => L[y][c] * (1 - t) + R[y][c] * t);
    // tint must match this photo's own backdrop (grey or warm beige): compare
    // the r-g and g-b offsets, which ignore the light falloff
    if (Math.abs((r - g) - (bg[0] - bg[1])) > CHROMA || Math.abs((g - b) - (bg[1] - bg[2])) > CHROMA) return false;
    for (let c = 0; c < 3; c++) if (Math.abs(sm[i * 3 + c] - bg[c]) > TOL) return false;
    return true;
  };
  const stack = [];
  // seed from the LEFT and RIGHT edges only: half-body shots crop a garment at
  // the top/bottom edge, and a white top touching the frame was seeded and
  // flooded (pleated trousers, 2026-11-07)
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) { const i = y * w + x; if (!mask[i] && ok(i)) { mask[i] = 1; stack.push(i); } }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i / w) | 0;
    for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
      if (j < 0 || mask[j] || !ok(j)) continue;
      let d = 0; for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(sm[i * 3 + c] - sm[j * 3 + c]));
      if (d > 5) continue;
      mask[j] = 1; stack.push(j);
    }
  }
  // erode
  let m = mask;
  for (let k = 0; k < ERODE; k++) {
    const e = new Uint8Array(n);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      e[i] = m[i] && m[i - 1] && m[i + 1] && m[i - w] && m[i + w] ? 1 : 0;
    }
    for (let x = 0; x < w; x++) { e[x] = m[x]; e[(h - 1) * w + x] = m[(h - 1) * w + x]; }
    for (let y = 0; y < h; y++) { e[y * w] = m[y * w]; e[y * w + w - 1] = m[y * w + w - 1]; }
    m = e;
  }
  return { data, sm, mask: m, w, h };
}


// Gaussian approximated by three box blurs (Wells/Kovesi), on Float32 planes.
// sharp cannot be used here: it silently reinterprets Float32Array raw input as
// 3-channel uchar (tested 2026-11-07: a blurred impulse came back 0).
function boxSizes(sigma, n = 3) {
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(wIdeal); if (wl % 2 === 0) wl--;
  const wu = wl + 2, m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
  return Array.from({ length: n }, (_, i) => ((i < m ? wl : wu) - 1) / 2);
}
function box1d(src, dst, len, stride, count, step, r) {
  // blur `count` lines of `len` samples; edge-clamped running sum
  const inv = 1 / (2 * r + 1);
  for (let k = 0; k < count; k++) {
    const base = k * step;
    const at = (i) => src[base + Math.min(len - 1, Math.max(0, i)) * stride];
    let acc = 0;
    for (let i = -r; i <= r; i++) acc += at(i);
    for (let i = 0; i < len; i++) {
      dst[base + i * stride] = acc * inv;
      acc += at(i + r + 1) - at(i - r);
    }
  }
}
function gaussFloat(arr, w, h, ch, sigma) {
  const out = new Float32Array(arr.length);
  for (let c = 0; c < ch; c++) {
    let a = new Float32Array(w * h), b = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = arr[i * ch + c];
    for (const r of boxSizes(sigma)) {
      box1d(a, b, w, 1, h, w, r);   // rows
      box1d(b, a, h, w, w, 1, r);   // columns
    }
    for (let i = 0; i < w * h; i++) out[i * ch + c] = a[i];
  }
  return out;
}

// normalised convolution: blur(img*mask)/blur(mask), float, two separate blurs
// (no alpha channel, so sharp cannot premultiply behind our back)
async function maskedBlur(data, mask, w, h, sigma) {
  const n = w * h, pre = new Float32Array(n * 3), mw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const m = mask[i];
    for (let c = 0; c < 3; c++) pre[i * 3 + c] = m ? data[i * 3 + c] : 0;
    mw[i] = m ? 1 : 0;
  }
  const fblur = async (arr, ch) => gaussFloat(arr, w, h, ch, sigma);
  const Bc = await fblur(pre, 3), Bm = await fblur(mw, 1), out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++)
    out[i * 3 + c] = Bm[i] > 1e-4 ? Bc[i * 3 + c] / Bm[i] : data[i * 3 + c];
  return out;
}

// mottle = texture between sigma 1.5 and 8 (the "grain" the eye sees);
// blotch = patches between sigma 8 and 30. Both measured on backdrop pixels only.
export async function measure(p) {
  const { data, sm, mask, w, h } = await backdropMask(p);
  const b8 = await maskedBlur(data, mask, w, h, 8), b30 = await maskedBlur(data, mask, w, h, SIGMA);
  let cnt = 0, g = 0, bl = 0;
  for (let i = 0; i < w * h; i++) {
    if (!mask[i]) continue; cnt++;
    for (let c = 0; c < 3; c++) {
      const a = sm[i * 3 + c] - b8[i * 3 + c]; g += a * a;
      const b = b8[i * 3 + c] - b30[i * 3 + c]; bl += b * b;
    }
  }
  return { cover: cnt / (w * h), grain: Math.sqrt(g / (cnt * 3 || 1)), blotch: Math.sqrt(bl / (cnt * 3 || 1)) };
}

export async function clean(p, out, maskOut) {
  const { data, mask, w, h } = await backdropMask(p);
  const n = w * h;
  const BG = await maskedBlur(data, mask, w, h, SIGMA);
  const mbuf = Buffer.alloc(n); for (let i = 0; i < n; i++) mbuf[i] = mask[i] ? 255 : 0;
  const soft = await sharp(mbuf, { raw: { width: w, height: h, channels: 1 } }).blur(FEATHER).raw().toBuffer();
  const o = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) {
    // feather only inward: never touch a pixel outside the eroded mask
    const a = mask[i] ? Math.min(1, Math.max(0, (soft[i] / 255 - 0.5) * 2)) : 0;
    for (let c = 0; c < 3; c++) {
      const bg = BG[i * 3 + c];
      o[i * 3 + c] = Math.round(a * bg + (1 - a) * data[i * 3 + c]);
    }
  }
  await sharp(o, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 92, mozjpeg: true }).toFile(out);
  if (maskOut) await sharp(mbuf, { raw: { width: w, height: h, channels: 1 } }).png().toFile(maskOut);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === "--measure") {
    console.log("grain\tblotch\tcover\tfile");
    for (const f of rest) {
      try { const r = await measure(f); console.log(`${r.grain.toFixed(2)}\t${r.blotch.toFixed(2)}\t${r.cover.toFixed(2)}\t${f}`); }
      catch (e) { console.log(`ERR\t\t\t${f}\t${e.message}`); }
    }
  } else if (mode === "--overlay") {
    // --overlay <out.jpg> <files...> : mask tinted red, tiles side by side, 450px high
    const [out, ...files] = rest, tiles = [];
    for (const f of files) {
      const { data, mask, w, h } = await backdropMask(f);
      const o = Buffer.from(data);
      for (let i = 0; i < w * h; i++) if (mask[i]) { o[i*3] = (o[i*3]*0.5+127)|0; o[i*3+1] = (o[i*3+1]*0.5)|0; o[i*3+2] = (o[i*3+2]*0.5)|0; }
      tiles.push(await sharp(o, { raw: { width: w, height: h, channels: 3 } }).resize({ height: 450 }).jpeg().toBuffer());
    }
    // wraps every OV_COLS tiles (default: one row)
    const cols = +process.env.OV_COLS || tiles.length, comp = [];
    let x = 0, y = 0, rowW = 0, maxW = 0;
    for (let k = 0; k < tiles.length; k++) {
      if (k && k % cols === 0) { y += 456; maxW = Math.max(maxW, x); x = 0; }
      const m = await sharp(tiles[k]).metadata(); comp.push({ input: tiles[k], left: x, top: y }); x += m.width + 6;
    }
    maxW = Math.max(maxW, x);
    await sharp({ create: { width: maxW, height: y + 450, channels: 3, background: "#000" } }).composite(comp).jpeg({ quality: 75 }).toFile(out);
  } else if (mode === "--clean") {
    const mi = rest.indexOf("--mask");
    await clean(rest[0], rest[1], mi >= 0 ? rest[mi + 1] : undefined);
  } else {
    console.log("usage: --measure <files...> | --clean <in> <out> [--mask m.png]");
  }
}
