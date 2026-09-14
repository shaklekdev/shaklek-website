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

  // ⚠️ ADDED 2026-09-13. Every one of these was sitting in a RENDERED carousel
  // waiting to be posted, and the linter could not see them. A false price on a
  // post outlives the correction, because a screenshot does not update.
  [/\bAED\s?(389|419|429|619)\b/, 'stale price: the ladder is 449 shirt / 519 trousers since 2026-09-08'],
  [/\bfrom AED\s?3\d\d\b/i, 'stale price: nothing starts below 449'],
  // The founder cut the lead time from advertising AND from the terms of sale
  // on 2026-09-12: ten working days and two weeks are the same duration, and
  // nobody has measured real throughput. A promise in a caption is still a
  // promise.
  // ⚠️ MATCH THE DIGITS TOO. This rule was written as the WORD "ten" and
  // /how-it-works said "about 10 days from order to your door" in its body AND
  // in its meta description. The rule ran clean over it for two days. A banned
  // promise that only one spelling catches is not a rule, it is a coincidence.
  [/\b(about |in |within )?(ten|\d{1,2}) (working )?days\b/i, 'lead-time promise: cut from advertising 2026-09-12, nothing is measured yet'],
  [/\b\d{1,2}[ -]day (delivery|turnaround)\b/i, 'lead-time promise: see above'],
  // planning/marketing/personas.md claim rules, which until now lived only in a
  // markdown table that no builder read.
  [/\bsustainab|\beco[- ]friendly\b|\bgreen\b(?! tea)/i, 'claim rule: say the mechanism, not the label. "Made after you order it."'],
  [/100% plant[- ]based/i, 'claim rule: there are buttons and a zip fly. Say 100% linen.'],
  [/100% made in the UAE/i, 'claim rule: the cloth is milled abroad. Say cut and sewn in the UAE.'],
  // ⚠️ REMOVED 2026-09-13, and the removal is the correction. This rule blocked
  // "100% tailored" on the reasoning that "standard sizes sell at the same
  // price". That reasoning was simply wrong about the business: NOTHING is cut
  // before it is ordered, so a customer who picks M off the size chart still
  // gets a garment cut individually by a tailor for her order. There is no
  // stock, so there is no un-tailored path. On top of that the in-person
  // measuring appointment is free to every customer.
  // The rule spent weeks refusing the founder's own accurate copy. Founder,
  // 2026-09-13: "we tailor everything... even if the damn customer put a
  // standard chart we still tailor this."
  // What stays banned is "100% made in the UAE" (the cloth is milled abroad),
  // which is a different claim and still true of nothing we can prove.
  [/\blong sleeves?\b/i, 'claim rule: no catalogue image shows a sleeve worn down. Name the setting.'],
  [/\bhypoallergenic|\bcures?\b|\bprevents?\b/i, 'claim rule: no health claims. Breathable, absorbent, a plant fibre.'],
  [/\bmodest ?wear\b/i, 'claim rule: say "choose the sleeve"'],
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
