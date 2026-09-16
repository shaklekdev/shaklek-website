// Shared by /api/orders (fallback path, used when Stripe isn't configured)
// and /api/webhooks/stripe (real path, fires once Stripe confirms payment).
// Needs RESEND_API_KEY to actually send — logs instead when it's unset, so
// neither caller ever throws just because email isn't wired up yet.


// With promotion codes enabled, the total persisted against an order is what
// Stripe actually collected, while the item rows still carry catalog prices.
// Without naming the gap, a discounted confirmation lists items summing to
// AED 390 and then a total of AED 3.90 -- which reads as a broken email to
// the customer and as a pricing error to the stylist. Derived, not stored:
// nothing new has to be persisted to say it truthfully.
import { orderRef } from "@/lib/orderRef";
import { buildEmail, type MailRow } from "@/lib/mail";

export function discountLine(items: { price: number; quantity?: number }[], total: number): number {
  const subtotal = items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0);
  const discount = subtotal - total;
  // Only a real reduction counts. Rounding noise and any case where the
  // charge exceeds the subtotal (shipping, tax) is left unannotated rather
  // than shown as a negative discount.
  return discount > 0.005 ? discount : 0;
}

export type NotifyOrderItem = {
  name: string;
  // Units of this line. Server-resolved before it reaches here (see
  // src/lib/pricing.ts) -- shown so a two-garment line doesn't read to the
  // stylist as one. Optional because the removed /upload path built this shape
  // directly and pre-quantity orders have none.
  quantity?: number;
  fabric: string | null;
  color: string | null;
  size: string | null;
  measurements?: string | null;
  changes?: string[] | null;
  freeformNotes?: string | null;
  price: number;
  previewImage?: string; // uploaded reference photo (data URL) -- only ever present in the fallback path's raw request body, never persisted to the DB
};

// Everything below the garment name is customer-supplied free text (fabric,
// colour, size, the changes list, notes). It was being interpolated straight
// into an HTML email body, so a cart item could inject arbitrary markup --
// including a link -- into a mail we send from orders@shaklek.com. Escape
// every interpolated value.
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendOrderNotificationEmail(
  items: NotifyOrderItem[],
  method: string,
  total: number,
  email: string,
): Promise<{ emailed: boolean }> {
  const itemLines = items
    .map((item, i) => {
      const qty = item.quantity && item.quantity > 1 ? ` x${item.quantity}` : "";
      const parts = [`${i + 1}. ${item.name}${qty} · ${item.fabric}, ${item.color}, size ${item.size}, AED ${item.price}`];
      if (item.measurements) parts.push(`   Measurements: ${item.measurements}`);
      if (item.changes && item.changes.length) parts.push(`   Changes: ${item.changes.join(", ")}`);
      if (item.freeformNotes) parts.push(`   Note: "${item.freeformNotes}"`);
      if (item.previewImage) parts.push(`   (reference photo attached)`);
      return parts.join("\n");
    })
    .join("\n");

  const notifyDiscount = discountLine(items, total);
  const summary = `New order (${items.length} ${items.length === 1 ? "item" : "items"}) from ${email}, AED ${total}${
    notifyDiscount > 0 ? ` (after -AED ${notifyDiscount.toFixed(2)} discount)` : ""
  } via ${method}\n${itemLines}`;

  // Reference photos arrive as base64 data URLs in the request body. Resend
  // caps a message at 40MB total; more to the point, an uncapped attachment
  // is a free way to make us buffer and forward arbitrary data. Anything
  // that isn't a plausible base64 image of sane size is dropped rather than
  // failing the whole notification.
  const MAX_ATTACHMENT_BASE64 = 4_000_000; // ~3MB decoded
  const attachments = items
    .filter((item) => item.previewImage)
    .map((item, i) => {
      const [header, data] = item.previewImage!.split(",");
      if (!data || !/^data:image\/(jpeg|jpg|png|webp);base64$/i.test(header)) return null;
      if (data.length > MAX_ATTACHMENT_BASE64) return null;
      return { filename: `reference-${i + 1}.jpg`, content: data };
    })
    .filter((a): a is { filename: string; content: string } => a !== null);

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Do NOT log `summary` -- it carries the customer's email address,
    // body measurements and free-text notes, and these lines land in
    // CloudWatch where they long outlive the order.
    console.error(
      `[orders] RESEND_API_KEY not set, order of ${items.length} item(s) NOT emailed. Details withheld (PII).`,
    );
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
      subject: `New order, ${items.length} ${items.length === 1 ? "item" : "items"}`,
      text: summary,
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    // ⚠️ STATUS AND A PARSED CODE ONLY, NEVER res.text(). A Resend validation
    // error echoes the rejected address back, so logging the body puts a
    // customer's email in CloudWatch. Same pattern as
    // api/waitlist/route.ts. Security review, 2026-09-15.
    let code = "unknown";
    try {
      const parsed = JSON.parse(await res.text());
      code = String(parsed?.name ?? parsed?.code ?? "unknown").slice(0, 60);
    } catch {
      /* non-JSON body: the status alone is what we keep */
    }
    console.error(`[orders] Resend rejected the send: ${res.status} ${code}`);
    return { emailed: false };
  }

  return { emailed: true };
}

// Customer-facing confirmation -- separate from the stylist notification
// above, which goes to orders@shaklek.com. This is what a guest customer
// gets instead of any account/login: their order details plus an offer to
// sign up (same email = their past orders show up automatically once they
// do, since customers are matched by email, not a stored Clerk user id).

/**
 * The customer confirmation, as HTML and text. PURE: it sends nothing and
 * reads no environment.
 *
 * ⚠️ SPLIT OUT FROM THE SENDER ON PURPOSE, 2026-09-16. The production Resend
 * key is the only one this project has, and CLAUDE.md forbids test orders
 * against production, so the only honest way to look at this email is to
 * render it to a file and open it. That is impossible while the markup lives
 * inside a function whose next statement is a POST to Resend.
 *
 * scripts/preview-emails.mjs renders exactly this, so what is reviewed is what
 * ships rather than a copy that drifts.
 */
export function buildCustomerConfirmation(opts: {
  items: NotifyOrderItem[];
  total: number;
  email: string;
  appUrl: string;
  ref: string | null;
}): { html: string; text: string } {
  const { items, total, email, appUrl, ref } = opts;
  // ⚠️ THROUGH buildEmail, NOT HAND-BUILT HTML. Until 2026-09-16 this function
  // carried its own <div> shell with its own font stack, its own greys and a
  // 480px width, while every waitlist email came out of lib/mail.ts looking
  // different. A customer who buys receives both, days apart, and they read as
  // two companies. Founder: "let's make the email confirmations and orders
  // look nice as well."
  //
  // ⚠️ PASS RAW STRINGS. buildEmail escapes every value itself. The local esc()
  // above is still used by sendOrderNotificationEmail, which is staff-facing
  // and still hand-built on purpose -- do not "tidy" that one into here, and do
  // not double-escape by wrapping these in esc() as the old code did.
  const rows: MailRow[] = items.map((item) => {
    const spec = [item.fabric, item.color, item.size ? `Size ${item.size}` : null]
      .filter(Boolean)
      .join(" \u00b7 ");
    const changes = item.changes?.length ? item.changes.join(", ") : "";
    return {
      name: `${item.name}${item.quantity && item.quantity > 1 ? ` \u00d7${item.quantity}` : ""}`,
      spec: [spec, changes].filter(Boolean).join(" \u2014 ") || undefined,
      amount: `AED ${item.price}`,
    };
  });

  const discount = discountLine(items, total);

  const totals: { label: string; amount: string; strong?: boolean }[] = [];
  if (discount > 0) totals.push({ label: "Discount", amount: `\u2212AED ${discount.toFixed(2)}` });
  totals.push({ label: "Total", amount: `AED ${total}`, strong: true });

  const one = items.length === 1;

  const built = buildEmail({
    // ⚠️ TRANSACTIONAL, so no visible unsubscribe line. This is the receipt for
    // something she paid for thirty seconds ago; offering to unsubscribe her
    // from it makes no sense. The List-Unsubscribe header is for lists.
    kind: "transactional",
    // Without this the inbox preview is whatever text comes first, which here
    // is the order reference -- a row of characters that tells her nothing.
    preheader: `A stylist will be in touch within 24 hours.`,
    heading: "Order confirmed",
    eyebrow: ref ? `Order reference ${ref}` : undefined,
    lines: [
      `Thank you. Your ${one ? "piece is" : "pieces are"} on ${one ? "its" : "their"} way to being made.`,
    ],
    rows,
    totals,
    // ⚠️ THE LEAD TIME AND THE CITY, BOTH HEDGED THE SAME WAY THEY ARE ON THE
    // SITE. "strive to" and "approximately" match the terms of sale, which call
    // this an estimate and not a guarantee, and "we deliver in Dubai" is the
    // scope limit that stops this reading as a nationwide promise.
    button: undefined,
    note: {
      lines: [
        "A Shaklek stylist will reach out within 24 hours to confirm details before it goes to your tailor. We strive to have it ready in approximately 10 working days from confirmation, and we deliver in Dubai.",
        `Want this order and any future ones in one place? Sign up with this same address (${email}) and it will already be there.`,
      ],
      button: { label: "Create a free account", url: `${appUrl}/sign-up` },
    },
  });
  return { html: built.html, text: built.text };
}

export async function sendCustomerConfirmationEmail(
  items: NotifyOrderItem[],
  total: number,
  email: string,
  // ⚠️ THE CUSTOMER'S ONLY DURABLE COPY OF HER ORDER REFERENCE. Until
  // 2026-08-28 this email carried none, and neither did /order-confirmed or
  // /account -- so the staff dashboard and the tailor's document both quoted a
  // reference the customer had never been given, and any conversation about a
  // specific piece began by describing the garment.
  //
  // Optional so a caller without an id still SENDS the email rather than
  // throwing at the end of a paid checkout. Both real callers pass it.
  orderId?: string,
): Promise<{ emailed: boolean }> {
  const ref = orderId ? orderRef(orderId) : null;
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.shaklek.com";

  const { html, text } = buildCustomerConfirmation({ items, total, email, appUrl, ref });

  if (!apiKey) {
    // The address is deliberately NOT interpolated here. Its sibling
    // sendOrderNotificationEmail withholds it for exactly this reason: these
    // lines land in CloudWatch, which outlives the order. Flagged by the
    // security review 2026-08-30 as the one place the codebase broke its own
    // no-PII-in-logs rule.
    console.log("[orders] RESEND_API_KEY not set, customer confirmation not emailed. Address withheld (PII).");
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
    // ⚠️ STATUS AND A PARSED CODE ONLY, NEVER res.text(). A Resend validation
    // error echoes the rejected address back, so logging the body puts a
    // customer's email in CloudWatch. Same pattern as
    // api/waitlist/route.ts. Security review, 2026-09-15.
    let code = "unknown";
    try {
      const parsed = JSON.parse(await res.text());
      code = String(parsed?.name ?? parsed?.code ?? "unknown").slice(0, 60);
    } catch {
      /* non-JSON body: the status alone is what we keep */
    }
    console.error(`[orders] Resend rejected the send: ${res.status} ${code}`);
    return { emailed: false };
  }

  return { emailed: true };
}
