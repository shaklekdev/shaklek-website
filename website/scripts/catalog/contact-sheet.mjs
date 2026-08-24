// Build one review image from a set of flats and their source photographs.
// CLAUDE.md section 1: `open` a single sheet for the founder costs ~0 tokens,
// where reading 8 images into context costs ~16k and re-sends them every turn.
import fs from "node:fs";
import path from "node:path";
import sharp from "../../node_modules/sharp/dist/index.cjs";
import { catalog } from "../../src/data/catalog.ts";
import { renderParamsForCategory } from "../../src/data/parameterSliders.ts";
import { flatFileName } from "../../src/data/flats.ts";

const slug = process.argv[2];
const out = process.argv[3] ?? `/tmp/${slug}-flats.png`;
const item = catalog.find((c) => c.slug === slug);
if (!item) throw new Error(`no such item: ${slug}`);

const CELL = 300, PAD = 34, LABEL = 22;
const params = renderParamsForCategory(item.category);
const combos = params.reduce((a, p) => a.flatMap((x) => p.options.map((o) => [...x, o.value])), [[]])
  .map((v) => v.join(":"));
const rows = ["photo", "front", "back"];

const W = PAD + combos.length * (CELL + PAD);
const H = PAD + LABEL + rows.length * (CELL + PAD + LABEL);
const layers = [];

for (const [ci, combo] of combos.entries()) {
  const x = PAD + ci * (CELL + PAD);
  layers.push({
    input: Buffer.from(`<svg width="${CELL}" height="${LABEL}"><text x="${CELL / 2}" y="15" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle" fill="#111">${combo}</text></svg>`),
    top: PAD - 4, left: x,
  });
  for (const [ri, kind] of rows.entries()) {
    const y = PAD + LABEL + ri * (CELL + PAD + LABEL);
    let file;
    if (kind === "photo") {
      const p = item.comboImages?.Navy?.[combo]?.front ?? item.colorImages?.Navy?.front ?? item.image;
      file = p ? path.join("public", p) : null;
    } else {
      file = path.join("public/catalog/flats", flatFileName(slug, combo, kind));
    }
    if (!file || !fs.existsSync(file)) continue;
    layers.push({
      input: await sharp(file).resize(CELL, CELL, { fit: "contain", background: "#fff" }).png().toBuffer(),
      top: y, left: x,
    });
    layers.push({
      input: Buffer.from(`<svg width="${CELL}" height="${LABEL}"><text x="${CELL / 2}" y="15" font-family="Helvetica" font-size="12" text-anchor="middle" fill="#666">${kind === "photo" ? "source photo (navy)" : kind + " flat"}</text></svg>`),
      top: y + CELL + 2, left: x,
    });
  }
}

await sharp({ create: { width: W, height: H, channels: 3, background: "#fff" } })
  .composite(layers).png().toFile(out);
console.log(out);
