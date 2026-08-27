/**
 * "You are the designer" — the founder's own shot list, 2026-08-27.
 *
 *   npx tsx scripts/social/tiktok-hero.mjs
 *
 * Her brief, in her order:
 *   1. the SLEEVE change, from the FRONT, close enough to actually see it
 *   2. turn the model to the BACK and pull out, so the LENGTH is visible
 *   3. the colours, as four horizontal bands arriving from alternating sides
 *      and meeting in the centre, with YOU CUSTOMISE, WE TAILOR over them
 *   4. the three tenets from the website
 *
 * ⚠️ THE SHIRT IS THE UTILITY SHIRT AND I ONCE TALKED MYSELF OUT OF IT.
 * catalog.ts records defaultChanges as { sleeve_length: "short",
 * garment_length: "longer" }, so I read the base photo as the short-sleeve
 * LONGER cut, decided short-sleeve NORMAL had never been generated, moved the
 * video to another shirt, and then told the founder her live site was serving
 * customers the wrong garment. She checked and it was not. The metadata is
 * mislabelled; the photograph shows SHORT SLEEVE, NORMAL LENGTH. All four cuts
 * exist. Metadata lies, pixels do not.
 */
import {
  render, encode, hold, photoFrame, sayFrame, splitFrame, tenetsFrame,
  endFrame, shot, shotBack, OUTDIR, FPS,
} from "./tiktok-launch.mjs";
import { lint } from "./copy-rules.mjs";
import fs from "node:fs";

const ITEM = "utility-shirt", COLOUR = "Ivory";
const F = (combo) => shot(ITEM, COLOUR, combo);
const B = (combo) => shotBack(ITEM, COLOUR, combo);

const caption =
  "You are the designer. Change the sleeve, change the length, change the colour, and the picture changes to the cut you chose. You customise it, we tailor it to you. 100% linen, AED 389, made after you order it.";
lint(caption, "hero caption");

const f = [];
const at = (fr, secs) => f.push(...hold(fr, secs));

// 1. the claim
at(render(sayFrame({ big: "You are<br>the designer" }), "h01"), 1.9);

// 2. THE SLEEVE, FROM THE FRONT, cropped to the arms so the change is the
//    subject. Length is deliberately not mentioned here: one idea at a time.
const sleeve = (combo, label, id) =>
  render(photoFrame({ src: F(combo), focus: "arms", note: ["Sleeve", label] }), id);
at(render(sayFrame({ big: "Change<br>the sleeve." }), "h02"), 1.4);
at(sleeve("base", "Short", "h03"), 1.3);
at(sleeve("long:normal", "Long", "h04"), 1.3);
at(sleeve("base", "Short", "h05"), 0.9);
at(sleeve("long:normal", "Long", "h06"), 0.9);

// 3. TURN AROUND AND PULL OUT. The back view at full length, because the hem is
//    the subject now and a cropped frame would show two identical pictures.
at(render(sayFrame({ big: "Now the length." }), "h07"), 1.4);
const back = (combo, label, id) =>
  render(photoFrame({ src: B(combo), focus: "whole", note: ["Length", label] }), id);
at(back("long:normal", "Normal", "h08"), 1.5);
at(back("long:longer", "Longer", "h09"), 1.5);
at(back("long:normal", "Normal", "h10"), 1.0);
at(back("long:longer", "Longer", "h11"), 1.2);

// 4. THE COLOURS, sliding in from alternating sides to meet in the centre, then
//    the line laid over them. Animated, so it needs real intermediate frames
//    rather than a hold: 22 frames of travel is about three quarters of a
//    second, which reads as a move and not as a cut.
const rows = [
  { src: F("long:longer"), label: "Ivory", dark: true },
  { src: shot(ITEM, "White", "long:longer"), label: "White", dark: true },
  { src: shot(ITEM, "Navy", "long:longer"), label: "Navy" },
  { src: shot(ITEM, "Burgundy", "long:longer"), label: "Burgundy" },
];
const TRAVEL = 22;
for (let i = 0; i <= TRAVEL; i++) {
  f.push(render(splitFrame({ rows, p: i / TRAVEL, line: "You customise.<br>We tailor." }), `hs${String(i).padStart(2, "0")}`));
}
at(render(splitFrame({ rows, p: 1, line: "You customise.<br>We tailor." }), "hs99"), 2.4);

// 5. the three reasons, straight from the website
at(render(tenetsFrame([
  { k: "From AED 389", v: "One price per piece type. Fabric and every option included." },
  { k: "Nothing on a shelf", v: "Your piece does not exist until you ask for it. No overproduction, no waste." },
  { k: "Natural fibre only", v: "100% linen against your skin. Breathable, never synthetic." },
]), "h12"), 3.4);

at(render(endFrame(), "h13"), 1.5);

const out = `${OUTDIR}/00-you-are-the-designer.mp4`;
encode(f, out);
fs.writeFileSync(`${OUTDIR}/00-you-are-the-designer.caption.txt`, caption + "\n");
console.log(`00-you-are-the-designer  ${(f.length / FPS).toFixed(1)}s  ${(fs.statSync(out).size / 1024).toFixed(0)}KB  ${f.length} frames`);
