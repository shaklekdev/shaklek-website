/**
 * "Anything usually wrong with this size?"
 *
 * WHY THIS EXISTS: standard sizing asked the customer to pick a letter and
 * said nothing else. Tailored asked for four body measurements and blocked the
 * purchase until it got them. There was nothing in between -- and "in between"
 * is where almost everyone actually lives, because most people know exactly
 * what is wrong with their usual size and own no tape measure.
 *
 * It is also the brand's own story told back as a control: "those lovely
 * shirts you wished had longer sleeves" is on /our-story. This is that
 * sentence, made orderable.
 *
 * DESIGN RULES, all of which matter more than the list itself:
 *
 * 1. THE ID IS STORED, THE LABEL IS DISPLAYED. Labels are copy and will be
 *    reworded; ids reach the database and a tailor's document and must not
 *    move. Renaming an id orphans every order that already carries it.
 *
 * 2. NOTHING HERE IS AN INSTRUCTION IN CENTIMETRES. The customer is reporting
 *    a habit, not measuring. `sizeChart.ts` already warns that its numbers are
 *    published market charts rather than Shaklek's patterns, and techPack.ts
 *    prints no tolerance it does not have a house standard for. Inventing
 *    "+2cm on the sleeve" here would be the same mistake with more confidence.
 *    The tech pack prints these as the customer's own words, under a heading
 *    that says so, and the workshop decides the amount.
 *
 * 3. THE SERVER RE-RESOLVES EVERY ID. What arrives in a request body is a
 *    suggestion. `resolveFitNotes()` keeps only ids that exist for the
 *    category the server itself resolved, deduped and capped -- same rule as
 *    price, quantity and fabric. Nothing typed by a client reaches the tailor.
 *
 * 4. STANDARD SIZING ONLY. On a tailored order the garment is already cut to
 *    the customer's own numbers, so "my usual M is tight" describes a garment
 *    nobody is making.
 */

export type FitNote = { id: string; label: string };

const SHIRT_NOTES: FitNote[] = [
  { id: "sleeves-short", label: "Sleeves too short" },
  { id: "sleeves-long", label: "Sleeves too long" },
  { id: "tight-chest", label: "Tight across the chest" },
  { id: "too-loose", label: "Too loose overall" },
  { id: "body-long", label: "Too long in the body" },
  { id: "body-short", label: "Too short in the body" },
];

const PANTS_NOTES: FitNote[] = [
  { id: "legs-long", label: "Too long in the leg" },
  { id: "legs-short", label: "Too short in the leg" },
  { id: "waist-loose", label: "Waist too loose" },
  { id: "waist-tight", label: "Waist too tight" },
  { id: "tight-hip", label: "Tight at the hip" },
];

const SKIRT_NOTES: FitNote[] = [
  { id: "skirt-long", label: "Too long" },
  { id: "skirt-short", label: "Too short" },
  { id: "waist-loose", label: "Waist too loose" },
  { id: "waist-tight", label: "Waist too tight" },
  { id: "tight-hip", label: "Tight at the hip" },
];

const DRESS_NOTES: FitNote[] = [
  { id: "dress-long", label: "Too long" },
  { id: "dress-short", label: "Too short" },
  { id: "tight-chest", label: "Tight across the chest" },
  { id: "waist-tight", label: "Tight at the waist" },
  { id: "too-loose", label: "Too loose overall" },
];

const BY_CATEGORY: Record<string, FitNote[]> = {
  Shirt: SHIRT_NOTES,
  Pants: PANTS_NOTES,
  Skirt: SKIRT_NOTES,
  Dress: DRESS_NOTES,
};

/** The options offered for a category. Empty for anything unrecognised -- an
 *  uploaded design has no category until a stylist reads it, and guessing a
 *  garment's fit vocabulary is worse than not asking. */
export function fitNotesForCategory(category: string): FitNote[] {
  return BY_CATEGORY[category] ?? [];
}

export function fitNoteLabel(category: string, id: string): string | undefined {
  return fitNotesForCategory(category).find((n) => n.id === id)?.label;
}

/**
 * Server-side resolution. Accepts anything, returns only ids that genuinely
 * exist for this category, in the category's own order, deduped, and never
 * more than the category actually offers. Unknown ids are dropped silently
 * rather than rejected: a stale client should not be able to block a
 * legitimate checkout over an optional field.
 */
export function resolveFitNotes(category: unknown, value: unknown): string[] {
  if (typeof category !== "string") return [];
  const allowed = fitNotesForCategory(category);
  if (allowed.length === 0) return [];
  if (!Array.isArray(value)) return [];
  const asked = new Set(value.filter((v): v is string => typeof v === "string"));
  return allowed.filter((n) => asked.has(n.id)).map((n) => n.id);
}
