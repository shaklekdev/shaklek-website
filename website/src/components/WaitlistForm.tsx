"use client";

import { useState } from "react";

// Posts to /api/waitlist, which already existed for Shaklek+ early access and
// already carries everything §0 asks of a public write route: rejectCrossOrigin,
// an 8KB body cap, a 5-per-10-minutes rate limit, a real email format check,
// and it deliberately never logs the address. Nothing new was built here.
//
// `source` is how the founder tells a pre-launch signup from a Shaklek+ one in
// her inbox. It is capped server-side at 40 characters.
type State = { status: "idle" | "sending" | "done" | "error"; message: string };

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle", message: "" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (state.status === "sending") return;
    setState({ status: "sending", message: "" });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "coming-soon" }),
      });
      const data = await res.json().catch(() => ({}));
      // Check res.ok AND the body flag. A route that rejects with a 400 still
      // returns JSON, and reading only `data.ok` on a 500 with an HTML body
      // would report success.
      if (!res.ok || data.ok === false) {
        setState({
          status: "error",
          message: typeof data.error === "string" ? data.error : "That did not go through. Please try again.",
        });
        return;
      }
      setState({ status: "done", message: "" });
    } catch {
      setState({ status: "error", message: "That did not go through. Please try again." });
    }
  }

  if (state.status === "done") {
    return (
      <p className="text-sm leading-relaxed text-text" role="status">
        Thank you. We will write once, when we open.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[48px] flex-1 rounded-none border border-border-strong bg-surface px-4 py-3 text-sm text-text placeholder:text-text-2 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={state.status === "sending"}
          className="min-h-[48px] rounded-none bg-text px-6 py-3 text-sm tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {state.status === "sending" ? "Sending" : "Notify me"}
        </button>
      </div>
      {/* Nothing under the input but an error, when there is one. The privacy
          link moved to the page foot so it does not cost a line of its own
          beside the field. */}
      {state.status === "error" ? (
        <p className="text-sm text-text-2" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
