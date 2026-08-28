import { getVerifiedEmail } from "@/lib/authEmail";
import { desc, eq, sql } from "drizzle-orm";
import Header from "@/components/Header";
import { SignOutButton } from "@clerk/nextjs";
import AccountNameForm from "@/components/AccountNameForm";
import MeasurementsForm from "@/components/MeasurementsForm";
import AccountFitFeedback from "@/components/AccountFitFeedback";
import { fitFeedbackLines } from "@/data/fitFeedback";
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

/** Every entry she has sent from /fit, newest first, each with the order it
 *  was about. Read here rather than through an API route because this page is
 *  already a server component holding her verified email -- a fetch would only
 *  add a round trip and a second place to get the authorization wrong. */
async function getFitFeedbackForEmail(email: string) {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: schema.fitFeedback.id,
      answers: schema.fitFeedback.answers,
      note: schema.fitFeedback.note,
      createdAt: schema.fitFeedback.createdAt,
      orderId: schema.fitFeedback.orderId,
    })
    .from(schema.fitFeedback)
    .innerJoin(schema.customers, eq(schema.fitFeedback.customerId, schema.customers.id))
    // lower(), matching the write. A guest checkout stores the address exactly
    // as typed while Clerk hands us a normalised one, so a case-sensitive
    // match here would hide a customer's own notes from her -- and the delete
    // below would then report success while removing nothing.
    .where(sql`lower(${schema.customers.email}) = ${email.toLowerCase()}`)
    .orderBy(desc(schema.fitFeedback.createdAt))
    // Bounded. This renders every row it fetches, on the same page as her
    // orders and measurements, and the table it reads is append-only with an
    // unauthenticated writer. Newest first, so the cap drops the oldest.
    .limit(50);

  return rows.flatMap((r) => {
    try {
      const parsed: unknown = JSON.parse(r.answers);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
      return [{
        id: r.id,
        lines: fitFeedbackLines(parsed as Record<string, string>),
        note: r.note,
        at: r.createdAt.toISOString().slice(0, 10),
        // Same short reference the tech pack and the confirmation email use, so
        // she and the workshop are naming the same order.
        orderRef: r.orderId ? r.orderId.slice(0, 8).toUpperCase() : null,
      }];
    } catch {
      // One unreadable row must not blank the whole section.
      return [];
    }
  });
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
  const fitFeedback = email ? await getFitFeedbackForEmail(email) : [];

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        {/* Sign out lives here now.
            It used to be inside Clerk's <UserButton> in the header, which was
            removed because Header renders on every page and pulling Clerk into
            it cost 356KB sitewide (see components/AuthProvider.tsx). /account
            is the only page a signed-in customer has, so it is the right home
            for the one action that only a signed-in customer can take. */}
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs tracking-wide text-text-3 uppercase">My account</p>
          <SignOutButton redirectUrl="/">
            <button className="text-xs text-text-3 underline underline-offset-4 transition-colors hover:text-text">
              Sign out
            </button>
          </SignOutButton>
        </div>
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

        {fitFeedback.length > 0 && <AccountFitFeedback entries={fitFeedback} />}

        <h2 className="mt-8 text-lg text-text">Your orders</h2>

        {orders === null ? (
          <p className="subtitle mt-6">Nothing to show yet — database not configured.</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="subtitle">No orders yet under {email}.</p>
            <a
              href="/catalog"
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
