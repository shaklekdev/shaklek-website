/**
 * Render a validated .dc.html carousel into POSTABLE files, laid out exactly
 * like 00-first-post-the-name: ig/NN.png, tt/NN.png, caption.txt.
 *
 *   node _tools/render-post.mjs 02-nobody-is-a-medium Main Invert Average Close
 *
 * WHY THIS EXISTS. render-slides.mjs produced one 1080x1350 into a png/ folder.
 * The founder, 2026-09-15: "these are all still not clear as posts i can share
 * in insta and tiktok... generate them again like you've done for
 * 00-first-post-the-name, with caption and formats for ig and tt." A carousel
 * that only exists as artboards is not a post; she should not have to open a
 * design canvas on her phone to get a file.
 *
 * ⚠️ THE ARTBOARDS ARE NOT EDITED AND MUST NOT BE. Her instruction in the same
 * breath: "don't change anything in them just save these posts that were
 * validated." This reads them, renders them, and writes nothing back.
 *
 * ⚠️ TIKTOK IS PADDED, NEVER RESCALED OR CROPPED. The artboards are designed at
 * 1080x1350 with their own margins. Stretching to 1080x1920 distorts the type
 * and cropping eats the padding the layout depends on. So the 1350 render is
 * placed unchanged in the middle of a 1920 canvas and the bands above and below
 * take the slide's OWN edge colour, sampled from its corner pixels rather than
 * assumed to be ivory: several slides are burgundy or navy full-bleed and a
 * hardcoded cream would frame them in the wrong colour.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(HERE, "../../../website/package.json"));
const sharp = require("sharp");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const IG = { w: 1080, h: 1350 };
const TT = { w: 1080, h: 1920 };

const [dir, ...names] = process.argv.slice(2);
if (!dir || !names.length) {
  console.error("usage: render-post.mjs <carousel-dir> <Name> [Name...]   (arg order IS slide order)");
  process.exit(1);
}
const SRC = path.join(HERE, "..", dir);
for (const d of ["ig", "tt"]) fs.mkdirSync(path.join(SRC, d), { recursive: true });

// ⚠️ A BLURRED COPY BEHIND, NOT A STRETCHED EDGE AND NOT A FLAT FILL. Three
// versions of this, and the first two were visibly wrong:
//
//   flat colour from the corners  right for a flat ground, wrong for the
//                                 full-bleed photographs, which sampled a
//                                 mid-grey off the picture and framed it in it
//   stretched edge rows           fine along the top, but the bottom row of a
//                                 photograph is the model's legs, and stretching
//                                 it 285px smeared them down the frame
//
// Scaling the slide to cover 1080x1920 and blurring it hard gives bands that
// belong to that slide's own colours with no recognisable shape in them, which
// is what every vertical crop of a square photo does. On a flat ground the blur
// is that flat colour, so one rule stays correct for both kinds of slide.
//
// The artboard itself is composited over the top UNSCALED, so the type is the
// exact pixels the design canvas produced.
async function padTo(buf, outPath) {
  const band = Math.round((TT.h - IG.h) / 2);
  const backdrop = await sharp(buf)
    .resize(TT.w, TT.h, { fit: "cover", position: "centre" })
    .blur(60)
    .modulate({ brightness: 0.97 })
    .toBuffer();
  await sharp(backdrop)
    .composite([{ input: buf, top: band, left: 0 }])
    .png().toFile(outPath);
  return band;
}

for (const [i, name] of names.entries()) {
  const raw = fs.readFileSync(path.join(SRC, `${name}.dc.html`), "utf8");
  // <helmet> holds what belongs in <head>; <x-dc> wraps the artboard body.
  const head = (raw.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ""])[1];
  const body = (raw.match(/<x-dc>([\s\S]*?)<\/x-dc>/) || [, ""])[1]
    .replace(/<helmet>[\s\S]*?<\/helmet>/, "");
  const html = `<!doctype html><meta charset="utf-8">${head}<style>html,body{margin:0;width:${IG.w}px;height:${IG.h}px;overflow:hidden}</style>${body}`;

  const tmp = path.join(SRC, ".render-tmp.html");
  fs.writeFileSync(tmp, html);
  const n = String(i + 1).padStart(2, "0");
  const igPath = path.join(SRC, "ig", `${n}.png`);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars",
    "--virtual-time-budget=4000", `--window-size=${IG.w},${IG.h}`,
    `--screenshot=${igPath}`, `file://${tmp}`], { stdio: "ignore" });
  fs.unlinkSync(tmp);
  if (!fs.existsSync(igPath)) throw new Error(`chrome produced nothing for ${name}`);

  const buf = fs.readFileSync(igPath);
  const band = await padTo(buf, path.join(SRC, "tt", `${n}.png`));
  console.log(`  ${n} ${name.padEnd(12)} ig ${(fs.statSync(igPath).size / 1024).toFixed(0)}KB` +
    `  tt blurred bands ${band}px`);
}
console.log(`${dir}: ${names.length} slides -> ig/ + tt/`);
