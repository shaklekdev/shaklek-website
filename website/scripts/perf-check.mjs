// Measures what a real browser experiences on a page: Largest Contentful
// Paint, layout shift, long tasks that block scrolling, and the heaviest
// resources. Written because "the site feels laggy" is not actionable and
// guessing at causes has already cost time here.
//
//   node scripts/perf-check.mjs https://www.shaklek.com/
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_TO_LOAD = process.argv[2] ?? "https://www.shaklek.com/";
const PORT = 9337;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const profile = mkdtempSync(join(tmpdir(), "perf-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--disable-extensions",
  "--window-size=390,844", // phone-sized: most of the traffic
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
    const listeners = [];
    ws.addEventListener("open", () =>
      resolve({
        send(method, params = {}, sessionId) {
          const msgId = ++id;
          ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
          return new Promise((res, rej) => pending.set(msgId, { res, rej }));
        },
        on: (fn) => listeners.push(fn),
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
      } else if (m.method) listeners.forEach((fn) => fn(m));
    });
  });
}

const browser = await connect(await wsUrl());
const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });

const resources = [];
browser.on((m) => {
  if (m.sessionId !== sessionId) return;
  if (m.method === "Network.loadingFinished") {
    const r = resources.find((x) => x.id === m.params.requestId);
    if (r) r.bytes = m.params.encodedDataLength;
  }
  if (m.method === "Network.requestWillBeSent") {
    resources.push({ id: m.params.requestId, url: m.params.request.url, bytes: 0 });
  }
});

for (const d of ["Page", "Network", "Runtime", "Performance"]) await browser.send(`${d}.enable`, {}, sessionId);
// 4x CPU slowdown approximates a mid-range phone, which is the device that feels slow.
await browser.send("Emulation.setCPUThrottlingRate", { rate: 4 }, sessionId);

await browser.send("Page.navigate", { url: URL_TO_LOAD }, sessionId);
await new Promise((r) => setTimeout(r, 9000));

const { result } = await browser.send(
  "Runtime.evaluate",
  {
    expression: `new Promise(resolve => {
      const lcp = performance.getEntriesByType('largest-contentful-paint').pop();
      let cls = 0;
      for (const e of performance.getEntriesByType('layout-shift')) if (!e.hadRecentInput) cls += e.value;
      const long = performance.getEntriesByType('longtask') || [];
      const nav = performance.getEntriesByType('navigation')[0] || {};
      resolve({
        lcpMs: lcp ? Math.round(lcp.startTime) : null,
        lcpElement: lcp && lcp.element ? (lcp.element.tagName + (lcp.element.currentSrc ? ' ' + lcp.element.currentSrc.slice(-60) : '')) : null,
        cls: Number(cls.toFixed(4)),
        longTasks: long.length,
        longTaskTotalMs: Math.round(long.reduce((s,t)=>s+t.duration,0)),
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd || 0),
        loadMs: Math.round(nav.loadEventEnd || 0),
      });
    })`,
    awaitPromise: true,
    returnByValue: true,
  },
  sessionId,
);

const m = result.value;
console.log(`\n${URL_TO_LOAD}   (390px viewport, 4x CPU throttle)\n`);
console.log(`  LCP                ${m.lcpMs ?? "n/a"} ms   ${m.lcpMs > 2500 ? "SLOW (>2500 is poor)" : "ok"}`);
console.log(`  LCP element        ${m.lcpElement ?? "n/a"}`);
console.log(`  Cumulative shift   ${m.cls}   ${m.cls > 0.1 ? "POOR (>0.1)" : "ok"}`);
console.log(`  Long tasks         ${m.longTasks} totalling ${m.longTaskTotalMs} ms  (these block scrolling)`);
console.log(`  DOMContentLoaded   ${m.domContentLoadedMs} ms`);
console.log(`  load               ${m.loadMs} ms`);

const total = resources.reduce((s, r) => s + r.bytes, 0);
console.log(`\n  transferred        ${(total / 1024).toFixed(0)} KB across ${resources.filter(r=>r.bytes>0).length} requests`);
console.log("\n  heaviest:");
for (const r of resources.filter(r=>r.bytes>0).sort((a, b) => b.bytes - a.bytes).slice(0, 8)) {
  console.log(`    ${(r.bytes / 1024).toFixed(0).padStart(6)} KB  ${r.url.replace(/^https?:\/\/[^/]+/, "").slice(0, 95)}`);
}

browser.close();
chrome.kill();
process.exit(0);
