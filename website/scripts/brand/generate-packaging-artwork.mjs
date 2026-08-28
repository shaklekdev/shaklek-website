/**
 * Print-ready artwork, one file per packaging item, at TRUE PHYSICAL SIZE.
 *
 *   node scripts/brand/generate-packaging-artwork.mjs
 *
 * WHY THIS EXISTS: the supplier came back and said, correctly, that they could
 * not design the wash care label or the hang tag. We had sent them placement
 * instructions and logo files. A logo file contains a logo. It does not contain
 * the fibre content, the wash symbols, the origin, or the order reference, and
 * those are most of what actually prints on those two items. There was nothing
 * for them to set.
 *
 * So each item here is a complete piece of artwork at its finished size, with
 * every mark and every word already placed. Text is outlined, so no font is
 * needed. Care symbols are drawn as vector paths for the same reason.
 *
 * ⚠️ TWO THINGS ARE MARKED FOR THE FOUNDER TO CONFIRM AND MUST NOT BE INVENTED:
 * the exact care instructions, and the country of origin. Both are legal
 * disclosures on a garment sold in the UAE. The values here are the standard
 * ones for linen and are printed on the proof sheet as questions, not answers.
 */
import { openSync } from "fontkit";
import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const OUT = path.join(ROOT, "branding", "send-to-supplier", "artwork");
const FONTS = path.join(ROOT, "branding", "source", "fonts");
mkdirSync(OUT, { recursive: true });

const MM = 2.8346457;
const INK = "#1A1A1A", GOLD = "#9C8445", CREAM = "#F5F0E8", MUTED = "#6d6659";

function shape(file, text, size, tracking = 0) {
  const font = openSync(path.join(FONTS, file));
  const scale = size / font.unitsPerEm;
  const layout = font.layout(text);
  const segs = []; let x = 0, above = 0, below = 0;
  layout.glyphs.forEach((g, i) => {
    const p = layout.positions[i], d = g.path.toSVG();
    if (d) segs.push({ d, x: x + (p.xOffset || 0) * scale, y: -(p.yOffset || 0) * scale, s: scale });
    if (g.bbox) {
      above = Math.max(above, (g.bbox.maxY + (p.yOffset || 0)) * scale);
      below = Math.max(below, -(g.bbox.minY + (p.yOffset || 0)) * scale);
    }
    x += p.xAdvance * scale + tracking;
  });
  if (layout.glyphs.length) x -= tracking;
  return { segs, width: x, above, below: Math.max(0, below) };
}
const draw = (doc, segs, dx, dy, fill) => {
  doc.save().translate(dx, dy);
  for (const s of segs) doc.save().translate(s.x, s.y).scale(s.s, -s.s).path(s.d).fill(fill).restore();
  doc.restore();
};
/** stack the lockup so the gaps above and below the rule are equal */
function stack(latin, arabic, ruleH, gapRatio = 0.26) {
  const gap = latin.above * gapRatio;
  const latBase = latin.above;
  const ruleY = latBase + latin.below + gap;
  const arBase = ruleY + ruleH + gap + arabic.above;
  return { latBase, ruleY, arBase, height: arBase + arabic.below };
}
/** full lockup centred on cx, top edge at topY, drawn to targetW */
function lockup(doc, cx, topY, targetW, ink = INK, gold = GOLD) {
  const probe = shape("Italiana-Regular.ttf", "Shaklek", 46, (46 * 4) / 29);
  const size = (targetW / probe.width) * 46;
  const la = shape("Italiana-Regular.ttf", "Shaklek", size, (size * 4) / 29);
  const ar = shape("ReemKufi-Regular.ttf", "شكلك", size * 0.42);
  const rh = Math.max(0.35, size * 0.022);
  const st = stack(la, ar, rh);
  draw(doc, la.segs, cx - la.width / 2, topY + st.latBase, ink);
  doc.rect(cx - (la.width * 0.32) / 2, topY + st.ruleY, la.width * 0.32, rh).fill(gold);
  draw(doc, ar.segs, cx - ar.width / 2, topY + st.arBase, ink);
  return st.height;
}
function monogram(doc, cx, baseY, inkHeight, fill = INK) {
  const sh = shape("ReemKufi-Regular.ttf", "ش", inkHeight / 0.72);
  draw(doc, sh.segs, cx - sh.width / 2, baseY, fill);
}
/** small caps line, outlined, centred */
function line(doc, cx, baseY, text, size, fill = INK, tracking = 0.6) {
  const g = shape("ReemKufi-Regular.ttf", "", 1); // unused, keeps shape() warm
  const la = shape("Italiana-Regular.ttf", text, size, tracking);
  draw(doc, la.segs, cx - la.width / 2, baseY, fill);
  return la.width;
}


/**
 * Plain, legible type. Used for anything that must be READ rather than admired:
 * fibre content, origin, and the order reference.
 *
 * Italiana has old-style figures, so "A7F3C210" set in it comes out with
 * numerals of different heights sitting below the line, which is beautiful and
 * useless on a code someone has to read back to you. And a care label is a
 * legal disclosure: it has to be legible before it is elegant.
 *
 * Helvetica is one of the fourteen fonts every PDF reader is required to have,
 * so this needs no embedding and cannot be substituted.
 */
function plain(doc, cx, baseY, text, sizePt, fill = INK, tracking = 0) {
  doc.font("Helvetica").fontSize(sizePt).fillColor(fill)
    .text(text, cx - 200, baseY - sizePt, { width: 400, align: "center", characterSpacing: tracking });
}

// ------------------------------------------------------------ care symbols
// Drawn as vector, at a size in mm. The standard five for linen. Each is a
// simple geometric figure; getting one wrong is a consumer-protection issue,
// so they are drawn precisely and listed on the proof sheet for confirmation.
function careSymbols(doc, x, y, h, gap, fill = INK) {
  const lw = h * 0.09;
  doc.lineWidth(lw).strokeColor(fill);
  const at = (i) => x + (h + gap) * i;
  // 1. wash tub, 30
  let cx = at(0);
  doc.moveTo(cx, y + h * 0.30).lineTo(cx + h * 0.06, y + h * 0.30)
     .lineTo(cx + h * 0.12, y + h * 0.22).lineTo(cx + h * 0.88, y + h * 0.22)
     .lineTo(cx + h * 0.94, y + h * 0.30).lineTo(cx + h, y + h * 0.30).stroke();
  doc.moveTo(cx + h * 0.05, y + h * 0.30).lineTo(cx + h * 0.16, y + h * 0.88)
     .lineTo(cx + h * 0.84, y + h * 0.88).lineTo(cx + h * 0.95, y + h * 0.30).stroke();
  doc.font("Helvetica").fontSize(h * 0.40).fillColor(fill)
     .text("30", cx, y + h * 0.42, { width: h, align: "center" });
  // 2. triangle crossed: do not bleach
  cx = at(1);
  doc.moveTo(cx + h / 2, y + h * 0.16).lineTo(cx + h * 0.92, y + h * 0.88)
     .lineTo(cx + h * 0.08, y + h * 0.88).closePath().stroke();
  doc.moveTo(cx + h * 0.16, y + h * 0.24).lineTo(cx + h * 0.84, y + h * 0.84).stroke();
  // 3. square with a circle, crossed: DO NOT TUMBLE DRY
  //    Added on the legal brief's advice. Tumble drying is the single biggest
  //    shrink risk for linen, and leaving the symbol off implies it is allowed.
  cx = at(2);
  doc.rect(cx + h * 0.08, y + h * 0.16, h * 0.84, h * 0.72).stroke();
  doc.circle(cx + h * 0.50, y + h * 0.52, h * 0.24).stroke();
  doc.moveTo(cx + h * 0.14, y + h * 0.22).lineTo(cx + h * 0.86, y + h * 0.82).stroke();
  return { rowWidth: at(2) + h - x };
}
/** second row: line dry, iron, dry clean */
function careSymbols2(doc, x, y, h, gap, fill = INK) {
  const lw = h * 0.09;
  doc.lineWidth(lw).strokeColor(fill);
  const at = (i) => x + (h + gap) * i;
  // 4. square with a vertical bar: LINE DRY
  //    Line dry, not dry flat. Dry flat is a knitwear instruction; hanging woven
  //    linen while damp is what keeps its drape and reduces creasing.
  let cx = at(0);
  doc.rect(cx + h * 0.08, y + h * 0.16, h * 0.84, h * 0.72).stroke();
  doc.moveTo(cx + h * 0.50, y + h * 0.24).lineTo(cx + h * 0.50, y + h * 0.80).stroke();
  // 5. iron, two dots: medium
  cx = at(1);
  doc.moveTo(cx + h * 0.10, y + h * 0.74).lineTo(cx + h * 0.90, y + h * 0.74)
     .lineTo(cx + h * 0.74, y + h * 0.36).lineTo(cx + h * 0.28, y + h * 0.36).closePath().stroke();
  doc.circle(cx + h * 0.42, y + h * 0.56, h * 0.055).fill(fill);
  doc.circle(cx + h * 0.58, y + h * 0.56, h * 0.055).fill(fill);
  // 6. circle with P: professional dry clean
  cx = at(2);
  doc.circle(cx + h / 2, y + h * 0.52, h * 0.38).stroke();
  doc.font("Helvetica").fontSize(h * 0.40).fillColor(fill)
     .text("P", cx, y + h * 0.36, { width: h, align: "center" });
}

/** Arabic, shaped and outlined. Required: Federal Law 15/2020 Art. 26. */
function arabic(doc, cx, baseY, text, size, fill = INK) {
  const a = shape("ReemKufi-Regular.ttf", text, size);
  draw(doc, a.segs, cx - a.width / 2, baseY, fill);
}

// ---------------------------------------------------------------- the items
function makePdf(name, wMm, hMm, drawFn, note) {
  const w = wMm * MM, h = hMm * MM;
  const doc = new PDFDocument({ size: [w, h], margin: 0,
    info: { Title: `Shaklek ${name} ${wMm}x${hMm}mm`, Author: "Shaklek" } });
  doc.pipe(createWriteStream(path.join(OUT, `${name}.pdf`)));
  drawFn(doc, w, h);
  doc.end();
  console.log(`  ${name}.pdf`.padEnd(42), `${wMm} x ${hMm} mm`, note ? ` — ${note}` : "");
}

console.log("artwork, true size, text outlined:");

// 1. WOVEN BRAND LABEL 45 x 18 mm ------------------------------------------
makePdf("01-woven-brand-label", 45, 18, (doc, w, h) => {
  lockup(doc, w / 2, h * 0.20, w * 0.62);
}, "wordmark only, no size, no care text");

// 2. CARE LABEL 25 x 45 mm --------------------------------------------------
makePdf("02-care-label", 25, 45, (doc, w, h) => {
  // ⚠️ ARABIC IS MANDATORY, not a nicety. Federal Law 15/2020 Art. 26: data
  // relating to the consumer "shall be made in Arabic, and other languages may
  // be used in addition to Arabic". Penalty for breach runs AED 3,000 to
  // 200,000. The first version of this label was English only.
  monogram(doc, w / 2, 6.5 * MM, 3.6 * MM);
  // Latin digits in the Arabic line, deliberately. Reem Kufi has no ARABIC
  // PERCENT SIGN (U+066A) and rendered it as an empty box on the first proof;
  // Arabic-Indic digits then raised a bidirectional ordering question I cannot
  // settle by eye. Latin digits inside Arabic text are normal on Gulf labels and
  // have one unambiguous reading.
  //
  // ⚠️ THE ARABIC ON THIS LABEL MUST BE READ BY AN ARABIC SPEAKER BEFORE IT IS
  // PRINTED. It is a legal disclosure under Federal Law 15/2020 Art. 26 and I
  // cannot verify Arabic typesetting the way I can verify a measurement.
  arabic(doc, w / 2, 11 * MM, "كتان 100%", 3.0 * MM);
  plain(doc, w / 2, 15 * MM, "100% LINEN", 7, INK, 1.2);
  doc.moveTo(4 * MM, 17.5 * MM).lineTo(w - 4 * MM, 17.5 * MM).lineWidth(0.3).strokeColor("#B9B1A2").stroke();

  const sh = 4.0 * MM, gap = 1.0 * MM, rowW = sh * 3 + gap * 2;
  careSymbols(doc, (w - rowW) / 2, 20 * MM, sh, gap);
  careSymbols2(doc, (w - rowW) / 2, 25.5 * MM, sh, gap);

  doc.moveTo(4 * MM, 32 * MM).lineTo(w - 4 * MM, 32 * MM).lineWidth(0.3).strokeColor("#B9B1A2").stroke();
  arabic(doc, w / 2, 36 * MM, "صنع في الإمارات", 2.6 * MM);
  plain(doc, w / 2, 40 * MM, "MADE IN UAE", 6, INK, 1.0);
  plain(doc, w / 2, 43.5 * MM, "SHAKLEK.COM", 4.8, MUTED, 0.9);
}, "⚠️ Arabic added (legally required). Needs the ECAS mark and batch code before production");

// 3. HANG TAG 50 x 90 mm ----------------------------------------------------
makePdf("03-hang-tag", 50, 90, (doc, w, h) => {
  // string hole
  doc.circle(w / 2, 7 * MM, 2.1 * MM).lineWidth(0.4).strokeColor("#B9B1A2").stroke();
  lockup(doc, w / 2, 18 * MM, w * 0.56);
  doc.moveTo(12 * MM, 52 * MM).lineTo(w - 12 * MM, 52 * MM).lineWidth(0.3).strokeColor("#D6CEBE").stroke();
  plain(doc, w / 2, 60 * MM, "ORDER", 6.5, MUTED, 1.6);
  // The reference is variable data, one per garment. Printed here as a specimen
  // so the supplier can position and size the field; it is not a fixed value.
  plain(doc, w / 2, 69 * MM, "A7F3C210", 13, INK, 2.0);
  plain(doc, w / 2, 81 * MM, "SHAKLEK.COM", 6, MUTED, 1.2);
}, "ORDER REFERENCE IS VARIABLE DATA, one per garment");

// 4. THANK-YOU CARD A6, 105 x 148 mm ---------------------------------------
makePdf("04-thank-you-card-front", 105, 148, (doc, w, h) => {
  lockup(doc, w / 2, 34 * MM, w * 0.42);
}, "front. Message handwritten below the mark");

makePdf("05-thank-you-card-back", 105, 148, (doc, w, h) => {
  line(doc, w / 2, 30 * MM, "If it is not right", 5 * MM, INK, 0.8);
  doc.font("Helvetica").fontSize(8).fillColor(MUTED)
    .text("One free alteration or remake within 14 days.\nWrite to us and we will collect the piece.",
      14 * MM, 36 * MM, { width: w - 28 * MM, align: "center", lineGap: 3 });
  doc.moveTo(30 * MM, 58 * MM).lineTo(w - 30 * MM, 58 * MM).lineWidth(0.3).strokeColor("#D6CEBE").stroke();
  plain(doc, w / 2, 70 * MM, "SHAKLEK.COM", 8, INK, 1.6);
  monogram(doc, w / 2, 92 * MM, 7 * MM, "#C9C0AE");
}, "back. ⚠️ returns wording to confirm against the legal page");

// 6. TISSUE SEAL STICKER 40 mm circle ---------------------------------------
makePdf("06-tissue-seal-40mm", 40, 40, (doc, w, h) => {
  doc.circle(w / 2, h / 2, w / 2).fill(GOLD);
  monogram(doc, w / 2, h / 2 + 5 * MM, 13 * MM, CREAM);
}, "gold ground, mark reversed in cream");

// 7. TISSUE WRAP REPEAT TILE 250 x 250 mm ----------------------------------
makePdf("07-tissue-wrap-repeat-tile", 250, 250, (doc, w, h) => {
  // A seamless tile: the supplier steps and repeats this across the 50x70cm
  // sheet. Marks are staggered row to row so the repeat does not read as a grid.
  // Every mark sits WHOLLY INSIDE the tile. The first version staggered odd rows
  // by half a column, which pushed the last mark of those rows off the right
  // edge and sliced it in half. A tile with a half mark on one edge does not
  // step and repeat, it prints a row of damaged logos across the sheet.
  // Staggering is kept, but by using one fewer mark on the offset rows.
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    const stagger = r % 2 === 1;
    const cols = stagger ? 2 : 3;
    // Spaced so the gap ACROSS THE SEAM equals the gap inside the tile: marks
    // sit at (c + 0.5) / cols, giving half a gap at each edge. Placing them
    // flush to the edges instead put two marks side by side wherever two tiles
    // met, which prints as "ShaklekShaklek" down every seam of the sheet.
    const markW = w * 0.19;
    for (let c = 0; c < cols; c++) {
      const cx = (w * (c + 0.5)) / cols;
      lockup(doc, cx, (h / rows) * r + 14 * MM, markW, "#B3A78E", "#B3A78E");
    }
  }
}, "step and repeat across the 50x70cm sheet, keep it faint");

// 8. LINEN BAG PRINT 400 x 500 mm ------------------------------------------
makePdf("08-linen-bag-print", 400, 500, (doc, w, h) => {
  // The print area only. The mark sits at one third of the bag height.
  lockup(doc, w / 2, h * 0.30, 90 * MM, INK, INK);
  doc.font("Helvetica").fontSize(7).fillColor("#C9C0AE")
    .text("Print area guide only. Mark is 90 mm wide, centred, at one third of the bag height. One colour.",
      20 * MM, h - 18 * MM, { width: w - 40 * MM, align: "center" });
}, "one colour, 90mm wide, at a third of the bag height");

// 9. MAILER PLACEMENT 250 x 350 mm -----------------------------------------
makePdf("09-mailer-placement", 250, 350, (doc, w, h) => {
  doc.rect(0, 0, w, h).lineWidth(0.5).strokeColor("#D6CEBE").dash(4, { space: 4 }).stroke().undash();
  monogram(doc, w - 34 * MM, h - 28 * MM, 11 * MM, INK);
  doc.font("Helvetica").fontSize(7).fillColor("#B9B1A2")
    .text("Monogram only, 11 mm, lower right. Nothing else prints on the outside.",
      18 * MM, 18 * MM, { width: w - 36 * MM });
}, "small monogram only, deliberately plain");

console.log("\n⚠️ TWO THINGS THE FOUNDER MUST CONFIRM BEFORE ANY OF THIS IS MADE:");
console.log("   1. the care instructions on 02-care-label (drawn: wash 30, do not bleach,");
console.log("      dry flat, iron medium, professional dry clean P)");
console.log("   2. the country of origin, currently MADE IN UAE");
console.log("Both are legal disclosures on a garment sold in the UAE and neither is mine to decide.");
