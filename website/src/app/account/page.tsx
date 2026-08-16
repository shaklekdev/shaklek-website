import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import Header from "@/components/Header";
import { getDb, schema } from "@/db/client";

const STATUS_LABEL: Record<string, string> = {
  paid: "Confirmed",
  pending_payment: "Awaiting payment",
  payment_failed: "Payment didn't go through",
};

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
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const orders = email ? await getOrdersForEmail(email) : null;

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-wide text-text-3 uppercase">My account</p>
            <h1 className="mt-1 text-[26px] text-text">Your orders</h1>
          </div>
          <UserButton />
        </div>

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
