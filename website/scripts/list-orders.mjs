// Read-only inventory of the orders table, so we can see exactly what the
// 2026-08-23 external security audit left behind before deciding what to
// remove. Prints only; deletes nothing.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
if (!url) {
  console.error("DATABASE_URL not found in website/.env.local");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require" });

const rows = await sql`
  SELECT o.id,
         o.status,
         o.total_aed,
         o.payment_method,
         o.shipping_name,
         o.stripe_session_id,
         o.created_at,
         c.email,
         c.name AS customer_name,
         (SELECT count(*) FROM order_items i WHERE i.order_id = o.id) AS item_count
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  ORDER BY o.created_at ASC
`;

console.log(`orders: ${rows.length}\n`);
for (const r of rows) {
  console.log(
    [
      r.created_at?.toISOString().slice(0, 16),
      r.status.padEnd(15),
      `AED ${String(r.total_aed).padEnd(8)}`,
      `${r.item_count} item(s)`,
      r.email,
      r.shipping_name ? `ship:${r.shipping_name}` : "no-address",
      r.stripe_session_id ?? "no-session",
      r.id,
    ].join("  "),
  );
}

const customers = await sql`SELECT id, email, name, created_at FROM customers ORDER BY created_at ASC`;
console.log(`\ncustomers: ${customers.length}\n`);
for (const c of customers) {
  console.log(c.created_at?.toISOString().slice(0, 16), c.email, "|", c.name ?? "(no name)", "|", c.id);
}

await sql.end();
