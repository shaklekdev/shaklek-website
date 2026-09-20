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
export async function planFiles() {
  const { catalog, paramKeyFor, comboKeyForCategory, renderParamsForCategory } =
    await loadCatalog();

  const out = [];
  for (const item of catalog.filter((c) => c.category === "Abaya")) {
    const key = paramKeyFor(item);
    const params = renderParamsForCategory(key);
    const shotIn = Object.keys(item.colorImages ?? {});
    if (shotIn.length !== 1) {
      throw new Error(
        `${item.slug}: expected exactly one shot colourway, found ${shotIn.length || "none"}. ` +
          `This pipeline recolours FROM a single master set; with two already ` +
          `shot you must say which one is the source.`,
      );
    }
    const source = shotIn[0];

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
