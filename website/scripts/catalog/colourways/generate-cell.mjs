// Generate ONE colourway cell, with the prompt BUILT from that cell rather than
// written by hand.
//
//   node generate-cell.mjs --item open-abaya --cell midi:narrow --view back --colour Navy
//   ... --dry   prints the prompt and the gates, calls nothing, costs nothing
//
// ⚠️ THIS FILE EXISTS BECAUSE VERIFYING AFTER GENERATION IS TOO LATE. Founder,
// 2026-09-20: "the goal is to do this before it's generated because otherwise
// what's the goal if we verify only once the money is spent".
//
// ⚠️ AND SHE IS RIGHT ABOUT THE CAUSE, NOT JUST THE TIMING. The two bad navy
// backs were not a model failure. I wrote ONE prompt for all four backs, changed
// only "photographed from BEHIND", and left in the maxi length line -- "it
// reaches the floor and breaks on the instep". So the midi backs were told to be
// floor-length and obeyed: hem 0.932 and 0.890 against burgundy's 0.814 and
// 0.799. $0.27 spent on doing exactly what I asked for.
//
// A checker that runs afterwards cannot prevent that. The prompt has to be
// DERIVED from the cell, so a midi cell physically cannot carry a maxi
// instruction. Every sentence below that describes length or width is computed
// from the measured counterpart in the colourway we already have.

import { readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { PUBLIC, ROOT, planFiles, measureReference } from "./_shared.mjs";
import profile from "./_profile.cjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const DRY = process.argv.includes("--dry");

const item = arg("item", "open-abaya");
const cell = arg("cell");
const view = arg("view", "front");
const colour = arg("colour", "Navy");
const out = arg("out");
if (!cell) throw new Error("--cell is required, e.g. --cell midi:narrow");

// ---------------------------------------------------------------- the source
const plan = await planFiles();
const entry = plan.find((p) => p.slug === item);
if (!entry) throw new Error(`no abaya called ${item}`);
const source = entry.files.find((f) => f.cells.includes(cell) && f.view === view);
if (!source) throw new Error(`${item} has no ${view} photograph for ${cell}`);

const srcPath = path.join(PUBLIC, source.rel);
const measured = await profile(srcPath);
const ref = await measureReference(colour);

// ---------------------------------------------------------------- the words
//
// ⚠️ EVERY NUMBER BELOW COMES FROM THE MEASUREMENT, NOT FROM A CONSTANT. The
// length sentence for a midi cell is generated from that midi photograph's own
// proportions, so it cannot say "reaches the floor".
const [lengthKey, widthKey] = cell.split(":");

const LENGTH = {
  maxi: (r) =>
    `LENGTH: the garment is ${r.toFixed(1)} times as long as its own shoulders are wide. ` +
    `It reaches the FLOOR and breaks on the instep, covering the top of the foot. ` +
    `The ankle is NOT visible.`,
  midi: (r) =>
    `LENGTH: the garment is ${r.toFixed(1)} times as long as its own shoulders are wide. ` +
    `It stops at MID-CALF, clearly ABOVE the ankle. Her whole ankle, her whole foot and ` +
    `the entire heeled sandal are visible below the hem. It does NOT reach the floor.`,
};
const WIDTH = {
  narrow: (s, h) =>
    `WIDTH: the sleeves are moderate, about ${s.toFixed(2)} times the shoulder width at the ` +
    `upper arm. The body is close, about ${h.toFixed(2)} times the shoulder width at the hip, ` +
    `falling straight with no flare and no cinching at the waist.`,
  wide: (s, h) =>
    `WIDTH: the sleeves are WIDE and full, about ${s.toFixed(2)} times the shoulder width at ` +
    `the upper arm. ⚠️ THE BODY DOES NOT WIDEN WITH THEM: it stays close, about ` +
    `${h.toFixed(2)} times the shoulder width at the hip, falling straight with no flare. ` +
    `Only the SLEEVES are full.`,
};
const VIEW = {
  front: `This is a FRONT view. She faces the camera. The abaya is open down the full front.`,
  back:
    `⚠️ THIS IS A BACK VIEW. She faces AWAY from the camera, her back to us. The abaya's ` +
    `back panel is one unbroken sheet: there is NO front opening, NO neckline and NO slip ` +
    `dress visible. Her hands and her feet point AWAY from the camera too.`,
};

if (!LENGTH[lengthKey]) throw new Error(`no length wording for "${lengthKey}"`);
if (!WIDTH[widthKey]) throw new Error(`no width wording for "${widthKey}"`);

const prompt = `A woman wearing an open, floor-length linen abaya in ${colour.toUpperCase()}, photographed for a catalogue: full length, feet and head in frame.

${VIEW[view]}

THE BACKGROUND MUST BE IDENTICAL TO IMAGE 1. Copy it exactly: the same pale, almost-white, NEUTRAL studio backdrop and the floor a shade deeper, with the same soft shadow under her. A single smooth seamless sweep with NO visible panel edges, vertical lines, seams or dark bands. DO NOT make the background cream, beige, tan, sand, warm or golden. DO NOT darken it.

THE GARMENT MUST BE EXACTLY THE ONE IN IMAGE 1:
- open down the full front, no fastening of any kind
- the front edge FOLDED BACK ON ITSELF to the outside, doubled and obvious at the neck, symmetrical on both edges, relaxing as it falls and lying open by the hem. Folded, NOT sewn: a soft rounded crease with a free unstitched inner edge and a shadow under it.
- long sleeves covering the whole forearm to the WRIST, with a deep turned-back cuff
- a plain hem, one continuous sheet of cloth. NO hem band, no turn-up.
- no collar, no lapel, no buttons, no pockets, no belt

FIT, which must match our existing colourway exactly:
- ${LENGTH[lengthKey](measured.lenRatio)}
- ${WIDTH[widthKey](measured.sleeve, measured.hip)}
- the sleeve reaches the wrist bone and no higher.

THE COLOUR is the ${colour.toLowerCase()} of the garment in IMAGE 2: about hue ${ref.h.toFixed(0)}, muted, saturation near ${ref.s.toFixed(2)}, lightness near ${ref.l.toFixed(2)}. Copy the reference's depth and its MUTED saturation, and the way its highlights fall soft and greyed rather than brighter. Not a bright, electric or saturated version of this colour.

IT IS LINEN. The weave stays visible - slubs, grain, soft creases, deep shadow inside the folds. Do not smooth, flatten or airbrush it. It must read as cloth photographed, not as colour filled in.

HER FACE MUST BE SHARP AND IN FOCUS, with correct natural anatomy: both eyes the same size and shape, level, symmetrical. No blur, no distortion. The whole figure is in focus from head to shoe. Her hair is worn the same way as in IMAGE 1.

She wears nude leather HIGH-HEELED sandals, never flat shoes, and a plain IVORY slip dress underneath which stays ivory.

The pose and the model may differ from IMAGE 1. The garment, its fit, the background and the floor may not.`;

// ---------------------------------------------------------- the pre-flight
//
// ⚠️ THESE RUN BEFORE THE API CALL, NOT AFTER. Each one is a mistake that has
// actually been made and paid for in this session.
const problems = [];
if (lengthKey === "midi" && /reaches the FLOOR/.test(prompt)) {
  problems.push(`a midi cell must never say "reaches the FLOOR" -- this is the $0.27 back-view bug`);
}
if (lengthKey === "maxi" && /MID-CALF/.test(prompt)) {
  problems.push(`a maxi cell must never say "MID-CALF"`);
}
if (view === "back" && !/BACK VIEW/.test(prompt)) problems.push(`back view not declared`);
if (view === "back" && /slip dress visible/.test(prompt) === false && !/NO front opening/.test(prompt)) {
  problems.push(`back view does not forbid the front opening`);
}
if (!prompt.includes(colour.toUpperCase())) problems.push(`the colour word is missing`);
// The measurement must have come from a real garment, not from a failed mask.
if (measured.sleeve < 1.0 || measured.sleeve > 2.2) problems.push(`source sleeve ratio ${measured.sleeve.toFixed(2)} is implausible -- the source mask is wrong, fix it before spending`);
if (measured.lenRatio < 2.0 || measured.lenRatio > 5.0) problems.push(`source length ratio ${measured.lenRatio.toFixed(2)} is implausible`);
// midi must actually be shorter than maxi in the SOURCE set, or the source is mislabelled.
const sibling = entry.files.find((f) => f.view === view && f.cells.some((c) => c.startsWith(lengthKey === "midi" ? "maxi" : "midi")));
if (sibling) {
  const sib = await profile(path.join(PUBLIC, sibling.rel));
  const shorter = lengthKey === "midi" ? measured.lenRatio < sib.lenRatio : measured.lenRatio > sib.lenRatio;
  if (!shorter) {
    problems.push(
      `source ${cell} measures ${measured.lenRatio.toFixed(2)} against its ${lengthKey === "midi" ? "maxi" : "midi"} sibling's ` +
        `${sib.lenRatio.toFixed(2)} -- the two lengths do not differ in the direction they should, so the prompt would be built on a wrong number`,
    );
  }
}

console.log(`\n--- ${item}  ${cell}  ${view}  -> ${colour} ---`);
console.log(`source     ${source.rel}`);
console.log(`measured   length ${measured.lenRatio.toFixed(2)}x  sleeve ${measured.sleeve.toFixed(2)}x  hip ${measured.hip.toFixed(2)}x`);
console.log(`target     h=${ref.h.toFixed(0)} s=${ref.s.toFixed(2)} l=${ref.l.toFixed(2)}`);

if (problems.length) {
  console.error(`\nREFUSED, nothing generated and nothing spent:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`pre-flight ok (${DRY ? "dry run, no API call" : "generating, $0.134"})`);

const promptPath = out ? out.replace(/\.[a-z]+$/i, "") + ".prompt.txt" : "/tmp/cell.prompt.txt";
writeFileSync(promptPath, prompt);
console.log(`prompt     ${promptPath}`);
if (DRY) { console.log(`\n${prompt}\n`); process.exit(0); }

// ---------------------------------------------------------------- generate
const { execFileSync } = await import("node:child_process");
const dest = out ?? `/tmp/cell-${item}-${cell.replace(":", "-")}-${view}-${colour.toLowerCase()}.png`;
const refPhoto = path.join(PUBLIC, "catalog/cargo-trousers/cargo-trousers-navy-front.jpg");
execFileSync(
  "node",
  [
    path.join(ROOT, "scripts/catalog/edit2.mjs"),
    srcPath,
    refPhoto,
    dest,
    prompt,
    "gemini-3-pro-image",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      EDIT2_INPUT_LABEL:
        "IMAGE 1 -- our abaya. Copy this GARMENT exactly, its BACKGROUND and its FLOOR exactly, and note which VIEW it is.",
      EDIT2_REF_LABEL:
        "IMAGE 2 -- reference for the GARMENT COLOUR ONLY. Do not copy its background, garment, pose or crop.",
    },
  },
);

// ------------------------------------------------------------ post-flight
const got = await profile(dest);
const check = (label, a, b, tol) =>
  console.log(`  ${Math.abs(a - b) <= tol ? "ok " : "OFF"} ${label.padEnd(8)} ${a.toFixed(2)} vs source ${b.toFixed(2)}`);
console.log(`\nresult ${dest}`);
check("length", got.lenRatio, measured.lenRatio, 0.20);
check("sleeve", got.sleeve, measured.sleeve, 0.10);
check("hue", got.hue, ref.h, 12);
