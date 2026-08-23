// Exercises envGuard's four combinations. A guard nobody tested is a comment.
// Uses no real credentials -- fake hosts and fake key prefixes only.
import { spawnSync } from "node:child_process";

const PROD = "postgresql://u:p@ep-blue-cell-b1krtp0o-pooler.c-5.eu-central-1.aws.neon.tech/db";
const DEV = "postgresql://u:p@ep-jolly-cloud-b1e2dn40-pooler.c-5.eu-central-1.aws.neon.tech/db";

const cases = [
  { name: "test key + production db", key: "sk_test_fake", url: PROD, expect: "throw" },
  { name: "test key + dev db", key: "sk_test_fake", url: DEV, expect: "ok" },
  { name: "live key + production db", key: "sk_live_fake", url: PROD, expect: "ok" },
  { name: "live key + dev db", key: "sk_live_fake", url: DEV, expect: "warn" },
];

let failures = 0;
for (const c of cases) {
  const script = `
    import { assertDatabaseMatchesStripeMode } from "./src/lib/envGuard.ts";
    try {
      assertDatabaseMatchesStripeMode(${JSON.stringify(c.url)});
      console.log("RESULT:ok");
    } catch (e) {
      console.log("RESULT:throw");
    }
  `;
  const run = spawnSync("npx", ["tsx", "--eval", script], {
    env: { ...process.env, STRIPE_SECRET_KEY: c.key },
    encoding: "utf8",
  });
  // Match only the final stdout line. Matching anywhere in the combined
  // output is wrong: the script SOURCE contains both marker strings, so any
  // echo of it matched "throw" first and every case looked like a throw.
  const lines = (run.stdout ?? "").trim().split("\n").filter(Boolean);
  const last = lines[lines.length - 1] ?? "";
  const threw = last === "RESULT:throw";
  const warned = (run.stderr ?? "").includes("[envGuard]");

  const actual = threw ? "throw" : warned ? "warn" : "ok";
  const pass = actual === c.expect;
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${c.name.padEnd(28)} expected ${c.expect.padEnd(5)} got ${actual}`);
}

console.log(failures === 0 ? "\nAll guard cases behave as designed." : `\n${failures} case(s) wrong.`);
process.exit(failures === 0 ? 0 : 1);
