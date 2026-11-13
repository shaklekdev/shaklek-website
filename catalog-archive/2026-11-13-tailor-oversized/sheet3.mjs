import { createRequire } from "node:module";
import { patternSvg } from "./pattern.mjs";
const sharp = createRequire("/Users/nadatlohi/dev/Shaklek/website/")("sharp");
const S = "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/a8571eb7-8e96-4921-96ec-964011124af1/scratchpad";
const SHEET = "/Users/nadatlohi/dev/Shaklek/planning/tailor-specs/sent/OVERSIZED-SHIRT-for-tailor.jpg";
const CAT = "/Users/nadatlohi/dev/Shaklek/website/public/catalog/oversized-shirt";
const M = 40, GAP = 30, W = 2410, N = 5, PW = Math.floor((W - 2 * M - GAP * (N - 1)) / N), PH = Math.round(PW * 1.5);
const k = PH / 1248;
const marks = { front: [[6, 420, 300], [1, 205, 470], [5, 330, 640], [2, 600, 950]], back: [[6, 415, 235], [1, 200, 440], [2, 600, 945]] };
const dot = (n, x, y) => `<circle cx="${x}" cy="${y}" r="24" fill="#1e8449" stroke="white" stroke-width="4"/><text x="${x}" y="${y + 11}" font-family="Helvetica" font-weight="bold" font-size="30" fill="white" text-anchor="middle">${n}</text>`;
const fit = (f) => sharp(f).resize(PW, PH, { fit: "contain", background: "white" }).toBuffer();
const drawn = async (f, key) => sharp(await fit(f)).composite([{ input: Buffer.from(`<svg width="${PW}" height="${PH}">${marks[key].map(([n, x, y]) => dot(n, x * k, y * k)).join("")}</svg>`) }]).toBuffer();
const head = (t, c) => Buffer.from(`<svg width="${PW}" height="70"><rect width="100%" height="100%" fill="${c}"/><text x="50%" y="49" font-family="Helvetica" font-weight="bold" font-size="34" fill="white" text-anchor="middle">${t}</text></svg>`);
const bad = await sharp(SHEET).extract({ left: 43, top: 152, width: 636, height: 846 }).resize(PW, PH, { fit: "contain", background: "white" }).toBuffer();
const panels = [
  ["✗  WHAT WAS MADE", "#c0392b", bad],
  ["✓  WEBSITE — FRONT", "#1e8449", await fit(`${CAT}/oversized-shirt-front.jpg`)],
  ["✓  WEBSITE — BACK", "#1e8449", await fit(`${CAT}/oversized-shirt-back-v2.jpg`)],
  ["✓  DRAWING — FRONT", "#1e8449", await drawn(`${S}/flats/${process.env.FRONT || "front-1"}.png`, "front")],
  ["✓  DRAWING — BACK", "#1e8449", await drawn(`${S}/flats/${process.env.BACK || "back-1"}.png`, "back")],
];
const top = 30, row2 = top + 70 + PH + 40, PAT_H = 880, row3 = row2 + PAT_H + 40;
const words = [["SIZE", "M"], ["SLEEVE", "LONG"], ["LENGTH", "NORMAL"], ["COLOUR", "IVORY"]];
const rules = ["DROPPED SHOULDER — seam 5–6 cm down the arm", "STRAIGHT SIDES — no waist", "DEEP ARMHOLE — low, loose under the arm", "WIDE SLEEVE — wide to the cuff, low flat cap", "ROOMY CHEST — loose, not fitted", "COLLAR BIG + SOFT — long points, no stiff interfacing"];
const LH = 74, H = row3 + rules.length * LH + 40;
let svg = `<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="white"/>`;
words.forEach(([a, b], i) => { const y = row3 + i * LH + 55; svg += `<text x="${M}" y="${y}" font-family="Helvetica" font-size="40" fill="#777">${a}</text><text x="${M + 260}" y="${y}" font-family="Helvetica" font-weight="bold" font-size="56" fill="#111">${b}</text>`; });
const rx = M + 800;
rules.forEach((r, i) => { const y = row3 + i * LH + 40; const [a, b] = r.split(" — "); svg += dot(i + 1, rx, y) + `<text x="${rx + 50}" y="${y + 15}" font-family="Helvetica" font-size="42"><tspan font-weight="bold" fill="#111">${a}</tspan><tspan dx="22" fill="#777">${b}</tspan></text>`; });
svg += `</svg>`;
const comp = [];
panels.forEach(([t, c, img], i) => { const x = M + i * (PW + GAP); comp.push({ input: head(t, c), left: x, top }, { input: img, left: x, top: top + 70 }); });
comp.push({ input: Buffer.from(patternSvg(W - 2 * M, PAT_H)), left: M, top: row2 });
const out = `${S}/OVERSIZED-SHIRT-M-IVORY-tailor-v2.jpg`;
await sharp(Buffer.from(svg)).composite(comp).jpeg({ quality: 90 }).toFile(out);
await sharp(out).resize({ width: 1200 }).toFile(`${S}/chk3.jpg`);
console.log("ok", W, H);
