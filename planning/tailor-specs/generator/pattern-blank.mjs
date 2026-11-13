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
} else {
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
const H = 240 + L * s + 160;
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="a" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="${DIM}"/></marker></defs><rect width="100%" height="100%" fill="white"/>
<text x="40" y="70" font-family="Helvetica" font-weight="bold" font-size="52" fill="${INK}">${title} — PATTERN</text>
<text x="40" y="118" font-family="Helvetica" font-size="30" fill="${DIM}">shape of the pieces · her full body measurements in the table · NO seam allowance drawn · green = fold</text>${o}
<text x="40" y="${H - 40}" font-family="Helvetica" font-weight="bold" font-size="32" fill="${INK}">100% linen · NO interfacing anywhere · it must hang and fall</text></svg>`;
await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(out);
console.log("wrote", out);
