/**
 * The founder's standing copy corrections, in one place, enforced.
 *
 * These were living inside kinda-chic.mjs, which meant the builders written
 * afterwards did not have them, and the very first thing that happened was that
 * TikTok captions written on 2026-08-27 called the catalogue imagery "a real
 * photograph" and "the actual piece" — the two phrasings scripts/social/README.md
 * explicitly forbids, because the imagery is GENERATED and saying otherwise is a
 * false claim about the product to a paying customer.
 *
 * Any builder that emits customer-facing words imports `lint` from here.
 */
export const BANNED = [
  [/[—–]/, 'em or en dash: reads as generated text'],
  [/\bphotographs?\b/i, 'calls the imagery a photograph: it is generated'],
  [/\bphotography\b/i, 'calls the imagery photography: it is generated'],
  [/\bthe actual piece\b/i, 'implies the image is the garment that ships'],
  [/\breal (image|picture|photo)/i, 'implies the image is a photograph of a real garment'],
  [/\bAI\b/, 'no AI mentions customer facing'],
  // "track" as in tracking a person or an order. NOT "tracks" as in music,
  // which appears legitimately when describing TikTok's Commercial Music Library.
  [/\btrack(ing|ers?|ed)\b|\btrack (your|my|an?) \w+/i, 'founder rule 2026-08-25: no form of "track" in customer-facing copy'],
  [/\b\d{1,2}% off\b/i, 'no active promotion code exists; do not imply a discount'],
];

/** Throws on the first violation. `where` is only used in the message. */
export function lint(text, where = "copy") {
  for (const [re, why] of BANNED) {
    const m = text.match(re);
    if (m) throw new Error(`${where}: ${why}\n   offending text: ...${text.slice(Math.max(0, m.index - 40), m.index + 60)}...`);
  }
  return text;
}

/** Lint every string value in an object, recursively. */
export function lintAll(obj, where = "copy") {
  if (typeof obj === "string") return lint(obj, where);
  if (Array.isArray(obj)) { obj.forEach((v, i) => lintAll(v, `${where}[${i}]`)); return obj; }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) lintAll(v, `${where}.${k}`);
  }
  return obj;
}
