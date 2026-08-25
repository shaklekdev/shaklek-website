"use client";

import { useEffect, useState } from "react";
import {
  EMPTY_FIELDS,
  FIELD_LABELS,
  composeMeasurements,
  parseMeasurements,
  type MeasurementFields,
} from "@/lib/measurements";
import SaveMeasurements from "@/components/SaveMeasurements";

/**
 * Measurement capture on the size guide.
 *
 * The founder's point, and it is the right one: the whole proposition rests on
 * the customer's own numbers, so the studio should be collecting them wherever
 * someone is already thinking about fit -- not only at the moment of purchase.
 *
 * Same validation as the fit step, from lib/measurements, so a number accepted
 * here cannot be rejected there. The ranges are wide enough for any real adult
 * body and narrow enough to catch a typo, which matters because an unmakeable
 * order costs a stylist round-trip against a fixed price.
 *
 * Pre-fills from the account for anyone signed in, so this doubles as "check
 * and update what we have" rather than only a first-time form.
 */
export default function SizeGuideMeasurements() {
  const [fields, setFields] = useState<MeasurementFields>(EMPTY_FIELDS);

  useEffect(() => {
    fetch("/api/account/measurements")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok || !data.measurements) return;
        const parsed =
          typeof data.measurements === "string"
            ? parseMeasurements(data.measurements)
            : undefined;
        if (parsed) setFields(parsed);
        else if (typeof data.measurements === "object")
          setFields({ ...EMPTY_FIELDS, ...data.measurements });
      })
      .catch(() => {});
  }, []);

  const complete = FIELD_LABELS.every((f) => {
    const v = Number(fields[f.key]);
    return fields[f.key].trim() !== "" && v >= f.min && v <= f.max;
  });

  return (
    <div className="not-prose mt-8 border border-border-strong bg-surface p-5">
      <h2 className="text-base font-medium text-text">Your measurements</h2>
      <p className="mt-1 text-[13px] text-text-2">
        Keep them here and every piece you order is cut to them, without typing
        them again.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FIELD_LABELS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-[11px] tracking-wide text-text-3 uppercase">
              {f.label} <span className="normal-case">cm</span>
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={f.min}
              max={f.max}
              value={fields[f.key]}
              placeholder={f.placeholder}
              onChange={(e) =>
                setFields((p) => ({ ...p, [f.key]: e.target.value }))
              }
              className="w-full border border-border-strong bg-white px-3 py-2 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
            />
          </label>
        ))}
      </div>

      <SaveMeasurements
        measurements={composeMeasurements(fields)}
        valid={complete}
        className="mt-4"
      />
      {!complete && (
        <p className="mt-4 text-[11px] text-text-3">
          Fill all four to save them.
        </p>
      )}
    </div>
  );
}
