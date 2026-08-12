"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";

type PaymentMethod = "apple-pay" | "card" | "tabby";

const methods: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: "apple-pay", label: "Apple Pay", sub: "Fastest checkout" },
  { id: "card", label: "Card", sub: "Visa, Mastercard" },
  { id: "tabby", label: "Tabby", sub: "4 payments, no interest" },
];

const LAST_ORDER_KEY = "shaklek-last-order";

export default function CheckoutForm({ total }: { total: number }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("apple-pay");
  const [submitting, setSubmitting] = useState(false);

  function handlePay() {
    setSubmitting(true);
    // No payment gateway connected yet — this is a stand-in until a real
    // provider (Stripe) is wired up. It still produces a real order record
    // downstream via the confirmation page, stashed in localStorage since
    // there's no backend/DB yet to persist it to.
    window.localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ items, method, total }));
    clear();
    router.push("/order-confirmed");
  }

  return (
    <div className="mt-8">
      <p className="mb-3 text-sm text-text">Pay as guest</p>
      <div className="space-y-2">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`flex w-full items-center justify-between rounded-shaklek-sm border px-4 py-3.5 text-left transition-colors ${
              method === m.id
                ? "border-accent bg-surface-2"
                : "border-border-strong"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-text">{m.label}</p>
              <p className="text-xs text-text-3">{m.sub}</p>
            </div>
            <span
              className={`h-4 w-4 rounded-full border-2 ${
                method === m.id ? "border-accent bg-accent" : "border-border-strong"
              }`}
            />
          </button>
        ))}
      </div>

      <button
        onClick={handlePay}
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center rounded-full bg-accent py-4 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Processing…" : `Pay AED ${total}`}
      </button>
      <p className="mt-3 text-center text-xs text-text-3">
        Secure payment · One free alteration or remake within 14 days
      </p>
    </div>
  );
}
