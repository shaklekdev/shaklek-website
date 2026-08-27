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

// title held over the first garment
const t0 = render(photoFrame({ src: OPEN_A, focus: "trouser", title: TITLE }), "op0");
// title still up, garment already changed underneath it
const t1 = render(photoFrame({ src: OPEN_B, focus: "trouser", title: TITLE }), "op1");
// same garment, title gone: dissolving t1 -> t2 is the title opening away
const t2 = render(photoFrame({ src: OPEN_B, focus: "trouser",
  note: ["Pleated trousers", "Wide, full length"], price: "AED 429" }), "op2");

// The line holds while the garment changes TWICE underneath it, so the idea
// the video is selling starts in the first second rather than after the title.
const t1b = render(photoFrame({ src: shot("pleated-trousers", "Navy", "wide:cropped"), focus: "trouser", title: TITLE }), "op1b");
f.push(...hold(t0, 0.9));
for (const fr of await dissolve(t0, t1, 10, "opx")) f.push(fr);
f.push(...hold(t1, 0.5));
for (const fr of await dissolve(t1, t1b, 9, "opxb")) f.push(fr);
f.push(...hold(t1b, 0.5));
const t2b = render(photoFrame({ src: shot("pleated-trousers", "Navy", "wide:cropped"), focus: "trouser",
  note: ["Pleated trousers", "Wide, cropped"], price: "AED 429" }), "op2b");
for (const fr of await dissolve(t1b, t2b, 9, "opy")) f.push(fr);
f.push(...hold(t2b, 0.5));
prevPng = t2b;

// Fourteen changes. Every garment changes SHAPE, not just colour.
const SEQ = [
  // trousers: width, then length, then colour
  { src: shot("pleated-trousers", "Ivory", "wide:cropped"),      label: ["Change", "the length"], focus: "trouser", d: 0.26, h: 0.72 },
  { src: shot("pleated-trousers", "Ivory", "base"),              label: ["Change", "the leg"],    focus: "trouser", d: 0.24, h: 0.68 },
  { src: shot("pleated-trousers", "Navy", "wide:full"),          label: ["Change", "the colour"], focus: "trouser", d: 0.24, h: 0.66 },
  // the shirt: sleeve, then body length, on a crop that keeps the hem in frame
  { src: shot("utility-shirt", "Ivory", "base"),                 label: ["Utility shirt", "Short sleeve"], focus: "whole", d: 0.24, h: 0.66 },
  { src: shot("utility-shirt", "Ivory", "long:normal"),          label: ["Change", "the sleeve"], focus: "whole", d: 0.22, h: 0.62 },
  { src: shot("utility-shirt", "Ivory", "long:longer"),          label: ["Change", "the length"], focus: "whole", d: 0.22, h: 0.62 },
  // cargo: width and length again, on a different silhouette
  { src: shot("cargo-trousers", "Ivory", "base"),                label: ["Cargo trousers", "Straight, full"], focus: "trouser", d: 0.20, h: 0.58 },
  { src: shot("cargo-trousers", "Ivory", "wide:full"),           label: ["Change", "the leg"],    focus: "trouser", d: 0.20, h: 0.56 },
  { src: shot("cargo-trousers", "Ivory", "straight:cropped"),    label: ["Change", "the hem"],    focus: "trouser", d: 0.18, h: 0.54 },
  // blouse and wrap: shape again, then colour
  { src: shot("structured-blouse", "Ivory", "long:normal"),      label: ["Structured blouse", "Long sleeve"], focus: "whole", d: 0.18, h: 0.52 },
  { src: shot("structured-blouse", "Ivory", "short:longer"),     label: ["Change", "both"],       focus: "whole", d: 0.16, h: 0.50 },
  { src: shot("wrap-top", "Ivory", "long:normal"),               label: ["Wrap top", "Long sleeve"], focus: "whole", d: 0.16, h: 0.48 },
  { src: shot("wrap-top", "Burgundy", "long:longer"),            label: ["Change", "everything"], focus: "whole", d: 0.16, h: 0.90 },
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
at(render(photoFrame({
  src: shot("pleated-trousers", "Burgundy", "wide:full"), focus: "trouser",
  top: "128 ways<br>to cut them.", topSub: "Eight pieces. Every one of them, drawn.",
}), "num"), 2.4);

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
