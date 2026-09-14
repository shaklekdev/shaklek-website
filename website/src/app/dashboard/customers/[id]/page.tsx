import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { orderRef } from "@/lib/orderRef";
import { isUuid } from "@/lib/requestGuards";
import MeasurementSheet from "@/components/MeasurementSheet";
import { requireStaff } from "@/lib/requireStaff";

export const dynamic = "force-dynamic";

/**
 * One customer: her measurements, her orders, and her feedback.
 *
 * Founder, 2026-09-15: "literally a view on every single customer, their
 * measurements, latest orders, complaints, etc, we want to track everything."
 *
 * ⚠️ "COMPLAINTS" IS NOT A FIELD, it is the feedback survey. Her answer when
 * asked: "for compliants or any feedback, we collect this from feedback
 * survey." So this reads fit_feedback rather than adding a box for staff to
 * type an opinion into. The difference matters: one is what the customer said,
 * the other is what we remember her saying.
 */
async function getCustomer(id: string) {
  // ⚠️ THE STAFF CHECK LIVES HERE, NOT IN THE LAYOUT. A layout does not stop
  // this function from running, and its result is embedded in the RSC payload
  // inside the HTML the refusal screen ships in. See src/lib/requireStaff.ts.
  await requireStaff();

  const db = getDb();
  if (!db) return null;

  const [customer] = await db
    .select()
    .from(schema.customers)
    .where(eq(schema.customers.id, id))
    .limit(1);
  if (!customer) return null;

  const orders = await db
    .select({
      id: schema.orders.id,
      status: schema.orders.status,
      createdAt: schema.orders.createdAt,
      totalAed: schema.orders.totalAed,
    })
    .from(schema.orders)
    .where(eq(schema.orders.customerId, id))
    .orderBy(desc(schema.orders.createdAt))
    .limit(20);

  const feedback = await db
    .select({
      id: schema.fitFeedback.id,
      answers: schema.fitFeedback.answers,
      note: schema.fitFeedback.note,
      createdAt: schema.fitFeedback.createdAt,
    })
    .from(schema.fitFeedback)
    .where(eq(schema.fitFeedback.customerId, id))
    .orderBy(desc(schema.fitFeedback.createdAt))
    .limit(20);

  return { customer, orders, feedback };
}

const fmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

/** A bad row must not take the page down, so it is skipped, not raised. The
 *  same guard the spec sheet needed: JSON.parse returns null for "null" and
 *  every property read after that throws. */
function parseAnswers(raw: string): Record<string, string> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, string>;
  } catch {
    return null;
  }
}

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // A non-uuid would reach Postgres as a cast error and surface as a 500.
  if (!isUuid(id)) notFound();

  const data = await getCustomer(id);
  if (!data) notFound();
  const { customer, orders, feedback } = data;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Link href="/dashboard/customers" className="text-sm text-slate-500 underline underline-offset-2">
        All customers
      </Link>

      <h1 className="mt-3 text-xl font-medium text-slate-900">
        {customer.name?.trim() || customer.email}
      </h1>
      {customer.name?.trim() ? (
        <p className="text-sm text-slate-500">{customer.email}</p>
      ) : null}

      <MeasurementSheet
        customerId={customer.id}
        measuredAt={customer.measuredAt}
        initial={{
          measurementWaist: customer.measurementWaist,
          measurementHip: customer.measurementHip,
          measurementBust: customer.measurementBust,
          measurementStomach: customer.measurementStomach,
          measurementShoulder: customer.measurementShoulder,
          measurementNeck: customer.measurementNeck,
          measurementThigh: customer.measurementThigh,
          measurementCrotch: customer.measurementCrotch,
          measurementShirtLength: customer.measurementShirtLength,
          measurementSleeveLength: customer.measurementSleeveLength,
          measurementTrouserLength: customer.measurementTrouserLength,
          measurementHeight: customer.measurementHeight,
          measurementFittingNotes: customer.measurementFittingNotes,
        }}
      />

      {/* What SHE typed, kept apart from what we measured. It is the only
          record of what the customer thought before anyone met her. */}
      {customer.measurementNotes?.trim() ? (
        <section className="mt-6">
          <h2 className="text-base font-medium text-slate-900">Her own note</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {customer.measurementNotes}
          </p>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-base font-medium text-slate-900">Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No orders yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {orders.map((o) => (
              <li key={o.id} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                <Link
                  href="/dashboard/orders"
                  className="font-medium text-slate-900 underline underline-offset-2"
                >
                  {orderRef(o.id)}
                </Link>
                <span className="text-slate-600">{o.status}</span>
                <span className="text-slate-500">{fmt(o.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-base font-medium text-slate-900">Feedback</h2>
        <p className="mt-1 text-xs text-slate-500">
          From the fit survey. Nobody types into this; it is what she told us.
        </p>
        {feedback.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Nothing yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {feedback.map((f) => {
              const answers = parseAnswers(f.answers);
              return (
                <li key={f.id} className="border-l-2 border-slate-200 pl-3">
                  <p className="text-xs text-slate-500">{fmt(f.createdAt)}</p>
                  {answers ? (
                    <dl className="mt-1 space-y-0.5 text-sm">
                      {Object.entries(answers).map(([q, a]) => (
                        <div key={q} className="flex gap-2">
                          <dt className="text-slate-500">{q}:</dt>
                          <dd className="text-slate-800">{a}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {f.note?.trim() ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{f.note}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
