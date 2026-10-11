// Post 1, "the name": ivory linen moving, the meaning of Shaklek written over it.
//
//   node brand-assets/reels/teaser/build-name.mjs   -> brand-assets/reels/name.mp4
//
// Founder's idea, 2026-10-11, and her call that it is the first post. Words are
// the site's own (/our-story, website/src/app/our-story/page.tsx:217 and :463).
// Footage: the approved linen clip, slowed; nothing generated.
// Text is laid AFTER the film pass so it never moves with the grain/weave, and
// it is charcoal because ivory type disappears on ivory linen.
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

const TMP = "/tmp/shaklek-name";
const OUT = `${REPO}/brand-assets/reels/name.mp4`;
const W = 1080, H = 1920, FPS = 24;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CLIP = `${REPO}/brand-assets/reels/clips/teaser-4-weave-1.mp4`;

const MEANS = "means “your way” in Arabic.";
const LOOK = "Your look, your vision, simply you.";
for (const t of [MEANS, LOOK]) lint(t, "name reel");

const SLOW = 0.6, DURATION = 8.0;

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
const FR = `${TMP}/frames-bin`;
execFileSync("swiftc", ["-O", `${HERE}/frames.swift`, "-o", FR], { stdio: ["ignore", "ignore", "inherit"] });
execFileSync(FR, [CLIP, `${TMP}/src`, "0.3", "5.0", String(FPS)]);
const SRC = await Promise.all(fs.readdirSync(`${TMP}/src`).sort().map((f) => sharp(`${TMP}/src/${f}`).resize(W, H, { fit: "cover" }).removeAlpha().raw().toBuffer()));
function at(t) { // blended, so slow motion is smooth
  const x = Math.min(SRC.length - 1, t * FPS), i = Math.floor(x), w = x - i;
  if (w < 0.02 || i + 1 >= SRC.length) return SRC[i];
  const A = SRC[i], B = SRC[i + 1], o = Buffer.alloc(A.length);
  for (let p = 0; p < A.length; p++) o[p] = A[p] + (B[p] - A[p]) * w;
  return o;
}

// text layers, one per line, same layout (others hidden) so each fades alone
// Fonts embedded as data: URLs. Loading them by @import from a data: page
// silently failed and Chrome drew system faces instead (2026-10-11).
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
let FONT_CSS = await (await fetch("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Italiana&family=Reem+Kufi:wght@400&display=block", { headers: { "User-Agent": UA } })).text();
for (const url of [...new Set(FONT_CSS.match(/https:[^)]+\.woff2/g))]) {
  const b64 = Buffer.from(await (await fetch(url)).arrayBuffer()).toString("base64");
  FONT_CSS = FONT_CSS.split(url).join(`data:font/woff2;base64,${b64}`);
}
const CSS = `${FONT_CSS}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden}`;
const card = (show) => {
  const v = (i) => (i === show ? "" : "visibility:hidden;");
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;color:#3d342b;text-align:center">
    <div style="${v(0)}font-family:'Reem Kufi',sans-serif;font-weight:400;font-size:200px;line-height:1.1">شكلك</div>
    <div style="${v(1)}font-family:Italiana,serif;font-size:74px;letter-spacing:.3em;padding-left:.3em">SHAKLEK</div>
    <div style="${v(2)}width:72px;height:1px;background:#9c8445;margin:6px 0"></div>
    <div style="${v(2)}font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:64px">${MEANS}</div>
    <div style="${v(3)}font-family:'Cormorant Garamond',serif;font-weight:300;font-size:50px;margin-top:40px;color:#4d4339">${LOOK}</div></div>`;
};
const LAYER = [];
{
  const port = 9700 + Math.floor(Math.random() * 90);
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
  for (let i = 0; i < 4; i++) {
    await send("Page.navigate", { url: "data:text/html;base64," + Buffer.from(`<!doctype html><meta charset="utf-8"><style>${CSS}</style>${card(i)}`).toString("base64") });
    // Prove the faces are in use: the same text measured in the web font and in
    // the fallback must differ in width. (document.fonts.check() answers true
    // for a family it has never heard of, so it proved nothing.)
    const probe = `(async () => { await document.fonts.load("200px 'Reem Kufi'", "شكلك"); await document.fonts.load("74px Italiana"); await document.fonts.ready;
      const c = document.createElement("canvas").getContext("2d"); const w = (f, t) => { c.font = f; return c.measureText(t).width; };
      return w("200px 'Reem Kufi', serif", "شكلك") !== w("200px serif", "شكلك") && w("74px Italiana, serif", "SHAKLEK") !== w("74px serif", "SHAKLEK"); })()`;
    const r = await send("Runtime.evaluate", { expression: probe, awaitPromise: true, returnByValue: true });
    if (r?.result?.value !== true) throw new Error("web fonts not in use; refusing to render with a fallback face");
    const shot = await send("Page.captureScreenshot", { format: "png" });
    LAYER[i] = await sharp(Buffer.from(shot.data, "base64")).ensureAlpha().raw().toBuffer();
  }
  ws.close(); proc.kill();
}

// film look on the footage only (same recipe as the teaser)
let seed = 11; const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
async function film(base, i) {
  const hi = await sharp(base, { raw: { width: W, height: H, channels: 3 } }).linear(1.6, -190).blur(22).raw().toBuffer();
  const dx = Math.round(Math.sin(i * 1.7) * 1.5), dy = Math.round(Math.cos(i * 1.3) * 1.5);
  const o = Buffer.alloc(base.length);
  for (let y = 0; y < H; y++) {
    const sy = Math.min(H - 1, Math.max(0, y + dy)), vy = (y / H - 0.5) * 2;
    for (let x = 0; x < W; x++) {
      const sx = Math.min(W - 1, Math.max(0, x + dx)), q = (sy * W + sx) * 3, p = (y * W + x) * 3, vx = (x / W - 0.5) * 2;
      const vig = 1 - 0.16 * Math.pow(Math.min(1, (vx * vx + vy * vy) / 2), 1.3), g = (rnd() + rnd() - 1) * 10;
      const r0 = base[q], g0 = base[q + 1], b0 = base[q + 2], lum = 0.3 * r0 + 0.59 * g0 + 0.11 * b0;
      for (let c = 0; c < 3; c++) {
        let u = lum + ([r0, g0, b0][c] - lum) * 0.82;
        u = 14 + u * 0.9 + hi[q + c] * [0.22, 0.12, 0.05][c];
        u *= [1.03, 1.0, 0.94][c];
        o[p + c] = Math.max(0, Math.min(255, u * vig + g));
      }
    }
  }
  return o;
}
const ease = (k, n) => { const u = Math.min(1, Math.max(0, k / n)); return u * u * (3 - 2 * u); };
// when each line starts (s) and its fade length; a slow write, then a hold
const STARTS = [0.7, 1.9, 3.1, 4.6], FADE = 0.8;

const seq = [];
const N = Math.round(DURATION * FPS);
for (let k = 0; k < N; k++) {
  const t = k / FPS;
  const o = await film(at(t * SLOW), k);
  for (let i = 0; i < 4; i++) {
    const a = ease(t - STARTS[i], FADE);
    if (a <= 0) continue;
    const L = LAYER[i];
    for (let p = 0, q = 0; p < o.length; p += 3, q += 4) {
      const al = (L[q + 3] / 255) * a;
      if (al) for (let c = 0; c < 3; c++) o[p + c] = o[p + c] + (L[q + c] - o[p + c]) * al;
    }
  }
  const p = `${TMP}/out-${String(k).padStart(4, "0")}.png`;
  await sharp(o, { raw: { width: W, height: H, channels: 3 } }).png({ compressionLevel: 1 }).toFile(p);
  seq.push(p);
}
execFileSync(`${REPO}/website/scripts/social/encode`, [OUT, String(FPS), String(W), String(H), ...seq], { stdio: "inherit" });
console.log(`${path.relative(REPO, OUT)}  ${seq.length} frames = ${(seq.length / FPS).toFixed(1)} s`);
