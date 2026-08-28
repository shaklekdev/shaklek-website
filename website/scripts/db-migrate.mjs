/**
 * Apply pending migrations, against a database you have NAMED OUT LOUD.
 *
 *   node scripts/db-migrate.mjs --target=dev     # the Neon branch in .env.local
 *   node scripts/db-migrate.mjs --target=prod    # what Amplify actually runs
 *
 * ⚠️ THIS EXISTS BECAUSE OF A REAL OUTAGE ON 2026-08-28. The fit_feedback table
 * was created, verified against information_schema, and reported as done -- on
 * the DEV Neon branch, because .env.local points at a different endpoint from
 * the one Amplify serves with. The code was already pushed, so production ran
 * for a while querying a table that did not exist there, and /account broke for
 * every signed-in customer.
 *
 * Every check that was run was a real check. Not one of them asked WHICH
 * DATABASE. The two endpoints differ only after the "ep-" prefix:
 *
 *     dev   ep-jolly-cloud-b1e2dn40-pooler...
 *     prod  ep-blue-cell-b1krtp0o-pooler...
 *
 * So this script prints the host before it does anything, refuses if the host
 * does not match the target you asked for, and verifies afterwards against
 * information_schema rather than against an exit code.
 *
 * ⚠️ AND IT DOES NOT USE drizzle-kit migrate, WHICH SILENTLY DOES NOTHING HERE.
 * This schema was created with `drizzle-kit push`, so drizzle.__drizzle_migrations
 * is empty; the tool believes every migration since 0000 is unapplied, tries to
 * create tables that already exist, and exits 0 having done nothing. It did
 * exactly that twice before anyone checked. See CLAUDE.md deploy Trap 3.
 */
import postgres from "postgres";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const HOSTS = { dev: "ep-jolly-cloud", prod: "ep-blue-cell" };
const target = (process.argv.find((a) => a.startsWith("--target=")) ?? "").split("=")[1];
if (!HOSTS[target]) {
  console.error("Usage: node scripts/db-migrate.mjs --target=dev|prod");
  console.error("No default, on purpose. Naming the database is the point of this script.");
  process.exit(1);
}

function urlFor(t) {
  if (t === "dev") {
    const m = readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.+)$/m);
    return m?.[1].replace(/^["']|["']$/g, "");
  }
  // Production is read from Amplify itself rather than from any local file --
  // a local file is exactly what got this wrong.
  return execFileSync("aws", ["amplify", "get-app", "--app-id", "dqcptedylrif0",
    "--query", "app.environmentVariables.DATABASE_URL", "--output", "text"],
    { encoding: "utf8" }).trim();
}

const url = urlFor(target);
if (!url) { console.error(`No DATABASE_URL found for ${target}`); process.exit(1); }
const host = new URL(url).hostname;

console.log(`target : ${target}`);
console.log(`host   : ${host}`);
if (!host.startsWith(HOSTS[target])) {
  console.error(`\nREFUSING. --target=${target} expects a host starting "${HOSTS[target]}".`);
  console.error("Either the endpoint moved or you are pointed at the wrong database.");
  process.exit(1);
}

const dir = "drizzle";
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const sql = postgres(url, { ssl: "require", max: 1 });

const tables = new Set(
  (await sql`select table_name from information_schema.tables where table_schema = 'public'`)
    .map((r) => r.table_name),
);
console.log(`tables : ${[...tables].sort().join(", ") || "(none)"}\n`);

/**
 * OUR OWN LEDGER, not drizzle's.
 *
 * The first version of this script tried to infer "already applied" from
 * whether a file's CREATE TABLE targets existed. That works for 0000 and 0006
 * and is wrong for everything between, because 0001 to 0005 are ALTER TABLE
 * ADD COLUMN and create no table at all -- so it re-ran them against
 * production and got "column already exists". It failed safe, inside the
 * transaction, and changed nothing. Guessing was still the bug.
 *
 * BASELINING: this database was built with `drizzle-kit push`, so there has
 * never been a truthful record of what was applied. On the first run the
 * ledger is created and seeded with every migration currently on disk, which
 * is accurate -- both databases are at 0006 and verified so. From then on only
 * genuinely new files run.
 */
await sql`create table if not exists shaklek_migrations (
  filename text primary key,
  applied_at timestamptz not null default now()
)`;
const ledger = new Set(
  (await sql`select filename from shaklek_migrations`).map((r) => r.filename),
);
if (ledger.size === 0 && tables.has("customers")) {
  console.log("BASELINE: no ledger and an existing schema, so every migration now on");
  console.log("disk is recorded as applied without being run. This happens once.\n");
  for (const f of files) {
    await sql`insert into shaklek_migrations (filename) values (${f}) on conflict do nothing`;
    ledger.add(f);
    console.log(`  baseline ${f}`);
  }
}

let applied = 0;
for (const f of files) {
  if (ledger.has(f)) { console.log(`  skip  ${f}`); continue; }
  const stmts = readFileSync(path.join(dir, f), "utf8")
    .split("--> statement-breakpoint").map((x) => x.trim()).filter(Boolean);
  // One transaction per file, and the ledger row is written inside it: a
  // migration and the record that it ran land together or not at all.
  await sql.begin(async (tx) => {
    for (const st of stmts) await tx.unsafe(st);
    await tx`insert into shaklek_migrations (filename) values (${f})`;
  });
  console.log(`  APPLY ${f}  (${stmts.length} statements)`);
  applied++;
}

// ⚠️ VERIFY AGAINST THE DATABASE, NEVER AGAINST THE EXIT CODE. That is the
// specific thing that went wrong: drizzle-kit exited 0 having done nothing.
const after = (await sql`select table_name from information_schema.tables
                         where table_schema = 'public' order by 1`).map((r) => r.table_name);
console.log(`\napplied ${applied} file(s)`);
console.log(`tables now: ${after.join(", ")}`);
await sql.end();
