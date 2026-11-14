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
import { MEASURES, NEEDS, DESIGN, LANDMARK } from "./specs.mjs";
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
header("FRONT / BACK", "");
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

// OPTIONS — every customisation the customer can choose, as the website shows it.
const CAT = fs.readFileSync(new URL("../../../website/src/data/catalog.ts", import.meta.url), "utf8");
const slug = cfg.slug || path.basename(base);
const seg = CAT.slice(CAT.indexOf(`slug: "${slug}"`));
const category = (seg.match(/category: "([A-Za-z]+)"/) || [])[1];
{
  const ci = seg.slice(seg.indexOf("colorImages"), seg.indexOf("comboImages"));
  const colour = /Navy:/.test(ci) ? "Navy" : "Ivory";
  const baseFront = (ci.slice(ci.indexOf(colour + ":")).match(/front: "([^"]+)"/) || [])[1];
  const cc = seg.slice(seg.indexOf("comboImages"));
  const block = cc.slice(cc.indexOf(colour + ":"), cc.indexOf("},\n      },", cc.indexOf(colour + ":")) + 1);
  const combos = [...block.matchAll(/"([a-z0-9]+:[a-z0-9]+)": \{ front: "([^"]+)"/g)].map((m) => [m[1], m[2]]);
  const DEF = { Shirt: "long:normal", Pants: "straight:full", Dress: "round:maxi", Abaya: slug === "buttoned-abaya" ? "maxi:4" : "maxi:narrow" };
  const all = [[cfg.defaultCombo || DEF[category], baseFront], ...combos.filter(([k]) => k !== (cfg.defaultCombo || DEF[category]))];
  const NAMES = { long: "LONG SLEEVE", short: "SHORT SLEEVE", normal: "NORMAL LENGTH", longer: "LONGER", straight: "STRAIGHT LEG", wide: "WIDE", full: "FULL LENGTH", cropped: "CROPPED", round: "ROUND NECK", v: "V NECK", maxi: "MAXI", midi: "MIDI", narrow: "NARROW SLEEVE", "4": "4 CLOSURES", "5": "5 CLOSURES" };
  const label = (k) => k.split(":").map((v) => (category === "Abaya" && v === "wide" ? "WIDE SLEEVE" : category === "Pants" && v === "wide" ? "WIDE LEG" : NAMES[v] || v.toUpperCase())).join(" + ");
  doc.addPage(); header("OPTIONS — every choice", "");
  const n = all.length, cw2 = (W - 80) / n, ph = Math.min(H - 170, (cw2 - 16) * 1.5);
  for (let i = 0; i < n; i++) {
    const [k, f] = all[i]; if (!f) continue;
    const x = 40 + i * cw2;
    doc.image(await img("../../../website/public" + f, 600), x + 8, 70, { fit: [cw2 - 16, ph], align: "center" });
    doc.fillColor(i === 0 ? INK : GREEN).font("Helvetica-Bold").fontSize(15).text(label(k), x, 80 + ph, { width: cw2, align: "center" });
    if (i === 0) doc.fillColor(GREY).font("Helvetica").fontSize(11).text("(default)", x, 100 + ph, { width: cw2, align: "center" });
  }
}

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
doc.addPage(); header("DETAILS", "");
const d = cfg.details, cols = 3, rows = Math.ceil(d.length / cols);
const cw = (W - 80) / cols, ch = (H - 90) / rows;
for (let i = 0; i < d.length; i++) {
  const x = 40 + (i % cols) * cw, yy = 70 + Math.floor(i / cols) * ch;
  doc.image(await img(d[i].file, 700), x + 10, yy, { fit: [cw - 20, ch - 52], align: "center", valign: "center" });
  caption(x, yy + ch - 48, cw, d[i].title, d[i].sub);
}

export function parseMeasurements(t) {
  const out = {}; const num = (re) => { const x = t.match(re); return x ? Number(x[1]) : undefined; };
  const map = { bust: /Bust \/ chest:\s*(\d+(?:\.\d+)?)\s*cm/i, waist: /Waist:\s*(\d+(?:\.\d+)?)\s*cm/i, hip: /Hip:\s*(\d+(?:\.\d+)?)\s*cm/i,
    height: /Height:\s*(\d+(?:\.\d+)?)\s*cm/i, shoulder: /shoulders\s+(\d+(?:\.\d+)?)\s*cm/i, arm: /\barm\s+(\d+(?:\.\d+)?)\s*cm/i,
    outseam: /waist to floor\s+(\d+(?:\.\d+)?)\s*cm/i, inseam: /inside leg\s+(\d+(?:\.\d+)?)\s*cm/i, underbust: /underbust\s+(\d+(?:\.\d+)?)\s*cm/i };
  for (const [k, re] of Object.entries(map)) { const v = num(re); if (v != null) out[k] = v; }
  return out;
}
// DESIGN MEASUREMENTS — the garment's own numbers, per option.
function table(title, sub, headers, rowsT, widths) {
  doc.addPage(); header(title, "");
  doc.fillColor("#c0392b").font("Helvetica-Bold").fontSize(13).text(sub, 40, 64, { width: W - 80 });
  let y = 108; const xs0 = [40]; widths.forEach((w, i) => xs0.push(xs0[i] + w));
  doc.font("Helvetica-Bold").fontSize(12).fillColor(GREY);
  headers.forEach((h, i) => doc.text(h, xs0[i], y, { width: widths[i] - 8 }));
  y += 20;
  for (const row of rowsT) {
    const hgt = Math.max(...row.map((c, i) => doc.font(i === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(13).heightOfString(String(c ?? ""), { width: widths[i] - 8 }))) + 10;
    if (y + hgt > H - 30) { doc.addPage(); header(title, ""); y = 70; }
    doc.moveTo(40, y - 4).lineTo(W - 40, y - 4).lineWidth(0.5).strokeColor("#dddddd").stroke();
    row.forEach((c, i) => doc.fillColor(i === 0 ? GREEN : INK).font(i === 1 || i === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(13).text(String(c ?? ""), xs0[i], y, { width: widths[i] - 8 }));
    y += hgt;
  }
}
if (DESIGN[slug]) table("DESIGN RULES", "No size here: every rule uses HER measurements (page HER MEASUREMENTS). PROPOSED - check on the first piece.",
  ["OPTION", "WHAT", "RULE", "CHECK ON THE GARMENT"], DESIGN[slug].map((r) => [r[0] === "all" ? "ALL" : r[0], r[1], r[2], r[3]]), [190, 200, 430, 290]);

// HER MEASUREMENTS — what to take, whether the virtual fitting gives it, and
// what to use when it does not.
if (NEEDS[category]) {
  // cfg.measured: { height, bust, ... } typed by hand, and/or cfg.measurementsText:
  // the order_items.measurements string the online fitting saves (branch
  // online-fitting, lib/onlineFitting.ts): "Bust / chest: 88cm, Waist: 71cm,
  // Hip: 97cm, Height: 168cm, Online fitting (...): shoulders 39cm; arm 58cm;
  // waist to floor 102cm; inside leg 78cm; underbust 75cm; usual size ...".
  const m = { ...parseMeasurements(cfg.measurementsText || ""), ...(cfg.measured || {}) };
  const have = (k) => m[k] != null && m[k] !== "";
  const rowsM = NEEDS[category].map((k) => {
    const d = MEASURES[k];
    const src = d.virtual ? "VIRTUAL + LIVE" : d.liveOnly ? "LIVE ONLY (home fitting)" : "LIVE - or derived";
    let val = have(k) ? `${m[k]} cm` : "______";
    if (!have(k) && d.derive && ["bust", "waist", "hip", "height"].every((q) => !(d.derive.toString().includes("m." + q)) || have(q))) {
      try { const v = d.derive(m); if (isFinite(v)) val = `~${v.toFixed(0)} cm (±${d.pm}) DERIVED`; } catch {}
    }
    return [d.label.toUpperCase(), d.how, src, val];
  });
  table("HER MEASUREMENTS (full body, cm)", "Take these on her. VIRTUAL = the online fitting gives it. DERIVED = calculated from her other measurements (ANSUR II, 1,986 women); use only when no tape value. LIVE ONLY = must be taken at the home fitting.",
    ["MEASUREMENT", "HOW TO TAKE IT", "SOURCE", "HER VALUE"], rowsM, [230, 420, 220, 240]);
}

// PAGE 3 — pattern
doc.addPage(); header("PATTERN — shape of the pieces", "");
doc.image(await img(cfg.pattern, 2400), 20, 64, { fit: [W - 40, H - 80], align: "center" });

doc.end();
console.log("wrote", out);
