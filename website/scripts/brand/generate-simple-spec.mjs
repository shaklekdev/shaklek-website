/**
 * The short spec. Two pages, for a supplier to quote from without asking.
 *
 *   node scripts/brand/generate-simple-spec.mjs      (run from website/)
 *
 * This replaces the long spec, which failed in a specific and repeatable way:
 * it described what each item MEANT instead of what to make, and it named a
 * bare logo file as the "File" for items whose artwork is a composed layout.
 * Ada opened shaklek-monogram.pdf looking for fibre content and wash symbols,
 * found a single letter, and could not design or price the care label.
 *
 * So the rules here are: one row per item, a real size, a real material, a
 * real quantity, and the exact file to print. No reasoning, no options, no
 * ranges, nothing a supplier has to interpret. It is an MVP, not a manual.
 *
 * Page 2 is a contact sheet of the files themselves, rendered from the real
 * PDFs at build time, so the picture and the filename can never disagree.
 */
import PDFDocument from "pdfkit";
import { createWriteStream, readFileSync, mkdtempSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

import { INK, GOLD, MUTED, HAIR, RED, PT, ARTWORK, drawLockup }
  from "./generate-quote-sheet.mjs";

const SUPPLIER_DIR = path.resolve(ARTWORK, "..");
const OUTFILE = path.join(os.homedir(), "Desktop", "Shaklek-packaging-spec.pdf");
const TMP = mkdtempSync(path.join(os.tmpdir(), "shaklek-spec-"));

/** Artwork lives either in artwork/ or one level up with the bare marks. */
function findPdf(stem) {
  for (const dir of [ARTWORK, SUPPLIER_DIR]) {
    const p = path.join(dir, `${stem}.pdf`);
    if (existsSync(p)) return p;
  }
  throw new Error(`cannot find ${stem}.pdf`);
}

function mmOf(stem) {
  const raw = readFileSync(findPdf(stem), "latin1");
  const m = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  if (!m) throw new Error(`${stem}.pdf has no readable MediaBox`);
  return [+m[1] / PT, +m[2] / PT];
}

function raster(stem) {
  const out = path.join(TMP, `${stem}.png`);
  execFileSync("sips", ["-s", "format", "png", "--out", out, "-Z", "1000", findPdf(stem)],
    { stdio: "ignore" });
  return out;
}

// ---------------------------------------------------------------- the spec
//
// Decisions already taken with Ada in WhatsApp, encoded here so they stop
// being re-litigated in chat:
//   27/08 — one-colour printing everywhere, gold kept only for the sticker
//   27/08 — silkscreen on the bag, no embroidery
//   28/08 — MOQ is 100 for the bag and 500 for everything else
//   28/08 — the bag is her stock 35 x 45 cm, natural, ribbon drawstring
// And one correction: the hang tag no longer carries an order reference. You
// cannot print a per-order number on 500 tags bought before those orders
// exist. Ada quoted item 3 against that stale line on 29/08.

const SPEC_RAW = [
  { n: "1", item: "Cotton bag", size: "35 x 45 cm", mat: "Natural cotton, ribbon drawstring",
    qty: "100", file: "shaklek-logo", checkSize: false,
    fileNote: "file is the LOGO - print it 110 mm wide",
    texture: "Undyed natural cotton, soft, not stiff. No coating.",
    inks: [["#1A1A1A", "Black - the only colour on this item"]],
    colour: "Black only, ONE colour",
    plain: "The logo file has a gold line in it — please print that line in BLACK, not gold. Silk-screen the logo on ONE side only. Logo 110 mm wide, centred, in the upper third of the bag. No embroidery.",
    note: "Silkscreen, one colour. Logo 110 mm wide, centred, in the upper third. No embroidery." },
  { n: "2", item: "Hand bag", size: "to fit 35 x 30 x 6 cm", mat: "Kraft card, rope or ribbon handle",
    qty: "100", file: "shaklek-logo", checkSize: false,
    fileNote: "file is the LOGO - print it 110 mm wide",
    texture: "Matt kraft, uncoated. Rope or ribbon handle, not plastic.",
    inks: [["#1A1A1A", "Black - the only colour on this item"]],
    colour: "Black only, ONE colour",
    plain: "The logo file has a gold line in it — please print that line in BLACK, not gold. The cotton bag goes inside this one. Please use your nearest stock size that fits — do not cut a custom size. Logo on one side, centred.",
    note: "The outer bag — the cotton bag goes inside it. Please use your nearest stock size that fits those contents; do not cut a custom size. Logo centred, one side." },
  { n: "2", item: "Woven brand label", size: "45 x 18 mm", mat: "Woven, single-sided",
    qty: "100", file: "01-woven-brand-label", checkSize: true,
    texture: "Soft woven ribbon, damask or satin. Not stiff taffeta - it sits against the neck.",
    inks: [["#1A1A1A", "Black - the wordmark"], ["#9C8445", "Gold - the rule"]],
    colour: "Black and gold, as in the file",
    plain: "Sewn inside the neck. Fold both short ends under and sew at each end. The 45 mm is what must be VISIBLE after folding, so weave it longer than 45 mm. Do NOT fold it in half. Nothing on the back.",
    note: "End fold: both short ends folded under, sewn at each end. 45 mm is the size AFTER folding — add the fold allowance to the woven length. Not folded in half." },
  { n: "3", item: "Care label", size: "25 x 45 mm", mat: "Printed satin",
    qty: "100", file: "02-care-label", checkSize: true,
    texture: "Soft printed satin ribbon. Seal the cut edges so they do not fray.",
    inks: [["#1A1A1A", "Black - all the text"], ["#B9B1A2", "Light grey - the two rules"]],
    colour: "Black and light grey, as in the file",
    plain: "Sewn into the side seam. Print the file exactly as it is — the Arabic is required by UAE law and it breaks if it is retyped. The ink must survive dry cleaning.",
    note: "Sewn into the side seam. Print the file exactly — the Arabic is required by UAE law and breaks if it is retyped. Ink must survive dry cleaning." },
  { n: "4", item: "Hang tag", size: "50 x 90 mm", mat: "Uncoated card 300 gsm, cotton string",
    qty: "100", file: "03-hang-tag  +  03b", checkSize: true, files: ["03-hang-tag", "03b-hang-tag-back"],
    texture: "Uncoated, matt, slightly textured. Not glossy, not laminated.",
    inks: [["#1A1A1A", "Black - wordmark and text"], ["#9C8445", "Gold - the rules"], ["#6D6659", "Grey - the web address"], ["#C9C0AE", "Pale - small mark on the back"]],
    colour: "Full colour, as in the file",
    plain: "Prints on BOTH sides — two different files. The 4.4 mm hole is already in the file. Please include a cotton string.",
    note: "Both sides print. The 4.4 mm hole is already in the file. Please include the string and quote it separately if it is extra." },
  { n: "5", item: "Thank-you card", size: "148 x 105 mm", mat: "Uncoated card 300 gsm",
    qty: "100", file: "04  +  05", checkSize: true, files: ["04-thank-you-card-front", "05-thank-you-card-back"],
    texture: "Uncoated, matt, natural white. Not glossy, not laminated.",
    inks: [["#1A1A1A", "Black - wordmark and headings"], ["#9C8445", "Gold - the rule"], ["#6D6659", "Grey - the message text"], ["#C9C0AE", "Pale - the small mark"]],
    colour: "Full colour, as in the file",
    plain: "Landscape: wider than it is tall. Prints on BOTH sides — two different files. Plain printing, no foil, no letterpress.",
    note: "Landscape. Both sides print. Plain printing is fine — no letterpress, no foil." },
  { n: "6", item: "Envelope", size: "162 x 114 mm", mat: "Uncoated paper, C6 wallet flap",
    qty: "100", file: "05b", checkSize: true, files: ["05b-thank-you-envelope-back"],
    texture: "Uncoated, matt, to match the card.",
    inks: [["#1A1A1A", "Black - the mark"], ["#B9B1A2", "Light grey - the fine line"]],
    colour: "Black, as in the file",
    plain: "The flap is on the LONG edge and opens along the top, like a greeting-card envelope. Only the back prints; the front is blank. The shaded triangle in the file is the flap and does not print.",
    note: "Wallet flap, hinged on the long edge. Only the back prints; the front is blank. In the file the tinted triangle is the flap and does not print." },
  { n: "7", item: "Business card", size: "90 x 50 mm", mat: "Uncoated card 350 gsm",
    qty: "100", file: "10  +  10b", checkSize: false, files: ["10-business-card-front", "10b-business-card-back"],
    fileNote: "file is 96 x 56 mm, includes 3 mm bleed - trim to 90 x 50",
    texture: "Uncoated, matt. Not glossy, not laminated.",
    inks: [["#1A1A1A", "Black - the front, printed edge to edge"], ["#F5F0E8", "Cream - the mark on the front"], ["#9C8445", "Gold - the rule"], ["#6D6659", "Grey - the small text"]],
    colour: "Full colour, as in the file",
    plain: "Prints on BOTH sides — two different files. The files are 96 x 56 mm because they include 3 mm extra all round for trimming. Cut to 90 x 50 mm.",
    note: "Both sides print. The files measure 96 x 56 mm because they include 3 mm bleed — trim to 90 x 50 mm." },
  { n: "8", item: "Tissue seal sticker", size: "40 mm circle", mat: "Matt sticker",
    qty: "100", file: "06-tissue-seal-40mm", checkSize: true, gold: true,
    texture: "Matt sticker paper. NOT glossy - a shiny sticker looks like a price label.",
    inks: [["#9C8445", "Gold - the background"], ["#F5F0E8", "Cream - the mark"]],
    colour: "Gold background, mark in cream",
    plain: "The ONLY item with gold: gold background, mark in cream. Matt finish, not shiny. It closes the tissue paper.",
    note: "THE ONLY GOLD ITEM: gold background, mark in cream. Matt, not gloss." },
  { n: "9", item: "Tissue wrap", size: "50 x 70 cm sheet", mat: "Unbleached tissue 17 gsm",
    qty: "100", file: "07-tissue-wrap-repeat-tile", checkSize: false,
    fileNote: "file is one 25 x 25 cm tile - repeat across the sheet",
    texture: "Thin unbleached tissue, natural colour, not white.",
    inks: [["#B3A78E", "Pale gold - everything, printed light"]],
    colour: "One pale gold, as in the file",
    plain: "The file is one 25 x 25 cm square. Repeat it across the whole sheet. Print it very light — it should look like a texture, not like printing.",
    note: "The file is one 25 x 25 cm tile. Repeat it across the sheet and keep it faint — it should look like texture, not print." },
];
export const SPEC = SPEC_RAW.map((r, i) => ({ ...r, n: String(i + 1) }));

/**
 * The filename each artwork file carries in the folder that goes to the
 * supplier. Numbered to match the item on the order sheet, because
 * "03-hang-tag.pdf" being item 5 is exactly the kind of lookup that made the
 * last document confusing.
 */
export function outName(r, i) {
  const slug = r.item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const n = String(r.n).padStart(2, "0");
  const files = r.files || [r.file];
  return files.length === 1 ? `${n}-${slug}.pdf` : `${n}-${slug}-${i === 0 ? "FRONT" : "BACK"}.pdf`;
}

/** A size printed here that disagrees with the file is the one error a
 *  supplier spends money on, so it is checked rather than trusted. */
function audit() {
  const bad = [];
  for (const r of SPEC) {
    for (const f of (r.files || [r.file])) {
      try { mmOf(f); } catch (e) { bad.push(e.message); continue; }
      if (!r.checkSize) continue;
      const [w, h] = mmOf(f);
      const m = r.size.match(/^([\d.]+) x ([\d.]+) mm$/);
      if (!m) continue;
      if (Math.abs(w - +m[1]) > 0.5 || Math.abs(h - +m[2]) > 0.5)
        bad.push(`${r.item}: says ${m[1]} x ${m[2]} mm, but ${f}.pdf is ${w.toFixed(1)} x ${h.toFixed(1)} mm`);
    }
  }
  if (bad.length) { console.error("\nRefusing to write:\n" + bad.map((b) => "  - " + b).join("\n") + "\n"); process.exit(1); }
}
import { pathToFileURL } from "node:url";
const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_MAIN) audit();

// -------------------------------------------------------------------- build

if (IS_MAIN) {
const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
doc.pipe(createWriteStream(OUTFILE));

// SPEC_ONLY=2 writes just the artwork page, so it can be rendered and checked
// (sips only ever rasterises page 1 of a PDF).
const ONLY = process.env.SPEC_ONLY ? Number(process.env.SPEC_ONLY) : 0;

const PLATES = [];
for (const r of SPEC) for (const f of (r.files || [r.file])) PLATES.push([r.n, f, r.gold]);


// ============================== page 1 ==============================
if (!ONLY || ONLY === 1) {
doc.addPage();
let y = 44;
y += drawLockup(doc, 297.6, y, 96) + 20;

doc.font("Helvetica-Bold").fontSize(17).fillColor(INK)
  .text("PACKAGING SPECIFICATION", 40, y, { width: 515, align: "center", characterSpacing: 1.3 });
y = doc.y + 4;
doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
  .text("Ten items. Everything you need to quote is on this page; the artwork is on page 2.",
    40, y, { width: 515, align: "center" });
y = doc.y + 16;

let fx = 40;
for (const [label, fw] of [["SUPPLIER", 250], ["DATE", 120], ["QUOTED IN", 145]]) {
  doc.font("Helvetica-Bold").fontSize(6).fillColor(MUTED).text(label, fx, y, { characterSpacing: 0.6 });
  doc.moveTo(fx, y + 17).lineTo(fx + fw - 14, y + 17).lineWidth(0.8).stroke(INK);
  fx += fw;
}
y += 30;

// the three rules
doc.rect(40, y, 515, 72).fillAndStroke("#FBEFED", RED);
doc.font("Helvetica-Bold").fontSize(8).fillColor(RED)
  .text("THREE RULES FOR EVERY ITEM", 52, y + 9, { characterSpacing: 0.6 });
const RULES = [
  ["1.", "Print the file exactly as it is. Please do not redraw, retype or re-set anything, in any language."],
  ["2.", "ONE COLOUR, BLACK, applies to items 1 and 2 only — the cotton bag and the hand bag. The logo file has a gold line in it; on those two print it black. Every other item prints exactly as its file, in full colour."],
  ["3.", "Send a photo or sample for approval before the full run."],
];
let ry = y + 23;
for (const [num, text] of RULES) {
  doc.font("Helvetica-Bold").fontSize(7.6).fillColor(INK).text(num, 52, ry);
  doc.font("Helvetica").fontSize(7.6).fillColor(INK).text(text, 66, ry, { width: 477, lineGap: 0.8 });
  ry = doc.y + 3;
}
y += 84;

// the table
const COLS = [["#", 16], ["ITEM", 92], ["SIZE", 74], ["MATERIAL", 106], ["QTY", 26],
  ["FILE TO PRINT", 86], ["UNIT PRICE", 56], ["TOTAL", 59]];
doc.rect(40, y, 515, 14).fill("#E9E2D4");
let cx = 40;
for (const [label, w] of COLS) {
  doc.font("Helvetica-Bold").fontSize(5.8).fillColor(MUTED)
    .text(label, cx + 4, y + 4.5, { width: w - 6, characterSpacing: 0.5 });
  cx += w;
}
y += 14;

for (const r of SPEC) {
  const H = 40;
  doc.rect(40, y, 515, H).fillAndStroke("#FFFFFF", HAIR);
  cx = 40;
  const cells = [r.n, r.item, r.size, r.mat, r.qty, r.file];
  cells.forEach((v, i) => {
    const w = COLS[i][1];
    doc.font(i === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(i === 5 ? 6.2 : 7.2)
      .fillColor(i === 0 ? MUTED : (r.gold && i === 1 ? GOLD : INK))
      .text(v, cx + 4, y + 6, { width: w - 7 });
    cx += w;
  });
  // the two empty boxes
  doc.rect(40 + 400 + 4, y + 5, COLS[6][1] - 8, 15).lineWidth(0.7).stroke("#BBB2A0");
  doc.rect(40 + 456 + 4, y + 5, COLS[7][1] - 8, 15).lineWidth(0.7).stroke("#BBB2A0");
  // the note, spanning
  doc.font("Helvetica").fontSize(6.4).fillColor(r.gold ? GOLD : MUTED)
    .text(r.note, 60, y + 24, { width: 480, lineGap: 0.5, ellipsis: true, height: 14 });
  y += H;
}

y += 10;
doc.font("Helvetica-Bold").fontSize(8).fillColor(INK).text("TOTAL", 40, y + 6);
doc.rect(96, y, 120, 21).lineWidth(0.9).stroke(INK);
doc.font("Helvetica-Bold").fontSize(7).fillColor(INK).text("SHIPPING TO DUBAI", 232, y + 2);
doc.rect(232, y + 11, 100, 15).lineWidth(0.8).stroke("#BBB2A0");
doc.font("Helvetica-Bold").fontSize(7).fillColor(INK).text("LEAD TIME", 348, y + 2);
doc.rect(348, y + 11, 100, 15).lineWidth(0.8).stroke("#BBB2A0");
doc.font("Helvetica-Bold").fontSize(7).fillColor(INK).text("MOQ", 464, y + 2);
doc.rect(464, y + 11, 91, 15).lineWidth(0.8).stroke("#BBB2A0");
y += 34;

doc.rect(40, y, 515, 44).fillAndStroke("#F1ECE1", HAIR);
doc.font("Helvetica-Bold").fontSize(7.6).fillColor(INK)
  .text("QUANTITY AND MINIMUMS", 52, y + 8, { characterSpacing: 0.5 });
doc.font("Helvetica").fontSize(7.4).fillColor(INK)
  .text("I am asking for 100 of each item. If 100 is below your minimum order, please tell me your " +
    "minimum and the price at that quantity, rather than leaving the item out. There is no courier " +
    "mailer on this list — the hand bag is the outer packaging.", 52, y + 20, { width: 491, lineGap: 1 });

doc.font("Helvetica").fontSize(6.4).fillColor(HAIR)
  .text("Shaklek · packaging specification · one page · " + new Date().toISOString().slice(0, 10),
    40, 806, { width: 515, align: "center" });

}

// ============================== page 2 ==============================
if (!ONLY || ONLY === 2) {
doc.addPage();
doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED)
  .text("SHAKLEK  ·  PACKAGING SPECIFICATION", 40, 28, { characterSpacing: 1.1 });
doc.font("Helvetica").fontSize(7).fillColor(MUTED)
  .text("The artwork", 40, 28, { width: 515, align: "right" });
doc.moveTo(40, 42).lineTo(555, 42).lineWidth(0.6).stroke(HAIR);

doc.font("Helvetica-Bold").fontSize(15).fillColor(INK)
  .text("THE ARTWORK", 40, 62, { characterSpacing: 1.1 });
doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
  .text("Every file, at its true shape. The number is the item on page 1. Print these as they are.",
    40, 82, { width: 515 });

const CW = 124, CH = 168, GAP = 4.75;
PLATES.forEach((p, i) => {
  const [num, stem, gold] = p;
  const col = i % 4, row = Math.floor(i / 4);
  const bx = 40 + col * (CW + GAP), by = 112 + row * CH;
  const [wmm, hmm] = mmOf(stem);
  const boxW = CW - 8, boxH = 108;
  const s = Math.min(boxW / wmm, boxH / hmm);
  const w = wmm * s, h = hmm * s;
  const ix = bx + (CW - w) / 2, iy = by + (boxH - h) / 2;
  doc.image(raster(stem), ix, iy, { width: w, height: h });
  doc.rect(ix, iy, w, h).lineWidth(0.6).stroke(HAIR);
  doc.circle(bx + 8, by + 6, 7).fill(gold ? GOLD : INK);
  doc.font("Helvetica-Bold").fontSize(7).fillColor("#FFFFFF")
    .text(num, bx + 1, by + 3.5, { width: 14, align: "center" });
  doc.font("Helvetica-Bold").fontSize(6.2).fillColor(INK)
    .text(stem + ".pdf", bx, by + boxH + 6, { width: CW, align: "center" });
  doc.font("Helvetica").fontSize(6.2).fillColor(MUTED)
    .text(`${+wmm.toFixed(1)} x ${+hmm.toFixed(1)} mm`, bx, by + boxH + 15, { width: CW, align: "center" });
});

doc.font("Helvetica").fontSize(6.4).fillColor(HAIR)
  .text("Rendered from the artwork files themselves. Production prints from the files, not from this page.",
    40, 806, { width: 515, align: "center" });

}

doc.end();
console.log(`Wrote ${OUTFILE}  (2 pages, ${SPEC.length} items, ${PLATES.length} artwork files)`);
}
