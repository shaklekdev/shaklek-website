// Find flats that drew MORE than the ordered garment.
//
// banded-trousers straight:cropped back came back with a whole top -- sleeves
// and a peplum -- sitting above the trousers. None of gen-flat.mjs's checks can
// see this: it is achromatic, on white, symmetric, and its ink sits in the
// normal band. It is simply the wrong garment.
//
// A trouser flat alone runs waistband -> hip -> legs: width never pinches in.
// A trouser drawn under a top has shoulders, then a narrow WAIST, then the
// peplum or hem, then the legs -- so a pinch high in the drawing, with clearly
// wider ink both above and below it, means a second garment is present.
import fs from "node:fs";
import path from "node:path";
import sharp from "../../node_modules/sharp/dist/index.cjs";
import { catalog } from "../../src/data/catalog.ts";
import { renderParamsForCategory } from "../../src/data/parameterSliders.ts";
import { flatFileName } from "../../src/data/flats.ts";

const DIR = "public/catalog/flats";
const W = 400, H = 480;

async function widthProfile(file) {
  const data = await sharp(file)
    .resize(W, H, { fit: "contain", background: "#fff" })
    .greyscale()
    .raw()
    .toBuffer();
  const ink = (x, y) => data[y * W + x] < 216;
  let top = H, bot = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ink(x, y)) { if (y < top) top = y; if (y > bot) bot = y; }
  if (bot < 0) return null;
  const prof = [];
  for (let i = 0; i <= 40; i++) {
    const y = Math.min(H - 1, Math.round(top + ((bot - top) * i) / 40));
    let a = -1, b = -1;
    for (let x = 0; x < W; x++) if (ink(x, y)) { if (a < 0) a = x; b = x; }
    prof.push(a < 0 ? 0 : b - a);
  }
  return prof;
}

let flagged = 0, checked = 0;
for (const item of catalog) {
  if (item.category !== "Pants") continue;
  const params = renderParamsForCategory(item.category);
  const combos = params.reduce((a, p) => a.flatMap((x) => p.options.map((o) => [...x, o.value])), [[]])
    .map((v) => v.join(":"));
  for (const combo of combos) for (const view of ["front", "back"]) {
    const f = path.join(DIR, flatFileName(item.slug, combo, view));
    if (!fs.existsSync(f)) continue;
    checked++;
    const prof = await widthProfile(f);
    if (!prof) continue;
    // Look for a pinch in the top 45% of the drawing.
    let worst = null;
    for (let i = 3; i <= 18; i++) {
      const above = Math.max(...prof.slice(0, i));
      const below = Math.max(...prof.slice(i + 1, 24));
      if (!prof[i]) continue;
      const r = prof[i] / Math.min(above, below);
      if (above > prof[i] * 1.25 && below > prof[i] * 1.25 && (!worst || r < worst.r))
        worst = { r, i, above, below, w: prof[i] };
    }
    if (worst) {
      flagged++;
      console.log(`EXTRA GARMENT? ${item.slug} ${combo} ${view}`);
      console.log(`   waist pinch at ${(worst.i / 40 * 100).toFixed(0)}% down: width ${worst.w}px, but ${worst.above}px above and ${worst.below}px below`);
    }
  }
}
console.log(`\n${checked} trouser flats checked, ${flagged} suspected of drawing a second garment`);
process.exit(0);
