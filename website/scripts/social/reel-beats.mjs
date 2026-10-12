/**
 * Text-motion reels, 1080x1920, built from beats.
 *
 * WHY THIS EXISTS. The reference set the founder collected on 2026-09-13
 * (@layere.co, 219K followers) shows the same thing on every high-performing
 * post: a flat field, one sentence, no model, no music sync, and shares far
 * above likes. 915 shares on a slide that is a sentence on a coloured
 * rectangle. That is a format we can produce for nothing, in our own
 * typeface, without a video model, a shoot, or a licence.
 *
 * So: no generation, no cost. Headless Chrome renders frames, `encode` (the
 * Swift AVFoundation wrapper in this folder) muxes them. The only inputs are
 * words we already own and two images already in the repo.
 *
 * A beat is one screen. `frames` is how many 30fps frames it holds, and
 * `build` is an optional array of partial states rendered in sequence so the
 * text arrives in pieces instead of appearing whole. Photo beats get a slow
 * scale, which is the one bit of real motion in here; everything else is a
 * cut, on purpose. Motion that is not saying anything reads as a template.
 *
 *   node reel-beats.mjs shoulder     # the measuring offer
 *   node reel-beats.mjs label        # linen vs polyester
 */
import fs from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { lint } from "./copy-rules.mjs";

const REPO = fileURLToPath(new URL("../../../", import.meta.url)).replace(/\/$/, "");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/shaklek-reel";
const OUT = `${REPO}/brand-assets/reels`;
const W = 1080, H = 1920, FPS = 30;

const b64 = (p) => `data:image/jpeg;base64,${fs.readFileSync(p).toString("base64")}`;
// ⚠️ THE MASTER LOGO, never "Shaklek" typed in a font. Founder, 2026-10-11:
// "different fonts in different places... it feels like we're changing the
// brand". Same file as the packaging, the site and the emails.
const svg = (p) => `data:image/svg+xml;base64,${fs.readFileSync(p).toString("base64")}`;
export const LOGO = {
  white: svg(`${REPO}/branding/source/shaklek-logo-white-on-dark.svg`),
  dark: svg(`${REPO}/branding/source/shaklek-logo.svg`),
};

export const IMG = {
  shoulder: b64(`${REPO}/brand-assets/carousels/04-nobody-knows-their-shoulder/shoulder.jpg`),
  hands: b64(`${REPO}/brand-assets/carousels/04-nobody-knows-their-shoulder/hands.jpg`),
  shirt: b64(`${REPO}/brand-assets/carousels/01-check-the-label/shirt.jpg`),
  flax: b64(`${REPO}/brand-assets/carousels/01-check-the-label/flax-field.jpg`),
  // Pre-launch teaser crops. Details only, never a whole garment: see the rule
  // at the top of brand-assets/teaser/build.mjs.
  placket: b64(`${REPO}/brand-assets/teaser/src/placket-ivory.jpg`),
  cuff: b64(`${REPO}/brand-assets/teaser/src/cuff-burgundy.jpg`),
  fold: b64(`${REPO}/brand-assets/teaser/src/fold-navy.jpg`),
  // Craft macro set, generated 2026-09-13. See brand-assets/craft/gen.mjs for
  // what may and may not be claimed about these.
  scissors: b64(`${REPO}/brand-assets/craft/src/scissors.jpg`),
  chalk: b64(`${REPO}/brand-assets/craft/src/chalk.jpg`),
  tape: b64(`${REPO}/brand-assets/craft/src/tape.jpg`),
  needle: b64(`${REPO}/brand-assets/craft/src/needle.jpg`),
  machine: b64(`${REPO}/brand-assets/craft/src/machine.jpg`),
  bolt: b64(`${REPO}/brand-assets/craft/src/bolt.jpg`),
  // The approved waitlist-page photo: real hands pinning linen, shears and
  // chalk on the bench. Replaced the craft scissors shot on 2026-10-10, whose
  // blades floated over the cloth with no hand on them (founder: "unreal").
  tailorHands: b64(`${REPO}/website/public/marketing/pre-launch/tailor-hands.jpg`),
};

// Same type system as the carousels. Anything that diverges here reads as a
// different brand three posts later.
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Italiana&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#1a1a1a}
.f{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.d{font-family:"Cormorant Garamond",Georgia,serif;font-weight:300;letter-spacing:-.012em}
.w{font-family:"Italiana",Georgia,serif;letter-spacing:.138em}
.ui{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-weight:300}
.eyebrow{font-family:-apple-system,sans-serif;font-weight:300;letter-spacing:.26em;font-size:34px}
.rule{width:72px;height:1px;background:#9c8445}
.pad{position:absolute;inset:0;display:flex;flex-direction:column;padding:120px 92px}
.mark{position:absolute;left:92px;top:96px;width:200px;height:auto;opacity:.92}
.markd{color:rgba(26,26,26,.7)}
img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.veil{position:absolute;inset:0}
`;

/** One screen of the reel. `t` is 0..1 through the beat, for the photo scale. */
function frameHtml(beat, t, step) {
  const inner = beat.render(t, step);
  return `<!doctype html><meta charset="utf-8"><style>${CSS}</style><div class="f">${inner}</div>`;
}

// One Chrome for the whole reel, driven over the DevTools protocol. It used to
// be one `chrome --screenshot` launch per drawing, re-fetching Google Fonts
// each time: ~12s a frame, so photo beats were drawn only every 3rd frame and
// a bigger move stuttered (founder, 2026-10-11: "not smooth at all"). Now
// every frame is its own drawing and a reel renders in a few minutes.
async function openChrome() {
  const port = 9300 + Math.floor(Math.random() * 500);
  // Own profile: without it headless Chrome shares the founder's open
  // Chrome profile and exits 2 on its lock (2026-10-10, mid-render).
  const proc = spawn(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars",
    `--user-data-dir=${TMP}/chrome-profile`, `--remote-debugging-port=${port}`,
    `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 100 && !tabs; i++) {
    tabs = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).catch(() => null);
    if (!tabs) await new Promise((r) => setTimeout(r, 100));
  }
  const page = tabs?.find((t) => t.type === "page");
  if (!page) { proc.kill(); throw new Error("headless chrome did not come up"); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    msg.error ? p.j(new Error(JSON.stringify(msg.error))) : p.r(msg.result);
  };
  const send = (method, params = {}) => new Promise((r, j) => {
    pending.set(++id, { r, j });
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  return { send, close: () => { ws.close(); proc.kill(); } };
}

async function renderFrames(beats, name) {
  fs.mkdirSync(TMP, { recursive: true });
  for (const f of fs.readdirSync(TMP)) if (f.startsWith(`${name}-`)) fs.unlinkSync(`${TMP}/${f}`);
  const chrome = await openChrome();
  const seq = [];
  let n = 0;
  try {
    for (const beat of beats) {
      // A beat is drawn once per build step, then each drawing is held for
      // its share of the beat's frames. Photo beats declare `motion` and get
      // a drawing on every frame, so a move is smooth at any size.
      const steps = beat.motion ? beat.frames : (beat.build ?? 1);
      for (let s = 0; s < steps; s++) {
        const t = steps === 1 ? 1 : s / (steps - 1);
        const file = `${TMP}/${name}-${String(n++).padStart(4, "0")}.png`;
        fs.writeFileSync(`${TMP}/f.html`, frameHtml(beat, t, s));
        await chrome.send("Page.navigate", { url: `file://${TMP}/f.html?${n}` });
        // Wait for the fonts and every image, or a frame lands in Georgia.
        const ready = `new Promise(r=>{const go=()=>Promise.all([document.fonts.ready,
          ...[...document.images].map(i=>i.decode().catch(()=>{}))]).then(()=>r(document.fonts.check('300 40px "Cormorant Garamond"')));
          document.readyState==='complete'?go():addEventListener('load',go)})`;
        let ok = false;
        for (let i = 0; i < 50 && !ok; i++) {
          ok = (await chrome.send("Runtime.evaluate", { expression: ready, awaitPromise: true, returnByValue: true }).catch(() => null))?.result?.value;
          if (!ok) await new Promise((r) => setTimeout(r, 100));
        }
        if (!ok) throw new Error(`fonts never loaded at frame ${n}`);
        const { data } = await chrome.send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(file, Buffer.from(data, "base64"));
        const hold = Math.round(beat.frames / steps);
        for (let i = 0; i < hold; i++) seq.push(file);
      }
    }
  } finally {
    chrome.close();
  }
  return seq;
}

export async function buildReel(name, beats, caption) {
  lint(caption, `${name} caption`);
  for (const b of beats) if (b.words) lint(b.words, `${name} beat`);
  fs.mkdirSync(OUT, { recursive: true });
  const seq = await renderFrames(beats, name);
  const out = `${OUT}/${name}.mp4`;
  execFileSync(`${import.meta.dirname}/encode`, [out, String(FPS), String(W), String(H), ...seq], { stdio: "inherit" });
  fs.writeFileSync(`${OUT}/${name}.caption.txt`, caption);
  console.log(`${name}.mp4  ${seq.length} frames = ${(seq.length / FPS).toFixed(1)}s  ${(fs.statSync(out).size / 1e6).toFixed(1)}MB`);
}
