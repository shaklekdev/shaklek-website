// Rebuild the STAGING branch's environment variables from website/.env.local.
//
//   node scripts/amplify-restore-staging-env.mjs            # dry run, names only
//   node scripts/amplify-restore-staging-env.mjs --apply
//
// WHY THIS EXISTS, 2026-09-12:
//
//   aws amplify update-branch --branch-name staging --environment-variables STORE_OPEN=true
//
// REPLACES the branch's whole variable map. It does not merge. That one command
// wiped twelve staging overrides and left only STORE_OPEN, and a branch with no
// override INHERITS THE APP-LEVEL VALUES -- which on this app are the
// PRODUCTION ones. So staging was one build away from being a public site, with
// the shop switched on, running LIVE Stripe keys against the PRODUCTION
// database. Nobody could have charged a card until it rebuilt, but nothing
// would have warned anyone either.
//
// The values live in website/.env.local, which is gitignored and already holds
// the dev database and the test Stripe keys, because that is what local
// development runs against. That makes it the right source for staging.
//
// ⚠️ THE GUARD IS THE POINT, not the convenience. This refuses to write unless
// the values really are the test set: the database host must be the DEV Neon
// branch and the Stripe key must be sk_test_. Pushing production values onto a
// public, un-gated branch is the accident this whole file exists to prevent,
// and "I checked by eye" is how it happened the first time.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP_ID = "dqcptedylrif0";
const BRANCH = "staging";
const APPLY = process.argv.includes("--apply");

// CLAUDE.md: the two hosts differ only after "ep-", which is exactly why this
// is asserted rather than eyeballed.
const DEV_DB_HOST = "ep-jolly-cloud";
const PROD_DB_HOST = "ep-blue-cell";

// Everything staging needs. Values come from .env.local except the last two,
// which are Amplify build settings rather than secrets.
const FROM_ENV_LOCAL = [
  "DATABASE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "STAFF_EMAILS",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL",
  "TAILOR_WHATSAPP_NUMBER",
];
const LITERALS = {
  AMPLIFY_MONOREPO_APP_ROOT: "website",
  AMPLIFY_DIFF_DEPLOY: "false",
  // Staging IS the working copy of the shop. That is safe only because of the
  // guards below: test keys, dev database.
  STORE_OPEN: "true",
};

const envLocal = new Map(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z][A-Z0-9_]*=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);

const vars = { ...LITERALS };
const missing = [];
for (const k of FROM_ENV_LOCAL) {
  const v = envLocal.get(k);
  if (v) vars[k] = v;
  else missing.push(k);
}

// ---- the guards -----------------------------------------------------------
const db = vars.DATABASE_URL ?? "";
const stripe = vars.STRIPE_SECRET_KEY ?? "";
const problems = [];
if (!db.includes(DEV_DB_HOST)) {
  problems.push(
    db.includes(PROD_DB_HOST)
      ? `DATABASE_URL points at PRODUCTION (${PROD_DB_HOST}). Staging must use ${DEV_DB_HOST}.`
      : `DATABASE_URL does not name the dev host ${DEV_DB_HOST}.`,
  );
}
if (!stripe.startsWith("sk_test_")) {
  problems.push(
    stripe.startsWith("sk_live_")
      ? "STRIPE_SECRET_KEY is a LIVE key. Staging is public; it must be sk_test_."
      : "STRIPE_SECRET_KEY is not an sk_test_ key.",
  );
}
if (problems.length) {
  console.error("refusing to write:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}

console.log(`branch ${BRANCH} of ${APP_ID}`);
console.log(`  database  ${DEV_DB_HOST} (dev) ✅`);
console.log(`  stripe    sk_test_… ✅`);
console.log(`\nwould set ${Object.keys(vars).length} variables:`);
for (const k of Object.keys(vars).sort()) console.log(`  ${k}`);
if (missing.length) {
  console.log(`\n⚠️ not in .env.local, so NOT restored: ${missing.join(", ")}`);
  console.log("   Set these by hand in the console if staging needs them.");
}

if (!APPLY) {
  console.log("\ndry run. Re-run with --apply to write it.");
  process.exit(0);
}

// ⚠️ THE VALUES GO IN A FILE, NEVER IN ARGV. The first version of this passed
// them as `--environment-variables K=V K=V ...`. AWS CLI v1 does not accept
// that shape, and when it rejected the call it ECHOED THE WHOLE COMMAND LINE
// back -- printing the Resend key, the database password and every Stripe and
// Clerk secret into the terminal and into the session transcript. The key had
// to be rotated.
//
// Two lessons, both now enforced below rather than remembered:
//   1. A command line is not private. It is echoed on error and it is visible
//      to `ps` while it runs. Secrets go in a file with 0600, passed by
//      reference, and deleted in a finally block.
//   2. stderr from the AWS CLI must not be inherited when the command carries
//      anything sensitive. It is captured and only a short, scrubbed summary is
//      printed.
const tmp = join(tmpdir(), `amplify-staging-${process.pid}.json`);
try {
  writeFileSync(
    tmp,
    JSON.stringify({ appId: APP_ID, branchName: BRANCH, environmentVariables: vars }),
    { mode: 0o600 },
  );
  execFileSync("aws", ["amplify", "update-branch", "--cli-input-json", `file://${tmp}`], {
    stdio: ["ignore", "ignore", "pipe"],
  });
} catch (err) {
  // Scrub anything that looks like a secret before this reaches a screen.
  const raw = String(err.stderr ?? err.message ?? "");
  const safe = raw
    .replace(/(sk_|pk_|re_|whsec_|rk_)[A-Za-z0-9_-]+/g, "$1[redacted]")
    .replace(/postgres(ql)?:\/\/[^\s]+/g, "postgresql://[redacted]");
  console.error("update-branch failed:\n" + safe.slice(0, 600));
  process.exit(1);
} finally {
  try {
    unlinkSync(tmp);
  } catch {
    /* already gone */
  }
}

// Read back. Names only -- never print a value.
const after = JSON.parse(
  execFileSync("aws", [
    "amplify", "get-branch", "--app-id", APP_ID, "--branch-name", BRANCH,
    "--query", "keys(branch.environmentVariables)", "--output", "json",
  ], { encoding: "utf8" }),
);
const stillMissing = Object.keys(vars).filter((k) => !after.includes(k));
if (stillMissing.length) {
  console.error(`\n❌ wrote, but missing from the branch that came back: ${stillMissing.join(", ")}`);
  process.exit(1);
}
console.log(`\n✅ ${after.length} variables on ${BRANCH}, verified by reading the branch back.`);
console.log("   Staging still needs a REDEPLOY before any of this takes effect.");
