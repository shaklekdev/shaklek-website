import type { SilhouetteChange, SilhouetteChangeType } from "@/data/designSpec";

// Fixed, per-garment slider parameters for Step 2 — replaces freeform chat
// customization for catalog items (upload-your-own still uses CustomizeChat,
// since there's no fixed base style to define sliders against). Every
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

export function paramsForCategory(category: string): SliderParam[] | null {
  if (category === "Shirt") return SHIRT_PARAMS;
  if (category === "Pants") return PANTS_PARAMS;
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
