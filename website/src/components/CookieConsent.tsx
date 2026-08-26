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
        {/* Never a COUNT. Two cookies are set, _fbp always and _fbc on an ad
            click, and lib/consent.ts deletes both; an earlier "one cookie"
            understated the ask and contradicted the code behind it.

            The processor is deliberately NOT named here. Founder, 2026-08-26:
            naming Meta on the banner is not what anyone else does, and she is
            right. Layered notice is the accepted approach: the bar carries the
            plain statement, and legal/privacy names Meta, links to their policy
            and states the joint-controller position, one tap away. GDPR
            requires the information be accessible, not that all of it sit on
            the banner. Nothing is hidden by dropping two words.

            Wording matches legal/privacy deliberately. A consent bar and the
            policy it links to describing the same thing differently is how a
            site ends up making a statement that is true in one place and not
            the other. */}
        {/* No form of the word "track" appears here. Founder rule, 2026-08-25,
            customer-facing copy. The e2e suite asserts it, because a standing
            brand rule outlives the edit that introduced it.

            "tell us nothing about who you are" is deliberate and verified: the
            pixel initialises with no Advanced Matching, and every event carries
            only product slugs, quantities, an order id, value and currency. No
            name, email, address, phone or measurements. It is a claim about
            what WE receive; Meta may still recognise a visitor from their own
            login, which is Meta's data and not something this site sends. The
            founder's own suggestion, "nothing is collecting any information",
            was rejected as false: the pixel does collect behaviour, and Meta is
            a joint controller for it. */}
        <p className="text-sm text-text-2">
          With your permission, we use cookies to see how our advertising
          performs. They tell us nothing about who you are, and we run no other
          analytics.{" "}
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
