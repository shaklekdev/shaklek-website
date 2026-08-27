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
  render, encode, hold, dissolve, photoFrame, duoFrame, mosaicFrame, splitFrame,
  tenetsFrame, endFrame, shot, OUTDIR, FPS,
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
//
// Founder's notes on the last cut, all three addressed here:
//   "the text background at the bottom is hiding the pants"  -> trousers use a
//      no-zoom crop, so the hem sits well clear of the caption strip. The hem
//      is how you tell cropped from full length; hiding it removes the only
//      reason the shot exists.
//   "use pants that actually show the difference"            -> PLEATED
//      trousers. Compared side by side against the other three, its wide cut is
//      dramatically fuller than its straight one; on the others the two read as
//      almost the same trouser.
//   "you only change the colour on the others"               -> every garment
//      here changes its SHAPE. Colour is a change among many, not the only one.
//   "start with you customise, we tailor, and behind it the design changing"
//      -> the line opens the video as an overlay on top of live frames, with
//      the garment already dissolving underneath it, and then fades away.

const OPEN_A = shot("pleated-trousers", "Ivory", "base");
const OPEN_B = shot("pleated-trousers", "Ivory", "wide:full");
const TITLE = "You customise.<br>We tailor.";

// THE TITLE LEAVES FAST. Founder: it stays too long and it is not beautiful. It
// held nearly three seconds and faded over a third of one, which is a long time
// to look at a box. It holds under a second now, carries one change underneath
// it, and leaves in six frames, so it reads as a card lifted away.
const t0 = render(photoFrame({ src: OPEN_A, focus: "trouser", title: TITLE }), "op0");
const t1 = render(photoFrame({ src: OPEN_B, focus: "trouser", title: TITLE }), "op1");
const t2 = render(duoFrame({
  left:  { src: OPEN_A, a: "Straight", b: "Full length" },
  right: { src: OPEN_B, a: "Wide", b: "Full length" },
  top: "Change the leg.",
}), "op2");

f.push(...hold(t0, 0.6));
for (const fr of await dissolve(t0, t1, 8, "opx")) f.push(fr);
f.push(...hold(t1, 0.45));
for (const fr of await dissolve(t1, t2, 6, "opy")) f.push(fr);
f.push(...hold(t2, 1.6));
prevPng = t2;

// TROUSERS ARE SHOWN SIDE BY SIDE, NOT IN SEQUENCE. Founder: on the pleated
// trousers "we don't notice the difference, it feels like it's repeating
// itself". Right, and the reason is that a leg width is not a change the eye
// catches between two frames a second apart. A bare forearm is; two inches of
// hem is not. Both cuts are on screen at once now, labelled, one glance.
for (const [left, right, top, id, secs] of [
  [{ src: shot("pleated-trousers", "Ivory", "wide:full"), a: "Wide", b: "Full length" },
   { src: shot("pleated-trousers", "Ivory", "wide:cropped"), a: "Wide", b: "Cropped" },
   "Change the hem.", "d1", 1.5],
  [{ src: shot("cargo-trousers", "Ivory", "base"), a: "Straight", b: "Full length" },
   { src: shot("cargo-trousers", "Ivory", "wide:full"), a: "Wide", b: "Full length" },
   "Cargo trousers.", "d2", 1.4],
]) {
  const png = render(duoFrame({ left, right, top }), id);
  for (const fr of await dissolve(prevPng, png, 7, `${id}x`)) f.push(fr);
  f.push(...hold(png, secs));
  prevPng = png;
}

// THE SHIRTS STAY A SEQUENCE, because a sleeve appearing and a hem dropping are
// changes the eye does catch between frames. That is the same reason the
// trousers had to leave the sequence.
const SEQ = [
  { src: shot("utility-shirt", "Ivory", "base"),             label: ["Utility shirt", "Short sleeve"], focus: "whole", d: 0.22, h: 0.62 },
  { src: shot("utility-shirt", "Ivory", "long:normal"),      label: ["Change", "the sleeve"],          focus: "whole", d: 0.20, h: 0.58 },
  { src: shot("utility-shirt", "Ivory", "long:longer"),      label: ["Change", "the length"],          focus: "whole", d: 0.20, h: 0.58 },
  { src: shot("structured-blouse", "Ivory", "long:normal"),  label: ["Structured blouse", "Long sleeve"], focus: "whole", d: 0.18, h: 0.54 },
  { src: shot("structured-blouse", "Ivory", "short:longer"), label: ["Change", "both"],                focus: "whole", d: 0.16, h: 0.52 },
  { src: shot("wrap-top", "Ivory", "long:normal"),           label: ["Wrap top", "Long sleeve"],       focus: "whole", d: 0.16, h: 0.50 },
  { src: shot("wrap-top", "Ivory", "long:longer"),           label: ["Change", "the length"],          focus: "whole", d: 0.16, h: 0.70 },
];
for (const s of SEQ) {
  await change({ src: s.src, focus: s.focus, label: s.label, top: s.top,
                 dissolveSecs: s.d, holdFor: s.h, price: "From AED 389" });
}

// ------------------------------------------- the number, then the colours
//
// The strongest thing this brand can say, and it was missing entirely: how many
// there are. 8 pieces x 4 cuts x 4 colours = 128, and every one of those has
// its own image, which is why the video could be made at all. Verified against
// catalog.ts rather than typed: the count is the number of combination images
// that exist.
// Founder: "you randomly added pleated trousers in burgundy, it doesn't make
// any sense." It did not. One garment cannot illustrate a count. Twenty of the
// hundred and twenty-eight, on screen at once, is the only picture that means
// "128".
const MOSAIC = [];
for (const [slug, combos] of [
  ["utility-shirt", ["base", "long:normal", "long:longer", "short:longer"]],
  ["pleated-trousers", ["base", "wide:full", "wide:cropped", "straight:cropped"]],
  ["structured-blouse", ["long:normal", "long:longer", "short:longer"]],
  ["cargo-trousers", ["base", "wide:full", "wide:cropped"]],
  ["wrap-top", ["long:normal", "long:longer"]],
  ["oversized-shirt", ["base", "short:normal"]],
  ["wide-leg-trousers", ["base", "wide:full"]],
  ["banded-trousers", ["wide:full", "straight:cropped"]],
]) {
  const cs = ["Ivory", "Navy", "Burgundy", "White"];
  combos.forEach((c, i) => MOSAIC.push(shot(slug, cs[i % cs.length], c)));
}
at(render(mosaicFrame({
  srcs: MOSAIC.slice(0, 20), cols: 4,
  top: "128 ways<br>to cut them.", topSub: "Eight pieces. Every one of them drawn.",
}), "num"), 2.6);

// ------------------------------------------------- the colours, then the line
const rows = [
  { src: shot("utility-shirt", "Ivory", "long:longer"), label: "Ivory", dark: true },
  { src: shot("utility-shirt", "White", "long:longer"), label: "White", dark: true },
  { src: shot("utility-shirt", "Navy", "long:longer"), label: "Navy" },
  { src: shot("utility-shirt", "Burgundy", "long:longer"), label: "Burgundy" },
];
const TRAVEL = 20;
for (let i = 0; i <= TRAVEL; i++)
  f.push(render(splitFrame({ rows, p: i / TRAVEL, line: "And four colours." }), `x${String(i).padStart(2, "0")}`));
at(render(splitFrame({ rows, p: 1, line: "And four colours." }), "x99"), 2.3);

// --------------------------------------------------------------- the tenets
// Two lines, not three, and 2.2s rather than 3.2. The founder's note about
// white pages applies here too: a static card is a page, and the third tenet
// was the weakest of them.
at(render(tenetsFrame([
  { k: "Nothing on a shelf", v: "Your piece does not exist until you ask for it." },
  { k: "From AED 389", v: "One price. Every option and the tailoring included." },
]), "t1"), 2.2);
at(render(endFrame(), "t2"), 1.4);

const out = `${OUTDIR}/00-you-are-the-designer.mp4`;
encode(f, out);
fs.writeFileSync(`${OUTDIR}/00-you-are-the-designer.caption.txt`, caption + "\n");
console.log(`00-you-are-the-designer  ${(f.length / FPS).toFixed(1)}s  ${(fs.statSync(out).size / 1024).toFixed(0)}KB  ${f.length} frames  ${SEQ.length} changes`);
