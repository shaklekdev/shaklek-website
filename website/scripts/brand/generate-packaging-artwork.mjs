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
import QRCode from "qrcode";
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
/** stack the lockup so the gaps above and below the rule are equal.
 *  `arabic` may be null, for the Latin-only lockup -- see lockup(). */
function stack(latin, arabic, ruleH, gapRatio = 0.26) {
  const gap = latin.above * gapRatio;
  const latBase = latin.above;
  const ruleY = latBase + latin.below + gap;
  // Latin-only: the mark ends at the rule, so the rule is the bottom edge and
  // there is no second gap. Returning arabic's gap here would hang the mark
  // high by exactly the space the Arabic used to fill.
  if (!arabic) return { latBase, ruleY, arBase: null, height: ruleY + ruleH };
  const arBase = ruleY + ruleH + gap + arabic.above;
  return { latBase, ruleY, arBase, height: arBase + arabic.below };
}
/**
 * Full lockup centred on cx, top edge at topY, drawn to targetW.
 *
 * `withArabic: false` draws the Latin wordmark and the gold rule only.
 *
 * ⚠️ THE ARABIC IS NOT OPTIONAL EVERYWHERE, so this flag has a narrow purpose.
 * Federal Law 15/2020 Art. 26 requires Arabic on data addressed to the consumer
 * ON A PRODUCT -- which is the care label, the brand label and the hang tag,
 * and those must keep it. A business card is not a product label, so the mark
 * there is a matter of taste, and the founder's (2026-09-10) is that two
 * scripts plus two lines of copy is too much for 90 x 50 mm.
 *
 * Default stays true. Anything that ships attached to a garment should never
 * pass false.
 */
function lockup(doc, cx, topY, targetW, ink = INK, gold = GOLD, withArabic = true) {
  const probe = shape("Italiana-Regular.ttf", "Shaklek", 46, (46 * 4) / 29);
  const size = (targetW / probe.width) * 46;
  const la = shape("Italiana-Regular.ttf", "Shaklek", size, (size * 4) / 29);
  const ar = withArabic ? shape("ReemKufi-Regular.ttf", "شكلك", size * 0.42) : null;
  const rh = Math.max(0.35, size * 0.022);
  const st = stack(la, ar, rh);
  draw(doc, la.segs, cx - la.width / 2, topY + st.latBase, ink);
  doc.rect(cx - (la.width * 0.32) / 2, topY + st.ruleY, la.width * 0.32, rh).fill(gold);
  if (ar) draw(doc, ar.segs, cx - ar.width / 2, topY + st.arBase, ink);
  return st.height;
}
/**
 * The height lockup() will occupy at a given width, WITHOUT drawing it.
 *
 * Needed to centre the mark vertically: the lockup is a wordmark, a rule and an
 * Arabic line of three different heights, so its box centre is not where the
 * eye puts its centre, and "just use h/2" hangs it high. Same probe maths as
 * lockup() -- change one and change both.
 */
function lockupHeight(targetW, withArabic = true) {
  const probe = shape("Italiana-Regular.ttf", "Shaklek", 46, (46 * 4) / 29);
  const size = (targetW / probe.width) * 46;
  const la = shape("Italiana-Regular.ttf", "Shaklek", size, (size * 4) / 29);
  const ar = withArabic ? shape("ReemKufi-Regular.ttf", "\u0634\u0643\u0644\u0643", size * 0.42) : null;
  return stack(la, ar, Math.max(0.35, size * 0.022)).height;
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
/**
 * MACHINE WASH 30 GENTLE. Founder's decision, 2026-09-08, replacing DRY CLEAN
 * ONLY -- and the replacement is only valid because the CLOTH CHANGED.
 *
 * The old rule was a fit decision, not a laundry one: unwashed linen shrinks
 * 4-10% on its first wash, these garments are cut to a customer's own
 * measurements, and a shrunk garment fits perfectly once and then does not,
 * with the remake free at our cost. That reasoning was correct and is not being
 * overturned.
 *
 * What changed: the fabric is now Shirley's W300235, which the mill
 * WATER-WASHES AND SOFTENS before selling. That is exactly the pre-shrink step
 * branding/packaging.md named as the route back to home washing. Stated
 * residual shrinkage is ~1%, which on a 70cm shirt length is 7mm.
 *
 * ⚠️ AND IT IS ALSO COMPETITIVE, NOT ONLY A KINDNESS. Zara and Massimo Dutti
 * both print machine wash on their 100% linen shirts. A dry-clean-only label
 * beside theirs reads as the worse garment on the one spec a shopper can
 * compare directly.
 *
 * ⚠️ 30 AND NOT 40. Massimo Dutti prints 30 gentle, Zara prints 40. Take the
 * lower one: these garments have no spare ease to lose, and 30 is the more
 * cautious of the two real precedents.
 *
 * ✅ SHIRLEY CONFIRMED W300235 IS PRE-WASHED (to the founder, 2026-09-10).
 * That is the mill step this whole decision rests on, and it is no longer an
 * inference from a gsm sheet -- it is the supplier saying so directly. It also
 * means the swatch no longer blocks the print run.
 *
 * ⏳ BUT STILL WASH A PIECE WHEN THE ROLL LANDS, BEFORE ANY LABEL IS SEWN IN.
 * "Pre-washed" and "around 1%" are both a supplier's sentences, not a
 * measurement, and this is the one claim on the label that can shrink a
 * garment cut to a customer's own numbers. The four fit-sample sets prove
 * nothing about it -- they are cut from a DIFFERENT cloth (the local 30% linen
 * at 10 AED/m). Above ~2% residual, dry-clean-only goes back on.
 *
 * The timing works: fabric lands 27 Sep - 1 Oct and labels arrive ~29 Sep, so
 * the test happens before the first garment is made either way. Printing early
 * is now the cheaper risk; sewing in an untested claim is not.
 *
 * The set: machine wash 30 gentle, do not bleach, do not tumble dry, iron
 * medium, professional dry clean (P) -- the dry-clean symbol STAYS, exactly as
 * both competitors do it, where beside a wash symbol it reads as "may also be
 * dry cleaned" rather than "must be".
 */
function careSymbols(doc, x, y, h, gap, fill = INK) {
  const lw = h * 0.09;
  doc.lineWidth(lw).strokeColor(fill);
  const at = (i) => x + (h + gap) * i;
  // 1. wash tub with 30 and one bar: MACHINE WASH 30, GENTLE (ISO 3758 mild
  //    process). Was a crossed tub (do not wash) until 2026-09-08 -- see the
  //    block above for why the cloth, and therefore the rule, changed.
  //    THE TEMPERATURE LIVES HERE, NOT IN THE WORDS. That is the standard form
  //    and it keeps digits out of the Arabic line, which is what printed
  //    "%001" backwards three times on this same label.
  let cx = at(0);
  doc.moveTo(cx, y + h * 0.30).lineTo(cx + h * 0.06, y + h * 0.30)
     .lineTo(cx + h * 0.12, y + h * 0.22).lineTo(cx + h * 0.88, y + h * 0.22)
     .lineTo(cx + h * 0.94, y + h * 0.30).lineTo(cx + h, y + h * 0.30).stroke();
  doc.moveTo(cx + h * 0.05, y + h * 0.30).lineTo(cx + h * 0.16, y + h * 0.88)
     .lineTo(cx + h * 0.84, y + h * 0.88).lineTo(cx + h * 0.95, y + h * 0.30).stroke();
  // "30" inside the tub. Sized off the tub height so it scales with the symbol.
  doc.font("Helvetica-Bold").fontSize(h * 0.34).fillColor(fill)
     .text("30", cx, y + h * 0.44, { width: h, align: "center", lineBreak: false });
  // the single bar under the tub = mild/gentle process
  doc.moveTo(cx + h * 0.18, y + h * 1.02).lineTo(cx + h * 0.82, y + h * 1.02).stroke();
  // 2. triangle, crossed: do not bleach
  cx = at(1);
  doc.moveTo(cx + h / 2, y + h * 0.16).lineTo(cx + h * 0.92, y + h * 0.88)
     .lineTo(cx + h * 0.08, y + h * 0.88).closePath().stroke();
  doc.moveTo(cx + h * 0.16, y + h * 0.24).lineTo(cx + h * 0.84, y + h * 0.84).stroke();
  // 3. square with circle, crossed: do not tumble dry
  cx = at(2);
  doc.rect(cx + h * 0.08, y + h * 0.16, h * 0.84, h * 0.72).stroke();
  doc.circle(cx + h * 0.50, y + h * 0.52, h * 0.24).stroke();
  doc.moveTo(cx + h * 0.14, y + h * 0.22).lineTo(cx + h * 0.86, y + h * 0.82).stroke();
}
/** second row: iron medium, professional dry clean */
function careSymbols2(doc, x, y, h, gap, fill = INK) {
  doc.lineWidth(h * 0.09).strokeColor(fill);
  const at = (i) => x + (h + gap) * i;
  let cx = at(0);
  doc.moveTo(cx + h * 0.10, y + h * 0.74).lineTo(cx + h * 0.90, y + h * 0.74)
     .lineTo(cx + h * 0.74, y + h * 0.36).lineTo(cx + h * 0.28, y + h * 0.36).closePath().stroke();
  doc.circle(cx + h * 0.42, y + h * 0.56, h * 0.055).fill(fill);
  doc.circle(cx + h * 0.58, y + h * 0.56, h * 0.055).fill(fill);
  cx = at(1);
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
  // ⚠️ MIXED ARABIC AND DIGITS ARE DRAWN AS TWO SEPARATE RUNS, POSITIONED BY
  // HAND. Passing "كتان 100%" through the shaper as one string printed "%001":
  // fontkit shapes glyphs but does not apply the bidirectional algorithm, so
  // the digits came out in logical order inside a right-to-left line, which is
  // backwards. Three attempts got this wrong in three different ways, and each
  // one rendered cleanly and looked deliberate.
  //
  // In correct bidi the number sits to the LEFT of the Arabic word and reads
  // left to right, which is what these two calls produce.
  //
  // ⚠️ AN ARABIC SPEAKER MUST STILL READ THIS BEFORE IT IS PRINTED. It is a
  // legal disclosure under Federal Law 15/2020 Art. 26, and Arabic typesetting
  // is not something I can verify the way I can verify a measurement.
  {
    const word = shape("ReemKufi-Regular.ttf", "كتان", 3.0 * MM);
    // MEASURE the number, do not guess its box. A 4.6mm box was too narrow for
    // "100%" at 8pt, so it wrapped to two lines and printed "10" above "0%"
    // across the line beneath. widthOfString is exact.
    // SIZE AND BASELINE, both by the founder's eye on the first proof: the
    // number sat too high and was too large beside the Arabic.
    //
    // Baseline: pdfkit places the TOP of a text box at the y it is given, while
    // draw() places a glyph run on its BASELINE. Passing the same y to both put
    // the Latin roughly a full ascender high. Helvetica's ascender is about
    // 0.718 of its point size, so subtracting that lands the two on one line.
    //
    // Size: 8pt against Arabic drawn at 3mm was visibly the bigger of the two.
    // 6.4pt matches the weight of the Arabic beside it.
    const NUM_PT = 6.4;
    doc.font("Helvetica").fontSize(NUM_PT);
    const numW = doc.widthOfString("100%");
    const total = numW + 1.4 * MM + word.width;
    const left = (w - total) / 2;
    doc.fillColor(INK).text("100%", left, 11 * MM - NUM_PT * 0.718, { width: numW + 2, lineBreak: false });
    draw(doc, word.segs, left + numW + 1.4 * MM, 11 * MM, INK);
  }
  plain(doc, w / 2, 15 * MM, "100% LINEN", 7, INK, 1.2);
  doc.moveTo(4 * MM, 17.5 * MM).lineTo(w - 4 * MM, 17.5 * MM).lineWidth(0.3).strokeColor("#B9B1A2").stroke();

  const sh = 3.8 * MM, gap = 1.0 * MM;
  careSymbols(doc, (w - (sh * 3 + gap * 2)) / 2, 19.5 * MM, sh, gap);
  careSymbols2(doc, (w - (sh * 2 + gap)) / 2, 24.5 * MM, sh, gap);
  // The symbols are the legal form, but almost nobody reads them. The words say
  // the same thing so the customer actually knows.
  // ⚠️ AN ARABIC SPEAKER MUST READ THIS BEFORE PRINTING. Founder to approve.
  // No digits in the Arabic on purpose: the temperature is in the tub symbol
  // above, which is the standard form and avoids the bidi failure that printed
  // "%001" on this label three separate times.
  arabic(doc, w / 2, 32 * MM, "غسيل آلي لطيف", 2.5 * MM);
  plain(doc, w / 2, 35.5 * MM, "GENTLE MACHINE WASH", 5.0, INK, 0.6);

  doc.moveTo(4 * MM, 37.5 * MM).lineTo(w - 4 * MM, 37.5 * MM).lineWidth(0.3).strokeColor("#B9B1A2").stroke();
  arabic(doc, w / 2, 41 * MM, "صنع في الإمارات", 2.4 * MM);
  plain(doc, w / 2, 44 * MM, "MADE IN UAE", 5.4, INK, 1.0);
}, "machine wash 30 gentle. Arabic read and approved by the founder 2026-09-10");

// 3. HANG TAG 50 x 90 mm ----------------------------------------------------
//
// ⚠️ NO ORDER NUMBER. It used to carry one and the founder killed it with the
// obvious question: how do you print an order number on a tag you are ordering
// five hundred of, months before those orders exist? You cannot. The tag is
// bulk stock; the number is per garment. I had the two on the same object.
//
// My reasoning was that she wants no size on the brand label, so a reference
// had to live somewhere. It did not: the customer already has the number in her
// confirmation email and her account, and the tailor has it printed on the tech
// pack he works from. It solved a problem that was already solved, and it did it
// by turning a cheap bulk print into variable data, which costs more per tag and
// needs a different quote.
makePdf("03-hang-tag", 50, 90, (doc, w, h) => {
  doc.circle(w / 2, 7 * MM, 2.1 * MM).lineWidth(0.4).strokeColor("#B9B1A2").stroke();
  lockup(doc, w / 2, 26 * MM, w * 0.56);
  doc.moveTo(16 * MM, 62 * MM).lineTo(w - 16 * MM, 62 * MM).lineWidth(0.3).strokeColor("#D6CEBE").stroke();
  plain(doc, w / 2, 72 * MM, "SHAKLEK.COM", 6.5, MUTED, 1.4);
}, "plain, bulk printable, no variable data");

// 3b. HANG TAG, BACK 50 x 90 mm --------------------------------------------
//
// The four values, on the back of the tag rather than as a fifth printed item.
// Founder's call, and the cheap side of it: a card printed both sides costs
// almost nothing more than one side, while a separate insert is another unit to
// buy, store and stuff into every envelope.
//
// The words are taken from BENEFITS in src/data/homeContent.ts so the tag and
// the website say the same thing. If those change, regenerate this file.
makePdf("03b-hang-tag-back", 50, 90, (doc, w, h) => {
  doc.circle(w / 2, 7 * MM, 2.1 * MM).lineWidth(0.4).strokeColor("#B9B1A2").stroke();
  // ⚠️ NO PRICE. "One price, from AED 389" was here and the founder cut it:
  // a price on the tag reads as a discount sticker, and the tag is the one
  // object in the parcel whose only job is to feel like the brand. The claim
  // itself is good and stays on the website, where a shopper is deciding; it
  // does not belong on a garment she has already bought.
  // ⚠️ NO FIBRE NAME. This said "100% natural linen" until 2026-09-02, which
  // would have needed a reprint for every fabric the brand ever sells -- and
  // the entry cloth is becoming a linen/cotton blend. A fabric-agnostic line
  // is printed once and stays true.
  //
  // ⚠️ AND IT SAYS FABRIC, NOT MATERIALS. "Materials" claims the whole garment,
  // thread and buttons included, and sewing thread is normally polyester
  // because cotton thread is weaker. That would turn a green claim into a
  // false one for the sake of one word. The legal fibre disclosure is the
  // CARE LABEL (02), which carries the real percentages; this tag is brand.
  const items = [
    "100% custom-made",
    "100% plant based fabric",
    "Made in the UAE",
  ];
  // Three, not four, so the spacing opens up rather than leaving a gap where
  // the fourth was.
  let y = 28 * MM;
  for (const t of items) {
    // a gold hairline as the bullet, the same mark the lockup uses
    doc.rect(w / 2 - 3 * MM, y - 1.6 * MM, 6 * MM, 0.28 * MM).fill(GOLD);
    plain(doc, w / 2, y + 4.6 * MM, t.toUpperCase(), 6.4, INK, 1.0);
    y += 15 * MM;
  }
  monogram(doc, w / 2, 82 * MM, 5 * MM, "#C9C0AE");
}, "the values, no price. Print on the reverse of 03-hang-tag");

// 4. THANK-YOU CARD A6 LANDSCAPE, 148 x 105 mm -----------------------------
// Copy approved by the founder, 2026-08-28. Two lines she cut are worth
// recording so they do not come back: "feedback is a gift" and "your
// satisfaction is our key". Both are things every company says, and the
// sentence about the tailor already proves what they only assert.
//
// The front stays mostly empty ON PURPOSE. She writes the customer's name and
// a line by hand under the printed paragraph, and handwriting is the whole
// value of this card -- a full printed message leaves nowhere to put it.
//
// ⚠️ TURNED LANDSCAPE 2026-08-29, founder's call: "the thank you card should be
// same as envelope." SAME A6 SHEET, SAME COST -- 105 x 148 becomes 148 x 105.
// Nothing about the paper or the price moves.
//
// The point of it: a PORTRAIT card in a LANDSCAPE envelope has to be turned
// ninety degrees to go in and turned back to be read. That is a small, constant
// awkwardness in the one moment of the unboxing that is supposed to feel
// considered. Matched, it slides straight in and comes straight out the right
// way up.
//
// The layout is re-proportioned, not rotated. A landscape card is wider, so
// every line of type fits more words and the paragraphs run to fewer lines --
// which is what buys back the 43 mm of height that turning it costs.
const CARD_LONG = 148, CARD_SHORT = 105;
const FIT_URL = "https://www.shaklek.com/fit";

makePdf("04-thank-you-card-front", CARD_LONG, CARD_SHORT, (doc, w, h) => {
  lockup(doc, w / 2, 11 * MM, w * 0.28);
  line(doc, w / 2, 36 * MM, "Thank you", 6 * MM, INK, 1.2);
  doc.font("Helvetica").fontSize(8.6).fillColor(MUTED)
    .text("This piece did not exist until you asked for it. It was cut to your measurements and sewn here in the UAE, to be worn for years rather than a season.",
      22 * MM, 43 * MM, { width: w - 44 * MM, align: "center", lineGap: 3.4 });
  // Ruled guides for the handwritten line, in the palest cream on the sheet.
  // They print, faintly, and they are the difference between a straight line
  // and a note that slopes down the card. THREE LINES, kept: the width gained
  // by turning the card means each one now holds noticeably more handwriting.
  doc.lineWidth(0.25).strokeColor("#EDE7DA");
  for (let i = 0; i < 3; i++) {
    const y = (64 + i * 11) * MM;
    doc.moveTo(24 * MM, y).lineTo(w - 24 * MM, y).stroke();
  }
}, "LANDSCAPE front. Founder handwrites the name and a line on the ruled guides");

makePdf("05-thank-you-card-back", CARD_LONG, CARD_SHORT, (doc, w, h) => {
  line(doc, w / 2, 16 * MM, "Now tell us how it fits", 4.8 * MM, INK, 0.9);
  // "Two minutes" is load bearing. The biggest reason not to scan is not
  // knowing what it costs, and five tap-questions plus an email honestly is
  // two minutes. Say it at the moment of decision.
  doc.font("Helvetica").fontSize(8.4).fillColor(MUTED)
    .text("Scan below. Two minutes, straight to your tailor, and your next piece starts from it.",
      24 * MM, 21 * MM, { width: w - 48 * MM, align: "center", lineGap: 3 });

  // 28 mm block, down from 30 on the portrait card. This one is scanned
  // one-handed by someone holding a garment, often at arm's length in bad
  // bedroom light, so the block is still generous -- and the module size is
  // printed by qr() on every build, which is the number that actually decides
  // whether a phone reads it. 28 mm keeps it near 0.75 mm, well clear of the
  // 0.4 mm floor. Do not shrink it further to win layout space.
  const qrSize = 28;
  qr(doc, FIT_URL, w / 2 - (qrSize * MM) / 2, 31 * MM, qrSize);

  // The URL under the code, for the same reason as on the business card: a QR
  // is the one thing here that can fail silently, and short enough to type.
  plain(doc, w / 2, 65 * MM, "SHAKLEK.COM/FIT", 7.6, INK, 1.5);

  doc.rect(w / 2 - 6 * MM, 69 * MM, 12 * MM, 0.3).fill(GOLD);

  // ⚠️ THIS SENTENCE IS THE FAQ'S, WORD FOR WORD, AND TWICE IT HAS NOT BEEN.
  //
  // /faq, /legal/terms, /shipping and /size-guide all say "one free alteration
  // or remake within 14 days OF DELIVERY", and "Message us with a photo and a
  // stylist arranges it". Two drifts have been caught here:
  //
  //  - an early draft dropped the "one", which promises UNLIMITED alterations
  //    in print, on a card that cannot be recalled, against a policy that says
  //    otherwise;
  //  - this comment then claimed word-for-word accuracy while the card said
  //    "we will collect the piece" and dropped "of delivery". NOTHING on the
  //    shipped site promises collection. That was a courier pickup for every
  //    alteration, promised in ink, forever, by a card rather than by a policy.
  //
  // An unanchored "14 days" is also the vaguer promise: 14 days from what?
  //
  // The number prints because a card has no links. Verify it against
  // TAILOR_WHATSAPP_NUMBER before any print run.
  doc.font("Helvetica").fontSize(8).fillColor(MUTED)
    .text("If something is not right, you get one free alteration or remake within 14 days of delivery. Message us on WhatsApp, +971 50 476 6769, and a stylist arranges it.",
      22 * MM, 74 * MM, { width: w - 44 * MM, align: "center", lineGap: 3 });

  monogram(doc, w / 2, 99 * MM, 6 * MM, "#C9C0AE");
}, "LANDSCAPE back. QR to the fit form, wording matches /faq");

// 5b. THANK-YOU ENVELOPE C6, LANDSCAPE 162 x 114 mm -------------------------
//
// The supplier asked, on 2026-08-29: "What size and design should this envelope
// have? On the thank you card and envelope, we don't see the size neither the
// design of the envelope." She was right -- the envelope was named in the spec
// sheet with no dimension and no artwork file. There was nothing to quote and
// nothing to print.
//
// ⚠️ IT IS LANDSCAPE: 162 WIDE, 114 TALL. The first version of this file was
// drawn 114 x 162, portrait, and the founder caught it: "this is not how
// envelopes and thank you cards look." She is right, and the distinction is a
// real one in envelope manufacture, not a matter of taste:
//
//   WALLET  flap hinged on the LONG edge -> used landscape. Greeting cards,
//           invitations, thank-you cards. Big pointed flap. This one.
//   POCKET  flap hinged on the SHORT edge -> used portrait. Invoices,
//           statements, documents. That is what I drew.
//
// Same C6 sheet size either way, so the paper cost does not move -- but a
// pocket envelope in a parcel like this reads as post, not as a note.
//
// C6 IS NOT A DESIGN DECISION, IT IS THE SIZE THAT FITS. The card is A6,
// 105 x 148 mm. A C6 is 114 x 162, so the card goes in with about 7 mm of
// clearance along the long edge and 4.5 mm along the short one. Off the shelf
// everywhere, so there is no die to pay for.
//
// THE FRONT IS DELIBERATELY BLANK. This envelope never travels on its own --
// it sits inside the linen bag, inside the mailer -- so it carries no address
// panel, no stamp box and no mark. Printing the front would mean a second pass
// on the press for something nobody sees until the bag is open.
//
// Drawn as the BACK, flap closed, because that is the only face that prints.
const ENV_W = 162, ENV_H = 114;

makePdf("05b-thank-you-envelope-back", ENV_W, ENV_H, (doc, w, h) => {
  // The flap: hinged on the long top edge and pointed, which is what makes it
  // read as a card envelope rather than a document one. Drawn as a GUIDE ONLY
  // -- it is scored and folded by the envelope maker, not printed.
  //
  // It is TINTED, not merely outlined. The first version drew the flap and the
  // two lower back seams as bare dashed lines to the same centre point, which
  // came out as a symmetrical X across the whole envelope: technically the
  // seams of an envelope back, but you could not tell which triangle was the
  // flap. A faint fill answers that in one glance, so the lower seams are not
  // needed and are gone.
  const flapY = h * 0.58;
  doc.moveTo(0, 0).lineTo(w / 2, flapY).lineTo(w, 0).closePath().fill("#F1EBDF");
  doc.lineWidth(0.4).strokeColor("#D6CEBE").dash(3, { space: 3 });
  doc.moveTo(0, 0).lineTo(w / 2, flapY).lineTo(w, 0).stroke();
  doc.undash();

  // The monogram sits in the lower panel, a little above its centre so it reads
  // as hanging from the flap point rather than floating at the bottom edge. NOT
  // on the flap itself: on a gummed flap the ink meets the adhesive, and on a
  // self-seal flap it is under the strip -- either way it smears or is covered.
  const inkH = 9 * MM;
  monogram(doc, w / 2, flapY + (h - flapY) * 0.42 + inkH / 2, inkH, INK);

  doc.font("Helvetica").fontSize(5.5).fillColor("#B9B1A2")
    .text("C6 LANDSCAPE, 162 x 114 mm — WALLET flap, hinged on the long edge. THE TINTED TRIANGLE IS THE FLAP AND DOES NOT PRINT. " +
      "The only ink on this envelope is the monogram, 9 mm, below the flap point. FRONT PRINTS NOTHING.",
      14 * MM, h - 8 * MM, { width: w - 28 * MM, align: "center" });
}, "C6 LANDSCAPE, wallet flap. Back only — the front is blank");

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

// 8. COTTON BAG PRINT 350 x 450 mm, PORTRAIT, WITH A HANDLE ----------------
//
// ⚠️ MATCHED TO FITOOR'S QUOTED LINE, 2026-09-10: "COTTON BAG, with normal
// handle, 35x45cm, 100 @ 17.00". The founder took the smaller bag DELIBERATELY,
// as a price decision, not by supplier error -- do not re-raise it as a
// mismatch. Nothing here should be read as arguing with that choice.
//
// It WAS 500 x 400 landscape (her 2026-08-29 call, itself a turn of an earlier
// 400 x 500). This file has to be rebuilt on every one of those changes, and
// the reason is the same each time and keeps being underestimated:
//
//   THE MARK IS PLACED IN PROPORTIONS, AND PROPORTIONS ARE NOT
//   ORIENTATION-FREE OR SIZE-FREE. "A third of the way down" is 150 mm on a
//   500 mm bag, 120 mm on a 400 mm one, 135 mm here. A guide written as
//   fractions looks portable and is not.
//
// ⚠️ AND THE MARK SHRINKS WITH THE BAG, WHICH IS THE EASY THING TO GET WRONG.
// The invariant she approved is that the mark reads at ~22% OF THE BAG'S
// WIDTH: 90 mm on a 400 mm bag was 22.5%, and 110 mm on the 500 mm bag was
// chosen on 2026-08-29 to restore exactly that. Carrying 110 mm onto a 350 mm
// bag would make it 31% -- a third of the width, visibly not the mark she
// signed off. 0.225 x 350 = 79 mm, so 79 it is.
//
// Screen printing is priced by the run and not by the size of the image, so
// the smaller mark saves nothing and costs nothing. It is purely proportion.
//
// ⚠️ THE HANDLE IS NEW and the print must clear it. The mark sits at a third
// of the height, well below the handle seam, which is where it already sat --
// so nothing moves for it. Flagged only so the next person does not raise the
// handle as an unhandled change.
const BAG_W = 350, BAG_H = 450;
const BAG_MARK = 79;

// The filename still says "linen". It is a COTTON bag and has been since the
// blend was dropped -- but Fitoor already holds this file under this name
// against a placed order, so the name stays and the artwork tells the truth.
// Renaming a file a supplier is already working from buys nothing and risks
// them printing the wrong revision.
makePdf("08-linen-bag-print", BAG_W, BAG_H, (doc, w, h) => {
  // The print area only. The mark sits at roughly a third of the bag height.
  lockup(doc, w / 2, h * 0.30, BAG_MARK * MM, INK, INK);
  doc.font("Helvetica").fontSize(7).fillColor("#C9C0AE")
    .text(`Print area guide only. COTTON bag, PORTRAIT, ${BAG_W} wide x ${BAG_H} tall, with handle. Mark is ${BAG_MARK} mm wide, centred, at one third of the bag height. One colour.`,
      20 * MM, h - 18 * MM, { width: w - 40 * MM, align: "center" });
}, `PORTRAIT cotton bag. one colour, ${BAG_MARK}mm wide, at a third of the bag height`);

// 8b. HAND BAG PRINT 350 x 300 mm FACE -------------------------------------
//
// ⚠️ THIS FILE DID NOT EXIST UNTIL 2026-09-10, AND THE QUOTE PRICES A PRINT ON
// IT. Fitoor's line: "HAND BAG, 1 color print, 35x30x6cm, 100 @ 9.20". Eight
// lines were quoted and only seven had artwork, which is the kind of gap that
// is invisible until a supplier asks for the file or, worse, prints nothing.
//
// 35 x 30 x 6 is width x height x gusset, so the printable FACE is 350 x 300;
// the 60 mm gusset is the side panel and carries no print. Same proportion
// rule as the cotton bag above -- 0.225 x 350 = 79 mm, at a third of the
// height -- so the two bags read as the same mark at the same weight, which
// they will not do if either is set in absolute millimetres.
const HANDBAG_W = 350, HANDBAG_H = 300;

makePdf("11-hand-bag-print", HANDBAG_W, HANDBAG_H, (doc, w, h) => {
  lockup(doc, w / 2, h * 0.30, BAG_MARK * MM, INK, INK);
  doc.font("Helvetica").fontSize(7).fillColor("#C9C0AE")
    .text(`Print area guide only. FACE of the hand bag, ${HANDBAG_W} wide x ${HANDBAG_H} tall. The 60 mm gusset is the side panel and carries NO print. Mark is ${BAG_MARK} mm wide, centred, at one third of the face height. One colour.`,
      20 * MM, h - 18 * MM, { width: w - 40 * MM, align: "center" });
}, `hand bag FACE 350x300 (6cm gusset unprinted). one colour, ${BAG_MARK}mm wide`);

// 9. MAILER PLACEMENT 320 x 400 mm -----------------------------------------
//
// ⚠️ WAS 250 x 350 AND THAT WAS TOO SMALL. Founder's call, 2026-08-29, after
// the supplier quoted against her own standard courier bag because our file
// carried no stated dimension. Measure what actually goes in:
//
//     garment folded          ~300 x 220 x 40 mm
//     + the linen bag         ~300 x 250 mm with loft
//     + tissue, card, tag
//     ------------------------------------------------
//     minimum internal        320 x 400 mm
//
// A shirt fits 250 x 350. A folded trouser in a 40 x 50 cm cotton bag does not,
// and a mailer you have to force is a mailer that splits at the seal.
//
// THIS IS A MINIMUM, NOT A SPECIFICATION. The mailer is the one item the
// customer never keeps, so it is the wrong place to pay for a custom size --
// the supplier's nearest stock size at or above this is the right answer and
// the cheapest one. The artwork is a placement guide: the monogram is fixed in
// millimetres from the lower-right corner, so it stays correct at any bag size.
const MAILER_W = 320, MAILER_H = 400;

makePdf("09-mailer-placement", MAILER_W, MAILER_H, (doc, w, h) => {
  doc.rect(0, 0, w, h).lineWidth(0.5).strokeColor("#D6CEBE").dash(4, { space: 4 }).stroke().undash();
  monogram(doc, w - 34 * MM, h - 28 * MM, 11 * MM, INK);
  doc.font("Helvetica").fontSize(7).fillColor("#B9B1A2")
    .text("Kraft paper, 120 gsm or heavier, self-seal strip. MINIMUM internal size 320 x 400 mm — " +
      "your nearest stock size at or above this is fine, no custom size needed. " +
      "Monogram only, 11 mm, measured 34 mm from the right edge and 28 mm from the bottom. " +
      "Nothing else prints on the outside.",
      18 * MM, 18 * MM, { width: w - 36 * MM, lineGap: 2 });
}, "small monogram only, deliberately plain");

// 10. BUSINESS CARD 90 x 50 mm ---------------------------------------------
// Trim is 90 x 50, the standard UAE/European size. The PDFs are 96 x 56
// because 3 mm of BLEED is included on every edge: the front prints edge to
// edge in ink, and without bleed a 0.3 mm drift on the guillotine leaves a
// white sliver down one side of a black card. Tell the printer: trim 90 x 50,
// bleed 3 mm, no crop marks needed.
//
// NO INSTAGRAM OR TIKTOK HANDLE. Neither account exists yet, and a dead handle
// on a printed card is worse than no handle -- these are printed in hundreds
// and cannot be corrected. The QR carries the site, and the site will carry the
// socials the day they open.
const CARD_W = 90, CARD_H = 50, BLEED = 3;

// The link on the card. It must OUTLIVE THE PRINT RUN, so it is the bare home
// page and nothing deeper: a campaign page or a collection slug can be renamed
// or retired, and every card already handed out then points at a 404.
// ?c=card is a marker, not a redirect -- it changes nothing about where the
// link goes, it only lets the analytics separate a scan from a search.
const CARD_URL = "https://www.shaklek.com/?c=card";

/**
 * QR, drawn as VECTOR RECTANGLES rather than placed as a raster image, so it is
 * resolution-independent: at any print size every module lands on an exact
 * edge instead of being resampled into grey fringes that a scanner reads as
 * noise. Horizontal runs are merged into single rects, which cuts the drawing
 * operations by more than half.
 *
 * Two things below are what actually make a printed QR scan, and both are
 * routinely dropped:
 *
 *  - THE QUIET ZONE. Four blank modules on every side are part of the symbol,
 *    not a margin around it. Crowd the code with type and many scanners simply
 *    never lock on. sizeMm is the whole block INCLUDING it.
 *  - DARK ON LIGHT. A QR inverted -- light code on a dark ground -- is legal in
 *    the spec and fails on a lot of phone cameras. So on the ink-ground front
 *    the code would have to sit in a light panel; here it sits on the cream
 *    back instead, which is cleaner.
 */
function qr(doc, text, x, y, sizeMm, dark = INK) {
  const q = QRCode.create(text, { errorCorrectionLevel: "Q" });
  const n = q.modules.size, data = q.modules.data, QUIET = 4;
  const total = n + QUIET * 2;
  const m = (sizeMm * MM) / total;
  // A module below ~0.4 mm is past what a phone camera resolves on paper. This
  // is printed rather than assumed, because the symbol grows with the URL: a
  // longer link silently shrinks every module at a fixed block size.
  const mm = m / MM;
  console.log(`      qr ${n}x${n} modules, ${mm.toFixed(2)} mm each` +
    (mm < 0.4 ? "  ⚠️ TOO SMALL TO SCAN RELIABLY" : "  ok"));
  doc.fillColor(dark);
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!data[r * n + c]) { c++; continue; }
      let run = 1;
      while (c + run < n && data[r * n + c + run]) run++;
      doc.rect(x + (c + QUIET) * m, y + (r + QUIET) * m, run * m, m).fill();
      c += run;
    }
  }
}

// ⚠️ THIS CARD IS A PROSPECTING TOOL, NOT A CONTACT CARD. Founder, 2026-09-10:
// she hands it to strangers in coffee shops and on the street, so it has three
// seconds and one job -- make the right woman recognise herself. The line is
// HERS, arrived at over several passes, and it describes the CUSTOMER rather
// than the brand. Do not rewrite it into a description of Shaklek.
//
// ⚠️ EVERY WORD OF IT SURVIVED A TRUTH TEST, AND THREE EARLIER DRAFTS DID NOT.
// "100% plant based" was cut because the garments carry buttons and a zip fly,
// polyester thread and a satin care label: the FABRIC is 100% plant, the
// GARMENT is not, and that is a false claim on a card that cannot be recalled.
// "100% tailored" was cut because standard sizes are sold at the same price by
// deliberate choice. "100% made in the UAE" was cut because the cloth is milled
// in Guangzhou; plain "made in the UAE" is the same claim the care label makes
// and is correct. What is left: 100% linen is the legal composition claim,
// "tailored" describes who makes it rather than how it is sized, and the origin
// matches the label.
//
// The line sits on the FRONT so nothing is cut from the back, which needs its
// QR, the site that catches a QR that fails, and the phone.
const CARD_LINE_1 = "Your skin breathing.";
const CARD_LINE_2 = "Your clothes fitting.";
// ⚠️ AND THEN CUT BACK TO THIS. A version reading "100% linen, tailored, and
// made in the UAE" was set and looked at; the founder's call was that the
// origin alone is enough. She is right, and it is worth saying why so nobody
// restores the longer line as an improvement: the two sentences above are
// about HER, and every extra clause here drags the card back to being about
// the garment. The fabric and the fit are already implied by "breathing" and
// "fitting", and the legal composition claim lives on the care label, which is
// where it is actually required.
const CARD_LINE_3 = "Made in the UAE.";

makePdf("10-business-card-front", CARD_W + BLEED * 2, CARD_H + BLEED * 2, (doc, w, h) => {
  doc.rect(0, 0, w, h).fill(INK);
  const B = BLEED * MM;

  // Centred on MEASURED ink, not on a guessed y. The lockup is three stacked
  // pieces of different heights and its optical centre is not its box centre.
  //
  // Sized and placed in FRACTIONS OF THE CARD, never in fixed points, so this
  // stays right if the trim ever moves. The bag print got that wrong twice.
  //
  // ⚠️ EVERY Y BELOW WAS RE-BALANCED WHEN THE ARABIC CAME OFF. Dropping it made
  // the lockup shorter without moving anything under it, which left a hole
  // between the mark and the claim. Removing an element from a stack is not a
  // deletion, it is a re-layout.
  //
  // ⚠️ LATIN ONLY ON THIS CARD. Founder, 2026-09-10: two scripts plus two lines
  // of copy is too much for 90 x 50 mm. Legal to drop here and ONLY here --
  // Art. 26's Arabic requirement is about data on a product, so the care label,
  // the brand label and the hang tag all keep theirs.
  const markW = CARD_W * 0.34 * MM;
  doc.save();
  lockup(doc, w / 2, B + CARD_H * 0.17 * MM, markW, CREAM, GOLD, false);
  doc.restore();

  // The claim, cream on ink, the same reversal as the mark.
  //
  // ⚠️ SET IN ITALIANA, NOT HELVETICA, AND THAT IS THE WHOLE DIFFERENCE. In the
  // plain face this read like a slide: a fine display serif above two lines of
  // system sans is a card that looks unfinished at arm's length, which is the
  // only distance this card is ever seen at. The rule in plain()'s own comment
  // is "READ rather than admired" -- fibre content and reference numbers. This
  // line is the hook, so it is admired.
  //
  // Two short sentences on two lines: they are a pair, and breaking them
  // anywhere else makes the reader work at the one moment she has not decided
  // to. The widths are measured and asserted below rather than eyeballed.
  const claimW = Math.max(
    line(doc, w / 2, B + 27.5 * MM, CARD_LINE_1, 4.1 * MM, CREAM, 0.5),
    line(doc, w / 2, B + 34.4 * MM, CARD_LINE_2, 4.1 * MM, CREAM, 0.5),
  );
  // ⚠️ A CARD IS TRIMMED, SO TYPE NEAR THE EDGE IS TYPE THAT GETS CUT. The
  // guillotine drifts; 6 mm of quiet margin each side is the floor. This has to
  // be a check rather than a comment, because the line is the founder's and
  // will be reworded, and a longer sentence fails silently at the printer.
  const safeW = (CARD_W - 12) * MM;
  if (claimW > safeW) {
    console.error(`\n  ✗ business card: the claim is ${(claimW / MM).toFixed(1)} mm wide, over the ${(safeW / MM).toFixed(0)} mm safe width.`);
    console.error("    Shorten the line or drop the point size. Do not let it run to the trim.\n");
    process.exitCode = 1;
  }

  // A hairline, not a divider. It separates the claim from the facts beneath
  // without turning a 90 x 50 card into two boxes.
  doc.rect(w / 2 - 6 * MM, B + 38.6 * MM, 12 * MM, 0.3).fill(GOLD);

  // Smaller and warm grey so it reads as a footnote to the claim rather than
  // a third sentence competing with it.
  plain(doc, w / 2, B + 43.6 * MM, CARD_LINE_3, 6.4, "#B5AC9B", 0.5);
}, "trim 90x50, 3mm bleed. Ink ground, mark reversed, the founder's line beneath");

makePdf("10b-business-card-back", CARD_W + BLEED * 2, CARD_H + BLEED * 2, (doc, w, h) => {
  doc.rect(0, 0, w, h).fill(CREAM);
  const B = BLEED * MM;
  const qrSize = 21;
  qr(doc, CARD_URL, w / 2 - (qrSize * MM) / 2, B + 4.5 * MM, qrSize);
  doc.rect(w / 2 - 5 * MM, B + 28.5 * MM, 10 * MM, 0.3).fill(GOLD);
  // The URL is printed UNDER the code on purpose. A QR is the only thing on a
  // card that can fail silently -- a scuff, a bad light, an old camera -- and
  // when it does the person is left holding a card with no way to reach us.
  plain(doc, w / 2, B + 34 * MM, "SHAKLEK.COM", 7.4, INK, 1.5);
  plain(doc, w / 2, B + 39.5 * MM, "+971 50 476 6769", 7.4, MUTED, 0.9);
  plain(doc, w / 2, B + 44.5 * MM, "HELLO@SHAKLEK.COM", 6.6, MUTED, 0.9);
}, "trim 90x50, 3mm bleed. QR to the home page");

console.log("\nConfirmed by the founder, no longer open questions:");
// ⚠️ THIS LINE SAID "DRY CLEAN ONLY" UNTIL 2026-09-10, TWO DAYS AFTER SHE
// CHANGED IT. The label itself was already printing MACHINE WASH 30 GENTLE, so
// the script was contradicting its own artwork in the output a human reads to
// check the artwork. Exactly the staleness CLAUDE.md is about.
console.log("   care  = MACHINE WASH 30 GENTLE + professional-dry-clean symbol");
console.log("           (2026-09-08; valid because W300235 is mill pre-washed --");
console.log("            Shirley confirmed 2026-09-10. Unwashed linen shrinks 4-10%.)");
console.log("   origin = MADE IN UAE");
console.log("Both are legal disclosures on a garment sold in the UAE. Do not change either");
console.log("without her, and re-read that note before proposing wash-at-30.");
