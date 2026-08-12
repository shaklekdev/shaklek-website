"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useCart } from "@/lib/CartContext";

export default function CartPage() {
  const { items, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
        <div className="mx-auto w-full max-w-md flex-1 px-6 py-20 text-center">
          <h1 className="text-[26px] text-text">Your cart is empty</h1>
          <p className="subtitle mt-2">
            Browse the catalog or upload your own design to get started.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-[26px] text-text">Your cart</h1>
        <p className="subtitle">
          {items.length} {items.length === 1 ? "piece" : "pieces"}, each cut to order.
        </p>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-shaklek-sm border border-border bg-surface p-4"
            >
              <div
                className="h-20 w-16 shrink-0 rounded-shaklek-xs"
                style={{
                  background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                }}
                aria-hidden
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[15px] font-medium text-text">{item.name}</p>
                  <p className="font-display text-lg text-text whitespace-nowrap">
                    AED {item.price}
                  </p>
                </div>
                <p className="mt-1 text-xs text-text-2">
                  {item.fabric === "cotton" ? "Cotton" : "Linen"} · {item.color} · Size {item.size}
                </p>
                {item.changes.length > 0 && (
                  <p className="mt-1 text-xs text-text-2">{item.changes.join(", ")}</p>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-2 text-xs text-text-3 underline hover:text-text-2"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <div>
            <p className="text-xs text-text-3">Total</p>
            <p className="font-display text-2xl text-text">AED {total}</p>
          </div>
          <Link
            href="/checkout"
            className="rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            Checkout
          </Link>
        </div>
        <Link href="/" className="mt-4 inline-block text-xs text-text-3 hover:text-text-2">
          ← Keep browsing
        </Link>
      </div>
    </div>
  );
}
