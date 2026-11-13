// THE TAILOR SHEET TEMPLATE — one layout for every piece we sell (founder 2026-11-13).
//
// "il n'improvise absolument rien": the tailor reads little English, so the
// sheet is pictures first and a few capital words, always in the same order:
//   page 1  ORDER strip + FRONT and BACK flats, big, with the website photos small
//   page 2  DETAILS: close-up drawings (collar, closure, sleeve/armhole, cuff,
//           back construction, hem...) each with one short caption
//   page 3  PATTERN: every piece with cm, finished measurements, trims
//
// How the drawings are made (and why), learned on the oversized shirt:
//   - flats are generated FROM the website photo and checked SIDE BY SIDE with
//     it before use. The photo wins over construction.ts and over any prompt.
//   - every detail close-up is generated FROM the approved flat, never from a
//     description, or the collar changes shape between drawings.
//   - the pattern is drawn by script (fullpattern.mjs style), never generated.
//
// Usage: node tailor-sheet.mjs <config.json> <out.pdf>
// See oversized-shirt.config.json for the shape of a config.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(new URL("../../../website/", import.meta.url));
const PDFDocument = require("pdfkit");
const sharp = require("sharp");

const [, , cfgPath, out] = process.argv;
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const base = path.dirname(path.resolve(cfgPath));
const p = (f) => (path.isAbsolute(f) ? f : path.join(base, f));
const img = async (f, w) => sharp(p(f)).resize({ width: w, withoutEnlargement: false }).jpeg({ quality: 88 }).toBuffer();

const W = 1190, H = 842; // A4 landscape, points
const doc = new PDFDocument({ size: [W, H], margin: 0 });
doc.pipe(fs.createWriteStream(out));
const GREEN = "#1e8449", INK = "#111111", GREY = "#777777";

function header(title, page) {
  doc.rect(0, 0, W, 54).fill(INK);
  doc.fillColor("white").font("Helvetica-Bold").fontSize(24).text(`${cfg.name.toUpperCase()}  —  ${title}`, 30, 16);
  if (page) doc.fontSize(14).text(`${page} / 3`, W - 90, 22);
}
function strip(y) {
  const o = cfg.order;
  if (!o) return y;
  const cells = Object.entries(o.fields);
  const cw = (W - 60) / cells.length;
  cells.forEach(([k, v], i) => {
    const x = 30 + i * cw;
    doc.rect(x, y, cw - 8, 64).fill("#f2f2f2");
    doc.fillColor(GREY).font("Helvetica").fontSize(11).text(k.toUpperCase(), x + 10, y + 8);
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(22).text(v ? String(v).toUpperCase() : "______", x + 10, y + 26, { width: cw - 24 });
  });
  if (o.notes) { doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(16).text(o.notes.toUpperCase(), 30, y + 74, { width: W - 60 }); return y + 104; }
  return y + 76;
}
function caption(x, y, w, title, sub) {
  doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(15).text(title.toUpperCase(), x, y, { width: w, align: "center" });
  if (sub) doc.fillColor(INK).font("Helvetica").fontSize(12).text(sub, x, y + 19, { width: w, align: "center" });
}

// PAGE 1 — views
header("FRONT / BACK", 1);
let y = strip(70);
const viewH = H - y - 40;
const flatW = viewH / 1.5;
const photoW = (viewH - 40) / 2 / 1.5;
const xs = [40, 40 + flatW + 30];
doc.image(await img(cfg.views.front, 900), xs[0], y, { fit: [flatW, viewH - 30], align: "center" });
caption(xs[0], y + viewH - 28, flatW, "FRONT");
doc.image(await img(cfg.views.back, 900), xs[1], y, { fit: [flatW, viewH - 30], align: "center" });
caption(xs[1], y + viewH - 28, flatW, "BACK");
if (cfg.legend) doc.fillColor(INK).font("Helvetica-Bold").fontSize(13).text(cfg.legend, 40, H - 26, { width: W - 80 });
const px = xs[1] + flatW + 50;
doc.fillColor(GREY).font("Helvetica-Bold").fontSize(12).text("WEBSITE PHOTO", px, y);
doc.image(await img(cfg.photos.front, 500), px, y + 18, { fit: [photoW * 1.6, (viewH - 60) / 2], align: "left" });
doc.image(await img(cfg.photos.back, 500), px, y + 30 + (viewH - 60) / 2, { fit: [photoW * 1.6, (viewH - 60) / 2], align: "left" });

// OPTIONAL PAGE — FIT CORRECTIONS after a test piece came back wrong.
// cfg.fit = { wrong: "photo of the test piece", rules: ["FITTED BODICE — ...", ...] }
if (cfg.fit) {
  doc.addPage(); header("FIT — FIX THESE", "");
  const fx = 40, fy = 80, fw = cfg.fit.wrong ? 420 : 0;
  if (cfg.fit.wrong) {
    doc.rect(fx, fy, fw, 30).fill("#c0392b");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(16).text("X  TEST PIECE — WRONG", fx + 10, fy + 8);
    doc.image(await img(cfg.fit.wrong, 900), fx, fy + 36, { fit: [fw, H - fy - 80], align: "center" });
  }
  let ry = fy;
  const rx = fx + fw + (fw ? 40 : 0), rw = W - rx - 40;
  cfg.fit.rules.forEach((r, i) => {
    const [a, b] = r.split(" — ");
    doc.circle(rx + 16, ry + 16, 16).fill("#c0392b");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(16).text(String(i + 1), rx + 4, ry + 7, { width: 24, align: "center" });
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(22).text(a.toUpperCase(), rx + 44, ry + 2, { width: rw - 44 });
    if (b) doc.fillColor(GREY).font("Helvetica").fontSize(16).text(b, rx + 44, doc.y + 2, { width: rw - 44 });
    ry = doc.y + 26;
  });
}

// PAGE 2 — details
doc.addPage(); header("DETAILS", 2);
const d = cfg.details, cols = 3, rows = Math.ceil(d.length / cols);
const cw = (W - 80) / cols, ch = (H - 90) / rows;
for (let i = 0; i < d.length; i++) {
  const x = 40 + (i % cols) * cw, yy = 70 + Math.floor(i / cols) * ch;
  doc.image(await img(d[i].file, 700), x + 10, yy, { fit: [cw - 20, ch - 52], align: "center", valign: "center" });
  caption(x, yy + ch - 48, cw, d[i].title, d[i].sub);
}

// PAGE 3 — pattern
doc.addPage(); header("PATTERN", 3);
doc.image(await img(cfg.pattern, 2400), 20, 64, { fit: [W - 40, H - 80], align: "center" });

doc.end();
console.log("wrote", out);
