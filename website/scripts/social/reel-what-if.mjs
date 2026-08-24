// Re-cut of reel-what-if, to the founder's note (2026-08-25).
//
//   npx tsx scripts/social/reel-what-if.mjs
//
// Her complaint, and it is the same defect twice: "you did not show the right
// parts of the images. For the sleeves we don't see many types, for the legs we
// don't even see the leg of the model."
//
// The old cut used ONE crop for the whole reel. A single flattering crop of a
// model shows the face and the neckline, which is exactly where sleeves and
// legs are not. So the video announced a change and then showed a frame where
// nothing appeared to move.
//
// The rule this enforces: THE CROP FOLLOWS THE SUBJECT. Each section declares
// which part of the body it is about, and the crop is set from that, not from
// what makes the nicest still. Sleeves crop to the arms. Length crops to the
// hem. Legs crop to the legs, and the hem has to be inside the frame or
// cropped and full length are the same picture.
//
// COPY RULES: no em dashes, no AI, never call the imagery a photograph.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = "/Users/nadatlohi/Desktop/Shaklek";
const OUT = `${ROOT}/brand-assets/INSTA/VIDEO-10-what-if-recut.mp4`;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/reel-whatif";
const W = 1080, H = 1920, FPS = 30;

const { catalog } = await import("../../src/data/catalog.ts");
const get = (s) => catalog.find((c) => c.slug === s);
const blouse = get("structured-blouse");
const shirt = get("oversized-shirt");
const wide = get("wide-leg-trousers");

const b64 = (rel) => {
  const p = path.join("public", rel);
  if (!fs.existsSync(p)) throw new Error(`missing ${rel}`);
  return `data:image/jpeg;base64,${fs.readFileSync(p).toString("base64")}`;
};
const shot = (item, key, color = "Ivory") =>
  key === "base"
    ? b64(item.colorImages[color].front)
    : b64(item.comboImages[color][key].front);

// The whole point of the re-cut. Each value is chosen so the varying feature is
// inside the frame, and is deliberately NOT the most flattering crop.
const CROP = {
  sleeves: "50% 24%", // shoulders to forearm
  hem: "50% 40%", // waist to below the shirt hem
  legs: "50% 78%", // knee to floor, so the ankle and the hem are visible
  full: "50% 45%",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#F3F0EA}
.f{position:relative;width:${W}px;height:${H}px;background:#F3F0EA}
img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.plate{position:absolute;left:0;right:0;bottom:0;height:40%;
  background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.66))}
.q{position:absolute;left:0;right:0;bottom:210px;text-align:center;padding:0 80px;
  font-family:'DM Sans',sans-serif;font-weight:300;font-size:76px;color:#fff;
  line-height:1.14;text-shadow:0 2px 40px rgba(0,0,0,.5)}
/* The answer label names the option being shown, so it has to be readable at
   the size a reel is actually watched, on a phone, held at arm's length. At
   38px it was a footnote under the thing it was labelling. */
.a{position:absolute;left:0;right:0;bottom:150px;text-align:center;
  font-family:'DM Sans',sans-serif;font-weight:400;font-size:52px;color:#F4E06A;
  letter-spacing:.04em;text-shadow:0 2px 30px rgba(0,0,0,.5)}
.card{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:#15243a}
.card p{font-family:'DM Sans',sans-serif;font-weight:300;font-size:82px;color:#F3F0EA;
  text-align:center;padding:0 100px;line-height:1.18}
`;

function frame({ img, crop, q, a }) {
  return `<!doctype html><meta charset="utf-8"><style>${CSS}</style>
  <div class="f"><img style="object-position:${crop}" src="${img}">
    <div class="plate"></div>
    ${q ? `<div class="q">${q}</div>` : ""}
    ${a ? `<div class="a">${a}</div>` : ""}
  </div>`;
}
function card(text) {
  return `<!doctype html><meta charset="utf-8"><style>${CSS}</style>
  <div class="f"><div class="card"><p>${text}</p></div></div>`;
}

fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
let n = 0;
function shoot(html) {
  const f = path.join(TMP, `f${n}.html`), png = path.join(TMP, `f${n}.png`);
  n++;
  fs.writeFileSync(f, html);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars",
    "--virtual-time-budget=5000", `--window-size=${W},${H}`,
    `--screenshot=${png}`, `file://${f}`], { stdio: "ignore" });
  return png;
}

// ------------------------------------------------------------- the sections

const open = shoot(card("what if you<br>were the designer"));

// Sleeves. Cropped to the arms, so the change is the only thing on screen.
const sleeveQ = shoot(frame({ img: shot(blouse, "base"), crop: CROP.sleeves,
  q: "what if the sleeve<br>ended where you wanted" }));
const sleeveA = shoot(frame({ img: shot(blouse, "base"), crop: CROP.sleeves, a: "short" }));
const sleeveB = shoot(frame({ img: shot(blouse, "long:normal"), crop: CROP.sleeves, a: "long" }));
const sleeveC = shoot(frame({ img: shot(shirt, "short:normal"), crop: CROP.sleeves, a: "short, relaxed" }));
const sleeveD = shoot(frame({ img: shot(shirt, "base"), crop: CROP.sleeves, a: "long, relaxed" }));

// Length. Cropped to the hem.
const hemQ = shoot(frame({ img: shot(blouse, "base"), crop: CROP.hem,
  q: "what if the hem<br>sat where you wanted" }));
const hemA = shoot(frame({ img: shot(blouse, "base"), crop: CROP.hem, a: "normal" }));
const hemB = shoot(frame({ img: shot(blouse, "long:longer"), crop: CROP.hem, a: "longer" }));

// Legs. Cropped to the legs, which the old cut never showed at all.
const legQ = shoot(frame({ img: shot(wide, "base"), crop: CROP.legs,
  q: "what if the leg<br>fell the way you wanted" }));
const legA = shoot(frame({ img: shot(wide, "straight:cropped"), crop: CROP.legs, a: "straight, cropped" }));
const legB = shoot(frame({ img: shot(wide, "wide:cropped"), crop: CROP.legs, a: "wide, cropped" }));
const legC = shoot(frame({ img: shot(wide, "wide:full"), crop: CROP.legs, a: "wide, full length" }));

// Colour, then the close.
const colFrames = ["Ivory", "Navy", "Burgundy"].map((c) =>
  shoot(frame({ img: shot(blouse, "base", c), crop: CROP.full, a: c.toLowerCase() })));
const close = shoot(card("this isn't just a brand.<br>it's yours."));

// ---------------------------------------------------------------- timeline
const seq = [];
const hold = (p, k) => { for (let i = 0; i < k; i++) seq.push(p); };

hold(open, 60);
hold(sleeveQ, 54);
for (const f of [sleeveA, sleeveB, sleeveC, sleeveD]) hold(f, 34);
hold(hemQ, 50);
hold(hemA, 36); hold(hemB, 42);
hold(legQ, 54);
for (const f of [legA, legB, legC]) hold(f, 38);
for (const f of colFrames) hold(f, 34);
hold(close, 90);

console.log(`${seq.length} frames = ${(seq.length / FPS).toFixed(1)}s`);
execFileSync("./scripts/social/encode", [OUT, String(FPS), String(W), String(H), ...seq], { stdio: "inherit" });
console.log(OUT);
