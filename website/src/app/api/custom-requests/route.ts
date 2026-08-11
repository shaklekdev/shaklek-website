import { NextRequest, NextResponse } from "next/server";

// Handles "upload your own design" submissions — sends the reference
// image and notes to a stylist for manual review, per the Concierge MVP
// model (a human handles this until the real AI co-design system exists).
//
// Needs RESEND_API_KEY to actually send. Without it, logs instead of
// throwing, same fallback pattern as /api/orders.
export async function POST(req: NextRequest) {
  const { email, notes, fileName, fileDataUrl, garmentType, fabric, color, changes } =
    await req.json();

  if (!email || !fileDataUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing email or reference image" },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const specLine = [garmentType, fabric, color].filter(Boolean).join(", ");
  const changesLine =
    Array.isArray(changes) && changes.length ? changes.join(", ") : null;
  const summary = `New "upload your own" request from ${email}${
    specLine ? `\nCustomized as: ${specLine}` : ""
  }${changesLine ? `\nRequested changes: ${changesLine}` : ""}${
    notes ? `\nNotes: "${notes}"` : ""
  }`;

  if (!apiKey) {
    console.log("[custom-requests] RESEND_API_KEY not set — not emailed. Details:");
    console.log(summary, "| attached file:", fileName);
    return NextResponse.json({ ok: true, emailed: false });
  }

  const base64 = fileDataUrl.split(",")[1] ?? "";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Shaklek Uploads <orders@shaklek.com>",
      to: "orders@shaklek.com",
      reply_to: email,
      subject: `New custom design request — ${email}`,
      text: summary,
      attachments: [{ filename: fileName || "reference.jpg", content: base64 }],
    }),
  });

  if (!res.ok) {
    console.error("[custom-requests] Resend API call failed:", await res.text());
    return NextResponse.json({ ok: true, emailed: false });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
