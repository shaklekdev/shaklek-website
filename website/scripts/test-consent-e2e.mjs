// Does the pixel actually stay silent until consent?
//
// The unit test proves the consent module defaults to no. It cannot prove the
// page honours it, and that is the claim that matters: this decides whether a
// live storefront tracks visitors who never agreed. So this drives a real
// production build in real headless Chrome and watches the network.
//
//   npm run build          (with NEXT_PUBLIC_META_PIXEL_ID set)
//   npx next start -p 3111
//   npx tsx scripts/test-consent-e2e.mjs http://localhost:3111
//
// Passing means: zero requests to Meta before a choice, requests after Accept,
// still zero after Decline.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3111";
const PORT = 9346;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const META = /facebook\.(net|com)/i;

const profile = mkdtempSync(join(tmpdir(), "consent-"));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--disable-extensions", "--window-size=430,930",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Must attach to a PAGE target, not the browser endpoint. /json/version gives
// the browser-level socket, which silently ignores Page and Runtime commands:
// the page never navigates, every evaluate returns undefined, and a
// "no requests were made" assertion passes because nothing loaded at all. That
// is a vacuous pass, and it is exactly why the positive control below (Meta IS
// contacted after Accept) has to exist. It is the assertion that fails when the
// harness is broken rather than the site.
async function endpoint() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const page = (await r.json()).find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* chrome not up yet */ }
    await sleep(250);
  }
  throw new Error("no page target");
}

const ws = new WebSocket(await endpoint());
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
let hits = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === "Network.requestWillBeSent" && META.test(m.params.request.url))
    hits.push(m.params.request.url);
};
const send = (method, params = {}) =>
  new Promise((res) => { const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });

const evalJs = async (expr) =>
  (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }))?.result?.value;

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");

let fail = 0;
const check = (c, m) => { if (!c) { console.error("FAIL:", m); fail++; } else console.log("  ok  ", m); };

async function load(consentValue) {
  await send("Page.navigate", { url: BASE });
  await sleep(2500);
  if (consentValue !== undefined) {
    await evalJs(`localStorage.setItem('shaklek.consent.marketing.v1','${consentValue}')`);
    hits = [];
    await send("Page.navigate", { url: BASE });
    await sleep(3000);
  }
}

// 1. A visitor who has never answered.
await evalJs(`try{localStorage.clear()}catch(e){}`).catch(() => {});
await send("Page.navigate", { url: BASE });
await sleep(1500);
await evalJs(`try{localStorage.clear()}catch(e){}`);
hits = [];
await send("Page.navigate", { url: BASE });
await sleep(3500);
check(hits.length === 0, `no request to Meta before any choice (saw ${hits.length})`);

const barText = await evalJs(`document.body.innerText.includes('Decline') && document.body.innerText.includes('Accept')`);
check(barText === true, "the consent bar is shown, with Decline as a real button");

// The bar must not understate what it asks for. Meta sets TWO cookies, _fbp
// always and _fbc on an ad click, and lib/consent.ts deletes both. A banner
// saying "one cookie" contradicted the code behind it and understated the ask
// on exactly the campaign traffic the pixel exists for.
const undercount = await evalJs(`/\\bone cookie\\b/i.test(document.body.innerText)`);
check(undercount === false, "the bar does not claim a single cookie when Meta sets two");

const scriptBefore = await evalJs(`!!document.getElementById('meta-pixel')`);
check(scriptBefore === false, "the pixel script tag is absent before consent");

const noscriptBefore = await evalJs(`document.documentElement.innerHTML.includes('facebook.com/tr')`);
check(noscriptBefore === false, "the no-JS fallback image is absent before consent");

// 2. Declined.
await load("denied");
check(hits.length === 0, `no request to Meta after Decline (saw ${hits.length})`);

// 3. Granted.
await load("granted");
check(hits.length > 0, `Meta is contacted after Accept (saw ${hits.length})`);

// 4. Withdrawal. Consent that cannot be withdrawn as easily as it was given is
// not a lawful basis, so the footer control and the cookie deletion are part of
// the claim, not polish.
await load("granted");
const hasLink = await evalJs(`Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()==='Cookie choices')`);
check(hasLink === true, "a Cookie choices control exists in the footer");

// Click, then let React flush before reading the DOM. Reading synchronously in
// the same expression checked the page BEFORE the state update had rendered,
// which failed while the bar was in fact opening correctly.
await evalJs(`(()=>{const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Cookie choices');if(b)b.click();})()`);
await sleep(500);
const reopened = await evalJs(`document.body.innerText.includes('Decline') && document.body.innerText.includes('Accept')`);
check(reopened === true, "the control reopens the bar so a choice can be changed");

// Withdrawing must actually remove the identifier, not just stop future events.
await evalJs(`document.cookie='_fbp=fb.1.test.123; path=/'`);
const before = await evalJs(`document.cookie.includes('_fbp')`);
check(before === true, "test cookie was set (control for the check below)");
await evalJs(`(()=>{const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Decline');if(b)b.click();})()`);
await sleep(400);
const after = await evalJs(`document.cookie.includes('_fbp')`);
check(after === false, "declining DELETES the Meta cookie, so withdrawal removes something");

const stored = await evalJs(`localStorage.getItem('shaklek.consent.marketing.v1')`);
check(stored === "denied", "the new choice is persisted");

console.log(fail === 0 ? "\nok — silent until consent, and withdrawal actually withdraws" : `\n${fail} failure(s)`);
ws.close();
chrome.kill();
process.exit(fail === 0 ? 0 : 1);
