import { createRequire } from "node:module";
const sharp = createRequire("/Users/nadatlohi/dev/Shaklek/website/")("sharp");
const S = "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/a8571eb7-8e96-4921-96ec-964011124af1/scratchpad";
const s = 10.5; // px per cm
const W = 2410;
let out = "";
const G = "#1e8449", INK = "#111", DIM = "#c0392b";
function piece(ox, oy, d, { fill = "#f4f8f5", dashed = [], title, sub }) {
  const tp = d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (_, x, y) => `${(ox + x * s).toFixed(1)},${(oy + y * s).toFixed(1)}`);
  out += `<path d="${tp}" fill="${fill}" stroke="${INK}" stroke-width="3"/>`;
  for (const [x1, y1, x2, y2] of dashed) out += `<line x1="${ox + x1 * s}" y1="${oy + y1 * s}" x2="${ox + x2 * s}" y2="${oy + y2 * s}" stroke="#666" stroke-width="2" stroke-dasharray="10 7"/>`;
  return { X: (x) => ox + x * s, Y: (y) => oy + y * s };
}
const T = (x, y, t, { size = 30, color = INK, bold = true, anchor = "middle", rot = 0 } = {}) =>
  out += `<text x="${x}" y="${y}" font-family="Helvetica" font-size="${size}" ${bold ? 'font-weight="bold"' : ""} fill="${color}" text-anchor="${anchor}" ${rot ? `transform="rotate(${rot} ${x} ${y})"` : ""}>${t}</text>`;
function dimH(P, x1, x2, y, label, off = 0) {
  const a = P.X(x1), b = P.X(x2), yy = P.Y(y) + off;
  out += `<line x1="${a}" y1="${yy}" x2="${b}" y2="${yy}" stroke="${DIM}" stroke-width="2"/><line x1="${a}" y1="${yy - 9}" x2="${a}" y2="${yy + 9}" stroke="${DIM}" stroke-width="2"/><line x1="${b}" y1="${yy - 9}" x2="${b}" y2="${yy + 9}" stroke="${DIM}" stroke-width="2"/>`;
  T((a + b) / 2, yy - 10, label, { color: DIM, size: 28 });
}
function dimV(P, y1, y2, x, label, off = 0) {
  const a = P.Y(y1), b = P.Y(y2), xx = P.X(x) + off;
  out += `<line x1="${xx}" y1="${a}" x2="${xx}" y2="${b}" stroke="${DIM}" stroke-width="2"/><line x1="${xx - 9}" y1="${a}" x2="${xx + 9}" y2="${a}" stroke="${DIM}" stroke-width="2"/><line x1="${xx - 9}" y1="${b}" x2="${xx + 9}" y2="${b}" stroke="${DIM}" stroke-width="2"/>`;
  T(xx - 12, (a + b) / 2, label, { color: DIM, size: 28, rot: -90 });
}
const grain = (P, x, y1, y2) => { out += `<line x1="${P.X(x)}" y1="${P.Y(y1)}" x2="${P.X(x)}" y2="${P.Y(y2)}" stroke="#888" stroke-width="2" marker-start="url(#ar)" marker-end="url(#ar)"/>`; };
const btn = (P, x, y) => out += `<circle cx="${P.X(x)}" cy="${P.Y(y)}" r="7" fill="white" stroke="${INK}" stroke-width="2"/>`;
const label = (P, x, y, a, b) => { T(P.X(x), P.Y(y), a, { size: 34 }); if (b) T(P.X(x), P.Y(y) + 38, b, { size: 26, color: G }); };

const R1 = 250;
// FRONT x2 — CF at x=0, button stand 1.5 past CF
let P = piece(110, R1, "M -1.5,8.5 L 0,8.5 C 4.5,8.5 7.5,4 7.5,0 L 25,3.5 L 25.3,19 Q 25.8,26 30,26 L 30,66 Q 29.5,71.5 22,72 L -1.5,72 Z", { dashed: [[0, 8.5, 0, 72]] });
[11, 20.5, 30, 39.5, 49, 58.5].forEach((y) => btn(P, 0, y));
grain(P, 15, 32, 60); label(P, 15, 66, "FRONT ×2", "mirror L / R");
dimH(P, 0, 30, 72, "30", 45); dimV(P, 0, 72, 30, "72 centre", 70); dimV(P, 26, 66, 30, "40 side", 30); T(P.X(27), P.Y(72) + 85, "CURVED HEM — sides 6 cm higher", { size: 24, color: DIM }); dimV(P, 0, 26, 25, "26", -30);
dimH(P, 0, 25, 0, "25", -55); dimH(P, 0, 7.5, 0, "7.5", -20); dimV(P, 0, 8.5, -1.5, "8.5", -30);
T(P.X(-1.5) - 8, P.Y(40), "+ 3 cm facing", { size: 22, color: "#666", rot: -90, bold: false });

// BACK x1 on fold, below yoke, 2 cm box pleat at CB
P = piece(600, R1, "M -2,11.5 L 25.2,11.5 L 25.3,19 Q 25.8,26 30,26 L 30,66 Q 29.5,71.5 22,72 L -2,72 Z", { dashed: [[0, 11.5, 0, 20]] });
out += `<line x1="${P.X(-2)}" y1="${P.Y(11.5)}" x2="${P.X(-2)}" y2="${P.Y(72)}" stroke="${G}" stroke-width="6"/>`;
T(P.X(-2) - 14, P.Y(45), "FOLD", { size: 26, color: G, rot: -90 });
T(P.X(0) + 8, P.Y(17), "pleat", { size: 22, color: "#666", anchor: "start", bold: false });
grain(P, 14, 32, 60); label(P, 14, 66, "BACK ×1", "on fold");
dimH(P, -2, 30, 72, "32  (30 + 2 pleat)", 45); dimV(P, 11.5, 72, 30, "60.5 centre", 70); T(P.X(27), P.Y(72) + 85, "CURVED HEM — same as front", { size: 24, color: DIM });

// YOKE x2 on fold
P = piece(1090, R1, "M 0,2.5 C 3,2.5 6.5,1.5 7.5,0 L 25,3.5 L 25.2,11.5 L 0,11.5 Z", {});
out += `<line x1="${P.X(0)}" y1="${P.Y(2.5)}" x2="${P.X(0)}" y2="${P.Y(11.5)}" stroke="${G}" stroke-width="6"/>`;
T(P.X(12.5), P.Y(8.5), "YOKE ×2  (on fold)", { size: 28 });
dimH(P, 0, 25, 11.5, "25", 45); dimV(P, 2.5, 11.5, 0, "9", -30); dimH(P, 0, 7.5, 0, "7.5", -20);

// SLEEVE x2 — low flat cap
P = piece(1720, R1, "M -23,8 Q -12,-0.5 0,0 Q 12,-0.5 23,8 L 14,50 L -14,50 Z", { dashed: [[7, 38, 7, 50]] });
grain(P, 0, 14, 36); label(P, 0, 42, "SLEEVE ×2", "");
T(P.X(7) + 10, P.Y(46), "slit 12", { size: 22, color: "#666", anchor: "start", bold: false });
dimH(P, -23, 23, 8, "46", -95); dimV(P, 0, 8, 23, "8 cap", 40); dimV(P, 0, 50, 23, "50", 120); dimH(P, -14, 14, 50, "28  (2 pleats → cuff)", 45);

// ROW 2
const R2 = R1 + 72 * s + 200;
// COLLAR x2 on fold (big points)
P = piece(110, R2, "M 0,0 Q 10,0.3 20.5,-0.5 L 23,7.5 Q 12,5.3 0,5 Z", {});
out += `<line x1="${P.X(0)}" y1="${P.Y(0)}" x2="${P.X(0)}" y2="${P.Y(6.5)}" stroke="${G}" stroke-width="6"/>`;
T(P.X(11), P.Y(7.5) + 40, "COLLAR ×2 (on fold)", { size: 26 });
dimV(P, 0, 5, 0, "5", -30); dimH(P, 0, 20.5, 0, "20.5", -20);
T(P.X(23) + 12, P.Y(4), "point 8", { size: 28, color: DIM, anchor: "start" });
T(P.X(0), P.Y(7.5) + 85, "BIG + SOFT: very light interfacing or none", { size: 26, color: G, anchor: "start" });

// STAND x2 on fold
P = piece(560, R2, "M 0,0 Q 11,0 20.5,-0.6 Q 22.3,-0.4 22,1.4 L 21.4,2.5 Q 11,3.4 0,3.2 Z", {});
out += `<line x1="${P.X(0)}" y1="${P.Y(0)}" x2="${P.X(0)}" y2="${P.Y(3.2)}" stroke="${G}" stroke-width="6"/>`;
btn(P, 20.6, 1.3);
T(P.X(11), P.Y(3.2) + 50, "STAND ×2 (on fold)", { size: 26 });
dimV(P, 0, 3.2, 0, "3.2", -30); dimH(P, 0, 22, -0.6, "22", -25);

// CUFF x4
P = piece(1010, R2, "M 0,0 L 25,0 L 25,6 L 0,6 Z", {});
btn(P, 1.5, 3); out += `<line x1="${P.X(22.3)}" y1="${P.Y(3)}" x2="${P.X(24)}" y2="${P.Y(3)}" stroke="${INK}" stroke-width="3"/>`;
T(P.X(12.5), P.Y(6) + 50, "CUFF ×4", { size: 26 });
dimH(P, 0, 25, 0, "25", -20); dimV(P, 0, 6, 25, "6", 40);

// SLEEVE PLACKET x2
P = piece(1400, R2 - 60, "M 0,1.5 L 1.25,0 L 2.5,1.5 L 2.5,15 L 0,15 Z", {});
btn(P, 1.25, 6);
T(P.X(2.5) + 20, P.Y(8), "SLEEVE PLACKET ×2", { size: 26, anchor: "start" });
T(P.X(2.5) + 20, P.Y(8) + 34, "pointed top, 1 button", { size: 22, color: "#666", anchor: "start", bold: false });
dimV(P, 0, 15, 0, "15", -30); dimH(P, 0, 2.5, 15, "2.5", 40);

// FINISHED MEASUREMENTS
const fx = 1840, fy = R2 - 40;
T(fx, fy, "FINISHED — SIZE M", { size: 34, anchor: "start" });
[["Chest", "120"], ["Hem", "curved, sides −6"], ["Length", "72"], ["Shoulder", "50"], ["Armhole depth", "26"], ["Sleeve + cuff", "50 + 6"], ["Collar point", "8"]].forEach(([a, b], i) => {
  T(fx, fy + 50 + i * 42, a, { size: 28, anchor: "start", bold: false, color: "#555" }); T(fx + 260, fy + 50 + i * 42, b, { size: 28, anchor: "start" });
});

const H = R2 + 380;
let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="ar" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#888"/></marker></defs><rect width="100%" height="100%" fill="white"/>`;
svg += `<text x="40" y="70" font-family="Helvetica" font-weight="bold" font-size="52" fill="${INK}">OVERSIZED SHIRT — PATTERN — SIZE M — IVORY LINEN</text>`;
svg += `<text x="40" y="120" font-family="Helvetica" font-size="32" fill="${DIM}">cm  ·  NO seam allowance: add 1 cm seams, 2 cm hem  ·  red = measurement  ·  green = fold</text>`;
svg += out;
svg += `<text x="40" y="${H - 40}" font-family="Helvetica" font-weight="bold" font-size="34" fill="${INK}">BUTTONS: 6 front + 1 stand + 2 cuffs + 2 sleeve plackets = 11   ·   Interfacing: stand + cuffs light. Collar: very light or none.</text>`;
svg += `</svg>`;
const o = `${S}/OVERSIZED-SHIRT-M-PATTERN.jpg`;
await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(o);
await sharp(o).resize({ width: 1300 }).toFile(`${S}/chk4.jpg`);
console.log("ok", W, H);
