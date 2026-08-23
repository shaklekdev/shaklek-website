// Screenshots a page at a given viewport and scroll offset, so a layout
// complaint can be looked at instead of reasoned about.
//
//   node scripts/shot.mjs <url> <out.png> [width] [height] [scrollY] [clickRegex]
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [, , URL_TO_LOAD, OUT, W = "1440", H = "900", SCROLL = "0", CLICK = ""] = process.argv;
if (!URL_TO_LOAD || !OUT) {
  console.error("usage: node scripts/shot.mjs <url> <out.png> [w] [h] [scrollY] [clickRegex]");
  process.exit(1);
}

const PORT = 9338;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = mkdtempSync(join(tmpdir(), "shot-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--disable-extensions",
  `--window-size=${W},${H}`,
]);
chrome.stderr.on("data", () => {});

async function wsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("no debugging port");
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    ws.addEventListener("open", () =>
      resolve({
        send(method, params = {}, sessionId) {
          const msgId = ++id;
          ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
          return new Promise((res, rej) => pending.set(msgId, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener("error", reject);
    ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
      }
    });
  });
}

const b = await connect(await wsUrl());
const { targetId } = await b.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await b.send("Target.attachToTarget", { targetId, flatten: true });
await b.send("Page.enable", {}, sessionId);
await b.send("Runtime.enable", {}, sessionId);
await b.send("Emulation.setDeviceMetricsOverride",
  { width: Number(W), height: Number(H), deviceScaleFactor: 2, mobile: Number(W) < 700 }, sessionId);

await b.send("Page.navigate", { url: URL_TO_LOAD }, sessionId);
await new Promise((r) => setTimeout(r, 6000));

if (CLICK) {
  const { result } = await b.send("Runtime.evaluate", {
    expression: `(() => {
      const re = new RegExp(${JSON.stringify(CLICK)}, 'i');
      const el = [...document.querySelectorAll('button')].find(x => re.test(x.textContent||''));
      if (!el) return 'no match';
      el.click(); return 'clicked';
    })()`,
    returnByValue: true,
  }, sessionId);
  console.log("[click]", result.value);
  await new Promise((r) => setTimeout(r, 2500));
}

if (Number(SCROLL) > 0) {
  await b.send("Runtime.evaluate", { expression: `window.scrollTo(0, ${Number(SCROLL)})` }, sessionId);
  await new Promise((r) => setTimeout(r, 1200));
}

const { data } = await b.send("Page.captureScreenshot", { format: "png" }, sessionId);
writeFileSync(OUT, Buffer.from(data, "base64"));
console.log(`saved ${OUT}  (${W}x${H}, scrollY=${SCROLL})`);

b.close();
chrome.kill();
process.exit(0);
