// What the Photoshop colourway pipeline needs to know, derived from catalog.ts
// rather than written down -- the file list, the cells, the colours already
// shot and the ones still missing.
//
// ⚠️ NOTHING HERE IS A HARDCODED FILE LIST. The abayas gained a colour on
// 2026-09-19 and will gain three more; a literal list of sixteen paths would be
// wrong the first time anyone adds a cell, and wrong silently, because a
// recolour pipeline that skips a file produces a colourway that is complete
// everywhere except one slider position.

import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../../..");
export const PUBLIC = path.join(ROOT, "public");

/** The four sellable colours. Must stay in step with src/data/colors.ts. */
export const COLORS = {
  Ivory: "#f5f0e8",
  White: "#fafafa",
  Navy: "#0a2d4a",
  Burgundy: "#4a1a2d",
};

export async function loadCatalog() {
  const { catalog } = await import(path.join(ROOT, "src/data/catalog.ts"));
  const sliders = await import(path.join(ROOT, "src/data/parameterSliders.ts"));
  return { catalog, ...sliders };
}

/**
 * Every (item, cell, view) an abaya has a photograph for, with the colour it
 * was shot in and the colours it still needs.
 *
 * ⚠️ DISTINCT FILES, NOT CELLS. The Buttoned Abaya's back panel is unbroken, so
 * maxi:4 and maxi:5 point at the SAME back file. Recolouring per cell would
 * open, convert and write that file twice, and the second write would race the
 * first. Keyed by source path so each photograph is handled exactly once.
 */
export async function planFiles(preferredSource) {
  const { catalog, paramKeyFor, comboKeyForCategory, renderParamsForCategory } =
    await loadCatalog();

  const out = [];
  for (const item of catalog.filter((c) => c.category === "Abaya")) {
    const key = paramKeyFor(item);
    const params = renderParamsForCategory(key);
    const shotIn = Object.keys(item.colorImages ?? {});
    // ⚠️ ONCE A SECOND COLOURWAY EXISTS, THE SOURCE MUST BE NAMED. The Open
    // Abaya had exactly one (Burgundy) until Navy shipped, and then every
    // caller here became ambiguous: generating Ivory FROM Navy would inherit
    // navy's own generation artefacts instead of the photographed original.
    // Always derive from the PHOTOGRAPH, never from a generation.
    if (shotIn.length === 0) throw new Error(`${item.slug}: no colourway has photographs`);
    const source = preferredSource && shotIn.includes(preferredSource) ? preferredSource : shotIn[0];
    if (shotIn.length > 1 && !preferredSource) {
      throw new Error(
        `${item.slug}: ${shotIn.length} colourways exist (${shotIn.join(", ")}). ` +
          `Name the source explicitly -- pass it to planFiles(), or --from on the CLI.`,
      );
    }

    const cells = [];
    const walk = (i, acc) => {
      if (i === params.length) {
        cells.push(
          comboKeyForCategory(
            key,
            Object.entries(acc).map(([type, value]) => ({ type, value, label: "" })),
          ),
        );
        return;
      }
      for (const o of params[i].options) walk(i + 1, { ...acc, [params[i].type]: o.value });
    };
    walk(0, {});

    const base = comboKeyForCategory(
      key,
      Object.entries(item.defaultChanges ?? {}).map(([type, value]) => ({
        type,
        value,
        label: "",
      })),
    );

    const byPath = new Map();
    for (const cell of cells) {
      for (const view of ["front", "back"]) {
        const rel =
          cell === base
            ? item.colorImages[source][view]
            : item.comboImages?.[source]?.[cell]?.[view];
        if (!rel) throw new Error(`${item.slug} ${cell} ${view}: no photograph in ${source}`);
        if (!byPath.has(rel)) byPath.set(rel, { rel, item: item.slug, source, cells: [], view });
        byPath.get(rel).cells.push(cell);
      }
    }

    out.push({
      slug: item.slug,
      name: item.name,
      source,
      missing: Object.keys(COLORS).filter((c) => !shotIn.includes(c)),
      files: [...byPath.values()],
    });
  }
  return out;
}

/**
 * The published filename for a recoloured cell, derived by swapping the colour
 * word in the source name.
 *
 * ⚠️ A NEW COLOUR WORD IS ALREADY A NEW URL, so these need no -v2 cache-bust
 * (CLAUDE.md §6 trap 2 is about REPLACING a file's content in place). The -v1
 * that the Buttoned Abaya's names already carry is preserved rather than
 * bumped: it is part of that item's naming, not a version of this colourway.
 */
export function renameForColour(rel, from, to) {
  const lower = (s) => s.toLowerCase();
  const out = rel.replace(new RegExp(`-${lower(from)}-`, "g"), `-${lower(to)}-`);
  if (out === rel) {
    throw new Error(`could not place the colour word "${lower(from)}" in ${rel}`);
  }
  return out;
}

/**
 * What a colour ACTUALLY looks like when this catalogue photographs it.
 *
 * ⚠️ NEVER RECOLOUR TO THE SWATCH. `COLORS` above is what the customer taps --
 * a flat hex for a dot 20 pixels across. Real cloth under studio light is far
 * less saturated than its own swatch, and using the hex put s=0.75 across an
 * entire abaya where a real photographed navy garment in this same catalogue
 * measures s=0.45. That is the difference between cloth and a paint-bucket
 * fill, and it is what the founder saw instantly: "no it's very bad".
 *
 * CLAUDE.md §4b already says this in different words and it has now been
 * ignored twice in one session, once for the hue window and once here:
 * **reference the base photo of that colour, not a hex target.** A hex let
 * Banded burgundy drift to h=357 with a 30-point lightness spread; the base
 * photo pulled it to 350-355.
 *
 * So each target is measured off a garment already shipped in that colour,
 * with the strategy that works for its lightness family -- a hue window for
 * the dark ones, a centre crop for the pale ones, which is the same split
 * prepare-masks.mjs makes and for the same reason.
 */
const REFERENCE_PHOTO = {
  Navy: "catalog/cargo-trousers/cargo-trousers-navy-front.jpg",
  Burgundy: "catalog/cargo-trousers/cargo-trousers-burgundy-front.jpg",
  White: "catalog/cargo-trousers/cargo-trousers-white-front.jpg",
  Ivory: "catalog/banded-trousers/banded-trousers-ivory-front.jpg",
};

const HUE_WINDOW = { Navy: [180, 250], Burgundy: [330, 20] };

function _hsl(r, g, b) {
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

const _refCache = new Map();

/** @returns {{h:number,s:number,l:number,lsd:number,n:number}} */
export async function measureReference(colour) {
  if (_refCache.has(colour)) return _refCache.get(colour);
  const sharp = (await import("sharp")).default;
  const path = await import("node:path");
  const rel = REFERENCE_PHOTO[colour];
  if (!rel) throw new Error(`no reference photograph declared for ${colour}`);
  const { data, info } = await sharp(path.join(PUBLIC, rel))
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  const win = HUE_WINDOW[colour];
  let x = 0, y = 0, ss = 0, ls = 0, l2 = 0, n = 0;
  // Pale colours have no usable hue, so they are sampled from the centre of the
  // lower half -- certainly fabric on a trouser photograph -- and filtered by
  // lightness. Dark colours are found by their hue anywhere in the frame.
  const y0 = win ? 0 : Math.round(h * 0.45), y1 = win ? h : Math.round(h * 0.80);
  const x0 = win ? 0 : Math.round(w * 0.34), x1 = win ? w : Math.round(w * 0.66);
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const i = (py * w + px) * 3;
      const [hu, s, l] = _hsl(data[i], data[i + 1], data[i + 2]);
      if (win) {
        const inside = win[0] > win[1] ? hu >= win[0] || hu <= win[1] : hu >= win[0] && hu <= win[1];
        if (!inside || l > 0.45 || s < 0.18) continue;
      } else if (l < 0.70 || l > 0.97 || s > 0.25) continue;
      x += Math.cos((hu * Math.PI) / 180);
      y += Math.sin((hu * Math.PI) / 180);
      ss += s; ls += l; l2 += l * l; n++;
    }
  }
  if (n < 2000) throw new Error(`${colour}: only ${n} reference pixels, too few to trust`);
  let hue = (Math.atan2(y / n, x / n) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  const lm = ls / n;
  const out = { h: hue, s: ss / n, l: lm, lsd: Math.sqrt(Math.max(1e-6, l2 / n - lm * lm)), n };
  _refCache.set(colour, out);
  return out;
}
