"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS: { status: string; label: string }[] = [
  { status: "in_progress", label: "Start tailoring" },
  { status: "shipped", label: "Mark shipped" },
];

export default function OrderStatusButtons({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  // Fulfillment is a one-way line for now (paid -> in_progress -> shipped),
  // so only offer the next step forward plus cancel -- no dropdown of every
  // status, since going backwards isn't a real scenario yet.
  const next = status === "paid" ? STEPS[0] : status === "in_progress" ? STEPS[1] : null;

  async function setStatus(newStatus: string) {
    setUpdating(newStatus);
    try {
      await fetch(`/api/dashboard/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setUpdating(null);
    }
  }

  if (status === "shipped" || status === "canceled") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {next && (
        <button
          onClick={() => setStatus(next.status)}
          disabled={updating !== null}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 disabled:opacity-50"
        >
          {updating === next.status ? "…" : next.label}
        </button>
      )}
      <button
        onClick={() => setStatus("canceled")}
        disabled={updating !== null}
        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-rose-600 transition-colors hover:border-rose-300 disabled:opacity-50"
      >
        {updating === "canceled" ? "…" : "Cancel"}
      </button>
    </div>
  );
}
