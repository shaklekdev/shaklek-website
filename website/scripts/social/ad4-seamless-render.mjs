// Ad 4 seamless carousel: one 3240x1350 panorama, sliced into three 1080 slides.
// The next slide's image starts PEEK px before each slide's right edge.
import { chromium } from "playwright-core";
import { createRequire } from "module";
import fs from "fs";
const sharp = createRequire("/Users/nadatlohi/dev/Shaklek/website/package.json")("sharp");
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const PEEK = +(process.env.PEEK || 150);
const C = "/Users/nadatlohi/dev/Shaklek/website/public";
const BR = "/Users/nadatlohi/dev/Shaklek/branding/source";
const NOISE = "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/1bf43002-c532-43fa-9381-3a640ba440e4/scratchpad/noise.png";
const W = 3240, H = 1350, A = 1080 - PEEK, B = 2160 - PEEK;
const html = `<!doctype html><html><head><meta charset=utf-8><style>
*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:-apple-system,'Helvetica Neue',sans-serif;color:#f4efe6;background:#141414}
.abs{position:absolute}h1{font-weight:500;font-size:74px;line-height:1.06;letter-spacing:-1.8px}h1 em{font-style:normal;color:#dcc7a4}
p{margin-top:26px;font-weight:400;font-size:28px;line-height:1.5;opacity:.82}
.idx{position:absolute;top:96px;font-size:18px;letter-spacing:.32em;opacity:.7}
.mono{position:absolute;top:84px;width:40px;opacity:.9}
</style></head><body>
<!-- panel 1: dark -->
<div class=abs style="left:0;top:0;width:${A}px;height:${H}px;background:linear-gradient(160deg,#1f2738 0%,#1b1a19 100%)"></div>
<div class=abs style="left:-300px;top:-140px;width:900px;height:740px;background:#cfc7b2;border-radius:50%;filter:blur(140px);opacity:.2"></div>
<!-- panel 2: abaya -->
<div class=abs style="left:${A}px;top:0;width:${B - A}px;height:${H}px;background:url('file://${C}/catalog/abaya/abaya-burgundy-front-v3.jpg') ${process.env.ABX || "58%"} 20%/cover;filter:brightness(.66) saturate(.85) contrast(1.04)"></div>
<div class=abs style="left:${A}px;top:0;width:${B - A}px;height:${H}px;background:linear-gradient(#0000 0%,#0000 50%,#000b 100%)"></div>
<!-- panel 3: linen in wind -->
<div class=abs style="left:${B}px;top:0;width:${W - B}px;height:${H}px;background:url('file://${C}/marketing/hero-banner.jpg') 46% center/cover;filter:brightness(.6) saturate(.8) contrast(1.04)"></div>
<div class=abs style="left:${B}px;top:0;width:${W - B}px;height:${H}px;background:radial-gradient(ellipse 70% 40% at 58% 50%,#0007,#0000 75%)"></div>
<div class=abs style="inset:0;background:url('file://${NOISE}');opacity:.2;mix-blend-mode:overlay"></div>
<!-- chrome per slide -->
${[0, 1, 2].map((i) => `<div class=idx style="left:${i * 1080 + 96}px">${i + 1} / 3</div>${i < 2 ? `<img class=mono src="${BR}/shaklek-monogram-white-on-dark.svg" style="left:${i * 1080 + 1080 - 96 - 40}px">` : ""}`).join("")}
<!-- slide 1 copy -->
<div class=abs style="left:96px;width:700px;top:220px"><h1>Our skin is<br><em>fighting silently.</em></h1></div>
<div class=abs style="left:60px;width:${A - 60 - 56}px;bottom:150px;text-align:right"><h1>16 hours a day,<br>against <em>plastic clothes.</em></h1><p>Polyester, nylon, acrylic. They don&#8217;t breathe.</p></div>
<!-- slide 2 copy -->
<div class=abs style="left:${1080 + 96}px;width:820px;top:900px"><h1>We chose<br><em>100% natural linen.</em></h1><p>Breathable, and gentle on the skin. Cut to you, after the order.</p></div>
<!-- slide 3 -->
<img class=abs src="${BR}/shaklek-logo-white-on-dark.svg" style="left:${2160 + 540}px;top:540px;transform:translateX(-50%);width:440px">
<div class=abs style="left:2160px;width:1080px;top:800px;text-align:center;font-size:30px;letter-spacing:.04em">Tailored to you. 100% linen.</div>
<div class=abs style="left:2160px;width:1080px;top:860px;text-align:center;font-size:18px;letter-spacing:.36em;opacity:.8">OPENING 11·11</div>
</body></html>`;
fs.writeFileSync(OUT + "/pano.html", html);
const b = await chromium.launch({ executablePath: process.env.EXE, args: ["--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.goto("file://" + OUT + "/pano.html", { waitUntil: "networkidle" });
await p.screenshot({ path: OUT + "/pano.png" });
await b.close();
const comp = [];
for (let i = 0; i < 3; i++) {
  await sharp(OUT + "/pano.png").extract({ left: i * 1080, top: 0, width: 1080, height: H }).toFile(`${OUT}/slide-${i + 1}.png`);
  comp.push({ input: await sharp(`${OUT}/slide-${i + 1}.png`).resize({ height: 600 }).toBuffer(), left: i * (480 + 14), top: 0 });
}
await sharp({ create: { width: 3 * 480 + 28, height: 600, channels: 3, background: "#fff" } }).composite(comp).jpeg({ quality: 88 }).toFile(OUT + "/sheet.jpg");
console.log("ok", OUT);
