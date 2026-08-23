// Removes the pre-launch test orders left in the PRODUCTION database from
// August testing -- the `cs_test_` sessions and the throwaway @example.com
// customers sitting alongside real orders in the dashboard.
//
// Separate from delete-audit-rows.mjs because that one refuses anything not
// pending_payment, and some of these are "shipped" or "canceled" -- statuses
// they were given by hand while testing the dashboard, not by a real customer.
//
// Reads the connection string from PROD_DATABASE_URL so the production
// credential is never written to a file. Local .env.local deliberately points
// at the dev branch (src/lib/envGuard.ts), which is why this cannot just use
// the ambient config:
//
//   export PROD_DATABASE_URL="$(aws amplify get-app --app-id dqcptedylrif0 \
//     --query 'app.environmentVariables.DATABASE_URL' --output text)"
//   node scripts/delete-old-test-rows.mjs           # dry run
//   node scripts/delete-old-test-rows.mjs --commit
//   unset PROD_DATABASE_URL
import postgres from "postgres";

const url = process.env.PROD_DATABASE_URL;
if (!url) {
  console.error("PROD_DATABASE_URL is not set. See the header of this file.");
  process.exit(1);
}

const commit = process.argv.includes("--commit");

// Orders placed by a real person that must never be touched, whatever else
// matches. bc7bbb09 is the real live AED 390 payment.
const PROTECTED = ["bc7bbb09-3846-4acb-a8bf-6cab7eaa2c4b"];

const TEST_EMAILS = ["stripetest@example.com", "finaltest@example.com", "finaltest2@example.com"];

const sql = postgres(url, { ssl: "require" });

const host = url.replace(/^[a-z]+:\/\/[^@]*@/, "").split("/")[0];
console.log(`database host : ${host}`);
console.log(`mode          : ${commit ? "COMMIT" : "dry run"}\n`);

// A row qualifies if it was placed by a throwaway test email OR it was paid
// through a Stripe TEST session. Both are pre-launch artefacts.
const targets = await sql`
  SELECT o.id, o.status, o.total_aed, o.stripe_session_id, o.created_at, c.email
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE (c.email = ANY(${TEST_EMAILS}) OR o.stripe_session_id LIKE 'cs_test_%')
    AND o.id <> ALL(${PROTECTED})
  ORDER BY o.created_at
`;

console.log(`${commit ? "DELETING" : "would delete"} ${targets.length} order(s):`);
for (const t of targets) {
  console.log(
    `  ${t.created_at?.toISOString().slice(0, 16)}  ${t.status.padEnd(15)} AED ${String(t.total_aed).padEnd(8)} ${String(t.email).padEnd(26)} ${t.stripe_session_id ? t.stripe_session_id.slice(0, 16) : "no-session"}  ${t.id}`,
  );
}

// Anything left afterwards -- so a mistake is visible before it is committed.
const survivors = await sql`
  SELECT o.id, o.status, o.total_aed, c.email
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE NOT ((c.email = ANY(${TEST_EMAILS}) OR o.stripe_session_id LIKE 'cs_test_%')
             AND o.id <> ALL(${PROTECTED}))
  ORDER BY o.created_at
`;
console.log(`\nwould KEEP ${survivors.length} order(s):`);
for (const s of survivors) {
  console.log(`  ${s.status.padEnd(15)} AED ${String(s.total_aed).padEnd(8)} ${s.email}  ${s.id}`);
}

if (targets.some((t) => PROTECTED.includes(t.id))) {
  console.error("\nREFUSING: a protected order matched the delete set.");
  await sql.end();
  process.exit(1);
}
if (!survivors.some((s) => PROTECTED.includes(s.id))) {
  console.error("\nREFUSING: the real live order is not in the keep set. Check the query.");
  await sql.end();
  process.exit(1);
}

if (!commit) {
  console.log("\nDry run. Re-run with --commit to apply.");
  await sql.end();
  process.exit(0);
}

const ids = targets.map((t) => t.id);
await sql.begin(async (tx) => {
  const items = await tx`DELETE FROM order_items WHERE order_id = ANY(${ids}) RETURNING id`;
  const orders = await tx`DELETE FROM orders WHERE id = ANY(${ids}) RETURNING id`;
  // Only remove customers that no longer have any order at all.
  const custs = await tx`
    DELETE FROM customers c
    WHERE c.email = ANY(${TEST_EMAILS})
      AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
    RETURNING id`;
  console.log(`\nDeleted ${items.length} order_items, ${orders.length} orders, ${custs.length} customers.`);
});

const [{ n }] = await sql`SELECT count(*)::int AS n FROM orders`;
console.log(`orders remaining: ${n}`);

await sql.end();
