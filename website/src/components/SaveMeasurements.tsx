"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
// Survives the sign-up round trip in the tab, not just in React state. See
// the redirect note on openSignUp below: this is the belt to that braces,
// and /account drains the same key. It expires -- see lib/measurements.ts for
// the shared-browser reason why.
import {
  clearPendingMeasurements,
  readPendingMeasurements,
  writePendingMeasurements,
} from "@/lib/measurements";

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

const NEEDS_NUMBERS = "Add your measurements above to be able to save.";

export default function SaveMeasurements({
  measurements,
  valid,
  className = "",
}: {
  measurements: string;
  valid: boolean;
  className?: string;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  // The tooltip is shown on hover, on keyboard focus, and on a tap that could
  // not proceed. It is NEVER standing text under the button -- the founder's
  // note was that a permanent sentence below the control reads as a paragraph
  // rather than as the reason the button did nothing.
  const [tipFromPointer, setTipFromPointer] = useState(false);
  const [tipFromTap, setTipFromTap] = useState(false);

  // Held across the sign-up round trip. The customer typed these BEFORE an
  // account existed, and losing them to the redirect would make the feature
  // pointless -- they would have to type them a second time, which is the
  // exact problem being solved.
  const pending = useRef<string | null>(null);

  const save = useCallback(async (value: string) => {
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
    clearPendingMeasurements();
  }, []);

  // Fires after Clerk reports a session. The POST is authorised by
  // getVerifiedEmail() on the server, so it MUST happen after sign-up
  // completes -- attempting it earlier is correctly rejected.
  //
  // Reads sessionStorage as well as the ref, because Clerk's sign-up can
  // navigate (email-link verification, or an environment default redirect)
  // and a remount would lose a value that only lived in a ref.
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      // Nobody is signing up in this component right now, so anything still
      // parked belongs to a sign-up that was abandoned -- possibly by someone
      // else on a shared browser. Drop it rather than let it be adopted by
      // whoever signs in next.
      if (!pending.current) clearPendingMeasurements();
      return;
    }
    const value = pending.current ?? readPendingMeasurements(Date.now());
    if (!value) return;
    pending.current = null;
    void save(value);
  }, [isLoaded, isSignedIn, save]);

  // ALWAYS RENDERED, disabled until the numbers are complete.
  //
  // This used to return null unless the measurements were already valid, which
  // meant the feature was invisible to anyone who had not finished typing --
  // there was no sign it existed at all. The founder looked for it twice and
  // concluded it had not been built. A capture prompt nobody can see captures
  // nothing.
  const ready = valid && Boolean(measurements.trim());
  const showTip = !ready && (tipFromPointer || tipFromTap);

  useEffect(() => {
    if (ready) setTipFromTap(false);
  }, [ready]);

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
          she reported the sign-up popup as missing.

          It stays enabled even when the measurements are incomplete. A
          disabled button on a phone does nothing when tapped and explains
          nothing, so instead the tap raises the tooltip and takes them to the
          fields. */}
      <div className="relative inline-block w-full sm:w-auto">
        {/* Absolutely positioned, so nothing below the button moves when it
            appears and the sentence never becomes part of the page. */}
        {showTip && (
          <span
            id="save-measurements-tip"
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 w-max max-w-[min(18rem,calc(100vw-3rem))] border border-border-strong bg-text px-3 py-2 text-[12px] leading-snug text-white shadow-sm"
          >
            {NEEDS_NUMBERS}
          </span>
        )}

        <button
          type="button"
          disabled={state === "saving"}
          aria-describedby={showTip ? "save-measurements-tip" : undefined}
          onMouseEnter={() => setTipFromPointer(true)}
          onMouseLeave={() => setTipFromPointer(false)}
          onFocus={() => setTipFromPointer(true)}
          onBlur={() => setTipFromPointer(false)}
          onClick={() => {
            if (!ready) {
              setTipFromTap(true);
              document
                .querySelector("input[type=number]")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
              return;
            }
            setTipFromTap(false);
            if (isSignedIn) {
              void save(measurements);
              return;
            }
            pending.current = measurements;
            writePendingMeasurements(measurements, Date.now());
            // Clerk's modal, not a redirect: leaving the page mid-design would
            // lose everything already configured.
            //
            // forceRedirectUrl is NOT optional here. The deployed environment
            // sets NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/account, so
            // without this override a completed sign-up threw the customer off
            // the design page to /account -- the modal opened, they signed up,
            // and the measurements they had just typed were never saved and
            // never seen again. forceRedirectUrl takes precedence over the
            // environment variable, which keeps them here so the effect above
            // can run the POST.
            clerk.openSignUp({
              forceRedirectUrl: window.location.href,
              fallbackRedirectUrl: window.location.href,
            });
          }}
          className={`w-full border px-5 py-3 text-sm transition-colors sm:w-auto ${
            ready
              ? "border-text bg-text text-white hover:opacity-90"
              : "border-border-strong bg-white text-text-2 hover:border-text hover:text-text"
          } disabled:opacity-60`}
        >
          {state === "saving" ? "Saving…" : "Save my measurements"}
        </button>
      </div>

      {ready && !isSignedIn && (
        <p className="mt-2 text-[11px] text-text-3">
          Opens a quick sign-up: an email and a password, nothing else. Your
          piece is cut to these numbers either way.
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
