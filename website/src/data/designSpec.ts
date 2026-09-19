import type { CatalogItem } from "@/data/catalog";
import { defaultChangesForCategory, paramKeyFor } from "@/data/parameterSliders";
import { defaultSizeFor } from "@/data/sizeChart";
import { DEFAULT_FABRIC, type Fabric } from "@/data/fabrics";

// The shared format the customize chat, preview, and (eventually) tailor spec
// sheet all read from — same object whether the customer started from a
// catalog item or their own upload. See planning/ai-integration-todo.md
// checklist item 8: this has to exist before real AI parsing/generation can
// slot in behind it.

export type BaseSource =
  | { kind: "catalog"; slug: string }
  | { kind: "upload"; fileName: string; imageDataUrl: string };

// Defined in @/data/fabrics alongside which of them can actually be made
// today; re-exported here because most callers already import it from this
// module.
export type { Fabric };

export type GarmentType = "Shirt" | "Skirt" | "Pants" | "Dress" | "Abaya" | "Unspecified";

export type SilhouetteChangeType =
  | "sleeve_length"
  // ⚠️ WIDTH, NOT LENGTH, and they are not interchangeable. Added 2026-09-15
  // for the abaya, whose sleeves are ALWAYS long: the choice is how roomy they
  // are, because a wide sleeve dips into food and catches on things while a
  // narrow one loses the drama. Sleeve LENGTH on an abaya is a measurement the
  // tailor takes, never a slider.
  | "sleeve_width"
  | "hem_slit"
  | "pocket"
  | "cuff_detail"
  | "fit"
  | "neckline"
  | "closure"
  | "garment_length"
  | "leg_width"
  | "waist_rise";

export type SilhouetteChange = {
  type: SilhouetteChangeType;
  value: string;
  label: string; // human-readable, shown as a tag in the preview
};

// The three producibility rules a solo tailor's constraints require (see
// backend-todo.md / ai-integration-todo.md). `passed` is the single flag the
// UI and, later, checkout gate on.
export type ConstraintCheck = {
  singleFabric: boolean;
  singleLayer: boolean;
  noLogo: boolean;
  passed: boolean;
  flagNotes: string[]; // human-readable reasons for any false flag above
};

// ⚠️ TWO MODES, AND "tailored" NOW MEANS THE FREE MEASURING VISIT rather than
// a form the customer fills in herself. A third "fitting" mode existed for
// about an hour on 2026-09-14 before the founder collapsed it: if the visit is
// free and better, nobody types four guessed numbers, so the fields were
// removed and Tailored became the offer.
//
// THE CONSEQUENCE IS IN techPack.ts: a tailored line now legitimately arrives
// with measurements: "". That is no longer an error, it is the normal case,
// and the tech pack says so.
export type SizeMode = "standard" | "tailored";

export type DesignSpec = {
  base: BaseSource;
  garmentType: GarmentType;
  fabric: Fabric;
  color: string;
  size: string;
  sizeMode: SizeMode;
  measurements: string; // used when sizeMode is "tailored" — no AI needed, just carried to the tailor
  // "Anything usually wrong with this size?" — stable ids from fitNotes.ts,
  // never free text, and only meaningful in "standard" mode. See that file for
  // why the ids are what travels and the labels are only ever displayed.
  fitNotes: string[];
  changes: SilhouetteChange[];
  freeformNotes: string; // raw customer text — always kept alongside the structured parse
  constraints: ConstraintCheck;
};

export const PASSING_CONSTRAINTS: ConstraintCheck = {
  singleFabric: true,
  singleLayer: true,
  noLogo: true,
  passed: true,
  flagNotes: [],
};

export function createSpecFromCatalog(item: CatalogItem): DesignSpec {
  return {
    base: { kind: "catalog", slug: item.slug },
    garmentType: item.category,
    fabric: DEFAULT_FABRIC,
    color: "Ivory",
    // Trousers and skirts are sized 34-44, tops XS-XXL -- one chart, two
    // labellings, see sizeChart.ts. The stored value is the label the customer
    // saw, so everything downstream reads back what she picked.
    size: defaultSizeFor(item.category),
    // ⚠️ TAILORED by default, 2026-09-14 (founder), and the reason the default
    // moved AWAY from tailored on 2026-08-26 has now been removed rather than
    // overruled. That comment said: `Add to cart` is disabled until four body
    // measurements validate, so a tailored default asked every visitor for a
    // tape measure before it would let her buy anything, which on a phone away
    // from home is a closed door rather than a higher-intent path. That was
    // correct at the time.
    //
    // THERE ARE NO MEASUREMENT FIELDS ANY MORE. Tailored means we come and
    // measure her in Dubai, so it now costs the customer zero taps and zero
    // knowledge, and the closed door is gone. It is the better product, it is
    // free, and it is why this brand charges what it charges, so it leads.
    //
    // If measurement fields ever come back, this decision comes back with
    // them: do not leave a default that disables the buy button.
    sizeMode: "tailored",
    measurements: "",
    fitNotes: [],
    changes: defaultChangesForCategory(paramKeyFor(item), item.defaultChanges),
    freeformNotes: "",
    constraints: { ...PASSING_CONSTRAINTS },
  };
}

export function createSpecFromUpload(fileName: string, imageDataUrl: string): DesignSpec {
  return {
    base: { kind: "upload", fileName, imageDataUrl },
    garmentType: "Unspecified",
    fabric: DEFAULT_FABRIC,
    color: "Ivory",
    // An upload has no category until a stylist reads it, so it falls back to
    // the letter ladder.
    size: defaultSizeFor("Unspecified"),
    // ⚠️ TAILORED by default, 2026-09-14 (founder), and the reason the default
    // moved AWAY from tailored on 2026-08-26 has now been removed rather than
    // overruled. That comment said: `Add to cart` is disabled until four body
    // measurements validate, so a tailored default asked every visitor for a
    // tape measure before it would let her buy anything, which on a phone away
    // from home is a closed door rather than a higher-intent path. That was
    // correct at the time.
    //
    // THERE ARE NO MEASUREMENT FIELDS ANY MORE. Tailored means we come and
    // measure her in Dubai, so it now costs the customer zero taps and zero
    // knowledge, and the closed door is gone. It is the better product, it is
    // free, and it is why this brand charges what it charges, so it leads.
    //
    // If measurement fields ever come back, this decision comes back with
    // them: do not leave a default that disables the buy button.
    sizeMode: "tailored",
    measurements: "",
    fitNotes: [],
    changes: [],
    freeformNotes: "",
    constraints: { ...PASSING_CONSTRAINTS },
  };
}
