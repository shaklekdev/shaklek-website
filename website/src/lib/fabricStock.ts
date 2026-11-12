import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { STOCK_METRES, STOCK_SINCE, metresFor, stockFor } from "@/data/fabricStock";

type Db = NonNullable<ReturnType<typeof getDb>>;
// Anything with .execute -- the db itself or a transaction handle.
type Exec = Pick<Db, "execute">;

// WHICH ORDERS HOLD FABRIC. Everything placed since STOCK_SINCE except the two
// states that will never be made: payment_failed (Stripe session expired or
// was abandoned -- set by the webhook) and canceled (set by staff). A
// pending_payment order holds its fabric while the customer is on Stripe's
// page, but only for 36 minutes: /api/orders sets the Stripe session to expire
// after 31 (security review 2026-11-12 -- the 24h default let scripted unpaid
// checkouts make every colour read sold out). The extra 5 minutes keep the
// hold longer than the session, so a payment completed in the last second
// still finds its fabric reserved; a webhook that never arrives cannot lock
// cloth for more than 36 minutes.
async function usedMetresByColor(db: Exec): Promise<Record<string, number>> {
  const rows = (await db.execute(sql`
    select oi.color as color, oi.category as category, count(*)::int as n
    from order_items oi
    join orders o on o.id = oi.order_id
    where o.created_at >= ${STOCK_SINCE}::timestamptz
      and o.status not in ('payment_failed', 'canceled')
      and (o.status <> 'pending_payment' or o.created_at > now() - interval '36 minutes')
    group by oi.color, oi.category
  `)) as unknown as { color: string | null; category: string | null; n: number }[];
  const used: Record<string, number> = {};
  for (const r of rows) {
    if (!r.color) continue;
    used[r.color] = (used[r.color] ?? 0) + Number(r.n) * metresFor(r.category);
  }
  return used;
}

export async function availableMetresByColor(db: Exec): Promise<Record<string, number>> {
  const used = await usedMetresByColor(db);
  const out: Record<string, number> = {};
  for (const color of Object.keys(STOCK_METRES)) out[color] = stockFor(color) - (used[color] ?? 0);
  return out;
}

export class SoldOutError extends Error {
  constructor(public color: string) {
    super(`sold out: ${color}`);
  }
}

// Called INSIDE the order transaction, before the rows are written. The
// advisory lock serialises every checkout through this check, so two people
// buying the last abaya's worth of Navy at the same second cannot both pass:
// the second waits, then sees the first one's rows. Released at commit.
export async function reserveFabricOrThrow(
  tx: Exec,
  lines: { color: string; category: string | null | undefined; quantity: number }[],
) {
  // A hung transaction must not stall every checkout: give up after 5s, which
  // surfaces as the route's generic 500 -- no order row, no charge.
  await tx.execute(sql`set local lock_timeout = '5s'`);
  await tx.execute(sql`select pg_advisory_xact_lock(4711011)`);
  const available = await availableMetresByColor(tx);
  const need: Record<string, number> = {};
  for (const l of lines) need[l.color] = (need[l.color] ?? 0) + l.quantity * metresFor(l.category);
  for (const [color, metres] of Object.entries(need)) {
    if (!Object.hasOwn(available, color) || metres > available[color] + 1e-9) throw new SoldOutError(color);
  }
}
