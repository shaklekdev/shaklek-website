/**
 * Generates the entire Shaklek logo pack from the two font files, in every
 * format a supplier asks for, plus the PDF spec sheet to send with them.
 *
 *   node scripts/brand/generate-logo.mjs        (run from website/)
 *
 * WHY THIS IS A COMMITTED SCRIPT AND NOT A ONE-OFF: the artwork has been
 * regenerated three times already -- once for the wordmark, once for the
 * monogram, once when the monogram turned out to be centred wrong -- and each
 * time the favicon had to be rebuilt from the same bytes or the screen mark and
 * the printed mark would have drifted apart. The fonts live beside the output
 * so this runs offline and produces identical files a year from now.
 *
 * TWO THINGS NOT TO HAND-ROLL, both learned the hard way:
 *
 *  1. ARABIC SHAPING. شكلك is four JOINING letters and Reem Kufi builds ش from
 *     س plus its dots. Two hand-written attempts produced disconnected letters
 *     that rendered, exported and passed every automated check while being
 *     obviously wrong to any Arabic reader. fontkit shapes it properly.
 *
 *  2. CENTRING. Positioning the monogram from glyph bounding boxes put it flush
 *     against the top edge with a third of the canvas empty below, because the
 *     dots are a separate glyph with their own offset. Everything here is
 *     centred on RASTERISED INK, measured, not on font metrics.
 */
import { openSync } from "fontkit";
import sharp from "sharp";
import PDFDocument from "pdfkit";
import { readFileSync, writeFileSync, mkdirSync, createWriteStream } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const OUT = path.join(ROOT, "branding", "logo");
const FONTS = path.join(OUT, "fonts");
mkdirSync(OUT, { recursive: true });

const INK = "#1A1A1A";
const GOLD = "#9C8445";
const CREAM = "#F5F0E8";

// ---------------------------------------------------------------- shaping
function shape(fontFile, text, sizePx, trackingPx = 0) {
  const font = openSync(path.join(FONTS, fontFile));
  const scale = sizePx / font.unitsPerEm;
  const layout = font.layout(text);
  const segs = [];
  let x = 0;
  layout.glyphs.forEach((g, i) => {
    const p = layout.positions[i];
    const d = g.path.toSVG();
    if (d) segs.push({ d, x: x + (p.xOffset || 0) * scale, y: -(p.yOffset || 0) * scale, scale });
    x += p.xAdvance * scale + trackingPx;
  });
  if (layout.glyphs.length) x -= trackingPx;
  return { segs, width: x, glyphs: layout.glyphs.length };
}

const svgOf = (segs) =>
  segs.map((s) => `<path transform="translate(${s.x.toFixed(3)} ${s.y.toFixed(3)}) scale(${s.scale.toFixed(6)} ${(-s.scale).toFixed(6)})" d="${s.d}"/>`).join("");

const SIZE = 200;
const TRACK = (SIZE * 4) / 29;                 // the site's optical tracking, 4px at 29px
const latin = shape("Italiana-Regular.ttf", "Shaklek", SIZE, TRACK);
const arabic = shape("ReemKufi-Regular.ttf", "شكلك", SIZE * 0.42, 0);
const sheen = shape("ReemKufi-Regular.ttf", "ش", SIZE, 0);

// ------------------------------------------------------- measured centring
const PROBE = 2000, N = 900;
async function inkBounds(svg) {
  const box = parseFloat(svg.match(/viewBox="0 0 ([0-9.]+)/)[1]);
  const buf = await sharp(Buffer.from(svg), { density: 72 }).resize(N, N, { fit: "fill" }).ensureAlpha().raw().toBuffer();
  let minX = N, maxX = -1, minY = N, maxY = -1;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (buf[(y * N + x) * 4 + 3] > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const px = box / N;
  return { x: minX * px, y: minY * px, w: (maxX - minX + 1) * px, h: (maxY - minY + 1) * px, box };
}

const doc = (w, h, body, label) =>
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" width="${Math.round(w)}" height="${Math.round(h)}" role="img" aria-label="${label}">
  <title>${label}</title>
  <desc>Shaklek. Latin in Italiana, Arabic in Reem Kufi, converted to outlines. No fonts required.</desc>
${body}</svg>
`;

// ---------------------------------------------------------------- lockup
const RULE_W = latin.width * 0.32, RULE_H = Math.max(1.6, SIZE * 0.009);
const PAD = SIZE * 0.18, CAP = SIZE * 0.74, GAP1 = SIZE * 0.30, GAP2 = SIZE * 0.36;
const LW = Math.max(latin.width, arabic.width, RULE_W);
const latBase = PAD + CAP, ruleY = latBase + GAP1, arBase = ruleY + RULE_H + GAP2;
const lockW = LW + PAD * 2, lockH = arBase + SIZE * 0.42 * 0.30 + PAD;

const lockupBody = (ink, gold) =>
`  <g fill="${ink}" transform="translate(${(PAD + (LW - latin.width) / 2).toFixed(2)} ${latBase.toFixed(2)})">${svgOf(latin.segs)}</g>
  <rect x="${(PAD + (LW - RULE_W) / 2).toFixed(2)}" y="${ruleY.toFixed(2)}" width="${RULE_W.toFixed(2)}" height="${RULE_H.toFixed(2)}" fill="${gold}"/>
  <g fill="${ink}" transform="translate(${(PAD + (LW - arabic.width) / 2).toFixed(2)} ${arBase.toFixed(2)})">${svgOf(arabic.segs)}</g>
`;

const oneLine = (piece, ink) => {
  const src = piece === "latin" ? latin : arabic;
  const h = piece === "latin" ? CAP : SIZE * 0.42 * 0.72;
  const base = PAD + h;
  const w = src.width + PAD * 2;
  const height = base + (piece === "latin" ? SIZE * 0.06 : SIZE * 0.42 * 0.30) + PAD;
  return { svg: doc(w, height, `  <g fill="${ink}" transform="translate(${PAD.toFixed(2)} ${base.toFixed(2)})">${svgOf(src.segs)}</g>\n`, "Shaklek") };
};

// --------------------------------------------------------------- monogram
const probe = await inkBounds(doc(PROBE, PROBE, `  <g fill="#000" transform="translate(${PROBE / 2} ${PROBE / 2})">${svgOf(sheen.segs)}</g>\n`, "probe"));
const MBOX = Math.max(probe.w, probe.h) * 1.4;
const mtx = (MBOX - probe.w) / 2 - (probe.x - PROBE / 2);
const mty = (MBOX - probe.h) / 2 - (probe.y - PROBE / 2);
const monoBody = (fill, extra = "") => `${extra}  <g fill="${fill}" transform="translate(${mtx.toFixed(2)} ${mty.toFixed(2)})">${svgOf(sheen.segs)}</g>\n`;

// ------------------------------------------------------------------ write
const files = [
  ["shaklek-lockup-colour", doc(lockW, lockH, lockupBody(INK, GOLD), "Shaklek"), "wide", false],
  ["shaklek-lockup-black", doc(lockW, lockH, lockupBody(INK, INK), "Shaklek, one colour"), "wide", false],
  ["shaklek-lockup-white", doc(lockW, lockH, lockupBody("#FFFFFF", "#FFFFFF"), "Shaklek, reversed"), "wide", true],
  ["shaklek-wordmark-black", oneLine("latin", INK).svg, "wide", false],
  ["shaklek-wordmark-white", oneLine("latin", "#FFFFFF").svg, "wide", true],
  ["shaklek-arabic-black", oneLine("arabic", INK).svg, "square", false],
  ["shaklek-arabic-white", oneLine("arabic", "#FFFFFF").svg, "square", true],
  ["shaklek-monogram-black", doc(MBOX, MBOX, monoBody(INK), "Shaklek monogram"), "square", false],
  ["shaklek-monogram-white", doc(MBOX, MBOX, monoBody("#FFFFFF"), "Shaklek monogram, reversed"), "square", true],
  ["shaklek-monogram-gold", doc(MBOX, MBOX, monoBody(GOLD), "Shaklek monogram, gold"), "square", false],
  ["shaklek-seal-gold", doc(MBOX, MBOX, monoBody(CREAM, `  <circle cx="${(MBOX / 2).toFixed(2)}" cy="${(MBOX / 2).toFixed(2)}" r="${(MBOX / 2).toFixed(2)}" fill="${GOLD}"/>\n`), "Shaklek seal"), "square", false],
];

const made = [];
for (const [name, svg, kind, reversed] of files) {
  writeFileSync(`${OUT}/${name}.svg`, svg);
  const px = kind === "wide" ? 3000 : 1600;
  const buf = Buffer.from(svg);
  await sharp(buf, { density: 300 }).resize({ width: px }).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}@${px}.png`);
  // JPG has no transparency, so a reversed mark is flattened onto black and
  // everything else onto white -- a supplier who cannot take PNG gets something
  // that is still legible rather than a black square on black.
  await sharp(buf, { density: 300 }).resize({ width: px })
    .flatten({ background: reversed ? INK : "#ffffff" })
    .jpeg({ quality: 95, mozjpeg: true }).toFile(`${OUT}/${name}@${px}.jpg`);
  made.push(name);
}

// ------------------------------------------------------- vector PDF per mark
function pdfPaths(stream, segs, dx, dy, fill) {
  stream.save().translate(dx, dy);
  for (const s of segs) {
    stream.save().translate(s.x, s.y).scale(s.scale, -s.scale).path(s.d).fill(fill).restore();
  }
  stream.restore();
}
function writeVectorPdf(file, w, h, draw) {
  return new Promise((res, rej) => {
    const d = new PDFDocument({ size: [w, h], margin: 0 });
    const out = createWriteStream(file);
    d.pipe(out); draw(d); d.end();
    out.on("finish", res); out.on("error", rej);
  });
}
// A vector PDF for EVERY mark, not just the common four. A label supplier asks
// for PDF, an embroiderer asks for PDF, and "we only have the black one as
// vector" is a question nobody should have to ask.
const pdfJobs = [
  ["shaklek-lockup-colour", lockW, lockH, (d) => {
    pdfPaths(d, latin.segs, PAD + (LW - latin.width) / 2, latBase, INK);
    d.rect(PAD + (LW - RULE_W) / 2, ruleY, RULE_W, RULE_H).fill(GOLD);
    pdfPaths(d, arabic.segs, PAD + (LW - arabic.width) / 2, arBase, INK);
  }],
  ["shaklek-lockup-black", lockW, lockH, (d) => {
    pdfPaths(d, latin.segs, PAD + (LW - latin.width) / 2, latBase, INK);
    d.rect(PAD + (LW - RULE_W) / 2, ruleY, RULE_W, RULE_H).fill(INK);
    pdfPaths(d, arabic.segs, PAD + (LW - arabic.width) / 2, arBase, INK);
  }],
  // Reversed marks are drawn on a black ground inside the PDF. A white mark on
  // a transparent page opens as an apparently blank sheet, which is how a
  // supplier ends up printing nothing.
  ["shaklek-lockup-white", lockW, lockH, (d) => {
    d.rect(0, 0, lockW, lockH).fill(INK);
    pdfPaths(d, latin.segs, PAD + (LW - latin.width) / 2, latBase, "#FFFFFF");
    d.rect(PAD + (LW - RULE_W) / 2, ruleY, RULE_W, RULE_H).fill("#FFFFFF");
    pdfPaths(d, arabic.segs, PAD + (LW - arabic.width) / 2, arBase, "#FFFFFF");
  }],
  ["shaklek-wordmark-black", latin.width + PAD * 2, CAP + PAD * 2 + SIZE * 0.06,
    (d) => pdfPaths(d, latin.segs, PAD, PAD + CAP, INK)],
  ["shaklek-wordmark-white", latin.width + PAD * 2, CAP + PAD * 2 + SIZE * 0.06, (d) => {
    d.rect(0, 0, latin.width + PAD * 2, CAP + PAD * 2 + SIZE * 0.06).fill(INK);
    pdfPaths(d, latin.segs, PAD, PAD + CAP, "#FFFFFF");
  }],
  ["shaklek-arabic-black", arabic.width + PAD * 2, SIZE * 0.42 * 0.72 + PAD * 2 + SIZE * 0.42 * 0.30,
    (d) => pdfPaths(d, arabic.segs, PAD, PAD + SIZE * 0.42 * 0.72, INK)],
  ["shaklek-arabic-white", arabic.width + PAD * 2, SIZE * 0.42 * 0.72 + PAD * 2 + SIZE * 0.42 * 0.30, (d) => {
    d.rect(0, 0, arabic.width + PAD * 2, SIZE * 0.42 * 0.72 + PAD * 2 + SIZE * 0.42 * 0.30).fill(INK);
    pdfPaths(d, arabic.segs, PAD, PAD + SIZE * 0.42 * 0.72, "#FFFFFF");
  }],
  ["shaklek-monogram-black", MBOX, MBOX, (d) => pdfPaths(d, sheen.segs, mtx, mty, INK)],
  ["shaklek-monogram-gold", MBOX, MBOX, (d) => pdfPaths(d, sheen.segs, mtx, mty, GOLD)],
  ["shaklek-monogram-white", MBOX, MBOX, (d) => {
    d.rect(0, 0, MBOX, MBOX).fill(INK);
    pdfPaths(d, sheen.segs, mtx, mty, "#FFFFFF");
  }],
  ["shaklek-seal-gold", MBOX, MBOX, (d) => {
    d.circle(MBOX / 2, MBOX / 2, MBOX / 2).fill(GOLD);
    pdfPaths(d, sheen.segs, mtx, mty, CREAM);
  }],
];
for (const [name, w, h, drawFn] of pdfJobs) {
  await writeVectorPdf(`${OUT}/${name}.pdf`, w, h, drawFn);
}

// verify the monogram really is centred, and say so out loud
const after = await inkBounds(readFileSync(`${OUT}/shaklek-monogram-black.svg`, "utf8"));
const vErr = (after.box - (after.y + after.h)) - after.y;
const hErr = (after.box - (after.x + after.w)) - after.x;

console.log(`latin ${latin.glyphs} glyphs, arabic ${arabic.glyphs} glyphs, monogram ${sheen.glyphs} glyphs (shaped)`);
console.log(`${made.length} marks x svg + png + jpg + pdf = ${made.length * 4} files`);
console.log(`monogram centring: vertical error ${vErr.toFixed(1)}, horizontal ${hErr.toFixed(1)} of ${after.box.toFixed(0)}`);
