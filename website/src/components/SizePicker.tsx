"use client";

import { useState } from "react";
import { sizes } from "@/data/colors";
import type { SizeMode } from "@/data/designSpec";

type MeasurementFields = {
  bust: string;
  waist: string;
  hip: string;
  height: string;
  notes: string;
};

const EMPTY_FIELDS: MeasurementFields = { bust: "", waist: "", hip: "", height: "", notes: "" };

const FIELD_LABELS: { key: keyof Omit<MeasurementFields, "notes">; label: string; placeholder: string }[] = [
  { key: "bust", label: "Bust / chest", placeholder: "90" },
  { key: "waist", label: "Waist", placeholder: "74" },
  { key: "hip", label: "Hip", placeholder: "98" },
  { key: "height", label: "Height", placeholder: "165" },
];

function composeMeasurements(fields: MeasurementFields): string {
  const parts = FIELD_LABELS.filter((f) => fields[f.key].trim()).map(
    (f) => `${f.label}: ${fields[f.key].trim()}cm`,
  );
  if (fields.notes.trim()) parts.push(fields.notes.trim());
  return parts.join(", ");
}

export default function SizePicker({
  sizeMode,
  size,
  onSizeModeChange,
  onSizeChange,
  onMeasurementsChange,
}: {
  sizeMode: SizeMode;
  size: string;
  measurements: string;
  onSizeModeChange: (mode: SizeMode) => void;
  onSizeChange: (size: string) => void;
  onMeasurementsChange: (measurements: string) => void;
}) {
  const [fields, setFields] = useState<MeasurementFields>(EMPTY_FIELDS);

  function updateField(key: keyof MeasurementFields, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    onMeasurementsChange(composeMeasurements(next));
  }

  return (
    <div className="mt-5">
      <div className="flex gap-3">
        <button
          onClick={() => onSizeModeChange("standard")}
          aria-pressed={sizeMode === "standard"}
          className={`flex-1 rounded-shaklek-xs border px-4 py-3 text-left text-sm transition-colors ${
            sizeMode === "standard" ? "border-accent bg-surface-2" : "border-border-strong"
          }`}
        >
          <span className="block font-medium text-text">Standard</span>
          <span className="text-xs text-text-3">Free bucket size</span>
        </button>
        <button
          onClick={() => onSizeModeChange("tailored")}
          aria-pressed={sizeMode === "tailored"}
          className={`flex-1 rounded-shaklek-xs border px-4 py-3 text-left text-sm transition-colors ${
            sizeMode === "tailored" ? "border-accent bg-surface-2" : "border-border-strong"
          }`}
        >
          <span className="block font-medium text-text">Tailored</span>
          <span className="text-xs text-gold">Made to your measurements</span>
        </button>
      </div>

      {sizeMode === "standard" ? (
        <>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => onSizeChange(s)}
                aria-pressed={s === size}
                className={`rounded-shaklek-xs border py-3 font-display text-sm transition-colors ${
                  s === size
                    ? "border-accent bg-accent text-white"
                    : "border-border-strong text-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-3">
            No measurement needed. Want a more precise fit? Switch to Tailored above.
          </p>
        </>
      ) : (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FIELD_LABELS.map((f) => (
              <div key={f.key}>
                <label htmlFor={`measurement-${f.key}`} className="mb-1 block text-xs text-text-2">
                  {f.label}
                </label>
                <div className="flex items-center rounded-shaklek-xs border border-border-strong bg-white focus-within:border-accent">
                  <input
                    id={`measurement-${f.key}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={fields[f.key]}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-shaklek-xs bg-transparent p-3 text-sm text-text placeholder:text-text-3 focus:outline-none"
                  />
                  <span className="pr-3 text-xs text-text-3">cm</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label htmlFor="measurement-notes" className="mb-1 block text-xs text-text-2">
              Anything else the tailor should know (optional)
            </label>
            <textarea
              id="measurement-notes"
              value={fields.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={2}
              placeholder="e.g. shoulder width, inseam, a fit you liked before"
              className="w-full rounded-shaklek-xs border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
            />
          </div>

          <p className="mt-2 text-xs text-text-3">
            Cut to these measurements by your tailor — no AI involved, just sent straight
            through. A stylist will confirm anything unclear before it&apos;s made.
          </p>
        </div>
      )}
    </div>
  );
}
