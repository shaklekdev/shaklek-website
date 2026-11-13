import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { verifyFittingToken, verifyOrderAccessToken } from "@/lib/orderAccess";
import { isUuid, readBoundedText, rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";
import { composeFitting, validateFitting } from "@/lib/onlineFitting";
import { orderRef } from "@/lib/orderRef";

// ONLINE FITTING, AFTER PAYMENT (founder, 2026-11-13: sizing before the order
// is friction that loses customers, so measuring comes after, "free after
// payment": home appointment in Dubai or online fitting).
//
// The customer reaches /measure/[id]?t=... from the confirmation page or the
// confirmation email, measures on her phone (photos never leave it), and this
// route stores the NUMBERS on her Tailored items.
//
// SECURITY (body-reading write route, CLAUDE.md section 0):
//   - authorization is the signed order access token (lib/orderAccess.ts), the
//     same one that guards GET /api/orders/[id]; no token, same 404 as no order
//   - rejectCrossOrigin + bounded body + isUuid before any query
//   - the browser sends numbers only; validateFitting re-checks every range
//     and composeFitting builds the stored text here, so nothing free-form
//     from the request reaches the DB, the tailor sheet or an email
//   - only orders that are paid and not yet being made can be changed, so a
//     link found later cannot rewrite a garment already cut
//   - no PII in logs: order ref only
const MAX_BODY = 2_000;
const EDITABLE = ["paid"]; // in_progress = cutting has started

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cross = rejectCrossOrigin(req);
  if (cross) return cross;
  const big = rejectOversizedBody(req, MAX_BODY);
  if (big) return big;

  const { id } = await params;
  const notFound = NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  if (!isUuid(id)) return notFound;

  const raw = await readBoundedText(req, MAX_BODY);
  if (raw === null) return NextResponse.json({ ok: false, error: "Request body too large" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const t = (body as { t?: unknown })?.t;
  // Either the fitting-only token (email link) or the order token (the
  // confirmation page, which already holds it).
  if (!verifyFittingToken(id, t) && !verifyOrderAccessToken(id, t)) return notFound;

  const fitting = validateFitting(body);
  if (!fitting) return NextResponse.json({ ok: false, error: "Invalid measurements" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "Not available" }, { status: 501 });

  const [order] = await db
    .select({ id: schema.orders.id, status: schema.orders.status })
    .from(schema.orders)
    .where(eq(schema.orders.id, id));
  if (!order) return notFound;
  if (!EDITABLE.includes(order.status)) {
    const started = ["in_progress", "shipped", "delivered"].includes(order.status);
    return NextResponse.json(
      {
        ok: false,
        error: started
          ? "This order is already being made. Message us on WhatsApp to change anything."
          : "We have not received the payment for this order yet. Message us on WhatsApp.",
      },
      { status: 409 },
    );
  }

  const text = composeFitting(fitting);
  const [before] = await db
    .select({ m: schema.orderItems.measurements })
    .from(schema.orderItems)
    .where(and(eq(schema.orderItems.orderId, id), inArray(schema.orderItems.size, ["Tailored"])));
  const changed = !before || before.m !== text;
  const updated = await db
    .update(schema.orderItems)
    .set({ measurements: text })
    .where(
      and(
        eq(schema.orderItems.orderId, id),
        // Tailored lines only: a standard size was the customer's own choice.
        inArray(schema.orderItems.size, ["Tailored"]),
      ),
    )
    .returning({ id: schema.orderItems.id });

  console.log(`[fitting] online fitting saved for order ${orderRef(id)} (${updated.length} item(s))`);

  // Tell the team, so the WhatsApp confirmation happens. Order reference only
  // in the email: the numbers are on the order in /dashboard.
  const apiKey = process.env.RESEND_API_KEY;
  // Only when the numbers changed: a resubmit of the same values sends nothing.
  if (apiKey && updated.length && changed) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Shaklek <orders@shaklek.com>",
          to: "orders@shaklek.com",
          subject: `Online fitting received: ${orderRef(id)}`,
          text: `Online fitting measurements were added to order ${orderRef(id)}. Check them in the dashboard and confirm with the customer on WhatsApp before cutting.`,
        }),
      });
    } catch {
      console.error(`[fitting] team notification failed for ${orderRef(id)}`);
    }
  }
  return NextResponse.json({ ok: true, items: updated.length });
}
