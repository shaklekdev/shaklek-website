// Confirms Clerk's sign-in widget actually mounts under the CSP -- a header
// dump and a "no console errors" pass both look fine if clerk-js silently
// never loaded. Checks for real Clerk DOM and that clerk.shaklek.com was
// fetched successfully.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_TO_CHECK = process.argv[2] ?? "https://www.shaklek.com/sign-in";
const PORT = 9334;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const profile = mkdtempSync(join(tmpdir(), "clerk-check-"));
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
  for (let i = 0; i < 60; i++) {
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

const network = [];
browser.on((m) => {
  if (m.sessionId !== sessionId) return;
  if (m.method === "Network.responseReceived") {
    const u = m.params.response.url;
    if (u.includes("clerk") || u.includes("fonts.g")) network.push(`${m.params.response.status}  ${u.slice(0, 110)}`);
  }
  if (m.method === "Network.loadingFailed" && m.params.blockedReason) {
    network.push(`BLOCKED(${m.params.blockedReason})  ${m.params.url ?? ""}`);
  }
});

for (const d of ["Log", "Runtime", "Network", "Page"]) await browser.send(`${d}.enable`, {}, sessionId);

await browser.send("Page.navigate", { url: URL_TO_CHECK }, sessionId);
await new Promise((r) => setTimeout(r, 10000));

const { result } = await browser.send(
  "Runtime.evaluate",
  {
    expression: `({
      clerkLoaded: Boolean(window.Clerk),
      clerkVersion: window.Clerk?.version ?? null,
      clerkElements: document.querySelectorAll('[class*="cl-"]').length,
      identifierInput: Boolean(document.querySelector('input[name="identifier"], input[type="email"]')),
      buttons: document.querySelectorAll('button').length,
      textLen: document.body.innerText.trim().length,
      fontLoaded: document.fonts ? [...document.fonts].some(f => f.family.includes('Reem')) : null
    })`,
    returnByValue: true,
  },
  sessionId,
);

console.log(`\n${URL_TO_CHECK}\n`);
console.log(result.value);
console.log("\nrelevant network:");
for (const n of [...new Set(network)]) console.log("  " + n);

browser.close();
chrome.kill();
process.exit(0);
