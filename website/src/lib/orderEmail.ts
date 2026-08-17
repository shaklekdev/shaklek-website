// Shared by /api/orders (fallback path, used when Stripe isn't configured)
// and /api/webhooks/stripe (real path, fires once Stripe confirms payment).
// Needs RESEND_API_KEY to actually send — logs instead when it's unset, so
// neither caller ever throws just because email isn't wired up yet.

export type NotifyOrderItem = {
  name: string;
  fabric: string | null;
  color: string | null;
  size: string | null;
  measurements?: string | null;
  changes?: string[] | null;
  freeformNotes?: string | null;
  price: number;
  previewImage?: string; // uploaded reference photo (data URL) -- only ever present in the fallback path's raw request body, never persisted to the DB
};

export async function sendOrderNotificationEmail(
  items: NotifyOrderItem[],
  method: string,
  total: number,
  email: string,
): Promise<{ emailed: boolean }> {
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
    return { emailed: false };
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
    return { emailed: false };
  }

  return { emailed: true };
}

// Customer-facing confirmation -- separate from the stylist notification
// above, which goes to orders@shaklek.com. This is what a guest customer
// gets instead of any account/login: their order details plus an offer to
// sign up (same email = their past orders show up automatically once they
// do, since customers are matched by email, not a stored Clerk user id).
export async function sendCustomerConfirmationEmail(
  items: NotifyOrderItem[],
  total: number,
  email: string,
): Promise<{ emailed: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.shaklek.com";

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <div style="font-size:14px;color:#1a1a1a;">${item.name}</div>
            <div style="font-size:12px;color:#6b6b6b;margin-top:2px;">
              ${item.fabric ?? ""} · ${item.color ?? ""} · Size ${item.size ?? ""}
              ${item.changes && item.changes.length ? `<br/>${item.changes.join(", ")}` : ""}
            </div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;color:#1a1a1a;white-space:nowrap;">
            AED ${item.price}
          </td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:-apple-system,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a;">
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:24px;margin-bottom:4px;">Order confirmed</h1>
      <p style="font-size:14px;color:#6b6b6b;margin-top:0;">
        Thank you — your ${items.length === 1 ? "piece is" : "pieces are"} on ${items.length === 1 ? "its" : "their"} way to being made.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">${itemRows}</table>
      <p style="text-align:right;font-size:16px;font-weight:600;margin-top:12px;">Total AED ${total}</p>
      <p style="font-size:13px;color:#6b6b6b;line-height:1.6;">
        A Shaklek stylist will reach out within 24 hours to confirm details before it goes to your tailor.
        Expect delivery in about 10 days from confirmation.
      </p>
      <div style="margin-top:24px;padding:16px;background:#faf7f2;border-radius:12px;">
        <p style="font-size:13px;margin:0 0 10px;color:#1a1a1a;">
          Want to track this order and any future ones in one place?
        </p>
        <a href="${appUrl}/sign-up" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:13px;">
          Create a free account
        </a>
        <p style="font-size:11px;color:#a0a0a0;margin:10px 0 0;">
          Sign up with this same email address (${email}) and this order will already be there.
        </p>
      </div>
    </div>`;

  const text = `Order confirmed — thank you! Total AED ${total}. A stylist will reach out within 24 hours. Track this and future orders by creating a free account with this same email at ${appUrl}/sign-up`;

  if (!apiKey) {
    console.log(`[orders] RESEND_API_KEY not set — customer confirmation not emailed to ${email}.`);
    return { emailed: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Shaklek <orders@shaklek.com>",
      to: email,
      subject: "Your Shaklek order is confirmed",
      html,
      text,
    }),
  });

  if (!res.ok) {
    console.error("[orders] Customer confirmation email failed:", await res.text());
    return { emailed: false };
  }

  return { emailed: true };
}
