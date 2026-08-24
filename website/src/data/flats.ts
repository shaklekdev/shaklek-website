// Technical flats -- the line drawings the tailor cuts from, shown on the tech
// pack beside the photograph of the same combination.
//
// A flat has no colourway, so unlike the photographs these are keyed by
// (slug, comboKey) alone: one drawing serves Ivory, White, Navy and Burgundy.
// They are generated from the Navy photograph of that combination by
// scripts/catalog/run-flats.mjs.
//
// The convention is a filename rather than a table in catalog.ts on purpose.
// A missing entry in a table reads as "this combination has no flat"; a missing
// FILE is detectable, and scripts/catalog/audit-flats.mjs and the coverage
// check in scripts/test-flats.mjs both walk the real directory. Nothing has to
// be kept in sync by hand.

export const FLATS_DIR = "/catalog/flats";

/** Canonical filename for one flat. `comboKey` is `comboKeyForCategory()` output. */
export function flatFileName(slug: string, comboKey: string, view: "front" | "back"): string {
  return `${slug}-${comboKey.replace(/:/g, "-")}-${view}-flat.png`;
}

/** Public path for one flat. Existence is not checked here -- callers fall back. */
export function flatPath(slug: string, comboKey: string, view: "front" | "back"): string {
  return `${FLATS_DIR}/${flatFileName(slug, comboKey, view)}`;
}
