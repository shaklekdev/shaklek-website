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
