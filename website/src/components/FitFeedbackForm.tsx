"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FIT_QUESTIONS,
  FIT_NOTE_MAX,
  FIT_GARMENT_LIST,
  GARMENT_QUESTION,
  garmentHasSleeves,
} from "@/data/fitFeedback";

/**
 * The form behind the QR on the thank-you card.
 *
 * Written for one situation and no other: a woman standing up, holding the
 * garment in one hand and her phone in the other, a minute after opening the
 * parcel. Everything here follows from that.
 *
 * - NO ACCOUNT, NO PASSWORD, NO ORDER NUMBER. Each one of those loses most of
 *   the people who scanned, and the email is enough for the server to find her.
 * - ONE EXCEPTION, ADDED 2026-09-05: "which piece is this about?", a single tap
 *   at the top. It is not an order lookup and it is not a reference number --
 *   she answers it by looking at what is in her hand. It exists because one
 *   card arrives in a parcel that may hold two garments, and without it the
 *   answers attach to the order and reach the tailor unattributable. It is
 *   also what lets the sleeves question disappear for trousers.
 * - TAP TARGETS, NOT A DROPDOWN. Five questions, three or four options each,
 *   all visible at once. A <select> on a phone is a modal per question.
 * - NOTHING IS PRE-SELECTED. "Just right" sits in the middle of every row
 *   rather than first, so a form filled in without reading cannot quietly
 *   collect "everything was fine".
 * - THE RESPONSE IS THE SAME WHATEVER HAPPENS. The route cannot tell her
 *   whether her email matched an order, because saying so would turn it into a
 *   customer-list oracle. So this screen never promises that it matched --
 *   it thanks her, which is true either way.
 */
export default function FitFeedbackForm() {
  const [email, setEmail] = useState("");
  const [garment, setGarment] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const emailLooksValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  // Hide the sleeves question for a garment that has none, rather than making
  // her pick "No sleeves on this piece". Unknown or unanswered keeps it, so
  // skipping the garment question never removes a question she could answer.
  const questions = FIT_QUESTIONS.filter(
    (q) => q.id !== "sleeves" || garmentHasSleeves(garment),
  );
  const answered = Object.keys(answers).length > 0 || note.trim().length > 0;
  const canSend = emailLooksValid && answered && state === "idle";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/fit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), garment, answers, note: note.trim() }),
      });
      if (!res.ok) throw new Error("failed");
      setState("done");
    } catch {
      setState("idle");
      setError("That did not send. Check your connection and try once more.");
    }
  }

  if (state === "done") {
    return (
      <div className="py-10 text-center">
        <p className="text-[22px] text-text">Noted, and kept.</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-2">
          Your tailor has this now. Your next piece starts here.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-block border border-text px-7 py-3 text-[13px] tracking-[0.08em] text-text transition-colors hover:bg-text hover:text-white"
        >
          SEE THE COLLECTION
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-9">
      <fieldset>
        <legend className="text-[15px] text-text">{GARMENT_QUESTION}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {FIT_GARMENT_LIST.map((g) => {
            const picked = garment === g.id;
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={picked}
                onClick={() => {
                  const next = picked ? null : g.id;
                  setGarment(next);
                  // ⚠️ CLEAR A SLEEVES ANSWER THE QUESTION NO LONGER ASKS.
                  // Answer the sleeves row, then tap Trousers, and without
                  // this the row stays in state and is submitted for a
                  // garment that has no sleeves -- an answer she can no
                  // longer see, correct or withdraw.
                  if (!garmentHasSleeves(next)) {
                    setAnswers((a) =>
                      Object.fromEntries(Object.entries(a).filter(([k]) => k !== "sleeves")),
                    );
                  }
                }}
                className={`min-h-11 rounded-full border px-4 py-2 text-[13px] transition-colors ${
                  picked
                    ? "border-text bg-text text-white"
                    : "border-[#DDD6C8] text-text-2 hover:border-text"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {questions.map((q) => (
        <fieldset key={q.id}>
          <legend className="text-[15px] text-text">{q.label}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {q.options.map((o) => {
              const picked = answers[q.id] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={picked}
                  onClick={() =>
                    setAnswers((a) =>
                      // Tapping the chosen option again clears it. A radio
                      // group with no reset traps someone who mis-tapped into
                      // sending an answer she does not mean.
                      a[q.id] === o.id
                        ? Object.fromEntries(Object.entries(a).filter(([k]) => k !== q.id))
                        : { ...a, [q.id]: o.id },
                    )
                  }
                  /* min-h-11 keeps every option at a 44px touch target
                     (WCAG 2.5.8) without forcing the labels onto one line. */
                  className={`min-h-11 rounded-full border px-4 py-2 text-[13px] transition-colors ${
                    picked
                      ? "border-text bg-text text-white"
                      : "border-[#DDD6C8] text-text-2 hover:border-text"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div>
        <label htmlFor="fit-note" className="block text-[15px] text-text">
          Anything else you would change?
        </label>
        <textarea
          id="fit-note"
          value={note}
          maxLength={FIT_NOTE_MAX}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="In your own words. The tailor reads this."
          className="mt-3 w-full border border-[#DDD6C8] px-4 py-3 text-[14px] text-text placeholder:text-text-3 focus:border-text focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="fit-email" className="block text-[15px] text-text">
          Your email
        </label>
        <p className="mt-1 text-[12.5px] text-text-3">
          Only so we can put this with your order. Nothing else is sent to you.
        </p>
        <input
          id="fit-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          maxLength={254}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-3 w-full border border-[#DDD6C8] px-4 py-3 text-[14px] text-text placeholder:text-text-3 focus:border-text focus:outline-none"
        />
      </div>

      {error && <p className="text-[13px] text-accent">{error}</p>}

      <button
        type="submit"
        disabled={!canSend}
        className="w-full bg-text py-4 text-[13px] tracking-[0.08em] text-white transition-opacity disabled:opacity-35"
      >
        {state === "sending" ? "SENDING…" : "SEND TO MY TAILOR"}
      </button>
    </form>
  );
}
