/**
 * THE STATUS BOARD. `node planning/status.mjs`
 *
 * WHY THIS EXISTS. Founder, 2026-09-14, after being asked a fourth time about
 * things she had already settled: "why is this always stale??? you're driving
 * me crazy." She was right every time. Fabric was quoted and invoiced on
 * 2026-09-09 and pricing-todo.md still said PLACEHOLDER. Fitoor and the cotton
 * bag were paid and margins.mjs still listed them as pending.
 *
 * The cause was not laziness. It was SIX todo files, each written by whoever
 * was in that part of the code, none of them updated when she answered
 * something out loud. A fact recorded in one file and superseded in
 * conversation goes stale in every other file, silently.
 *
 * SO THE RULE IS: anything a machine can check is never written down.
 *
 *   DERIVED  — computed here, fresh, every run. Cannot go stale, because
 *              nothing is stored. If the catalogue changes, this changes.
 *   DECLARED — planning/OPEN.md, one file, for things only a human knows.
 *              Every line carries who and when, and this flags anything
 *              older than STALE_DAYS so it gets re-confirmed rather than
 *              quietly believed.
 *
 * This is the same argument CLAUDE.md §7 makes about db-migrate reading
 * production's address instead of printing a host for a human to read: a check
 * that runs whether or not anyone is paying attention beats a rule in a file.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const STALE_DAYS = 14;
const read = (p) => { try { return fs.readFileSync(`${ROOT}/${p}`, "utf8"); } catch { return ""; } };
const sh = (c) => { try { return execSync(c, { cwd: ROOT, encoding: "utf8", stdio: ["ignore","pipe","ignore"] }).trim(); } catch { return ""; } };

const ok = (s) => `  \x1b[32m✓\x1b[0m ${s}`;
const no = (s) => `  \x1b[31m✗\x1b[0m ${s}`;
const hm = (s) => `  \x1b[33m!\x1b[0m ${s}`;

// ---------------------------------------------------------------- DERIVED
const catalog = read("website/src/data/catalog.ts");
const slugs = [...catalog.matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]);
const prices = [...new Set([...catalog.matchAll(/\bprice: (\d+)/g)].map((m) => m[1]))];
const derived = [];

derived.push(slugs.length ? ok(`catalogue: ${slugs.length} items, prices ${prices.join("/")} AED`)
                          : no("catalogue: could not read catalog.ts"));
derived.push(/abaya/i.test(catalog) && slugs.some((s) => s.includes("abaya"))
  ? ok("abaya exists as a catalogue item")
  : no("NO ABAYA in the catalogue. It cannot be photographed or priced until it has a slug"));

// Lead-time and claim sweep over what a customer can actually read.
let swept = 0, bad = [];
try {
  const { BANNED } = await import(`${ROOT}/website/scripts/social/copy-rules.mjs`);
  // Customer-facing marketing surfaces only. /dashboard is staff behind auth
  // and /account is the customer's own signed-in area; the em-dash and "AI"
  // rules are about how the brand SELLS, and applying them there produced
  // noise that buried three real lead-time promises on the first run.
  const pages = sh(`find website/src/app -name 'page.tsx'`).split("\n")
    .filter(Boolean).filter((f) => !/\/(dashboard|account)\//.test(f));
  for (const f of pages) {
    // ⚠️ STRIP COMMENTS FIRST. The first version of this swept raw source and
    // reported 54 violations, every one of them a false positive: these files
    // carry long comments EXPLAINING the banned words, so a comment saying
    // 'never write "photograph" of a generated image' tripped the photograph
    // rule. A check that cries wolf gets ignored, which is worse than no check.
    const src = read(f)
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    const strings = [...src.matchAll(/"([^"\\]{25,})"/g)].map((m) => m[1]);
    swept++;
    for (const s of strings) for (const [re, why] of BANNED) if (re.test(s)) bad.push(`${f.replace("website/src/app","")}  ${why}`);
  }
  derived.push(bad.length ? no(`claim sweep: ${bad.length} hit(s) across ${swept} pages`)
                          : ok(`claim sweep: ${swept} pages clean`));
  for (const b of [...new Set(bad)].slice(0, 6)) derived.push(`      ${b}`);
} catch { derived.push(hm("claim sweep: could not load copy-rules.mjs")); }

const unpushed = sh("git rev-list --count origin/main..main");
derived.push(unpushed && unpushed !== "0" ? hm(`${unpushed} commit(s) not pushed`) : ok("nothing unpushed"));
const dirty = sh("git status --porcelain").split("\n").filter(Boolean).length;
derived.push(dirty ? hm(`${dirty} file(s) uncommitted`) : ok("working tree clean"));

const pixel = /NEXT_PUBLIC_META_PIXEL_ID/.test(read("website/src/app/layout.tsx") + read("website/src/components/MetaPixel.tsx"));
derived.push(pixel ? ok("Meta pixel is wired (still needs the env var to fire)") : hm("Meta pixel: not found in the layout"));

// ---------------------------------------------------------------- DECLARED
const today = new Date();
const openMd = read("planning/OPEN.md");
const items = [...openMd.matchAll(/^- \[( |x)\] (\S+) \| (\S+) \| confirmed:(\d{4}-\d{2}-\d{2}) \| (.+)$/gm)]
  .map(([, done, id, owner, date, text]) => ({
    done: done === "x", id, owner, date, text,
    age: Math.round((today - new Date(date)) / 864e5),
  }))
  .filter((i) => !i.done);

const hers = items.filter((i) => i.owner === "founder");
const ours = items.filter((i) => i.owner !== "founder");
const stale = items.filter((i) => i.age > STALE_DAYS);

// ---------------------------------------------------------------- PRINT
console.log(`\n\x1b[1mSHAKLEK STATUS\x1b[0m   ${today.toISOString().slice(0, 10)}\n`);
console.log("\x1b[1mDERIVED\x1b[0m  computed now, cannot go stale");
console.log(derived.join("\n"));

console.log(`\n\x1b[1mNEEDS HER\x1b[0m  ${hers.length} item(s), nobody can start these`);
for (const i of hers) console.log(`  ${i.id.padEnd(22)} ${i.text}`);

console.log(`\n\x1b[1mOURS\x1b[0m  ${ours.length} item(s)`);
for (const i of ours) console.log(`  ${i.id.padEnd(22)} ${i.text}`);

if (stale.length) {
  console.log(`\n\x1b[33mUNCONFIRMED FOR OVER ${STALE_DAYS} DAYS\x1b[0m  ask her before believing these`);
  for (const i of stale) console.log(`  ${i.id.padEnd(22)} last confirmed ${i.date}, ${i.age} days ago`);
}
console.log(`\nEdit planning/OPEN.md to change the list. Never record a fact this script can derive.\n`);
