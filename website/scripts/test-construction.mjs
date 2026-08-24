// Every customizer option, and every catalog item, must have construction text
// on the tech pack. A slider option added without a note would print a cut the
// tailor is told to make and never told how to make -- silently, because the
// PDF would just omit the line.
//
// Run: npx tsx scripts/test-construction.mjs
import { catalog } from "../src/data/catalog.ts";
import { SHIRT_PARAMS, PANTS_PARAMS } from "../src/data/parameterSliders.ts";
import { ITEM_CONSTRUCTION, OPTION_CONSTRUCTION } from "../src/data/construction.ts";

let fail = 0;

for (const item of catalog) {
  if (!ITEM_CONSTRUCTION[item.slug]) {
    console.error(`MISSING item construction: ${item.slug}`);
    fail++;
  }
}

const expected = new Set();
for (const [category, params] of [
  ["Shirt", SHIRT_PARAMS],
  ["Pants", PANTS_PARAMS],
]) {
  for (const p of params) {
    for (const o of p.options) {
      const key = `${category}:${p.type}:${o.value}`;
      expected.add(key);
      if (!OPTION_CONSTRUCTION[key]) {
        console.error(`MISSING option construction: ${key}  (${p.labelFor(o.text)})`);
        fail++;
      }
    }
  }
}

// The reverse direction matters too: a stale key is a note the tailor will
// never see, which reads as coverage that is not there.
for (const key of Object.keys(OPTION_CONSTRUCTION)) {
  if (!expected.has(key)) {
    console.error(`STALE option construction, no such slider option: ${key}`);
    fail++;
  }
}

// Item construction keyed to a slug that no longer exists is the same problem.
const slugs = new Set(catalog.map((c) => c.slug));
for (const slug of Object.keys(ITEM_CONSTRUCTION)) {
  if (!slugs.has(slug)) {
    console.error(`STALE item construction, no such catalog item: ${slug}`);
    fail++;
  }
}

console.log(
  fail === 0
    ? `ok — ${catalog.length} items and ${expected.size} options all carry construction text`
    : `${fail} problem(s)`,
);
process.exit(fail === 0 ? 0 : 1);
