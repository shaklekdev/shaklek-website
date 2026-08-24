import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import OrderStatusButtons from "@/components/OrderStatusButtons";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  pending_payment: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  payment_failed: "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200",
  in_progress: "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200",
  shipped: "bg-violet-50 text-violet-800 ring-1 ring-inset ring-violet-200",
  canceled: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300",
};

// TAILOR_WHATSAPP_NUMBER is the tailor's own number (E.164, no "+", e.g.
// "9715XXXXXXXX") -- separate from the customer-facing wa.me link in
// Footer.tsx, which goes to the business number instead. "Send to tailor"
// only opens a chat with a prefilled text summary; it doesn't attach the
// PDF (wa.me has no file-attach param) -- staff download "Spec sheet"
// first, then manually attach it once the chat opens.
const tailorNumber = (process.env.TAILOR_WHATSAPP_NUMBER ?? "").trim();

function tailorMessage(order: { id: string; items: { name: string; fabric: string | null; color: string | null; size: string | null }[] }) {
  const itemsLine = order.items
    .map((i) => `${i.name} (${i.fabric ?? "?"}, ${i.color ?? "?"}, ${i.size ?? "made to measure"})`)
    .join("; ");
  return `Shaklek order SHK-${order.id.slice(0, 8).toUpperCase()}: ${itemsLine}. Tech pack attached.`;
}

async function getOrders() {
  const db = getDb();
  if (!db) return null;

  const orders = await db
    .select()
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .orderBy(desc(schema.orders.createdAt));

  const items = await db.select().from(schema.orderItems);

  return orders.map((row) => ({
    id: row.orders.id,
    status: row.orders.status,
    total: Number(row.orders.totalAed),
    method: row.orders.paymentMethod,
    email: row.customers.email,
    createdAt: row.orders.createdAt,
    shipping: {
      name: row.orders.shippingName,
      phone: row.orders.shippingPhone,
      line1: row.orders.shippingLine1,
      line2: row.orders.shippingLine2,
      city: row.orders.shippingCity,
      state: row.orders.shippingState,
      postalCode: row.orders.shippingPostalCode,
      country: row.orders.shippingCountry,
    },
    items: items.filter((i) => i.orderId === row.orders.id),
  }));
}

export default async function OrdersDashboardPage() {
  const orders = await getOrders();

  return (
    <div className="flex flex-1 flex-col bg-slate-50 font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Staff only
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">Orders</h1>
            <p className="mt-1 max-w-lg text-sm text-slate-500">
              Every order that&apos;s been persisted to the database, newest first.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/trends"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              Trend review
            </Link>
            <Link
              href="/"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {orders === null ? (
          <p className="text-sm text-slate-500">
            Database not configured (<code>DATABASE_URL</code> unset).
          </p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer &amp; delivery</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Update</th>
                  <th className="px-4 py-3 font-medium">Tailor</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    {/* Short, quotable, and the same reference printed on the
                        tailor's spec sheet -- so a WhatsApp message about
                        SHK-BC7BBB09 matches a row here without pasting a UUID. */}
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-slate-900">
                      SHK-{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleString("en-AE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-slate-700">{order.email}</div>
                      {order.shipping.line1 ? (
                        <div className="mt-1 text-xs leading-snug text-slate-500">
                          {order.shipping.name ? <div>{order.shipping.name}</div> : null}
                          <div>{order.shipping.line1}</div>
                          {order.shipping.line2 ? <div>{order.shipping.line2}</div> : null}
                          <div>
                            {[order.shipping.city, order.shipping.state, order.shipping.postalCode]
                              .filter(Boolean)
                              .join(", ")}
                            {order.shipping.country ? ` · ${order.shipping.country}` : ""}
                          </div>
                          {order.shipping.phone ? <div>{order.shipping.phone}</div> : null}
                        </div>
                      ) : (
                        <div className="mt-1 text-xs font-medium text-amber-700">
                          No delivery address — contact the customer
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-slate-700">
                          {item.name}
                          {item.fabric ? ` · ${item.fabric}` : ""}
                          {item.color ? ` · ${item.color}` : ""}
                          {item.size ? ` · Size ${item.size}` : ""}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{order.method}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLE[order.status] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusButtons orderId={order.id} status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <a
                          href={`/api/dashboard/orders/${order.id}/spec-sheet`}
                          className="text-xs font-medium text-slate-600 underline hover:text-slate-900"
                        >
                          1. Download tech pack
                        </a>
                        {tailorNumber ? (
                          <a
                            href={`https://wa.me/${tailorNumber}?text=${encodeURIComponent(
                              tailorMessage(order),
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-emerald-700 underline hover:text-emerald-900"
                          >
                            2. Open WhatsApp chat
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400" title="Set TAILOR_WHATSAPP_NUMBER">
                            2. Open WhatsApp chat
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">3. Attach the PDF, send</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                      AED {order.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
