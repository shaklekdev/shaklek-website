/**
 * The sheet you take into a supplier meeting.
 *
 *   node scripts/brand/generate-quote-sheet.mjs      (run from website/)
 *
 * Every packaging item drawn to proportion, its finishing spec, and an empty
 * box to write their price in. Quantity is 100 across the board, with a box
 * for their true minimum beside it, because the minimum is the thing that
 * actually decides what the first order costs.
 *
 * Sizes are NOT typed in here twice. They come from the artwork files on disk
 * and the build refuses if a size printed here disagrees with the real
 * MediaBox — the same audit generate-supplier-pdf.mjs runs, for the same
 * reason: a size is the one number on the page somebody spends money against.
 *
 * The marks are drawn as VECTOR OUTLINES via fontkit, never as type. pdfkit
 * does not shape Arabic and would set شكلك as disconnected letters.
 */
import { openSync } from "fontkit";
import PDFDocument from "pdfkit";
import { createWriteStream, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const ROOT = path.resolve(process.cwd(), "..");
export const FONTS = path.join(ROOT, "branding", "source", "fonts");
export const ARTWORK = path.join(ROOT, "branding", "send-to-supplier", "artwork");
const OUTFILE = path.join(os.homedir(), "Desktop", "Shaklek-packaging-quote-sheet.pdf");

export const INK = "#1A1A1A", GOLD = "#9C8445", MUTED = "#6d6659", HAIR = "#d8d2c6",
      CREAM = "#F5F0E8", RED = "#A6382C", PAPER = "#FBF8F2", LINEN = "#DED3C0",
      KRAFT = "#C8AB84";

export const PT = 2.8346457; // pt per mm
export const QTY = 100;      // her instruction: quote everything at 100

// ------------------------------------------------------------ text outlining

export function shape(file, text, size, tracking = 0) {
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
  let above = 0, below = 0;
  layout.glyphs.forEach((g, i) => {
    const p = layout.positions[i], bb = g.bbox;
    if (!bb) return;
    above = Math.max(above, (bb.maxY + (p.yOffset || 0)) * scale);
    below = Math.max(below, -(bb.minY + (p.yOffset || 0)) * scale);
  });
  return { segs, width: x, above, below: Math.max(0, below) };
}

export function drawShaped(doc, sh, x, baselineY, colour) {
  for (const s of sh.segs) {
    doc.save();
    doc.translate(x + s.x, baselineY + s.y);
    doc.scale(s.s, -s.s);
    doc.path(s.d).fill(colour);
    doc.restore();
  }
}

/**
 * The full lockup, fitted to a target width. A BASELINE IS NOT AN EDGE: the
 * Latin sits on its baseline with nothing below it and the Arabic's ink starts
 * almost at its own, so equal baseline gaps render as wildly unequal visual
 * ones. Gaps are measured from ink extents, as in generate-supplier-pdf.mjs.
 */
export function drawLockup(doc, cx, topY, targetW, colour = INK, rule = GOLD) {
  const probe = shape("Italiana-Regular.ttf", "Shaklek", 100, 6);
  const size = (100 * targetW) / probe.width;
  const lat = shape("Italiana-Regular.ttf", "Shaklek", size, size * 0.06);
  const ar = shape("ReemKufi-Regular.ttf", "شكلك", size * 0.52);
  const ruleH = Math.max(0.6, size * 0.022);
  const gap = lat.above * 0.26;
  const latBase = topY + lat.above;
  const ruleY = latBase + lat.below + gap;
  const arBase = ruleY + ruleH + gap + ar.above;

  drawShaped(doc, lat, cx - lat.width / 2, latBase, colour);
  doc.rect(cx - lat.width * 0.26, ruleY, lat.width * 0.52, ruleH).fill(rule);
  drawShaped(doc, ar, cx - ar.width / 2, arBase, colour);
  return arBase + ar.below - topY;
}

export function drawMonogram(doc, cx, topY, size, colour = INK) {
  const m = shape("ReemKufi-Regular.ttf", "ش", size);
  drawShaped(doc, m, cx - m.width / 2, topY + m.above, colour);
  return m.above + m.below;
}

// ------------------------------------------------------------- the item data
//
// `mm` is the size of the ARTWORK FILE, audited against disk below. `size` is
// what a supplier reads, which is not always the same: the business card file
// carries 3 mm of bleed and trims smaller, the tissue file is one tile of a
// bigger sheet, the mailer is a minimum rather than a specification.

export const ITEMS = [
  {
    n: "01", key: "bag", name: "Drawstring bag", hot: true,
    size: "500 x 400 mm  (LANDSCAPE)", mat: "Cotton or linen, undyed",
    process: "Screen print, one colour, one side",
    files: ["08-linen-bag-print"], mm: [500, 400],
    bullets: [
      ["Landscape. 500 wide x 400 tall, wider than it is tall.", 0],
      ["Wordmark 110 mm wide, centred, at about one third of the bag height.", 0],
      ["Screen print is priced BY THE RUN, not by image size. A bigger mark costs nothing extra.", 1],
      ["Ask the GSM of the cloth, and feel it. This is the piece she keeps.", 0],
      ["Drawstring not yet chosen: ask cord material, colour, one-side or both-side draw.", 1],
    ],
  },
  {
    n: "02", key: "brandlabel", name: "Woven brand label", hot: true,
    size: "45 x 18 mm  FINISHED", mat: "Woven damask, single-sided",
    process: "End fold, sewn at the two ends",
    files: ["01-woven-brand-label"], mm: [45, 18],
    bullets: [
      ["END FOLD. Both short ends folded to the back, sewn at each end. Not all four sides, not a loop.", 0],
      ["Single-sided. Nothing on the back. No size, no care text.", 0],
      ["45 x 18 mm IS THE FINISHED VISIBLE SIZE. Fold allowance is EXTRA woven length, about 6-10 mm per end, so roughly 61 mm woven. Weave 45 and fold it and you get a 29 mm label.", 1],
      ["Damask, and quote satin alongside. NOT taffeta: hairline strokes, and it sits against the neck.", 1],
      ["Ask how many THREAD COLOURS are in the price. Ink + gold rule + ground = three.", 0],
    ],
  },
  {
    n: "03", key: "carelabel", name: "Care label", hot: true,
    size: "25 x 45 mm  (PORTRAIT)", mat: "Printed satin, straight cut, sealed edges",
    process: "Sewn into the side seam",
    files: ["02-care-label"], mm: [25, 45],
    bullets: [
      ["PRINT EXACTLY FROM THE FILE. Do not retype any of it. The Arabic is a legal requirement under Federal Law 15/2020 and it breaks silently when re-set. Penalty AED 3,000 to 200,000.", 1],
      ["Smallest marks in the Arabic are 0.28 mm. Ask their print method and minimum feature size.", 1],
      ["SOLVENT-FAST, not only wash-fast. The garment is dry clean only. If thermal transfer, resin ribbon, not wax.", 1],
      ["If 0.3 mm is not safe, also quote a CENTRE-FOLD label printed 25 x 90 mm and folded: two faces, everything twice as large.", 0],
      ["Printed proof on the actual satin before any run. Not a PDF proof.", 0],
    ],
  },
  {
    n: "04", key: "hangtag", name: "Hang tag",
    size: "50 x 90 mm", mat: "Uncoated card, 300 gsm",
    process: "Print both sides. Hole 4.4 mm",
    files: ["03-hang-tag", "03b-hang-tag-back"], mm: [50, 90],
    bullets: [
      ["BOTH FACES PRINT, so this is a two-sided job. Front: the wordmark. Back: 100% CUSTOM-MADE / 100% NATURAL LINEN / MADE IN THE UAE.", 0],
      ["The hole is already in the artwork: 4.4 mm across, centred, 6.9 mm down from the top edge.", 0],
      ["The STRING is not specified. Ask what they offer and in what colour. No plastic loops.", 1],
      ["Ask whether the string and the threading are included in the price.", 1],
      ["Bulk stock, nothing personalised. Every tag identical, so it prints once and sits in a box.", 0],
      ["If they suggest hot foil, say yes but ask for a proof on the actual card. Fine strokes fill in on rough stock.", 0],
    ],
  },
  {
    n: "05", key: "card", name: "Thank-you card",
    size: "148 x 105 mm  (A6, LANDSCAPE)", mat: "Uncoated, 300 gsm",
    process: "Print both sides. Letterpress or foil possible",
    files: ["04-thank-you-card-front", "05-thank-you-card-back"], mm: [148, 105],
    bullets: [
      ["Landscape, to match the envelope. Same A6 sheet turned on its side, so the paper and the price do not move.", 0],
      ["The back carries a QR CODE. Print it exactly as supplied. Do not redraw, re-generate, re-colour, scale one axis, or crop into the blank margin around it.", 1],
      ["Uncoated stock. Ask to see and feel it. This is the piece she reads.", 0],
    ],
  },
  {
    n: "06", key: "envelope", name: "Envelope",
    size: "162 x 114 mm  (C6, LANDSCAPE)", mat: "Uncoated, to match the card",
    process: "Back prints only, one colour",
    files: ["05b-thank-you-envelope-back"], mm: [162, 114],
    bullets: [
      ["WALLET FLAP: hinged on the LONG edge, pointed, opening across the top. NOT a pocket envelope, which is the same C6 sheet with the flap on the short edge. Same paper, same price, wrong object.", 1],
      ["ONLY THE BACK PRINTS. The front carries nothing: no address panel, no stamp box. It never travels alone.", 0],
      ["Monogram sits BELOW the point of the flap, not on the flap, where ink meets the adhesive.", 0],
      ["C6 is a shelf size, so there should be NO DIE CHARGE. Confirm that out loud.", 1],
    ],
  },
  {
    n: "07", key: "bizcard", name: "Business card",
    size: "90 x 50 mm trim  (file is 96 x 56 with bleed)", mat: "Uncoated, 350 gsm",
    process: "Print both sides, edge to edge",
    files: ["10-business-card-front", "10b-business-card-back"], mm: [96, 56],
    bullets: [
      ["TRIM TO 90 x 50. The files are 96 x 56 because 3 mm of bleed is included on every edge.", 0],
      ["The front prints edge to edge in near-black. That is what the bleed is for: without it a small drift on the guillotine leaves a white line down one side.", 0],
      ["The back carries a QR CODE. Same rule as the thank-you card.", 1],
      ["Quantity never set. Ask for 100 and for 500: they are often close to the same money.", 1],
    ],
  },
  {
    n: "08", key: "seal", name: "Tissue seal",
    size: "40 mm diameter", mat: "Matt sticker, gold ground, mark in cream",
    process: "One colour on gold",
    files: ["06-tissue-seal-40mm"], mm: [40, 40],
    bullets: [
      ["MATT, not gloss. A gloss sticker looks like a price label.", 0],
      ["The biggest area of solid gold in the whole set, so this is the piece that decides whether the gold reads as gold or as khaki. See the colour page.", 1],
      ["Ask about adhesive strength: it must hold in transit and peel without tearing the tissue.", 0],
    ],
  },
  {
    n: "09", key: "tissue", name: "Tissue wrap",
    size: "500 x 700 mm sheet  (tile is 250 x 250)", mat: "Unbleached tissue, 17 gsm",
    process: "Step and repeat, one colour",
    files: ["07-tissue-wrap-repeat-tile"], mm: [250, 250],
    bullets: [
      ["The artwork is ONE TILE. Step and repeat it across the sheet.", 0],
      ["KEEP IT FAINT. It should read as texture, not as print. Say this explicitly: the default is full strength.", 1],
      ["Unbleached stock, not white. Two sheets per garment, so 100 sheets is 50 orders.", 0],
    ],
  },
];


// ---- the wording that both documents share, so it cannot drift between them
export const SW = [["Ink", "#1A1A1A"], ["Gold", "#9C8445"], ["Natural linen", "#DED3C0"],
    ["Unbleached tissue", "#F1ECE1"], ["Kraft", "#C8AB84"]];

export const EVERYTHING = [
  "One colour wherever possible. The mark is a wordmark and a rule; one colour is dramatically cheaper on every process here.",
  "Both halves of the wordmark — Latin and Arabic — on everything the customer keeps: bag, tag, card, label. Not the Latin half alone.",
  "THE LOGO CANNOT BE EMBROIDERED. Its thin strokes are far below the minimum for satin stitch. If anything is to be stitched, stitch the monogram or the Arabic.",
  "Hot stamping on kraft needs a proof on the actual stock. Kraft is rough and fine strokes fill in.",
  "Italiana and Reem Kufi are both SIL Open Font Licence, so there is no licensing obstacle to outlined files.",
];

export const ASK = [
    "What is the TRUE MINIMUM order on each item — not the quantity I asked for, the floor.",
    "Price at 100 and at 500, both written down.",
    "List SETUP CHARGES SEPARATELY — plates, screens, dies, weaving setup, colour matching. A low unit price with a bundled setup fee is not a low price.",
    "What does a sample cost, and is it credited against the order if I proceed?",
    "A PHYSICAL PROOF ON THE REAL MATERIAL before any production run. Every item. Not negotiable.",
    "Lead time from artwork approval, per item — and which item is slowest, because that one sets the launch date.",
    "Shipping cost to Dubai and on what terms. DDP or FOB, who clears customs, and is duty inside the number you just gave me.",
    "What is the REORDER minimum? Can I come back for 100 later, or is it 500 again? This decides whether a big first order is actually cheaper.",
    "Payment terms and deposit. How much up front, how much on shipping.",
    "If production comes back different from the approved proof, WHO PAYS FOR THE RE-RUN?",
    "Can you make all ten items, or only some? One supplier means one shipment and one set of terms, which usually beats a better unit price spread over three.",
    "Are the artwork files usable exactly as supplied? If anything needs changing, tell me — do not fix it quietly.",
  ];

export const NEVER = [
    "Retyping any text, in any language. Especially the Arabic: it is a legal disclosure and it breaks silently.",
    "Redrawing, re-generating, re-colouring or rescaling either QR code, or cropping into the blank margin around it.",
    "Embroidering the logo.",
    "A custom-cut mailer. Their nearest stock size at or above 320 x 400 mm is the right answer.",
    "Heavy branding on the outside of the mailer.",
    "A woven label made 45 mm long. 45 mm is what must be visible AFTER folding.",
    "Wash-fast ink on the care label when the garment is dry clean only.",
    "A paper bag for online orders. Nobody sees it.",
    "Skipping the physical proof to save time.",
    "Recycled poly mailers, however much tougher and cheaper they are.",
  ];

export const OPEN = [
    ["The gold", "Flat CMYK, metallic Pantone, or foil. Three looks, three prices, no decision on record."],
    ["The bag drawstring", "Cord material, colour, and whether it draws from one side or both."],
    ["The hang tag string", "Cord material and colour, and whether threading 100 tags is included in the price. The hole itself is already in the artwork at 4.4 mm."],
    ["Business card quantity", "Never set anywhere. 100 and 500 are often close to the same money — ask for both."],
    ["Which edge of the care label goes into the side seam", "Your tailor's call, not the supplier's. It decides whether the text reads upright or sideways on a finished garment."],
  ];

// ------------------------------------------------------- audit against disk

export function auditSizes() {
  const problems = [];
  for (const row of ITEMS) {
    for (const f of row.files) {
      const file = path.join(ARTWORK, `${f}.pdf`);
      if (!existsSync(file)) { problems.push(`${row.name}: artwork/${f}.pdf is missing`); continue; }
      const raw = readFileSync(file, "latin1");
      const m = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
      if (!m) { problems.push(`${f}.pdf has no readable MediaBox`); continue; }
      const gotW = +m[1] / PT, gotH = +m[2] / PT;
      const [wantW, wantH] = row.mm;
      if (Math.abs(gotW - wantW) > 0.5 || Math.abs(gotH - wantH) > 0.5)
        problems.push(`${row.name}: this sheet says ${wantW} x ${wantH} mm, but ${f}.pdf is ` +
          `${gotW.toFixed(1)} x ${gotH.toFixed(1)} mm`);
    }
  }
  if (problems.length) {
    console.error("\nRefusing to write the quote sheet:\n");
    for (const p of problems) console.error("  - " + p);
    console.error("");
    process.exit(1);
  }
}

// --------------------------------------------------------------- the drawings
//
// Each item is drawn to its true ASPECT RATIO inside the box it is given, so
// a landscape bag looks landscape and a portrait care label looks portrait.
// They are NOT to a common scale: a 45 mm label beside a 500 mm bag at one
// scale would be a speck.

export function fit(box, wmm, hmm) {
  const s = Math.min(box.w / wmm, box.h / hmm);
  const w = wmm * s, h = hmm * s;
  // Top-aligned, not centred: every block starts at the same y, so a wide flat
  // item floating in the middle of its box reads as a layout accident.
  return { x: box.x + (box.w - w) / 2, y: box.y, w, h, s };
}

export function dimLabel(doc, f, wmm, hmm) {
  doc.font("Helvetica").fontSize(6).fillColor(MUTED);
  doc.text(`${wmm} mm`, f.x, f.y + f.h + 4, { width: f.w, align: "center" });
  doc.save().rotate(-90, { origin: [f.x - 7, f.y + f.h / 2] });
  doc.text(`${hmm} mm`, f.x - 7 - 20, f.y + f.h / 2 - 4, { width: 40, align: "center" });
  doc.restore();
}

export const DRAW = {
  bag(doc, box) {
    const f = fit({ ...box, h: box.h - 12 }, 500, 400);
    doc.rect(f.x, f.y, f.w, f.h).fillAndStroke(LINEN, HAIR);
    // drawstring channel + two cords
    doc.moveTo(f.x, f.y + f.h * 0.14).lineTo(f.x + f.w, f.y + f.h * 0.14)
      .lineWidth(0.6).stroke(MUTED);
    // the cord itself, threaded through the channel and out at both sides
    doc.moveTo(f.x, f.y + f.h * 0.09).lineTo(f.x + f.w, f.y + f.h * 0.09)
      .lineWidth(0.9).stroke("#8A7C63");
    doc.moveTo(f.x, f.y + f.h * 0.09).lineTo(f.x - f.w * 0.05, f.y + f.h * 0.17)
      .moveTo(f.x + f.w, f.y + f.h * 0.09).lineTo(f.x + f.w * 1.05, f.y + f.h * 0.17)
      .lineWidth(0.9).stroke("#8A7C63");
    drawLockup(doc, f.x + f.w / 2, f.y + f.h * 0.34, f.w * 0.22);
    // the 110 mm mark width, called out
    const mw = f.w * (110 / 500);
    doc.moveTo(f.x + f.w / 2 - mw / 2, f.y + f.h * 0.62).lineTo(f.x + f.w / 2 + mw / 2, f.y + f.h * 0.62)
      .lineWidth(0.5).dash(1.5, { space: 1.5 }).stroke(RED).undash();
    doc.font("Helvetica").fontSize(5.5).fillColor(RED)
      .text("110 mm mark", f.x, f.y + f.h * 0.645, { width: f.w, align: "center" });
    dimLabel(doc, f, 500, 400);
  },

  brandlabel(doc, box) {
    // drawn as the WOVEN strip: 61 mm with the 45 mm visible zone inside it
    const f = fit({ ...box, h: box.h - 12 }, 61, 18);
    const foldW = f.w * (8 / 61);
    doc.rect(f.x, f.y, f.w, f.h).fillAndStroke(CREAM, HAIR);
    doc.rect(f.x, f.y, foldW, f.h).fill("#E4DCCB");
    doc.rect(f.x + f.w - foldW, f.y, foldW, f.h).fill("#E4DCCB");
    doc.rect(f.x + foldW, f.y, f.w - 2 * foldW, f.h).fillAndStroke(PAPER, INK);
    drawLockup(doc, f.x + f.w / 2, f.y + f.h * 0.17, (f.w - 2 * foldW) * 0.62);
    doc.lineWidth(0.5).dash(1.5, { space: 1.5 }).strokeColor(MUTED);
    doc.moveTo(f.x + foldW, f.y).lineTo(f.x + foldW, f.y + f.h).stroke();
    doc.moveTo(f.x + f.w - foldW, f.y).lineTo(f.x + f.w - foldW, f.y + f.h).stroke();
    doc.undash();
    doc.font("Helvetica").fontSize(5.5).fillColor(RED)
      .text("8 mm fold", f.x - 6, f.y + f.h + 4, { width: foldW + 12, align: "center" })
      .text("8 mm fold", f.x + f.w - foldW - 6, f.y + f.h + 4, { width: foldW + 12, align: "center" });
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(6)
      .text("45 mm VISIBLE", f.x + foldW, f.y + f.h + 4, { width: f.w - 2 * foldW, align: "center" });
    doc.font("Helvetica").fontSize(5.5).fillColor(MUTED)
      .text("about 61 mm woven, 18 mm tall", f.x - 20, f.y + f.h + 13, { width: f.w + 40, align: "center" });
  },

  carelabel(doc, box) {
    const f = fit({ ...box, h: box.h - 12 }, 25, 45);
    doc.rect(f.x, f.y, f.w, f.h).fillAndStroke(PAPER, INK);
    const u = f.h / 45;
    drawMonogram(doc, f.x + f.w / 2, f.y + 4 * u, 6 * u);
    const line = (yMM, wRatio, col) => {
      doc.rect(f.x + f.w * (1 - wRatio) / 2, f.y + yMM * u, f.w * wRatio, Math.max(0.7, 1.1 * u))
        .fill(col);
    };
    line(11, 0.62, MUTED); line(13.5, 0.72, INK);
    doc.rect(f.x + f.w * 0.2, f.y + 17 * u, f.w * 0.6, Math.max(0.5, 0.5 * u)).fill(GOLD);
    // five care symbols
    const sy1 = f.y + 21.5 * u, sy2 = f.y + 26.4 * u, r = 1.6 * u;
    [-1, 0, 1].forEach((i) => {
      const cx = f.x + f.w / 2 + i * 5.2 * u;
      doc.rect(cx - r, sy1 - r, r * 2, r * 2).lineWidth(0.5).stroke(INK);
      doc.moveTo(cx - r, sy1 - r).lineTo(cx + r, sy1 + r).moveTo(cx + r, sy1 - r).lineTo(cx - r, sy1 + r).stroke(INK);
    });
    [-1, 1].forEach((i) => {
      const cx = f.x + f.w / 2 + i * 3.2 * u;
      doc.circle(cx, sy2, r).lineWidth(0.5).stroke(INK);
    });
    line(30, 0.66, MUTED); line(32.6, 0.74, INK);
    doc.rect(f.x + f.w * 0.2, f.y + 36 * u, f.w * 0.6, Math.max(0.5, 0.5 * u)).fill(GOLD);
    line(39.5, 0.60, MUTED); line(42, 0.56, INK);
    dimLabel(doc, f, 25, 45);
  },

  hangtag(doc, box) {
    const half = { ...box, w: box.w / 2 - 6, h: box.h - 12 };
    const a = fit(half, 50, 90);
    const b = fit({ ...half, x: box.x + box.w / 2 + 6 }, 50, 90);
    for (const [f, isBack] of [[a, false], [b, true]]) {
      doc.rect(f.x, f.y, f.w, f.h).fillAndStroke(PAPER, INK);
      const u = f.h / 90;
      doc.circle(f.x + f.w / 2, f.y + 6.9 * u, 2.2 * u).lineWidth(0.5).stroke(MUTED);
      if (!isBack) {
        drawLockup(doc, f.x + f.w / 2, f.y + 34 * u, f.w * 0.62);
      } else {
        [24, 41, 58].forEach((yMM) => {
          doc.rect(f.x + f.w * 0.38, f.y + yMM * u, f.w * 0.24, Math.max(0.5, 0.5 * u)).fill(GOLD);
          doc.rect(f.x + f.w * 0.16, f.y + (yMM + 4) * u, f.w * 0.68, Math.max(0.7, 1.1 * u)).fill(INK);
        });
        drawMonogram(doc, f.x + f.w / 2, f.y + 76 * u, 7 * u, "#D9D2C4");
      }
      doc.font("Helvetica").fontSize(5.5).fillColor(MUTED)
        .text(isBack ? "BACK" : "FRONT", f.x, f.y + f.h + 4, { width: f.w, align: "center" });
    }
    doc.font("Helvetica").fontSize(6).fillColor(MUTED)
      .text("50 x 90 mm", box.x, box.y + box.h - 2, { width: box.w, align: "center" });
  },

  card(doc, box) {
    const f = fit({ ...box, h: box.h - 12 }, 148, 105);
    doc.rect(f.x + 3, f.y + 3, f.w, f.h).fill("#DDD6C8");
    doc.rect(f.x, f.y, f.w, f.h).fillAndStroke(PAPER, INK);
    drawLockup(doc, f.x + f.w / 2, f.y + f.h * 0.09, f.w * 0.30);
    const ty = shape("Italiana-Regular.ttf", "Thank you", f.h * 0.085);
    drawShaped(doc, ty, f.x + f.w / 2 - ty.width / 2, f.y + f.h * 0.375, INK);
    [0.44, 0.495, 0.55].forEach((r, i) => {           // the printed paragraph
      const w = f.w * (i === 2 ? 0.30 : 0.62);
      doc.rect(f.x + (f.w - w) / 2, f.y + f.h * r, w, 1).fill("#BDB5A4");
    });
    [0.70, 0.80, 0.90].forEach((r) => {               // room for the handwritten line
      doc.rect(f.x + f.w * 0.12, f.y + f.h * r, f.w * 0.76, 0.7).fill("#E0D6BE");
    });
    dimLabel(doc, f, 148, 105);
  },

  envelope(doc, box) {
    const f = fit({ ...box, h: box.h - 12 }, 162, 114);
    doc.rect(f.x, f.y, f.w, f.h).fillAndStroke(PAPER, INK);
    // WALLET flap: hinged on the LONG (top) edge, pointed
    doc.moveTo(f.x, f.y).lineTo(f.x + f.w / 2, f.y + f.h * 0.46).lineTo(f.x + f.w, f.y)
      .closePath().fillAndStroke("#EDE6D8", HAIR);
    drawMonogram(doc, f.x + f.w / 2, f.y + f.h * 0.56, f.h * 0.13);
    doc.font("Helvetica").fontSize(5.5).fillColor(RED)
      .text("WALLET FLAP — hinged on the long edge", f.x, f.y + f.h * 0.2, { width: f.w, align: "center" });
    doc.fillColor(MUTED).fontSize(5.5)
      .text("BACK. The front prints nothing.", f.x, f.y + f.h * 0.8, { width: f.w, align: "center" });
    dimLabel(doc, f, 162, 114);
  },

  bizcard(doc, box) {
    const f = fit({ ...box, h: box.h - 12 }, 96, 56);
    const bl = f.w * (3 / 96);
    doc.rect(f.x, f.y, f.w, f.h).fillAndStroke("#1A1A1A", HAIR);
    doc.rect(f.x + bl, f.y + bl, f.w - 2 * bl, f.h - 2 * bl)
      .lineWidth(0.6).dash(2, { space: 2 }).stroke("#9A9184").undash();
    drawLockup(doc, f.x + f.w / 2, f.y + f.h * 0.3, f.w * 0.34, CREAM, CREAM);
    doc.font("Helvetica").fontSize(5.5).fillColor("#B5AC9D")
      .text("dashed line = trim to 90 x 50", f.x, f.y + f.h - 11, { width: f.w, align: "center" });
    doc.font("Helvetica").fontSize(6).fillColor(MUTED)
      .text("96 x 56 mm with 3 mm bleed", f.x - 20, f.y + f.h + 4, { width: f.w + 40, align: "center" });
  },

  seal(doc, box) {
    const d = Math.min(box.w, box.h - 12);
    const cx = box.x + box.w / 2, cy = box.y + d / 2 + 2;
    doc.circle(cx, cy, d / 2).fill(GOLD);
    // THE SEAL CARRIES THE MONOGRAM ALONE. branding/README.md: the monogram is
    // "for anything too small for the logo: seals, tabs, the favicon". Drawing
    // the full lockup here was wrong and the founder caught it, 2026-08-29.
    drawMonogram(doc, cx, cy - d * 0.19, d * 0.42, CREAM);
    doc.font("Helvetica").fontSize(6).fillColor(MUTED)
      .text("40 mm diameter", box.x, cy + d / 2 + 6, { width: box.w, align: "center" });
  },

  tissue(doc, box) {
    const f = fit({ ...box, h: box.h - 12 }, 500, 700);
    doc.rect(f.x, f.y, f.w, f.h).fillAndStroke("#F1ECE1", HAIR);
    // 250 x 250 tile, stepped and repeated: 2 across, 2.8 down
    const t = f.w / 2;                       // one 250 x 250 mm tile
    doc.lineWidth(0.4).dash(1.5, { space: 2 }).strokeColor("#D6CDBA");
    doc.moveTo(f.x + t, f.y).lineTo(f.x + t, f.y + f.h).stroke();
    for (let j = 1; j * t < f.h; j++) doc.moveTo(f.x, f.y + j * t).lineTo(f.x + f.w, f.y + j * t).stroke();
    doc.undash();
    // THE WRAP CARRIES THE FULL LOCKUP, faint, in a BRICK OFFSET repeat. It is
    // the seal that carries the monogram alone; these two were drawn the wrong
    // way round and the founder caught it, 2026-08-29.
    doc.save();
    doc.rect(f.x, f.y, f.w, f.h).clip();
    const rowH = t / 2, markW = t * 0.44;
    for (let r = 0; r * rowH < f.h; r++) {
      const offset = (r % 2) ? t / 2 : 0;
      for (let c = -1; c < 3; c++)
        drawLockup(doc, f.x + offset + c * t + t / 2, f.y + r * rowH + rowH * 0.3,
          markW, "#C9B58C", "#BCA168");
    }
    doc.restore();
    doc.font("Helvetica").fontSize(5.5).fillColor(MUTED)
      .text("dashed = the 250 x 250 tile", f.x - 15, f.y + f.h + 4, { width: f.w + 30, align: "center" });
    doc.fontSize(6).text("500 x 700 mm sheet", f.x - 15, f.y + f.h + 12, { width: f.w + 30, align: "center" });
  },

  mailer(doc, box) {
    const f = fit({ ...box, h: box.h - 12 }, 320, 400);
    doc.rect(f.x, f.y, f.w, f.h).fillAndStroke(KRAFT, "#A98F6E");
    doc.moveTo(f.x, f.y + f.h * 0.16).lineTo(f.x + f.w, f.y + f.h * 0.16)
      .lineWidth(0.6).dash(2, { space: 2 }).stroke("#8A7050").undash();
    doc.font("Helvetica").fontSize(5.5).fillColor("#6B573D")
      .text("self-seal strip", f.x, f.y + f.h * 0.07, { width: f.w, align: "center" });
    drawMonogram(doc, f.x + f.w * 0.82, f.y + f.h * 0.84, f.h * 0.075, "#5C4A33");
    doc.fontSize(5.5).fillColor(RED)
      .text("nothing else on the outside", f.x, f.y + f.h * 0.46, { width: f.w, align: "center" });
    dimLabel(doc, f, 320, 400);
  },
};

// ------------------------------------------------------------------ chrome

export function priceRow(doc, x, y, w, boxes) {
  const gap = 8, bw = (w - gap * (boxes.length - 1)) / boxes.length;
  boxes.forEach((label, i) => {
    const bx = x + i * (bw + gap);
    doc.font("Helvetica-Bold").fontSize(6).fillColor(MUTED)
      .text(label.toUpperCase(), bx, y, { width: bw, characterSpacing: 0.5 });
    doc.rect(bx, y + 9, bw, 22).lineWidth(0.8).fillAndStroke("#FFFFFF", INK);
  });
  return 31 + 9;
}

export function bullets(doc, x, y, w, list) {
  let cy = y;
  for (const [text, critical] of list) {
    const colour = critical ? RED : INK;
    doc.rect(x, cy + 3.2, 4, critical ? 2 : 1.2).fill(critical ? RED : MUTED);
    doc.font(critical ? "Helvetica-Bold" : "Helvetica").fontSize(7.4).fillColor(colour);
    doc.text(text, x + 9, cy, { width: w - 9, lineGap: 1.1 });
    cy = doc.y + 4;
  }
  return cy - y;
}

export function pageFrame(doc, title, pageNo, docTitle = "PACKAGING QUOTE SHEET") {
  doc.font("Helvetica-Bold").fontSize(7).fillColor(MUTED)
    .text("SHAKLEK  ·  " + docTitle, 40, 28, { characterSpacing: 1.1 });
  doc.font("Helvetica").fontSize(7).fillColor(MUTED)
    .text(title, 40, 28, { width: 515, align: "right" });
  doc.moveTo(40, 42).lineTo(555, 42).lineWidth(0.6).stroke(HAIR);
  doc.font("Helvetica").fontSize(7).fillColor(HAIR)
    .text(String(pageNo), 40, 806, { width: 515, align: "center" });
}

export function checkList(doc, x, y, w, items) {
  let cy = y;
  for (const t of items) {
    doc.rect(x, cy + 0.5, 8, 8).lineWidth(0.8).fillAndStroke("#FFFFFF", INK);
    doc.font("Helvetica").fontSize(8).fillColor(INK)
      .text(t, x + 14, cy, { width: w - 14, lineGap: 1.3 });
    cy = doc.y + 5.5;
  }
  return cy - y;
}

// -------------------------------------------------------------------- build

import { pathToFileURL } from "node:url";

function main() {
  auditSizes();

  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
  doc.pipe(createWriteStream(OUTFILE));
  let pageNo = 0;
  const newPage = (title) => { doc.addPage(); pageNo++; pageFrame(doc, title, pageNo); };

  // QS_ONLY=n writes just page n, so any page can be rendered to PNG and looked
  // at. sips only ever rasterises page 1 of a PDF, and a page nobody has looked
  // at is a page nobody has checked.
  const ONLY = process.env.QS_ONLY ? Number(process.env.QS_ONLY) : 0;
  let logical = 0;
  const want = () => { logical++; return !ONLY || logical === ONLY; };

  let y = 0;

  // ---- page 1: cover + summary
  if (want()) {
  newPage("Take this into the meeting");
  y = 74;
  y += drawLockup(doc, 297.6, y, 130) + 26;

  doc.font("Helvetica-Bold").fontSize(21).fillColor(INK)
    .text("PACKAGING QUOTE SHEET", 40, y, { width: 515, align: "center", characterSpacing: 1.4 });
  y = doc.y + 8;
  doc.font("Helvetica").fontSize(9).fillColor(MUTED)
    .text("Ten items, drawn to proportion, with the finishing spec each supplier will ask for " +
      "and a box to write their price in.", 100, y, { width: 395, align: "center", lineGap: 2 });
  y = doc.y + 20;

  // fill-in header
  const fields = [["SUPPLIER", 250], ["DATE", 110], ["CONTACT", 155]];
  let fx = 40;
  for (const [label, fw] of fields) {
    doc.font("Helvetica-Bold").fontSize(6.5).fillColor(MUTED).text(label, fx, y, { characterSpacing: 0.6 });
    doc.moveTo(fx, y + 20).lineTo(fx + fw - 12, y + 20).lineWidth(0.8).stroke(INK);
    fx += fw;
  }
  y += 34;

  doc.rect(40, y, 515, 58).fillAndStroke("#FBEFED", RED);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(RED)
    .text("QUANTITY IS 100 FOR EVERY ITEM.", 52, y + 9, { characterSpacing: 0.4 });
  doc.font("Helvetica").fontSize(8).fillColor(INK)
    .text("Ask their true minimum for each one as well — that number, not the unit price, is what " +
      "decides what the first order actually costs. Every item also has a box for setup charges, " +
      "which is where a cheap unit price hides.", 52, y + 22, { width: 491, lineGap: 1.4 });
  y += 70;

  // summary table
  const COLS = [[26, "#"], [120, "ITEM"], [126, "SIZE"], [40, "QTY"], [88, "UNIT PRICE AED"], [60, "MOQ"], [55, "LEAD"]];
  doc.rect(40, y, 515, 15).fill("#E9E2D4");
  let cx = 40;
  for (const [w, label] of COLS) {
    doc.font("Helvetica-Bold").fontSize(6).fillColor(MUTED)
      .text(label, cx + 5, y + 5, { width: w - 8, characterSpacing: 0.6 });
    cx += w;
  }
  y += 15;
  for (const it of ITEMS) {
    doc.rect(40, y, 515, 21).fillAndStroke("#FFFFFF", HAIR);
    cx = 40;
    const cells = [it.n, it.name, it.size.replace(/\s*\(.*\)/, ""), String(QTY), "", "", ""];
    cells.forEach((v, i) => {
      const w = COLS[i][0];
      if (i >= 4) doc.rect(cx + 3, y + 3, w - 6, 15).lineWidth(0.7).stroke("#BBB2A0");
      else doc.font(i === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(i === 2 ? 6.4 : 7.2)
        .fillColor(i === 0 ? MUTED : INK)
        .text(v, cx + 5, y + (i === 2 ? 7 : 6.5), { width: w - 8, ellipsis: true, lineBreak: false });
      cx += w;
    });
    y += 21;
  }
  y += 12;
  doc.font("Helvetica-Bold").fontSize(8).fillColor(INK).text("TOTAL PER ORDER", 40, y + 6);
  doc.rect(180, y, 120, 22).lineWidth(0.9).stroke(INK);
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED)
    .text("Target is about AED 16 per order all in. The bag and the woven label are two thirds of it — " +
      "push hardest there.", 312, y + 2, { width: 243, lineGap: 1 });
  }

  // ---- pages 2-6: two items per page
  for (let i = 0; i < ITEMS.length; i += 2) {
    if (!want()) continue;
    newPage(`Items ${ITEMS[i].n}${ITEMS[i + 1] ? `–${ITEMS[i + 1].n}` : ""}`);
    for (let k = 0; k < 2; k++) {
      const it = ITEMS[i + k];
      if (!it) break;
      const top = 60 + k * 372;

      doc.rect(40, top, 515, 358).fillAndStroke("#FFFFFF", it.hot ? RED : HAIR);
      if (it.hot) doc.rect(40, top, 515, 358).lineWidth(1.2).stroke(RED);

      doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text(it.n, 54, top + 14);
      doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text(it.name, 72, top + 10);
      doc.font("Helvetica").fontSize(7.6).fillColor(MUTED)
        .text(`${it.size}   ·   ${it.mat}   ·   ${it.process}`, 72, top + 28, { width: 470 });

      doc.moveTo(54, top + 44).lineTo(541, top + 44).lineWidth(0.5).stroke(HAIR);

      // drawing on the left, bullets on the right
      DRAW[it.key](doc, { x: 56, y: top + 54, w: 190, h: 190 });
      bullets(doc, 262, top + 54, 279, it.bullets);

      priceRow(doc, 56, top + 268, 485,
        ["Unit price AED", "Setup / one-off", "Their minimum", "Lead time"]);
      doc.font("Helvetica").fontSize(6.5).fillColor(MUTED)
        .text("Notes", 56, top + 316);
      doc.moveTo(56, top + 340).lineTo(541, top + 340).lineWidth(0.5).stroke(HAIR);
    }
  }

  // ---- colour page
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

  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("APPLIES TO EVERYTHING", 40, y, { characterSpacing: 0.8 });
  y = doc.y + 8;
  y += checkList(doc, 40, y, 515, EVERYTHING) + 14;

  doc.rect(40, y, 515, 58).fillAndStroke("#F1ECE1", HAIR);
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK)
    .text("BEFORE YOU HAND OVER ANY FILE", 54, y + 10, { characterSpacing: 0.5 });
  doc.font("Helvetica").fontSize(8).fillColor(INK)
    .text("The text in several of the artwork PDFs is not outlined — it is live Helvetica, which a " +
      "supplier's printer will substitute. Sizes, materials and layouts are all correct, so quote from " +
      "them freely. Just say corrected production files are following.", 54, y + 24,
      { width: 487, lineGap: 1.3 });

  }

  // ---- questions page
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

  // ---- open questions page
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
    doc.font("Helvetica-Bold").fontSize(6).fillColor(MUTED).text("DECIDED TODAY", 372, y + 10, { characterSpacing: 0.6 });
    doc.rect(372, y + 19, 169, 30).lineWidth(0.8).stroke(INK);
    y += 70;
  }

  doc.font("Helvetica").fontSize(7).fillColor(HAIR)
    .text("Sizes read from branding/send-to-supplier/artwork/ and audited against this sheet on every build.  " +
      "Costs and quantities from branding/packaging.md.  Colours from branding/README.md.",
      40, 782, { width: 515, align: "center", lineGap: 1.2 });

  }

  doc.end();
  console.log("Wrote " + OUTFILE + (ONLY ? `  (page ${ONLY} only)` : ""));

}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
