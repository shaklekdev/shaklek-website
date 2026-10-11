// The "artistic" cut of the teaser: many short pieces of the same five clips,
// with transitions, one stacked split screen, a warm grade and grain.
//
//   node brand-assets/reels/teaser/build-art.mjs   -> brand-assets/reels/teaser-art.mp4
//
// Founder, 2026-10-11: the straight cut is "not artistic enough"; "mix many
// mini clips of the same clips and show artistic transitions", and split the
// screen in two at some point. Edit plan from the reference research
// (texture match cut, one split used once, breath-led pacing, loop to start).
//
// Usable ranges are hers (trim.html) or measured; never reach outside them:
//   walk  0 - 1.895  (after ~2.0 s the right sleeve passes under the abaya)
//   feet  0 - 0.939  (later the hem turns see-through against the sun)
//   lift  1.63 - 3.54
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../..");
const require = createRequire(`${REPO}/website/package.json`);
const sharp = require("sharp");
const { lint } = await import(`${REPO}/website/scripts/social/copy-rules.mjs`);

const CLIPS = `${REPO}/brand-assets/reels/clips`;
const TMP = "/tmp/shaklek-teaser-art";
const OUT = `${REPO}/brand-assets/reels/teaser-art.mp4`;
const W = 1080, H = 1920, FPS = 24;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const SRC = {
  face: ["teaser-1-face-1.mp4", 0.5, 2.1],
  feet: ["teaser-2-feet-1.mp4", 0, 0.939],
  walk: ["teaser-3-walk-1.mp4", 0, 1.895],
  weave: ["teaser-4-weave-1.mp4", 0, 5.0],
  lift: ["teaser-5-lift-1.mp4", 1.63, 3.54],
};
const LINE1 = "Your skin breathing.", LINE2 = "Your clothes fitting.", CTA = "Waitlist, link in bio";
for (const t of [LINE1, LINE2, CTA]) lint(t, "teaser");

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

// ---- frames: every frame of each usable range, at 1080x1920 ----------------
const FR = `${TMP}/frames-bin`;
execFileSync("swiftc", ["-O", `${HERE}/frames.swift`, "-o", FR], { stdio: ["ignore", "ignore", "inherit"] });
const RAW = {};
for (const [k, [clip, a, b]] of Object.entries(SRC)) {
  execFileSync(FR, [`${CLIPS}/${clip}`, `${TMP}/${k}`, String(a), String(b), String(FPS)]);
  const files = fs.readdirSync(`${TMP}/${k}`).sort();
  RAW[k] = await Promise.all(files.map((f) => sharp(`${TMP}/${k}/${f}`).resize(W, H, { fit: "cover" }).removeAlpha().raw().toBuffer()));
}
const span = (k) => RAW[k].length / FPS; // usable seconds

// frame of clip k at time t (seconds into its usable range), blended between
// neighbours so slow motion does not stutter
function at(k, t) {
  const f = Math.max(0, Math.min(RAW[k].length - 1, t * FPS));
  const i = Math.floor(f), j = Math.min(RAW[k].length - 1, i + 1), w = f - i;
  if (w < 0.01 || i === j) return RAW[k][i];
  const A = RAW[k][i], B = RAW[k][j], o = Buffer.alloc(A.length);
  for (let p = 0; p < A.length; p++) o[p] = A[p] + (B[p] - A[p]) * w;
  return o;
}

// ---- pixel helpers (raw RGB 1080x1920) --------------------------------------
const mix = (A, B, w) => { const o = Buffer.alloc(A.length); for (let p = 0; p < A.length; p++) o[p] = A[p] + (B[p] - A[p]) * w; return o; };
async function zoom(buf, s, cx = 0.5, cy = 0.5) { // push in by factor s around (cx,cy)
  if (s <= 1.001) return buf;
  const w = Math.round(W / s), h = Math.round(H / s);
  const left = Math.round((W - w) * cx), top = Math.round((H - h) * cy);
  return sharp(buf, { raw: { width: W, height: H, channels: 3 } }).extract({ left, top, width: w, height: h }).resize(W, H).raw().toBuffer();
}
async function blur(buf, sigma) {
  if (sigma < 0.4) return buf;
  return sharp(buf, { raw: { width: W, height: H, channels: 3 } }).blur(sigma).raw().toBuffer();
}
function light(buf, a) { // warm light leak: bloom toward a warm white
  if (a <= 0) return buf;
  const o = Buffer.alloc(buf.length), L = [255, 244, 226];
  for (let p = 0; p < buf.length; p += 3) for (let c = 0; c < 3; c++) o[p + c] = buf[p + c] + (L[c] - buf[p + c]) * a;
  return o;
}
async function split(top, bottom, line = 3) { // stacked: each half is the centre band of its frame
  const half = async (b) => sharp(b, { raw: { width: W, height: H, channels: 3 } }).extract({ left: 0, top: Math.round(H * 0.22), width: W, height: H / 2 }).raw().toBuffer();
  const [t, b] = await Promise.all([half(top), half(bottom)]);
  const o = Buffer.concat([t, b]);
  for (let y = H / 2 - Math.floor(line / 2); y <= H / 2 + Math.floor(line / 2); y++)
    for (let x = 0; x < W; x++) { const p = (y * W + x) * 3; o[p] = 250; o[p + 1] = 248; o[p + 2] = 244; }
  return o;
}
// split -> full: the walk frame slides up from its split position (band from
// 0.22H shown at y = H/2) to full frame, pushing the top panel out
async function grow(top, full, u) {
  const off = Math.round(H * 0.28 * (1 - u)), topH = Math.round((H / 2) * (1 - u));
  const o = Buffer.alloc(W * H * 3);
  // full frame shifted down by off, but its rows above 0.22H only appear as the split closes
  for (let y = 0; y < H; y++) {
    const sy = y - off; if (sy < 0 || sy >= H) continue;
    full.copy(o, y * W * 3, sy * W * 3, (sy + 1) * W * 3);
  }
  if (topH > 0) {
    const band = await sharp(top, { raw: { width: W, height: H, channels: 3 } }).extract({ left: 0, top: Math.round(H * 0.22) + (H / 2 - topH), width: W, height: topH }).raw().toBuffer();
    band.copy(o, 0);
    for (let y = topH - 1; y <= topH + 1 && y < H; y++) for (let x = 0; x < W; x++) { const p = (y * W + x) * 3; o[p] = 250; o[p + 1] = 248; o[p + 2] = 244; }
  }
  return o;
}
// grade: warm highlights, slightly lifted blacks, gentle contrast; then grain
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
function grade(buf) {
  const o = Buffer.alloc(buf.length);
  for (let p = 0; p < buf.length; p += 3) {
    const g = (rnd() - 0.5) * 14;
    for (let c = 0; c < 3; c++) {
      let v = buf[p + c] / 255;
      v = 0.035 + v * 0.95;                       // lift blacks, soften whites
      v = v + (v - 0.5) * 0.06 * (1 - Math.abs(v - 0.5) * 2); // gentle S
      if (c === 0) v *= 1.025; if (c === 2) v *= 0.965;       // warm
      o[p + c] = Math.max(0, Math.min(255, v * 255 + g));
    }
  }
  return o;
}

// ---- text layers by Chrome (brand type) -------------------------------------
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Italiana&family=Noto+Naskh+Arabic&display=swap');
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden}
.d{font-family:"Cormorant Garamond",Georgia,serif;font-weight:300;letter-spacing:-.012em;color:#faf8f4;text-shadow:0 2px 24px rgba(0,0,0,.35),0 1px 3px rgba(0,0,0,.25)}
.w{font-family:"Italiana",Georgia,serif;letter-spacing:.3em;color:#faf8f4}`;
const t1 = (words) => `<div class="d" style="position:absolute;left:0;right:0;top:150px;font-size:104px;line-height:1.02;text-align:center">${words}</div>`;
const LAYERS = {
  l1a: t1("Your skin<br><span style='opacity:0'>breathing.</span>"),
  l1b: t1("Your skin<br>breathing."),
  // on the split line, centred
  l2: `<div class="d" style="position:absolute;left:0;right:0;top:${H / 2 - 64}px;font-size:96px;line-height:1;text-align:center;text-shadow:0 2px 30px rgba(0,0,0,.55)">${LINE2}</div>`,
  end: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:38px">
    <div style="font-family:'Noto Naskh Arabic',serif;font-size:190px;line-height:1;color:#faf8f4">ش</div>
    <div class="w" style="font-size:64px;padding-left:.3em">SHAKLEK</div>
    <div style="width:72px;height:1px;background:#9c8445"></div>
    <div class="w" style="font-size:46px;letter-spacing:.22em;padding-left:.22em">26·10·26</div>
    <div class="d" style="font-size:44px;color:#e9e3d8;margin-top:24px">${CTA}</div></div>`,
};
const LAYER = {};
{
  const port = 9900 + Math.floor(Math.random() * 90);
  const proc = spawn(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${TMP}/chrome`,
    `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 100 && !tabs; i++) {
    tabs = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).catch(() => null);
    if (!tabs) await new Promise((r) => setTimeout(r, 100));
  }
  const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map();
  ws.onmessage = (m) => { const x = JSON.parse(m.data); pend.get(x.id)?.(x.result); pend.delete(x.id); };
  const send = (method, params = {}) => new Promise((r) => { pend.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
  for (const [name, html] of Object.entries(LAYERS)) {
    await send("Page.navigate", { url: "data:text/html;base64," + Buffer.from(`<!doctype html><meta charset="utf-8"><style>${CSS}</style>${html}`).toString("base64") });
    await new Promise((r) => setTimeout(r, 1500));
    const shot = await send("Page.captureScreenshot", { format: "png" });
    LAYER[name] = await sharp(Buffer.from(shot.data, "base64")).ensureAlpha().raw().toBuffer();
  }
  ws.close(); proc.kill();
}
function over(buf, name, a) {
  if (a <= 0) return buf;
  const L = LAYER[name], o = Buffer.from(buf);
  for (let p = 0, q = 0; p < o.length; p += 3, q += 4) {
    const al = (L[q + 3] / 255) * a;
    if (al) for (let c = 0; c < 3; c++) o[p + c] = o[p + c] + (L[q + c] - o[p + c]) * al;
  }
  return o;
}

// ---- the edit: a list of shots, each a function of its local time ----------
// d = seconds; f(u, t) returns a frame, u = 0..1 through the shot, t = seconds.
const ramp = (u) => u * u * (3 - 2 * u);
const SHOTS = [
  // 1. hook: the weave, pushing in; it is the texture that stops the thumb
  { d: 1.2, f: (u, t) => zoom(at("weave", 1.0 + t * 0.8), 1.0 + 0.10 * u) },
  // 2. texture match: weave dissolves through warm light into the foam
  { d: 0.35, f: async (u, t) => light(mix(await zoom(at("weave", 1.96 + t * 0.8), 1.10), at("feet", 0), ramp(u)), Math.sin(Math.PI * u) * 0.55) },
  // 3. feet in foam, slow motion
  { d: 1.15, f: (u, t) => at("feet", 0.05 + t * 0.6) },
  // 4. whip: feet blur out, face blurs in
  { d: 0.25, f: async (u) => u < 0.5 ? blur(await zoom(at("feet", 0.75), 1 + u * 0.3), u * 40) : blur(await zoom(at("face", 0.1), 1.15 - (u - 0.5) * 0.3), (1 - u) * 40) },
  // 5. face breathing, "Your skin"
  { d: 0.8, f: (u, t) => over(at("face", 0.15 + t * 0.8), "l1a", ramp(Math.min(1, u * 3))) },
  // 6. flash cut: a quarter second of the weave close, like a heartbeat
  { d: 0.25, f: async (u, t) => over(await zoom(at("weave", 3.0 + t), 1.25), "l1a", 1) },
  // 7. face again, "breathing." lands on the exhale
  { d: 0.9, f: (u, t) => over(at("face", 0.8 + t * 0.8), u < 0.25 ? "l1a" : "l1b", 1) },
  // 8. light leak into the split
  { d: 0.3, f: async (u, t) => light(mix(at("face", 1.52), await split(at("lift", 0), at("walk", 0)), ramp(u)), Math.sin(Math.PI * u) * 0.6) },
  // 9. the split: hand puts the abaya back (top) / she walks to us (bottom); text on the line
  { d: 1.9, f: async (u, t) => over(await split(at("lift", t * 1.0), at("walk", t * 0.55)), "l2", ramp(Math.min(1, Math.max(0, (u - 0.15) * 3)))) },
  // 10. bottom grows to full frame: dissolve split -> walk, then walk slows as she nears
  // (a dissolve here showed two women at two scales; the bottom panel slides up instead)
  { d: 0.4, f: async (u, t) => grow(at("lift", 1.9), at("walk", 1.05 + t * 0.4), ramp(u)) },
  { d: 1.0, f: (u, t) => zoom(at("walk", 1.2 + t * (0.7 - 0.35 * u)), 1.0 + 0.06 * u, 0.5, 0.4) },
  // 11. light out, end card on the warm blur
  { d: 0.25, f: async (u) => light(at("walk", 1.88), Math.sin(Math.PI * u * 0.5) * 0.8) },
  { d: 1.5, f: async (u) => over(await blur(light(at("lift", 1.85), 0.15), 18), "end", ramp(Math.min(1, u * 4))) },
];

// ---- render ------------------------------------------------------------------
const seq = [];
let n = 0;
for (const s of SHOTS) {
  const frames = Math.round(s.d * FPS);
  for (let k = 0; k < frames; k++) {
    const u = frames > 1 ? k / (frames - 1) : 0, t = k / FPS;
    const buf = grade(await s.f(u, t));
    const p = `${TMP}/out-${String(n++).padStart(4, "0")}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png({ compressionLevel: 1 }).toFile(p);
    seq.push(p);
  }
}
execFileSync(`${REPO}/website/scripts/social/encode`, [OUT, String(FPS), String(W), String(H), ...seq], { stdio: "inherit" });
console.log(`${path.relative(REPO, OUT)}  ${seq.length} frames = ${(seq.length / FPS).toFixed(1)} s`);
