// Removes the rows the 2026-08-23 external security audit created by POSTing
// probe orders at the live /api/orders. Scoped to exactly two customer
// emails; nothing else is touched.
//
// Dry run by default. Pass --commit to actually delete.
//
//   node scripts/delete-audit-rows.mjs
//   node scripts/delete-audit-rows.mjs --commit
import { readFileSync } from "node:fs";
import postgres from "postgres";

const AUDIT_EMAILS = ["security-scan-test@example.com", "not-an-email"];

const commit = process.argv.includes("--commit");

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
if (!url) {
  console.error("DATABASE_URL not found in website/.env.local");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require" });

const targets = await sql`
  SELECT o.id, o.status, o.total_aed, o.stripe_session_id, o.created_at, c.email
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE c.email = ANY(${AUDIT_EMAILS})
  ORDER BY o.created_at
`;

console.log(`${commit ? "DELETING" : "DRY RUN — would delete"} ${targets.length} order(s):\n`);
for (const t of targets) {
  console.log(
    `  ${t.created_at?.toISOString().slice(0, 16)}  ${t.status.padEnd(15)} AED ${String(t.total_aed).padEnd(8)} ${t.email.padEnd(32)} ${t.id}`,
  );
}

// Anything paid must never be removed -- a paid order is a real obligation to
// a real customer, regardless of which email placed it.
const paid = targets.filter((t) => t.status !== "pending_payment");
if (paid.length) {
  console.error(`\nREFUSING: ${paid.length} row(s) are not pending_payment. Investigate first.`);
  await sql.end();
  process.exit(1);
}

const customers = await sql`
  SELECT id, email FROM customers WHERE email = ANY(${AUDIT_EMAILS})
`;
console.log(`\n${commit ? "DELETING" : "would delete"} ${customers.length} customer row(s):`);
for (const c of customers) console.log(`  ${c.email}  ${c.id}`);

if (!commit) {
  console.log("\nDry run only. Re-run with --commit to apply.");
  await sql.end();
  process.exit(0);
}

const orderIds = targets.map((t) => t.id);
const customerIds = customers.map((c) => c.id);

await sql.begin(async (tx) => {
  const items = await tx`DELETE FROM order_items WHERE order_id = ANY(${orderIds}) RETURNING id`;
  const orders = await tx`DELETE FROM orders WHERE id = ANY(${orderIds}) RETURNING id`;
  const custs = await tx`DELETE FROM customers WHERE id = ANY(${customerIds}) RETURNING id`;
  console.log(
    `\nDeleted: ${items.length} order_items, ${orders.length} orders, ${custs.length} customers.`,
  );
});

const remaining = await sql`SELECT count(*)::int AS n FROM orders`;
console.log(`orders remaining: ${remaining[0].n}`);

await sql.end();
