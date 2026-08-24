"use client";

import { Suspense, useEffect, useState } from "react";
import { money, track } from "@/lib/metaPixel";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import { useCart } from "@/lib/CartContext";
import type { CartItem } from "@/lib/CartContext";

const LAST_ORDER_KEY = "shaklek-last-order";

type DisplayItem = {
  id: string;
  name: string;
  fabric: string;
  color: string;
  size: string;
  changes: string[];
  price: number;
  previewImage?: string;
};

type DisplayOrder = {
  items: DisplayItem[];
  total: number;
  status?: string; // only set for Stripe/DB-backed orders
  emailed?: boolean; // only set for the fallback/demo path
  email?: string; // only set for Stripe/DB-backed orders
};

function fromLocalStorage(): DisplayOrder | null {
  try {
    const raw = window.localStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { items: CartItem[]; total: number; emailed?: boolean };
    if (!parsed.items || parsed.items.length === 0) return null;
    return { items: parsed.items, total: parsed.total, emailed: parsed.emailed };
  } catch {
    return null;
  }
}

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  // Signed access token minted with the Checkout Session and carried back in
  // Stripe's success_url. /api/orders/:id needs it (or a Clerk session that
  // owns the order) -- an order id alone no longer authorizes a read.
  const accessToken = searchParams.get("t");
  const { clear } = useCart();
  const { isSignedIn } = useUser();
  const [order, setOrder] = useState<DisplayOrder | null | undefined>(undefined);

  // Stripe/DB path: the webhook that marks the order "paid" runs async and
  // can land a beat after this redirect does, so poll briefly rather than
  // showing a stale "queued" message on an order that actually succeeded.
  useEffect(() => {
    if (!orderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrder(fromLocalStorage());
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderId!)}${
            accessToken ? `?t=${encodeURIComponent(accessToken)}` : ""
          }`,
        );
        const data = await res.json();
        if (cancelled) return;

        if (!data.ok) {
          setOrder(null);
          return;
        }

        setOrder({
          items: data.order.items,
          total: data.order.total,
          status: data.order.status,
          email: data.order.email,
        });

        if (data.order.status === "paid") {
          clear(); // Stripe already confirmed payment by redirecting here
          trackPurchaseOnce(orderId!, data.order.total, data.order.items);
        } else if (attempts < 4) {
          attempts += 1;
          setTimeout(poll, 1500);
        }
      } catch {
        if (!cancelled) setOrder(null);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, accessToken]);

  if (order === undefined) return null;

  if (!order || order.items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-20 text-center">
        <h1 className="text-[26px] text-text">No recent order found</h1>
        <p className="subtitle mt-2">
          If you just placed an order, check your email — otherwise head back to the catalog.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-16 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12.5L9 17.5L20 6.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-[26px] text-text">Order confirmed</h1>
      <p className="subtitle mx-auto max-w-sm">
        Thank you — your {order.items.length === 1 ? "piece is" : "pieces are"} on{" "}
        {order.items.length === 1 ? "its" : "their"} way to being made, just for you.
      </p>

      <div className="mt-8 space-y-3 text-left">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-shaklek-sm border border-border bg-surface p-5"
          >
            {item.previewImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.previewImage}
                alt=""
                className="h-16 w-12 shrink-0 rounded-shaklek-xs object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-[15px] font-medium text-text">{item.name}</p>
              <p className="mt-1 text-xs text-text-2">
                {item.fabric === "cotton" ? "Cotton" : item.fabric === "linen" ? "Linen" : item.fabric} ·{" "}
                {item.color} · Size {item.size}
              </p>
              {item.changes.length > 0 && (
                <p className="mt-1 text-xs text-text-2">{item.changes.join(", ")}</p>
              )}
              <p className="mt-3 font-display text-lg text-text">AED {item.price}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-right font-display text-xl text-text">Total AED {order.total}</p>

      <p className="mt-6 text-xs text-text-3">
        {order.status === "paid" || order.emailed
          ? "Your stylist has been notified and will reach out shortly."
          : order.status
            ? "Payment received — confirming with your stylist now."
            : "Order received — stylist notification is queued (email delivery isn't fully connected yet)."}
      </p>

      <div className="mt-8 rounded-shaklek-sm border border-gold/30 bg-gold/10 p-4 text-left text-xs text-text-2">
        <strong className="text-text">What happens next:</strong> a
        Shaklek stylist reviews your order and reaches out — by WhatsApp
        or email — within 24 hours to confirm the details before it goes
        to your tailor. Expect delivery in about 10 days from confirmation.
      </div>

      {!isSignedIn && (
        <div className="mt-4 rounded-shaklek-sm border border-border bg-surface p-5 text-left">
          <p className="text-sm text-text">Want to track this order in one place?</p>
          <p className="mt-1 text-xs text-text-2">
            A free account saves your order history, sizing, and preferences for next time.
          </p>
          <Link
            href="/sign-up"
            className="mt-3 inline-block rounded-full bg-accent px-6 py-2.5 text-xs text-white transition-opacity hover:opacity-90"
          >
            Create a free account
          </Link>
          {order.email && (
            <p className="mt-2 text-[11px] text-text-3">
              Sign up with {order.email} and this order will already be there.
            </p>
          )}
        </div>
      )}

      <Link href="/" className="mt-8 inline-block text-sm text-text-2 underline">
        Back to catalog
      </Link>
    </div>
  );
}


// Fires Meta's Purchase event exactly once per order.
//
// Three things would otherwise double-count it, and every duplicate corrupts
// the number the ad account optimises against and the ROAS the founder reads:
//   - the poll above runs up to five times while Stripe's webhook lands
//   - the customer refreshes the confirmation page
//   - the customer returns to the URL later; it stays valid
//
// localStorage keyed by order id, so it survives a refresh and a return
// visit. A cleared browser can re-fire once; that is the safe direction of
// error compared with counting every poll.
//
// Deliberately NO email, name or address in the payload -- Meta's terms
// prohibit personal data in event parameters, and this is a page that has
// the customer's email in scope.
function trackPurchaseOnce(
  orderId: string,
  total: number,
  items: { slug?: string; name?: string; quantity?: number }[],
) {
  try {
    const key = `shaklek-purchase-tracked-${orderId}`;
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
    track("Purchase", {
      content_type: "product",
      content_ids: items.map((i) => i.slug ?? i.name ?? "unknown"),
      contents: items.map((i) => ({
        id: i.slug ?? i.name ?? "unknown",
        quantity: i.quantity ?? 1,
      })),
      num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
      order_id: orderId,
      ...money(total),
    });
  } catch {
    // Never let analytics break the page that confirms someone's order.
  }
}

export default function OrderConfirmedPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <Suspense fallback={null}>
        <OrderConfirmedContent />
      </Suspense>
    </div>
  );
}
