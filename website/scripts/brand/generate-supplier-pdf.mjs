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
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
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

// ---------------------------------------------------------------- the sizes
//
// The single source of truth for what this document says an item measures. It
// is checked against the artwork on disk below, not trusted.
//
// `mm` is the size of the ARTWORK FILE, which is not always the finished size:
// the business card file is 96 x 56 because it carries 3 mm of bleed and trims
// to 90 x 50, and the tissue file is one 250 x 250 tile for a 500 x 700 sheet.
// `size` is what the supplier reads; `mm` is what the file actually is.
const SIZES = [
  { item: "Linen drawstring bag", size: "500 x 400  (LANDSCAPE)", mat: "Cotton or linen, natural", print: "Screen print, 1 colour", files: ["08-linen-bag-print"], qty: "100–200", mm: [500, 400] },
  { item: "Woven brand label", size: "45 x 18", mat: "Woven, folded ends", print: "Woven", files: ["01-woven-brand-label"], qty: "500", mm: [45, 18] },
  { item: "Care label", size: "25 x 45", mat: "Satin, side seam", print: "Printed", files: ["02-care-label"], qty: "200", mm: [25, 45] },
  { item: "Hang tag", size: "50 x 90", mat: "Uncoated card, 300 gsm", print: "Print both sides", files: ["03-hang-tag", "03b-hang-tag-back"], qty: "500", mm: [50, 90] },
  { item: "Thank-you card", size: "148 x 105  (A6, LANDSCAPE)", mat: "Uncoated, 300 gsm", print: "Letterpress or foil", files: ["04-thank-you-card-front", "05-thank-you-card-back"], qty: "200", mm: [148, 105] },
  { item: "Envelope", size: "162 x 114  (C6, LANDSCAPE)", mat: "Uncoated, to match the card", print: "Back only, 1 colour", files: ["05b-thank-you-envelope-back"], qty: "200", mm: [162, 114] },
  { item: "Business card", size: "90 x 50 trim, 96 x 56 with bleed", mat: "Uncoated, 350 gsm", print: "Print both sides", files: ["10-business-card-front", "10b-business-card-back"], qty: "200–500", mm: [96, 56] },
  { item: "Tissue seal sticker", size: "40 diameter", mat: "Matt sticker, gold ground", print: "1 colour on gold", files: ["06-tissue-seal-40mm"], qty: "500", mm: [40, 40] },
  { item: "Tissue wrap sheet", size: "500 x 700  (tile is 250 x 250)", mat: "Unbleached tissue, 17 gsm", print: "Step and repeat, faint", files: ["07-tissue-wrap-repeat-tile"], qty: "500", mm: [250, 250] },
  { item: "Mailer", size: "320 x 400 internal, MINIMUM", mat: "Kraft paper, 120 gsm+, self-seal", print: "1 colour, small", files: ["09-mailer-placement"], qty: "200", mm: [320, 400] },
];

/**
 * ⚠️ THE CHECK THAT WOULD HAVE CAUGHT THIS WHOLE ROUND TRIP.
 *
 * On 2026-08-28 the business card was added to the artwork folder and this
 * spec sheet was not rebuilt. The supplier received twelve files and a
 * document describing ten of them, with no size on two of those. She wrote
 * back on 2026-08-29 asking for the envelope size, the mailer size and the
 * missing business cards, and quoted the mailer against a guess in the
 * meantime, because there was no dimension on the page to quote against.
 *
 * A rule in a markdown file saying "rebuild the spec sheet when you touch the
 * artwork" depends on somebody remembering. This does not: it reads the
 * artwork folder, and it refuses to write the PDF if
 *
 *   - an artwork file exists that this document never mentions, or
 *   - this document names a file that is not there, or
 *   - a size printed here disagrees with the actual MediaBox of the file.
 *
 * The last one matters most. A size is the one thing in this document a
 * supplier acts on with her own money, and it is written by hand here and
 * generated over there, so the two can drift silently.
 */
function auditArtworkAgainstSizes() {
  const dir = path.join(OUT, "send-to-supplier", "artwork");
  const onDisk = readdirSync(dir).filter((f) => f.endsWith(".pdf")).map((f) => f.replace(/\.pdf$/, "")).sort();
  const named = SIZES.flatMap((r) => r.files).sort();
  const problems = [];
  const PT_PER_MM = 2.8346457;

  for (const f of onDisk) if (!named.includes(f)) problems.push(`artwork/${f}.pdf exists but no row in this document mentions it`);
  for (const f of named) if (!onDisk.includes(f)) problems.push(`this document names ${f}.pdf, which is not in artwork/`);

  for (const row of SIZES) {
    for (const f of row.files) {
      const file = path.join(dir, `${f}.pdf`);
      if (!existsSync(file)) continue;
      const raw = readFileSync(file, "latin1");
      const m = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
      if (!m) { problems.push(`${f}.pdf has no readable MediaBox`); continue; }
      const [gotW, gotH] = [+m[1] / PT_PER_MM, +m[2] / PT_PER_MM];
      const [wantW, wantH] = row.mm;
      if (Math.abs(gotW - wantW) > 0.5 || Math.abs(gotH - wantH) > 0.5)
        problems.push(`${row.item}: this document says the file is ${wantW} x ${wantH} mm, ` +
          `but ${f}.pdf is ${gotW.toFixed(1)} x ${gotH.toFixed(1)} mm`);
    }
  }

  // ---- and the plain-text README, which is the first thing the supplier opens
  //
  // ⚠️ ADDED 2026-08-29 BECAUSE IT WAS ALREADY WRONG. The bag mark was raised
  // from 90 mm to 110 mm and the card was turned landscape; the PDF and the
  // artwork both followed, and READ-ME-FIRST.txt kept saying "90 mm wide" and
  // "105 x 148" until somebody read the whole file by eye. It is a hand-written
  // text file describing generated artwork, which is exactly the pairing that
  // drifts -- and it is the document a supplier reads FIRST.
  const readmePath = path.join(OUT, "send-to-supplier", "READ-ME-FIRST.txt");
  if (existsSync(readmePath)) {
    const txt = readFileSync(readmePath, "utf8");
    const listed = new Set();
    // lines like:  artwork/01-woven-brand-label.pdf   45 x 18 mm   wordmark only
    //              artwork/06-tissue-seal-40mm.pdf     40 mm dia   gold ...
    for (const m of txt.matchAll(/artwork\/([\w.-]+)\.pdf\s+(\d+)\s*(?:x\s*(\d+))?\s*mm/g)) {
      const [, name, a, b] = m;
      listed.add(name);
      const want = b ? [+a, +b] : [+a, +a];   // "40 mm dia" is a 40 x 40 file
      const file = path.join(dir, `${name}.pdf`);
      if (!existsSync(file)) { problems.push(`READ-ME-FIRST.txt lists ${name}.pdf, which is not in artwork/`); continue; }
      const mb = readFileSync(file, "latin1").match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
      if (!mb) continue;
      const got = [+mb[1] / PT_PER_MM, +mb[2] / PT_PER_MM];
      if (Math.abs(got[0] - want[0]) > 0.5 || Math.abs(got[1] - want[1]) > 0.5)
        problems.push(`READ-ME-FIRST.txt says ${name}.pdf is ${want[0]} x ${want[1]} mm, ` +
          `but the file is ${got[0].toFixed(0)} x ${got[1].toFixed(0)} mm`);
    }
    for (const f of onDisk) if (!listed.has(f)) problems.push(`READ-ME-FIRST.txt does not list artwork/${f}.pdf`);

    // Values that live in prose in that file and nowhere a size check can see.
    // Each one has been wrong at least once. Keep this list short and real:
    // it is worth having only while every entry is a value a supplier acts on.
    const mustSay = [
      [/110\s*mm/i, "the bag wordmark width (110 mm)"],
      [/148\s*(mm\s*)?(WIDE\s*)?x\s*105/i, "the landscape card size (148 x 105)"],
      [/162\s*(mm\s*)?(WIDE\s*)?x\s*114/i, "the landscape envelope size (162 x 114)"],
      [/120\s*gsm/i, "the kraft mailer weight (120 gsm)"],
      [/WALLET/, "that the envelope must be a WALLET, not a pocket"],
    ];
    for (const [re, what] of mustSay)
      if (!re.test(txt)) problems.push(`READ-ME-FIRST.txt never states ${what}`);

    const mustNotSay = [
      [/90\s*mm\s*(wide|WIDE)/, "the old 90 mm bag mark"],
      [/250\s*x\s*350/, "the old 250 x 350 mailer"],
      [/A7F3C210/, "the withdrawn hang-tag order number"],
    ];
    for (const [re, what] of mustNotSay)
      if (re.test(txt)) problems.push(`READ-ME-FIRST.txt still mentions ${what}`);
  }

  if (problems.length) {
    console.error("\nThe spec sheet and the artwork folder disagree:\n");
    for (const p of problems) console.error(`  ✗ ${p}`);
    console.error("\nFix one or the other, then rebuild. Do not send a sheet that");
    console.error("describes different files from the ones in the folder.\n");
    process.exit(1);
  }
  console.log(`artwork audit: ${onDisk.length} files — spec sheet, README and MediaBoxes all agree`);
}
auditArtworkAgainstSizes();

// MOCKS_ONLY=1 writes only the mockup pages, so they can be rasterised and
// looked at. sips renders page 1 of a PDF and no more, and a spec sheet
// nobody has looked at is how the footer came to overlap a paragraph.
const MOCKS_ONLY = !!process.env.MOCKS_ONLY;
const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: "Shaklek artwork for suppliers", Author: "Shaklek" } });
doc.pipe(createWriteStream(path.join(OUT, MOCKS_ONLY ? "mock-check.pdf" : "send-to-supplier/READ-ME-FIRST-Shaklek-artwork.pdf")));

// PAGE COUNT, ASSERTED. pdfkit adds a page by itself the moment any text runs
// past the bottom of the current one, and says nothing about it. That is how
// this document silently became twelve pages: one mockup group held five items
// in a four-cell grid. The individual overflow guards below each catch their
// own case; this catches every case, including the next one nobody predicted.
const EXPECTED_PAGES = 7;
let pageCount = 1;
const _addPage = doc.addPage.bind(doc);
doc.addPage = (...a) => { pageCount++; return _addPage(...a); };

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

// The material palette. Declared HERE, above specPages(), because the parcel
// diagram on page 3 uses it and const is in the temporal dead zone until its
// declaration runs -- left below, specPages() threw ReferenceError.
const LIN = "#DED3C0", LIN_D = "#C9BDA6", KRAFT = "#C8AB84", KRAFT_D = "#B0906A",
      TISSUE = "#EFE9DD", CARD = "#F6F2E9", HAIR2 = "#CFC6B4";

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

  // ⚠️ ADD AN ITEM HERE AND ADD IT TO `SIZES` TOO. SIZES is audited against the
  // artwork folder on every build (see auditArtworkAgainstSizes); this list is
  // prose and is not, so it is the half that can silently fall behind.
  const rows = [
    ["Linen drawstring bag", "Wordmark, one colour", "shaklek-logo-one-colour", "Screen print. Ink to match the gold, or black."],
    ["Woven brand label", "Wordmark, colour", "shaklek-logo", "Weaving holds fine detail. No size, no care text here."],
    ["Care label", "Monogram", "shaklek-monogram", "Small. Fibre, care symbols and origin sit beside it."],
    ["Hang tag", "Wordmark, colour", "shaklek-logo", "Double sided. Mark front, the three values back. No variable data."],
    ["Thank-you card", "Wordmark, colour", "shaklek-logo", "Landscape, to match the envelope. Double sided, letterpress or foil."],
    ["Envelope", "Monogram", "shaklek-monogram", "C6 landscape, wallet flap. Back only, 9 mm below the flap point."],
    ["Business card", "Wordmark reversed", "shaklek-logo-white-on-dark", "Ink front, cream back with a QR. The only item with bleed."],
    ["Tissue seal sticker", "Seal", "shaklek-gold-seal", "Gold circle, cream mark."],
    ["Tissue wrap", "Wordmark, one colour", "shaklek-logo-one-colour", "Light repeat. Keep it faint."],
    ["Mailer", "Monogram, small", "shaklek-monogram", "Understated: a branded parcel advertises what is worth stealing."],
    ["Paper bag", "Wordmark, one colour", "shaklek-logo-one-colour", "Hand-over only. Not used for courier orders."],
    ["Embroidery, anywhere", "Monogram ONLY", "shaklek-monogram.pdf", "See the note on page 4. The Latin cannot be stitched."],
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
  // Same guard as page 2's footer: this table grows every time an item is
  // added, and a row that runs off the bottom of an A4 page is invisible in a
  // PDF viewer -- it does not scroll, it simply is not there.
  if (y > H - 40) throw new Error(`page 1 table overflows: ends at ${y.toFixed(0)}pt on a ${H.toFixed(0)}pt page. Shorten the notes.`);
  console.log(`page 1 table ends at ${y.toFixed(0)}pt, page is ${H.toFixed(0)}pt`);

  // ==================================================== page 2 — SIZES
  //
  // THIS PAGE EXISTS BECAUSE THE SUPPLIER ASKED FOR IT, 2026-08-29:
  //   "What size and design should this envelope have? On thank you card and
  //    envelope, we don't see the size neither the design of the envelope.
  //    What are the dimensions of this kraft paper mailing envelope? Since you
  //    weren't online at the time, I checked the price using our standard
  //    courier bag size."
  //
  // She was right, and note what it cost: with no dimension on the page she
  // quoted against a guess, so the number that came back is a number for a bag
  // we may not want. Sizes WERE in this document -- buried one at a time in the
  // caption under each drawing, three pages apart, with the envelope and the
  // mailer missing entirely. A supplier quoting a job needs every dimension in
  // one place she can read down. That is what this page is.
  doc.addPage();
  y = 60;
  label("Every item, every dimension", y); y += 20;

  y = body("Everything below is a finished size in millimetres. Each one has a print-ready file in the artwork folder at exactly that size, with the marks and the wording already placed. Quantities are a first run and are indicative — please quote your own price breaks.", y, CW) + 14;

  const sizes = SIZES.map((r) => [r.item, r.size, r.mat, r.print, r.files.join(" + "), r.qty]);

  doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED);
  doc.text("ITEM", M, y, { width: 92, characterSpacing: 0.9 });
  doc.text("FINISHED SIZE (MM)", M + 94, y, { width: 116, characterSpacing: 0.9 });
  doc.text("MATERIAL", M + 214, y, { width: 108, characterSpacing: 0.9 });
  doc.text("PRINT", M + 326, y, { width: 82, characterSpacing: 0.9 });
  doc.text("QTY", W - M - 44, y, { width: 44, characterSpacing: 0.9 });
  y += 11; rule(y); y += 6;

  const QX = W - M - 44;
  for (const [item, size, mat, print, file, qty] of sizes) {
    const top = y;
    const hs = [
      doc.font("Helvetica-Bold").fontSize(8).heightOfString(item, { width: 92, lineGap: 1.2 }),
      doc.font("Helvetica-Bold").fontSize(8).heightOfString(size, { width: 116, lineGap: 1.2 }),
      doc.font("Helvetica").fontSize(8).heightOfString(mat, { width: 108, lineGap: 1.2 }),
      doc.font("Helvetica").fontSize(8).heightOfString(print, { width: 82, lineGap: 1.2 }),
    ];
    doc.font("Helvetica-Bold").fontSize(8).fillColor(INK).text(item, M, top, { width: 92, lineGap: 1.2 });
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD).text(size, M + 94, top, { width: 116, lineGap: 1.2 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(mat, M + 214, top, { width: 108, lineGap: 1.2 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(print, M + 326, top, { width: 82, lineGap: 1.2 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(qty, QX, top, { width: 44 });
    const rowH = Math.max(...hs);
    doc.font("Courier").fontSize(6.5).fillColor("#a79e8c").text(file, M, top + rowH + 1, { width: 300 });
    y = top + rowH + 11;
    doc.moveTo(M, y - 3).lineTo(W - M, y - 3).strokeColor("#efeae0").lineWidth(0.5).stroke();
  }

  y += 8;
  label("Three notes on the sizes above", y); y += 16;

  const sizeNotes = [
    ["The envelope is C6, and it is LANDSCAPE: 162 wide, 114 tall.", "It must be a WALLET envelope — flap hinged on the long edge, pointed, opening across the top — which is the card and invitation format. A pocket envelope is the same C6 sheet with the flap on the short edge, used portrait, and it is what invoices and statements come in. Same paper, same price, wrong object. THE CARD IS LANDSCAPE TOO, 148 x 105, so it slides straight in and comes straight out the right way up — about 7 mm of clearance along the long edge and 4.5 mm along the short one. A portrait card would have to be turned ninety degrees to go in and turned back to be read, which is a small constant awkwardness in the one moment the unboxing is meant to feel considered. C6 is a shelf size everywhere, so there is no die to pay for. THE FRONT PRINTS NOTHING — this envelope never travels on its own, it sits inside the bag inside the mailer, so it needs no address panel and no stamp box. The monogram sits on the back, 9 mm, centred below the point of the flap and not on the flap itself: on a gummed flap the ink meets the adhesive, and under a self-seal strip it is covered."],
    ["The mailer size is a MINIMUM, not a specification.", "320 x 400 mm internal is what the contents need: a folded garment is about 300 x 220 x 40 mm, and it goes inside a 50 x 40 cm cotton bag that folds to roughly 300 x 250 mm with loft, plus tissue, a card and a tag. Your nearest stock size at or above that is the right answer and the cheapest one — please do not cut a custom size for this. The artwork is a placement guide and the monogram is fixed in millimetres from the lower-right corner, so it stays correct whatever bag size you use."],
    ["The business card is the only item supplied with bleed.", "Both card files measure 96 x 56 mm because 3 mm is included on every edge. Trim to 90 x 50. The front prints edge to edge in near-black and without that bleed a small drift on the guillotine leaves a white line down one side. No crop marks are needed."],
  ];
  for (const [head, note] of sizeNotes) {
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(head, M, y, { width: CW });
    y = doc.y + 2;
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(note, M, y, { width: CW, lineGap: 1.8 });
    y = doc.y + 9;
  }

  if (y > H - 46) throw new Error(`page 2 (sizes) overflows: ends at ${y.toFixed(0)}pt, page is ${H.toFixed(0)}pt. Shorten the notes.`);
  console.log(`page 2 sizes end at ${y.toFixed(0)}pt, page is ${H.toFixed(0)}pt`);

  // ==================================== page 3 — how the parcel goes together
  //
  // ALSO STRAIGHT FROM THE SUPPLIER, 2026-08-29: "You want to use kraft paper
  // to wrap cotton bags — just for shipping? Will that be sturdy enough?"
  //
  // That is a misreading, and it is this document's fault for never drawing the
  // parcel. She saw a kraft item and a wrap item in a flat list of ten things
  // and reasonably assumed the kraft was the wrap. It is not: the kraft is the
  // OUTER MAILER and the wrap is unbleached tissue on the INSIDE. Nothing is
  // wrapped in kraft. A list of parts does not say how the parts nest, so this
  // page draws the section through the parcel, outside in.
  doc.addPage();
  y = 60;
  label("How the parcel goes together", y); y += 20;
  y = body("Five layers, outside in. This answers a question we were asked and should have answered here first: the kraft is the outer mailer, not a wrapping paper. Nothing is wrapped in kraft. The paper against the garment is unbleached tissue.", y, CW) + 16;

  const layers = [
    ["1", "Kraft mailer", "320 x 400 mm minimum, kraft paper 120 gsm or heavier, self-seal strip. The only layer the courier touches, and the only one the customer throws away. Small monogram, nothing else."],
    ["2", "Linen drawstring bag", "50 x 40 cm, LANDSCAPE — wider than it is tall. Wordmark screen printed. THIS IS THE BOX. It is what she keeps and reuses, and it is the reason there is no rigid box in this list."],
    ["3", "Tissue wrap", "Two sheets of unbleached tissue, 50 x 70 cm, faint wordmark repeat, closed with the 40 mm gold seal. This is the paper that touches the cloth."],
    ["4", "The garment", "Folded. Woven brand label at the neck or waistband, small satin care label at the side seam, hang tag on cotton string."],
    ["5", "Thank-you card in its C6 envelope", "Tucked inside the linen bag alongside the garment, with a business card. The card is handwritten, which is the whole point of it."],
  ];

  const diagX = M, diagW = 188;
  let ly = y;
  layers.forEach(([n, name, note], i) => {
    const inset = i * 15;
    const boxY = ly + inset, boxH = 172 - inset * 2;
    const tone = ["#C8AB84", LIN, TISSUE, "#E6DECC", "#FFFFFF"][i];
    doc.roundedRect(diagX + inset, boxY, diagW - inset * 2, boxH, 2)
      .fillAndStroke(tone, i === 0 ? KRAFT_D : HAIR2);
  });
  // Labelled outside the drawing, so no text sits on a tint it cannot be read on.
  let ty = y;
  layers.forEach(([n, name, note], i) => {
    doc.circle(diagX + diagW + 24, ty + 5, 6.5).fillAndStroke("#FBF9F5", HAIR2);
    doc.font("Helvetica-Bold").fontSize(7).fillColor(INK).text(n, diagX + diagW + 17, ty + 2.5, { width: 14, align: "center" });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text(name, diagX + diagW + 38, ty, { width: CW - diagW - 38 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(note, diagX + diagW + 38, doc.y + 1.5, { width: CW - diagW - 38, lineGap: 1.6 });
    ty = Math.max(doc.y + 10, ty + 34);
  });
  y = Math.max(ty, y + 180) + 8;

  rule(y); y += 18;
  label("Is kraft paper sturdy enough? Yes, and here is the specification", y); y += 18;
  y = body("A folded garment is soft goods: no corners, nothing rigid, nothing to crush. Kraft paper mailers are the normal choice for clothing and the failure is never the panel — it is the seal opening or an edge tearing in a sorting machine. So the specification is about the seal and the weight, not about padding:", y, CW) + 10;

  const kraftSpec = [
    ["Weight", "120 gsm or heavier. Below that it tears at the fold."],
    ["Closure", "Self-seal strip, full width. Tape across a paper mailer peels in the heat."],
    ["Lining", "None. Padded or honeycomb linings are for fragile goods; they add bulk, cost and courier weight and do nothing for folded cloth."],
    ["If in doubt", "Recycled poly is tougher and cheaper, and we do not want it: plastic contradicts the whole brand. Send us a sample of your 120 gsm kraft and we will decide on the real thing."],
  ];
  for (const [k, v] of kraftSpec) {
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(k, M, y, { width: 74 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(v, M + 82, y, { width: CW - 82, lineGap: 1.6 });
    y = doc.y + 7;
  }

  if (y > H - 46) throw new Error(`page 3 (parcel) overflows: ends at ${y.toFixed(0)}pt, page is ${H.toFixed(0)}pt. Shorten the notes.`);
  console.log(`page 3 parcel ends at ${y.toFixed(0)}pt, page is ${H.toFixed(0)}pt`);

  // ============================================== page 4 — colour, size, process
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
    throw new Error(`page 4 overflows: content ends at ${y.toFixed(0)}pt, footer sits at ${FOOTER_Y}pt. Shorten the copy.`);
  }
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED)
    .text("Questions on artwork: reply to whoever sent this. Please send a physical proof before any production run.", M, FOOTER_Y, { width: CW - 40 });
  draw(sheenSmall.segs, W - M - 22, FOOTER_Y + 12, INK);
  console.log(`page 4 content ends at ${y.toFixed(0)}pt, footer at ${FOOTER_Y}pt, clearance ${(FOOTER_Y - y).toFixed(0)}pt`);
}
if (!MOCKS_ONLY) specPages();

// ================================================== pages 3-4, the mockups
//
// A table says WHICH mark. A drawing says WHERE, HOW BIG and WHICH WAY UP,
// which is the half a supplier otherwise has to guess. Everything here is drawn
// to the proportions of the real item, with the marks at the size they print.

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

let capClearance = Infinity;
function mockPage(title, items) {
  if (items.length > 4)
    throw new Error(`mockPage("${title}") got ${items.length} items; the grid is 2 x 2. ` +
      `pdfkit will not complain -- it will silently auto-paginate and the page count drifts.`);
  if (!(MOCKS_ONLY && firstMock)) doc.addPage();
  firstMock = false;
  let yy = 58;
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(MUTED)
    .text(title.toUpperCase(), M, yy, { characterSpacing: 1.5, width: CW });
  yy += 22;
  // cellH was 336, which left the longest caption 2pt of clearance -- one word
  // from throwing. The captions carry every dimension now, so they need real
  // room. Two rows at 356 end at 792pt on an 842pt page, so this is free.
  const cols = 2, cellW = (CW - 26) / cols, cellH = 356, artH = 250;
  items.forEach((it, i) => {
    const cx = M + (i % cols) * (cellW + 26);
    const cy = yy + Math.floor(i / cols) * cellH;
    doc.rect(cx, cy, cellW, artH).fillAndStroke("#FBF9F5", HAIR2);
    doc.save().rect(cx, cy, cellW, artH).clip();
    it.draw(cx + cellW / 2, cy, cellW);
    doc.restore();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text(it.title, cx, cy + artH + 10, { width: cellW });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(it.spec, cx, cy + artH + 22, { width: cellW, lineGap: 1.6 });
    // The captions carry the dimensions now, so they are much longer than when
    // this grid was laid out. A caption that outgrows its cell runs into the
    // drawing of the item below it, or off the foot of the page -- silently,
    // because pdfkit just keeps writing. Same class of defect as the page 4
    // footer collision this file already guards against.
    const capBottom = cy + artH + 22 + doc.font("Helvetica").fontSize(8).heightOfString(it.spec, { width: cellW, lineGap: 1.6 });
    const cellBottom = cy + cellH - 8;
    if (capBottom > cellBottom)
      throw new Error(`mockup caption "${it.title}" overflows its cell by ${(capBottom - cellBottom).toFixed(0)}pt. Shorten the spec text.`);
    capClearance = Math.min(capClearance, cellBottom - capBottom);
  });
}
let firstMock = true;

mockPage("What goes on what, drawn to proportion", [
  { title: "Linen drawstring bag",
    spec: "500 x 400 mm, LANDSCAPE — wider than it is tall. Cotton or linen, drawstring. Wordmark centred, one colour, 110 mm wide, at a third of the bag height. This is what replaces a box — she keeps it and reuses it. File: 08-linen-bag-print",
    draw(cx, cy, w) {
      // LANDSCAPE, 500 x 400. Drawn tall until 2026-08-29; the founder turned
      // the real bag and a drawing of the wrong shape is worse than none,
      // because a supplier sets up the screen from it.
      const bw = w * 0.86, bh = bw * (400 / 500), bx = cx - bw / 2, by = cy + 62;
      doc.roundedRect(bx, by, bw, bh, 3).fillAndStroke(LIN, LIN_D);
      doc.rect(bx, by, bw, 13).fill(LIN_D);
      doc.moveTo(bx + 6, by + 16).lineTo(bx + bw - 6, by + 16).strokeColor("#8D7F66").lineWidth(0.6).stroke();
      doc.circle(bx + bw * 0.32, by + 13, 1.4).fill("#8D7F66");
      doc.circle(bx + bw * 0.68, by + 13, 1.4).fill("#8D7F66");
      // TO SCALE: 110 mm on a 500 mm bag is 22% of the width. It was drawn at
      // 62% of a narrower bag before the rotation, which was roughly three
      // times life size -- on a page whose own title says "drawn to
      // proportion", and from which a supplier may well set up the screen.
      // It looks modest because it IS modest; that is the useful information.
      markAt(cx, by + bh * 0.30, bw * (110 / 500), "#3D3527", "#8D7F66");
    } },
  { title: "Woven brand label",
    spec: "45 x 18 mm, woven, folded ends, sewn at the neck or waistband. Wordmark only. NO SIZE AND NO CARE TEXT on this one — that lives on the separate care label. File: 01-woven-brand-label",
    draw(cx, cy, w) {
      const lw = w * 0.62, lh = 62, lx = cx - lw / 2, ly = cy + 94;
      doc.rect(lx, ly, lw, lh).fillAndStroke(CARD, HAIR2);
      doc.polygon([lx, ly + 5], [lx - 7, ly], [lx - 7, ly + lh], [lx, ly + lh - 5]).fill("#EDE7DA");
      doc.polygon([lx + lw, ly + 5], [lx + lw + 7, ly], [lx + lw + 7, ly + lh], [lx + lw, ly + lh - 5]).fill("#EDE7DA");
      markAt(cx, ly + 11, lw * 0.6);
    } },
  { title: "Care label",
    spec: "25 x 45 mm, satin, sewn to the SIDE SEAM so the brand label stays clean. Monogram, then fibre, care symbols, origin, in English and Arabic. File: 02-care-label",
    draw(cx, cy, w) {
      const lw = 66, lh = 138, lx = cx - lw / 2, ly = cy + 56;
      doc.rect(lx, ly, lw, lh).fillAndStroke("#FAF7F1", HAIR2);
      doc.rect(lx, ly, lw, 8).fill("#EEE8DC");
      monoAt(cx, ly + 42, 21);
      doc.font("Helvetica").fontSize(5).fillColor(INK).text("100% LINEN", lx, ly + 54, { width: lw, align: "center", characterSpacing: 0.5 });
      doc.moveTo(lx + 12, ly + 70).lineTo(lx + lw - 12, ly + 70).strokeColor(HAIR2).lineWidth(0.5).stroke();
      // DRY CLEAN ONLY, not "wash symbols". The founder settled this on
      // 2026-08-28 and the artwork was rebuilt; this drawing was not, so the
      // sheet described a garment you could wash and the file said you could
      // not. It is a legal disclosure, so the two must not disagree.
      doc.font("Helvetica").fontSize(4.5).fillColor(MUTED).text("DRY CLEAN ONLY", lx, ly + 80, { width: lw, align: "center", characterSpacing: 0.3 });
      doc.font("Helvetica").fontSize(4.5).fillColor(MUTED).text("five care symbols", lx, ly + 92, { width: lw, align: "center" });
      doc.font("Helvetica").fontSize(4.5).fillColor(MUTED).text("MADE IN UAE", lx, ly + 120, { width: lw, align: "center" });
    } },
  // ⚠️ THE ORDER NUMBER CAME OFF THIS TAG on 2026-08-28 and this drawing still
  // showed it, because the artwork was regenerated and this sheet was not.
  // You cannot print a per-order code on a tag you buy five hundred of months
  // before those orders exist -- it turns a cheap bulk print into variable
  // data, which is a different quote. The tag is bulk stock now.
  { title: "Hang tag, front",
    spec: "50 x 90 mm, uncoated card 300 gsm, cotton string. Wordmark in the upper half, web address below the rule. NO order number — this is plain bulk stock, no variable data. File: 03-hang-tag",
    draw(cx, cy, w) {
      const tw = 78, th = 150, tx = cx - tw / 2, ty = cy + 50;
      doc.roundedRect(tx, ty, tw, th, 2).fillAndStroke("#EFE9DD", HAIR2);
      doc.circle(cx, ty + 15, 4).lineWidth(0.7).strokeColor("#B6AB94").stroke();
      doc.moveTo(cx - 16, ty - 8).bezierCurveTo(cx - 8, ty - 22, cx + 8, ty - 22, cx + 16, ty - 8)
        .lineWidth(0.7).strokeColor("#8D7F66").stroke();
      markAt(cx, ty + 36, tw * 0.62);
      doc.moveTo(tx + 16, ty + 100).lineTo(tx + tw - 16, ty + 100).strokeColor(HAIR2).lineWidth(0.5).stroke();
      doc.font("Helvetica").fontSize(5.5).fillColor(MUTED).text("SHAKLEK.COM", tx, ty + 112, { width: tw, align: "center", characterSpacing: 1.2 });
    } },
]);

mockPage("What goes on what, continued", [
  { title: "Hang tag, back",
    spec: "The same card, printed on the reverse: three values, each on a gold hairline, monogram at the foot. Printing both sides of one tag costs almost nothing more than one side and saves a separate insert. File: 03b-hang-tag-back",
    draw(cx, cy, w) {
      const tw = 78, th = 150, tx = cx - tw / 2, ty = cy + 50;
      doc.roundedRect(tx, ty, tw, th, 2).fillAndStroke("#EFE9DD", HAIR2);
      doc.circle(cx, ty + 15, 4).lineWidth(0.7).strokeColor("#B6AB94").stroke();
      const vals = ["100% CUSTOM-MADE", "100% NATURAL LINEN", "MADE IN THE UAE"];
      vals.forEach((t, i) => {
        const vy = ty + 46 + i * 25;
        doc.rect(cx - 9, vy - 3, 18, 0.8).fill(GOLD);
        doc.font("Helvetica").fontSize(5).fillColor(INK).text(t, tx, vy + 5, { width: tw, align: "center", characterSpacing: 0.4 });
      });
      monoAt(cx, ty + th - 14, 9, "#C9C0AE");
    } },
  { title: "Thank-you card",
    spec: "148 x 105 mm — A6 LANDSCAPE, matching the envelope so it slides straight in. Uncoated 300 gsm, letterpress or foil. Wordmark top, a printed line, then ruled guides she writes on by hand. Returns and a QR on the back. Files: 04 and 05",
    draw(cx, cy, w) {
      // LANDSCAPE since 2026-08-29, to match the envelope.
      const cw2 = w * 0.80, ch2 = cw2 * (105 / 148), cx2 = cx - cw2 / 2, cy2 = cy + 72;
      doc.rect(cx2, cy2, cw2, ch2).fillAndStroke("#FFFFFF", HAIR2);
      markAt(cx2 + cw2 / 2, cy2 + 11, cw2 * 0.28);
      doc.font("Helvetica").fontSize(5).fillColor(MUTED)
        .text("Thank you", cx2, cy2 + 36, { width: cw2, align: "center" });
      for (let i = 0; i < 3; i++)
        doc.moveTo(cx2 + 16, cy2 + 62 + i * 11).lineTo(cx2 + cw2 - 16, cy2 + 62 + i * 11)
          .strokeColor("#E4DCCB").lineWidth(0.5).stroke();
      doc.font("Helvetica").fontSize(4.5).fillColor("#B9B1A2")
        .text("ruled guides, printed faint", cx2, cy2 + ch2 - 10, { width: cw2, align: "center" });
    } },
  { title: "Envelope",
    spec: "C6 LANDSCAPE, 162 x 114 mm — a WALLET envelope, flap hinged on the LONG edge, not a portrait pocket one. The tinted triangle is the flap and does not print. Monogram 9 mm below the flap point, never on the flap. THE FRONT PRINTS NOTHING. File: 05b-thank-you-envelope-back",
    draw(cx, cy, w) {
      const ew = w * 0.88, eh = ew * (114 / 162), ex = cx - ew / 2, ey = cy + 84;
      doc.rect(ex, ey, ew, eh).fillAndStroke("#EFE8DA", HAIR2);
      // The wallet flap, TINTED so it reads as a flap at a glance. Drawn as
      // bare dashed lines it came out as a symmetrical X and you could not
      // tell the flap from the back seams.
      const apex = ey + eh * 0.58;
      doc.moveTo(ex, ey).lineTo(cx, apex).lineTo(ex + ew, ey).closePath().fill("#E2D9C6");
      doc.lineWidth(0.6).strokeColor("#C4B99F").dash(2.5, { space: 2.5 });
      doc.moveTo(ex, ey).lineTo(cx, apex).lineTo(ex + ew, ey).stroke();
      doc.undash();
      monoAt(cx, apex + (ey + eh - apex) * 0.42 + 5, 11);
      doc.font("Helvetica").fontSize(4.5).fillColor("#A79E8C")
        .text("BACK — the only face that prints", ex, ey + eh + 7, { width: ew, align: "center" });
    } },
  { title: "Business card, front",
    spec: "90 x 50 mm trim, supplied at 96 x 56 mm with 3 mm of bleed on every edge — the ONLY item here with bleed. Uncoated 350 gsm. Prints edge to edge in near-black with the mark reversed out in cream and gold. File: 10-business-card-front",
    draw(cx, cy, w) {
      const bw = w * 0.74, bh = bw * (50 / 90), bx = cx - bw / 2, by = cy + 60;
      // the bleed area, then the trim line, so the 3 mm is visible as a thing
      doc.rect(bx - 7, by - 7, bw + 14, bh + 14).fill("#E8E2D6");
      doc.rect(bx, by, bw, bh).fill(INK);
      doc.rect(bx, by, bw, bh).lineWidth(0.5).strokeColor("#FFFFFF").dash(2, { space: 2 }).stroke().undash();
      markAt(cx, by + bh * 0.28, bw * 0.40, CREAM, GOLD);
      doc.font("Helvetica").fontSize(4.5).fillColor("#8D8471")
        .text("dashed line = trim at 90 x 50. Grey = 3 mm bleed.", bx - 7, by + bh + 12, { width: bw + 14, align: "center" });
    } },
]);

mockPage("What goes on what, continued", [
  { title: "Business card, back",
    spec: "Cream ground, QR to the website, then the address, phone and email. PRINT THE QR EXACTLY AS SUPPLIED: do not redraw, rescale one axis, or crop the blank margin — that margin is part of the code and phones stop reading it. File: 10b-business-card-back",
    draw(cx, cy, w) {
      const bw = w * 0.74, bh = bw * (50 / 90), bx = cx - bw / 2, by = cy + 60;
      doc.rect(bx - 7, by - 7, bw + 14, bh + 14).fill("#E8E2D6");
      doc.rect(bx, by, bw, bh).fill(CREAM);
      // a stand-in block, deliberately not a real QR: the real one is in the file
      const qs = bh * 0.42, qx = cx - qs / 2, qy = by + bh * 0.10;
      doc.rect(qx, qy, qs, qs).fill(INK);
      doc.rect(qx + qs * 0.18, qy + qs * 0.18, qs * 0.64, qs * 0.64).fill(CREAM);
      doc.rect(qx + qs * 0.34, qy + qs * 0.34, qs * 0.32, qs * 0.32).fill(INK);
      doc.rect(cx - 7, by + bh * 0.60, 14, 0.7).fill(GOLD);
      doc.font("Helvetica").fontSize(5).fillColor(INK)
        .text("SHAKLEK.COM", bx, by + bh * 0.68, { width: bw, align: "center", characterSpacing: 1 });
      doc.font("Helvetica").fontSize(4.5).fillColor(MUTED)
        .text("+971 50 476 6769", bx, by + bh * 0.80, { width: bw, align: "center" });
    } },
  { title: "Tissue seal sticker",
    spec: "40 mm diameter, matt sticker, gold ground with the mark reversed out in cream. Closes the tissue wrap and seals the linen bag. File: 06-tissue-seal-40mm",
    draw(cx, cy, w) {
      doc.circle(cx, cy + 124, 46).fill(GOLD);
      monoAt(cx, cy + 140, 34, CREAM);
    } },
  { title: "Tissue wrap",
    spec: "Sheet 500 x 700 mm, unbleached tissue 17 gsm, two sheets per garment. The file is ONE 250 x 250 mm tile — step and repeat it across the sheet. Keep it faint: it should read as texture, not as print. File: 07-tissue-wrap-repeat-tile",
    draw(cx, cy, w) {
      const pw = w * 0.74, ph = 176, px = cx - pw / 2, py = cy + 38;
      doc.rect(px, py, pw, ph).fillAndStroke(TISSUE, HAIR2);
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 2; c++)
          markAt(px + pw * (0.28 + c * 0.44), py + 20 + r * 52, pw * 0.26, "#B3A78E", "#B3A78E");
    } },
  { title: "Mailer",
    spec: "Kraft paper, 120 gsm+, self-seal. MINIMUM 320 x 400 mm internal — your nearest stock size at or above that is fine, no custom size needed. Monogram only, 11 mm, 34 mm from the right edge and 28 mm up. Nothing else prints outside. File: 09-mailer-placement",
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


if (!MOCKS_ONLY && pageCount !== EXPECTED_PAGES)
  throw new Error(`expected ${EXPECTED_PAGES} pages, built ${pageCount}. ` +
    `Either something overflowed and pdfkit added a page, or a page was added on purpose ` +
    `and EXPECTED_PAGES was not updated. Look before you change the number.`);

doc.end();
console.log(`pages: ${pageCount}`);
console.log(`tightest mockup caption clearance: ${capClearance.toFixed(0)}pt`);
console.log("wrote branding/send-to-supplier/READ-ME-FIRST-Shaklek-artwork.pdf");
