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

// MOCKS_ONLY=1 writes only the mockup pages, so they can be rasterised and
// looked at. sips renders page 1 of a PDF and no more, and a spec sheet
// nobody has looked at is how the footer came to overlap a paragraph.
const MOCKS_ONLY = !!process.env.MOCKS_ONLY;
const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: "Shaklek artwork for suppliers", Author: "Shaklek" } });
doc.pipe(createWriteStream(path.join(OUT, MOCKS_ONLY ? "mock-check.pdf" : "send-to-supplier/READ-ME-FIRST-Shaklek-artwork.pdf")));

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

// Shared by the spec pages and the mockups, so they live outside both.
const lockLatin = shape("Italiana-Regular.ttf", "Shaklek", 46, (46 * 4) / 29);
const lockAr = shape("ReemKufi-Regular.ttf", "شكلك", 19);
const sheenBig = shape("ReemKufi-Regular.ttf", "ش", 60);
const sheenSmall = shape("ReemKufi-Regular.ttf", "ش", 34);

function specPages() {
  // ============================================================ page 1 — marks

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
}
if (!MOCKS_ONLY) specPages();

// ================================================== pages 3-4, the mockups
//
// A table says WHICH mark. A drawing says WHERE, HOW BIG and WHICH WAY UP,
// which is the half a supplier otherwise has to guess. Everything here is drawn
// to the proportions of the real item, with the marks at the size they print.
const LIN = "#DED3C0", LIN_D = "#C9BDA6", KRAFT = "#C8AB84", KRAFT_D = "#B0906A",
      TISSUE = "#EFE9DD", CARD = "#F6F2E9", HAIR2 = "#CFC6B4";

/** the full lockup drawn to a target width, centred on cx, top edge at topY */
function markAt(cx, topY, targetW, ink = INK, gold = GOLD) {
  const size = (targetW / lockLatin.width) * 46;
  const la = shape("Italiana-Regular.ttf", "Shaklek", size, (size * 4) / 29);
  const ar = shape("ReemKufi-Regular.ttf", "شكلك", size * 0.42);
  const rh = Math.max(0.5, size * 0.022);
  const st = stack(la, ar, rh);
  draw(la.segs, cx - la.width / 2, topY + st.latBase, ink);
  doc.rect(cx - (la.width * 0.32) / 2, topY + st.ruleY, la.width * 0.32, rh).fill(gold);
  draw(ar.segs, cx - ar.width / 2, topY + st.arBase, ink);
  return st.height;
}
/** the monogram drawn to a target ink height, centred on cx, baseline at baseY */
function monoAt(cx, baseY, targetH, ink = INK) {
  const sh = shape("ReemKufi-Regular.ttf", "ش", targetH / 0.72);
  draw(sh.segs, cx - sh.width / 2, baseY, ink);
}

function mockPage(title, items) {
  if (!(MOCKS_ONLY && firstMock)) doc.addPage();
  firstMock = false;
  let yy = 58;
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(MUTED)
    .text(title.toUpperCase(), M, yy, { characterSpacing: 1.5, width: CW });
  yy += 22;
  const cols = 2, cellW = (CW - 26) / cols, cellH = 336, artH = 250;
  items.forEach((it, i) => {
    const cx = M + (i % cols) * (cellW + 26);
    const cy = yy + Math.floor(i / cols) * cellH;
    doc.rect(cx, cy, cellW, artH).fillAndStroke("#FBF9F5", HAIR2);
    doc.save().rect(cx, cy, cellW, artH).clip();
    it.draw(cx + cellW / 2, cy, cellW);
    doc.restore();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text(it.title, cx, cy + artH + 10, { width: cellW });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(it.spec, cx, cy + artH + 22, { width: cellW, lineGap: 1.6 });
  });
}
let firstMock = true;

mockPage("What goes on what, drawn to proportion", [
  { title: "Linen drawstring bag",
    spec: "40 x 50 cm. Wordmark centred, one colour, about 90 mm wide, sitting at a third of the bag height. File: shaklek-logo-one-colour",
    draw(cx, cy, w) {
      const bw = w * 0.52, bh = 178, bx = cx - bw / 2, by = cy + 36;
      doc.roundedRect(bx, by, bw, bh, 3).fillAndStroke(LIN, LIN_D);
      doc.rect(bx, by, bw, 13).fill(LIN_D);
      doc.moveTo(bx + 6, by + 16).lineTo(bx + bw - 6, by + 16).strokeColor("#8D7F66").lineWidth(0.6).stroke();
      doc.circle(bx + bw * 0.32, by + 13, 1.4).fill("#8D7F66");
      doc.circle(bx + bw * 0.68, by + 13, 1.4).fill("#8D7F66");
      markAt(cx, by + bh * 0.30, bw * 0.62, "#3D3527", "#8D7F66");
    } },
  { title: "Woven brand label",
    spec: "About 45 x 18 mm, folded ends, sewn at the neck or waistband. Wordmark only. NO SIZE AND NO CARE TEXT on this one. File: shaklek-logo",
    draw(cx, cy, w) {
      const lw = w * 0.62, lh = 62, lx = cx - lw / 2, ly = cy + 94;
      doc.rect(lx, ly, lw, lh).fillAndStroke(CARD, HAIR2);
      doc.polygon([lx, ly + 5], [lx - 7, ly], [lx - 7, ly + lh], [lx, ly + lh - 5]).fill("#EDE7DA");
      doc.polygon([lx + lw, ly + 5], [lx + lw + 7, ly], [lx + lw + 7, ly + lh], [lx + lw, ly + lh - 5]).fill("#EDE7DA");
      markAt(cx, ly + 11, lw * 0.6);
    } },
  { title: "Care label",
    spec: "About 25 x 45 mm, satin, sewn to the SIDE SEAM so the brand label stays clean. Monogram, then fibre, wash symbols, origin. File: shaklek-monogram",
    draw(cx, cy, w) {
      const lw = 66, lh = 138, lx = cx - lw / 2, ly = cy + 56;
      doc.rect(lx, ly, lw, lh).fillAndStroke("#FAF7F1", HAIR2);
      doc.rect(lx, ly, lw, 8).fill("#EEE8DC");
      monoAt(cx, ly + 42, 21);
      doc.font("Helvetica").fontSize(5).fillColor(INK).text("100% LINEN", lx, ly + 54, { width: lw, align: "center", characterSpacing: 0.5 });
      doc.moveTo(lx + 12, ly + 70).lineTo(lx + lw - 12, ly + 70).strokeColor(HAIR2).lineWidth(0.5).stroke();
      doc.font("Helvetica").fontSize(4.5).fillColor(MUTED).text("wash symbols", lx, ly + 80, { width: lw, align: "center" });
      doc.font("Helvetica").fontSize(4.5).fillColor(MUTED).text("MADE IN UAE", lx, ly + 120, { width: lw, align: "center" });
    } },
  { title: "Hang tag",
    spec: "About 50 x 90 mm, card, cotton string. Wordmark in the upper half, ORDER REFERENCE below the rule. The tag carries the order number, the label does not. File: shaklek-logo",
    draw(cx, cy, w) {
      const tw = 78, th = 150, tx = cx - tw / 2, ty = cy + 50;
      doc.roundedRect(tx, ty, tw, th, 2).fillAndStroke("#EFE9DD", HAIR2);
      doc.circle(cx, ty + 15, 4).lineWidth(0.7).strokeColor("#B6AB94").stroke();
      doc.moveTo(cx - 16, ty - 8).bezierCurveTo(cx - 8, ty - 22, cx + 8, ty - 22, cx + 16, ty - 8)
        .lineWidth(0.7).strokeColor("#8D7F66").stroke();
      markAt(cx, ty + 36, tw * 0.62);
      doc.moveTo(tx + 16, ty + 100).lineTo(tx + tw - 16, ty + 100).strokeColor(HAIR2).lineWidth(0.5).stroke();
      doc.font("Helvetica").fontSize(4.5).fillColor(MUTED).text("ORDER", tx, ty + 108, { width: tw, align: "center", characterSpacing: 0.8 });
      doc.font("Helvetica").fontSize(7).fillColor(INK).text("A7F3C210", tx, ty + 118, { width: tw, align: "center", characterSpacing: 0.8 });
    } },
]);

mockPage("What goes on what, continued", [
  { title: "Thank-you card and envelope",
    spec: "A6, uncoated, letterpress or foil. Wordmark centred in the upper third, the message handwritten below. Returns and alterations on the back. File: shaklek-logo",
    draw(cx, cy, w) {
      const ew = w * 0.56, eh = 104, ex = cx - ew / 2 - 18, ey = cy + 26;
      doc.rect(ex, ey, ew, eh).fillAndStroke("#E9E2D4", HAIR2);
      doc.moveTo(ex, ey).lineTo(ex + ew / 2, ey + eh * 0.55).lineTo(ex + ew, ey).lineWidth(0.6).strokeColor(HAIR2).stroke();
      const cw2 = w * 0.54, ch2 = 108, cx2 = cx - cw2 / 2 + 26, cy2 = cy + 92;
      doc.rect(cx2, cy2, cw2, ch2).fillAndStroke("#FFFFFF", HAIR2);
      markAt(cx2 + cw2 / 2, cy2 + 18, cw2 * 0.5);
      for (let i = 0; i < 3; i++)
        doc.moveTo(cx2 + 18, cy2 + 74 + i * 10).lineTo(cx2 + cw2 - 18 - i * 12, cy2 + 74 + i * 10)
          .strokeColor("#C9C0AE").lineWidth(0.6).stroke();
    } },
  { title: "Tissue seal sticker",
    spec: "30 to 40 mm across, gold ground, mark reversed out in cream. Closes the tissue wrap. File: shaklek-gold-seal",
    draw(cx, cy, w) {
      doc.circle(cx, cy + 124, 46).fill(GOLD);
      monoAt(cx, cy + 140, 34, CREAM);
    } },
  { title: "Tissue wrap",
    spec: "50 x 70 cm, unbleached, two sheets per garment. Light wordmark repeat, kept faint so it reads as texture rather than print. File: shaklek-logo-one-colour",
    draw(cx, cy, w) {
      const pw = w * 0.74, ph = 176, px = cx - pw / 2, py = cy + 38;
      doc.rect(px, py, pw, ph).fillAndStroke(TISSUE, HAIR2);
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 2; c++)
          markAt(px + pw * (0.28 + c * 0.44), py + 20 + r * 52, pw * 0.26, "#B3A78E", "#B3A78E");
    } },
  { title: "Mailer",
    spec: "Recycled kraft, courier rated. SMALL monogram only, low on the face. Deliberately understated: a heavily branded parcel advertises what is worth stealing. File: shaklek-monogram",
    draw(cx, cy, w) {
      const mw = w * 0.72, mh = 150, mx = cx - mw / 2, my = cy + 50;
      doc.roundedRect(mx, my, mw, mh, 2).fill(KRAFT);
      doc.rect(mx, my, mw, 20).fill(KRAFT_D);
      for (let i = 0; i < 3; i++)
        doc.roundedRect(mx + 20, my + 44 + i * 15, mw * (0.5 - i * 0.08), 7, 1).fill("#A9865F");
      doc.circle(mx + mw - 34, my + mh - 34, 15).lineWidth(0.7).strokeColor("#7D6242").stroke();
      monoAt(mx + mw - 34, my + mh - 28, 13, "#7D6242");
    } },
]);


doc.end();
console.log("wrote branding/send-to-supplier/READ-ME-FIRST-Shaklek-artwork.pdf");
