// Ad 3, design v3: photo is the hero, slim sharp-cornered panel in the site's style,
// crossfade on every change. Frames rendered as HTML in headless Chrome.
import { chromium } from "playwright-core";
import fs from "fs";
const S = process.env.S;
const PUB = "/Users/nadatlohi/dev/Shaklek/website/public";
const OUT = S + "/" + process.env.OUTDIR;
fs.mkdirSync(OUT, { recursive: true });
const C = "/catalog/structured-blouse/structured-blouse-";
const PHOTO = {
  Ivory: { "short:normal": "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/1bf43002-c532-43fa-9381-3a640ba440e4/scratchpad/aligned/structured-blouse-front.jpg", "short:longer": "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/1bf43002-c532-43fa-9381-3a640ba440e4/scratchpad/aligned/structured-blouse-ivory-combo-short-longer-front.jpg", "long:normal": "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/1bf43002-c532-43fa-9381-3a640ba440e4/scratchpad/aligned/structured-blouse-ivory-combo-long-normal-front.jpg", "long:longer": "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/1bf43002-c532-43fa-9381-3a640ba440e4/scratchpad/aligned/structured-blouse-ivory-combo-long-longer-front.jpg" },
  Navy: { "long:normal": C + "navy-combo-long-normal-front.jpg" },
  Burgundy: { "long:normal": C + "burgundy-combo-long-normal-front.jpg" },
  White: { "long:normal": C + "white-combo-long-normal-front-v2.jpg" },
};
const HEX = { Ivory: "#f3f0ec", White: "#fafafa", Navy: "#121b3f", Burgundy: "#4e1825" };
const ph = (st) => PHOTO[st.colour][st.sleeve + ":" + st.length];
const chip = (st, v, on) => `<div class="chip ${on ? "on" : ""} ${st.tap === v ? "tap" : ""}">${v}</div>`;
const html = (st) => `<!doctype html><html><head><meta charset=utf-8>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=block" rel=stylesheet>
<style>
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;overflow:hidden;background:#ece9e6;font-family:-apple-system,'Helvetica Neue',sans-serif}
.cap{position:absolute;top:270px;height:150px;left:56px;right:56px;display:flex;align-items:flex-end;justify-content:center;text-align:center;font-family:-apple-system,'Helvetica Neue',sans-serif;font-weight:700;font-size:74px;line-height:1.02;letter-spacing:-2px;color:#1a1a1a}.cap b{font-weight:700;color:#6b2333}
.ph{position:absolute;left:40px;top:440px;width:640px;height:960px;background:center top/cover no-repeat;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 40px,#000 600px,transparent 640px),linear-gradient(transparent 0,#000 40px,#000 920px,transparent 960px);-webkit-mask-composite:source-in}
.bar{position:absolute;left:712px;width:308px;top:600px;height:640px;background:#fff;border:1px solid #1a1a1a26;display:flex;flex-direction:column;justify-content:center;gap:34px;padding:0 34px}
.grp{display:flex;flex-direction:column;gap:12px}.dots{display:grid;grid-template-columns:repeat(4,40px);gap:14px;padding-left:4px}
.lab{font-size:17px;letter-spacing:.22em;text-transform:uppercase;color:#7a7066;margin-bottom:2px}
.chip{position:relative;width:100%;height:60px;border:1px solid #1a1a1a;display:flex;align-items:center;justify-content:center;font-size:20px;letter-spacing:.08em;text-transform:uppercase;color:#1a1a1a;background:#fff}
.chip.on{background:#1a1a1a;color:#fff}
.dot{position:relative;width:40px;height:40px;border-radius:50%;border:1px solid #0000002e}
.dot.on{outline:1.5px solid #1a1a1a;outline-offset:4px}
.tap::after{content:"";position:absolute;inset:-7px;border:2px solid #b8925a}
.dot.tap::after{border-radius:50%;inset:-9px}
.sep{display:none}
.end{position:absolute;inset:0;background:#f3f0ec}
.end p{position:absolute;left:0;right:0;text-align:center;font-family:-apple-system,'Helvetica Neue',sans-serif;font-weight:700;font-size:80px;letter-spacing:-2px;color:#1a1a1a;line-height:1.05}.end b{font-weight:700;color:#6b2333}
</style></head><body>
${st.end ? `<div class=end><p style="top:600px">You <b>design</b> it.<br>We <b>cut</b> it.</p><img src="file:///Users/nadatlohi/dev/Shaklek/branding/source/shaklek-monogram.svg" style="position:absolute;top:980px;left:50%;transform:translate(-50%,-50%);width:230px"><p style="top:1120px;font-size:32px;font-weight:600;letter-spacing:.34em">TAILORED LINEN</p></div>` : `
<div class=cap><span>${st.cap}</span></div>
${st.prev ? `<div class=ph style="background-image:url('file://${st.prev.startsWith("/catalog")?PUB+st.prev:st.prev}')"></div>` : ""}
<div class=ph style="background-image:url('file://${ph(st).startsWith("/catalog")?PUB+ph(st):ph(st)}');opacity:${st.alpha ?? 1}"></div>
<div class=bar>
 <div class=grp><span class=lab>Sleeve</span>${chip(st, "Short", st.sleeve === "short")}${chip(st, "Long", st.sleeve === "long")}</div>
 <div class=sep></div>
 <div class=grp><span class=lab>Length</span>${chip(st, "Normal", st.length === "normal")}${chip(st, "Longer", st.length === "longer")}</div>
 <div class=sep></div>
 <div class=grp><span class=lab>Colour</span><div class=dots>${Object.keys(HEX).map((c) => `<div class="dot ${st.colour === c ? "on" : ""} ${st.tap === c ? "tap" : ""}" style="background:${HEX[c]}"></div>`).join("")}</div></div>
</div>`}
</body></html>`;

// timeline
const C1 = "This shirt <b>doesn’t exist.</b>", C2 = "Until <b>you decide</b><br>how it’s made.", C3 = "<b>The sleeve.</b> The length.", C4 = "<b>The colour.</b>", C5 = "Then we <b>cut it.</b>";
const frames = [];
let cur = { colour: "Ivory", sleeve: "short", length: "normal" };
const hold = (cap, extra, d) => frames.push([{ cap, ...cur, ...extra }, d]);
const step = (cap, tap, change, total) => {
  hold(cap, { tap }, 0.15);
  const prev = ph(cur);
  Object.assign(cur, change);
  for (const a of [0.3, 0.6, 0.85]) hold(cap, { tap, prev, alpha: a }, 1 / 30);
  hold(cap, { tap }, total - 0.15 - 0.1);
};
hold(C1, {}, 1.4);
step(C1, "Longer", { length: "longer" }, 0.8);
step(C2, "Long", { sleeve: "long" }, 0.9);
step(C2, "Normal", { length: "normal" }, 0.9);
for (const c of ["Navy", "Burgundy"]) step(C2, c, { colour: c }, 0.7);
hold(C5, {}, 1.0);
frames.push([{ end: 1 }, 2.0]);

const b = await chromium.launch({ executablePath: process.env.EXE, args: ["--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const args = [];
let i = 0;
for (const [st, d] of frames) {
  fs.writeFileSync(OUT + "/f.html", html(st));
  await p.goto("file://" + OUT + "/f.html", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const f = `${OUT}/s${String(i++).padStart(3, "0")}.png`;
  await p.screenshot({ path: f });
  for (let k = 0; k < Math.max(1, Math.round(d * 30)); k++) args.push(f);
}
fs.writeFileSync(OUT + "/args.txt", args.join("\n"));
await b.close();
console.log("frames", i, "video", (args.length / 30).toFixed(1) + "s");
