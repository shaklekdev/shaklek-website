/**
 * "You are the designer" — the founder's brief, refined over three passes.
 *
 *   npx tsx scripts/social/tiktok-hero.mjs
 *
 * WHAT SHE ASKED FOR, in her words: a MIX. "Change the sleeve, change the
 * length, fix this, do that." Show that there are so many options they can
 * change, and then that we tailor it for them.
 *
 * WHAT WAS WRONG WITH THE PREVIOUS CUTS, also hers:
 *   - "too many white pages": three full-screen text cards meant the garment
 *     kept leaving the screen. Text now sits over the image on a soft wash that
 *     only covers the backdrop above the model's head, so the product is on
 *     screen for all but the last two seconds.
 *   - "not smooth": every state change was a hard cut between four
 *     near-identical garments, which reads as a stutter. Each change is now a
 *     dissolve, which reads as the garment CHANGING, and that is the whole
 *     proposition.
 *   - "not clear enough": four slow states of one shirt did not feel like
 *     choice. This runs fourteen changes across five garments and accelerates,
 *     so the FEELING is abundance rather than a list.
 *
 * ⚠️ The shirt is the Utility Shirt. catalog.ts labels its base photo
 * short:longer; the photograph is short:normal. Metadata lies, pixels do not,
 * and I sent the founder a false bug report about her live site before checking.
 */
import {
  render, encode, hold, dissolve, photoFrame, splitFrame, tenetsFrame,
  endFrame, shot, OUTDIR, FPS,
} from "./tiktok-launch.mjs";
import { lint } from "./copy-rules.mjs";
import fs from "node:fs";

const caption =
  "You are the designer. Change the sleeve, the length, the leg, the colour, and the picture changes to the cut you chose. You customise it, we tailor it to you. 100% linen, from AED 389, made after you order it and not before.";
lint(caption, "hero caption");

const f = [];
const at = (fr, secs) => f.push(...hold(fr, secs));

/**
 * One change: dissolve from the previous rendered frame into this one, then
 * hold. Dissolve and hold both shorten as the sequence runs, so the edit
 * accelerates without ever cutting hard.
 */
let prevPng = null;
let n = 0;
async function change({ src, focus = "full", label, top, price, dissolveSecs, holdFor }) {
  const id = `m${String(n++).padStart(2, "0")}`;
  const png = render(photoFrame({ src, focus, note: label, top, price }), id);
  if (prevPng) {
    const steps = Math.max(2, Math.round(dissolveSecs * FPS));
    for (const frame of await dissolve(prevPng, png, steps, `${id}x`)) f.push(frame);
  }
  f.push(...hold(png, holdFor));
  prevPng = png;
}

// ---------------------------------------------------------------- the mix
// Fourteen changes across five garments. Each one names what moved, so the
// viewer is told they can change that thing rather than left to infer it.
const SEQ = [
  // the shirt: sleeve, then body length
  { src: shot("utility-shirt", "Ivory", "base"),          label: ["Utility shirt", "Short sleeve"],  top: "You are<br>the designer", d: 0.30, h: 1.10 },
  { src: shot("utility-shirt", "Ivory", "long:normal"),   label: ["Change", "the sleeve"],           top: "You are<br>the designer", d: 0.30, h: 0.75 },
  { src: shot("utility-shirt", "Ivory", "long:longer"),   label: ["Change", "the length"],           d: 0.26, h: 0.70 },
  { src: shot("utility-shirt", "Navy", "long:longer"),    label: ["Change", "the colour"],           d: 0.26, h: 0.70 },
  // the trousers: leg width, then hem
  { src: shot("wide-leg-trousers", "Ivory", "base"),      label: ["Wide-leg trousers", "Straight"],  focus: "legs", d: 0.24, h: 0.62 },
  { src: shot("wide-leg-trousers", "Ivory", "wide:full"), label: ["Change", "the leg"],              focus: "legs", d: 0.22, h: 0.58 },
  { src: shot("wide-leg-trousers", "Ivory", "wide:cropped"), label: ["Change", "the hem"],           focus: "legs", d: 0.22, h: 0.58 },
  { src: shot("wide-leg-trousers", "Burgundy", "wide:cropped"), label: ["Change", "the colour"],     focus: "legs", d: 0.20, h: 0.54 },
  // the blouse
  { src: shot("structured-blouse", "Ivory", "long:normal"), label: ["Structured blouse", "Long sleeve"], d: 0.20, h: 0.52 },
  { src: shot("structured-blouse", "Ivory", "short:longer"), label: ["Change", "both"],              d: 0.18, h: 0.48 },
  // the wrap top
  { src: shot("wrap-top", "Ivory", "long:normal"),        label: ["Wrap top", "Long sleeve"],        d: 0.18, h: 0.46 },
  { src: shot("wrap-top", "Burgundy", "long:longer"),     label: ["Change", "everything"],           d: 0.16, h: 0.46 },
  // the cargo trousers, the fastest pair
  { src: shot("cargo-trousers", "Navy", "wide:full"),     label: ["Cargo trousers", "Wide"],         focus: "legs", d: 0.16, h: 0.44 },
  { src: shot("cargo-trousers", "White", "straight:cropped"), label: ["Change", "the cut"],          focus: "legs", d: 0.14, h: 0.80 },
];
for (const s of SEQ) {
  await change({ src: s.src, focus: s.focus, label: s.label, top: s.top,
                 dissolveSecs: s.d, holdFor: s.h, price: "From AED 389" });
}

// ------------------------------------------------- the colours, then the line
const rows = [
  { src: shot("utility-shirt", "Ivory", "long:longer"), label: "Ivory", dark: true },
  { src: shot("utility-shirt", "White", "long:longer"), label: "White", dark: true },
  { src: shot("utility-shirt", "Navy", "long:longer"), label: "Navy" },
  { src: shot("utility-shirt", "Burgundy", "long:longer"), label: "Burgundy" },
];
const TRAVEL = 20;
for (let i = 0; i <= TRAVEL; i++)
  f.push(render(splitFrame({ rows, p: i / TRAVEL, line: "You customise.<br>We tailor." }), `x${String(i).padStart(2, "0")}`));
at(render(splitFrame({ rows, p: 1, line: "You customise.<br>We tailor." }), "x99"), 2.3);

// --------------------------------------------------------------- the tenets
at(render(tenetsFrame([
  { k: "From AED 389", v: "One price per piece type. Fabric and every option included." },
  { k: "Nothing on a shelf", v: "Your piece does not exist until you ask for it. No overproduction, no waste." },
  { k: "Natural fibre only", v: "100% linen against your skin. Breathable, never synthetic." },
]), "t1"), 3.2);
at(render(endFrame(), "t2"), 1.4);

const out = `${OUTDIR}/00-you-are-the-designer.mp4`;
encode(f, out);
fs.writeFileSync(`${OUTDIR}/00-you-are-the-designer.caption.txt`, caption + "\n");
console.log(`00-you-are-the-designer  ${(f.length / FPS).toFixed(1)}s  ${(fs.statSync(out).size / 1024).toFixed(0)}KB  ${f.length} frames  ${SEQ.length} changes`);
