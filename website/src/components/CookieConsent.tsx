"use client";

import { useEffect, useRef, useState } from "react";
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
// DECLINE IS A REAL BUTTON, ONE CLICK, ALWAYS VISIBLE. A consent flow where
// refusing is hidden or needs a second click is not freely given consent, and
// "Accept + Learn more" has a name and a fine attached to it in Europe (CNIL).
// Founder, 2026-11-05, wanted Accept as the only option; she agreed instead to:
// Accept as the prominent button, Decline as a quieter one-click text button
// beside it, friendlier words, and the bar arriving after a few seconds rather
// than over the first image. That raises acceptance without hiding refusal.
export default function CookieConsent() {
  // Never render on the server: the answer lives in localStorage, so a
  // server-rendered bar would flash for people who already answered.
  const [state, setState] = useState<"hidden" | "asking">("hidden");

  useEffect(() => {
    // A few seconds after landing (or on the first scroll), not over the first
    // image. Reopening from the footer is immediate.
    let t: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      if (readConsent() === "unset") setState("asking");
      window.removeEventListener("scroll", show);
      if (t) clearTimeout(t);
    };
    if (readConsent() === "unset") {
      t = setTimeout(show, 4000);
      window.addEventListener("scroll", show, { passive: true, once: true });
    }
    // The footer link reopens this so a choice can be changed. Consent that
    // cannot be withdrawn as easily as it was given is not a lawful basis.
    const reopen = () => setState("asking");
    window.addEventListener(CONSENT_REOPEN, reopen);
    return () => {
      window.removeEventListener(CONSENT_REOPEN, reopen);
      window.removeEventListener("scroll", show);
      if (t) clearTimeout(t);
    };
  }, []);

  // ⚠️ PUBLISHES ITS OWN HEIGHT AS --consent-h so the product page's sticky
  // Add-to-cart bar can sit ABOVE it instead of under it. Before this the bar
  // (z-50, ~163px on a phone) covered the sticky button on every first visit,
  // i.e. every ad click. Site review, 2026-11-01.
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const el = barRef.current;
    if (state === "hidden" || !el) {
      root.style.removeProperty("--consent-h");
      return;
    }
    const set = () => root.style.setProperty("--consent-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--consent-h");
    };
  }, [state]);

  if (state === "hidden") return null;

  const choose = (v: "granted" | "denied") => {
    writeConsent(v);
    setState("hidden");
  };

  return (
    <div
      ref={barRef}
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-strong bg-surface px-4 py-2 sm:px-6"
    >
      <div className="mx-auto flex max-w-4xl flex-row items-center justify-between gap-3">
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
        {/* Founder, 2026-11-09: "way too long ... why are we dragging this much
            attention". One line; the detail lives on /legal/privacy (layered
            notice, see above). */}
        {/* ONE LINE on a 360px phone (shaklek-ui walk 2026-11-14): smaller
            text and buttons below sm, wording unchanged. */}
        <p className="text-[11px] leading-tight text-text-2 sm:text-sm">
          We use cookies to improve our ads.{" "}
          <Link href="/legal/privacy" className="underline">
            Privacy
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="min-h-[44px] px-1 text-xs text-text-2 underline underline-offset-4 hover:text-text sm:px-2 sm:text-sm"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="min-h-[44px] rounded-full bg-accent px-4 py-2 text-xs text-white hover:bg-accent-light sm:px-5 sm:text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
