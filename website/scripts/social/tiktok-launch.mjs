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
// ON-SCREEN TEXT IS SET IN A SANS, NOT THE BRAND SERIF, AND THAT IS DELIBERATE.
// Italiana and Cormorant are hairline faces; at thumb distance on a phone, over
// imagery, moving, they break up. The brand mark still closes every video,
// so the identity lands where it can be read. Legibility wins over consistency
// in the only two seconds that decide whether the video is watched at all.
//
// SAFE AREA: TikTok's caption, username and button rail cover roughly the
// bottom 500px and the right 180px. Nothing that must be read goes there.
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Italiana&family=Reem+Kufi:wght@400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#EFEBE3}
/* A SOLID BAND, NOT A GRADIENT OVER THE PHOTOGRAPH.
   The first cut faded a white veil down over the top of the frame. On a
   full-length image the model's head sits exactly there, so every hook frame
   bleached her face into a ghost and printed the words across it. It looked
   like a mistake because it was one.
   The band is its own row now: type on clean ground, image untouched
   underneath, and the garment starts where the words end. */
.f{position:relative;width:${W}px;height:${H}px;background:#EFEBE3;overflow:hidden;
  display:flex;flex-direction:column}
.band{flex:0 0 auto;background:#F4F1EA;padding:96px 72px 44px;min-height:300px}
.stage{position:relative;flex:1 1 auto;overflow:hidden}
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.hook{font-family:Inter,sans-serif;font-weight:600;font-size:82px;line-height:1.05;
  letter-spacing:-.022em;color:#171512}
.hook.sm{font-size:62px}
.sub{margin-top:22px;font-family:Inter,sans-serif;font-weight:400;font-size:36px;
  line-height:1.32;color:#4a453c;max-width:860px}
.chip{position:absolute;left:56px;bottom:340px;display:inline-flex;align-items:center;gap:18px;
  background:rgba(23,21,18,.92);color:#fff;padding:20px 32px;border-radius:999px;
  font-family:Inter,sans-serif;font-weight:500;font-size:40px;letter-spacing:.01em}
.chip .dot{width:16px;height:16px;border-radius:50%;background:#c4a964}
.chip.off{background:rgba(255,255,255,.94);color:#171512}
.chip.off .dot{background:#cfc7b6}
.price{position:absolute;left:58px;bottom:150px;font-family:Inter,sans-serif;
  font-weight:400;font-size:34px;color:#4a453c;letter-spacing:.02em}
.grid{position:absolute;inset:0;display:grid;z-index:2}
.grid>div{position:relative;overflow:hidden}
.grid img{position:absolute;width:100%;height:100%;object-fit:cover}
.gl{position:absolute;left:22px;bottom:22px;font-family:Inter,sans-serif;font-weight:500;
  font-size:32px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.45)}
.end{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;
  justify-content:center;background:#171512;gap:26px}
.end .mark{font-family:Italiana,serif;font-size:120px;letter-spacing:16px;color:#fff}
.end .rule{width:150px;height:2px;background:#c4a964}
.end .ar{font-family:'Reem Kufi',sans-serif;font-size:46px;color:#fff;direction:rtl}
.end .u{margin-top:34px;font-family:Inter,sans-serif;font-weight:400;font-size:40px;color:#c8c1b5;letter-spacing:.04em}
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
};

const page = (inner) =>
  `<!doctype html><meta charset="utf-8"><style>${CSS}</style><div class="f">${inner}</div>`;

const photoFrame = ({ src, focus = "full", hook, sub, chips = [], price }) => {
  const chipHtml = chips
    .map((c, i) => `<div class="chip ${c.on ? "" : "off"}" style="bottom:${340 - i * 112}px"><span class="dot"></span>${c.label}</div>`)
    .join("");
  const band = hook
    ? `<div class="band"><div class="hook${hook.replace(/<br>/g, " ").length > 34 ? " sm" : ""}">${hook}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div>`
    : "";
  return page(`
    ${band}
    <div class="stage">
      <img class="photo" src="${src}" style="${FOCUS[focus]}">
      ${chipHtml}
      ${price ? `<div class="price">${price}</div>` : ""}
    </div>
  `);
};

const gridFrame = ({ cells, cols = 2 }) =>
  page(`<div class="grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${Math.ceil(cells.length / cols)},1fr)">
    ${cells.map((c) => `<div><img src="${c.src}" style="${FOCUS[c.focus ?? "legs"]}"><div class="gl">${c.label}</div></div>`).join("")}
  </div>`);

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

export { render, encode, hold, photoFrame, gridFrame, endFrame, shot, page, W, H, FPS, OUTDIR, TMP };

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("This module is the engine. Run scripts/social/tiktok-videos.mjs to build the set.");
}
