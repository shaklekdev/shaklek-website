// The collection book: everything the workshop would be asked to make.
//
//   npx tsx scripts/render-collection-book.mjs
//
// One page per garment, showing every combination front and back, plus the
// colourways. It exists so a tailor can see the whole range before agreeing to
// it, and say which pieces he can make as shown. That is a different document
// from a tech pack: no measurements, no bill of materials, no cut instructions.
// Pictures, names, and somewhere to write "no".
//
// Combinations are shown in ONE colourway. Construction does not change with
// colour, so four colours would be four times the paper for no extra
// information; the colours are shown once, as swatches, at the foot of each
// page.
//
// De-branded, same rule as the tech pack: the workshop makes the pieces, it is
// not handed the label they carry.
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { catalog } from "../src/data/catalog.ts";
import { renderParamsForCategory } from "../src/data/parameterSliders.ts";
import { colors } from "../src/data/colors.ts";
import { versionsForItem } from "../src/data/versionIds.ts";
import { fileURLToPath } from "node:url";

// Inspection flags. `sips` and qlmanage can only rasterise page one, so
// checking an item page meant either shipping a layout nobody had looked at or
// building a way to put one first. CB_ONLY=<slug> CB_NO_COVER=1 does that.
const ONLY = process.env.CB_ONLY ?? null;
const NO_COVER = process.env.CB_NO_COVER === "1";
// Repo root, derived from this file's own location instead of hardcoded.
// It was the literal "/Users/nadatlohi/Desktop/Shaklek" until 2026-08-31, when
// the repo moved off the iCloud-synced Desktop and every one of these scripts
// would have broken. Derived, the next move costs nothing.
const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url)).replace(/\/$/, "");
const OUT = ONLY
  ? `/tmp/collection-book-${ONLY}.pdf`
  : `${REPO_ROOT}/brand-assets/tailor-samples/collection-book.pdf`;
const SHOWN_IN = "Ivory"; // detail reads better on a pale cloth than on navy
const PAGE = { size: "A4", margin: 40 };
const INK = "#111", MUTED = "#777", RULE = "#ddd";

const read = (rel) => {
  const p = path.join("public", rel);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
};

const doc = new PDFDocument({
  ...PAGE,
  info: { Title: "Collection book", Author: "", Subject: "", Keywords: "", Creator: "", Producer: "" },
});
const chunks = [];
doc.on("data", (c) => chunks.push(c));
const done = new Promise((r) => doc.on("end", r));

const left = doc.page.margins.left;
const right = doc.page.width - doc.page.margins.right;
const width = right - left;

// ------------------------------------------------------------------- cover

if (!NO_COVER) {
doc.fontSize(8).fillColor(MUTED).font("Helvetica-Bold").text("COLLECTION BOOK", { characterSpacing: 2.5 });
doc.moveDown(0.4);
doc.fontSize(26).fillColor(INK).font("Helvetica-Bold").text("Everything we would ask you to make");
doc.moveDown(0.6);
doc
  .fontSize(11)
  .fillColor(INK)
  .font("Helvetica")
  .text(
    "Eight pieces. Each one can be ordered in four cuts and four colours, so what follows is the whole range, not a selection. Every image shows the same piece with one thing changed.",
    { width },
  );
doc.moveDown(0.8);
doc
  .fontSize(11)
  .font("Helvetica-Bold")
  .fillColor(INK)
  .text("What we are asking you", { width });
doc.moveDown(0.3);
doc
  .fontSize(11)
  .font("Helvetica")
  .text(
    "Please look through and tell us, piece by piece, whether you can make it as shown. There is a line under each one. If something is impractical, slow, or would be better made a different way, write it there. It is far cheaper to hear it now than after a customer has paid for it.",
    { width },
  );
doc.moveDown(0.8);
doc
  .fontSize(11)
  .font("Helvetica")
  .text(
    "Everything here is made to order in linen, one piece at a time. Nothing is cut before it is sold, so there is no stock and no minimum run.",
    { width },
  );
doc.moveDown(1);
doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor(RULE).lineWidth(0.5).stroke();
doc.moveDown(0.5);
doc
  .fontSize(8.5)
  .fillColor("#999")
  .text(
    "This document carries no customer details and no measurements. Sizing and cut instructions come separately, with each order.",
    { width },
  );
}

// -------------------------------------------------------------- per garment

let first = true;
for (const item of catalog) {
  if (ONLY && item.slug !== ONLY) continue;
  const params = renderParamsForCategory(item.category);
  if (!params.length) continue;

  const combos = params
    .reduce((acc, p) => acc.flatMap((a) => p.options.map((o) => [...a, o])), [[]])
    .map((opts) => ({
      key: opts.map((o) => o.value).join(":"),
      label: opts.map((o) => o.text.toLowerCase()).join(", "),
    }));

  // The stable code for each cut. See src/data/versionIds.ts: it exists so a
  // number written in the margin at the tailor's table can be typed back in
  // against something unambiguous.
  const versions = versionsForItem(item.slug);
  const codeFor = (key) => versions.find((v) => v.comboKey === key)?.id ?? "";

  if (!(NO_COVER && first)) doc.addPage();
  first = false;
  doc.fontSize(8).fillColor(MUTED).font("Helvetica-Bold").text(item.category.toUpperCase(), { characterSpacing: 1.4 });
  doc.moveDown(0.2);
  doc.fontSize(20).fillColor(INK).font("Helvetica-Bold").text(item.name);
  doc.moveDown(0.15);
  doc.fontSize(10).fillColor(MUTED).font("Helvetica").text(`${item.descriptor}. ${combos.length} cuts, ${colors.length} colours.`);
  doc.moveDown(0.5);
  doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor(RULE).lineWidth(0.5).stroke();
  doc.moveDown(0.6);

  const gap = 10;
  const cw = (width - gap * (combos.length - 1)) / combos.length;
  const openImage = doc;

  // Column labels, then a front row and a back row, so the eye compares down a
  // column for one cut and across a row for the thing being changed.
  const labelTop = doc.y;
  combos.forEach((c, i) => {
    const x = left + i * (cw + gap);
    doc
      .fontSize(9)
      .fillColor(INK)
      .font("Helvetica-Bold")
      .text(codeFor(c.key), x, labelTop, { width: cw, align: "center" });
    doc
      .fontSize(8)
      .fillColor(MUTED)
      .font("Helvetica")
      .text(c.label, x, labelTop + 12, { width: cw, align: "center" });
  });
  doc.y = labelTop + 34;

  for (const view of ["front", "back"]) {
    const top = doc.y;
    let tallest = 0;
    combos.forEach((c, i) => {
      const byCombo = item.comboImages?.[SHOWN_IN]?.[c.key];
      const byColor = item.colorImages?.[SHOWN_IN];
      const rel = byCombo?.[view] ?? byColor?.[view] ?? (view === "front" ? item.image : item.backImage);
      const buf = read(rel);
      if (!buf) return;
      const { width: iw, height: ih } = openImage.openImage(buf);
      const h = (cw / iw) * ih;
      tallest = Math.max(tallest, h);
      doc.image(buf, left + i * (cw + gap), top, { width: cw });
    });
    doc
      .fontSize(7.5)
      .fillColor(MUTED)
      .font("Helvetica")
      .text(view, left, top + tallest + 3, { width: 40 });
    doc.y = top + tallest + 16;
  }

  // Colourways, shown once.
  doc.moveDown(0.2);
  doc.fontSize(8).fillColor(MUTED).font("Helvetica-Bold").text("AVAILABLE IN", left, doc.y, { characterSpacing: 1.2 });
  doc.moveDown(0.3);
  const sy = doc.y;
  // SOMEWHERE TO WRITE THE NUMBER. The whole point of the codes above: the
  // tailor says how many metres a cut takes, it gets written here against a
  // code, and it is typed back in without anyone guessing which cut was meant.
  doc.moveDown(0.5);
  const mTop = doc.y;
  combos.forEach((c, i) => {
    const x = left + i * (cw + gap);
    doc.fontSize(7).fillColor(MUTED).font("Helvetica")
      .text(`${codeFor(c.key)}  metres`, x, mTop, { width: cw, align: "center" });
    doc.moveTo(x + 8, mTop + 22).lineTo(x + cw - 8, mTop + 22)
      .strokeColor(RULE).lineWidth(0.5).stroke();
  });
  doc.y = mTop + 32;

  colors.forEach((c, i) => {
    const x = left + i * 120;
    doc.rect(x, sy, 22, 14).fillColor(c.hex).fill();
    doc.rect(x, sy, 22, 14).strokeColor("#999").lineWidth(0.5).stroke();
    doc.fontSize(9).fillColor(INK).font("Helvetica").text(c.name, x + 28, sy + 3);
  });
  doc.y = sy + 26;

  // The approval line. One per garment, because "yes to all eight" is not an
  // answer anybody can act on.
  doc.moveDown(0.4);
  doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor(RULE).lineWidth(0.5).stroke();
  doc.moveDown(0.5);
  const ay = doc.y;
  doc.fontSize(10).fillColor(INK).font("Helvetica-Bold").text("Can you make this as shown?", left, ay);
  doc.fontSize(10).font("Helvetica").fillColor(MUTED).text("YES  /  NO", left + 200, ay);
  doc.y = ay + 22;
  doc.fontSize(8).fillColor(MUTED).font("Helvetica-Bold").text("IF NOT, WHAT WOULD YOU CHANGE", left, doc.y, { characterSpacing: 1 });
  doc.moveDown(0.2);
  for (let i = 0; i < 2; i++) {
    const y = doc.y + 12;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#bbb").lineWidth(0.5).stroke();
    doc.y = y + 6;
  }
}

// ------------------------------------------------------------------- close

if (!ONLY) {
doc.addPage();
doc.fontSize(8).fillColor(MUTED).font("Helvetica-Bold").text("AGREEMENT", { characterSpacing: 2 });
doc.moveDown(0.4);
doc.fontSize(18).fillColor(INK).font("Helvetica-Bold").text("Before we start selling these");
doc.moveDown(0.6);
doc
  .fontSize(11)
  .fillColor(INK)
  .font("Helvetica")
  .text(
    "If there is a piece you would rather not make, say so now and we will take it off the site. We would rather sell seven pieces you are happy with than eight you are not.",
    { width },
  );
doc.moveDown(1.2);
for (const label of ["Name", "Signature", "Date", "Roughly how long one piece takes", "What you would charge per piece"]) {
  const y = doc.y;
  doc.fontSize(9).fillColor(MUTED).font("Helvetica-Bold").text(label.toUpperCase(), left, y + 4, { width: 190 });
  doc.moveTo(left + 200, y + 14).lineTo(right, y + 14).strokeColor("#bbb").lineWidth(0.5).stroke();
  doc.y = y + 30;
}
}

doc.end();
await done;
const pdf = Buffer.concat(chunks);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, pdf);
console.log(`${OUT}  ${(pdf.length / 1024 / 1024).toFixed(1)}MB`);
