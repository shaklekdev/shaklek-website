"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_REOPEN, readConsent, writeConsent } from "@/lib/consent";

// The consent bar.
//
// Deliberately a bar and not a modal. There are two things this site wants to
// interrupt a visitor with, and only one of them is worth a modal: the launch
// offer. A blocking cookie dialog on top of that is two overlays before anyone
// has seen a garment, and on a phone that is the whole screen.
//
// So: small, bottom, non blocking, dismissible by an actual choice. It is the
// legal surface, not a marketing one.
//
// DECLINE IS A REAL BUTTON, equal in weight to accept. A consent flow where
// refusing is hidden, greyed, or needs a second click is not freely given
// consent, and the pattern has a name and a fine attached to it in Europe.
export default function CookieConsent() {
  // Never render on the server: the answer lives in localStorage, so a
  // server-rendered bar would flash for people who already answered.
  const [state, setState] = useState<"hidden" | "asking">("hidden");

  useEffect(() => {
    if (readConsent() === "unset") setState("asking");
    // The footer link reopens this so a choice can be changed. Consent that
    // cannot be withdrawn as easily as it was given is not a lawful basis.
    const reopen = () => setState("asking");
    window.addEventListener(CONSENT_REOPEN, reopen);
    return () => window.removeEventListener(CONSENT_REOPEN, reopen);
  }, []);

  if (state === "hidden") return null;

  const choose = (v: "granted" | "denied") => {
    writeConsent(v);
    setState("hidden");
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-strong bg-surface px-4 py-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-2">
          We use one cookie to measure whether our ads lead to an order. Nothing
          else on this site tracks you.{" "}
          <Link href="/legal/privacy" className="underline">
            How we handle data
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="border border-border-strong px-4 py-2 text-sm text-text hover:bg-surface-2"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="bg-accent px-4 py-2 text-sm text-white hover:bg-accent-light"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
