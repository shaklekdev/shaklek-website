import { NextRequest, NextResponse } from "next/server";

type OrderItem = {
  name: string;
  fabric: string;
  color: string;
  size: string;
  measurements?: string;
  changes?: string[];
  freeformNotes?: string;
  price: number;
};

// Sends the stylist-handoff notification for a new order (one or more
// items from the cart).
//
// Needs RESEND_API_KEY to actually send (sign up at resend.com, verify
// the shaklek.com domain, and set the key as an env var). Without it,
// this logs the order instead of throwing, so checkout still works —
// but no one actually gets notified until a real key is set.
export async function POST(req: NextRequest) {
  const order = await req.json();
  const { items, method, total } = order as { items: OrderItem[]; method: string; total: number };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "No items in order" }, { status: 400 });
  }

  const itemLines = items
    .map((item, i) => {
      const parts = [`${i + 1}. ${item.name} — ${item.fabric}, ${item.color}, size ${item.size}, AED ${item.price}`];
      if (item.measurements) parts.push(`   Measurements: ${item.measurements}`);
      if (item.changes && item.changes.length) parts.push(`   Changes: ${item.changes.join(", ")}`);
      if (item.freeformNotes) parts.push(`   Note: "${item.freeformNotes}"`);
      return parts.join("\n");
    })
    .join("\n");

  const summary = `New order (${items.length} ${items.length === 1 ? "item" : "items"}), AED ${total} via ${method}\n${itemLines}`;

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
      subject: `New order — ${items.length} ${items.length === 1 ? "item" : "items"}`,
      text: summary,
    }),
  });

  if (!res.ok) {
    console.error("[orders] Resend API call failed:", await res.text());
    return NextResponse.json({ ok: true, emailed: false });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
