"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The fit guarantee for ONE garment, and the clock on it.
 *
 * She agrees the remake with the customer on WhatsApp -- that is deliberate,
 * not a gap: a photo is free there and is the best abuse filter available. This
 * records the outcome so "ONE free alteration or remake within 14 days" is
 * enforceable, which it was not while nothing wrote the column.
 *
 * ⚠️ THE WINDOW IS SHOWN BUT NEVER ENFORCED HERE. Day 15 still gets a button.
 * A deadline is a promise about what she MUST do, not a ceiling on what she
 * may choose to do, and a dashboard that refuses a goodwill remake would make
 * that decision for her silently. It shows the number and she decides.
 */
const WINDOW_DAYS = 14;

export default function FitRemakeButton({
  orderId,
  itemId,
  deliveredAt,
  usedAt,
}: {
  orderId: string;
  itemId: string;
  deliveredAt: string | null;
  usedAt: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Before delivery there is no guarantee running and nothing to spend, so the
  // control would be noise on every row in the shop.
  if (!deliveredAt && !usedAt) return null;

  async function set(used: boolean) {
    setBusy(true);
    try {
      await fetch(`/api/dashboard/orders/${orderId}/items/${itemId}/remake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ used }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (usedAt) {
    return (
      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
        <span className="text-slate-600">
          Fit remake used {new Date(usedAt).toLocaleDateString("en-AE", { dateStyle: "medium" })}
        </span>
        <button
          onClick={() => set(false)}
          disabled={busy}
          className="underline hover:text-slate-900 disabled:opacity-50"
        >
          {busy ? "…" : "undo"}
        </button>
      </div>
    );
  }

  // Whole days remaining, counted from delivery. Math.ceil so the day the
  // parcel arrives reads "14 days left", not 13.
  const elapsedMs = Date.now() - new Date(deliveredAt!).getTime();
  const left = WINDOW_DAYS - Math.floor(elapsedMs / 86_400_000);

  return (
    <div className="mt-0.5 flex items-center gap-2 text-[11px]">
      <span className={left > 0 ? "text-emerald-700" : "text-slate-400"}>
        {left > 0 ? `Fit remake available · ${left} day${left === 1 ? "" : "s"} left` : "Fit window closed"}
      </span>
      <button
        onClick={() => set(true)}
        disabled={busy}
        className="text-slate-500 underline hover:text-slate-900 disabled:opacity-50"
      >
        {busy ? "…" : "mark used"}
      </button>
    </div>
  );
}
