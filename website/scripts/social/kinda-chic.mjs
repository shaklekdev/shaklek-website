// Render the "kinda chic" stills.
//
//   npx tsx scripts/social/kinda-chic.mjs
//
// Copy and reasoning live in planning/marketing/kinda-chic.md. Read section 1
// there before adding a line: the trend is a body-positivity format, not a
// product format, and a feature line posted in it reads as a brand hijack.
//
// Two formats per line, because they are different posts:
//   ig-  1080x1350  4:5, the tallest Instagram allows in feed
//   tt-  1080x1920  9:16, TikTok and Reels full screen
//
// The soft yellow caption is the trend's signature and is deliberately NOT
// swapped for a brand colour. Recognition is the whole reason to use a format
// somebody else built.
//
// House rules enforced here rather than trusted to whoever writes the copy:
//   - no em dash, no en dash (they read as generated text)
//   - never the word "photograph" (the catalog imagery is generated, and
//     calling it a photograph is a false claim about the product)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "../../node_modules/sharp/dist/index.cjs";

const OUT = "/Users/nadatlohi/Desktop/Shaklek/brand-assets/INSTA/kinda-chic";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/kc-frames";

// Trend signature. Soft yellow on a dimmed image.
const YELLOW = "#F4E06A";

/** slug -> the image the line sits on, and where the caption may go. */
const LINES = [
  { id: "a1", text: "kinda chic to have never been a medium", tier: "ORGANIC",
    item: "structured-blouse", color: "Ivory", anchor: "bottom" },
  { id: "a2", text: "kinda chic to stop blaming your body for the fit", tier: "ORGANIC",
    item: "oversized-shirt", color: "Navy", anchor: "bottom" },
  { id: "a3", text: "kinda chic to be between two sizes forever", tier: "ORGANIC",
    item: "wrap-top", color: "Burgundy", anchor: "bottom" },
  { id: "a4", text: "kinda chic to know your own measurements", tier: "SAFE",
    item: "utility-shirt", color: "Ivory", anchor: "bottom" },
  { id: "a5", text: "kinda chic to buy one thing that fits", tier: "SAFE",
    item: "banded-trousers", color: "Navy", anchor: "bottom" },
  { id: "a7", text: "kinda chic to want sleeves that end where your arms do", tier: "SAFE",
    item: "oversized-shirt", color: "Ivory", anchor: "bottom" },
  { id: "b1", text: "kinda chic to never sit in a tailor's queue again", tier: "SAFE",
    item: "pleated-trousers", color: "Ivory", anchor: "bottom" },
  { id: "b4", text: "kinda chic to only own things you actually wear", tier: "SAFE",
    item: "wide-leg-trousers", color: "Navy", anchor: "bottom" },
  { id: "c1", text: "kinda chic to dress for august in dubai", tier: "SAFE",
    item: "cargo-trousers", color: "Ivory", anchor: "bottom" },
  { id: "c3", text: "kinda chic to wear linen in a lift", tier: "SAFE",
    item: "wrap-top", color: "Ivory", anchor: "bottom" },
];

const BANNED = [
  [/[—–]/, "em or en dash: reads as generated text"],
  [/\bphotograph/i, "calls the imagery a photograph: it is generated"],
  [/\bAI\b/, "no AI mentions customer facing"],
];

function lint(line) {
  for (const [re, why] of BANNED) if (re.test(line.text)) throw new Error(`${line.id}: ${why}`);
  if (line.text !== line.text.toLowerCase()) throw new Error(`${line.id}: keep captions lowercase`);
}

// Where the crop sits. A single value cannot serve both: the shirts are shot
// close, the trousers full length, so one object-position that flatters a
// blouse slices a trouser model's head in half. A half head reads as an
// accident; either show the face or clearly do not.
//
// This is scripts/social/README.md's own lesson, arrived at again from the
// other direction: never crop a garment whose LENGTH is the subject the same
// way you crop one whose neckline is.
const FOCUS = { Shirt: "50% 20%", Pants: "50% 74%" };

function page({ text, imgDataUri, w, h, focus }) {
  // Caption size scales with frame width so 4:5 and 9:16 read identically.
  // v2: up from 0.062. At the smaller size the line read as a footnote rather
  // than the point of the post, which is backwards for this format.
  const size = Math.round(w * 0.076);
  return `<!doctype html><meta charset="utf-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden;background:#111}
  .wrap{position:relative;width:${w}px;height:${h}px}
  img{width:100%;height:100%;object-fit:cover;object-position:${focus};display:block}
  /* Dim only the lower half, so the caption has contrast without flattening
     the garment. A full-frame scrim makes the cloth look grey. */
  /* v3: deep at the very bottom where the caption sits, but starting lower, so
     the garment itself is not greyed. v2 dimmed from 34% down and the cloth
     went muddy on the ivory pieces, which are half the catalog. Contrast is
     judged on the lightest image in the set, never the darkest. */
  .scrim{position:absolute;inset:0;background:linear-gradient(to bottom,
     rgba(0,0,0,0) 48%, rgba(0,0,0,.20) 68%, rgba(0,0,0,.82) 100%)}
  .cap{position:absolute;left:${Math.round(w*0.085)}px;right:${Math.round(w*0.085)}px;
     bottom:${Math.round(h*0.085)}px;
     font-family:'DM Sans',system-ui,sans-serif;font-weight:300;
     font-size:${size}px;line-height:1.16;letter-spacing:.004em;
     /* balance stops a single orphan word dropping to its own line, which is
        what "... never been a / medium" was doing. */
     text-wrap:balance;
     color:${YELLOW};text-shadow:0 2px 28px rgba(0,0,0,.55)}
  </style><div class="wrap"><img src="${imgDataUri}"><div class="scrim"></div>
  <div class="cap">${text}</div></div>`;
}

function shoot(html, w, h, out) {
  const f = path.join(TMP, "p.html");
  fs.writeFileSync(f, html);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars",
    "--virtual-time-budget=4000", `--window-size=${w},${h}`,
    `--screenshot=${out}`, `file://${f}`], { stdio: "ignore" });
}

const { catalog } = await import("../../src/data/catalog.ts");

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

let made = 0;
for (const line of LINES) {
  lint(line);
  const item = catalog.find((c) => c.slug === line.item);
  if (!item) throw new Error(`${line.id}: no catalog item ${line.item}`);
  const src = item.colorImages?.[line.color]?.front ?? item.image;
  const abs = path.join("public", src);
  if (!fs.existsSync(abs)) throw new Error(`${line.id}: missing ${src}`);
  const b64 = fs.readFileSync(abs).toString("base64");
  const uri = `data:image/jpeg;base64,${b64}`;

  for (const [tag, w, h] of [["ig", 1080, 1350], ["tt", 1080, 1920]]) {
    const out = path.join(OUT, `${tag}-${line.id}-${line.tier.toLowerCase()}.png`);
    const focus = line.focus ?? FOCUS[item.category] ?? "50% 30%";
    shoot(page({ text: line.text, imgDataUri: uri, w, h, focus }), w, h, out);
    made++;
  }
  console.log(`  ${line.id}  ${line.tier.padEnd(7)}  ${line.text}`);
}
console.log(`\n${made} stills -> ${OUT}`);
