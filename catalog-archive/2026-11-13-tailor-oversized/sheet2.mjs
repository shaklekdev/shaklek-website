import { createRequire } from "node:module";
const sharp = createRequire("/Users/nadatlohi/dev/Shaklek/website/")("sharp");
const S = "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/a8571eb7-8e96-4921-96ec-964011124af1/scratchpad";
const SHEET = "/Users/nadatlohi/dev/Shaklek/planning/tailor-specs/sent/OVERSIZED-SHIRT-for-tailor.jpg";
const PW = 560, PH = 840, GAP = 30, M = 40, W = M * 2 + PW * 4 + GAP * 3;
const k = PH / 1248; // drawing scale
// markers in drawing pixel coords (832x1248)
const marks = {
  front: [[6, 420, 300], [1, 205, 470], [5, 330, 640], [2, 600, 950]],
  back: [[6, 415, 235], [1, 200, 440], [2, 600, 945]],
  sleeve: [[1, 386, 408], [3, 398, 720], [4, 520, 900]],
};
const dot = (n, x, y) => `<circle cx="${x}" cy="${y}" r="30" fill="#1e8449" stroke="white" stroke-width="4"/><text x="${x}" y="${y + 13}" font-family="Helvetica" font-weight="bold" font-size="38" fill="white" text-anchor="middle">${n}</text>`;
const panel = async (file, key) => {
  const img = await sharp(file).resize(PW, PH, { fit: "contain", background: "white" }).toBuffer();
  const svg = `<svg width="${PW}" height="${PH}">${marks[key].map(([n, x, y]) => dot(n, x * k, y * k)).join("")}</svg>`;
  return sharp(img).composite([{ input: Buffer.from(svg) }]).toBuffer();
};
const bad = await sharp(SHEET).extract({ left: 43, top: 152, width: 636, height: 846 }).resize(PW, PH, { fit: "contain", background: "white" }).toBuffer();
const front = await panel(`${S}/flats/front-1.png`, "front");
const back = await panel(`${S}/flats/back-1.png`, "back");
const sleeve = await panel(`${S}/flats/sleeve-1.png`, "sleeve");
const head = (t, c) => Buffer.from(`<svg width="${PW}" height="80"><rect width="100%" height="100%" fill="${c}"/><text x="50%" y="56" font-family="Helvetica" font-weight="bold" font-size="44" fill="white" text-anchor="middle">${t}</text></svg>`);
const top = 30, rowY = top + 80 + PH + 50;
const words = [["SIZE", "M"], ["SLEEVE", "LONG"], ["LENGTH", "NORMAL"], ["COLOUR", "IVORY"]];
const rules = [
  "DROPPED SHOULDER — seam 5–6 cm down the arm",
  "STRAIGHT SIDES — no waist",
  "DEEP ARMHOLE — low, loose under the arm",
  "WIDE SLEEVE — wide to the cuff",
  "ROOMY CHEST — loose, not fitted",
  "COLLAR BIG + SOFT — long points, no stiff interfacing",
];
const LH = 78;
const H = rowY + Math.max(words.length, rules.length) * LH + 40;
let svg = `<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="white"/>`;
words.forEach(([a, b], i) => { const y = rowY + i * LH + 55; svg += `<text x="${M}" y="${y}" font-family="Helvetica" font-size="40" fill="#777">${a}</text><text x="${M + 260}" y="${y}" font-family="Helvetica" font-weight="bold" font-size="56" fill="#111">${b}</text>`; });
const rx = M + PW + GAP + 40;
rules.forEach((r, i) => { const y = rowY + i * LH + 40; const [a, b] = r.split(" — "); svg += dot(i + 1, rx, y) + `<text x="${rx + 55}" y="${y + 15}" font-family="Helvetica" font-size="42"><tspan font-weight="bold" fill="#111">${a}</tspan><tspan dx="22" fill="#777">${b}</tspan></text>`; });
svg += `</svg>`;
const xs = [0, 1, 2, 3].map(i => M + i * (PW + GAP));
await sharp(Buffer.from(svg)).composite([
  { input: head("✗  NO", "#c0392b"), left: xs[0], top }, { input: bad, left: xs[0], top: top + 80 },
  { input: head("✓  FRONT", "#1e8449"), left: xs[1], top }, { input: front, left: xs[1], top: top + 80 },
  { input: head("✓  BACK", "#1e8449"), left: xs[2], top }, { input: back, left: xs[2], top: top + 80 },
  { input: head("✓  SLEEVE", "#1e8449"), left: xs[3], top }, { input: sleeve, left: xs[3], top: top + 80 },
]).jpeg({ quality: 90 }).toFile(`${S}/OVERSIZED-SHIRT-M-IVORY-tailor.jpg`);
await sharp(`${S}/OVERSIZED-SHIRT-M-IVORY-tailor.jpg`).resize({ width: 1100 }).toFile(`${S}/chk2.jpg`);
console.log("ok", W, H);
