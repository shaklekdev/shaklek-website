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
      <button
        type="button"
        disabled={state === "saving" || !ready}
        title={ready ? undefined : "Fill in your measurements first"}
        onClick={() => {
          if (isSignedIn) {
            void save(measurements);
            return;
          }
          pending.current = measurements;
          // Clerk's modal, not a redirect: leaving the page mid-design would
          // lose everything they have configured.
          clerk.openSignUp({});
        }}
        className="text-[13px] text-text underline underline-offset-4 hover:text-text-2 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40"
      >
        {state === "saving"
          ? "Saving…"
          : isSignedIn
            ? "Save these measurements to my account"
            : "Save my measurements for next time"}
      </button>
      <p className="mt-1 text-[11px] text-text-3">
        {!ready
          ? "Add your four measurements above to save them."
          : isSignedIn
            ? "Kept on your account for next time."
            : "Creates an account with your email. Your piece is cut to these numbers either way."}
      </p>
      {state === "error" && (
        <p role="alert" className="mt-1 text-[11px] text-red-700">
          Could not save just now. Your order is unaffected.
        </p>
      )}
    </div>
  );
}
