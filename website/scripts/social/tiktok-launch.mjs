/**
 * TikTok launch videos, rendered from the catalogue imagery.
 *
 *   npx tsx scripts/social/tiktok-launch.mjs [name ...]
 *
 * WHY THIS EXISTS: Shaklek owns one visual that almost no other clothing brand
 * has, which is a garment that REDRAWS ITSELF when an option changes, with a
 * its own image behind every combination rather than a mockup. 128 of them.
 * Nobody scrolling has seen a trouser change its own leg width. That is the
 * asset; tiles restating the website are not.
 *
 * THE RULE THAT BREAKS THESE VIDEOS, learned three times and written into
 * README.md: THE CROP MUST CONTAIN THE THING THAT CHANGES. A sleeve sequence
 * cropped to a face shows four identical frames and reads as a stuck video. A
 * length sequence that cuts off the hem is worse, because it looks deliberate.
 * Every spec below therefore declares its own `focus`, and the focus is chosen
 * from what the option actually moves.
 *
 * COPY RULES, all founder corrections: no em dashes, never write "AI", never
 * call this imagery a photograph, never spend "shhhhh" on a discount.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = "/Users/nadatlohi/Desktop/Shaklek";
const OUTDIR = `${ROOT}/brand-assets/TIKTOK`;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/tiktok-launch";
const W = 1080, H = 1920, FPS = 30;

const { catalog } = await import("../../src/data/catalog.ts");
const bySlug = Object.fromEntries(catalog.map((c) => [c.slug, c]));

fs.mkdirSync(OUTDIR, { recursive: true });
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const b64 = (rel) => {
  const p = path.join("public", rel);
  if (!fs.existsSync(p)) throw new Error(`missing image: ${rel}`);
  const ext = p.endsWith(".png") ? "png" : "jpeg";
  return `data:image/${ext};base64,${fs.readFileSync(p).toString("base64")}`;
};

/** back image for a slug + colour + combo */
const shotBack = (slug, colour, combo) => {
  const item = bySlug[slug];
  const rel = combo === "base" ? item.colorImages[colour].back : item.comboImages?.[colour]?.[combo]?.back;
  if (!rel) throw new Error(`no back image for ${slug}/${colour}/${combo}`);
  return b64(rel);
};

/** front image for a slug + colour + combo ("base" for the default combo) */
const shot = (slug, colour, combo) => {
  const item = bySlug[slug];
  if (!item) throw new Error(`no item ${slug}`);
  if (combo === "base") return b64(item.colorImages[colour].front);
  const c = item.comboImages?.[colour]?.[combo];
  if (!c) throw new Error(`no combo ${combo} for ${slug}/${colour}`);
  return b64(c.front);
};

// ------------------------------------------------------------------- style
//
// ⚠️ REBUILT 2026-08-27 AFTER THE FOUNDER SAW THE FIRST CUT. Her words: it looks
// like a kid did it, and she wanted luxurious, subtle, high value.
//
// She was right and the diagnosis is precise. The first cut set every hook in
// INTER SEMIBOLD, a user-interface sans, and hung black pill-shaped chips with
// little gold dots over the photograph. That is app design. It is the visual
// language of a settings screen, and no fashion house on earth uses it.
//
// I chose it deliberately, reasoning that Italiana's hairlines break up at thumb
// distance. That reasoning was wrong in the way that matters: the answer to a
// hairline face being fragile at 13px is to set it at 110px, where it is
// magnificent, not to replace it with a UI font. The brand already owns the
// right typeface and the first cut refused to use it.
//
// So: ITALIANA carries every statement, huge and letterspaced. Cormorant sets
// the second voice. Nothing is bold. Nothing is a pill. Labels are small caps
// over a gold hairline, which is how a fashion label annotates a garment, and
// the type sits on cream rather than on top of the model.
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Reem+Kufi:wght@400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#F2EDE4}
.f{position:relative;width:${W}px;height:${H}px;background:#F2EDE4;overflow:hidden;
  display:flex;flex-direction:column}

/* ---- the statement frame: type alone on cream, nothing else ---- */
.say{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:0 90px;text-align:center;gap:38px}
.say .big{font-family:Italiana,serif;font-size:118px;line-height:1.1;letter-spacing:9px;
  color:#171512;text-transform:none}
.say .big.two{font-size:96px;letter-spacing:7px}
.say .rule{width:120px;height:1px;background:#9C8445}
.say .under{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:46px;
  line-height:1.35;letter-spacing:.5px;color:#4A443B;max-width:820px}

/* ---- the product frame: photograph, annotated the way a garment is ---- */
.band{flex:0 0 auto;background:#F2EDE4;padding:86px 84px 40px}
.band .k{font-family:Italiana,serif;font-size:82px;line-height:1.12;letter-spacing:6px;color:#171512}
.band .k.sm{font-size:62px;letter-spacing:4px}
.band .s{margin-top:20px;font-family:'Cormorant Garamond',serif;font-weight:300;
  font-size:40px;line-height:1.35;color:#4A443B;letter-spacing:.4px}
.stage{position:relative;flex:1 1 auto;overflow:hidden}
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}

/* Annotation, not a chip. A caption strip along the foot of the image, the way
   a lookbook captions a plate.
   IT IS A STRIP AND NOT FLOATING TEXT because the garments are ivory linen on a
   pale ground: the first version set these words directly on the image and they
   were close to unreadable over the light shirts. A local strip fixes that
   without the earlier mistake of fading a veil across the model's face. */
/* A ROW IN THE COLUMN, not a layer over the photograph. As an absolute overlay
   it covered the bottom ~150px of the image, and on a full-length shot that is
   exactly where the hem is: a "normal length" and a "longer length" back view
   came out looking identical because the only difference between them was
   hidden behind this strip. */
.note{flex:0 0 auto;position:relative;background:#F2EDE4;
  padding:34px 84px 40px;display:flex;align-items:flex-end;justify-content:space-between}
.note .hr{position:absolute;left:84px;top:0;width:64px;height:1px;background:#9C8445}
.note .lines{display:flex;flex-direction:column}
.note .l{font-family:'Cormorant Garamond',serif;font-weight:400;
  font-size:38px;letter-spacing:4.5px;text-transform:uppercase;color:#171512;line-height:1.45}
.note .l + .l{color:#5A5349}
.price{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:38px;
  letter-spacing:4px;color:#171512;padding-bottom:4px}

/* ---- the four-up ---- */
.grid{position:absolute;inset:0;display:grid;z-index:2;background:#F2EDE4;gap:3px}
.grid>div{position:relative;overflow:hidden}
.grid img{position:absolute;width:100%;height:100%;object-fit:cover}
.gl{position:absolute;left:20px;bottom:20px;font-family:'Cormorant Garamond',serif;
  font-size:26px;letter-spacing:3px;text-transform:uppercase;color:#171512;
  background:rgba(242,237,228,.86);padding:8px 14px}


/* ---- the four-colour split: horizontal bands that slide in from the sides ----
   The founder's shot: the same shirt in four colours, as four horizontal bands
   arriving from alternating sides and meeting in the centre, with the line laid
   over them. Bands start fully off-frame and ease in. */
.split{position:absolute;inset:0;display:flex;flex-direction:column;z-index:2;background:#F2EDE4}
.split .row{position:relative;flex:1;overflow:hidden}
.split .row img{position:absolute;width:100%;height:100%;object-fit:cover}
.split .cap{position:absolute;right:34px;bottom:22px;font-family:'Cormorant Garamond',serif;
  font-size:26px;letter-spacing:3px;text-transform:uppercase;color:#F6F2EA;
  text-shadow:0 1px 12px rgba(0,0,0,.5)}
.split .cap.dark{color:#171512;text-shadow:none}
.overlay{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center}
.overlay .box{background:rgba(242,237,228,.93);padding:52px 72px;text-align:center}
.overlay .l1{font-family:Italiana,serif;font-size:92px;letter-spacing:7px;color:#171512;line-height:1.16}

/* ---- the tenets, set as the site sets them ---- */
.tenets{position:absolute;inset:0;z-index:2;background:#F2EDE4;padding:150px 96px;
  display:flex;flex-direction:column;justify-content:center;gap:56px}
.tenets .t{display:flex;flex-direction:column;gap:14px}
.tenets .k{font-family:Italiana,serif;font-size:64px;letter-spacing:4px;color:#171512}
.tenets .v{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:40px;
  line-height:1.34;color:#4A443B}
.tenets .hr{width:56px;height:1px;background:#9C8445}

/* ---- the sign-off ---- */
.end{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;
  justify-content:center;background:#171512;gap:30px}
.end .mark{font-family:Italiana,serif;font-size:136px;letter-spacing:20px;color:#F6F2EA;
  padding-left:20px}
.end .rule{width:150px;height:1px;background:#9C8445}
.end .ar{font-family:'Reem Kufi',sans-serif;font-size:48px;color:#F6F2EA;direction:rtl}
.end .u{margin-top:40px;font-family:'Cormorant Garamond',serif;font-weight:300;
  font-size:38px;color:#B8B0A2;letter-spacing:5px}
`;

/**
 * `focus` positions the image inside the frame. It is not decoration:
 * see the crop rule at the top of this file.
 *   arms  -> upper body, both sleeves and the hem in frame
 *   legs  -> lower body, the hem inside the frame or cropped and full read alike
 *   full  -> whole figure
 */
const FOCUS = {
  arms: "object-position:50% 22%;transform:scale(1.28)",
  legs: "object-position:50% 78%;transform:scale(1.18)",
  full: "object-position:50% 45%;transform:scale(1.02)",
  // The whole garment, hem included. No zoom at all: on a full-length shot any
  // scale above 1 eats the hem, which is the thing being compared.
  whole: "object-position:50% 50%;transform:none",
};

const page = (inner) =>
  `<!doctype html><meta charset="utf-8"><style>${CSS}</style><div class="f">${inner}</div>`;

/** Type alone on cream. Used for the claim, never over a model's face. */
const sayFrame = ({ big, under }) =>
  page(`<div class="say">
    <div class="big${big.replace(/<br>/g, " ").length > 22 ? " two" : ""}">${big}</div>
    ${under ? `<div class="rule"></div><div class="under">${under}</div>` : ""}
  </div>`);

/**
 * A photograph, annotated. `note` is an array of lines set in small caps under
 * a gold hairline, which is how a lookbook captions a plate. It is deliberately
 * NOT a pill, a badge or a button: those belong to interfaces.
 */
const photoFrame = ({ src, focus = "full", hook, sub, note = [], price, onDark = false }) => {
  const band = hook
    ? `<div class="band"><div class="k${hook.replace(/<br>/g, " ").length > 26 ? " sm" : ""}">${hook}</div>${sub ? `<div class="s">${sub}</div>` : ""}</div>`
    : "";
  const ann = note.length
    ? `<div class="note"><div class="hr"></div>
         <div class="lines">${note.map((l) => `<span class="l">${l}</span>`).join("")}</div>
         ${price ? `<div class="price">${price}</div>` : ""}
       </div>`
    : "";
  return page(`
    ${band}
    <div class="stage">
      <img class="photo" src="${src}" style="${FOCUS[focus]}">
    </div>
    ${ann}
  `);
};

const gridFrame = ({ cells, cols = 2 }) =>
  page(`<div class="grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${Math.ceil(cells.length / cols)},1fr)">
    ${cells.map((c) => `<div><img src="${c.src}" style="${FOCUS[c.focus ?? "legs"]}"><div class="gl">${c.label}</div></div>`).join("")}
  </div>`);


/** Four horizontal colour bands sliding in from alternating sides. p: 0 to 1. */
const splitFrame = ({ rows, p, line }) => {
  const ease = 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);
  const body = rows.map((r, i) => {
    const from = i % 2 === 0 ? -100 : 100;
    const x = from * (1 - ease);
    return `<div class="row"><img src="${r.src}" style="${FOCUS[r.focus ?? "full"]};transform:translateX(${x}%) ${FOCUS[r.focus ?? "full"].includes("scale") ? "" : ""}">
      <div class="cap${r.dark ? " dark" : ""}" style="opacity:${ease.toFixed(2)}">${r.label}</div></div>`;
  }).join("");
  const over = line && ease > 0.72
    ? `<div class="overlay" style="opacity:${(((ease - 0.72) / 0.28)).toFixed(2)}"><div class="box"><div class="l1">${line}</div></div></div>`
    : "";
  return page(`<div class="split">${body}</div>${over}`);
};

/** The three reasons from the website, set the way the website sets them. */
const tenetsFrame = (items) =>
  page(`<div class="tenets">${items.map((t) => `<div class="t"><div class="k">${t.k}</div><div class="hr"></div><div class="v">${t.v}</div></div>`).join("")}</div>`);

const endFrame = () =>
  page(`<div class="end"><div class="mark">Shaklek</div><div class="rule"></div>
    <div class="ar" dir="rtl" lang="ar">شكلك</div><div class="u">shaklek.com</div></div>`);

// ------------------------------------------------------------------ render
let shotCount = 0;
function render(html, name) {
  const htmlPath = `${TMP}/${name}.html`;
  const pngPath = `${TMP}/${name}.png`;
  fs.writeFileSync(htmlPath, html);
  execFileSync(CHROME, [
    "--headless", "--disable-gpu", "--hide-scrollbars",
    "--virtual-time-budget=3000", `--window-size=${W},${H}`,
    `--screenshot=${pngPath}`, `file://${htmlPath}`,
  ], { stdio: "ignore" });
  if (!fs.existsSync(pngPath)) throw new Error(`chrome produced nothing for ${name}`);
  shotCount++;
  return pngPath;
}

function encode(frames, outFile) {
  execFileSync(`${ROOT}/website/scripts/social/encode`,
    [outFile, String(FPS), String(W), String(H), ...frames], { stdio: "inherit" });
}

/** hold(frame, seconds) -> repeated frame paths */
const hold = (f, secs) => Array(Math.round(secs * FPS)).fill(f);

export { render, encode, hold, photoFrame, sayFrame, gridFrame, splitFrame, tenetsFrame, endFrame, shot, shotBack, page, W, H, FPS, OUTDIR, TMP };

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("This module is the engine. Run scripts/social/tiktok-videos.mjs to build the set.");
}
