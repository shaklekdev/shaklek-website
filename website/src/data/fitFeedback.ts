import type { CatalogItem } from "@/data/catalog";

type CatalogCategory = CatalogItem["category"];

/**
 * "How did it actually fit?" -- the RETURN LEG of fitNotes.ts.
 *
 * fitNotes asks, before the order, what the customer expects to be wrong with
 * her usual size. This asks, after she has worn the piece, what actually was.
 * Together they are the only thing a made-to-order brand can offer that a
 * stocked one physically cannot: a second order that starts from the first
 * one instead of from a size chart.
 *
 * It is reached by a QR on the thank-you card in the parcel. The card is
 * printed in bulk and cannot know which piece it was packed with, and the page
 * must not ask the visitor to pick from her own order history -- an
 * unauthenticated page that lists orders for a typed email is an
 * account-enumeration leak dressed up as convenience. So the five fit
 * questions stay GARMENT-AGNOSTIC: they are the things true of any garment.
 *
 * ⚠️ UPDATED 2026-09-05. Garment-agnostic questions were the right answer to
 * the enumeration problem and the WRONG answer to a two-piece parcel: the
 * answers attached to the ORDER, so "the length was short" on a shirt and
 * trousers could not be told apart, and techPack printed it against whatever
 * was cut next. FIT_GARMENTS below closes that without reopening the leak --
 * she says what she is holding, which is a question, not a disclosure. The
 * five questions themselves are unchanged and must stay agnostic; only the
 * sleeves one is now hidden for garments that have none.
 *
 * THE RULES ARE fitNotes.ts's RULES, and they are repeated here because they
 * are what keep this safe rather than what makes it tidy:
 *
 * 1. THE ID IS STORED, THE LABEL IS DISPLAYED. Labels are copy and will be
 *    reworded. Ids reach the database and a tailor's document. Renaming an id
 *    orphans every answer already given.
 *
 * 2. THE SERVER RE-RESOLVES EVERY ID. `resolveFitFeedback()` keeps only pairs
 *    that genuinely exist. Nothing typed by a client reaches the tailor.
 *
 * 3. NOTHING HERE IS AN INSTRUCTION IN CENTIMETRES. The customer reports how it
 *    felt; the workshop decides the amount. Same reasoning as fitNotes rule 2 --
 *    sizeChart.ts's numbers are published market charts, not Shaklek patterns,
 *    and inventing "+2cm on the sleeve" here would be that mistake with more
 *    confidence.
 *
 * 4. "JUST RIGHT" IS AN ANSWER, NOT A SKIP. It is the most useful reply in the
 *    set: it tells the tailor to change nothing there, which is different from
 *    the customer not saying. So it is stored like any other id.
 */

/**
 * WHICH PIECE THIS IS ABOUT -- asked because one card arrives in a parcel that
 * may hold several garments.
 *
 * ⚠️ THIS IS NOT AN ORDER LOOKUP, AND THE DISTINCTION IS THE WHOLE SAFETY
 * ARGUMENT. The rule this route lives under forbids SHOWING an unauthenticated
 * visitor what a typed email has bought -- that is account enumeration dressed
 * up as convenience. Asking her what she is holding is the opposite direction:
 * she tells us, we tell her nothing, and a wrong answer reveals nothing and
 * costs nothing but an unattributed row.
 *
 * Without it, a two-piece order produces answers that cannot be attributed --
 * "the length was shorter than I like" against a shirt and trousers -- and
 * techPack prints them under HOW HER LAST PIECE FITTED on whatever is cut
 * next. That is wrong instructions to a tailor, which is worse than silence.
 *
 * ⚠️ ALL FOUR CATEGORIES ARE LISTED EVEN THOUGH THE CATALOGUE SHIPS TWO.
 * The keying is `CatalogItem["category"]`, so adding a category to the
 * catalogue without adding it here is a TYPE ERROR rather than a silent
 * attribution failure discovered months later. Offering a category nobody can
 * buy costs nothing -- she is looking at the garment while she answers.
 *
 * The catalogue is NOT imported here. This file is pulled into the /fit client
 * bundle, and catalog.ts carries every image path in the shop.
 */
export type FitGarment = {
  /** Stored via order_item_id, never as a label. Same rule as everything else here. */
  id: string;
  label: string;
  /** Whether to ask the sleeves question at all. */
  hasSleeves: boolean;
};

export const FIT_GARMENTS: Record<CatalogCategory, FitGarment> = {
  Shirt: { id: "shirt", label: "A shirt or top", hasSleeves: true },
  Pants: { id: "trousers", label: "Trousers", hasSleeves: false },
  Skirt: { id: "skirt", label: "A skirt", hasSleeves: false },
  Dress: { id: "dress", label: "A dress", hasSleeves: true },
};

export const FIT_GARMENT_LIST: (FitGarment & { category: CatalogCategory })[] =
  (Object.keys(FIT_GARMENTS) as CatalogCategory[]).map((category) => ({
    category,
    ...FIT_GARMENTS[category],
  }));

/** The question's own wording, kept beside the options like every other one. */
export const GARMENT_QUESTION = "Which piece is this about?";

/** Answer id back to the catalogue category the order row actually stores. */
export function categoryForGarment(id: unknown): CatalogCategory | null {
  if (typeof id !== "string") return null;
  const hit = FIT_GARMENT_LIST.find((g) => g.id === id);
  return hit ? hit.category : null;
}

/** Does this garment have sleeves to ask about? Unknown answers keep the question. */
export function garmentHasSleeves(id: string | null): boolean {
  if (!id) return true;
  const hit = FIT_GARMENT_LIST.find((g) => g.id === id);
  return hit ? hit.hasSleeves : true;
}

export type FitQuestion = {
  id: string;
  /** What the customer is asked. */
  label: string;
  options: { id: string; label: string }[];
};

// "Just right" sits in the MIDDLE of every row on purpose. Put it first and it
// becomes the path of least resistance, and a form that quietly collects
// "everything was fine" from someone who did not read it is worse than no form.
export const FIT_QUESTIONS: FitQuestion[] = [
  {
    id: "overall",
    label: "Overall, how did it sit on you?",
    options: [
      { id: "close", label: "A little close" },
      { id: "right", label: "Just right" },
      { id: "loose", label: "A little loose" },
    ],
  },
  {
    id: "length",
    label: "The length",
    options: [
      { id: "short", label: "Shorter than I like" },
      { id: "right", label: "Just right" },
      { id: "long", label: "Longer than I like" },
    ],
  },
  {
    id: "shoulders",
    label: "Across the shoulders and chest",
    options: [
      { id: "tight", label: "A little tight" },
      { id: "right", label: "Just right" },
      { id: "roomy", label: "A little roomy" },
    ],
  },
  {
    id: "waist",
    label: "At the waist",
    options: [
      { id: "tight", label: "A little tight" },
      { id: "right", label: "Just right" },
      { id: "loose", label: "A little loose" },
    ],
  },
  {
    id: "sleeves",
    label: "The sleeves",
    options: [
      { id: "short", label: "Shorter than I like" },
      { id: "right", label: "Just right" },
      { id: "long", label: "Longer than I like" },
      // Kept even though the form now hides this question for trousers and
      // skirts: a sleeveless dress still needs it, every row written before
      // 2026-09-05 may hold it, and removing an option id orphans stored
      // answers (rule 1 at the top of this file).
      { id: "na", label: "No sleeves on this piece" },
    ],
  },
];

/** Free-text cap. Long enough for a real sentence, short enough that the field
 *  cannot be used to store someone else's data in our database. */
export const FIT_NOTE_MAX = 400;

export function fitQuestion(id: string): FitQuestion | undefined {
  return FIT_QUESTIONS.find((q) => q.id === id);
}

/**
 * Server-side resolution, same contract as resolveFitNotes: accept anything,
 * return only question/option pairs that genuinely exist, in the declared
 * question order. Unknown keys are dropped silently rather than rejected --
 * a stale client should not be able to throw away a customer's real answers
 * over one field it no longer recognises.
 */
export function resolveFitFeedback(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const asked = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const q of FIT_QUESTIONS) {
    const picked = asked[q.id];
    if (typeof picked !== "string") continue;
    if (q.options.some((o) => o.id === picked)) out[q.id] = picked;
  }
  return out;
}

/**
 * Ids back into sentences, for the tailor's document. Returns lines rather
 * than a blob so techPack can lay them out, and skips "just right" ONLY here:
 * it is worth storing and not worth printing as an instruction, because a
 * tech pack is a list of things to do.
 */
export function fitFeedbackLines(answers: Record<string, string>): string[] {
  const lines: string[] = [];
  for (const q of FIT_QUESTIONS) {
    const picked = answers[q.id];
    if (!picked || picked === "right" || picked === "na") continue;
    const label = q.options.find((o) => o.id === picked)?.label;
    if (label) lines.push(`${q.label}: ${label.toLowerCase()}`);
  }
  return lines;
}
