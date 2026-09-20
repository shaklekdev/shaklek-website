// The masking step, in a browser, locally.
//
//   node scripts/catalog/colourways/mask-editor.mjs
//
// ⚠️ THIS EXISTS BECAUSE PHOTOSHOP CANNOT RUN ON THIS MACHINE. The installed
// copy is Photoshop 2020 (21.2.2), whose Info.plist asks for macOS 10.13; the
// machine is on 26.6.2 and it refuses to launch. Buying a Creative Cloud
// subscription to paint sixteen masks is not a reasonable answer, and neither
// is uploading unreleased product photography to a free web editor.
//
// ⚠️ AND PHOTOSHOP WAS NEVER NEEDED FOR THE RECOLOUR ITSELF. That is
// arithmetic -- remap luminosity, set hue and saturation -- and recolour.mjs
// does it with sharp, deterministically, with no app involved. Photoshop was
// only ever wanted for the ONE step a machine cannot do: deciding where the
// garment ends. So that is the only step this tool covers.
//
// Nothing is uploaded. The server binds to 127.0.0.1, serves the files already
// in the working folder, and writes the corrected mask back over the candidate.

import { createServer } from "node:http";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const WORK = process.env.SHAKLEK_MASK_DIR ?? path.join(os.homedir(), "Shaklek-colourways");
const PORT = Number(process.env.PORT ?? 4321);

if (!existsSync(path.join(WORK, "manifest.json"))) {
  console.error(`No manifest in ${WORK}. Run prepare-masks.mjs first.`);
  process.exit(1);
}
const manifest = JSON.parse(await readFile(path.join(WORK, "manifest.json"), "utf8"));

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>Masks</title>
<style>
  :root{color-scheme:light}
  body{margin:0;font:14px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f1ea;color:#1a1a1a}
  header{display:flex;gap:14px;align-items:center;padding:10px 16px;background:#fffdf8;border-bottom:1px solid #e8e1d3;position:sticky;top:0;z-index:5;flex-wrap:wrap}
  select,button{font:inherit;padding:7px 12px;border:1px solid #d9d2c4;background:#fff;border-radius:2px;cursor:pointer}
  button.on{background:#1a1a1a;color:#fff;border-color:#1a1a1a}
  button.save{background:#9c8445;color:#fff;border-color:#9c8445}
  .wrap{display:flex;justify-content:center;padding:16px}
  canvas{background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.14);cursor:crosshair;touch-action:none;max-width:100%}
  .hint{color:#6b6b6b;font-size:12px}
  .done{color:#9c8445}
</style></head><body>
<header>
  <select id="file"></select>
  <button id="paint" class="on">Add [B]</button>
  <button id="erase">Remove [E]</button>
  <label class="hint">Brush <input id="size" type="range" min="4" max="160" value="40" style="vertical-align:middle"> <span id="sz">40</span></label>
  <button id="undo">Undo [⌘Z]</button>
  <button id="save" class="save">Save [⌘S]</button>
  <span id="status" class="hint"></span>
</header>
<div class="wrap"><canvas id="c"></canvas></div>
<script>
const files = FILES;
const sel = document.getElementById('file');
files.forEach((f,i)=>{const o=document.createElement('option');o.value=i;o.textContent=f.stem;sel.appendChild(o);});
const c = document.getElementById('c'), ctx = c.getContext('2d', {willReadFrequently:true});
const status = document.getElementById('status');
let photo = null, mask = null, painting = false, mode = 'paint', brush = 40, dirty = false;
const undo = [];

function show(msg, cls){ status.textContent = msg; status.className = 'hint ' + (cls||''); }

async function load(i){
  const f = files[i];
  photo = await loadImg('/img/' + f.stem + '.jpg');
  const m = await loadImg('/img/' + f.stem + '-mask.png');
  c.width = photo.width; c.height = photo.height;
  c.style.width = Math.min(photo.width, Math.round(window.innerHeight*0.78*photo.width/photo.height)) + 'px';
  // The mask lives in its own offscreen canvas as pure black/white. The visible
  // canvas is only a rendering of photo + magenta; nothing is ever read back
  // from it, so the saved mask can never pick up the photograph underneath.
  mask = document.createElement('canvas');
  mask.width = photo.width; mask.height = photo.height;
  const mc = mask.getContext('2d', {willReadFrequently:true});
  mc.drawImage(m, 0, 0, photo.width, photo.height);
  const d = mc.getImageData(0,0,photo.width,photo.height);
  for(let p=0;p<d.data.length;p+=4){ const v = d.data[p] > 128 ? 255 : 0; d.data[p]=d.data[p+1]=d.data[p+2]=v; d.data[p+3]=255; }
  mc.putImageData(d,0,0);
  undo.length = 0; dirty = false;
  draw(); show('');
}
function loadImg(src){ return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src+'?t='+Date.now();}); }

function draw(){
  ctx.drawImage(photo,0,0);
  const mc = mask.getContext('2d');
  const md = mc.getImageData(0,0,c.width,c.height);
  const od = ctx.getImageData(0,0,c.width,c.height);
  for(let p=0;p<md.data.length;p+=4){
    if(md.data[p] > 128){
      od.data[p]   = Math.round(od.data[p]*0.45 + 255*0.55);
      od.data[p+1] = Math.round(od.data[p+1]*0.45);
      od.data[p+2] = Math.round(od.data[p+2]*0.45 + 255*0.55);
    }
  }
  ctx.putImageData(od,0,0);
}

function at(e){
  const r = c.getBoundingClientRect();
  return [ (e.clientX-r.left) * c.width / r.width, (e.clientY-r.top) * c.height / r.height ];
}
function stroke(x,y){
  const mc = mask.getContext('2d');
  mc.globalCompositeOperation = 'source-over';
  mc.fillStyle = mode === 'paint' ? '#fff' : '#000';
  mc.beginPath(); mc.arc(x,y,brush/2,0,Math.PI*2); mc.fill();
}
c.addEventListener('pointerdown', e=>{
  const mc = mask.getContext('2d');
  undo.push(mc.getImageData(0,0,c.width,c.height));
  if(undo.length > 30) undo.shift();
  painting = true; dirty = true; c.setPointerCapture(e.pointerId);
  const [x,y]=at(e); stroke(x,y); draw();
});
c.addEventListener('pointermove', e=>{ if(!painting) return; const [x,y]=at(e); stroke(x,y); draw(); });
c.addEventListener('pointerup', ()=>{ painting = false; });

document.getElementById('paint').onclick = ()=>setMode('paint');
document.getElementById('erase').onclick = ()=>setMode('erase');
function setMode(m){ mode = m;
  document.getElementById('paint').className = m==='paint'?'on':'';
  document.getElementById('erase').className = m==='erase'?'on':''; }
document.getElementById('size').oninput = e=>{ brush = +e.target.value; document.getElementById('sz').textContent = brush; };
document.getElementById('undo').onclick = doUndo;
function doUndo(){ const s = undo.pop(); if(!s) return; mask.getContext('2d').putImageData(s,0,0); draw(); }

async function save(){
  show('saving…');
  const blob = await new Promise(r=>mask.toBlob(r,'image/png'));
  const res = await fetch('/save/' + files[sel.value].stem, {method:'POST', body:blob});
  if(res.ok){ dirty = false; show('saved', 'done'); } else { show('save FAILED: ' + await res.text()); }
}
document.getElementById('save').onclick = save;

sel.onchange = ()=>{
  if(dirty && !confirm('Unsaved changes. Switch anyway?')) return;
  load(+sel.value);
};
window.addEventListener('keydown', e=>{
  if((e.metaKey||e.ctrlKey) && e.key === 's'){ e.preventDefault(); save(); return; }
  if((e.metaKey||e.ctrlKey) && e.key === 'z'){ e.preventDefault(); doUndo(); return; }
  if(e.key === 'b' || e.key === 'B') setMode('paint');
  if(e.key === 'e' || e.key === 'E') setMode('erase');
  if(e.key === '[') { brush = Math.max(4, brush-8); document.getElementById('size').value = brush; document.getElementById('sz').textContent = brush; }
  if(e.key === ']') { brush = Math.min(160, brush+8); document.getElementById('size').value = brush; document.getElementById('sz').textContent = brush; }
});
window.addEventListener('beforeunload', e=>{ if(dirty){ e.preventDefault(); e.returnValue=''; } });
load(0);
</script></body></html>`;

const server = createServer(async (req, res) => {
  try {
    if (req.url === "/" || req.url.startsWith("/?")) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(PAGE.replace("FILES", JSON.stringify(manifest.files.map((f) => ({ stem: f.stem })))));
    }
    if (req.url.startsWith("/img/")) {
      // ⚠️ basename() and nothing else. This server reads whatever path the
      // browser asks for, so "../../.." would walk out of the working folder
      // and serve anything on the machine. It is bound to localhost and short
      // lived, and that is not a reason to write a traversal.
      const name = path.basename(decodeURIComponent(req.url.slice(5).split("?")[0]));
      const file = path.join(WORK, name);
      if (!existsSync(file)) { res.writeHead(404); return res.end("no"); }
      res.writeHead(200, {
        "content-type": name.endsWith(".png") ? "image/png" : "image/jpeg",
        "cache-control": "no-store",
      });
      return res.end(await readFile(file));
    }
    if (req.method === "POST" && req.url.startsWith("/save/")) {
      const stem = path.basename(decodeURIComponent(req.url.slice(6)));
      if (!manifest.files.some((f) => f.stem === stem)) { res.writeHead(400); return res.end("unknown file"); }
      const chunks = [];
      for await (const ch of req) chunks.push(ch);
      const buf = Buffer.concat(chunks);
      if (buf.length < 100) { res.writeHead(400); return res.end("empty"); }
      await writeFile(path.join(WORK, `${stem}-mask.png`), buf);
      console.log(`saved ${stem}-mask.png (${(buf.length / 1024).toFixed(0)} KB)`);
      res.writeHead(200); return res.end("ok");
    }
    res.writeHead(404); res.end("no");
  } catch (err) {
    console.error(err);
    res.writeHead(500); res.end(String(err?.message ?? err));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mask editor: http://127.0.0.1:${PORT}`);
  console.log(`${manifest.files.length} photographs from ${WORK}`);
  console.log(`B add, E remove, [ ] brush size, Cmd-Z undo, Cmd-S save. Ctrl-C here when done.`);
});
