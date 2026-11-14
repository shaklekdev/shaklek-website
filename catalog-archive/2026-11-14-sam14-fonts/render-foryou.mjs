// Ad 3, design v3: photo is the hero, slim sharp-cornered panel in the site's style,
// crossfade on every change. Frames rendered as HTML in headless Chrome.
import { execFileSync } from "child_process";
import fs from "fs";
const S = "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/6d4200b8-7fe6-4791-919a-cf8d9e31e7e5/scratchpad/ad3hq";
const PUB = "/Users/nadatlohi/dev/Shaklek/website/public";
const OUT = S + "/f2";
fs.mkdirSync(OUT, { recursive: true });
const C = "/catalog/structured-blouse/structured-blouse-";
const PHOTO = {
  Ivory: { "short:normal": PUB + C + "front.jpg", "short:longer": "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/6d4200b8-7fe6-4791-919a-cf8d9e31e7e5/scratchpad/ad3hq/al/ivory-combo-short-longer.jpg", "long:normal": "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/6d4200b8-7fe6-4791-919a-cf8d9e31e7e5/scratchpad/ad3hq/al/ivory-combo-long-normal.jpg", "long:longer": "/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/6d4200b8-7fe6-4791-919a-cf8d9e31e7e5/scratchpad/ad3hq/al/ivory-combo-long-longer.jpg" },
  Navy: { "long:normal": C + "navy-combo-long-normal-front.jpg" },
  Burgundy: { "long:normal": C + "burgundy-combo-long-normal-front.jpg" },
  White: { "long:normal": C + "white-combo-long-normal-front-v2.jpg" },
};
const HEX = { Ivory: "#f3f0ec", White: "#fafafa", Navy: "#121b3f", Burgundy: "#4e1825" };
const ph = (st) => PHOTO[st.colour][st.sleeve + ":" + st.length];
const chip = (st, v, on) => `<div class="chip ${on ? "on" : ""} ${st.tap === v ? "tap" : ""}">${v}</div>`;
const html = (st) => `<!doctype html><html><head><meta charset=utf-8>

<style>@font-face{font-family:Italiana;src:url(file:///Users/nadatlohi/dev/Shaklek/branding/source/fonts/Italiana-Regular.ttf)}
.wrap{position:absolute;inset:0;transform:translateY(125px) scale(1.06);transform-origin:530px 835px}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;overflow:hidden;background:#ece9e6;font-family:-apple-system,'Helvetica Neue',sans-serif}
.cap{position:absolute;top:270px;height:150px;left:56px;right:56px;display:flex;align-items:flex-end;justify-content:center;text-align:center;font-family:Italiana;font-weight:400;font-size:82px;line-height:1.08;letter-spacing:.01em;color:#2b2622}.cap b{font-weight:400;color:#6b2333}
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
.end{position:fixed;inset:0;background:#ece9e6;transform:none}
.end p{position:absolute;left:0;right:0;text-align:center;font-family:Italiana;font-weight:400;font-size:92px;color:#2b2622;line-height:1.12}.end b{font-weight:400;color:#6b2333}
</style></head><body><div class=wrap>
${st.end ? `<div class=end><p style="top:520px">You <b>design</b> it.<br>We <b>cut</b> it for you.</p><img src="file:///Users/nadatlohi/dev/Shaklek/branding/source/shaklek-logo.svg" style="position:absolute;top:890px;left:50%;transform:translateX(-50%);width:380px"><p style="top:1140px;font-family:Avenir Next,sans-serif;font-weight:600;font-size:24px;letter-spacing:.36em;color:#5c534c">TAILORED LINEN</p></div>` : `
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
</div></body></html>`;

// timeline
const C1 = "This shirt <b>doesn’t exist.</b>", C2 = "Until <b>you decide</b><br>how it’s made.", C3 = "<b>The sleeve.</b> The length.", C4 = "<b>The colour.</b>", C5 = "Then we <b>cut it</b><br>for you.";
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

const EXE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args=[];let i=0;
for (const [st, d] of frames) { const h=OUT+"/f.html"; fs.writeFileSync(h, html(st)); const f=`${OUT}/s${String(i++).padStart(3,"0")}.png`;
  execFileSync(EXE,["--headless","--disable-gpu","--hide-scrollbars","--allow-file-access-from-files","--window-size=1080,1920","--screenshot="+f,"file://"+h],{stdio:"ignore"});
  for (let k=0;k<Math.max(1,Math.round(d*30));k++) args.push(f); }
fs.writeFileSync(OUT+"/args.txt", args.join("\n")); console.log("frames",i,(args.length/30).toFixed(1)+"s");
