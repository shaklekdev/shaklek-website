// Loads pages in real headless Chrome and reports anything the
// Content-Security-Policy blocked, plus any console error.
//
// Exists because a CSP that is wrong takes the storefront or Clerk sign-in
// down, and a header dump cannot tell you that -- only a browser actually
// executing the page can. Uses the DevTools Protocol directly over Node's
// global WebSocket, so it needs no Puppeteer/Playwright install.
//
//   node scripts/csp-check.mjs https://www.shaklek.com
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2] ?? "https://www.shaklek.com";
const PATHS = ["/", "/how-it-works", "/our-story", "/cart", "/checkout", "/upload", "/sign-in", "/design/oversized-shirt"];
const PORT = 9333;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const profile = mkdtempSync(join(tmpdir(), "csp-check-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--window-size=390,844", // iPhone-ish, since mobile is most of the traffic
]);
chrome.stderr.on("data", () => {});

async function waitForChrome() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Chrome did not expose a debugging port");
}

const browserWsUrl = await waitForChrome();

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
        on(fn) {
          listeners.push(fn);
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener("error", reject);
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method) {
        for (const fn of listeners) fn(msg);
      }
    });
  });
}

const browser = await connect(browserWsUrl);
const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });

const findings = [];
browser.on((msg) => {
  if (msg.sessionId !== sessionId) return;
  const p = msg.params;
  if (msg.method === "Log.entryAdded") {
    const e = p.entry;
    if (e.level === "error" || e.source === "security") {
      findings.push({ kind: e.source === "security" ? "CSP/SECURITY" : "CONSOLE-ERROR", text: e.text, url: e.url });
    }
  }
  if (msg.method === "Network.loadingFailed" && p.blockedReason) {
    findings.push({ kind: `BLOCKED(${p.blockedReason})`, text: p.blockedReason, url: p.url ?? "" });
  }
  if (msg.method === "Runtime.exceptionThrown") {
    findings.push({ kind: "JS-EXCEPTION", text: p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text, url: "" });
  }
});

for (const domain of ["Log", "Runtime", "Network", "Page"]) {
  await browser.send(`${domain}.enable`, {}, sessionId);
}

let total = 0;
for (const path of PATHS) {
  findings.length = 0;
  const url = `${BASE}${path}`;
  await browser.send("Page.navigate", { url }, sessionId);
  await new Promise((r) => setTimeout(r, 6000)); // let Clerk and fonts settle

  // Ask the page what it actually rendered, so a blank/blocked page is obvious.
  const { result } = await browser.send(
    "Runtime.evaluate",
    { expression: "({t: document.title, len: document.body.innerText.trim().length, scripts: document.scripts.length})", returnByValue: true },
    sessionId,
  );

  const unique = [...new Map(findings.map((f) => [f.kind + f.text + f.url, f])).values()];
  total += unique.length;
  const state = result.value;
  console.log(`\n${path}  —  ${unique.length ? `${unique.length} finding(s)` : "clean"}   [text ${state.len} chars, ${state.scripts} scripts]`);
  for (const f of unique) console.log(`   ${f.kind}: ${String(f.text).slice(0, 220)}${f.url ? `\n      ${f.url.slice(0, 160)}` : ""}`);
}

console.log(`\n${total === 0 ? "PASS — no CSP blocks, no console errors." : `${total} finding(s) total.`}`);

browser.close();
chrome.kill();
process.exit(0);
