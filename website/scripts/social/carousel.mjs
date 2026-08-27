/**
 * Photo carousels for TikTok photo mode and Instagram.
 *
 *   npx tsx scripts/social/carousel.mjs
 *
 * WHY CAROUSELS GET THEIR OWN BUILDER: multiple 2026 sources put photo mode
 * among the fastest-growing content types on TikTok, saved at higher rates than
 * video, and saves rank above likes as a ranking signal. Shaklek has 128
 * combination images already rendered, which is a carousel library nobody else has.
 *
 * Two sizes out of one definition:
 *   TikTok photo mode  1080x1920
 *   Instagram          1080x1350  (the tallest the feed allows)
 *
 * The crop rule from README.md applies here exactly as it does to video, and it
 * has ALREADY bitten the stills once: a 4:5 crop tuned for a blouse sliced a
 * trouser model's head in half, because those images are full length. Each slide
 * declares its own focus.
 */
import fs from "node:fs";
import { lint } from "./copy-rules.mjs";
import { execFileSync } from "node:child_process";

const ROOT = "/Users/nadatlohi/Desktop/Shaklek";
const OUT_TT = `${ROOT}/brand-assets/TIKTOK/carousels`;
const OUT_IG = `${ROOT}/brand-assets/INSTA/carousels`;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/shaklek-carousel";

const { catalog } = await import("../../src/data/catalog.ts");
const bySlug = Object.fromEntries(catalog.map((c) => [c.slug, c]));

for (const d of [OUT_TT, OUT_IG, TMP]) fs.mkdirSync(d, { recursive: true });

const b64 = (rel) => {
  const p = `public/${rel}`;
  if (!fs.existsSync(p)) throw new Error(`missing ${rel}`);
  return `data:image/${p.endsWith(".png") ? "png" : "jpeg"};base64,${fs.readFileSync(p).toString("base64")}`;
};
const shot = (slug, colour, combo) => {
  const it = bySlug[slug];
  return combo === "base" ? b64(it.colorImages[colour].front) : b64(it.comboImages[colour][combo].front);
};

const FOCUS = {
  arms: "object-position:50% 22%;transform:scale(1.26)",
  legs: "object-position:50% 78%;transform:scale(1.16)",
  full: "object-position:50% 45%;transform:scale(1.02)",
};

const css = (W, H, band) => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Italiana&family=Reem+Kufi:wght@400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#EFEBE3}
.f{width:${W}px;height:${H}px;display:flex;flex-direction:column;background:#EFEBE3;overflow:hidden}
.band{flex:0 0 auto;background:#F4F1EA;padding:${band.pad};min-height:${band.min}px}
.k{font-family:Inter,sans-serif;font-weight:600;font-size:${band.k}px;line-height:1.05;
  letter-spacing:-.022em;color:#171512}
.s{margin-top:18px;font-family:Inter,sans-serif;font-weight:400;font-size:${band.s}px;
  line-height:1.32;color:#4a453c}
.stage{position:relative;flex:1 1 auto;overflow:hidden}
img.p{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.tag{position:absolute;left:48px;bottom:48px;display:inline-flex;align-items:center;gap:16px;
  background:rgba(23,21,18,.92);color:#fff;padding:${band.tagPad};border-radius:999px;
  font-family:Inter,sans-serif;font-weight:500;font-size:${band.tag}px}
.tag .d{width:14px;height:14px;border-radius:50%;background:#c4a964}
.n{position:absolute;right:44px;top:36px;font-family:Inter,sans-serif;font-weight:500;
  font-size:${band.tag}px;color:#171512;background:rgba(255,255,255,.9);
  border-radius:999px;padding:10px 24px}
.end{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;
  justify-content:center;background:#171512;gap:24px}
.end .m{font-family:Italiana,serif;font-size:${band.k + 26}px;letter-spacing:14px;color:#fff}
.end .r{width:130px;height:2px;background:#c4a964}
.end .a{font-family:'Reem Kufi',sans-serif;font-size:${band.s + 6}px;color:#fff;direction:rtl}
.end .u{margin-top:26px;font-family:Inter,sans-serif;font-size:${band.s}px;color:#c8c1b5;letter-spacing:.04em}
`;

const SIZES = {
  tt: { W: 1080, H: 1920, dir: OUT_TT, band: { pad: "88px 68px 40px", min: 300, k: 78, s: 36, tag: 36, tagPad: "18px 30px" } },
  ig: { W: 1080, H: 1350, dir: OUT_IG, band: { pad: "62px 62px 32px", min: 230, k: 66, s: 32, tag: 32, tagPad: "16px 26px" } },
};

function render(html, file, W, H) {
  const h = `${TMP}/tmp.html`;
  fs.writeFileSync(h, html);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars",
    "--virtual-time-budget=3000", `--window-size=${W},${H}`, `--screenshot=${file}`, `file://${h}`],
    { stdio: "ignore" });
  if (!fs.existsSync(file)) throw new Error(`chrome produced nothing for ${file}`);
}

function build(set) {
  lint(set.caption, `${set.name} caption`);
  for (const sl of set.slides) {
    for (const key of ["k", "s", "tag"]) if (sl[key]) lint(sl[key], `${set.name} slide.${key}`);
  }
  let made = 0;
  for (const [key, S] of Object.entries(SIZES)) {
    const dir = `${S.dir}/${set.name}`;
    fs.mkdirSync(dir, { recursive: true });
    set.slides.forEach((sl, i) => {
      const n = String(i + 1).padStart(2, "0");
      const inner = sl.end
        ? `<div class="end"><div class="m">Shaklek</div><div class="r"></div>
             <div class="a" dir="rtl" lang="ar">شكلك</div><div class="u">shaklek.com</div></div>`
        : `<div class="band"><div class="k">${sl.k}</div>${sl.s ? `<div class="s">${sl.s}</div>` : ""}</div>
           <div class="stage"><img class="p" src="${sl.src}" style="${FOCUS[sl.focus ?? "full"]}">
             ${sl.tag ? `<div class="tag"><span class="d"></span>${sl.tag}</div>` : ""}
             <div class="n">${i + 1}/${set.slides.length}</div></div>`;
      const html = `<!doctype html><meta charset="utf-8"><style>${css(S.W, S.H, S.band)}</style><div class="f">${inner}</div>`;
      render(html, `${dir}/${n}.png`, S.W, S.H);
      made++;
    });
    fs.writeFileSync(`${dir}/caption.txt`, set.caption + "\n\n" + set.hashtags + "\n");
  }
  console.log(`${set.name}  ${set.slides.length} slides x 2 sizes = ${made} images`);
}

const HASH = "#dubaifashion #madetomeasure #madetoorder #linen #shaklek\n#دبي #تفصيل #خياطة";

// ---------------------------------------------------------------- the sets
build({
  name: "01-four-ways-to-cut-it",
  caption:
    "Same trouser, four ways to cut it. Straight or wide, cropped or full length. You pick one and a tailor makes that one. AED 429.",
  hashtags: HASH,
  slides: [
    { k: "same trouser.", s: "Four ways to cut it. Swipe.", src: shot("wide-leg-trousers", "Ivory", "base"), focus: "legs", tag: "Straight, full length" },
    { k: "straight, cropped", src: shot("wide-leg-trousers", "Ivory", "straight:cropped"), focus: "legs", tag: "Straight, cropped" },
    { k: "wide, full length", src: shot("wide-leg-trousers", "Ivory", "wide:full"), focus: "legs", tag: "Wide, full length" },
    { k: "wide, cropped", src: shot("wide-leg-trousers", "Ivory", "wide:cropped"), focus: "legs", tag: "Wide, cropped" },
    { k: "you pick one.", s: "Then one tailor makes that one. About ten days.", src: shot("wide-leg-trousers", "Navy", "wide:full"), focus: "full", tag: "AED 429" },
    { end: true },
  ],
});

build({
  name: "02-the-sleeves-never-fit",
  caption:
    "The shirt fits. The sleeves never do. So set the sleeve yourself, then send four measurements and we cut the shirt to those. Or pick XS to XXL. Same price either way. AED 389.",
  hashtags: HASH,
  slides: [
    { k: "the shirt fits.", s: "The sleeves never do.", src: shot("oversized-shirt", "Ivory", "base"), focus: "full" },
    { k: "short sleeve", src: shot("oversized-shirt", "Ivory", "short:normal"), focus: "full", tag: "Short, normal length" },
    { k: "long sleeve", src: shot("oversized-shirt", "Ivory", "base"), focus: "full", tag: "Long, normal length" },
    { k: "longer body", src: shot("oversized-shirt", "Ivory", "long:longer"), focus: "full", tag: "Long, longer" },
    { k: "both, changed", src: shot("oversized-shirt", "Ivory", "short:longer"), focus: "full", tag: "Short, longer" },
    { k: "then cut to you.", s: "Four measurements, or XS to XXL. Same price.", src: shot("oversized-shirt", "Burgundy", "long:longer"), focus: "full", tag: "AED 389" },
    { end: true },
  ],
});

// ⚠️ "One piece" was wrong and would have been a false claim. The banded
// trousers are photographed with a matching top, and in each colourway BOTH
// garments change, so a carousel captioned "one piece, four colours" shows a
// customer an outfit and sells them a trouser. Copy names the trousers and the
// caption says so outright.
build({
  name: "03-the-trousers-four-colours",
  caption:
    "The same trousers, four colours. You see the cut and the colour together rather than a swatch on a screen. 100% linen, AED 429, made after you order it and not before. The top is styling and not included.",
  hashtags: HASH,
  slides: [
    { k: "same trousers.", s: "Four colours. Swipe.", src: shot("banded-trousers", "Ivory", "wide:full"), focus: "full", tag: "Ivory" },
    { k: "white", src: shot("banded-trousers", "White", "wide:full"), focus: "full", tag: "White" },
    { k: "navy", src: shot("banded-trousers", "Navy", "wide:full"), focus: "full", tag: "Navy" },
    { k: "burgundy", src: shot("banded-trousers", "Burgundy", "wide:full"), focus: "full", tag: "Burgundy" },
    { k: "the trousers, AED 429.", s: "The top is styling, not included.", src: shot("banded-trousers", "Navy", "wide:cropped"), focus: "legs", tag: "Banded Trousers" },
    { end: true },
  ],
});

build({
  name: "04-a-size-chart-is-an-average",
  caption:
    "A size chart is an average of everyone. You are not an average of everyone. Pick a standard size or send four numbers, and it is cut to those instead. Tailoring costs nothing extra here.",
  hashtags: HASH,
  slides: [
    { k: "a size chart is an average of everyone", src: shot("utility-shirt", "Ivory", "long:longer"), focus: "full" },
    { k: "you are not.", s: "Bust. Waist. Hip. Height.", src: shot("structured-blouse", "Ivory", "long:longer"), focus: "full" },
    { k: "so send four numbers", s: "And it is cut to those instead.", src: shot("pleated-trousers", "Ivory", "wide:full"), focus: "full" },
    { k: "or pick a size.", s: "XS to XXL. Trousers 32 to 44.", src: shot("wrap-top", "Ivory", "long:longer"), focus: "full" },
    { k: "same price either way.", s: "Tailoring costs nothing extra here.", src: shot("cargo-trousers", "Ivory", "wide:full"), focus: "full", tag: "From AED 389" },
    { end: true },
  ],
});

build({
  name: "05-how-it-actually-works",
  caption:
    "How it works. Pick a piece, change the sleeve or the leg or the length and watch the picture change to the cut you chose, then either choose a size or send four measurements. One tailor makes it. About ten days, because nothing is made before you order it.",
  hashtags: HASH,
  slides: [
    { k: "how it actually works", s: "Four steps. Swipe.", src: shot("oversized-shirt", "Ivory", "base"), focus: "full" },
    { k: "1. pick a piece", s: "Eight timeless essentials. 100% linen.", src: shot("utility-shirt", "Navy", "long:longer"), focus: "full" },
    { k: "2. change it", s: "Sleeve, leg, length, colour. The picture changes to the cut you chose.", src: shot("wide-leg-trousers", "Ivory", "wide:cropped"), focus: "legs", tag: "Wide, cropped" },
    { k: "3. your size", s: "XS to XXL, trousers 32 to 44, or send four measurements. Same price.", src: shot("structured-blouse", "Ivory", "long:longer"), focus: "full" },
    { k: "4. one tailor makes it", s: "About ten days. Nothing is made before you order it.", src: shot("banded-trousers", "Burgundy", "wide:full"), focus: "full", tag: "From AED 389" },
    { end: true },
  ],
});

build({
  name: "06-why-ten-days",
  caption:
    "Ten days is not slow. It is how long it takes when the piece does not exist until you order it. No warehouse, no leftover stock, no size run guessed months ago. One tailor, one piece, cut to the numbers you sent.",
  hashtags: HASH,
  slides: [
    { k: "ten days.", s: "Here is what that buys.", src: shot("pleated-trousers", "Ivory", "wide:full"), focus: "full" },
    { k: "no warehouse.", s: "Nothing is sitting in a box waiting for someone your size.", src: shot("cargo-trousers", "Navy", "wide:full"), focus: "full" },
    { k: "no leftover stock.", s: "Nothing is made that nobody ordered.", src: shot("wrap-top", "Burgundy", "long:longer"), focus: "full" },
    { k: "one tailor. one piece.", s: "Cut to the numbers you sent, or to the size you picked.", src: shot("utility-shirt", "White", "long:longer"), focus: "full" },
    { k: "that is the ten days.", s: "It is the reason, not the cost.", src: shot("wide-leg-trousers", "Ivory", "wide:full"), focus: "full", tag: "AED 429" },
    { end: true },
  ],
});
