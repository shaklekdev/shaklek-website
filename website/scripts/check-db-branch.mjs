// Confirms which Neon branch local dev is pointed at, without printing any
// credential or any customer PII. Prints the host, the Stripe key mode, and
// row counts only.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const stripeMode = env.match(/^STRIPE_SECRET_KEY=sk_(test|live)/m)?.[1] ?? "unknown";

if (!url) {
  console.error("DATABASE_URL not found in website/.env.local");
  process.exit(1);
}

const host = url.replace(/^[a-z]+:\/\/[^@]*@/, "").split("/")[0];
const PRODUCTION_HOST_PREFIX = "ep-blue-cell-b1krtp0o";

console.log(`stripe key mode : sk_${stripeMode}`);
console.log(`database host   : ${host}`);
console.log(
  `branch          : ${host.startsWith(PRODUCTION_HOST_PREFIX) ? "*** PRODUCTION ***" : "not production (dev branch)"}`,
);

const sql = postgres(url, { ssl: "require" });

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`;
console.log(`\ntables (${tables.length}): ${tables.map((t) => t.table_name).join(", ")}`);

for (const name of ["customers", "orders", "order_items"]) {
  if (!tables.some((t) => t.table_name === name)) {
    console.log(`  ${name.padEnd(12)} MISSING`);
    continue;
  }
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM ${sql(name)}`;
  console.log(`  ${name.padEnd(12)} ${n} row(s)`);
}

const safe = !host.startsWith(PRODUCTION_HOST_PREFIX) && stripeMode === "test";
console.log(
  `\n${safe ? "OK — sandbox Stripe paired with a non-production database." : "MISMATCH — check the pairing above."}`,
);

await sql.end();
process.exit(safe ? 0 : 1);
