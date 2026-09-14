import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

/**
 * Every customer, and whether she has been measured.
 *
 * Founder, 2026-09-15: "this has to be saved in an admin view with literally a
 * view on every single customer, their measurements, latest orders, complaints,
 * etc, we want to track everything."
 *
 * THE ONE JOB OF THIS LIST is to answer "who still needs an appointment", so it
 * sorts UNMEASURED FIRST rather than newest first. A list ordered by signup date
 * looks tidier and answers a question nobody is asking.
 *
 * ⚠️ MEASUREMENT VALUES ARE NOT ON THIS PAGE, only whether they exist. There is
 * no reason to render seventeen numbers per row to decide who to call, and a
 * page that shows everybody's body on one screen is a worse thing to leave open
 * on a laptop in a cafe.
 */
async function getCustomers() {
  const db = getDb();
  if (!db) return null;

  return db
    .select({
      id: schema.customers.id,
      name: schema.customers.name,
      email: schema.customers.email,
      measuredAt: schema.customers.measuredAt,
      createdAt: schema.customers.createdAt,
      orderCount: sql<number>`count(distinct ${schema.orders.id})`.mapWith(Number),
      lastOrderAt: sql<Date | null>`max(${schema.orders.createdAt})`,
      feedbackCount: sql<number>`count(distinct ${schema.fitFeedback.id})`.mapWith(Number),
    })
    .from(schema.customers)
    .leftJoin(schema.orders, eq(schema.orders.customerId, schema.customers.id))
    .leftJoin(schema.fitFeedback, eq(schema.fitFeedback.customerId, schema.customers.id))
    .groupBy(schema.customers.id)
    // Nulls first: the people who still need a tape are the work.
    .orderBy(sql`${schema.customers.measuredAt} asc nulls first`, desc(schema.customers.createdAt));
}

const fmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

export default async function CustomersPage() {
  const rows = await getCustomers();

  if (!rows) {
    return <p className="p-6 text-sm text-slate-600">Database not configured.</p>;
  }

  const unmeasured = rows.filter((r) => !r.measuredAt).length;

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-medium text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">
          {rows.length} total
          {unmeasured > 0 ? ` · ${unmeasured} not measured yet` : null}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">
          No customers yet. A row appears here the first time somebody orders.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Measured</th>
                <th className="py-2 pr-4 font-medium">Orders</th>
                <th className="py-2 pr-4 font-medium">Last order</th>
                <th className="py-2 font-medium">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/dashboard/customers/${c.id}`}
                      className="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600"
                    >
                      {c.name?.trim() || c.email}
                    </Link>
                    {c.name?.trim() ? (
                      <span className="block text-xs text-slate-500">{c.email}</span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    {c.measuredAt ? (
                      <span className="text-slate-700">{fmt(c.measuredAt)}</span>
                    ) : (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
                        Not yet
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{c.orderCount}</td>
                  <td className="py-3 pr-4 text-slate-700">{fmt(c.lastOrderAt) ?? "—"}</td>
                  <td className="py-3 text-slate-700">{c.feedbackCount || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
