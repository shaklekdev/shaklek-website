// Generate the technical flats for the tech pack.
//
//   npx tsx scripts/catalog/run-flats.mjs --items cargo-trousers      # prove one
//   npx tsx scripts/catalog/run-flats.mjs                             # all eight
//   npx tsx scripts/catalog/run-flats.mjs --dry                       # cost only
//
// One flat per (item, combination, view). Colour is deliberately not part of
// the key -- a line drawing has no colourway -- so this is 64 images rather
// than the 256 the photography needed. Every flat is generated from the NAVY
// photograph of that exact combination: navy gives the strongest silhouette
// against the studio backdrop, and conditioning on the real photo means the
// flat inherits the hem length and leg width that were actually shot instead
// of whatever the model imagines "wide cropped" means.
//
// The combination is resolved with the same fallback chain the spec sheet's
// imagesFor() uses (comboImages -> colorImages -> item.image), so a flat and a
// photograph on the same page can never disagree about what was ordered.
import fs from "node:fs";
import path from "node:path";
import { catalog } from "../../src/data/catalog.ts";
import { renderParamsForCategory } from "../../src/data/parameterSliders.ts";
import { constructionFor, noteForOption } from "../../src/data/construction.ts";
import { generateFlat } from "./gen-flat.mjs";
import { flatFileName } from "../../src/data/flats.ts";

const FLASH = "gemini-2.5-flash-image";
const PRO = "gemini-3-pro-image";
const COST = { [FLASH]: 0.039, [PRO]: 0.134 };
const OUT_DIR = "public/catalog/flats";

const argv = process.argv.slice(2);
const only = argv.includes("--items")
  ? argv[argv.indexOf("--items") + 1].split(",")
  : null;
const dry = argv.includes("--dry");
const force = argv.includes("--force");

// The Wrap Top's front genuinely is asymmetric -- it wraps left over right --
// so the symmetry check would reject a correct drawing. Everything else here
// is a symmetric garment.
const ASYMMETRIC_FRONT = new Set(["wrap-top"]);

function buildPrompt({ item, comboKey, view }) {
  const c = constructionFor(item.slug);
  const params = renderParamsForCategory(item.category);
  const values = comboKey.split(":");

  const cut = params
    .map((p, i) => noteForOption(item.category, p.type, values[i]))
    .filter(Boolean);

  // Only the details that belong on this view -- an untagged detail is on
  // both. Without the filter the front flat gets told to draw the welt back
  // pockets, and the model obliges.
  const pinned = c.details
    .filter((d) => !d.view || d.view === view)
    .map((d) => `- ${d.text}`)
    .join("\n");

  const viewLine =
    view === "front"
      ? "Front view of the garment."
      : "Back view of the garment. Draw the back panel as photographed — no front placket, no front opening and no front pockets on this drawing.";

  const symmetryLine =
    view === "front" && ASYMMETRIC_FRONT.has(item.slug)
      ? "Draw the wrap front exactly as photographed — it is asymmetric by design, do not straighten it into a symmetric front."
      : "Draw the garment symmetrically, left side mirroring right.";

  // The model is styled in the photograph: every Banded Trousers shot has her
  // in a peplum top, and the shirts are shot over trousers. One flat drew the
  // whole outfit -- faithfully, because nothing told it not to. None of the
  // image checks can see this: a second garment is achromatic, on white,
  // symmetric, and lands in the normal ink band. It has to be said in words.
  const onlyThis =
    item.category === "Pants"
      ? "The model in the photograph is also wearing a top. Draw ONLY the trousers. No top, no blouse, no shirt, no sleeves, no peplum, no bodice — nothing above the waistband. The waistband is the highest thing on the drawing."
      : "The model in the photograph is also wearing trousers or a skirt. Draw ONLY the upper garment. Nothing below its hem — no trousers, no legs, no skirt.";

  return `A technical flat sketch (a fashion CAD flat) of the garment worn in this photograph.

Draw the garment as if it were laid flat and open on a pure white surface, photographed straight on from directly above. ${viewLine}

DRAWING STYLE: pure black line art on a pure white background. Clean outlines of uniform weight. Interior construction lines for every seam, dart, pleat, pocket, cuff, collar, placket, waistband and hem. Short evenly spaced parallel dashes to indicate topstitching.

REMOVE COMPLETELY: the person, her head, hair, face, arms, hands, legs, feet and shoes; the studio backdrop; every shadow, every gradient, every tone of shading; all colour; all fabric texture and all fabric folds. The inside of the garment must be left PURE WHITE -- do not fill the garment shape with grey, with black, or with any tone at all. This is an outline drawing, not a filled silhouette. The finished drawing contains nothing but the garment's outline and its construction lines on white. No mannequin, no dress form, no hanger, no human figure of any kind.

THE GARMENT: ${c.silhouette}.

${onlyThis}

These details must appear on the drawing:
${pinned}

CUT AS ORDERED — the drawing must match this exactly:
${cut.map((n) => `- ${n}`).join("\n")}

${symmetryLine} Keep the garment's proportions exactly as photographed: the same hem length relative to the garment's total length, and the same width through the body and through the ${item.category === "Pants" ? "leg" : "sleeve"}. Reproduce this garment, not a different style.

LENGTH IS NOT DECORATIVE — it is the thing being specified. Measure the hem in the photograph against the body and reproduce that exact proportion. A cropped garment must come out visibly, obviously shorter than a full-length one; if the two are hard to tell apart, the drawing is wrong.`;
}

function jobs() {
  const out = [];
  for (const item of catalog) {
    if (only && !only.includes(item.slug)) continue;
    const params = renderParamsForCategory(item.category);
    if (!params.length) continue;
    const combos = params
      .reduce((acc, p) => acc.flatMap((a) => p.options.map((o) => [...a, o.value])), [[]])
      .map((v) => v.join(":"));
    for (const comboKey of combos) {
      const byCombo = item.comboImages?.Navy?.[comboKey];
      const byColor = item.colorImages?.Navy;
      for (const view of ["front", "back"]) {
        const src =
          byCombo?.[view] ?? byColor?.[view] ?? (view === "front" ? item.image : item.backImage);
        out.push({
          slug: item.slug,
          comboKey,
          view,
          inputPath: src ? path.join("public", src) : null,
          outputPath: path.join(OUT_DIR, flatFileName(item.slug, comboKey, view)),
          symmetric: !(view === "front" && ASYMMETRIC_FRONT.has(item.slug)),
          prompt: buildPrompt({ item, comboKey, view }),
        });
      }
    }
  }
  return out;
}

const all = jobs();
const missing = all.filter((j) => !j.inputPath || !fs.existsSync(j.inputPath));
const todo = all.filter(
  (j) => !missing.includes(j) && (force || !fs.existsSync(j.outputPath)),
);

console.log(`${all.length} flats in scope · ${all.length - todo.length - missing.length} already generated · ${todo.length} to generate`);
if (missing.length) {
  console.error(`\n${missing.length} have no source photograph and are SKIPPED:`);
  for (const m of missing) console.error(`  ${m.slug} ${m.comboKey} ${m.view}`);
}
console.log(
  `Estimated cost if every one lands first try: $${(todo.length * COST[FLASH]).toFixed(2)} (Flash).`,
);

if (dry || !todo.length) {
  if (dry && todo[0]) console.log(`\n--- sample prompt (${todo[0].slug} ${todo[0].comboKey} ${todo[0].view}) ---\n${todo[0].prompt}`);
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let flash = 0,
  pro = 0,
  failed = [];

for (const [i, job] of todo.entries()) {
  console.log(`\n[${i + 1}/${todo.length}] ${job.slug} ${job.comboKey} ${job.view}`);
  flash++;
  let res = await generateFlat({ ...job, model: FLASH });
  if (!res.ok) {
    // Escalate rather than re-wording: two identical failures means the
    // approach is wrong, not the prompt (CLAUDE.md section 7).
    console.log("  escalating to Pro");
    pro++;
    res = await generateFlat({ ...job, model: PRO, maxAttempts: 2 });
  }
  if (!res.ok) failed.push(`${job.slug} ${job.comboKey} ${job.view}`);
}

const spent = flash * COST[FLASH] * 3 + pro * COST[PRO] * 2; // upper bound: every attempt used
console.log(
  `\ndone · ${todo.length - failed.length}/${todo.length} generated · ${flash} Flash job(s), ${pro} Pro escalation(s) · at most $${spent.toFixed(2)}`,
);
if (failed.length) {
  console.error(`FAILED:\n  ${failed.join("\n  ")}`);
  process.exit(1);
}
