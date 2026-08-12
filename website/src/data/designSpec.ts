import type { CatalogItem } from "@/data/catalog";

// The shared format the customize chat, preview, and (eventually) tailor spec
// sheet all read from — same object whether the customer started from a
// catalog item or their own upload. See planning/ai-integration-todo.md
// checklist item 8: this has to exist before real AI parsing/generation can
// slot in behind it.

export type BaseSource =
  | { kind: "catalog"; slug: string }
  | { kind: "upload"; fileName: string; imageDataUrl: string };

export type Fabric = "cotton" | "linen";

export type GarmentType = "Shirt" | "Skirt" | "Pants" | "Dress" | "Unspecified";

export type SilhouetteChangeType =
  | "sleeve_length"
  | "hem_slit"
  | "pocket"
  | "cuff_detail"
  | "fit"
  | "neckline";

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
    fabric: "cotton",
    color: "Ivory",
    size: "M",
    sizeMode: "standard",
    measurements: "",
    changes: [],
    freeformNotes: "",
    constraints: { ...PASSING_CONSTRAINTS },
  };
}

export function createSpecFromUpload(fileName: string, imageDataUrl: string): DesignSpec {
  return {
    base: { kind: "upload", fileName, imageDataUrl },
    garmentType: "Unspecified",
    fabric: "cotton",
    color: "Ivory",
    size: "M",
    sizeMode: "standard",
    measurements: "",
    changes: [],
    freeformNotes: "",
    constraints: { ...PASSING_CONSTRAINTS },
  };
}
