import type { CatalogItem } from "@/data/catalog";
import { defaultChangesForCategory } from "@/data/parameterSliders";
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

// ⚠️ "fitting" IS THE FREE MEASURING APPOINTMENT and it is a real third mode,
// not a flag on the other two. Founder, 2026-09-14: the box must be visible in
// BOTH the size-chart option and the enter-my-measurements option, and "if they
// click on it then no need to enter measurements". A mode is the only shape
// that gives all three of those: it is mutually exclusive with the other two,
// it renders under both, and it can switch the measurement fields off.
//
// It reaches the order as the free-text `size` field, which /api/orders caps at
// 40 characters and never prices from, so a new value here cannot affect what
// anyone is charged.
export type SizeMode = "standard" | "tailored" | "fitting";

// ⚠️ THE VALUE THAT TRAVELS WITH THE ORDER. It was a bare literal in two files
// and a security review flagged it: edit one and tsc stays green while the
// round trip silently maps the line back to "standard", so the customer gets a
// size she never chose. Import it, never retype it.
//
// The cap is not decoration. /api/orders stores `size` as text(item.size, 40),
// so a longer value is TRUNCATED IN THE DATABASE and the round trip then fails
// with no error anywhere.
export const FITTING_SIZE = "Fitting in Dubai";
if (FITTING_SIZE.length > 40) throw new Error("FITTING_SIZE must fit /api/orders' 40-char cap");

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
    // STANDARD by default, changed 2026-08-26 (founder). This reverses an
    // earlier decision and the reason is worth keeping, because the earlier
    // reasoning was not wrong so much as incomplete: made-to-order only
    // justifies its price if the garment is cut to the customer, so tailored
    // was the default.
    //
    // What that missed is that `Add to cart` is DISABLED until four body
    // measurements validate (see measurementsValid in DesignCustomizer). So
    // the default asked every visitor for a tape measure before it would let
    // them buy anything at all -- on a phone, away from home, that is not a
    // higher-intent path, it is a closed door. Standard sizing already worked
    // and was one tap away; now it is zero taps away and tailored is the
    // upgrade, labelled free so it still sells itself.
    sizeMode: "standard",
    measurements: "",
    fitNotes: [],
    changes: defaultChangesForCategory(item.category, item.defaultChanges),
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
    // STANDARD by default, changed 2026-08-26 (founder). This reverses an
    // earlier decision and the reason is worth keeping, because the earlier
    // reasoning was not wrong so much as incomplete: made-to-order only
    // justifies its price if the garment is cut to the customer, so tailored
    // was the default.
    //
    // What that missed is that `Add to cart` is DISABLED until four body
    // measurements validate (see measurementsValid in DesignCustomizer). So
    // the default asked every visitor for a tape measure before it would let
    // them buy anything at all -- on a phone, away from home, that is not a
    // higher-intent path, it is a closed door. Standard sizing already worked
    // and was one tap away; now it is zero taps away and tailored is the
    // upgrade, labelled free so it still sells itself.
    sizeMode: "standard",
    measurements: "",
    fitNotes: [],
    changes: [],
    freeformNotes: "",
    constraints: { ...PASSING_CONSTRAINTS },
  };
}
