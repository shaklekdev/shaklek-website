// Re-cut of reel-structured-look, to the founder's shot list (2026-08-25).
//
//   npx tsx scripts/social/reel-structured.mjs
//
// What was wrong with the previous cut, in her words:
//   - it never showed all four sleeve/length combinations
//   - the zoom out landed on a look with plain trousers, when the banded
//     trousers are the better full look
//   - it wanted a three colour panel carrying "what if you were the designer"
//
// Shot list:
//   1. four cuts, held long enough to read as decisions:
//      short sleeve normal length -> long sleeve normal -> long sleeve longer
//      -> short sleeve longer
//   2. zoom out to the full look, switching to the banded trousers image
//   3. the colourway change
//   4. three colours side by side under "what if you were the designer"
//
// CROPPING RULE, learned twice now and written into README.md: the crop must
// contain the thing being changed. A sleeve sequence that crops out the arms,
// or a length sequence that crops off the hem, shows four identical frames and
// reads as a stuck video. Section 1 therefore holds ONE crop that includes both
// arms and the hem, and only the garment changes inside it.
//
// COPY RULES: no em dashes, no AI, never call the imagery a photograph.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Repo root, derived from this file's own location instead of hardcoded.
// It was the literal "/Users/nadatlohi/Desktop/Shaklek" until 2026-08-31, when
// the repo moved off the iCloud-synced Desktop and every one of these scripts
// would have broken. Derived, the next move costs nothing.
const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url)).replace(/\/$/, "");
const ROOT = REPO_ROOT;
const OUT = `${ROOT}/brand-assets/INSTA/VIDEO-9-structured-recut.mp4`;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/reel-structured";
const W = 1080, H = 1920, FPS = 30;

const { catalog } = await import("../../src/data/catalog.ts");
const blouse = catalog.find((c) => c.slug === "structured-blouse");
const banded = catalog.find((c) => c.slug === "banded-trousers");

const b64 = (rel) => {
  const p = path.join("public", rel);
  if (!fs.existsSync(p)) throw new Error(`missing ${rel}`);
  return `data:image/jpeg;base64,${fs.readFileSync(p).toString("base64")}`;
};

const blouseCombo = (key, color = "Ivory") =>
  key === "base"
    ? b64(blouse.colorImages[color].front)
    : b64(blouse.comboImages[color][key].front);

// ---------------------------------------------------------------- frames

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#F3F0EA}
.f{position:relative;width:${W}px;height:${H}px;background:#F3F0EA}
img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.lbl{position:absolute;left:72px;bottom:150px;font-family:'DM Sans',sans-serif;
  font-weight:400;font-size:60px;letter-spacing:.01em;color:#15243a;line-height:1.15}
.sub{position:absolute;left:72px;bottom:96px;font-family:'DM Sans',sans-serif;
  font-weight:300;font-size:34px;color:#5d6675;letter-spacing:.02em}
.kicker{position:absolute;left:72px;top:110px;font-family:'DM Sans',sans-serif;
  font-weight:400;font-size:30px;letter-spacing:.26em;color:#8b8578;text-transform:uppercase}
.tri{position:absolute;inset:0;display:flex}
.tri>div{position:relative;flex:1;overflow:hidden}
/* Panels are a third of the frame wide, so a crop that flatters a full frame
   turns into three portrait heads and the colourway, which is the entire point
   of the panel, falls outside it. Sit lower: the garment fills the panel and
   the faces read as a detail rather than the subject. */
.tri img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 46%}
.big{position:absolute;left:0;right:0;bottom:190px;text-align:center;
  font-family:'DM Sans',sans-serif;font-weight:300;font-size:74px;color:#fff;
  text-shadow:0 2px 40px rgba(0,0,0,.55);line-height:1.14;padding:0 70px}
.plate{position:absolute;left:0;right:0;bottom:0;height:44%;
  background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.62))}
`;

// One crop for the whole cut sequence. 78% height window starting at 6% keeps
// the shoulders, both sleeves and the hem inside every frame, so the only
// thing that moves between frames is the garment.
const CUT_FIT = "object-position:50% 30%;";

function frameCut({ img, label, sub }) {
  return `<!doctype html><meta charset="utf-8"><style>${CSS}
  .cut{ ${CUT_FIT} }</style>
  <div class="f"><img class="cut" src="${img}">
    <div class="kicker">one shirt</div>
    <div class="plate" style="height:30%"></div>
    <div class="lbl" style="color:#fff">${label}</div>
    <div class="sub" style="color:#e6e0d4">${sub}</div>
  </div>`;
}

function frameFull({ img, label }) {
  return `<!doctype html><meta charset="utf-8"><style>${CSS}</style>
  <div class="f"><img style="object-position:50% 42%" src="${img}">
    <div class="plate"></div>
    <div class="big">${label}</div>
  </div>`;
}

function frameTri({ imgs, label }) {
  return `<!doctype html><meta charset="utf-8"><style>${CSS}</style>
  <div class="f"><div class="tri">
    ${imgs.map((i) => `<div><img src="${i}"></div>`).join("")}
  </div><div class="plate"></div>
  <div class="big">${label}</div></div>`;
}

fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const shots = [];
function shoot(name, html) {
  const f = path.join(TMP, name + ".html");
  const png = path.join(TMP, name + ".png");
  fs.writeFileSync(f, html);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars",
    "--virtual-time-budget=5000", `--window-size=${W},${H}`,
    `--screenshot=${png}`, `file://${f}`], { stdio: "ignore" });
  shots.push(name);
  return png;
}

// 1. the four cuts
const CUTS = [
  ["base",         "short sleeve",  "normal length"],
  ["long:normal",  "long sleeve",   "normal length"],
  ["long:longer",  "long sleeve",   "longer length"],
  ["short:longer", "short sleeve",  "longer length"],
];
const cutFrames = CUTS.map(([key, label, sub], i) =>
  shoot(`cut${i}`, frameCut({ img: blouseCombo(key), label, sub })));

// 2. the zoom out, on the banded trousers look rather than the plain one
const fullFrame = shoot("full", frameFull({
  img: b64(banded.comboImages.Ivory["wide:full"].front),
  label: "your shirt, your trousers,<br>your call",
}));

// 3. the colourway change, same cut throughout
const COLOURS = ["Ivory", "White", "Navy", "Burgundy"];
const colourFrames = COLOURS.map((c, i) =>
  shoot(`col${i}`, frameCut({ img: blouseCombo("base", c), label: c.toLowerCase(), sub: "same cut, four ways" })));

// 4. three colours at once, the founder's "what if you were the designer"
const triA = shoot("tri1", frameTri({
  imgs: ["Ivory", "Navy", "Burgundy"].map((c) => blouseCombo("base", c)),
  label: "what if you were the designer",
}));
const triB = shoot("tri2", frameTri({
  imgs: ["Ivory", "Navy", "Burgundy"].map((c) => blouseCombo("long:longer", c)),
  label: "what if it was cut for you",
}));

// ---------------------------------------------------------------- timeline
// README: 2 to 7 frames per state reads as a glitch. ~40 frames (1.3s) per
// choice is legible. The four cuts get a beat each, then the reveal holds.
const seq = [];
const hold = (p, n) => { for (let i = 0; i < n; i++) seq.push(p); };

hold(cutFrames[0], 46);
hold(cutFrames[1], 40);
hold(cutFrames[2], 40);
hold(cutFrames[3], 46);
hold(fullFrame, 78);
for (const f of colourFrames) hold(f, 36);
hold(triA, 74);
hold(triB, 82);

console.log(`${seq.length} frames = ${(seq.length / FPS).toFixed(1)}s`);
execFileSync("./scripts/social/encode", [OUT, String(FPS), String(W), String(H), ...seq], { stdio: "inherit" });
console.log(OUT);
