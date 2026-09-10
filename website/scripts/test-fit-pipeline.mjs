// Proves the /api/fit-feedback insert attributes a submission to the right
// garment, and that it still finds an order once fulfilment moves past 'paid'.
//
// Run: node scripts/test-fit-pipeline.mjs   (uses the DEV branch in .env.local)
//
// ⚠️ WHY THIS EXISTS RATHER THAN A UNIT TEST. The behaviour under test is a
// single SQL statement -- it has to be, because a security review found a
// customer-list oracle rebuilt out of the LATENCY of doing it in several. So
// there is nothing to unit test; the statement either attributes correctly in
// Postgres or it does not.
//
// ⚠️ AND WHY THE STATUS LIST IS ASSERTED. The filter read `o.status = 'paid'`
// until 2026-09-05. That was correct only while 'paid' was where an order sat
// forever. The day the founder started marking parcels delivered it would have
// matched nothing, and the survey would have gone quietly dead for exactly the
// customers who had received something -- no error, no alarm, just no rows.
// The "canceled order is skipped and a delivered one is found" case is that
// trap, pinned.
//
// Everything runs inside one transaction that is rolled back, so dev is left
// exactly as it was found. It never touches production -- CLAUDE.md forbids
// test orders there, and the external audit that left real Stripe sessions in
// the live database is why.
import postgres from "postgres";
import { readFileSync } from "fs";
const url = readFileSync(".env.local","utf8").match(/^DATABASE_URL=(.+)$/m)[1].replace(/^["']|["']$/g,"");
// ⚠️ REFUSE ANYTHING THAT IS NOT DEV, the same way db-migrate.mjs does. This
// script INSERTS customers and orders. The rollback is what makes it safe, but
// the rollback is not what makes it safe to point at production -- CLAUDE.md
// forbids test orders there, and .env.local silently pointing at the wrong
// branch is the exact mistake that caused the 2026-08-28 outage.
const host = new URL(url).hostname;
if (!host.startsWith("ep-jolly-cloud")) {
  console.error(`REFUSING: expected the dev branch (ep-jolly-cloud), got ${host}`);
  process.exit(1);
}
const sql = postgres(url,{ssl:"require",max:1});
console.log("host:", host);
let fail = 0;
const check = (c,m) => { if(!c){ console.error("FAIL:",m); fail++; } else console.log("  ok -",m); };

// The statement under test, copied in shape from the route.
const insert = (tx, email, cat) => tx`
  insert into fit_feedback (customer_id, order_id, order_item_id, answers, note)
  select o.customer_id, o.id,
    (select oi.id from order_items oi
      where oi.order_id = o.id and oi.category = ${cat}
      order by oi.id limit 1),
    ${'{"length":"short"}'}, ${null}
  from orders o
  join customers c on c.id = o.customer_id
  where lower(c.email) = ${email}
    and o.status in ('paid','in_progress','shipped','delivered')
    and (select count(*) from fit_feedback f where f.customer_id = o.customer_id) < 100
  order by o.delivered_at desc nulls last, o.created_at desc
  limit 1
  returning order_id, order_item_id`;

try {
  await sql.begin(async (tx) => {
    const email = "attrib-test@example.invalid";
    const [cust] = await tx`insert into customers (email) values (${email}) returning id`;
    // Older order, delivered LAST WEEK. Newer order, paid but never shipped.
    const [older] = await tx`insert into orders (customer_id,total_aed,payment_method,status,delivered_at,created_at)
      values (${cust.id},'800','card','delivered', now() - interval '2 days', now() - interval '20 days') returning id`;
    const [newer] = await tx`insert into orders (customer_id,total_aed,payment_method,status,created_at)
      values (${cust.id},'389','card','paid', now() - interval '1 day') returning id`;
    const [shirtItem] = await tx`insert into order_items (order_id,name,category,price_aed)
      values (${older.id},'Oversized Shirt','Shirt','389') returning id`;
    const [pantsItem] = await tx`insert into order_items (order_id,name,category,price_aed)
      values (${older.id},'Cargo Trousers','Pants','429') returning id`;
    await tx`insert into order_items (order_id,name,category,price_aed)
      values (${newer.id},'Structured Blouse','Shirt','389')`;

    let [r] = await insert(tx, email, "Pants");
    check(r && r.order_id === older.id, "picks the DELIVERED parcel, not the newer unshipped order");
    check(r && r.order_item_id === pantsItem.id, "trousers answer attaches to the trousers item");

    [r] = await insert(tx, email, "Shirt");
    check(r && r.order_item_id === shirtItem.id, "shirt answer attaches to the shirt item in the same order");

    [r] = await insert(tx, email, null);
    check(r && r.order_item_id === null, "skipping the question stores the order with no item, not a guess");

    [r] = await insert(tx, email, "Dress");
    check(r && r.order_item_id === null, "a category this order does not contain stores null, never a wrong item");

    // The regression guard: an order that has moved past 'paid' must still match.
    await tx`update orders set status='delivered' where id=${newer.id}`;
    await tx`update orders set status='canceled', delivered_at=null where id=${older.id}`;
    [r] = await insert(tx, email, "Shirt");
    check(r && r.order_id === newer.id, "a canceled order is skipped and a delivered one is found");

    [r] = await insert(tx, "nobody-here@example.invalid", "Shirt");
    check(r === undefined, "an unknown email inserts nothing");

    throw new Error("ROLLBACK");
  });
} catch (e) {
  if (e.message !== "ROLLBACK") throw e;
}
// --- the fit guarantee: spending it, not moving it, giving it back ---------
//
// The columns existed from 2026-09-05 and nothing wrote them until now, so
// "ONE free alteration or remake" was still unenforceable. These assert the
// three properties the route claims.
try {
  await sql.begin(async (tx) => {
    const email = "remake-test@example.invalid";
    const [cust] = await tx`insert into customers (email) values (${email}) returning id`;
    const [ordA] = await tx`insert into orders (customer_id,total_aed,payment_method,status,delivered_at)
      values (${cust.id},'878','card','delivered', now() - interval '3 days') returning id`;
    const [ordB] = await tx`insert into orders (customer_id,total_aed,payment_method,status)
      values (${cust.id},'449','card','paid') returning id`;
    const [shirt] = await tx`insert into order_items (order_id,name,category,price_aed)
      values (${ordA.id},'Oversized Shirt','Shirt','449') returning id`;
    const [pants] = await tx`insert into order_items (order_id,name,category,price_aed)
      values (${ordA.id},'Cargo Trousers','Pants','429') returning id`;
    const [other] = await tx`insert into order_items (order_id,name,category,price_aed)
      values (${ordB.id},'Structured Blouse','Shirt','449') returning id`;

    const mark = (itemId, orderId, used) => used
      ? tx`update order_items set fit_remake_used_at = coalesce(fit_remake_used_at, now())
           where id=${itemId} and order_id=${orderId} returning fit_remake_used_at`
      : tx`update order_items set fit_remake_used_at = null
           where id=${itemId} and order_id=${orderId} returning fit_remake_used_at`;

    let [r] = await mark(shirt.id, ordA.id, true);
    check(r && r.fit_remake_used_at instanceof Date, "marking the shirt used stamps a date");
    const first = r.fit_remake_used_at;

    const [sib] = await tx`select fit_remake_used_at from order_items where id=${pants.id}`;
    check(sib.fit_remake_used_at === null,
      "spending the shirt's remake did NOT spend the trousers' -- the promise is per garment");

    [r] = await mark(shirt.id, ordA.id, true);
    check(r && +r.fit_remake_used_at === +first,
      "clicking used twice does not move the date to the second click");

    [r] = await mark(shirt.id, ordA.id, false);
    check(r && r.fit_remake_used_at === null, "undo gives the guarantee back");

    // The order id is part of the WHERE for a reason.
    const wrong = await mark(other.id, ordA.id, true);
    check(wrong.length === 0, "an item from another order cannot be spent through this order");
    const [untouched] = await tx`select fit_remake_used_at from order_items where id=${other.id}`;
    check(untouched.fit_remake_used_at === null, "and that item was genuinely left alone");

    // --- the gates: an obligation cannot start before it is possible --------
    const [unpaid] = await tx`insert into orders (customer_id,total_aed,payment_method,status)
      values (${cust.id},'449','card','pending_payment') returning id`;
    const [unpaidItem] = await tx`insert into order_items (order_id,name,category,price_aed)
      values (${unpaid.id},'Oversized Shirt','Shirt','449') returning id`;

    // Mirrors the status route's guarded UPDATE.
    const markDelivered = (orderId) => tx`
      update orders set status='delivered', delivered_at = coalesce(delivered_at, now())
      where id=${orderId} and status in ('paid','in_progress','shipped','delivered')
      returning id`;
    let g = await markDelivered(unpaid.id);
    check(g.length === 0, "an unpaid order cannot be marked delivered");
    g = await markDelivered(ordB.id);
    check(g.length === 1, "a paid order can be marked delivered");

    // Mirrors the remake route's guarded UPDATE.
    const spend = (itemId, orderId) => tx`
      update order_items set fit_remake_used_at = coalesce(fit_remake_used_at, now())
      where id=${itemId} and order_id=${orderId}
        and exists (select 1 from orders o where o.id = order_items.order_id and o.delivered_at is not null)
      returning fit_remake_used_at`;
    let sp = await spend(unpaidItem.id, unpaid.id);
    check(sp.length === 0, "a guarantee cannot be spent on an undelivered parcel");
    sp = await spend(other.id, ordB.id);
    check(sp.length === 1, "and it can once that order is delivered");

    // Clearing must work regardless, so a promise can always be given back.
    const back = await tx`update order_items set fit_remake_used_at = null
      where id=${unpaidItem.id} and order_id=${unpaid.id} returning id`;
    check(back.length === 1, "clearing is never gated -- a promise can always be returned");

    throw new Error("ROLLBACK");
  });
} catch (e) {
  if (e.message !== "ROLLBACK") throw e;
}


const [{ count }] = await sql`select count(*)::int from customers where email like '%example.invalid'`;
console.log(`\nleftover test rows: ${count} (must be 0)`);
if (count !== 0) fail++;
console.log(fail === 0 ? "\nok - attribution and the fit guarantee behave as described" : `\n${fail} failure(s)`);
await sql.end();
process.exit(fail === 0 ? 0 : 1);
