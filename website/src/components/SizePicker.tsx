"use client";

import { useEffect, useState } from "react";
import { sizes } from "@/data/colors";
import { SIZE_CHART } from "@/data/sizeChart";
import type { SizeMode } from "@/data/designSpec";
// Shared with the tailor's tech pack, which parses these on the server --
// see src/lib/measurements.ts for why there is only one copy.
import {
  type MeasurementFields,
  EMPTY_FIELDS,
  FIELD_LABELS,
  composeMeasurements,
  parseMeasurements,
} from "@/lib/measurements";

export { parseMeasurements };

// Returns a human-readable problem per field, or null when the field is good.
function fieldError(
  field: (typeof FIELD_LABELS)[number],
  rawValue: string,
): string | null {
  const value = rawValue.trim();
  if (!value) return "Required for a tailored fit";
  const n = Number(value);
  if (!Number.isFinite(n)) return "Enter a number";
  if (n < field.min || n > field.max) return `Expected ${field.min}–${field.max}cm`;
  return null;
}

export function measurementErrors(fields: MeasurementFields): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  for (const field of FIELD_LABELS) {
    const error = fieldError(field, fields[field.key]);
    if (error) errors[field.key] = error;
  }
  return errors;
}

export default function SizePicker({
  sizeMode,
  size,
  initialMeasurements,
  onSizeModeChange,
  onSizeChange,
  onMeasurementsChange,
  onMeasurementsValidChange,
}: {
  sizeMode: SizeMode;
  size: string;
  measurements: string;
  initialMeasurements?: Partial<MeasurementFields>;
  onSizeModeChange: (mode: SizeMode) => void;
  onSizeChange: (size: string) => void;
  onMeasurementsChange: (measurements: string) => void;
  // Lets the parent gate Add to cart on complete, plausible measurements.
  // Optional so callers that don't gate don't have to care.
  onMeasurementsValidChange?: (valid: boolean) => void;
}) {
  const [fields, setFields] = useState<MeasurementFields>(EMPTY_FIELDS);
  // Errors only surface once a field has been visited, so the form doesn't
  // open covered in red before anyone has typed anything.
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});

  const errors = measurementErrors(fields);
  const shownErrors: Partial<Record<string, string>> = Object.fromEntries(
    Object.entries(errors).filter(([key]) => touched[key]),
  );

  // Standard sizing needs no measurements, so validity only depends on the
  // fields while Tailored is selected.
  const measurementsValid = sizeMode !== "tailored" || Object.keys(errors).length === 0;
  useEffect(() => {
    onMeasurementsValidChange?.(measurementsValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementsValid]);

  // Saved measurements load async (fetched from /account's data by the
  // parent) -- arrive after this component's first render, so seed the
  // fields once they show up rather than only on initial mount.
  useEffect(() => {
    if (!initialMeasurements) return;
    const next = { ...EMPTY_FIELDS, ...initialMeasurements };
    setFields(next);
    onMeasurementsChange(composeMeasurements(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMeasurements]);

  function updateField(key: keyof MeasurementFields, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    onMeasurementsChange(composeMeasurements(next));
  }

  return (
    <div className="mt-5">
      {/* Tailored first and selected by default. Made-to-order only justifies
          its price if the garment is cut to the customer -- putting Standard
          first made the whole proposition opt-in. Standard stays one tap away
          for anyone who would rather not measure. Corners squared to match the
          rest of the customizer and the catalog. */}
      {/* Labelled like every other control on the page. Without it the fit
          buttons appeared straight after "Length" with nothing between them,
          so a customer read Cropped / Full / Tailored / Standard as one run of
          options and did not see that a new section had started. */}
      <p className="text-[11px] tracking-wide text-text-3 uppercase">Size</p>

      {/* Identical to the sliders above -- same grid, same widths, same
          selected colours. They were a different shape and colour, so the fit
          read as a separate kind of control when it is just another choice on
          the same page. The descriptions moved to one line underneath rather
          than being lost. */}
      <div className="mt-1.5 grid grid-cols-2 gap-1.5 lg:max-w-xs">
        {(["tailored", "standard"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onSizeModeChange(mode)}
            aria-pressed={sizeMode === mode}
            className={`flex min-h-11 cursor-pointer items-center justify-center border px-2 py-2 text-center text-xs capitalize transition-colors lg:min-h-0 lg:py-1.5 lg:text-[11px] ${
              sizeMode === mode
                ? "border-text bg-text text-white"
                : "border-border bg-white text-text-2 hover:border-border-strong hover:text-text"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-text-3">
        {sizeMode === "tailored" ? "Cut to your measurements." : "Pick XS to XXL."}{" "}
        Same price either way, tailoring is included.
      </p>

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
          {/* XS-XXL was offered with nothing behind it, while the returns
              policy referred to a size chart that did not exist. Put it at the
              decision point rather than on a separate page nobody opens. */}
          <details className="mt-3 border border-border-strong">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm text-text marker:hidden">
              <span className="underline decoration-gold underline-offset-4">Size chart</span>
              <span className="ml-2 text-xs text-text-3">— body measurements in cm</span>
            </summary>
            <div className="overflow-x-auto border-t border-border px-4 py-3">
              <table className="w-full min-w-[420px] text-left text-xs">
                <caption className="sr-only">
                  Body measurements in centimetres for each standard size
                </caption>
                <thead>
                  <tr className="text-text-3">
                    <th scope="col" className="py-2 pr-3 font-normal">Size</th>
                    <th scope="col" className="py-2 pr-3 font-normal">UK</th>
                    <th scope="col" className="py-2 pr-3 font-normal">EU</th>
                    <th scope="col" className="py-2 pr-3 font-normal">Bust</th>
                    <th scope="col" className="py-2 pr-3 font-normal">Waist</th>
                    <th scope="col" className="py-2 font-normal">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr
                      key={row.size}
                      className={`border-t border-border ${
                        row.size === size ? "bg-surface-2 text-text" : "text-text-2"
                      }`}
                    >
                      <th scope="row" className="py-2 pr-3 font-medium text-text">
                        {row.size}
                      </th>
                      <td className="py-2 pr-3">{row.uk}</td>
                      <td className="py-2 pr-3">{row.eu}</td>
                      <td className="py-2 pr-3">{row.bust}</td>
                      <td className="py-2 pr-3">{row.waist}</td>
                      <td className="py-2">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-text-3">
                Measure your body, not a garment: bust at the fullest point, waist at
                the narrowest, hip at the fullest. Between two sizes, or not close to
                any of them? Switch to Tailored and give us your numbers instead —
                or read the{" "}
                <a href="/size-guide" className="underline" target="_blank" rel="noopener noreferrer">
                  full size guide
                </a>
                .
              </p>
            </div>
          </details>

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
                <div
                  className={`flex items-center rounded-shaklek-xs border bg-white focus-within:border-accent ${
                    shownErrors[f.key] ? "border-red-400" : "border-border-strong"
                  }`}
                >
                  <input
                    id={`measurement-${f.key}`}
                    type="number"
                    inputMode="decimal"
                    min={f.min}
                    max={f.max}
                    required
                    aria-invalid={Boolean(shownErrors[f.key])}
                    aria-describedby={shownErrors[f.key] ? `measurement-${f.key}-error` : undefined}
                    value={fields[f.key]}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, [f.key]: true }))}
                    placeholder={f.placeholder}
                    className="w-full bg-transparent p-3 text-sm text-text placeholder:text-text-3 focus:outline-none"
                  />
                  <span className="pr-3 text-xs text-text-3">cm</span>
                </div>
                {shownErrors[f.key] && (
                  <p id={`measurement-${f.key}-error`} className="mt-1 text-xs text-red-700">
                    {shownErrors[f.key]}
                  </p>
                )}
              </div>
            ))}
          </div>

            {/* The free-text box that sat here is gone. "Add a detail" asks
                the same question once, lower down the same page. Two boxes
                inviting the same note meant a customer could write making
                instructions into whichever they happened to see, and only one
                of them is labelled as the place a stylist reads. */}

          <p className="mt-2 text-xs text-text-3">
            Cut to these measurements by your tailor. A stylist will confirm anything
            unclear before it&apos;s made.
          </p>
        </div>
      )}
    </div>
  );
}
