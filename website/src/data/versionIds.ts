import { catalog } from "@/data/catalog";
import { renderParamsForCategory } from "@/data/parameterSliders";

/**
 * A stable code for every version Shaklek can actually make.
 *
 * WHY THIS EXISTS: the founder is meeting the tailor to agree metres of fabric
 * per version, and there was no way to name a version. "The oversized shirt,
 * long sleeve, normal length" is four words that mean nothing on a printed
 * sheet and cannot be written in a margin. Every row in the collection book
 * now carries a code, so a number written beside it can be typed back in
 * against something unambiguous.
 *
 * ⚠️ THESE CODES ARE A KEY, NOT A LABEL. Once a metre figure, a price or a
 * tailor's note is recorded against OVS-LN, that code must keep meaning the
 * same thing forever. Changing how a code is built orphans every measurement
 * taken against the old one, the same rule as the ids in data/fitNotes.ts.
 *
 * Shape: ITEM-COMBO.
 *   ITEM  three letters, fixed below, never derived from the name -- renaming
 *         "Oversized Shirt" must not renumber the range.
 *   COMBO first letter of each render-slider value, in declared order.
 *         Shirt  sleeve x length   long/short x normal/longer  -> LN LL SN SL
 *         Pants  legwidth x length straight/wide x cropped/full -> SC SF WC WF
 */
const ITEM_CODES: Record<string, string> = {
  "oversized-shirt": "OVS",
  "structured-blouse": "STB",
  "wrap-top": "WRP",
  "utility-shirt": "UTL",
  "wide-leg-trousers": "WLT",
  "banded-trousers": "BND",
  "pleated-trousers": "PLT",
  "cargo-trousers": "CRG",
};

export type Version = {
  id: string;
  slug: string;
  itemName: string;
  category: string;
  comboKey: string;
  /** Human-readable, in the order the sliders are declared. */
  comboLabel: string;
};

export function versionsForItem(slug: string): Version[] {
  const item = catalog.find((i) => i.slug === slug);
  if (!item) return [];
  const code = ITEM_CODES[slug];
  if (!code) throw new Error(`No item code for ${slug} -- add one to versionIds.ts`);

  const params = renderParamsForCategory(item.category);
  // Cartesian product of the render sliders, in declared order.
  let rows: { key: string[]; label: string[] }[] = [{ key: [], label: [] }];
  for (const p of params) {
    rows = rows.flatMap((r) =>
      p.options.map((o) => ({
        key: [...r.key, o.value],
        label: [...r.label, `${p.name}: ${o.text}`],
      })),
    );
  }

  return rows.map((r) => ({
    id: `${code}-${r.key.map((v) => v[0].toUpperCase()).join("")}`,
    slug,
    itemName: item.name,
    category: item.category,
    comboKey: r.key.join(":"),
    comboLabel: r.label.join(", "),
  }));
}

export function allVersions(): Version[] {
  return catalog.flatMap((i) => versionsForItem(i.slug));
}
