"use client";

import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import OnlineFitting, { type OnlineFittingResult } from "@/components/OnlineFitting";
import { orderRef } from "@/lib/orderRef";
import { WHATSAPP_URL } from "@/lib/contact";

// ONLINE FITTING AFTER PAYMENT (founder, 2026-11-13). Link carries the order
// id and its signed access token; the token is read once and scrubbed from
// the address bar (same as /order-confirmed) so it does not linger in
// history or reach analytics. Photos are analysed on the phone; only the
// numbers are POSTed to /api/orders/[id]/fitting.
function MeasureInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const [t] = useState(() => search.get("t"));
  useLayoutEffect(() => {
    if (window.location.search) window.history.replaceState(null, "", `/measure/${id}`);
  }, [id]);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"checking" | "idle" | "saving" | "done" | "error" | "blocked">("checking");
  const [error, setError] = useState("");
  const [fitted, setFitted] = useState(false);

  // Check the link and the order BEFORE the photos (bug review 2026-11-14).
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${encodeURIComponent(id)}/fitting?t=${encodeURIComponent(t ?? "")}`)
      .then((r) => r.json().catch(() => ({})))
      .then((d: { ok?: boolean; state?: string; fitted?: boolean }) => {
        if (cancelled) return;
        if (d.ok && d.state === "open") {
          setFitted(!!d.fitted);
          setState("idle");
          setOpen(true);
        } else {
          setError(
            d.state === "started"
              ? "Your piece is already being made. Message us to change anything."
              : d.state === "unpaid"
                ? "We have not received the payment for this order yet. Please try again in a few minutes."
                : "This link is not valid. Please use the button in your confirmation email.",
          );
          setState("blocked");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("We could not open your fitting. Please try again.");
          setState("blocked");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  async function save(r: OnlineFittingResult) {
    setOpen(false);
    setState("saving");
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}/fitting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          t,
          values: r.estimate,
          topSize: r.topSize || undefined,
          trouserSize: r.trouserSize || undefined,
          bra: r.bra || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) setState("done");
      else {
        setError(data.error || "We could not save your measurements.");
        setState("error");
      }
    } catch {
      setError("We could not save your measurements.");
      setState("error");
    }
  }

  const btn = "flex min-h-11 w-full items-center justify-center bg-text px-6 text-sm text-white";

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-12">
        <p className="text-[11px] uppercase tracking-[0.14em] text-text-3">Order {orderRef(id)}</p>
        {state === "done" ? (
          <>
            <h1 className="mt-2 font-display text-[26px] text-text">Thank you</h1>
            <p className="mt-3 text-[14px] text-text-2">
              Your measurements are saved. We confirm them with you on WhatsApp before cutting.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-[26px] text-text">Virtual fitting</h1>
            <p className="mt-3 text-[14px] text-text-2">Your height and two photos. About 2 minutes.</p>
            {state === "error" || state === "blocked" ? (
              <p role="alert" className="mt-5 bg-surface-2 px-4 py-3 text-[13px] text-text">
                {error}{" "}
                <a href={WHATSAPP_URL} className="underline underline-offset-4">
                  WhatsApp us
                </a>
              </p>
            ) : null}
            {state === "blocked" ? null : (
              <button
                type="button"
                disabled={state === "saving" || state === "checking"}
                className={`mt-6 ${btn}`}
                onClick={() => setOpen(true)}
              >
                {state === "saving" ? "Saving…" : state === "checking" ? "…" : "Start"}
              </button>
            )}
          </>
        )}
      </div>
      {open && state !== "done" ? <OnlineFitting onDone={save} onClose={() => setOpen(false)} askBra={fitted} /> : null}
    </div>
  );
}

export default function MeasurePage() {
  return (
    <Suspense fallback={null}>
      <MeasureInner />
    </Suspense>
  );
}
