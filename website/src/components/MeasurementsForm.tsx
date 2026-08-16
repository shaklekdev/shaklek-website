"use client";

import { useEffect, useState } from "react";

type Measurements = { bust: string; waist: string; hip: string; height: string; notes: string };

const EMPTY: Measurements = { bust: "", waist: "", hip: "", height: "", notes: "" };

const FIELDS: { key: keyof Omit<Measurements, "notes">; label: string; placeholder: string }[] = [
  { key: "bust", label: "Bust / chest", placeholder: "90" },
  { key: "waist", label: "Waist", placeholder: "74" },
  { key: "hip", label: "Hip", placeholder: "98" },
  { key: "height", label: "Height", placeholder: "165" },
];

export default function MeasurementsForm() {
  const [fields, setFields] = useState<Measurements>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/account/measurements")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.measurements) setFields(data.measurements);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function updateField(key: keyof Measurements, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/account/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

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
                min="0"
                value={fields[f.key]}
                onChange={(e) => updateField(f.key, e.target.value)}
                placeholder={f.placeholder}
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
          disabled={saving}
          className="rounded-full bg-accent px-5 py-2 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs text-gold">Saved</span>}
      </div>
    </div>
  );
}
