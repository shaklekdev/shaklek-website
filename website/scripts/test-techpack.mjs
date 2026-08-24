// Assert on what the tech pack actually PRINTS.
//
// The old spec sheet rendered fine and still told the tailor "Standard M" and
// nothing else. "It produced a PDF" is not verification -- these are the
// specific facts a wrong tech pack gets wrong, and each one costs a remake.
//
// Run: npx tsx scripts/test-techpack.mjs
import { buildPdf } from "../src/lib/techPack.ts";
import { SIZE_CHART } from "../src/data/sizeChart.ts";

// pdfkit writes text as hex strings inside TJ arrays -- <5348414b4c454b> -- not
// as literal (...) Tj. The standard-14 fonts used here are not embedded, so
// those bytes are the font's WinAnsi encoding, which is ASCII plus a handful of
// remapped punctuation.
const WINANSI = { 0x91: "\u2018", 0x92: "\u2019", 0x93: "\u201c", 0x94: "\u201d", 0x95: "\u2022", 0x96: "\u2013", 0x97: "\u2014" };

function textOf(pdf) {
  const raw = pdf.toString("latin1");
  const out = [];
  for (const seg of raw.matchAll(/\[([^\]]*)\]\s*TJ|<([0-9a-fA-F]+)>\s*Tj/g)) {
    const body = seg[1] ?? `<${seg[2]}>`;
    let line = "";
    for (const h of body.matchAll(/<([0-9a-fA-F]+)>/g)) {
      const hex = h[1];
      for (let i = 0; i + 1 < hex.length; i += 2) {
        const code = parseInt(hex.slice(i, i + 2), 16);
        line += WINANSI[code] ?? String.fromCharCode(code);
      }
    }
    if (line) out.push(line);
  }
  return out.join("\n");
}

const REF = "BC7BBB09";

// A phrase that wraps in the PDF arrives as two text runs, so a plain
// `includes` on a sentence fails for a line break rather than for a missing
// sentence. Collapse whitespace before matching prose.
const says = (text, phrase) =>
  text.replace(/\s+/g, " ").includes(phrase.replace(/\s+/g, " "));
const base = {
  id: "bc7bbb09-0000-4000-8000-000000000000",
  createdAt: new Date("2026-08-24T09:00:00Z"),
};

let fail = 0;
const check = (cond, msg) => {
  if (!cond) { console.error(`FAIL: ${msg}`); fail++; }
};

// --- 1. a standard-size order must print the real numbers, not just a letter
const M = SIZE_CHART.find((r) => r.size === "M");
let t = textOf(await buildPdf({
  ...base,
  items: [{
    name: "Oversized Shirt", category: "Shirt", fabric: "Cotton", color: "Ivory",
    size: "M", measurements: null,
    changes: ["Short sleeves", "Longer length", "1 pocket", "Button closure"],
    freeformNotes: null,
  }],
}, { compress: false }));

check(t.includes("STANDARD SIZE M"), "standard size heading missing");
check(t.includes(`${M.bust} cm`), `bust ${M.bust}cm from the size chart is not printed`);
check(t.includes(`${M.waist} cm`), `waist ${M.waist}cm from the size chart is not printed`);
check(t.includes(`${M.hip} cm`), `hip ${M.hip}cm from the size chart is not printed`);
check(t.includes(`${M.eu} / ${M.uk} / ${M.us}`), "EU/UK/US conversion is not printed");
check(says(t, "BODY measurements"), "the body-vs-garment caveat is missing");
// The cut the customer chose must appear as construction language.
check(t.includes("Short sleeve"), "the ordered sleeve length is not described");
check(t.includes("Extended body length"), "the ordered garment length is not described");
// Premium sliders are committed at their default and must still reach the tailor.
check(t.includes("One patch chest pocket"), "the committed pocket choice is not printed");
check(says(t, "Button closure through the full front placket"), "the committed closure is not printed");
// Founder decision 2026-08-24: the 11 ruled blanks are gone. They asked the
// workshop for data Shaklek does not hold, on every order, forever -- and no
// tailor ever asked for them. The pack is only what to make now.
for (const gone of ["SEAM ALLOWANCE", "STITCH DENSITY", "TOLERANCE", "MAKING STANDARD", "SIGN-OFF", "INTERFACING", "CUT BY"])
  check(!t.includes(gone), `removed blank came back: ${gone}`);
// The original rule still holds, and matters more now that the prompt to supply
// a real standard is gone: never print a made-up one.
check(!/seam allowance[^\n]*\d\s*cm/i.test(t), "a seam allowance NUMBER was invented");
check(!/stitch density[^\n]*\d/i.test(t), "a stitch density NUMBER was invented");

// --- 2. identical lines group as one instruction, not repeated pages
const shirt = {
  name: "Oversized Shirt", category: "Shirt", fabric: "Cotton", color: "Ivory",
  size: "M", measurements: null,
  changes: ["Short sleeves", "Longer length", "1 pocket", "Button closure"],
  freeformNotes: null,
};
t = textOf(await buildPdf({ ...base, items: [shirt, shirt, shirt] }, { compress: false }));
check(t.includes("CUT 3"), "three identical garments did not group into CUT 3");
check((t.match(/CUT 3/g) ?? []).length === 1, "the same spec was printed more than once");
// Three identical shirts are ONE spec, so there is no cover page (founder
// decision 2026-08-24: a cover indexing a single item just repeats it). "CUT 3"
// is what tells the tailor to make three, and it must survive losing the cover.
check(!t.includes("WHAT TO MAKE"), "a single-spec order should not get a cover page");
check(t.includes("TECHNICAL PACK"), "the spec page must still say what the document is");
// The instructions the cover used to carry have to survive on the spec page.
check(says(t, `Quote reference ${REF}`), "the reference instruction was lost with the cover");
check(says(t, "no customer name, contact or address by design"),
  "the no-identity statement was lost with the cover");

// A multi-item order DOES keep its cover, where an index earns its page.
const trousers = {
  name: "Cargo Trousers", category: "Pants", fabric: "Linen", color: "Navy",
  size: "M", measurements: null,
  changes: ["Wide leg", "Cropped length", "Normal waist", "Button fly", "Pockets"],
  freeformNotes: null,
};
const multi = textOf(await buildPdf({ ...base, items: [shirt, trousers] }, { compress: false }));
check(multi.includes("WHAT TO MAKE"), "a two-spec order lost its cover index");
check(multi.includes("2 garments"), "the cover does not report 2 garments");
check(multi.includes("SPEC 1 OF 2") && multi.includes("SPEC 2 OF 2"), "spec numbering is wrong");

// --- 3. a tailored order cuts to the numbers, and says so
t = textOf(await buildPdf({
  ...base,
  items: [{
    name: "Cargo Trousers", category: "Pants", fabric: "Linen", color: "Navy",
    size: null,
    measurements: "Bust / chest: 88cm, Waist: 71cm, Hip: 97cm, Height: 168cm, looser through the hip",
    changes: ["Wide leg", "Cropped length", "Normal waist", "Button fly", "Pockets"],
    freeformNotes: "Keep the side pockets flat.",
  }],
}, { compress: false }));
check(t.includes("TAILORED TO MEASURE"), "tailored heading missing");
for (const v of ["88 cm", "71 cm", "97 cm", "168 cm"])
  check(t.includes(v), `tailored measurement ${v} is not printed`);
check(t.includes("looser through the hip"), "the customer's fit note was dropped");
check(t.includes("Keep the side pockets flat."), "the customer's request was dropped");
check(says(t, "Cut to the numbers above, not to this size"),
  "the nearest-size cross-check is not marked as advisory");
check(t.includes("Wide leg"), "the ordered leg width is not described");
check(t.includes("Cargo side pockets"), "the garment's defining detail is missing");
// A front page must not instruct the tailor to draw back-only details.
check(says(t, "Simple welt back pockets"), "the back pocket detail is missing entirely");

// --- 4. no customer identity ever reaches the tailor
const pii = ["tlohinada", "@", "Dubai", "+971"];
for (const p of pii)
  check(!t.includes(p), `possible customer identity leaked into the tech pack: ${p}`);

// --- 5. no BRAND identity either. Founder decision 2026-08-24: the workshop
// makes the pieces, it is not handed the label they carry. A forwarded or
// subcontracted pack must not be traceable back, or usable to advertise whose
// line it is. Checked on the rendered text, not on the source.
for (const brand of ["Shaklek", "SHAKLEK", "shaklek", "SHK-"])
  check(!t.includes(brand), `brand name leaked into the tech pack: ${brand}`);
// And in the metadata, which travels with the file and is invisible on screen.
const meta = (await buildPdf({ ...base, items: [shirt] }, { compress: false })).toString("latin1");
for (const brand of ["Shaklek", "SHAKLEK", "shaklek"])
  check(!meta.includes(brand), `brand name leaked into PDF metadata: ${brand}`);

console.log(fail === 0 ? "ok — tech pack prints the right numbers, groups correctly, invents nothing" : `${fail} failure(s)`);
process.exit(fail === 0 ? 0 : 1);
