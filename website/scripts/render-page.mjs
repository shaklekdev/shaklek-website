// Renders a JS-heavy page in real headless Chrome and dumps its visible text
// (and any <table> content). For reading pages that serve a bot-check shell
// or build their content client-side, which plain fetch cannot see.
//
//   node scripts/render-page.mjs <url> [waitMs] [clickTextRegex]
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_TO_LOAD = process.argv[2];
const WAIT = Number(process.argv[3] ?? 8000);
const CLICK = process.argv[4] ?? null;
const PORT = 9335;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!URL_TO_LOAD) {
  console.error("usage: node scripts/render-page.mjs <url> [waitMs] [clickTextRegex]");
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), "render-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--disable-extensions",
  "--window-size=1280,900",
  "--lang=en-AE",
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
await new Promise((r) => setTimeout(r, WAIT));

// Accepts several clicks separated by " && ", so a page that needs a couple of
// steps (advance a wizard, then open a disclosure) can be reached.
for (const step of CLICK ? CLICK.split(" && ") : []) {
  const { result } = await browser.send(
    "Runtime.evaluate",
    {
      expression: `(() => {
        const re = new RegExp(${JSON.stringify(step)}, 'i');
        const el = [...document.querySelectorAll('button,a,summary,[role="button"],span,div')]
          .find(e => re.test((e.innerText||'').trim()) && (e.innerText||'').trim().length < 60);
        if (el) { el.click(); return 'clicked: ' + el.innerText.trim().slice(0,60); }
        return 'no match for ' + re;
      })()`,
      returnByValue: true,
    },
    sessionId,
  );
  console.log("[click] " + result.value);
  await new Promise((r) => setTimeout(r, 3000));
}

const { result } = await browser.send(
  "Runtime.evaluate",
  {
    expression: `(() => {
      const tables = [...document.querySelectorAll('table')].map(t =>
        [...t.rows].map(r => [...r.cells].map(c => c.innerText.trim()).join(' | ')).join('\\n')
      );
      return { title: document.title, tables, text: document.body.innerText.replace(/\\n{3,}/g,'\\n\\n').slice(0, 6000) };
    })()`,
    returnByValue: true,
  },
  sessionId,
);

console.log("TITLE:", result.value.title);
if (result.value.tables.length) {
  console.log("\n=== TABLES (" + result.value.tables.length + ") ===");
  result.value.tables.forEach((t, i) => console.log(`\n--- table ${i + 1} ---\n${t}`));
} else {
  console.log("\n(no <table> elements)");
}
console.log("\n=== TEXT ===\n" + result.value.text);

browser.close();
chrome.kill();
process.exit(0);
