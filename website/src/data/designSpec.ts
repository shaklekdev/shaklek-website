import type { CatalogItem } from "@/data/catalog";
import { defaultChangesForCategory } from "@/data/parameterSliders";
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

export type GarmentType = "Shirt" | "Skirt" | "Pants" | "Dress" | "Unspecified";

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

export type SizeMode = "standard" | "tailored";

export type DesignSpec = {
  base: BaseSource;
  garmentType: GarmentType;
  fabric: Fabric;
  color: string;
  size: string;
  sizeMode: SizeMode;
  measurements: string; // used when sizeMode is "tailored" — no AI needed, just carried to the tailor
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
    size: "M",
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
    size: "M",
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
    changes: [],
    freeformNotes: "",
    constraints: { ...PASSING_CONSTRAINTS },
  };
}
