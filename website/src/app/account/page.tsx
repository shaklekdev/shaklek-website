import { getVerifiedEmail } from "@/lib/authEmail";
import { desc, eq } from "drizzle-orm";
import Header from "@/components/Header";
import AccountNameForm from "@/components/AccountNameForm";
import MeasurementsForm from "@/components/MeasurementsForm";
import { getDb, schema } from "@/db/client";
import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = NOINDEX;

const STATUS_LABEL: Record<string, string> = {
  paid: "Confirmed",
  pending_payment: "Awaiting payment",
  payment_failed: "Payment didn't go through",
  in_progress: "Being tailored",
  shipped: "Shipped",
  canceled: "Canceled",
};

async function getNameForEmail(email: string) {
  const db = getDb();
  if (!db) return null;
  const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.email, email));
  return customer?.name ?? null;
}

async function getOrdersForEmail(email: string) {
  const db = getDb();
  if (!db) return null;

  const orders = await db
    .select()
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.customers.email, email))
    .orderBy(desc(schema.orders.createdAt));

  const items = await db.select().from(schema.orderItems);

  return orders.map((row) => ({
    id: row.orders.id,
    status: row.orders.status,
    total: Number(row.orders.totalAed),
    createdAt: row.orders.createdAt,
    items: items.filter((i) => i.orderId === row.orders.id),
  }));
}

export default async function AccountPage() {
  const email = await getVerifiedEmail();
  const name = email ? await getNameForEmail(email) : null;
  const orders = email ? await getOrdersForEmail(email) : null;

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <p className="text-xs tracking-wide text-text-3 uppercase">My account</p>
        <h1 className="mt-1 text-[26px] text-text">{name || "Your account"}</h1>

        <div className="mt-4 rounded-shaklek-sm border border-border bg-surface p-5">
          <p className="text-xs text-text-3">Email</p>
          <p className="mt-0.5 text-sm text-text">{email}</p>
          <p className="mt-3 text-xs text-text-3">
            Forgot your password? You can reset it from the{" "}
            <a href="/sign-in" className="underline hover:text-text-2">
              sign-in page
            </a>
            .
          </p>
        </div>

        {!name && <AccountNameForm />}

        <div className="mt-4">
          <MeasurementsForm />
        </div>

        <h2 className="mt-8 text-lg text-text">Your orders</h2>

        {orders === null ? (
          <p className="subtitle mt-6">Nothing to show yet — database not configured.</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="subtitle">No orders yet under {email}.</p>
            <a
              href="/"
              className="mt-6 inline-block rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
            >
              Browse the catalog
            </a>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-shaklek-sm border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-text-3">
                      {new Date(order.createdAt).toLocaleDateString("en-AE", {
                        dateStyle: "medium",
                      })}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gold">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </p>
                  </div>
                  <p className="font-display text-lg text-text">AED {order.total}</p>
                </div>
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm text-text-2">
                      {item.name} — {item.fabric} · {item.color} · Size {item.size}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
