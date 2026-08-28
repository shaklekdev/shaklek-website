"use client";

import Link from "next/link";
import { customerChosenLabels } from "@/data/parameterSliders";
import Header from "@/components/Header";
import CheckoutForm from "@/components/CheckoutForm";
import { useCart } from "@/lib/CartContext";

export default function CheckoutPage() {
  const { items, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
        <div className="mx-auto w-full max-w-md flex-1 px-6 py-20 text-center">
          <h1 className="text-[26px] text-text">Nothing to check out</h1>
          <p className="subtitle mt-2">Your cart is empty.</p>
          <Link
            href="/catalog"
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
        <Link href="/cart" className="text-xs text-text-3 hover:text-text-2">
          ← Back to cart
        </Link>

        <h1 className="mt-4 text-[26px] text-text">Complete your order</h1>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
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
              <div className="flex flex-1 items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] font-medium text-text">
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="text-text-2"> &times;{item.quantity}</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-text-2">
                    {item.fabric === "cotton" ? "Cotton" : "Linen"} · {item.color} · Size{" "}
                    {item.size}
                  </p>
                  {customerChosenLabels(item.category, item.changes).length > 0 && (
                    <p className="mt-1 text-xs text-text-2">
                      {customerChosenLabels(item.category, item.changes).join(", ")}
                    </p>
                  )}
                </div>
                <p className="font-display text-xl text-text whitespace-nowrap">
                  AED {item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <CheckoutForm total={total} />
      </div>
    </div>
  );
}
