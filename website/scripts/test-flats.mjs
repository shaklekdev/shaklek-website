// Coverage and sanity for the technical flats.
//
// Every combination a customer can order must have a flat, front and back.
// A missing one is not a crash -- the tech pack prints a warning and falls back
// to the photograph -- but it is a silently worse document, so it is checked.
//
// Run: npx tsx scripts/test-flats.mjs
import fs from "node:fs";
import path from "node:path";
import { catalog } from "../src/data/catalog.ts";
import { renderParamsForCategory } from "../src/data/parameterSliders.ts";
import { flatFileName } from "../src/data/flats.ts";
import { measureFlat, judgeFlat } from "./catalog/gen-flat.mjs";

const DIR = "public/catalog/flats";
let missing = 0, checked = 0;
const inks = [];

for (const item of catalog) {
  const params = renderParamsForCategory(item.category);
  if (!params.length) continue;
  const combos = params
    .reduce((a, p) => a.flatMap((x) => p.options.map((o) => [...x, o.value])), [[]])
    .map((v) => v.join(":"));
  for (const combo of combos) {
    for (const view of ["front", "back"]) {
      const f = path.join(DIR, flatFileName(item.slug, combo, view));
      if (!fs.existsSync(f)) {
        console.error(`MISSING flat: ${item.slug} ${combo} ${view}`);
        missing++;
        continue;
      }
      checked++;
      const m = await measureFlat(f);
      // Re-judge on disk. The saved file is greyscale by then, so the colour
      // checks are trivially satisfied and prove nothing here -- what this
      // catches is a flat that was replaced or corrupted after acceptance.
      const fails = judgeFlat(m, { symmetric: !(view === "front" && item.slug === "wrap-top") });
      if (fails.length) console.error(`DEGRADED ${item.slug} ${combo} ${view}: ${fails.join("; ")}`);
      inks.push({ id: `${item.slug} ${combo} ${view}`, ink: m.ink });
    }
  }
}

// Ink coverage should sit in a tight band across the set. A flat carrying grey
// shading rather than line art passes every other check -- grey has no
// saturation -- so the one signal that separates it is that it is far darker
// than its peers. This flags, it does not fail: a genuinely detailed garment
// legitimately carries more line work than a plain shirt back.
inks.sort((a, b) => a.ink - b.ink);
const median = inks.length ? inks[Math.floor(inks.length / 2)].ink : 0;
const outliers = inks.filter((x) => x.ink > median * 3);

console.log(`\n${checked} flats present, ${missing} missing`);
if (inks.length) {
  console.log(`ink coverage: median ${(median * 100).toFixed(1)}%, range ${(inks[0].ink * 100).toFixed(1)}%–${(inks[inks.length - 1].ink * 100).toFixed(1)}%`);
}
if (outliers.length) {
  console.log(`\n${outliers.length} unusually dark — LOOK AT THESE, they may be shaded rather than line art:`);
  for (const o of outliers) console.log(`  ${(o.ink * 100).toFixed(1)}%  ${o.id}`);
}
process.exit(missing ? 1 : 0);
