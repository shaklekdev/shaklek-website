#!/usr/bin/env node
// Catalog integrity guard. Run with `npm run verify` (repo: website/).
//
// Three checks, all of which have caught real shipped bugs:
//
//   1. MISSING FILE   -- every "/catalog/..." path in catalog.ts exists on disk.
//   2. WRONG HERO     -- item.image is the photo the customizer actually shows
//                        on first load, i.e. what defaultChanges resolve to
//                        through comboKeyForCategory.
//   3. MISSING CELL   -- every colour an item advertises has a photo for that
//                        same hero combo, so switching colour on first load
//                        can never fall through to a different silhouette.
//
// The slider logic is imported from src/data/parameterSliders.ts rather than
// reimplemented -- a second copy of comboKeyForCategory would drift the first
// time the pants vocabulary changes again. Node's built-in type stripping
// loads the .ts directly; both modules are runtime-import-free (type-only
// imports erase), so there is no bundler or path-alias resolution involved.
//
// Exit codes: 0 = clean, 1 = at least one failure, 2 = the checker itself
// could not run (treat as a failure, not a pass).

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const CATALOG_TS = path.join(ROOT, "src", "data", "catalog.ts");

const failures = [];
const fail = (check, item, detail) => failures.push({ check, item, detail });

let catalog, comboKeyForCategory, defaultChangesForCategory;
try {
  ({ catalog } = await import(path.join(ROOT, "src/data/catalog.ts")));
  ({ comboKeyForCategory, defaultChangesForCategory } =
    await import(path.join(ROOT, "src/data/parameterSliders.ts")));
} catch (err) {
  console.error("verify-catalog: could not load the catalog modules.");
  console.error(err?.message ?? err);
  process.exit(2);
}

// ---------------------------------------------------------------- check 1
// Scan the raw source rather than walking the parsed objects: this catches
// paths in fields the other two checks don't know about, and it keeps working
// if someone adds a new image-bearing field.
const source = await readFile(CATALOG_TS, "utf8");
const referenced = new Set(
  [...source.matchAll(/"(\/catalog\/[^"]+)"/g)].map((m) => m[1]),
);
for (const rel of [...referenced].sort()) {
  if (!existsSync(path.join(PUBLIC, rel))) fail("MISSING FILE", rel, "not on disk");
}

// ---------------------------------------------------------------- checks 2+3
for (const item of catalog) {
  // The combo the customizer lands on with no user input.
  const heroKey = comboKeyForCategory(
    item.category,
    defaultChangesForCategory(item.category, item.defaultChanges),
  );

  // Mirror DesignCustomizer's own precedence exactly (see its previewImage:
  // `comboVariant ?? colorVariant ?? item.image`). Don't assume the default
  // combo is ungenerated -- some items now ship a real photo for it, and
  // hardcoding the older "default always falls back to colorImages" rule
  // reports those as broken when they render correctly.
  //
  // The `item.image` leg of that chain is deliberately NOT reproduced here:
  // in the app it means a customer who picks Navy silently gets the Ivory
  // photo, which is precisely what check 3 exists to catch.
  const photoFor = (colour) =>
    (heroKey ? item.comboImages?.[colour]?.[heroKey]?.front : undefined) ??
    item.colorImages?.[colour]?.front;

  // --- check 2: item.image is the hero photo of its own default colourway.
  // The grid is all-Ivory by convention, but resolve it rather than assume:
  // whichever colourway item.image belongs to is the one that must match.
  const colours = Object.keys(item.colorImages ?? {});
  const ownColour =
    colours.find((c) => photoFor(c) && photoFor(c) === item.image) ??
    (colours.includes("Ivory") ? "Ivory" : colours[0]);

  if (!item.image) {
    fail("WRONG HERO", item.slug, "item has no `image`");
  } else {
    const expected = photoFor(ownColour);
    if (!expected) {
      fail(
        "WRONG HERO",
        item.slug,
        `hero combo "${heroKey}" has no photo in ${ownColour}, so item.image can't be verified`,
      );
    } else if (expected !== item.image) {
      fail(
        "WRONG HERO",
        item.slug,
        `image is ${item.image}\n      expected ${expected}  (${ownColour}, combo "${heroKey}")`,
      );
    }
  }

  // --- check 3: every advertised colour has that same hero combo.
  if (colours.length === 0) fail("MISSING CELL", item.slug, "item has no colorImages");
  for (const colour of colours) {
    if (!photoFor(colour)) {
      fail(
        "MISSING CELL",
        item.slug,
        `${colour} has neither combo "${heroKey}" nor a base front photo` +
          ` -- the app would fall back to item.image and show the wrong colour`,
      );
    }
  }
}

// ---------------------------------------------------------------- report
const checked = {
  paths: referenced.size,
  items: catalog.length,
  cells: catalog.reduce((n, i) => n + Object.keys(i.colorImages ?? {}).length, 0),
};

if (failures.length === 0) {
  console.log(
    `catalog ok — ${checked.paths} image paths, ${checked.items} items, ${checked.cells} item×colour cells`,
  );
  process.exit(0);
}

const byCheck = new Map();
for (const f of failures) {
  if (!byCheck.has(f.check)) byCheck.set(f.check, []);
  byCheck.get(f.check).push(f);
}
for (const [check, list] of byCheck) {
  console.error(`\n${check}  (${list.length})`);
  for (const f of list) console.error(`  ${f.item}\n      ${f.detail}`);
}
console.error(
  `\n${failures.length} problem${failures.length === 1 ? "" : "s"} across ` +
    `${checked.paths} paths / ${checked.items} items / ${checked.cells} cells`,
);
process.exit(1);
