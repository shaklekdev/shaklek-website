// Does every payment Stripe took have a complete order in our database?
//
// WHY THIS EXISTS. An order is only marked paid, and only gets its shipping
// address, when Stripe's webhook reaches us. Stripe retries a failing webhook
// for about three days and then stops. If it never lands, the customer has
// been charged and our database still says pending_payment with nowhere to
// ship to -- money taken, order invisible, and NOTHING currently notices.
// CloudWatch cannot see this: the site is healthy, it is the data that is
// wrong.
//
// Read-only. Prints no email, name, address or measurement -- order ids and
// Stripe ids only, per the PII rule in CLAUDE.md section 0.
//
//   PROD_DB="$(aws amplify get-app --app-id dqcptedylrif0 \
//     --query 'app.environmentVariables.DATABASE_URL' --output text)" \
//   STRIPE_KEY="$(aws amplify get-app --app-id dqcptedylrif0 \
//     --query 'app.environmentVariables.STRIPE_SECRET_KEY' --output text)" \
//   npx tsx scripts/reconcile-orders.mjs
import postgres from "postgres";

const { PROD_DB, STRIPE_KEY } = process.env;
if (!PROD_DB || !STRIPE_KEY) {
  console.error("Set PROD_DB and STRIPE_KEY (see the header of this file).");
  process.exit(2);
}

async function stripe(path) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${STRIPE_KEY}` },
  });
  if (!res.ok) throw new Error(`Stripe ${path}: ${res.status}`);
  return res.json();
}

const sql = postgres(PROD_DB, { max: 1 });
const rows = await sql`
  SELECT id, status, stripe_session_id, total_aed,
         shipping_line1 IS NOT NULL AS has_addr
  FROM orders WHERE stripe_session_id IS NOT NULL`;

const problems = [];
for (const o of rows) {
  let session;
  try {
    session = await stripe(`checkout/sessions/${o.stripe_session_id}`);
  } catch {
    problems.push([o.id, "session not found in Stripe", o.status]);
    continue;
  }
  const reallyPaid = session.payment_status === "paid";
  const weSayPaid = o.status !== "pending_payment" && o.status !== "payment_failed";

  // The dangerous one: Stripe took money, our records do not show it.
  if (reallyPaid && !weSayPaid)
    problems.push([o.id, `PAID IN STRIPE but our status is "${o.status}"`, "MONEY TAKEN, ORDER NOT RECORDED"]);
  // The inverse: we think it is paid and Stripe disagrees.
  if (!reallyPaid && weSayPaid)
    problems.push([o.id, `our status is "${o.status}" but Stripe says "${session.payment_status}"`, ""]);
  // Paid with no address is unshippable, whatever the cause.
  if (reallyPaid && !o.has_addr)
    problems.push([o.id, "paid but NO SHIPPING ADDRESS stored", "cannot be shipped"]);
}

console.log(`checked ${rows.length} orders that reached Stripe\n`);
if (problems.length === 0) {
  console.log("  OK — every Stripe payment has a matching, shippable order.");
} else {
  for (const [id, what, note] of problems) console.log(`  ${id}  ${what}${note ? `  (${note})` : ""}`);
  console.log(`\n  ${problems.length} problem(s).`);
}
await sql.end();
process.exit(problems.length ? 1 : 0);
