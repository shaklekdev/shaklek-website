import type { SilhouetteChange, SilhouetteChangeType } from "@/data/designSpec";

// Fixed, per-garment slider parameters for Step 2 — replaces freeform chat
// customization for catalog items. (The upload-your-own page had its own
// freeform chat; both were removed on 2026-09-12.) Every
// slider position × every color is meant to be pre-renderable, so the
// option lists are deliberately small and fixed, not open-ended.

export type SliderOption = { value: string; text: string };

// "render" sliders are the small set we actually photograph a real combo
// for (see [[project_shaklek_customization_params]] for why the original
// 4/5-slider set was cost-prohibitive to render: 144/288 combos). "premium"
// sliders are spec-only at launch -- still sent to the tailor as a committed
// choice at their default value, but not customer-editable until Shaklek+,
// since making them editable would mean rendering every combination.
export type SliderTier = "render" | "premium";

export type SliderParam = {
  name: string;
  type: SilhouetteChangeType;
  tier: SliderTier;
  options: SliderOption[];
  defaultIndex: number;
  labelFor: (optionText: string) => string;
};

export const SHIRT_PARAMS: SliderParam[] = [
  {
    name: "Sleeves",
    type: "sleeve_length",
    tier: "render",
    options: [
      { value: "short", text: "Short" },
      { value: "long", text: "Long" },
    ],
    defaultIndex: 1,
    labelFor: (text) => `${text} sleeves`,
  },
  {
    name: "Length",
    type: "garment_length",
    tier: "render",
    options: [
      { value: "normal", text: "Normal" },
      { value: "longer", text: "Longer" },
    ],
    defaultIndex: 0,
    labelFor: (text) => `${text} length`,
  },
  {
    name: "Pockets",
    type: "pocket",
    tier: "premium",
    options: [
      { value: "0", text: "No pockets" },
      { value: "1", text: "1 pocket" },
      { value: "2", text: "2 pockets" },
    ],
    defaultIndex: 1,
    labelFor: (text) => text,
  },
  {
    name: "Closure",
    type: "closure",
    tier: "premium",
    options: [
      { value: "button", text: "Button" },
      { value: "zip", text: "Zip" },
    ],
    defaultIndex: 0,
    labelFor: (text) => `${text} closure`,
  },
];

export const PANTS_PARAMS: SliderParam[] = [
  {
    name: "Leg width",
    type: "leg_width",
    tier: "render",
    options: [
      { value: "straight", text: "Straight" },
      { value: "wide", text: "Wide" },
    ],
    defaultIndex: 0,
    labelFor: (text) => `${text} leg`,
  },
  {
    name: "Length",
    type: "garment_length",
    tier: "render",
    options: [
      { value: "cropped", text: "Cropped" },
      { value: "full", text: "Full length" },
    ],
    defaultIndex: 1,
    labelFor: (text) => (text === "Full length" ? text : `${text} length`),
  },
  {
    name: "Waist",
    type: "waist_rise",
    tier: "premium",
    options: [
      { value: "normal", text: "Normal" },
      { value: "high", text: "High waist" },
    ],
    defaultIndex: 0,
    labelFor: (text) => (text === "High waist" ? text : `${text} waist`),
  },
  {
    name: "Closure",
    type: "closure",
    tier: "premium",
    options: [
      { value: "button", text: "Button fly" },
      { value: "zip", text: "Zip fly" },
    ],
    defaultIndex: 0,
    labelFor: (text) => text,
  },
  {
    name: "Pockets",
    type: "pocket",
    tier: "premium",
    options: [
      { value: "none", text: "No pockets" },
      { value: "yes", text: "Pockets" },
    ],
    defaultIndex: 1,
    labelFor: (text) => text,
  },
];

// ---------------------------------------------------------------------------
// DRESS and ABAYA. Added 2026-09-12, BEFORE any photography exists -- on
// purpose. `comboKeyForCategory` builds the photo lookup key from the option
// VALUES below, so settling this vocabulary first is what stops a rename later
// from orphaning every generated image. That is exactly what the trouser
// vocabulary change cost on 2026-08-22.
//
// Both matrices are deliberately 2x2 (sleeve x length), the same shape the
// trouser recipe was proven on. Four cells, of which the default is the base
// photo and is NEVER generated, leaving three per colourway. Anything richer
// multiplies the generation bill without adding a decision a customer makes.
//
// SLEEVE IS DECLARED FIRST IN BOTH, so the key reads `sleeve:length` -- the
// same order as SHIRT_PARAMS. Keep it that way; the key is positional.
export const DRESS_PARAMS: SliderParam[] = [
  {
    name: "Sleeves",
    type: "sleeve_length",
    tier: "render",
    options: [
      { value: "short", text: "Short" },
      { value: "long", text: "Long" },
    ],
    defaultIndex: 1,
    labelFor: (text) => `${text} sleeves`,
  },
  {
    name: "Length",
    type: "garment_length",
    tier: "render",
    options: [
      { value: "midi", text: "Midi" },
      { value: "maxi", text: "Maxi" },
    ],
    defaultIndex: 1,
    labelFor: (text) => `${text} length`,
  },
  {
    name: "Neckline",
    type: "neckline",
    tier: "premium",
    options: [
      { value: "round", text: "Round" },
      { value: "v", text: "V-neck" },
    ],
    defaultIndex: 0,
    labelFor: (text) => `${text} neckline`,
  },
  {
    name: "Pockets",
    type: "pocket",
    tier: "premium",
    options: [
      { value: "0", text: "No pockets" },
      { value: "2", text: "Side seam pockets" },
    ],
    defaultIndex: 1,
    labelFor: (text) => text,
  },
];

// ⚠️ THE ABAYA'S OPTIONS, SETTLED 2026-09-15 AGAINST WHAT PEOPLE ACTUALLY
// COMPLAIN ABOUT, not against what is easy to render.
//
// The three commonest abaya fit complaints are SLEEVE LENGTH (sleeves that
// engulf the hand instead of reaching the wrist), OVERALL LENGTH (hems that
// sweep the floor and collect dust) and SHOULDER WIDTH (seams sitting out on
// the arm, because sizing is picked on bust alone).
//
// ⚠️ TWO OF THOSE THREE ARE NOT SLIDERS AND MUST NEVER BECOME ONE. Sleeve
// length and shoulder are two of the eleven measurements the tailor takes at
// the fitting. They are the ARGUMENT for the visit, and putting them on a
// menu would turn the thing nobody else can do into a thing anybody can fake.
//
// So the sliders carry TASTE and the tape carries FIT:
//   Length      shorter or longer. Even cut to her height, ankle-skimming
//               versus floor-length is a real preference.
//   Sleeve width narrow or wide. The one genuine unmet want: wide sleeves dip
//               into food and catch on things, narrow ones lose the drama.
//               A preference, not a measurement, which is what a slider is for.
//   Pockets     kept because demand is real and rising, chiefly for carrying a
//               phone and keys without a handbag during prayer and travel.
//               ⚠️ BUT NOT A DIFFERENTIATOR: plenty of brands sell pocket
//               abayas. Do not build a campaign on it.
//
// SLEEVES ARE ALWAYS LONG and are not a choice. A previous comment here said
// the abaya "has no closure slider and never gets one"; that was an assumption,
// and the founder considered open-versus-closed then ruled it OUT as a slider
// on 2026-09-15: a closed abaya needs a fastening, a different pattern and more
// cloth, so it is a SEPARATE PRODUCT, not a customisation of this one.
//
// ⚠️ Safe to change only because no abaya photography exists yet.
// comboKeyForCategory builds keys from render-tier slider VALUES in declared
// order, so changing them renames every combo cell and would orphan every
// photograph. That is what happened to pants on 2026-08-22. Order is length
// then sleeve width, so keys read "maxi:wide", "midi:narrow".
export const ABAYA_PARAMS: SliderParam[] = [
  {
    name: "Length",
    type: "garment_length",
    tier: "render",
    options: [
      { value: "midi", text: "Shorter" },
      { value: "maxi", text: "Longer" },
    ],
    defaultIndex: 1,
    labelFor: (text) => `${text} length`,
  },
  {
    name: "Sleeves",
    type: "sleeve_width",
    tier: "render",
    options: [
      { value: "narrow", text: "Narrow" },
      { value: "wide", text: "Wide" },
    ],
    defaultIndex: 1,
    labelFor: (text) => `${text} sleeves`,
  },
  {
    name: "Pockets",
    type: "pocket",
    tier: "premium",
    options: [
      { value: "0", text: "No pockets" },
      { value: "2", text: "Side seam pockets" },
    ],
    defaultIndex: 1,
    labelFor: (text) => text,
  },
];

export function paramsForCategory(category: string): SliderParam[] | null {
  if (category === "Shirt") return SHIRT_PARAMS;
  if (category === "Pants") return PANTS_PARAMS;
  if (category === "Dress") return DRESS_PARAMS;
  if (category === "Abaya") return ABAYA_PARAMS;
  return null;
}

export function renderParamsForCategory(category: string): SliderParam[] {
  return (paramsForCategory(category) ?? []).filter((p) => p.tier === "render");
}

export function premiumParamsForCategory(category: string): SliderParam[] {
  return (paramsForCategory(category) ?? []).filter((p) => p.tier === "premium");
}

export function defaultChangesForCategory(
  category: string,
  overrides?: Partial<Record<string, string>>,
): SilhouetteChange[] {
  const params = paramsForCategory(category);
  if (!params) return [];
  return params.map((param) => {
    const overrideValue = overrides?.[param.type];
    const option =
      (overrideValue && param.options.find((o) => o.value === overrideValue)) ||
      param.options[param.defaultIndex];
    return { type: param.type, value: option.value, label: param.labelFor(option.text) };
  });
}

// A stable key built only from the "render" sliders' current values, in
// their fixed declared order -- used to look up the pre-rendered combo photo
// for the item/color the customer has selected. Premium sliders don't
// affect the key since they don't have per-combo photos.
export function comboKeyForCategory(category: string, changes: SilhouetteChange[]): string | null {
  const renderParams = renderParamsForCategory(category);
  if (renderParams.length === 0) return null;
  const values = renderParams.map((param) => {
    const change = changes.find((c) => c.type === param.type);
    return change?.value ?? param.options[param.defaultIndex].value;
  });
  return values.join(":");
}

// Orders persist customizations as human-readable labels ("Wide leg",
// "Cropped length") rather than {type, value} pairs -- see order_items.changes.
// The tailor spec sheet needs the combo photo the customer actually saw, so
// this maps those labels back to a comboKey. Any render slider whose label is
// missing falls back to that slider's own default, which is what the customer
// would have been looking at.
export function comboKeyFromLabels(category: string, labels: string[] | null): string | null {
  const renderParams = renderParamsForCategory(category);
  if (renderParams.length === 0) return null;
  const changes: SilhouetteChange[] = renderParams.map((param) => {
    const match = param.options.find((o) => labels?.includes(param.labelFor(o.text)));
    const option = match ?? param.options[param.defaultIndex];
    return { type: param.type, value: option.value, label: param.labelFor(option.text) };
  });
  return comboKeyForCategory(category, changes);
}

// The inverse of the label-flattening that happens on the way into the cart.
// A cart line stores customizations as human-readable labels ("Wide leg",
// "Short sleeves") because that is what the order payload, the DB and the
// tailor's spec sheet consume -- the structured {type, value} pairs are
// dropped. To let a customer reopen a cart line and keep editing it, we have
// to rebuild the full change set from those labels.
//
// Unlike comboKeyFromLabels this covers premium sliders too, not just the
// render tier: a reopened design has to come back with *every* slider where
// the customer left it, otherwise editing the colour would silently reset
// the pocket count. Any label that doesn't match falls back to that
// slider's own default (or the item's defaultChanges override), which is
// what the customer would have been looking at.
export function changesFromLabels(
  category: string,
  labels: string[] | null,
  overrides?: Partial<Record<string, string>>,
): SilhouetteChange[] {
  const params = paramsForCategory(category);
  if (!params) return [];
  return params.map((param) => {
    const matched = param.options.find((o) => labels?.includes(param.labelFor(o.text)));
    const overrideValue = overrides?.[param.type];
    const fallback =
      (overrideValue && param.options.find((o) => o.value === overrideValue)) ||
      param.options[param.defaultIndex];
    const option = matched ?? fallback;
    return { type: param.type, value: option.value, label: param.labelFor(option.text) };
  });
}

// The options the customer actually chose, for showing back to them.
//
// A cart line stores every slider's label, premium ones included. Premium
// sliders are not customer-editable -- they are committed at their defaults
// and never rendered in the customizer -- so echoing them into the cart
// describes decisions the customer never made. A Utility Shirt came back as
// "... 1 pocket, Button closure" on a page that had offered neither, which
// reads either as a mistake or as the site putting words in their mouth.
//
// The labels still travel to the order and the tailor's tech pack untouched:
// the workshop does need to know the pocket count. This is a display filter
// and nothing more.
//
// Categories with no fixed sliders (uploaded designs) pass through unchanged,
// since their changes are freeform and there is no option list to match.
export function customerChosenLabels(
  category: string,
  labels: string[] | null | undefined,
): string[] {
  const render = renderParamsForCategory(category);
  if (render.length === 0) return labels ?? [];
  const allowed = new Set(
    render.flatMap((p) => p.options.map((o) => p.labelFor(o.text))),
  );
  return (labels ?? []).filter((l) => allowed.has(l));
}
