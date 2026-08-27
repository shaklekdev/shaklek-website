/**
 * The one PDF to send a packaging supplier. Everything they need to quote and
 * to print without asking a question: which mark goes on which item, the
 * colours, the minimum sizes, and the one process that will not work.
 *
 *   node scripts/brand/generate-supplier-pdf.mjs      (run from website/)
 *
 * The marks are drawn as VECTOR OUTLINES, not text and not placed images, so
 * this file is itself usable artwork if a supplier prints straight from it.
 * There is no Arabic set as type anywhere in here: pdfkit does not shape Arabic
 * and would render شكلك as disconnected letters.
 */
import { openSync } from "fontkit";
import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const OUT = path.join(ROOT, "branding");
const FONTS = path.join(OUT, "source", "fonts");
mkdirSync(OUT, { recursive: true });

const INK = "#1A1A1A", GOLD = "#9C8445", MUTED = "#6d6659", HAIR = "#d8d2c6", CREAM = "#F5F0E8";

function shape(file, text, size, tracking = 0) {
  const font = openSync(path.join(FONTS, file));
  const scale = size / font.unitsPerEm;
  const layout = font.layout(text);
  const segs = []; let x = 0;
  layout.glyphs.forEach((g, i) => {
    const p = layout.positions[i];
    const d = g.path.toSVG();
    if (d) segs.push({ d, x: x + (p.xOffset || 0) * scale, y: -(p.yOffset || 0) * scale, s: scale });
    x += p.xAdvance * scale + tracking;
  });
  if (layout.glyphs.length) x -= tracking;
  // Ink extents relative to the baseline, from the glyph boxes and their own
  // offsets. Needed because A BASELINE IS NOT AN EDGE: the Latin sits on its
  // baseline with nothing below it, the Arabic's ink starts almost at its own,
  // so equal baseline gaps render as wildly unequal visual gaps. That shipped
  // once in the supplier artwork (39% above the rule against 3% below) and the
  // founder caught it.
  let above = 0, below = 0;
  layout.glyphs.forEach((g, i) => {
    const p = layout.positions[i], bb = g.bbox;
    if (!bb) return;
    above = Math.max(above, (bb.maxY + (p.yOffset || 0)) * scale);
    below = Math.max(below, -(bb.minY + (p.yOffset || 0)) * scale);
  });
  return { segs, width: x, above, below: Math.max(0, below) };
}

/** Stack a lockup so the visible gap above and below the rule is the same. */
function stack(latin, arabic, ruleH, gapRatio = 0.26) {
  const gap = latin.above * gapRatio;
  const latBase = latin.above;
  const ruleY = latBase + latin.below + gap;
  const arBase = ruleY + ruleH + gap + arabic.above;
  return { latBase, ruleY, arBase, height: arBase + arabic.below };
}

const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: "Shaklek artwork for suppliers", Author: "Shaklek" } });
doc.pipe(createWriteStream(path.join(OUT, "send-to-supplier", "READ-ME-FIRST-Shaklek-artwork.pdf")));

const W = doc.page.width, H = doc.page.height, M = 52, CW = W - M * 2;
let y = 0;

const draw = (segs, dx, dy, fill) => {
  doc.save().translate(dx, dy);
  for (const s of segs) doc.save().translate(s.x, s.y).scale(s.s, -s.s).path(s.d).fill(fill).restore();
  doc.restore();
};
const rule = (yy, colour = HAIR) => doc.moveTo(M, yy).lineTo(W - M, yy).strokeColor(colour).lineWidth(0.6).stroke();
const label = (t, yy) => doc.font("Helvetica-Bold").fontSize(7.5).fillColor(MUTED).text(t.toUpperCase(), M, yy, { characterSpacing: 1.5, width: CW });
const h2 = (t, yy) => doc.font("Helvetica-Bold").fontSize(13).fillColor(INK).text(t, M, yy, { width: CW });
const body = (t, yy, w = CW, size = 9.5) => {
  doc.font("Helvetica").fontSize(size).fillColor(MUTED).text(t, M, yy, { width: w, lineGap: 2.2 });
  return doc.y;
};

// ============================================================ page 1 — marks
const lockLatin = shape("Italiana-Regular.ttf", "Shaklek", 46, (46 * 4) / 29);
const lockAr = shape("ReemKufi-Regular.ttf", "شكلك", 19);
const sheenBig = shape("ReemKufi-Regular.ttf", "ش", 60);
const sheenSmall = shape("ReemKufi-Regular.ttf", "ش", 34);

y = 64;
const L1 = stack(lockLatin, lockAr, 1.1);
draw(lockLatin.segs, M, y + L1.latBase, INK);
doc.rect(M, y + L1.ruleY, lockLatin.width * 0.32, 1.1).fill(GOLD);
draw(lockAr.segs, M, y + L1.arBase, INK);

doc.font("Helvetica").fontSize(8).fillColor(MUTED)
  .text("ARTWORK FOR SUPPLIERS", W - M - 200, y + 6, { width: 200, align: "right", characterSpacing: 1.4 });
doc.font("Helvetica").fontSize(8).fillColor(MUTED)
  .text("Everything needed to quote and print. No fonts required.", W - M - 220, y + 20, { width: 220, align: "right" });

y = 150;
rule(y); y += 22;

label("The two marks", y); y += 20;

// lockup tile
const tileH = 118, tileW = (CW - 16) / 2;
doc.rect(M, y, tileW, tileH).fillAndStroke("#faf8f4", HAIR);
const l2 = shape("Italiana-Regular.ttf", "Shaklek", 30, (30 * 4) / 29);
const a2 = shape("ReemKufi-Regular.ttf", "شكلك", 12.5);
const L2 = stack(l2, a2, 0.9);
const tileTop = y + (tileH - L2.height) / 2;
draw(l2.segs, M + (tileW - l2.width) / 2, tileTop + L2.latBase, INK);
doc.rect(M + (tileW - l2.width * 0.32) / 2, tileTop + L2.ruleY, l2.width * 0.32, 0.9).fill(GOLD);
draw(a2.segs, M + (tileW - a2.width) / 2, tileTop + L2.arBase, INK);

doc.rect(M + tileW + 16, y, tileW, tileH).fillAndStroke("#faf8f4", HAIR);
draw(sheenBig.segs, M + tileW + 16 + tileW / 2 - 17, y + 88, INK);

y += tileH + 10;
doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("The wordmark", M, y, { width: tileW });
doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("The monogram", M + tileW + 16, y, { width: tileW });
y += 13;
doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
  .text("Name, gold rule, Arabic. The three pieces are centred on each other and never move apart. This is the logo.", M, y, { width: tileW, lineGap: 1.6 });
doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
  .text("The Arabic letter sheen, the first letter of the name. For anything too small for the wordmark, and the only mark that can be embroidered.", M + tileW + 16, y, { width: tileW, lineGap: 1.6 });

y += 56;
rule(y); y += 22;

// ---- which mark on which item
label("Which mark goes on which item", y); y += 20;

const rows = [
  ["Linen drawstring bag", "Wordmark, one colour", "shaklek-logo-one-colour", "Screen print. Ink to match the gold, or black."],
  ["Woven brand label", "Wordmark, colour", "shaklek-logo", "Weaving holds fine detail. No size, no care text on this one."],
  ["Care label", "Monogram", "shaklek-monogram", "Small. Fibre, care symbols and origin sit beside it."],
  ["Hang tag", "Wordmark, colour", "shaklek-logo", "Order reference printed below the mark."],
  ["Thank-you card", "Wordmark, colour", "shaklek-logo", "Letterpress or foil. Fine lines are what these are for."],
  ["Envelope", "Monogram", "shaklek-monogram", "Back flap, small."],
  ["Tissue seal sticker", "Seal", "shaklek-gold-seal", "Gold circle, cream mark. 30–40 mm."],
  ["Tissue wrap", "Wordmark, one colour", "shaklek-logo-one-colour", "Light repeat. Keep it faint."],
  ["Mailer", "Monogram, small", "shaklek-monogram", "Deliberately understated. A heavily branded parcel advertises what is worth stealing."],
  ["Paper bag", "Wordmark, one colour", "shaklek-logo-one-colour", "Hand-over only. Not used for courier orders."],
  ["Embroidery, anywhere", "Monogram ONLY", "shaklek-monogram.pdf", "See the note overleaf. The Latin cannot be stitched."],
];

doc.font("Helvetica-Bold").fontSize(7.5).fillColor(MUTED);
doc.text("ITEM", M, y, { width: 108, characterSpacing: 1 });
doc.text("MARK", M + 112, y, { width: 96, characterSpacing: 1 });
doc.text("FILE", M + 212, y, { width: 128, characterSpacing: 1 });
doc.text("NOTE", M + 344, y, { width: CW - 344, characterSpacing: 1 });
y += 12; rule(y); y += 7;

for (const [item, mark, file, note] of rows) {
  const noteH = doc.font("Helvetica").fontSize(8).heightOfString(note, { width: CW - 344, lineGap: 1.4 });
  const rowH = Math.max(noteH, 20);
  const top = y;
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(item, M, top, { width: 108, lineGap: 1.4 });
  doc.font("Helvetica").fontSize(8.5).fillColor(INK).text(mark, M + 112, top, { width: 96, lineGap: 1.4 });
  doc.font("Courier").fontSize(7.5).fillColor(GOLD).text(file, M + 212, top + 1, { width: 128 });
  doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(note, M + 344, top, { width: CW - 344, lineGap: 1.4 });
  y = top + rowH + 7;
  doc.moveTo(M, y - 3).lineTo(W - M, y - 3).strokeColor("#efeae0").lineWidth(0.5).stroke();
}

// ============================================== page 2 — colour, size, process
doc.addPage();
y = 60;
label("Colour", y); y += 20;

const sw = (x, yy, hex, name, cmyk, note) => {
  doc.rect(x, yy, 74, 46).fill(hex);
  doc.rect(x, yy, 74, 46).strokeColor(HAIR).lineWidth(0.5).stroke();
  doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text(name, x + 84, yy + 1, { width: 180 });
  doc.font("Courier").fontSize(8.5).fillColor(INK).text(hex.toUpperCase(), x + 84, yy + 14, { width: 180 });
  doc.font("Courier").fontSize(8).fillColor(MUTED).text(cmyk, x + 84, yy + 26, { width: 180 });
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text(note, x + 84, yy + 37, { width: 200 });
};
sw(M, y, INK, "Ink", "CMYK  0 / 0 / 0 / 100", "100% K for the mark. Rich black only on large solids.");
y += 56;
sw(M, y, GOLD, "Gold", "CMYK  0 / 15 / 56 / 39", "Used on the rule and the seal, nowhere else.");
y += 56;
sw(M, y, CREAM, "Cream", "CMYK  1 / 3 / 7 / 0", "The mark reversed out of the gold seal.");
y += 62;

y = body("The CMYK figures are a straight conversion and a starting point, not a specification. Gold shifts hard between coated paper, uncoated card, kraft and cloth, so please send a physical proof on the actual stock before any run. If you work in Pantone, propose a match against the printed proof rather than against the hex value.", y, CW) + 18;

rule(y); y += 18;

label("Minimum size and clear space", y); y += 20;

// clear space diagram
const dx = M, dy = y;
const lm = shape("Italiana-Regular.ttf", "Shaklek", 26, (26 * 4) / 29);
const am = shape("ReemKufi-Regular.ttf", "شكلك", 11);
const capH = 19;
const bx = dx + capH, by = dy + capH;
doc.rect(dx, dy, lm.width + capH * 2, capH * 2 + 56).dash(2, { space: 2 }).strokeColor(GOLD).lineWidth(0.7).stroke().undash();
const L3 = stack(lm, am, 0.9);
draw(lm.segs, bx, by + L3.latBase, INK);
doc.rect(bx + (lm.width - lm.width * 0.32) / 2, by + L3.ruleY, lm.width * 0.32, 0.9).fill(GOLD);
draw(am.segs, bx + (lm.width - am.width) / 2, by + L3.arBase, INK);

doc.font("Helvetica").fontSize(8).fillColor(MUTED)
  .text("Clear space on every side is the cap height of the wordmark: the height of the S. Nothing else prints inside the dashed line.", M + lm.width + capH * 2 + 22, dy + 4, { width: CW - lm.width - capH * 2 - 22, lineGap: 2 });

const minY = dy + 4 + 44;
doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text("Minimum sizes", M + lm.width + capH * 2 + 22, minY, { width: 220 });
doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
  .text("Wordmark   28 mm wide printed, 35 mm woven\nMonogram   9 mm.  Seal   30 mm diameter", M + lm.width + capH * 2 + 22, minY + 13, { width: 240, lineGap: 3 });

y = dy + capH * 2 + 56 + 18;
rule(y); y += 18;

label("Processes: what works and what does not", y); y += 20;

const proc = [
  ["Woven label", "Yes", "Weaving resolves finer detail than any other process here."],
  ["Screen print", "Yes", "Holds the thin strokes at bag scale."],
  ["Letterpress / foil", "Yes", "Fine lines are what these processes are for."],
  ["Hot stamp on kraft", "Proof first", "Kraft is rough. Ask for a proof on the real stock."],
  ["EMBROIDERY of the wordmark", "No", "Satin stitch needs about 1–1.5 mm of stroke. On a 35 mm wordmark the thin strokes are near 0.2 mm, so they will not stitch, and thickening them changes the mark."],
  ["EMBROIDERY of the monogram", "Yes", "Even strokes, no hairlines. Stitches cleanly at any size on any cloth. Use shaklek-monogram.pdf."],
];
for (const [name, verdict, note] of proc) {
  const nh = doc.font("Helvetica").fontSize(8).heightOfString(note, { width: CW - 200, lineGap: 1.4 });
  const top = y;
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(name, M, top, { width: 136, lineGap: 1.4 });
  const good = verdict === "Yes";
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(good ? "#3f6b46" : verdict === "No" ? "#8c3a3a" : GOLD)
    .text(verdict.toUpperCase(), M + 142, top, { width: 54 });
  doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(note, M + 200, top, { width: CW - 200, lineGap: 1.4 });
  y = top + Math.max(nh, 17) + 5;
  doc.moveTo(M, y - 2.5).lineTo(W - M, y - 2.5).strokeColor("#efeae0").lineWidth(0.5).stroke();
}

y += 8;
label("The files", y); y += 17;
y = body("SVG and PDF are vector: use these. PNG is transparent, for anything that cannot take vector. JPG is flattened onto white, or onto black for the reversed versions, for systems that cannot take transparency.", y, CW, 9) + 6;
y = body("Every file has its text converted to outlines. Nothing needs a font installed and nothing can be substituted. Please do not retype the name in a font. The artwork is the only correct version of it.", y, CW, 9);

// THE FOOTER USED TO COLLIDE WITH THE PARAGRAPH ABOVE IT. Both were positioned
// absolutely -- the body from the top, the footer from the bottom -- so they
// met in the middle and neither knew. This refuses to build rather than
// shipping an overlap to a supplier, which is the same class of defect as the
// tech pack clipping its own sentences off the right edge.
const FOOTER_Y = H - 46;
if (y > FOOTER_Y - 14) {
  throw new Error(`page 2 overflows: content ends at ${y.toFixed(0)}pt, footer sits at ${FOOTER_Y}pt. Shorten the copy.`);
}
doc.font("Helvetica").fontSize(7.5).fillColor(MUTED)
  .text("Questions on artwork: reply to whoever sent this. Please send a physical proof before any production run.", M, FOOTER_Y, { width: CW - 40 });
draw(sheenSmall.segs, W - M - 22, FOOTER_Y + 12, INK);
console.log(`page 2 content ends at ${y.toFixed(0)}pt, footer at ${FOOTER_Y}pt, clearance ${(FOOTER_Y - y).toFixed(0)}pt`);

doc.end();
console.log("wrote branding/send-to-supplier/READ-ME-FIRST-Shaklek-artwork.pdf");
