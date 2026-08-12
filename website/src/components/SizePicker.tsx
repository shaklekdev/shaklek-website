"use client";

import { sizes } from "@/data/colors";
import type { SizeMode } from "@/data/designSpec";

export default function SizePicker({
  sizeMode,
  size,
  measurements,
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
  return (
    <div className="mt-8">
      <p className="mb-3 text-sm text-text">Size</p>
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
          <label className="mb-2 block text-sm text-text">Your measurements</label>
          <textarea
            value={measurements}
            onChange={(e) => onMeasurementsChange(e.target.value)}
            rows={3}
            placeholder="e.g. bust 90cm, waist 74cm, hip 98cm, height 165cm"
            className="w-full rounded-shaklek-xs border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
          />
          <p className="mt-2 text-xs text-text-3">
            Cut to these measurements by your tailor — no AI involved, just sent straight
            through. A stylist will confirm anything unclear before it&apos;s made.
          </p>
        </div>
      )}
    </div>
  );
}
