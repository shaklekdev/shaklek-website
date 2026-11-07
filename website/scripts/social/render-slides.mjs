// Generic slide renderer: node render.mjs <spec.mjs> <outdir>
// spec exports { w, h, css, slides: [htmlBody, ...] }. Writes slide-N.png + sheet.jpg.
import { chromium } from "playwright-core";
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const sharp = createRequire("/Users/nadatlohi/dev/Shaklek/website/package.json")("sharp");
const [, , specPath, out] = process.argv;
const spec = (await import(path.resolve(specPath) + "?t=" + Date.now())).default;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.EXE, args: ["--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: spec.w, height: spec.h } });
const files = [];
for (let i = 0; i < spec.slides.length; i++) {
  const html = `<!doctype html><html><head><meta charset=utf-8>${spec.head || ""}<style>*{box-sizing:border-box;margin:0}body{width:${spec.w}px;height:${spec.h}px;overflow:hidden;position:relative}${spec.css}</style></head><body>${spec.slides[i]}</body></html>`;
  fs.writeFileSync(`${out}/s.html`, html);
  await p.goto(`file://${path.resolve(out)}/s.html`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const f = `${out}/slide-${i + 1}.png`;
  await p.screenshot({ path: f });
  files.push(f);
}
await b.close();
const th = 700, tw = Math.round((spec.w / spec.h) * th);
const comp = [];
let x = 0;
for (const f of files) { comp.push({ input: await sharp(f).resize(tw, th).toBuffer(), left: x, top: 0 }); x += tw + 14; }
await sharp({ create: { width: x - 14, height: th, channels: 3, background: "#ffffff" } }).composite(comp).jpeg({ quality: 88 }).toFile(`${out}/sheet.jpg`);
console.log("rendered", files.length, "->", out + "/sheet.jpg");
