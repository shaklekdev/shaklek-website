"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The launch offer popup: give an email, get the welcome code.
//
// SHIPS INERT, like the Meta pixel, and for the same reason. It renders only
// when NEXT_PUBLIC_LAUNCH_CODE is set, so it cannot promise a discount that
// does not exist in Stripe. As of 2026-08-25 the only live promotion code is
// TEST99, so a popup hardcoded to "20% off" would have sent every signup to
// "That code isn't valid". Create the code first, then set the variable.
//
// It is NOT a consent mechanism. Signing up here grants nothing about cookies:
// consent bundled into an unrelated offer is not freely given, and it would
// only ever cover the few who sign up. The cookie bar asks separately.
//
// Timing rules, all of them there to avoid being hated:
//   - never before the visitor has seen something, so it waits
//   - never on /cart or /checkout, where it would interrupt a purchase
//   - never twice, whether they signed up or dismissed it
const CODE = process.env.NEXT_PUBLIC_LAUNCH_CODE;
const PERCENT = process.env.NEXT_PUBLIC_LAUNCH_PERCENT;
const SEEN_KEY = "shaklek.launchoffer.v1";
const DELAY_MS = 18000;

const BLOCKED = ["/cart", "/checkout", "/order-confirmed", "/dashboard"];

export default function LaunchOffer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const suppressed =
    !CODE || !PERCENT || BLOCKED.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (suppressed) return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(SEEN_KEY) !== null;
    } catch {
      // Storage blocked. Show it once this session rather than never; the
      // dismissal below simply will not persist.
    }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [suppressed]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }

  async function submit() {
    const value = email.trim();
    if (!value) return;
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "launch-offer" }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {}
    } catch {
      setState("idle");
      setError("That did not send. Please try again.");
    }
  }

  if (suppressed || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="launch-offer-title"
        className="w-full max-w-md border border-border-strong bg-surface p-6"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="float-right -mt-2 text-2xl leading-none text-text-3 hover:text-text"
        >
          &times;
        </button>

        {state === "done" ? (
          <>
            <h2 id="launch-offer-title" className="text-lg text-text">
              Here is your code
            </h2>
            <p className="mt-2 text-sm text-text-2">
              Use it at checkout for {PERCENT}% off your first piece.
            </p>
            <p className="mt-4 border border-border-strong bg-surface-2 px-4 py-3 text-center text-xl tracking-widest text-text">
              {CODE}
            </p>
            {/* Goes to the catalogue, not just away. Every other "Start
                designing" on the site points at /#catalog; this one only
                closed the dialog, so on /faq or /shipping it handed back the
                page the visitor was already stuck on. */}
            <Link
              href="/catalog"
              onClick={close}
              className="mt-4 block w-full bg-accent px-4 py-3 text-center text-sm text-white hover:bg-accent-light"
            >
              Start designing
            </Link>
          </>
        ) : (
          <>
            <h2 id="launch-offer-title" className="text-lg text-text">
              {PERCENT}% off your first piece
            </h2>
            <p className="mt-2 text-sm text-text-2">
              Timeless essentials, cut to your measurements. Leave your email and
              we will send you the launch code.
            </p>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="you@example.com"
              aria-label="Email address"
              className="mt-4 w-full border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
            />
            {error ? <p className="mt-2 text-sm text-[#a33]">{error}</p> : null}
            <button
              type="button"
              onClick={submit}
              disabled={state === "sending" || !email.trim()}
              className="mt-3 w-full bg-accent px-4 py-3 text-sm text-white hover:bg-accent-light disabled:opacity-50"
            >
              {state === "sending" ? "Sending" : "Send me the code"}
            </button>
            <p className="mt-3 text-xs text-text-3">
              One email with your code. We do not pass your address to anyone.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
