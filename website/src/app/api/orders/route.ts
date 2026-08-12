import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

type OrderItem = {
  name: string;
  category?: string;
  fabric: string;
  color: string;
  size: string;
  measurements?: string;
  changes?: string[];
  freeformNotes?: string;
  price: number;
  previewImage?: string; // uploaded reference photo (data URL), if this item came from /upload
};

// Persists the order to Postgres. No RDS instance exists yet
// (aws-infrastructure-todo.md) — DATABASE_URL is unset until then, so
// getDb() returns null and this just logs, same as the email path below
// when RESEND_API_KEY is missing.
async function persistOrder(items: OrderItem[], method: string, total: number, email: string) {
  const db = getDb();
  if (!db) {
    console.log("[orders] DATABASE_URL not set — order not persisted to DB.");
    return;
  }

  const [customer] = await db
    .insert(schema.customers)
    .values({ email })
    .onConflictDoNothing({ target: schema.customers.email })
    .returning();

  const customerRow =
    customer ??
    (await db.select().from(schema.customers).where(eq(schema.customers.email, email)))[0];

  const [orderRow] = await db
    .insert(schema.orders)
    .values({
      customerId: customerRow.id,
      totalAed: String(total),
      paymentMethod: method,
    })
    .returning();

  await db.insert(schema.orderItems).values(
    items.map((item) => ({
      orderId: orderRow.id,
      name: item.name,
      category: item.category,
      fabric: item.fabric,
      color: item.color,
      size: item.size,
      measurements: item.measurements,
      changes: item.changes ?? [],
      freeformNotes: item.freeformNotes,
      priceAed: String(item.price),
      hasReferenceImage: Boolean(item.previewImage),
    })),
  );
}

// Sends the stylist-handoff notification for a new order (one or more
// items from the cart, from the catalog and/or uploaded references).
//
// Needs RESEND_API_KEY to actually send (sign up at resend.com, verify
// the shaklek.com domain, and set the key as an env var). Without it,
// this logs the order instead of throwing, so checkout still works —
// but no one actually gets notified until a real key is set.
export async function POST(req: NextRequest) {
  const order = await req.json();
  const { items, method, total, email } = order as {
    items: OrderItem[];
    method: string;
    total: number;
    email: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "No items in order" }, { status: 400 });
  }

  try {
    await persistOrder(items, method, total, email);
  } catch (err) {
    // A DB write failure shouldn't block the order from being emailed —
    // the email is still the source of truth until this is fully proven out.
    console.error("[orders] Failed to persist order to DB:", err);
  }

  const itemLines = items
    .map((item, i) => {
      const parts = [`${i + 1}. ${item.name} — ${item.fabric}, ${item.color}, size ${item.size}, AED ${item.price}`];
      if (item.measurements) parts.push(`   Measurements: ${item.measurements}`);
      if (item.changes && item.changes.length) parts.push(`   Changes: ${item.changes.join(", ")}`);
      if (item.freeformNotes) parts.push(`   Note: "${item.freeformNotes}"`);
      if (item.previewImage) parts.push(`   (reference photo attached)`);
      return parts.join("\n");
    })
    .join("\n");

  const summary = `New order (${items.length} ${items.length === 1 ? "item" : "items"}) from ${email}, AED ${total} via ${method}\n${itemLines}`;

  const attachments = items
    .filter((item) => item.previewImage)
    .map((item, i) => ({
      filename: `reference-${i + 1}.jpg`,
      content: item.previewImage!.split(",")[1] ?? "",
    }));

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[orders] RESEND_API_KEY not set — order not emailed. Details:");
    console.log(summary);
    return NextResponse.json({ ok: true, emailed: false });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Shaklek Orders <orders@shaklek.com>",
      to: "orders@shaklek.com",
      reply_to: email,
      subject: `New order — ${items.length} ${items.length === 1 ? "item" : "items"}`,
      text: summary,
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[orders] Resend API call failed:", await res.text());
    return NextResponse.json({ ok: true, emailed: false });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
