// Add an environment variable to Amplify's build-spec allowlist.
//
//   node scripts/amplify-allow-env.mjs RESEND_SEGMENT_ID STORE_OPEN     # dry run
//   node scripts/amplify-allow-env.mjs RESEND_SEGMENT_ID --apply
//
// WHY THIS EXISTS. Amplify's build spec carries an explicit allowlist:
//
//   env | grep -e DATABASE_URL -e STRIPE_SECRET_KEY ... >> .env.production
//
// A variable set in the Amplify console but missing from that grep NEVER
// REACHES THE RUNNING APP. process.env.YOURS is undefined in production while
// the console cheerfully shows it set. That has cost an hour twice on this
// project (RECONCILE_TOKEN, 2026-08-26) and it is invisible: nothing fails,
// nothing logs, the feature simply does not work.
//
// CLAUDE.md's own argument applies here: "a check that runs whether or not
// anyone is paying attention beats [a rule in this file] every time". So this
// reads the live spec rather than a remembered copy, refuses to touch anything
// it does not understand, and prints what it would do before doing it.
//
// ⚠️ IT STILL TAKES THREE STEPS. This is only the first:
//   1. this script            -- the allowlist
//   2. the Amplify console    -- the VALUE
//   3. a redeploy             -- the spec is read at BUILD time
// Steps 1 and 2 in either order; step 3 is not optional. Then prove the
// RUNNING APP sees it, never the console.
import { execFileSync } from "node:child_process";

const APP_ID = "dqcptedylrif0"; // shaklek-website, eu-west-1
const APPLY = process.argv.includes("--apply");
const names = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (names.length === 0) {
  console.error("usage: node scripts/amplify-allow-env.mjs VAR_NAME [VAR_NAME...] [--apply]");
  process.exit(1);
}
for (const n of names) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(n)) {
    console.error(`refusing "${n}": an env var name here is upper snake case.`);
    process.exit(1);
  }
}

function aws(args) {
  return execFileSync("aws", args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
}

let spec;
try {
  spec = aws(["amplify", "get-app", "--app-id", APP_ID, "--query", "app.buildSpec", "--output", "text"]);
} catch (err) {
  console.error("could not read the build spec. Is the AWS CLI on PATH and logged in?");
  console.error('  export PATH="$PATH:/Users/nadatlohi/Library/Python/3.8/bin"');
  console.error(String(err.stderr || err.message).slice(0, 400));
  process.exit(1);
}

// Match the one grep line. Anchored on "env | grep" and the redirect, so a
// spec that has been restructured fails loudly instead of being half-edited.
const LINE = /^(\s*- )(env \| grep (?:-e [A-Z0-9_]+ )+)(>> \.env\.production)$/m;
const m = spec.match(LINE);
if (!m) {
  console.error("could not find the `env | grep ... >> .env.production` line in the build spec.");
  console.error("The spec has changed shape. Edit it by hand and update this matcher.");
  process.exit(1);
}

const present = [...m[2].matchAll(/-e ([A-Z0-9_]+)/g)].map((x) => x[1]);
const missing = names.filter((n) => !present.includes(n));

console.log(`app ${APP_ID}`);
console.log(`allowlist has ${present.length}: ${present.join(", ")}`);

if (missing.length === 0) {
  console.log(`\n✅ nothing to do — ${names.join(", ")} already allowed.`);
  console.log("   Remember the value still has to be set in the console, and the app redeployed.");
  process.exit(0);
}

const updatedLine = `${m[1]}${m[2]}${missing.map((n) => `-e ${n} `).join("")}${m[3]}`;
const updatedSpec = spec.replace(LINE, updatedLine);

console.log(`\nwould add: ${missing.join(", ")}`);
console.log(`\n  ${updatedLine.trim()}\n`);

if (!APPLY) {
  console.log("dry run. Re-run with --apply to write it.");
  process.exit(0);
}

aws(["amplify", "update-app", "--app-id", APP_ID, "--build-spec", updatedSpec]);

// Read it back. The exit code is not the check -- that is the mistake the
// migration script was written to avoid.
const after = aws(["amplify", "get-app", "--app-id", APP_ID, "--query", "app.buildSpec", "--output", "text"]);
const stillMissing = missing.filter((n) => !new RegExp(`-e ${n}\\b`).test(after));
if (stillMissing.length) {
  console.error(`\n❌ wrote, but ${stillMissing.join(", ")} is NOT in the spec that came back. Check the console.`);
  process.exit(1);
}
console.log(`\n✅ ${missing.join(", ")} added to the allowlist and verified against the live spec.`);
console.log("\nSTILL TO DO, and the variable does nothing until both are done:");
console.log("  2. set the VALUE in Amplify → shaklek-website → main → environment variables");
console.log("  3. redeploy, then prove the running app sees it:");
console.log("       curl -s -o /dev/null -w '%{http_code}\\n' -X POST https://www.shaklek.com/api/orders \\");
console.log("         -H 'Content-Type: application/json' -d '{}'      # 400 = open, 503 = still shut");
