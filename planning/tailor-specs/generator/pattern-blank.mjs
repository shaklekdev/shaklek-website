// Pattern page with LETTERED measurements and an empty cm table (founder
// 2026-11-13: colour and measurements are added per order). Shapes are drawn
// by script, never generated. Values come from the order config later:
//   node pattern-blank.mjs <open-abaya|buttoned-abaya> <out.jpg> [values.json]
import fs from "node:fs";
import { createRequire } from "node:module";
const sharp = createRequire(new URL("../../../website/", import.meta.url))("sharp");
const [, , kind, out, valuesPath] = process.argv;
const values = valuesPath ? JSON.parse(fs.readFileSync(valuesPath, "utf8")) : {};
const s = 5.2, W = 2410, INK = "#111", DIM = "#c0392b", G = "#1e8449";
let o = "";
const T = (x, y, t, { size = 30, color = INK, bold = true, anchor = "middle", rot = 0 } = {}) =>
  (o += `<text x="${x}" y="${y}" font-family="Helvetica" font-size="${size}" ${bold ? 'font-weight="bold"' : ""} fill="${color}" text-anchor="${anchor}" ${rot ? `transform="rotate(${rot} ${x} ${y})"` : ""}>${t}</text>`);
function piece(ox, oy, d, dashed = []) {
  const tp = d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (_, x, y) => `${(ox + x * s).toFixed(1)},${(oy + y * s).toFixed(1)}`);
  o += `<path d="${tp}" fill="#f6f6f2" stroke="${INK}" stroke-width="3"/>`;
  for (const [a, b, c, e] of dashed) o += `<line x1="${ox + a * s}" y1="${oy + b * s}" x2="${ox + c * s}" y2="${oy + e * s}" stroke="${G}" stroke-width="3" stroke-dasharray="12 8"/>`;
  return { X: (x) => ox + x * s, Y: (y) => oy + y * s };
}
const fold = (P, x, y1, y2) => { o += `<line x1="${P.X(x)}" y1="${P.Y(y1)}" x2="${P.X(x)}" y2="${P.Y(y2)}" stroke="${G}" stroke-width="7"/>`; T(P.X(x) - 14, P.Y((y1 + y2) / 2), "FOLD", { size: 24, color: G, rot: -90 }); };
function dim() { return; }
function _dimUnused(P, x1, y1, x2, y2, L, off = [0, 0]) {
  const a = [P.X(x1) + off[0], P.Y(y1) + off[1]], b = [P.X(x2) + off[0], P.Y(y2) + off[1]];
  o += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${DIM}" stroke-width="2.5" marker-start="url(#a)" marker-end="url(#a)"/>`;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  o += `<circle cx="${mx}" cy="${my}" r="22" fill="${DIM}"/>`; T(mx, my + 10, L, { size: 28, color: "white" });
}
const name = (P, x, y, a, b) => { T(P.X(x), P.Y(y), a, { size: 34 }); if (b) T(P.X(x), P.Y(y) + 36, b, { size: 24, color: G }); };

let rows, title;
const L = 140; // drawn at a nominal maxi length; the letters, not the drawing, carry the size
if (kind === "open-abaya") {
  title = "OPEN ABAYA";
  // FRONT x2: no neckline; front edge with cut-on fold-back band (dashed = fold line)
  let P = piece(110, 240, `M 9,0 L 27,3 L 27.5,24 L 28,24 L 36,${L} L -9,${L} L -9,2 Z`, [[0, 1, 0, L]]);
  name(P, 12, 70, "FRONT ×2", "mirror L / R"); T(P.X(-4.5), P.Y(40), "BAND", { size: 22, color: G, rot: -90 });
  dim(P, 0, 0, 0, L, "A", [-60, 0]); dim(P, 0, 24, 28, 24, "B"); dim(P, 0, L, 36, L, "C", [0, 40]); dim(P, 9, 0, 27, 3, "D", [0, -34]); dim(P, 27, 3, 27, 24, "E", [40, 0]); dim(P, -9, 60, 0, 60, "I");
  // BACK x1 on fold, sweeps
  P = piece(560, 240, `M 0,3 Q 6,3 9,0 L 27,3 L 27.5,24 L 28,24 L 36,${L} L 0,${L} Z`);
  fold(P, 0, 3, L); name(P, 21, 70, "BACK ×1", "one panel, no seam");
  dim(P, 0, 0, 9, 0, "J", [0, -34]); dim(P, 0, L, 36, L, "C", [0, 40]);
  // SLEEVE x2 set-in, cuff turned back (dashed fold)
  P = piece(1200, 240, "M -22,9 Q -11,-0.5 0,0 Q 11,-0.5 22,9 L 20,62 L -20,62 Z", [[-20.4, 50, 20.4, 50]]);
  name(P, 0, 34, "SLEEVE ×2", "set-in"); T(P.X(0), P.Y(57), "CUFF — fold to OUTSIDE", { size: 22, color: G });
  dim(P, -22, 9, 22, 9, "G", [0, -50]); dim(P, -28, 0, -28, 62, "F"); dim(P, -20, 62, 20, 62, "H", [0, 40]); dim(P, 22, 50, 22, 62, "K", [40, 0]);
  rows = [["1", "Height"], ["2", "Bust (full, around)"], ["3", "Waist (full, around)"], ["4", "Hip (full, around)"], ["5", "Shoulder width (shoulder to shoulder)"], ["6", "Arm length (shoulder to wrist)"], ["7", "Upper arm (around)"], ["8", "Wrist (around)"], ["9", "Length wanted (shoulder to hem)"]];
} else if (kind === "buttoned-abaya") {
  title = "BUTTONED ABAYA";
  // FRONT x2: round neck then V to the first bar; straight column
  let P = piece(110, 240, `M 8,0 L 27,3 L 27.5,24 L 28,24 L 28,${L} L 0,${L} L 0,24 L 3.5,9 Q 6.5,7 8,0 Z`);
  [24, 32, 40, 48].forEach((y) => { o += `<rect x="${P.X(0) - 4}" y="${P.Y(y) - 5}" width="${5.5 * s}" height="10" fill="${INK}"/><circle cx="${P.X(0)}" cy="${P.Y(y)}" r="8" fill="${INK}"/>`; });
  name(P, 15, 80, "FRONT ×2", "mirror L / R");
  dim(P, 0, 0, 0, L, "A", [-60, 0]); dim(P, 0, 30, 28, 30, "B"); dim(P, 0, L, 28, L, "C", [0, 40]); dim(P, 8, 0, 27, 3, "D", [0, -34]); dim(P, 27, 3, 27, 24, "E", [40, 0]);
  dim(P, 6, 9, 6, 24, "M", [20, 0]); dim(P, 0, 32, 0, 40, "N", [-30, 0]); dim(P, 0, 52, 5.5, 52, "O", [0, 0]); dim(P, 0, 0, 8, 0, "J", [0, -70]);
  // BACK x1 on fold
  P = piece(560, 240, `M 0,3 Q 6,3 8,0 L 27,3 L 27.5,24 L 28,24 L 28,${L} L 0,${L} Z`);
  fold(P, 0, 3, L); name(P, 17, 70, "BACK ×1", "nothing on it");
  dim(P, 0, L, 28, L, "C", [0, 40]);
  // SLEEVE x2 plain end
  P = piece(1200, 240, "M -22,9 Q -11,-0.5 0,0 Q 11,-0.5 22,9 L 21,58 L -21,58 Z");
  name(P, 0, 34, "SLEEVE ×2", "plain end, no cuff");
  dim(P, -22, 9, 22, 9, "G", [0, -50]); dim(P, -28, 0, -28, 58, "F"); dim(P, -21, 58, 21, 58, "H", [0, 40]);
  rows = [["1", "Height"], ["2", "Bust (full, around)"], ["3", "Waist (full, around)"], ["4", "Hip (full, around)"], ["5", "Shoulder width (shoulder to shoulder)"], ["6", "Arm length (shoulder to wrist)"], ["7", "Upper arm (around)"], ["8", "Wrist (around)"], ["9", "Length wanted (shoulder to hem)"]];
}

// TOPS — shapes only, laid out on a grid. Nominal cm; the table carries her size.
const TOPS = {
  "oversized-shirt": { title: "OVERSIZED SHIRT", pieces: [
    ["FRONT ×2", "mirror L / R", "M 0,8.5 C 4.5,8.5 7.5,4 7.5,0 L 25,3.5 L 25.3,19 Q 25.8,26 30,26 L 30,66 Q 29.5,71.5 22,72 L 0,72 Z"],
    ["BACK ×1", "on fold · box pleat", "M 0,11.5 L 25.2,11.5 L 25.3,19 Q 25.8,26 30,26 L 30,66 Q 29.5,71.5 22,72 L 0,72 Z", "fold"],
    ["YOKE ×2", "on fold", "M 0,2.5 C 3,2.5 6.5,1.5 7.5,0 L 25,3.5 L 25.2,11.5 L 0,11.5 Z", "fold"],
    ["SLEEVE ×2", "low flat cap · placket", "M -23,8 Q -12,-0.5 0,0 Q 12,-0.5 23,8 L 14,50 L -14,50 Z"],
    ["COLLAR ×2", "on fold · soft", "M 0,0 Q 10,0.3 20.5,-0.5 L 23,7.5 Q 12,5.3 0,5 Z", "fold"],
    ["STAND ×2", "on fold", "M 0,0 Q 11,0 20.5,-0.6 Q 22.3,-0.4 22,1.4 L 21.4,2.5 Q 11,3.4 0,3.2 Z", "fold"],
    ["CUFF ×4", "1 button", "M 0,0 L 25,0 L 25,6 L 0,6 Z"],
    ["SLEEVE PLACKET ×2", "1 button", "M 0,1.5 L 1.25,0 L 2.5,1.5 L 2.5,15 L 0,15 Z"],
  ]},
  "structured-blouse": { title: "STRUCTURED BLOUSE", pieces: [
    ["FRONT BODICE ×2", "V neck · waist dart", "M 7,0 L 19,3 Q 17,12 18,15 Q 20,18 23,18 L 22,36 L 0,36 L 0,20 L 3,10 Q 6,5 7,0 Z"],
    ["BACK CENTRE ×1", "on fold · princess", "M 0,2 Q 5,2 7,0 L 11,1 Q 12,20 10,36 L 0,36 Z", "fold"],
    ["BACK SIDE ×2", "princess", "M 4,0 L 12,2 Q 10,12 11,15 Q 13,18 16,18 L 15,36 L 4,36 Q 6,20 4,0 Z"],
    ["WAISTBAND", "front ×2 + back ×1", "M 0,0 L 40,0 L 40,5 L 0,5 Z"],
    ["PEPLUM", "front ×2 + back ×1 · gathered", "M 0,0 L 40,0 L 46,20 L -6,20 Z"],
    ["SLEEVE ×2", "puff · gathered head + wrist", "M -20,14 Q -14,-2 0,-2 Q 14,-2 20,14 L 16,52 L -16,52 Z"],
    ["CUFF ×2", "3 buttons", "M 0,0 L 24,0 L 24,9 L 0,9 Z"],
    ["COLLAR BAND ×2", "mandarin", "M 0,0 Q 10,0 19,-0.8 L 18.6,2.6 Q 10,3.6 0,3.4 Z", "fold"],
  ]},
  "wrap-top": { title: "WRAP TOP", pieces: [
    ["FRONT ×2", "wraps · mirror L / R", "M 8,0 L 26,3 Q 25,14 26,18 Q 28,22 30,22 L 31,56 L -18,56 L -18,44 Q -4,30 6,8 Z"],
    ["BACK ×1", "on fold · plain", "M 0,2 Q 5,2 8,0 L 26,3 Q 25,14 26,18 Q 28,22 30,22 L 31,56 L 0,56 Z", "fold"],
    ["SLEEVE ×2", "gathered at wrist", "M -20,12 Q -12,-1 0,-1 Q 12,-1 20,12 L 18,56 L -18,56 Z"],
    ["WRIST BAND ×2", "", "M 0,0 L 20,0 L 20,4 L 0,4 Z"],
    ["TIE ×2", "self fabric", "M 0,0 L 60,0 L 60,2.5 L 0,2.5 Z"],
  ]},
  "utility-shirt": { title: "UTILITY SHIRT", pieces: [
    ["FRONT ×2", "mirror L / R", "M 0,8 C 4,8 7,4 7,0 L 21,3 Q 20,14 21,18 Q 23,22 26,22 L 26,66 L 0,66 Z"],
    ["BACK ×1", "on fold · drawstring channel", "M 0,9 L 21,9 Q 20,14 21,18 Q 23,22 26,22 L 26,66 L 0,66 Z", "fold"],
    ["YOKE ×2", "on fold", "M 0,2.5 C 3,2.5 6,1.5 7,0 L 21,3 L 21,9 L 0,9 Z", "fold"],
    ["SLEEVE ×2", "placket + cuff", "M -19,13 Q -10,-1 0,-1 Q 10,-1 19,13 L 13,56 L -13,56 Z"],
    ["COLLAR ×2 + STAND ×2", "on fold", "M 0,0 Q 10,0.3 19,-0.5 L 21,7 Q 11,5 0,4.8 Z", "fold"],
    ["CUFF ×4", "1 button", "M 0,0 L 23,0 L 23,6 L 0,6 Z"],
    ["CHEST POCKET ×2", "+ flap ×4", "M 0,0 L 13,0 L 13,15 L 0,15 Z"],
    ["SLEEVE POCKET ×1", "+ flap ×2", "M 0,0 L 9,0 L 9,12 L 0,12 Z"],
    ["DRAWSTRING CHANNEL", "+ cord", "M 0,0 L 50,0 L 50,3 L 0,3 Z"],
  ]},
};

const PANT_FRONT = "M 0,0 L 22,0 L 23,18 Q 23,24 28,26 L 26,100 L 2,100 L 0,26 Z";
const PANT_BACK = "M 3,-3 L 25,0 L 26,18 Q 27,26 33,28 L 29,100 L 4,100 L 1,28 Z";
const PANT_ROWS = [["1", "Height"], ["2", "Waist (full, around)"], ["3", "Hip (full, around)"], ["4", "Thigh (around)"], ["5", "Knee (around)"], ["6", "Ankle (around)"], ["7", "Rise: front waist through legs to back waist"], ["8", "Inside leg (crotch to floor)"], ["9", "Outside leg (waist to floor)"], ["10", "Length wanted (waist to hem)"]];
const pant = (title, extra, front = "FRONT ×2", loops = true) => ({ title, rows: PANT_ROWS, pieces: [
  [front, "mirror L / R", PANT_FRONT], ["BACK ×2", "dart · welt pocket", PANT_BACK],
  ["WAISTBAND ×2", "button", "M 0,0 L 40,0 L 40,4 L 0,4 Z"], ["FLY + FLY SHIELD", "zip fly", "M 0,0 L 4,0 L 4,18 Q 4,21 1,21 L 0,21 Z"],
  ["POCKET BAG ×4", "side pocket", "M 0,0 L 14,0 L 16,24 Q 8,28 0,22 Z"], ["WELT ×2 + BAG ×2", "back pocket", "M 0,0 L 13,0 L 13,3 L 0,3 Z"],
  ...(loops ? [["BELT LOOPS ×6", "", "M 0,0 L 1.2,0 L 1.2,6 L 0,6 Z"]] : [["DRAWSTRING CORD", "through front waistband · bow", "M 0,0 L 60,0 L 60,1 L 0,1 Z"]]), ...extra ] });
Object.assign(TOPS, {
  "wide-leg-trousers": pant("RELAXED TROUSERS", [], "FRONT ×2 · 1 pleat each"),
  "banded-trousers": pant("BANDED TROUSERS", [["CUFF", "cut-on, turn up to OUTSIDE", "M 0,0 L 22,0 L 22,8 L 0,8 Z"]]),
  "pleated-trousers": pant("PLEATED TROUSERS", [], "FRONT ×2 · 2 pleats each"),
  "cargo-trousers": pant("CARGO TROUSERS", [["CARGO POCKET ×2 + FLAP ×4", "bellows · 1 button", "M 0,0 L 16,0 L 16,20 L 0,20 Z"]], "FRONT ×2", false),
});

const DRESS_ROWS = [["1", "Height"], ["2", "Bust (full, around)"], ["3", "Waist (full, around)"], ["4", "Hip (full, around)"], ["5", "Shoulder width (shoulder to shoulder)"], ["6", "Armhole (around)"], ["7", "Neck (around)"], ["8", "Shoulder to waist (front)"], ["9", "Length wanted (shoulder to hem)"]];
Object.assign(TOPS, {
  "slip-dress": { title: "SLIP DRESS", rows: DRESS_ROWS, layout: "dress", pieces: [
    ["FRONT ×2", "centre-front seam", "M 0,1 Q 4,1 6,0 L 12,0 Q 12,10 17,16 L 18,30 Q 21,70 30,110 L 0,110 Z"],
    ["BACK ×2", "centre-back seam", "M 0,0 Q 4,0 6,-1 L 12,0 Q 12,10 17,16 L 18,30 Q 21,70 30,110 L 0,110 Z"],
    ["NECK + ARMHOLE FACING", "front ×1 + back ×1", "M 0,0 L 18,0 Q 20,8 22,14 L 17,16 Q 13,8 12,4 L 0,4 Z"],
  ]},
  "buttoned-dress": { title: "BUTTONED DRESS", rows: DRESS_ROWS, layout: "dress", cols: [[200, 240], [620, 240], [200, 620], [620, 620], [1060, 240], [1060, 560], [1060, 860]], pieces: [
    ["FRONT BODICE ×2", "button stand at CF", "M -2,6 L 0,6 Q 4,6 6,0 L 12,1 Q 12,10 17,16 L 17,36 L -2,36 Z"],
    ["BACK BODICE ×2", "centre-back seam", "M 0,1 Q 4,1 6,0 L 12,1 Q 12,10 17,16 L 17,36 L 0,36 Z"],
    ["FRONT SKIRT ×2", "button stand · pocket at side", "M -2,0 L 17,0 Q 22,40 28,74 L -2,74 Z"],
    ["BACK SKIRT ×1", "on fold", "M 0,0 L 17,0 Q 22,40 28,74 L 0,74 Z", "fold"],
    ["POCKET BAG ×4", "side seam", "M 0,0 L 14,0 L 16,22 Q 8,26 0,20 Z"],
    ["NECK + ARMHOLE FACING", "front ×2 + back ×1", "M 0,0 L 18,0 Q 20,8 22,14 L 17,16 Q 13,8 12,4 L 0,4 Z"],
    ["BUTTON LOOPS", "small covered buttons, close together", "M 0,0 L 30,0 L 30,1 L 0,1 Z"],
  ]},
});
if (TOPS[kind]) {
  title = TOPS[kind].title;
  const cols = [[200, 240], [620, 240], [1060, 240], [200, 760], [620, 760], [1060, 760], [200, 1200], [620, 1200], [1060, 1200]];
  const pantCols = [[200, 240], [620, 240], [1060, 240], [1060, 430], [1060, 700], [200, 960], [620, 960], [1060, 1060]];
  TOPS[kind].pieces.forEach(([nm, sub, d, fl], i) => {
    const dressCols = [[200, 240], [620, 240], [1060, 240], [1060, 560], [200, 1000], [620, 1000], [1060, 1000]];
    const [ox, oy] = (TOPS[kind].cols || (TOPS[kind].layout === "dress" ? dressCols : TOPS[kind].rows ? pantCols : cols))[i];
    const xs = [...d.matchAll(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g)].map((m) => [+m[1], +m[2]]);
    const minX = Math.min(...xs.map((a) => a[0])), maxX = Math.max(...xs.map((a) => a[0])), maxY = Math.max(...xs.map((a) => a[1]));
    const P = piece(ox - minX * s + 40, oy, d);
    if (fl) fold(P, 0, 0, maxY);
    T(P.X((minX + maxX) / 2), P.Y(maxY) + 44, nm, { size: 28 });
    if (sub) T(P.X((minX + maxX) / 2), P.Y(maxY) + 76, sub, { size: 22, color: G });
  });
  rows = TOPS[kind].rows || [["1", "Height"], ["2", "Bust (full, around)"], ["3", "Waist (full, around)"], ["4", "Hip (full, around)"], ["5", "Shoulder width (shoulder to shoulder)"], ["6", "Arm length (shoulder to wrist)"], ["7", "Upper arm (around)"], ["8", "Wrist (around)"], ["9", "Neck (around)"], ["10", "Length wanted (shoulder to hem)"]];
}
// TABLE
const tx = 1650, ty = 200;
T(tx, ty, "HER MEASUREMENTS — full body (cm)", { size: 36, anchor: "start" });
  T(tx, ty + 34, "measured on her · the tailor adds the ease", { size: 24, anchor: "start", bold: false, color: "#666" });
rows.forEach(([k, n], i) => {
  const y = ty + 100 + i * 64;
  o += `<circle cx="${tx + 22}" cy="${y - 10}" r="22" fill="${DIM}"/>`; T(tx + 22, y, k, { size: 28, color: "white" });
  T(tx + 60, y, n, { size: 24, anchor: "start", bold: false, color: "#444" });
  const v = values[k];
  T(tx + 640, y, v != null ? String(v) : "______", { size: 30, anchor: "end", color: v != null ? INK : "#999" });
});
const H = TOPS[kind] ? 1560 : 240 + L * s + 160;
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="a" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="${DIM}"/></marker></defs><rect width="100%" height="100%" fill="white"/>
<text x="40" y="70" font-family="Helvetica" font-weight="bold" font-size="52" fill="${INK}">${title} — PATTERN</text>
<text x="40" y="118" font-family="Helvetica" font-size="30" fill="${DIM}">shape of the pieces · her full body measurements in the table · NO seam allowance drawn · green = fold</text>${o}
<text x="40" y="${H - 40}" font-family="Helvetica" font-weight="bold" font-size="32" fill="${INK}">${TOPS[kind]?.layout === "dress" ? "100% linen · light interfacing in facings only" : TOPS[kind]?.rows ? "100% linen · light interfacing in waistband only" : TOPS[kind] ? "100% linen · light interfacing in collar, stand and cuffs only" : "100% linen · NO interfacing anywhere · it must hang and fall"}</text></svg>`;
await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(out);
console.log("wrote", out);
