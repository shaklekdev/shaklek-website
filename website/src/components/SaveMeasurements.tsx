"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

/**
 * "Save my measurements" — opt-in, and it must never block a purchase.
 *
 * WHY THIS EXISTS: /checkout promised "Sign in to save your measurements" and
 * signing in saved nothing. Measurements reached order_items, so the tailor
 * always had them, but they were never written to customers.measurements. The
 * only real save path was retyping them by hand on /account. The promise was
 * not kept.
 *
 * WHY IT IS A BUTTON AND NOT A BACKGROUND WRITE: the privacy policy states
 * that order data is processed on one basis and SAVED MEASUREMENTS on consent.
 * Quietly copying them onto the customer record at checkout would contradict
 * our own policy. Asking is both the honest and the legally clean version.
 *
 * WHY THE MODAL CAN ALWAYS BE DISMISSED: this sits on the path to a purchase.
 * Nothing here gates add-to-cart or pay. A customer who declines still gets
 * their piece cut to their numbers, because the ORDER carries them regardless;
 * they simply do not get them pre-filled next time.
 */
export default function SaveMeasurements({
  measurements,
  valid,
  className = "",
}: {
  measurements: string;
  valid: boolean;
  className?: string;
}) {
  const { isSignedIn } = useUser();
  const clerk = useClerk();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hint, setHint] = useState(false);

  // Held across the sign-up round trip. The customer typed these BEFORE an
  // account existed, and losing them to the redirect would make the feature
  // pointless -- they would have to type them a second time, which is the
  // exact problem being solved.
  const pending = useRef<string | null>(null);

  async function save(value: string) {
    setState("saving");
    try {
      const res = await fetch("/api/account/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ measurements: value }),
      });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  // Fires after Clerk reports a session. The POST is authorised by
  // getVerifiedEmail() on the server, so it MUST happen after sign-up
  // completes -- attempting it earlier is correctly rejected.
  useEffect(() => {
    if (isSignedIn && pending.current) {
      const value = pending.current;
      pending.current = null;
      void save(value);
    }
  }, [isSignedIn]);

  // ALWAYS RENDERED, disabled until the numbers are complete.
  //
  // This used to return null unless the measurements were already valid, which
  // meant the feature was invisible to anyone who had not finished typing --
  // there was no sign it existed at all. The founder looked for it twice and
  // concluded it had not been built. A capture prompt nobody can see captures
  // nothing.
  const ready = valid && Boolean(measurements.trim());

  if (state === "saved") {
    return (
      <p className={`text-[13px] text-text-2 ${className}`}>
        Saved. Next time these are filled in for you.
      </p>
    );
  }

  return (
    <div className={className}>
      {/* A REAL BUTTON. This was an underlined sentence, and the founder's
          note was that nobody knows a sentence is clickable -- which is why
          she reported the sign-up popup as missing. It was not missing: Clerk's
          modal opens correctly on click. Nobody had ever clicked it.

          It stays enabled even when the measurements are incomplete. A
          disabled button on a phone does nothing when tapped and explains
          nothing, so instead the click tells the customer what is needed and
          takes them to the fields. */}
      <button
        type="button"
        disabled={state === "saving"}
        title={
          ready
            ? undefined
            : "Add your measurements above to be able to save"
        }
        onClick={() => {
          if (!ready) {
            setHint(true);
            document
              .querySelector("input[type=number]")
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
          setHint(false);
          if (isSignedIn) {
            void save(measurements);
            return;
          }
          pending.current = measurements;
          // Clerk's modal, not a redirect: leaving the page mid-design would
          // lose everything already configured.
          clerk.openSignUp({});
        }}
        className={`w-full border px-5 py-3 text-sm transition-colors sm:w-auto ${
          ready
            ? "border-text bg-text text-white hover:opacity-90"
            : "border-border-strong bg-white text-text-2 hover:border-text hover:text-text"
        } disabled:opacity-60`}
      >
        {state === "saving" ? "Saving…" : "Save my measurements"}
      </button>

      {/* Shown only after a click that could not proceed, never as standing
          text under the button. */}
      {hint && !ready && (
        <p role="status" className="mt-2 text-[12px] text-text-2">
          Add your measurements above to be able to save.
        </p>
      )}
      {ready && !isSignedIn && (
        <p className="mt-2 text-[11px] text-text-3">
          Takes an email and a password. Your piece is cut to these numbers
          either way.
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="mt-2 text-[11px] text-red-700">
          Could not save just now. Your order is unaffected.
        </p>
      )}
    </div>
  );
}
