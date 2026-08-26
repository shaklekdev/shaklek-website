// The four sample sets to order from a new tailor before selling.
//
//   npx tsx scripts/render-sample-sets.mjs                 # standard sizes
//   npx tsx scripts/render-sample-sets.mjs "Bust / chest: 88cm, Waist: 71cm, Hip: 97cm, Height: 168cm"
//
// Pass your own measurements and SET 1 becomes a tailored pack instead of a
// standard size one, so the fit test is on a real body.
//
// Why these four, and not four favourites. Each set isolates ONE question, and
// between them they cover all eight garments, all four colours, both fabrics
// and both fit modes. Every render-tier option value appears at least once, so
// the tailor is also being asked whether he reads the spec rather than making
// the same garment four times.
//
// ALL FOUR ARE LINEN. Founder, 2026-08-25: organic cotton is not sourced yet.
// That costs SET 2 a little of its design, since cotton was chosen there to be
// the forgiving variable while the size chart was under test. Navy linen is
// still the most forgiving combination available, so the set keeps its purpose,
// but if a seam looks poor on set 2 it is now worth asking whether it is the
// pattern or the cloth before concluding the chart is wrong.
//
//   SET 1  hardest construction, least forgiving colour
//   SET 2  the size chart itself, with every other variable made as easy as possible
//   SET 3  the details that are easy to fake
//   SET 4  drape, which seams cannot fix
import fs from "node:fs";
import { buildPdf } from "../src/lib/techPack.ts";

const measurements = process.argv[2] ?? null;

// Founder, 2026-08-25: all four sets are size S and all are for her to wear.
//
// sizeChart.ts carries bust, waist and hip and NO HEIGHT and no inside leg, so
// on a standard size "Full length" and "Cropped length" are undefined and the
// tailor would be guessing. Her height is therefore added to every note. Weight
// is deliberately not passed on: nobody cuts to weight, and it would be a
// personal detail travelling to an outside workshop for no benefit.
const WEARER_HEIGHT_CM = 168;
const HEIGHT_NOTE =
  `All four sets are size S for one person, ${WEARER_HEIGHT_CM}cm tall. ` +
  `Our size chart carries no height, so please cut every trouser length to that.`;
const OUT = "/Users/nadatlohi/Desktop/Shaklek/brand-assets/tailor-samples";

const SETS = [
  {
    id: "1",
    question: "Can he do patch pockets, in the fabric that forgives nothing",
    // Founder pairing, 2026-08-25: utility shirt with cargo trousers, in one
    // colour. It also happens to be the strongest test in the set: four patch
    // pockets across two garments, all of which must sit flat and match, on the
    // fabric and the colour that hide nothing. Plus a wide leg that must not
    // taper, which is exactly what went wrong repeatedly in our own renders.
    fabric: "linen",
    color: "Ivory",
    size: measurements ? null : "S",
    measurements,
    items: [
      ["Utility Shirt", "Shirt", ["Short sleeves", "Normal length", "2 pockets", "Button closure"]],
      ["Cargo Trousers", "Pants", ["Wide leg", "Cropped length", "Normal waist", "Button fly", "Pockets"]],
    ],
    notes:
      "First sample set. The shirt takes two square patch pockets on the CHEST and none on the back, and its waist tie is cut from the same cloth as the shirt. On the trousers, keep the cargo pockets flat against the leg and matched left to right, and the leg must not taper at the hem.",
  },
  {
    id: "2",
    question: "Does our size chart match a real garment",
    // Everything else is made as easy as possible: navy hides small flaws and
    // both garments are the default cut. Anything wrong here points at the
    // PATTERN or the CHART rather than the difficulty. This is the set you
    // measure with a tape when it arrives.
    fabric: "linen",
    color: "Navy",
    size: "S",
    measurements: null,
    items: [
      ["Oversized Shirt", "Shirt", ["Long sleeves", "Normal length", "1 pocket", "Button closure"]],
      ["Wide-leg Trousers", "Pants", ["Straight leg", "Full length", "Normal waist", "Button fly", "Pockets"]],
    ],
    notes:
      "Please cut this set strictly to the body measurements printed here, with your normal ease. We are checking our size chart against a finished garment, so tell us where you had to deviate.",
  },
  {
    id: "3",
    question: "Does he follow the spec, or make what he usually makes",
    // Founder pairing: structured blouse with banded trousers, the tailored
    // half of the catalog. Every element is one a tailor could substitute with
    // his own habit: a gathered cuff instead of a flat turned-up one, a stack
    // of side darts instead of a single bust dart pair, a dropped shoulder
    // instead of a set-in sleeve. White linen makes any of it obvious.
    fabric: "linen",
    color: "White",
    size: measurements ? null : "S",
    measurements,
    items: [
      ["Structured Blouse", "Shirt", ["Long sleeves", "Normal length", "1 pocket", "Button closure"]],
      ["Banded Trousers", "Pants", ["Straight leg", "Cropped length", "High waist", "Zip fly", "Pockets"]],
    ],
    notes:
      "The trouser hem must be a flat turned-up cuff, not gathered and not elasticated. The blouse takes ONE bust dart pair only, no princess seam and no stacked side darts, with the sleeve set in at the natural shoulder.",
  },
  {
    id: "4",
    question: "Does it hang right, which no amount of neat stitching fixes",
    // A wrap front and released pleats are about drape and grain, not seams,
    // and linen drapes very differently from cotton, so this is the set that
    // says whether these two shapes work in the only fabric currently sourced.
    // Burgundy also tests dye consistency across two pieces cut from one cloth.
    fabric: "linen",
    color: "Burgundy",
    size: measurements ? null : "S",
    measurements,
    items: [
      ["Wrap Top", "Shirt", ["Long sleeves", "Normal length", "1 pocket", "Button closure"]],
      ["Pleated Trousers", "Pants", ["Wide leg", "Full length", "Normal waist", "Button fly", "Pockets"]],
    ],
    notes:
      "Both pieces should be cut from the same roll so the colour matches. The trouser pleats should be pressed only at the top and fall open below.",
  },
];

fs.mkdirSync(OUT, { recursive: true });

for (const set of SETS) {
  const pdf = await buildPdf({
    // A recognisable reference per set. These are samples, not customer orders.
    id: `5a5b1e0${set.id}-0000-4000-8000-00000000000${set.id}`,
    createdAt: new Date("2026-08-25T09:00:00Z"),
    items: set.items.map(([name, category, changes]) => ({
      name,
      category,
      fabric: set.fabric,
      color: set.color,
      size: set.size,
      measurements: set.measurements,
      changes,
      freeformNotes: `${HEIGHT_NOTE} ${set.notes}`,
    })),
  });
  const file = `${OUT}/set-${set.id}.pdf`;
  fs.writeFileSync(file, pdf);
  console.log(
    `SET ${set.id}  ${set.fabric.padEnd(6)} ${set.color.padEnd(9)} ` +
      `${set.measurements ? "tailored" : "size " + set.size}  ` +
      `${set.items.map((i) => i[0]).join(" + ")}`,
  );
  console.log(`         ${set.question}`);
}
// One combined pack as well, because four attachments on WhatsApp is four
// chances to open the wrong one. Each garment's note names its set, so the
// grouping survives being flattened into a single document.
const combined = await buildPdf({
  id: "5a5b1e00-0000-4000-8000-000000000000",
  createdAt: new Date("2026-08-25T09:00:00Z"),
  items: SETS.flatMap((set) =>
    set.items.map(([name, category, changes]) => ({
      name,
      category,
      fabric: set.fabric,
      color: set.color,
      size: set.size,
      measurements: set.measurements,
      changes,
      freeformNotes: `SET ${set.id} OF 4. ${HEIGHT_NOTE} ${set.notes}`,
    })),
  ),
});
const allFile = `${OUT}/all-four-sets.pdf`;
fs.writeFileSync(allFile, combined);

console.log(`\n${SETS.length} separate packs and one combined -> ${OUT}`);
console.log(`combined: ${allFile}  ${(combined.length / 1024).toFixed(0)}KB`);
