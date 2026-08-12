"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import NotifyStylist from "@/components/NotifyStylist";
import type { CartItem } from "@/lib/CartContext";

const LAST_ORDER_KEY = "shaklek-last-order";

type LastOrder = { items: CartItem[]; method: string; total: number; email: string };

export default function OrderConfirmedPage() {
  const [order, setOrder] = useState<LastOrder | null | undefined>(undefined);

  // Deferred to an effect (not a lazy initializer) for the same SSR/hydration
  // reason as CartContext — window.localStorage isn't available server-side.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LAST_ORDER_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrder(raw ? (JSON.parse(raw) as LastOrder) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  if (order === undefined) return null;

  if (!order || order.items.length === 0) {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
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
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
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
                {item.fabric === "cotton" ? "Cotton" : "Linen"} · {item.color} · Size {item.size}
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

        <div className="mt-6">
          <NotifyStylist order={order} />
        </div>

        <div className="mt-8 rounded-shaklek-sm border border-gold/30 bg-gold/10 p-4 text-left text-xs text-text-2">
          <strong className="text-text">What happens next:</strong> a
          Shaklek stylist reviews your order and reaches out — by WhatsApp
          or email — within 24 hours to confirm the details before it goes
          to your tailor. Expect delivery in about 7 days from confirmation.
        </div>

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-text-2 underline"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
