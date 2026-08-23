// Targeted check that the size chart actually renders, with the right numbers,
// at the point a customer picks a size (Step 3 of the customizer).
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_TO_LOAD = process.argv[2] ?? "http://localhost:3000/design/oversized-shirt";
const PORT = 9336;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const profile = mkdtempSync(join(tmpdir(), "sizechart-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--disable-extensions",
  "--window-size=390,844",
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

const browser = await connect(await wsUrl());
const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
await browser.send("Page.enable", {}, sessionId);
await browser.send("Runtime.enable", {}, sessionId);
await browser.send("Page.navigate", { url: URL_TO_LOAD }, sessionId);
await new Promise((r) => setTimeout(r, 6000));

async function evaluate(expression) {
  const { result } = await browser.send("Runtime.evaluate", { expression, returnByValue: true }, sessionId);
  return result.value;
}

// Advance to Step 3 by clicking the exact button whose own text is the step label.
console.log(
  "[step3]",
  await evaluate(`(() => {
    const b = [...document.querySelectorAll('button')].find(x => /Step 3/i.test(x.textContent||''));
    if (!b) return 'no Step 3 button found';
    b.click(); return 'clicked Step 3';
  })()`),
);
await new Promise((r) => setTimeout(r, 2500));

// Open the disclosure directly -- more reliable than synthesising a click on <summary>.
console.log(
  "[details]",
  await evaluate(`(() => {
    const d = [...document.querySelectorAll('details')].find(x => /size chart/i.test(x.textContent||''));
    if (!d) return 'no size-chart <details> found';
    d.open = true; return 'opened';
  })()`),
);
await new Promise((r) => setTimeout(r, 800));

const table = await evaluate(`(() => {
  const t = document.querySelector('details table');
  if (!t) return null;
  return [...t.rows].map(r => [...r.cells].map(c => c.innerText.trim()).join('  '));
})()`);

const tapTarget = await evaluate(`(() => {
  const s = document.querySelector('details summary');
  if (!s) return null;
  const r = s.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height), visible: r.height > 0 };
})()`);

console.log("\nsize chart table:");
if (table) table.forEach((r) => console.log("  " + r));
else console.log("  NOT RENDERED");
console.log("\nsummary tap target:", tapTarget);

browser.close();
chrome.kill();
process.exit(table ? 0 : 1);
