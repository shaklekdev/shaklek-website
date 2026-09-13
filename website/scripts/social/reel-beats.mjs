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
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { lint } from "./copy-rules.mjs";

const REPO = fileURLToPath(new URL("../../../", import.meta.url)).replace(/\/$/, "");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/shaklek-reel";
const OUT = `${REPO}/brand-assets/reels`;
const W = 1080, H = 1920, FPS = 30;

const b64 = (p) => `data:image/jpeg;base64,${fs.readFileSync(p).toString("base64")}`;
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
.mark{position:absolute;left:92px;top:96px;font-family:"Italiana",Georgia,serif;
  letter-spacing:.138em;font-size:38px;color:rgba(250,250,250,.86)}
.markd{color:rgba(26,26,26,.7)}
img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.veil{position:absolute;inset:0}
`;

/** One screen of the reel. `t` is 0..1 through the beat, for the photo scale. */
function frameHtml(beat, t, step) {
  const inner = beat.render(t, step);
  return `<!doctype html><meta charset="utf-8"><style>${CSS}</style><div class="f">${inner}</div>`;
}

function renderFrames(beats, name) {
  fs.mkdirSync(TMP, { recursive: true });
  const seq = [];
  let n = 0;
  for (const beat of beats) {
    // A beat is drawn once per build step, then each drawing is held for its
    // share of the beat's frames. Photo beats declare `motion` and get one
    // unique drawing every other frame instead, which is what makes the slow
    // push read as motion rather than as a jump.
    const steps = beat.motion ? Math.ceil(beat.frames / 3) : (beat.build ?? 1);
    for (let s = 0; s < steps; s++) {
      const t = steps === 1 ? 1 : s / (steps - 1);
      const file = `${TMP}/${name}-${String(n++).padStart(4, "0")}.png`;
      fs.writeFileSync(`${TMP}/f.html`, frameHtml(beat, t, s));
      execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars",
        "--virtual-time-budget=2500", `--window-size=${W},${H}`,
        `--screenshot=${file}`, `file://${TMP}/f.html`], { stdio: "ignore" });
      if (!fs.existsSync(file)) throw new Error(`chrome produced nothing at beat ${n}`);
      const hold = Math.round(beat.frames / steps);
      for (let i = 0; i < hold; i++) seq.push(file);
    }
  }
  return seq;
}

export function buildReel(name, beats, caption) {
  lint(caption, `${name} caption`);
  for (const b of beats) if (b.words) lint(b.words, `${name} beat`);
  fs.mkdirSync(OUT, { recursive: true });
  const seq = renderFrames(beats, name);
  const out = `${OUT}/${name}.mp4`;
  execFileSync(`${import.meta.dirname}/encode`, [out, String(FPS), String(W), String(H), ...seq], { stdio: "inherit" });
  fs.writeFileSync(`${OUT}/${name}.caption.txt`, caption);
  console.log(`${name}.mp4  ${seq.length} frames = ${(seq.length / FPS).toFixed(1)}s  ${(fs.statSync(out).size / 1e6).toFixed(1)}MB`);
}
