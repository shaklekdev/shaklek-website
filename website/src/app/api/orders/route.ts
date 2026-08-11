import { NextRequest, NextResponse } from "next/server";

// Sends the stylist-handoff notification for a new order.
//
// Needs RESEND_API_KEY to actually send (sign up at resend.com, verify
// the shaklek.com domain, and set the key as an env var). Without it,
// this logs the order instead of throwing, so checkout still works —
// but no one actually gets notified until a real key is set.
export async function POST(req: NextRequest) {
  const order = await req.json();
  const { slug, name, size, fabric, color, request: note, total, method } = order;

  const summary = `New order: ${name} — ${fabric}, ${color}, size ${size}, AED ${total} via ${method}${
    note ? `\nCustomer request: "${note}"` : ""
  }`;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[orders] RESEND_API_KEY not set — order not emailed. Details:");
    console.log(summary);
    return NextResponse.json({ ok: true, emailed: false, slug });
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
      subject: `New order — ${name}`,
      text: summary,
    }),
  });

  if (!res.ok) {
    console.error("[orders] Resend API call failed:", await res.text());
    return NextResponse.json({ ok: true, emailed: false, slug });
  }

  return NextResponse.json({ ok: true, emailed: true, slug });
}
