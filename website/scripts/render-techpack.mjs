// Render a tech pack from synthetic order data, so the document can be looked
// at before it ships. CLAUDE.md forbids creating test orders against the live
// database, and this needs no database at all.
//
// Run: npx tsx scripts/render-techpack.mjs /tmp/techpack.pdf
import fs from "node:fs";
import { buildPdf } from "../src/lib/techPack.ts";

const out = process.argv[2] ?? "/tmp/techpack.pdf";

// Deliberately covers every branch the layout has: tailored measurements with
// a fit note, a plain standard size, a quantity above one, a free-text request,
// and a combination whose flat may not exist yet.
const items = [
  {
    name: "Cargo Trousers",
    category: "Pants",
    fabric: "Linen",
    color: "Navy",
    size: null,
    measurements: "Bust / chest: 88cm, Waist: 71cm, Hip: 97cm, Height: 168cm, a little looser through the hip",
    changes: ["Wide leg", "Cropped length", "Normal waist", "Button fly", "Pockets"],
    freeformNotes: "Please keep the side pockets flat — the last pair sat proud of the leg.",
  },
  {
    name: "Oversized Shirt",
    category: "Shirt",
    fabric: "Cotton",
    color: "Ivory",
    size: "M",
    measurements: null,
    changes: ["Short sleeves", "Longer length", "1 pocket", "Button closure"],
    freeformNotes: null,
  },
  // Same spec twice -> must group as CUT 2, not print two identical pages.
  {
    name: "Oversized Shirt",
    category: "Shirt",
    fabric: "Cotton",
    color: "Ivory",
    size: "M",
    measurements: null,
    changes: ["Short sleeves", "Longer length", "1 pocket", "Button closure"],
    freeformNotes: null,
  },
  {
    name: "Wrap Top",
    category: "Shirt",
    fabric: "Linen",
    color: "Burgundy",
    size: "S",
    measurements: null,
    changes: ["Long sleeves", "Normal length", "1 pocket", "Button closure"],
    freeformNotes: null,
  },
];

const pdf = await buildPdf({
  id: "bc7bbb09-0000-4000-8000-000000000000",
  createdAt: new Date("2026-08-24T09:00:00Z"),
  items,
});
fs.writeFileSync(out, pdf);
console.log(`${out}  ${(pdf.length / 1024).toFixed(0)}KB  ${items.length} garments`);
