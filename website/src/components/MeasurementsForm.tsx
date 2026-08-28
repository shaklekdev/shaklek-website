"use client";

import { useEffect, useState } from "react";
import {
  clearPendingMeasurements,
  FIELD_LABELS,
  parseMeasurements,
  readPendingMeasurements,
} from "@/lib/measurements";

type Measurements = { bust: string; waist: string; hip: string; height: string; notes: string };

const EMPTY: Measurements = { bust: "", waist: "", hip: "", height: "", notes: "" };

// These four were declared a second time here, with their own labels and
// their own specimen placeholders and no ranges at all -- so the same four
// boxes behaved differently depending on which page you met them on. One
// source, shared with SizePicker's Tailored mode.
const FIELDS = FIELD_LABELS;

export default function MeasurementsForm() {
  const [fields, setFields] = useState<Measurements>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Two-step, no browser confirm(). A native confirm() blocks the page and
  // reads as a system error; this is the customer's own data and she is
  // allowed to remove it without being interrogated -- but not with one
  // mis-tap next to Save.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Drains anything the "Save my measurements" button parked before sending
  // the customer through sign-up.
  //
  // The button opens Clerk's modal in place and overrides the redirect so it
  // stays put, but a sign-up completed from an email link in another tab --
  // or any future change to that redirect -- lands here instead, with the
  // numbers only in sessionStorage. Without this, that customer typed their
  // measurements, created an account because we asked them to, and arrived on
  // a page showing four empty boxes. Draining it here means the save lands
  // wherever the flow ends up.
  useEffect(() => {
    // Expires after fifteen minutes -- see lib/measurements.ts. On a shared
    // browser an abandoned sign-up must not hand its measurements to whoever
    // signs in next.
    const pending = readPendingMeasurements(Date.now());
    const parsed = pending ? parseMeasurements(pending) : undefined;

    fetch("/api/account/measurements")
      .then((res) => res.json())
      .then((data) => {
        // The pending numbers are the ones just typed, so they win over
        // whatever was stored before.
        if (parsed) setFields(parsed);
        else if (data.ok && data.measurements) setFields(data.measurements);
        setLoaded(true);
      })
      .catch(() => {
        if (parsed) setFields(parsed);
        setLoaded(true);
      })
      .then(async () => {
        if (!pending || !parsed) return;
        try {
          const res = await fetch("/api/account/measurements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed),
          });
          if (res.ok) setSaved(true);
        } catch {
          // Left in the form for them to save by hand rather than lost.
        }
        clearPendingMeasurements();
      });
  }, []);

  function updateField(key: keyof Measurements, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setSaved(false);
    setError(null);
  }

  // ⚠️ THIS SAID "Saved" FOR AN EMPTY FORM, AND FOR A FAILED REQUEST.
  //
  // It had no validation at all and called setSaved(true) unconditionally --
  // so pressing Save with every box empty wrote five empty columns and showed
  // the customer a confirmation, and a 401 or a 500 did exactly the same. That
  // is the failure shape planning/security/rca-2026-08-27.md names as the
  // common cause of all five bugs written up the same night: a success signal
  // derived from a proxy ("the request returned") instead of from the effect.
  //
  // Reported by a reviewer who was signed in: "clicking on Save measurements
  // marks save even if I put nothing."
  //
  // Same ranges as the other two forms, from lib/measurements, so a number
  // accepted here cannot be rejected at checkout.
  const filled = FIELD_LABELS.filter((f) => fields[f.key].trim() !== "");
  const outOfRange = filled.filter((f) => {
    const v = Number(fields[f.key]);
    return !Number.isFinite(v) || v < f.min || v > f.max;
  });
  const hasSomething = filled.length > 0 || fields.notes.trim() !== "";
  const canSave = hasSomething && outOfRange.length === 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      // fetch resolves on 401 and 500 -- only res.ok means it was written.
      if (!res.ok) {
        setError("Could not save just now. Please try again.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Could not save just now. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  const hasAnySaved = Object.values(fields).some((v) => String(v ?? "").trim() !== "");

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/measurements", { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      // Clear what is on screen too. Leaving the numbers in the inputs after a
      // successful delete makes it look as though nothing happened, and the
      // next Save would silently write them all back.
      setFields(EMPTY);
      setConfirmingDelete(false);
    } catch {
      setError("Could not delete. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-shaklek-sm border border-border bg-surface p-5">
      <p className="text-sm text-text">Saved measurements</p>
      <p className="mt-1 text-xs text-text-2">
        Used to pre-fill Tailored sizing on future orders, so you don&apos;t re-enter it every time.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`saved-${f.key}`} className="mb-1 block text-xs text-text-2">
              {f.label}
            </label>
            <div className="flex items-center rounded-shaklek-xs border border-border-strong bg-white focus-within:border-accent">
              <input
                id={`saved-${f.key}`}
                type="number"
                inputMode="decimal"
                min={f.min}
                max={f.max}
                value={fields[f.key]}
                onChange={(e) => updateField(f.key, e.target.value)}
                /* The accepted range, in the box, same as the design page. */
                placeholder={`${f.min}\u2013${f.max}`}
                className="w-full rounded-shaklek-xs bg-transparent p-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none"
              />
              <span className="pr-2.5 text-xs text-text-3">cm</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <label htmlFor="saved-notes" className="mb-1 block text-xs text-text-2">
          Anything else the tailor should know (optional)
        </label>
        <textarea
          id="saved-notes"
          value={fields.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={2}
          placeholder="e.g. shoulder width, inseam, a fit you liked before"
          className="w-full rounded-shaklek-xs border border-border-strong bg-white p-2.5 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          title={
            canSave
              ? undefined
              : outOfRange.length > 0
                ? "Check the highlighted measurement"
                : "Add a measurement first"
          }
          className="rounded-full bg-accent px-5 py-2 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs text-gold">Saved</span>}

        {/* legal/privacy promises this: "you can delete saved measurements
            from your account at any time". Until 2026-08-28 nothing on the
            site actually did it. */}
        {!confirmingDelete ? (
          hasAnySaved && (
            <button
              onClick={() => { setConfirmingDelete(true); setSaved(false); }}
              className="ml-auto text-xs text-text-3 underline transition-colors hover:text-text"
            >
              Delete these
            </button>
          )
        ) : (
          <span className="ml-auto flex items-center gap-3 text-xs">
            <span className="text-text-2">Delete your saved measurements?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-700 underline disabled:opacity-40"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button onClick={() => setConfirmingDelete(false)} className="text-text-3 underline">
              Keep
            </button>
          </span>
        )}
        {error && (
          <span role="alert" className="text-xs text-red-700">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
