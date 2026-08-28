"use client";

import { useState } from "react";

export type FitEntry = {
  id: string;
  lines: string[];
  note: string | null;
  at: string;
  orderRef: string | null;
};

/**
 * Everything she has told us from /fit, shown back to her in her own account.
 *
 * ⚠️ SHE MUST BE ABLE TO SEE THIS, not only delete it. The feedback is
 * submitted from a page with no sign-in, keyed on a typed email -- so it is
 * the one thing on this site that can reach her record while she is logged
 * out. A delete button for data she has never been shown is not a control.
 * Seeing it also lets her correct a wrong entry before the next garment is
 * cut, which is the cheapest correction in the system.
 *
 * A LIST, NOT ONE ENTRY, and never edited in place. Founder, 2026-08-28: "i
 * don't want anything to be overwritten, i don't want to lose any data." Each
 * entry names the order it was about, because one customer has several.
 */
export default function AccountFitFeedback({ entries }: { entries: FitEntry[] }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gone, setGone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (gone) {
    return (
      <div className="mt-4 border border-[#E7E0D2] p-5">
        <p className="text-sm text-text">Your fit notes</p>
        <p className="mt-2 text-[13px] text-text-3">
          Deleted. Your tailor will not see them on your next order.
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
      <p className="text-sm text-text">Your fit notes</p>
      <p className="mt-1 text-xs text-text-3">
        What you told us after wearing your pieces. Your tailor sees the most
        recent one when making your next order.
      </p>

      <ul className="mt-4 space-y-5">
        {entries.map((e) => (
          <li key={e.id} className="border-l-2 border-[#E7E0D2] pl-4">
            <p className="text-xs text-text-3">
              {e.at}
              {e.orderRef && <> · order {e.orderRef}</>}
            </p>
            <ul className="mt-1.5 space-y-1">
              {e.lines.map((l) => (
                <li key={l} className="text-[13.5px] text-text-2">
                  {l}
                </li>
              ))}
              {e.lines.length === 0 && (
                <li className="text-[13.5px] text-text-3">
                  You said everything fitted as it should.
                </li>
              )}
            </ul>
            {e.note && (
              <p className="mt-2 text-[13.5px] text-text-2 italic">{e.note}</p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-3 text-xs">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-text-3 underline transition-colors hover:text-text"
          >
            Delete {entries.length === 1 ? "this" : "all of these"}
          </button>
        ) : (
          <>
            {/* Says how many, because this cannot be undone and "delete" next
                to a list of five should not look like it removes one. */}
            <span className="text-text-2">
              Delete {entries.length === 1 ? "your fit note" : `all ${entries.length} fit notes`}?
            </span>
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
