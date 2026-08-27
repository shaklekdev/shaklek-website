/**
 * "You are the designer" — the founder's own brief, 2026-08-27.
 *
 *   npx tsx scripts/social/tiktok-hero.mjs
 *
 * Her note on the first attempt: it did not say what the added value is, or why
 * this brand and not another. It showed four trousers and left the viewer to
 * work out why that mattered. It also looked, in her words, like a kid made it.
 *
 * So this one states the claim in words, proves it with the four cuts, and
 * names the trade at the end: YOU CUSTOMISE, WE TAILOR IT FOR YOU. The
 * typography is Italiana and Cormorant, the brand's own faces, set large. There
 * are no pills, no badges and no icons anywhere in it.
 *
 * The four states are the founder's shot list exactly: short sleeve at normal
 * length, long sleeve at normal length, short sleeve at longer length, long
 * sleeve at longer length. One garment, one colour, one crop, so the ONLY thing
 * that moves between frames is the thing being sold.
 */
import { render, encode, hold, photoFrame, sayFrame, gridFrame, endFrame, shot, OUTDIR } from "./tiktok-launch.mjs";
import { lint } from "./copy-rules.mjs";
import fs from "node:fs";

// oversized-shirt, NOT utility-shirt. Utility's base photo IS its short-sleeve
// longer-length cut (see defaultChanges in catalog.ts), so two of the four
// states were the same combination shown twice, with different captions. The
// first render of this video shipped that: frames 4 and 5 were the same shirt
// under two different labels. Oversized is the only shirt whose base photo is
// the category default, which means base + its three combos are the complete
// 2x2 and every frame is a genuinely different garment.
const ITEM = "oversized-shirt", COLOUR = "Ivory";
const S = (combo) => shot(ITEM, COLOUR, combo);

// The whole video is the claim that these four are different. If two of them
// resolve to the same file, the video disproves itself, so it refuses to build.
const FOUR = [
  ["short:normal", ["Short sleeve", "Normal length"]],
  ["base",         ["Long sleeve", "Normal length"]],
  ["short:longer", ["Short sleeve", "Longer length"]],
  ["long:longer",  ["Long sleeve", "Longer length"]],
];
{
  const seen = new Map();
  for (const [combo] of FOUR) {
    const src = S(combo).slice(-60);
    if (seen.has(src)) throw new Error(`"${combo}" and "${seen.get(src)}" are the same image: the four cuts are not four cuts`);
    seen.set(src, combo);
  }
}

const caption =
  "You are the designer. Same shirt, four different cuts: pick the sleeve, pick the length, pick the colour. You customise it, we tailor it to you, and one tailor makes that piece after you order it. AED 389.";
lint(caption, "hero caption");

const f = [];

// 1. The claim, in words, before anything else. Three seconds decides the view.
f.push(...hold(render(sayFrame({ big: "You are<br>the designer" }), "h1"), 2.0));

// 2-5. The proof. One crop, one colour, only the cut changing.
const state = (combo, lines, id) =>
  render(photoFrame({
    src: S(combo), focus: "full",
    note: lines, price: "AED 389",
  }), id);
// The founder's order: short sleeve normal, long sleeve normal, then the same
// two again at the longer length, so the sleeve changes first and the hem
// changes second. One variable moves at a time and the eye can follow it.
FOUR.forEach(([combo, lines], i) => {
  f.push(...hold(state(combo, lines, `h${i + 2}`), 1.45));
});

// 6. All four at once, so the choice is legible as a choice.
f.push(...hold(render(gridFrame({
  cells: FOUR.map(([combo, lines]) => ({
    src: S(combo),
    label: `${lines[0].split(" ")[0]}, ${lines[1].split(" ")[0].toLowerCase()}`,
    focus: "full",
  })),
}), "h6"), 2.4));

// 7. The trade, named.
f.push(...hold(render(sayFrame({
  big: "You customise.<br>We tailor.",
  under: "Pick your size, or send four measurements and it is cut to those. The same price either way.",
}), "h7"), 2.6));

f.push(...hold(render(endFrame(), "h8"), 1.5));

const out = `${OUTDIR}/00-you-are-the-designer.mp4`;
encode(f, out);
fs.writeFileSync(`${OUTDIR}/00-you-are-the-designer.caption.txt`, caption + "\n");
console.log(`00-you-are-the-designer  ${(f.length / 30).toFixed(1)}s  ${(fs.statSync(out).size / 1024).toFixed(0)}KB`);
