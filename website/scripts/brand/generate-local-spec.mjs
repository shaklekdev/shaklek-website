/**
 * The order sheet for the local Dubai supplier.
 *
 *   node scripts/brand/generate-local-spec.mjs      (run from website/)
 *
 * The two-page version was too hard to follow: the price table named a file,
 * and the picture of that file was on a different page, so every row meant a
 * lookup. Here each item carries its own picture, so nothing has to be matched
 * up and nothing has to be interpreted.
 *
 * One item per block: the picture, five facts, one plain sentence, and a box
 * for the price. Plain English throughout — no "C6", no "bleed", no "end fold"
 * without saying what it means. Everything is one colour except the sticker.
 *
 * The items, sizes and wording come from generate-simple-spec.mjs so this and
 * the supplier-comparison sheet can never disagree.
 */
import PDFDocument from "pdfkit";
import { createWriteStream, readFileSync, mkdtempSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

import { INK, GOLD, MUTED, HAIR, RED, PT, ARTWORK, drawLockup }
  from "./generate-quote-sheet.mjs";
import { SPEC, outName } from "./generate-simple-spec.mjs";

const SUPPLIER_DIR = path.resolve(ARTWORK, "..");
const OUTFILE = path.join(os.homedir(), "Desktop", "Shaklek-order-sheet.pdf");
const TMP = mkdtempSync(path.join(os.tmpdir(), "shaklek-local-"));
const QTY = 100;

function findPdf(stem) {
  for (const dir of [ARTWORK, SUPPLIER_DIR]) {
    const p = path.join(dir, `${stem}.pdf`);
    if (existsSync(p)) return p;
  }
  throw new Error(`cannot find ${stem}.pdf`);
}
function mmOf(stem) {
  const m = readFileSync(findPdf(stem), "latin1")
    .match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  if (!m) throw new Error(`${stem}.pdf has no readable MediaBox`);
  return [+m[1] / PT, +m[2] / PT];
}
function raster(stem) {
  const out = path.join(TMP, `${stem}.png`);
  execFileSync("sips", ["-s", "format", "png", "--out", out, "-Z", "1200", findPdf(stem)],
    { stdio: "ignore" });
  return out;
}

/** Colour is per item now: only the two screen-printed bags are flattened to
 *  one colour, because they are the only items where colour count costs money. */
const colourOf = (r) => r.colour;

// -------------------------------------------------------------------- build

const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
doc.pipe(createWriteStream(OUTFILE));

const ONLY = process.env.LOCAL_ONLY ? Number(process.env.LOCAL_ONLY) : 0;
let pageNo = 0;
function page(title) {
  doc.addPage(); pageNo++;
  doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED)
    .text("SHAKLEK  ·  ORDER SHEET", 40, 26, { characterSpacing: 1.1 });
  doc.font("Helvetica").fontSize(7).fillColor(MUTED)
    .text(title, 40, 26, { width: 515, align: "right" });
  doc.moveTo(40, 40).lineTo(555, 40).lineWidth(0.6).stroke(HAIR);
  doc.font("Helvetica").fontSize(7).fillColor("#C9C1B0")
    .text(String(pageNo), 40, 804, { width: 515, align: "center" });
}

// ============================ page 1: the rules ============================
if (!ONLY || ONLY === 1) {
page("Please read this page first");
let y = 62;
y += drawLockup(doc, 297.6, y, 104) + 22;

doc.font("Helvetica-Bold").fontSize(19).fillColor(INK)
  .text("ORDER SHEET", 40, y, { width: 515, align: "center", characterSpacing: 1.4 });
y = doc.y + 6;
doc.font("Helvetica").fontSize(9).fillColor(MUTED)
  .text(`${SPEC.length} items, ${QTY} pieces of each. Every item has its own page with a picture of ` +
    "exactly what to print.", 60, y, { width: 475, align: "center", lineGap: 2 });
y = doc.y + 22;

let fx = 40;
for (const [label, fw] of [["SUPPLIER", 250], ["DATE", 120], ["CONTACT", 145]]) {
  doc.font("Helvetica-Bold").fontSize(6).fillColor(MUTED).text(label, fx, y, { characterSpacing: 0.6 });
  doc.moveTo(fx, y + 17).lineTo(fx + fw - 14, y + 17).lineWidth(0.8).stroke(INK);
  fx += fw;
}
y += 36;

const RULES = [
  ["1", "PRINT THE FILES EXACTLY AS WE SEND THEM.",
   "Please do not redraw them, retype them, or set them again in your own fonts — in any language. If anything cannot be printed as it is, tell us and we will send a new file."],
  ["2", "ONE COLOUR APPLIES TO THE TWO BAGS ONLY.",
   "Items 1 and 2, the cotton bag and the hand bag, print in BLACK ONLY. The logo file has a gold line in it — on those two items please print that line in black. Every other item prints exactly as its file shows, in full colour."],
  ["3", `${QTY} PIECES OF EVERY ITEM.`,
   "If 100 is below your minimum for any item, please tell us your minimum and the price at that quantity — do not leave the item out."],
  ["4", "SEND A PHOTO OR A SAMPLE BEFORE THE FULL RUN.",
   "For every item. We have not held any of this yet, and something that looks right on a screen can look wrong on cloth or card."],
];
for (const [n, head, body] of RULES) {
  const h = 52;
  doc.rect(40, y, 515, h).fillAndStroke("#FBEFED", RED);
  doc.circle(58, y + 17, 9).fill(RED);
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#FFFFFF").text(n, 49, y + 13, { width: 18, align: "center" });
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(RED)
    .text(head, 76, y + 11, { width: 465, characterSpacing: 0.4 });
  doc.font("Helvetica").fontSize(7.8).fillColor(INK)
    .text(body, 76, y + 24, { width: 465, lineGap: 1.1 });
  y += h + 8;
}

y += 6;
doc.rect(40, y, 515, 54).fillAndStroke("#F1ECE1", HAIR);
doc.font("Helvetica-Bold").fontSize(8).fillColor(INK)
  .text("WHAT WE NEED BACK FROM YOU", 52, y + 10, { characterSpacing: 0.5 });
doc.font("Helvetica").fontSize(7.8).fillColor(INK)
  .text("A price per piece and a total for each item, your minimum where 100 is too few, how many days " +
    "from approval to delivery, and whether the price includes the string on the hang tag and the " +
    "handles on the hand bag.", 52, y + 24, { width: 491, lineGap: 1.2 });
}

// ============================ one page per item ============================
for (const r of SPEC) {
  if (ONLY && ONLY !== Number(r.n) + 1) continue;
  page(`Item ${r.n} of ${SPEC.length}`);

  doc.circle(56, 74, 14).fill(r.gold ? GOLD : INK);
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#FFFFFF")
    .text(r.n, 42, 67, { width: 28, align: "center" });
  doc.font("Helvetica-Bold").fontSize(24).fillColor(INK).text(r.item, 82, 62);
  doc.moveTo(40, 98).lineTo(555, 98).lineWidth(0.6).stroke(HAIR);

  // ---- the facts, left column
  let fy = 116;
  const fact = (k, v, sub) => {
    doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED)
      .text(k, 40, fy + 2, { width: 68, characterSpacing: 0.7 });
    doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(v, 112, fy, { width: 200 });
    fy = doc.y;
    if (sub) {
      doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(sub, 112, fy + 2, { width: 200, lineGap: 0.8 });
      fy = doc.y;
    }
    fy += 11;
  };
  fact("SIZE", r.size);
  fact("MATERIAL", r.mat, r.texture);
  fact("HOW MANY", `${QTY} pieces`);

  // ---- ink colours, right column, with a real swatch of each
  const ix = 340;
  doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED)
    .text("INK COLOURS", ix, 118, { characterSpacing: 0.7 });
  if (r.colour.startsWith("Black only"))
    doc.font("Helvetica-Bold").fontSize(7).fillColor(RED).text("ONE COLOUR ONLY", ix + 90, 118, { characterSpacing: 0.6 });
  let iy = 134;
  for (const [hex, what] of r.inks) {
    doc.rect(ix, iy, 15, 15).fillAndStroke(hex, "#B4AC9B");
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(hex, ix + 22, iy + 1, { width: 60 });
    doc.font("Helvetica").fontSize(7.6).fillColor(MUTED).text(what, ix + 22, iy + 10.5, { width: 190, lineGap: 0.6 });
    iy = Math.max(doc.y, iy + 19) + 6;
  }

  const noteY = Math.max(fy, iy) + 4;
  doc.rect(40, noteY, 515, 2).fill("#EFE9DC");
  doc.font("Helvetica").fontSize(9.5).fillColor(INK)
    .text(r.plain, 40, noteY + 12, { width: 515, lineGap: 2.2 });

  // ---- the artwork, big
  const files = r.files || [r.file];
  const top = Math.max(300, doc.y + 22), avail = 515, boxH = Math.min(300, 640 - top);
  const cellW = avail / files.length;
  files.forEach((stem, i) => {
    const [wmm, hmm] = mmOf(stem);
    const s = Math.min((cellW - 30) / wmm, boxH / hmm);
    const w = wmm * s, h = hmm * s;
    const x = 40 + i * cellW + (cellW - w) / 2, yy = top + (boxH - h) / 2;
    doc.image(raster(stem), x, yy, { width: w, height: h });
    doc.rect(x, yy, w, h).lineWidth(0.7).stroke(HAIR);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(INK)
      .text(files.length > 1 ? (i === 0 ? "FRONT" : "BACK") : "PRINT THIS FILE",
        40 + i * cellW, top + boxH + 10, { width: cellW, align: "center", characterSpacing: 0.6 });
    doc.font("Helvetica").fontSize(7.5).fillColor(MUTED)
      .text(outName(r, i), 40 + i * cellW, top + boxH + 22, { width: cellW, align: "center" });
  });

  // ---- price
  const py = 662;
  doc.rect(40, py, 515, 74).fillAndStroke("#FFFFFF", INK);
  const CELLS = [["PRICE PER PIECE (AED)", 0], ["TOTAL FOR 100 (AED)", 1], ["YOUR MINIMUM", 2], ["DAYS TO DELIVER", 3]];
  for (const [label, i] of CELLS) {
    const bw = 515 / 4, bx = 40 + i * bw;
    doc.font("Helvetica-Bold").fontSize(6.5).fillColor(MUTED)
      .text(label, bx + 10, py + 12, { width: bw - 20, characterSpacing: 0.5 });
    doc.rect(bx + 10, py + 26, bw - 20, 34).lineWidth(0.9).stroke("#9E9683");
  }

  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(MUTED).text("NOTES", 40, py + 86, { characterSpacing: 0.6 });
  doc.moveTo(40, py + 106).lineTo(555, py + 106).lineWidth(0.5).stroke(HAIR);
}

// ============================ totals ============================
if (!ONLY || ONLY === SPEC.length + 2) {
page("Total");
let y = 66;
doc.font("Helvetica-Bold").fontSize(16).fillColor(INK).text("THE WHOLE ORDER", 40, y, { characterSpacing: 1.2 });
y = doc.y + 4;
doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
  .text(`${QTY} pieces of every item.`, 40, y);
y = doc.y + 14;

const COLS = [["#", 22], ["ITEM", 168], ["SIZE", 118], ["QTY", 34], ["PRICE / PIECE", 86], ["TOTAL", 87]];
doc.rect(40, y, 515, 16).fill("#E9E2D4");
let cx = 40;
for (const [label, w] of COLS) {
  doc.font("Helvetica-Bold").fontSize(6.2).fillColor(MUTED)
    .text(label, cx + 5, y + 5, { width: w - 8, characterSpacing: 0.5 });
  cx += w;
}
y += 16;
for (const r of SPEC) {
  doc.rect(40, y, 515, 26).fillAndStroke("#FFFFFF", HAIR);
  cx = 40;
  [r.n, r.item, r.size, String(QTY)].forEach((v, i) => {
    doc.font(i === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(8.4)
      .fillColor(i === 0 ? MUTED : INK).text(v, cx + 5, y + 8.5, { width: COLS[i][1] - 8 });
    cx += COLS[i][1];
  });
  // boxes sit under their own headings: widths accumulate, they are not guessed
  const xPrice = 40 + COLS.slice(0, 4).reduce((a, c) => a + c[1], 0);
  const xTotal = xPrice + COLS[4][1];
  doc.rect(xPrice + 5, y + 5, COLS[4][1] - 10, 16).lineWidth(0.7).stroke("#BBB2A0");
  doc.rect(xTotal + 5, y + 5, COLS[5][1] - 10, 16).lineWidth(0.7).stroke("#BBB2A0");
  y += 26;
}
y += 14;
doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text("ORDER TOTAL", 40, y + 9);
doc.rect(150, y, 160, 30).lineWidth(1.1).stroke(INK);
doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED).text("DAYS TO DELIVER EVERYTHING", 330, y + 2, { characterSpacing: 0.5 });
doc.rect(330, y + 14, 225, 22).lineWidth(0.9).stroke("#9E9683");
y += 52;

doc.rect(40, y, 515, 58).fillAndStroke("#F1ECE1", HAIR);
doc.font("Helvetica-Bold").fontSize(8).fillColor(INK)
  .text("IF ANYTHING HERE IS NOT CLEAR", 52, y + 10, { characterSpacing: 0.5 });
doc.font("Helvetica").fontSize(7.8).fillColor(INK)
  .text("Please ask before you print rather than deciding for us. Every item on this sheet has been " +
    "made once already as a file, so if something does not work for your machines we can change the " +
    "file — but only if we know.", 52, y + 24, { width: 491, lineGap: 1.2 });
}

doc.end();
console.log(`Wrote ${OUTFILE}  (${pageNo} pages, ${SPEC.length} items at ${QTY} each)`);
