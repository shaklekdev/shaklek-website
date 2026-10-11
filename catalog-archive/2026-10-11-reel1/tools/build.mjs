// The first teaser reel, cut from the Higgsfield clips in ../clips.
//
//   node brand-assets/reels/teaser/build.mjs        -> brand-assets/reels/teaser.mp4
//
// Order and words: marketing review + founder, 2026-10-11. The tagline is
// split so the loop finishes the sentence: "Your skin breathing." on the
// breath, "Your clothes fitting." on the abaya going back on the shoulder.
//
// Cut points are hers or measured, not taste:
// - walk stops before 2.0 s: after it the right sleeve passes UNDER the abaya
//   and the hand comes out beneath it (founder, 2026-10-11).
// - feet uses 1.5-2.6 s: from ~3.3 s the hem turns see-through against the
//   sun, which linen is not. Chosen by eye; a sharpness metric picked the
//   see-through frames as "sharpest", so do not let a metric re-pick it.
// - every image-to-video clip loses its first 0.5 s, where Kling ramps in
//   from a frozen still.
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
const TMP = "/tmp/shaklek-teaser";
// LOOK=film: grain, halation, faded colour, vignette, gate weave, small sans
// type. Founder, 2026-10-11: the clean cut is "way too AI, too perfect".
const FILM = process.env.LOOK === "film";
const OUT = `${REPO}/brand-assets/reels/teaser${FILM ? "-film" : ""}.mp4`;
const W = 1080, H = 1920, FPS = 24;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const LINE1 = "Your skin breathing.";
const LINE2 = "Your clothes fitting.";
const DATE = "26·10·26";
const CTA = "Waitlist, link in bio";
for (const t of [LINE1, LINE2, CTA]) lint(t, "teaser");

// [clip, start, end, overlay]
const CUTS = [
  ["teaser-1-face-1.mp4", 3.06, 4.68, "line1"],
  ["teaser-2-feet-1.mp4", 0, 1.8], // clean to ~3.0 s; see-through from ~3.3 s
  ["teaser-3-walk-1.mp4", 0, 1.895],
  ["teaser-4-weave-1.mp4", 1.0, 3.0],
  ["teaser-5-lift-1.mp4", 1.63, 3.54, "line2"],
]; // founder's own in/out points from trim.html, 2026-10-11

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

// 1. frames out of each clip (AVFoundation helper; no ffmpeg on this machine)
const FR = `${TMP}/frames-bin`;
execFileSync("swiftc", ["-O", `${HERE}/frames.swift`, "-o", FR], { stdio: ["ignore", "ignore", "inherit"] });
CUTS.forEach(([clip, a, b], i) => execFileSync(FR, [`${CLIPS}/${clip}`, `${TMP}/c${i}`, String(a), String(b), String(FPS)]));

// 2. text layers, drawn by Chrome so the type is the brand's
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Italiana&family=Noto+Naskh+Arabic&display=swap');
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden}
.d{font-family:"Cormorant Garamond",Georgia,serif;font-weight:300;letter-spacing:-.012em;color:#faf8f4;
  text-shadow:0 2px 24px rgba(0,0,0,.35),0 1px 3px rgba(0,0,0,.25)}
.w{font-family:"Italiana",Georgia,serif;letter-spacing:.3em;color:#faf8f4}`;
const band = (text) => `<div style="position:absolute;left:0;right:0;top:${H / 2 - 230}px;height:460px;background:linear-gradient(to bottom,rgba(26,26,26,0),rgba(26,26,26,.34) 50%,rgba(26,26,26,0))"></div>
  <div class="d" style="position:absolute;left:0;right:0;top:${H / 2 - 58}px;font-size:100px;line-height:1;text-align:center;text-shadow:0 2px 30px rgba(0,0,0,.55),0 1px 4px rgba(0,0,0,.35)">${text}</div>`;
const bandFilm = (text) => `<div style="position:absolute;left:0;right:0;top:${H / 2 - 22}px;text-align:center;font:300 40px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.06em;color:#f6f1e8;text-shadow:0 1px 14px rgba(0,0,0,.45)">${text}</div>`;
const endCard = (show) => {
  const v = (i) => (i === show ? "" : "visibility:hidden;");
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:38px">
    <div style="${v(0)}font-family:'Noto Naskh Arabic',serif;font-size:190px;line-height:1;color:#faf8f4">ش</div>
    <div class="w" style="${v(1)}font-size:64px;padding-left:.3em">SHAKLEK</div>
    <div style="${v(2)}width:72px;height:1px;background:#9c8445"></div>
    <div class="w" style="${v(2)}font-size:46px;letter-spacing:.22em;padding-left:.22em">${DATE}</div>
    <div class="d" style="${v(3)}font-size:44px;color:#e9e3d8;margin-top:24px">${CTA}</div></div>`;
};
const LAYERS = {
  // Founder, 2026-10-11: text in the middle of the frame, over a soft dark
  // band (both frames behind it are mostly ivory linen). line1 on the breath,
  // line2 on the walk toward camera.
  line1: (FILM ? bandFilm : band)(LINE1),
  line2: (FILM ? bandFilm : band)(LINE2),
  // The end card, split into four layers with an identical layout (the other
  // elements hidden, not removed) so each can fade in on its own. Founder's
  // feedback, 2026-10-11: the card "shows abruptly"; it should melt out of the
  // last image and the text should appear "petit a petit".
  ...Object.fromEntries([0, 1, 2, 3].map((i) => [`end${i}`, endCard(i)])),
};

async function renderLayers() {
  const port = 9800 + Math.floor(Math.random() * 100);
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
    const doc = `<!doctype html><meta charset="utf-8"><style>${CSS}</style>${html}`;
    await send("Page.navigate", { url: "data:text/html;base64," + Buffer.from(doc).toString("base64") });
    await new Promise((r) => setTimeout(r, 1500)); // fonts
    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`${TMP}/${name}.png`, Buffer.from(shot.data, "base64"));
  }
  ws.close(); proc.kill();
}
await renderLayers();

// 3. compose every frame at 1080x1920
const fade = (k, n) => { const u = Math.min(1, Math.max(0, k / n)); return u * u * (3 - 2 * u); }; // eased, k frames into the fade
async function withLayer(base, layer, alpha) {
  if (alpha <= 0) return base;
  const { data, info } = await sharp(`${TMP}/${layer}.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * alpha);
  return sharp(base).composite([{ input: data, raw: { width: info.width, height: info.height, channels: 4 } }]).toBuffer();
}
const seq = [];
let n = 0;
// layers: [[name, alpha], ...] laid AFTER the film pass, so grain and gate
// weave touch the footage only. Baked in before it, the type shook with the
// frame (founder, 2026-10-11: "why is the text shaking").
const put = async (buf, layers = [], still = false) => {
  const p = `${TMP}/out-${String(n).padStart(4, "0")}.png`;
  if (FILM) buf = await film(buf, n, still);
  n++;
  for (const [name, a] of layers) buf = await withLayer(buf, name, a);
  await sharp(buf).png().toFile(p); seq.push(p);
};
// A film stock look, deterministic per frame. Halation: the bright parts,
// blurred and tinted warm, added back. Grain changes every frame; the frame
// drifts by a pixel or two like a gate. Kept faint on purpose: noticed, not seen.
let seed = 11; const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
async function film(buf, i, still = false) {
  if (still) seed = 11; // same grain every frame: the end card must not crawl
  const base = await sharp(buf).resize(W, H).removeAlpha().raw().toBuffer();
  const hi = await sharp(base, { raw: { width: W, height: H, channels: 3 } }).linear(1.6, -190).blur(22).raw().toBuffer();
  const dx = still ? 0 : Math.round(Math.sin(i * 1.7) * 1.5), dy = still ? 0 : Math.round(Math.cos(i * 1.3) * 1.5);
  const o = Buffer.alloc(base.length);
  for (let y = 0; y < H; y++) {
    const sy = Math.min(H - 1, Math.max(0, y + dy)), vy = (y / H - 0.5) * 2;
    for (let x = 0; x < W; x++) {
      const sx = Math.min(W - 1, Math.max(0, x + dx)), q = (sy * W + sx) * 3, p = (y * W + x) * 3, vx = (x / W - 0.5) * 2;
      const vig = 1 - 0.16 * Math.pow(Math.min(1, (vx * vx + vy * vy) / 2), 1.3);
      const g = still ? 0 : (rnd() + rnd() - 1) * 13; // no grain when still: frozen grain re-compresses differently each frame and the card shimmers
      const r0 = base[q], g0 = base[q + 1], b0 = base[q + 2], lum = 0.3 * r0 + 0.59 * g0 + 0.11 * b0;
      const rgb = [r0, g0, b0].map((v, c) => {
        let u = lum + (v - lum) * 0.82;                    // fade the colour
        u = 14 + u * 0.9;                                   // lift blacks, roll off whites
        u += hi[q + c] * [0.22, 0.12, 0.05][c];             // warm halation
        u *= [1.03, 1.0, 0.94][c];                          // warm stock
        return Math.max(0, Math.min(255, u * vig + g));
      });
      o[p] = rgb[0]; o[p + 1] = rgb[1]; o[p + 2] = rgb[2];
    }
  }
  return sharp(o, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
}
const frames = (i) => fs.readdirSync(`${TMP}/c${i}`).sort().map((f) => `${TMP}/c${i}/${f}`);
const full = (f) => sharp(f).resize(W, H, { fit: "cover" }).toBuffer();
// frame at time t of a clip's cut, blending neighbours so slow motion is smooth
async function at(list, t) {
  const x = Math.min(list.length - 1, Math.max(0, t * FPS)), i = Math.floor(x), w = x - i;
  const A = await sharp(await full(list[i])).raw().toBuffer();
  if (w < 0.02 || i + 1 >= list.length) return A;
  const B = await sharp(await full(list[i + 1])).raw().toBuffer();
  const o = Buffer.alloc(A.length); for (let p = 0; p < A.length; p++) o[p] = A[p] + (B[p] - A[p]) * w; return o;
}
// three equal stacked bands, each the chosen horizontal slice of its frame
async function split3(parts) { // [[raw, y0 fraction], ...] top to bottom
  const h = Math.round(H / 3);
  const bands = await Promise.all(parts.map(([b, y], i) => sharp(b, { raw: { width: W, height: H, channels: 3 } })
    .extract({ left: 0, top: Math.round(H * y), width: W, height: i === 2 ? H - 2 * h : h }).raw().toBuffer()));
  const o = Buffer.concat(bands);
  for (const yy of [h, 2 * h]) for (let y = yy - 1; y <= yy + 1; y++) o.fill(246, y * W * 3, (y + 1) * W * 3); // ivory hairlines
  return sharp(o, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
}
const [FACE, FEET, WALK, WEAVE, LIFT] = [0, 1, 2, 3, 4].map(frames);
let last;
// 1. face, breathing: "Your skin breathing." from ~0.3 s
// slowed to 70% (founder: the first take "needs to be a bit longer"), her cut kept
const FACE_SLOW = 0.7, faceN = Math.round(FACE.length / FACE_SLOW);
for (let k = 0; k < faceN; k++) {
  const png = await sharp(await at(FACE, k * FACE_SLOW / FPS), { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
  await put((last = png), [["line1", fade(k - 6, 14)]]);
}
// 2. three equal bands (founder): linen, the abaya going back on the shoulder,
//    feet in the foam. Feet and linen at 70% speed, the shoulder at full speed
//    so the gesture reads inside the same time.
// 2.5 s (founder: 1.3 s was "too short"); the shoulder runs at whatever speed
// lets the whole gesture finish inside it.
const SPLIT_S = 2.5, SLOW = 0.7, splitN = Math.round(SPLIT_S * FPS), liftRate = LIFT.length / FPS / SPLIT_S;
for (let k = 0; k < splitN; k++) {
  const t = k / FPS;
  await put((last = await split3([[await at(WEAVE, t * SLOW), 0.3], [await at(LIFT, t * liftRate), 0.2], [await at(FEET, t * SLOW), 0.5]])));
}
// 3. the walk toward camera: "Your clothes fitting."
// Grading this shot toward the others was tried (channel transfer to the face
// shot) and rejected by the founder: "looks nothing like the other shots".
// The difference is the source, not the grade; see session log 2026-10-11.
// Slowed to 70% to give the end 1-2 s more (founder's feedback); the cut
// itself cannot run past ~1.9 s.
const WALK_SLOW = 0.7, walkN = Math.round((WALK.length / WALK_SLOW));
let lastRaw;
for (let k = 0; k < walkN; k++) {
  lastRaw = await at(WALK, k * WALK_SLOW / FPS);
  const png = await sharp(lastRaw, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
  await put((last = png), [["line2", fade(k - 6, 14) * (1 - fade(k - (walkN - 10), 10))]]);
}
// end card: the last image melts (blur and dim rise together over 0.9 s),
// then the four elements fade in one after another.
const MELT = Math.round(0.9 * FPS);
for (let k = 1; k <= MELT; k++) {
  const u = fade(k, MELT);
  await put(await sharp(last).blur(0.3 + 18 * u).modulate({ brightness: 1 - 0.45 * u }).toBuffer(), [], true);
}
const bg = await sharp(last).blur(18.3).modulate({ brightness: 0.55 }).toBuffer();
const STAGGER = 9, IN = 14, HOLD = Math.round(1.2 * FPS);
for (let k = 0; k < 3 * STAGGER + IN + HOLD; k++) {
  await put(bg, [0, 1, 2, 3].map((i) => [`end${i}`, fade(k - i * STAGGER, IN)]), true); // founder: "just still"
}

// 4. encode with the reel pipeline's own AVFoundation encoder
execFileSync(`${REPO}/website/scripts/social/encode`, [OUT, String(FPS), String(W), String(H), ...seq], { stdio: "inherit" });
console.log(`${path.relative(REPO, OUT)}  ${seq.length} frames = ${(seq.length / FPS).toFixed(1)} s`);
