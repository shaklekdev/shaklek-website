"use client";

import { useState } from "react";

// Shaklek+ used to be a dashed box listing locked features and nothing to do
// about it -- an advert for something a customer could not have, sitting
// between them and checkout. It now collects an email for early access, which
// is the only useful thing that box can do before the features exist.
//
// Deliberately does NOT promise a date, a price, or that access is guaranteed.
// Everything listed below is either already built for staff (order tracking,
// saved measurements) or is a real locked slider in parameterSliders.ts, so
// nothing here is invented.
export default function ShaklekPlusSignup({
  source,
  compact = false,
}: {
  source: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const value = email.trim();
    if (!value) return;
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source }),
      });
      let data: { ok?: boolean; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok || data.ok === false) {
        setError(data.error ?? "We couldn't record that. Please try again.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("We couldn't reach us just then. Please check your connection.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="border border-gold/40 bg-surface-2 p-4">
        <p className="text-sm text-text">You&apos;re on the list.</p>
        <p className="mt-1 text-xs text-text-3">
          We&apos;ll write to you when Shaklek+ opens. No other email, ever.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gold/40 bg-surface-2 p-4">
      <p className="text-sm text-text">
        <span className="font-medium">Shaklek+</span> — in preview
      </p>
      <p className="mt-1 text-xs leading-relaxed text-text-3">
        {compact
          ? "More options on every piece, more colours, saved measurements and order tracking. Leave your email and we'll invite you when it opens."
          : "Coming: more ways to change each piece, more colours, saved measurements and order tracking. Leave your email and we'll invite you when it opens."}
      </p>

      <div className="mt-3 flex gap-2">
        <label htmlFor={`plus-email-${source}`} className="sr-only">
          Email for Shaklek+ early access
        </label>
        <input
          id={`plus-email-${source}`}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="you@example.com"
          autoComplete="email"
          className="min-w-0 flex-1 border border-border-strong bg-white p-2.5 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={state === "sending" || !email.trim()}
          className="shrink-0 border border-text bg-text px-4 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {state === "sending" ? "…" : "Notify me"}
        </button>
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
