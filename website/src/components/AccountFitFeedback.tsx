"use client";

import { useState } from "react";

/**
 * What she told us from /fit, shown back to her in her own account.
 *
 * ⚠️ SHE MUST BE ABLE TO SEE THIS, not only delete it. The feedback is
 * submitted from a page with no sign-in, keyed on a typed email -- so it is
 * the one thing on this site that could end up on her record without her
 * having been logged in when it was written. A delete button for data she has
 * never been shown is not really a control. Showing it also means she can
 * catch it if it is wrong, which is the cheapest correction in the system:
 * before the next garment is cut rather than after.
 */
export default function AccountFitFeedback({
  lines,
  note,
  at,
}: {
  lines: string[];
  note: string | null;
  at: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gone, setGone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (gone) {
    return (
      <div className="mt-4 border border-[#E7E0D2] p-5">
        <p className="text-sm text-text">Saved fit notes</p>
        <p className="mt-2 text-[13px] text-text-3">
          Deleted. Your tailor will not see it on your next order.
        </p>
      </div>
    );
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/fit-feedback", { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      setGone(true);
    } catch {
      setError("Could not delete. Try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 border border-[#E7E0D2] p-5">
      <p className="text-sm text-text">How your last piece fitted</p>
      <p className="mt-1 text-xs text-text-3">
        You sent this on {at}. Your tailor sees it when making your next piece.
      </p>

      <ul className="mt-3 space-y-1.5">
        {lines.map((l) => (
          <li key={l} className="text-[13.5px] text-text-2">
            {l}
          </li>
        ))}
        {lines.length === 0 && (
          <li className="text-[13.5px] text-text-3">
            You told us everything fitted as it should.
          </li>
        )}
      </ul>

      {note && (
        <p className="mt-3 border-l-2 border-gold pl-3 text-[13.5px] text-text-2 italic">
          {note}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3 text-xs">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-text-3 underline transition-colors hover:text-text"
          >
            Delete this
          </button>
        ) : (
          <>
            <span className="text-text-2">Delete your fit notes?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-700 underline disabled:opacity-40"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button onClick={() => setConfirming(false)} className="text-text-3 underline">
              Keep
            </button>
          </>
        )}
        {error && (
          <span role="alert" className="text-red-700">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
