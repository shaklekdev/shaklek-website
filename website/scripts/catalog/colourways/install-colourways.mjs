// Step 4: check what Photoshop produced, install it, and print the catalog.ts
// entries to add.
//
// ⚠️ IT REFUSES BEFORE IT INSTALLS, and every check here exists because the
// corresponding mistake has actually shipped on this project:
//
//   - wrong size            -- every catalogue image is 843x1264 / 2:3
//   - a colour that is not  -- "verify by HUE, never by pixel-diff": navy and
//     the colour it claims      burgundy barely differ in greyscale, so a diff
//                               check calls a failed recolour a success
//   - skin caught in the    -- the failure that killed the automated attempt,
//     mask                      "hands are still blue claude"
//   - a partial colourway   -- a colour missing one cell is worse than a colour
//                               missing entirely: the customiser silently falls
//                               back to another silhouette on one slider
//                               position and nobody notices
//
// It installs nothing unless EVERY file for a colourway passes, because a
// half-installed colourway is exactly the state that produces that last bug.

import { readdir, readFile, copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import { PUBLIC, COLORS, planFiles, renameForColour } from "./_shared.mjs";

const WORK = process.env.SHAKLEK_MASK_DIR ?? path.join(os.homedir(), "Shaklek-colourways");
const OUT = path.join(WORK, "out");
const APPLY = process.argv.includes("--apply");

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2, d = mx - mn;
  if (d) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? ((b - r) / d + 2) : ((r - g) / d + 4);
    h *= 60;
  }
  return [h, s, l];
}
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** Mean hue/lightness of the masked garment only, which is the only region any
 *  of this was supposed to change. */
async function measureGarment(jpegPath, maskPath) {
  const { data, info } = await sharp(jpegPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const mask = await sharp(maskPath).resize(info.width, info.height).greyscale().raw().toBuffer();
  let x = 0, y = 0, lSum = 0, sSum = 0, n = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const [hu, s, l] = rgb2hsl(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    // Mean of an angle is a vector mean, not an arithmetic one: burgundy
    // straddles 0 and averaging 358 with 2 arithmetically gives 180, cyan.
    x += Math.cos((hu * Math.PI) / 180);
    y += Math.sin((hu * Math.PI) / 180);
    lSum += l; sSum += s; n++;
  }
  if (!n) return null;
  let h = (Math.atan2(y / n, x / n) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { h, s: sSum / n, l: lSum / n, n };
}

const plan = await planFiles();
const present = existsSync(OUT) ? new Set(await readdir(OUT)) : new Set();
const problems = [];
const ready = [];

for (const item of plan) {
  for (const target of item.missing) {
    const wanted = item.files.map((f) => ({
      from: path.join(OUT, path.basename(renameForColour(f.rel, item.source, target))),
      toRel: renameForColour(f.rel, item.source, target),
      maskPath: path.join(WORK, `${path.basename(f.rel, ".jpg")}-mask.png`),
      cells: f.cells,
      view: f.view,
    }));

    const missing = wanted.filter((w) => !present.has(path.basename(w.from)));
    if (missing.length === wanted.length) continue; // not attempted yet, not a problem
    if (missing.length) {
      problems.push(
        `${item.slug} ${target}: ${missing.length} of ${wanted.length} files missing ` +
          `(${missing.map((m) => path.basename(m.from)).join(", ")}) -- a partial colourway is not installed`,
      );
      continue;
    }

    const target_hex = COLORS[target];
    const [tr, tg, tb] = [1, 3, 5].map((k) => parseInt(target_hex.slice(k, k + 2), 16));
    const [th, , tl] = rgb2hsl(tr, tg, tb);

    const bad = [];
    for (const w of wanted) {
      const meta = await sharp(w.from).metadata();
      if (meta.width !== 843 || meta.height !== 1264) {
        bad.push(`${path.basename(w.from)}: ${meta.width}x${meta.height}, expected 843x1264`);
        continue;
      }
      const m = await measureGarment(w.from, w.maskPath);
      if (!m) { bad.push(`${path.basename(w.from)}: mask is empty`); continue; }
      // White and Ivory are nearly unsaturated, so their hue is meaningless and
      // only lightness is checked. Everything else must land near its swatch.
      const checkHue = target !== "White" && target !== "Ivory";
      if (checkHue && hueDist(m.h, th) > 30) {
        bad.push(`${path.basename(w.from)}: garment reads h=${m.h.toFixed(0)}, ${target} is h=${th.toFixed(0)}`);
      }
      if (Math.abs(m.l - tl) > 0.22) {
        bad.push(`${path.basename(w.from)}: garment reads l=${m.l.toFixed(2)}, ${target} is l=${tl.toFixed(2)}`);
      }
    }
    if (bad.length) { problems.push(`${item.slug} ${target}:\n    ` + bad.join("\n    ")); continue; }
    ready.push({ item, target, wanted });
  }
}

for (const p of problems) console.log("REJECTED  " + p);
if (!ready.length) {
  console.log(problems.length ? "\nNothing installed." : "No finished colourways in " + OUT);
  process.exit(problems.length ? 1 : 0);
}

for (const r of ready) {
  console.log(`\n${r.item.slug}  ${r.target}  ${r.wanted.length} files  ${APPLY ? "INSTALLING" : "ready (dry run)"}`);
  if (!APPLY) continue;
  for (const w of r.wanted) {
    const dest = path.join(PUBLIC, w.toRel);
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(w.from, dest);
  }
}

// The catalog.ts entries, printed rather than patched in: this file is the one
// place a wrong edit takes the whole shop down, and the diff is worth a human
// reading it.
console.log("\n--- add to catalog.ts ---");
for (const r of ready) {
  const base = r.wanted.find((w) => !w.toRel.includes("-combo-"));
  console.log(`\n// ${r.item.name} -- colorImages.${r.target}`);
  console.log(`${r.target}: { front: "${base.toRel}", back: "${base.toRel.replace("front", "back")}" },`);
  console.log(`// ${r.item.name} -- comboImages.${r.target}`);
  const byCell = new Map();
  for (const w of r.wanted) for (const c of w.cells) {
    if (!byCell.has(c)) byCell.set(c, {});
    byCell.get(c)[w.view] = w.toRel;
  }
  console.log(`${r.target}: {`);
  for (const [cell, views] of byCell) {
    if (views.front === base.toRel) continue; // the base cell falls back to colorImages
    console.log(`  "${cell}": { front: "${views.front}", back: "${views.back}" },`);
  }
  console.log(`},`);
}
console.log(`\n${APPLY ? "Installed." : "Dry run. Re-run with --apply to install."}`);
