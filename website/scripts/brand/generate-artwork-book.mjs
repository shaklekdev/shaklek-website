/**
 * Every artwork file and its spec, in one document.
 *
 *   node scripts/brand/generate-artwork-book.mjs      (run from website/)
 *
 * All thirteen artwork PDFs, in item order, each shown at its true aspect
 * ratio with the finishing spec, the questions to ask and a box to write the
 * price in. One thing to print and take into a meeting.
 *
 * ⚠️ THE IMAGES HERE ARE RASTERISED PREVIEWS, NOT PRODUCTION ARTWORK. They are
 * rendered from the real PDFs at build time so this document cannot show a
 * mark the artwork does not have — the whole reason it exists is that a
 * hand-drawn impression of the seal and the tissue wrap had them the wrong way
 * round on 2026-08-29. A supplier still prints from artwork/, never from here.
 *
 * Item data, wording and the size audit are imported from
 * generate-quote-sheet.mjs so the two documents cannot say different things.
 */
import PDFDocument from "pdfkit";
import { createWriteStream, readFileSync, mkdtempSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

import {
  INK, GOLD, MUTED, HAIR, CREAM, RED, PAPER,
  PT, QTY, ITEMS, ARTWORK, auditSizes,
  drawLockup, priceRow, bullets, pageFrame, checkList,
  SW, EVERYTHING, ASK, NEVER, OPEN,
} from "./generate-quote-sheet.mjs";

const OUTFILE = path.join(os.homedir(), "Desktop", "Shaklek-artwork-and-specs.pdf");
const TMP = mkdtempSync(path.join(os.tmpdir(), "shaklek-book-"));

// ------------------------------------------------- rasterise the artwork once

/** True finished size of an artwork file, read from its MediaBox. */
function mmOf(stem) {
  const raw = readFileSync(path.join(ARTWORK, `${stem}.pdf`), "latin1");
  const m = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  if (!m) throw new Error(`${stem}.pdf has no readable MediaBox`);
  return [+m[1] / PT, +m[2] / PT];
}

function raster(stem) {
  const out = path.join(TMP, `${stem}.png`);
  execFileSync("sips", ["-s", "format", "png", "--out", out, "-Z", "1500",
    path.join(ARTWORK, `${stem}.pdf`)], { stdio: "ignore" });
  if (!existsSync(out)) throw new Error(`could not rasterise ${stem}.pdf`);
  return out;
}

/** Place an image inside a box at its true aspect ratio, with a hairline. */
function plate(doc, stem, box, caption) {
  const [wmm, hmm] = mmOf(stem);
  const s = Math.min(box.w / wmm, box.h / hmm);
  const w = wmm * s, h = hmm * s;
  const x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2;
  doc.image(raster(stem), x, y, { width: w, height: h });
  doc.rect(x, y, w, h).lineWidth(0.7).stroke(HAIR);
  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(INK)
    .text(`${stem}.pdf`, box.x, box.y + box.h + 6, { width: box.w, align: "center" });
  doc.font("Helvetica").fontSize(6.5).fillColor(MUTED)
    .text(`${(+wmm.toFixed(1))} x ${(+hmm.toFixed(1))} mm${caption ? "   ·   " + caption : ""}`,
      box.x, box.y + box.h + 15, { width: box.w, align: "center" });
}

const FACE = {
  "03-hang-tag": "FRONT", "03b-hang-tag-back": "BACK",
  "04-thank-you-card-front": "FRONT", "05-thank-you-card-back": "BACK",
  "10-business-card-front": "FRONT, with bleed", "10b-business-card-back": "BACK, with bleed",
  "08-linen-bag-print": "print area guide", "09-mailer-placement": "placement guide",
  "07-tissue-wrap-repeat-tile": "one tile of a 500 x 700 sheet",
  "05b-thank-you-envelope-back": "tinted triangle is the flap, does not print",
};

// -------------------------------------------------------------------- build

auditSizes();

const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
doc.pipe(createWriteStream(OUTFILE));
let pageNo = 0;
const newPage = (title) => { doc.addPage(); pageNo++; pageFrame(doc, title, pageNo, "ARTWORK AND SPECS"); };

// BOOK_ONLY=n writes just page n. sips only rasterises page 1 of a PDF, and a
// page nobody has looked at is a page nobody has checked.
const ONLY = process.env.BOOK_ONLY ? Number(process.env.BOOK_ONLY) : 0;
let logical = 0;
const want = () => { logical++; return !ONLY || logical === ONLY; };

let y = 0;

// ---- cover
if (want()) {
newPage("Artwork and specs");
y = 86;
y += drawLockup(doc, 297.6, y, 132) + 28;
doc.font("Helvetica-Bold").fontSize(21).fillColor(INK)
  .text("ARTWORK AND SPECS", 40, y, { width: 515, align: "center", characterSpacing: 1.4 });
y = doc.y + 8;
doc.font("Helvetica").fontSize(9).fillColor(MUTED)
  .text("All thirteen artwork files, in item order, each with its finishing spec and a box for the " +
    "price. Every image on the following pages is rendered from the real artwork file.",
    92, y, { width: 411, align: "center", lineGap: 2 });
y = doc.y + 24;

const fields = [["SUPPLIER", 250], ["DATE", 110], ["CONTACT", 155]];
let fx = 40;
for (const [label, fw] of fields) {
  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(MUTED).text(label, fx, y, { characterSpacing: 0.6 });
  doc.moveTo(fx, y + 20).lineTo(fx + fw - 12, y + 20).lineWidth(0.8).stroke(INK);
  fx += fw;
}
y += 38;

doc.rect(40, y, 515, 58).fillAndStroke("#FBEFED", RED);
doc.font("Helvetica-Bold").fontSize(8).fillColor(RED)
  .text(`QUANTITY IS ${QTY} FOR EVERY ITEM.`, 52, y + 9, { characterSpacing: 0.4 });
doc.font("Helvetica").fontSize(8).fillColor(INK)
  .text("Ask their true minimum for each one as well — that number, not the unit price, is what " +
    "decides what the first order actually costs. Every item also has a box for setup charges, " +
    "which is where a cheap unit price hides.", 52, y + 22, { width: 491, lineGap: 1.4 });
y += 74;

doc.rect(40, y, 515, 66).fillAndStroke("#F1ECE1", HAIR);
doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK)
  .text("THE IMAGES HERE ARE PREVIEWS. THE FILES IN artwork/ ARE THE ARTWORK.", 54, y + 10,
    { width: 487, characterSpacing: 0.4 });
doc.font("Helvetica").fontSize(8).fillColor(INK)
  .text("Each one is rendered from the real PDF when this document is built, so it cannot show a mark " +
    "the artwork does not have. Print production always comes from artwork/, never from these pages. " +
    "Note also that the text in several of those files is not yet outlined — quote from them freely, " +
    "but corrected production files are following.", 54, y + 24, { width: 487, lineGap: 1.3 });
y += 82;

doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("CONTENTS", 40, y, { characterSpacing: 0.8 });
y = doc.y + 8;
for (const it of ITEMS) {
  doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(it.n, 44, y);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(INK).text(it.name, 66, y, { width: 150 });
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED)
    .text(it.files.map((f) => f + ".pdf").join("   ·   "), 216, y, { width: 339 });
  y = doc.y + 5;
}

}

// ---- one page per item
for (const it of ITEMS) {
  if (!want()) continue;
  newPage(`${it.n} · ${it.name}`);

  doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text(it.n, 40, 66);
  doc.font("Helvetica-Bold").fontSize(19).fillColor(it.hot ? RED : INK).text(it.name, 62, 60);
  doc.font("Helvetica").fontSize(8).fillColor(MUTED)
    .text(`${it.size}   ·   ${it.mat}   ·   ${it.process}`, 62, 84, { width: 480 });
  doc.moveTo(40, 102).lineTo(555, 102).lineWidth(0.6).stroke(HAIR);

  // the artwork itself
  const n = it.files.length;
  const boxW = n === 1 ? 400 : 245;
  const boxes = it.files.map((_, i) =>
    ({ x: n === 1 ? 97.6 : 45 + i * 255, y: 122, w: boxW, h: 250 }));
  it.files.forEach((stem, i) => plate(doc, stem, boxes[i], FACE[stem] || ""));

  doc.moveTo(40, 404).lineTo(555, 404).lineWidth(0.6).stroke(HAIR);

  doc.font("Helvetica-Bold").fontSize(8).fillColor(INK)
    .text("WHAT TO TELL THEM, AND WHAT TO ASK", 40, 416, { characterSpacing: 0.7 });
  bullets(doc, 40, 434, 515, it.bullets);

  priceRow(doc, 40, 636, 515, ["Unit price AED", "Setup / one-off", "Their minimum", "Lead time"]);
  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(MUTED)
    .text("NOTES", 40, 690, { characterSpacing: 0.6 });
  for (const ny of [712, 736, 760]) doc.moveTo(40, ny).lineTo(555, ny).lineWidth(0.5).stroke(HAIR);
}

// ---- colour
if (want()) {
newPage("Colour");
y = 66;
doc.font("Helvetica-Bold").fontSize(15).fillColor(INK).text("COLOUR", 40, y, { characterSpacing: 1.2 });
y = doc.y + 12;
SW.forEach(([name, hex], i) => {
  const bx = 40 + i * 104;
  doc.rect(bx, y, 94, 54).fillAndStroke(hex, HAIR);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(INK).text(name, bx, y + 60, { width: 94 });
  doc.font("Helvetica").fontSize(7).fillColor(MUTED).text(hex.toUpperCase(), bx, y + 70, { width: 94 });
});
y += 96;
doc.rect(40, y, 515, 92).fillAndStroke("#FBEFED", RED);
doc.font("Helvetica-Bold").fontSize(9).fillColor(RED)
  .text("DECIDE THE GOLD IN THIS MEETING", 54, y + 12, { characterSpacing: 0.6 });
doc.font("Helvetica").fontSize(8).fillColor(INK)
  .text("No Pantone has ever been chosen. #9C8445 is a value for a screen. Printed as flat CMYK it " +
    "comes out a dull khaki-brown; as a metallic Pantone or a foil it actually reads as gold. Three " +
    "different-looking results at three different prices, and nobody has picked one.\n\n" +
    "Ask to see all three on the real materials — paper, kraft and cloth. Gold shifts hard between " +
    "substrates, which is why every proof has to be on the real stock.", 54, y + 28,
    { width: 487, lineGap: 1.4 });
y += 108;
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK)
  .text("APPLIES TO EVERYTHING", 40, y, { characterSpacing: 0.8 });
y = doc.y + 8;
checkList(doc, 40, y, 515, EVERYTHING);

}

// ---- questions
if (want()) {
newPage("Ask every supplier");
y = 66;
doc.font("Helvetica-Bold").fontSize(15).fillColor(INK)
  .text("THE QUESTIONS THAT DECIDE THE REAL PRICE", 40, y, { width: 515, characterSpacing: 1 });
y = doc.y + 6;
doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
  .text("A unit price on its own is not comparable between two suppliers. These are what make it " +
    "comparable.", 40, y, { width: 515, lineGap: 1.4 });
y = doc.y + 14;
y += checkList(doc, 40, y, 515, ASK) + 20;
doc.font("Helvetica-Bold").fontSize(12).fillColor(RED)
  .text("DO NOT AGREE TO", 40, y, { characterSpacing: 0.9 });
y = doc.y + 8;
checkList(doc, 40, y, 515, NEVER);

}

// ---- open questions
if (want()) {
newPage("Still open");
y = 66;
doc.font("Helvetica-Bold").fontSize(15).fillColor(INK)
  .text("FIVE THINGS NOBODY HAS ANSWERED", 40, y, { width: 515, characterSpacing: 1 });
y = doc.y + 6;
doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
  .text("Open questions, not oversights on the supplier's part. Each one is currently blocking a " +
    "final quote — settle any you can in the room.", 40, y, { width: 515, lineGap: 1.4 });
y = doc.y + 16;
for (const [q, why] of OPEN) {
  doc.rect(40, y, 515, 60).fillAndStroke("#FFFFFF", HAIR);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK).text(q, 54, y + 10, { width: 300 });
  doc.font("Helvetica").fontSize(7.8).fillColor(MUTED).text(why, 54, y + 25, { width: 300, lineGap: 1.2 });
  doc.font("Helvetica-Bold").fontSize(6).fillColor(MUTED)
    .text("DECIDED TODAY", 372, y + 10, { characterSpacing: 0.6 });
  doc.rect(372, y + 19, 169, 30).lineWidth(0.8).stroke(INK);
  y += 70;
}
doc.font("Helvetica").fontSize(7).fillColor(HAIR)
  .text("Artwork rendered from branding/send-to-supplier/artwork/ at build time and audited against " +
    "these sizes.  Costs and quantities from branding/packaging.md.  Colours from branding/README.md.",
    40, 782, { width: 515, align: "center", lineGap: 1.2 });

}

doc.end();
console.log(`Wrote ${OUTFILE}  (${pageNo} pages, ${ITEMS.reduce((a, i) => a + i.files.length, 0)} artwork files)`);
