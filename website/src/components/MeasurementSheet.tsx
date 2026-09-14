"use client";

import { useState } from "react";

/**
 * The tailor's measurement sheet, as the founder fills it in.
 *
 * Her instruction, 2026-09-15: "whenever i go to size someone, i will fill the
 * measurements there and it needs to update the database."
 *
 * ⚠️ THE ORDER OF THE FIELDS IS THE TAILOR'S ORDER, not alphabetical and not
 * grouped by garment. She works down his sheet with a tape in one hand, so a
 * field out of sequence is a field she has to hunt for mid-appointment. Source:
 * planning/frontend-todo.md:68-72.
 *
 * ⚠️ FREE TEXT, NOT NUMBER INPUTS. "92", "92.5" and "92 (over the bust)" are
 * all things she will write, and a number input silently refuses the third and
 * loses the part that mattered. Nothing computes on these.
 */
const FIELDS = [
  { key: "measurementWaist", label: "Waist" },
  { key: "measurementHip", label: "Hips" },
  { key: "measurementBust", label: "Chest" },
  { key: "measurementStomach", label: "Stomach" },
  { key: "measurementShoulder", label: "Shoulder" },
  { key: "measurementNeck", label: "Neck" },
  { key: "measurementThigh", label: "Thigh" },
  { key: "measurementCrotch", label: "Crotch" },
  { key: "measurementShirtLength", label: "Shirt length" },
  { key: "measurementSleeveLength", label: "Sleeve length" },
  { key: "measurementTrouserLength", label: "Trouser length" },
  { key: "measurementHeight", label: "Height" },
] as const;

type Values = Partial<Record<(typeof FIELDS)[number]["key"] | "measurementFittingNotes", string | null>>;

export default function MeasurementSheet({
  customerId,
  initial,
  measuredAt,
}: {
  customerId: string;
  initial: Values;
  measuredAt: Date | string | null;
}) {
  const [values, setValues] = useState<Values>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(
    measuredAt ? new Date(measuredAt).toISOString() : null,
  );

  const set = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    // Any edit invalidates a previous "Saved", so the tick cannot linger over
    // unsaved changes and tell her the room's numbers are in when they are not.
    if (state !== "idle") setState("idle");
  };

  async function save() {
    setState("saving");
    setMessage(null);
    try {
      const res = await fetch(`/api/dashboard/customers/${customerId}/measurements`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(typeof data?.error === "string" ? data.error : "Could not save");
        return;
      }
      setState("saved");
      if (data?.measuredAt) setSavedAt(data.measuredAt);
    } catch {
      setState("error");
      setMessage("Could not save. Check the connection and try again.");
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-medium text-slate-900">Measurements</h2>
        <p className="text-xs text-slate-500">
          {savedAt
            ? `Measured ${new Date(savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
            : "Not measured yet"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-xs text-slate-500">{f.label}</span>
            <input
              type="text"
              inputMode="decimal"
              value={values[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="block text-xs text-slate-500">
          Anything specific to the design, or to her
        </span>
        <textarea
          value={values.measurementFittingNotes ?? ""}
          onChange={(e) => set("measurementFittingNotes", e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="One shoulder lower, prefers more ease through the hip, posture the block should allow for."
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={state === "saving"}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {state === "saving" ? "Saving..." : "Save measurements"}
        </button>
        {state === "saved" ? <span className="text-sm text-emerald-700">Saved</span> : null}
        {state === "error" ? <span className="text-sm text-rose-700">{message}</span> : null}
      </div>
    </section>
  );
}
