"use client";

import { useEffect, useState } from "react";
import { SIZE_CHART, sizeLabel, sizesForCategory } from "@/data/sizeChart";
import { fitNotesForCategory } from "@/data/fitNotes";
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
  category,
  fitNotes,
  onFitNotesChange,
  initialMeasurements,
  onSizeModeChange,
  onSizeChange,
  onMeasurementsChange,
  onMeasurementsValidChange,
  detailSlot,
}: {
  sizeMode: SizeMode;
  size: string;
  // Which ladder to show. Trousers and skirts are bought as EU numbers, tops
  // as letters -- one chart, two labellings (sizeChart.ts).
  category: string;
  fitNotes: string[];
  onFitNotesChange: (ids: string[]) => void;
  measurements: string;
  initialMeasurements?: Partial<MeasurementFields>;
  onSizeModeChange: (mode: SizeMode) => void;
  onSizeChange: (size: string) => void;
  onMeasurementsChange: (measurements: string) => void;
  // Lets the parent gate Add to cart on complete, plausible measurements.
  // Optional so callers that don't gate don't have to care.
  onMeasurementsValidChange?: (valid: boolean) => void;
  // Rendered inside "Make it your way", after the chips. It is a slot rather
  // than an import so the free-text box and the chips can share one <details>
  // without this component knowing what a DetailField is.
  detailSlot?: React.ReactNode;
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
  // Empty for an uploaded design, whose garment type nobody has read yet --
  // the question then renders not at all rather than guessing a vocabulary.
  const options = fitNotesForCategory(category);
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
    /* The separation the founder asked for, in the place she asked for it:
       between the product characteristics above and Size, because THIS is
       where the customer moves to a new kind of decision. Leg width and Length
       describe the garment; Size describes the body. */
    <div className="mt-6 border-t border-border pt-6">
      {/* Tailored first and selected by default. Made-to-order only justifies
          its price if the garment is cut to the customer -- putting Standard
          first made the whole proposition opt-in. Standard stays one tap away
          for anyone who would rather not measure. Corners squared to match the
          rest of the customizer and the catalog. */}
      {/* Labelled like every other control on the page. Without it the fit
          buttons appeared straight after "Length" with nothing between them,
          so a customer read Cropped / Full / Tailored / Standard as one run of
          options and did not see that a new section had started. */}
      <p className="font-display text-[15px] text-text">Size</p>

      {/* Identical to the sliders above -- same grid, same widths, same
          selected colours. They were a different shape and colour, so the fit
          read as a separate kind of control when it is just another choice on
          the same page. The descriptions moved to one line underneath rather
          than being lost. */}
      {/* STANDARD IS LISTED FIRST because it is now the default (see
          designSpec.ts). A row whose first button is the unselected one reads
          as though something has already been chosen for you.

          "(free)" is on the button itself rather than only in the line
          underneath. Tailoring is the thing that justifies this brand's price,
          and moving the default away from it costs a nudge -- this is the nudge
          bought back. It also answers, at the moment of choosing, the question
          every customer actually has about made-to-measure, which is what it
          costs extra. Nothing, and the button now says so. */}
      <div className="mt-1.5 grid grid-cols-2 gap-1.5 lg:max-w-xs">
        {([
          ["standard", "Standard"],
          ["tailored", "Tailored (free)"],
        ] as const).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => onSizeModeChange(mode)}
            aria-pressed={sizeMode === mode}
            className={`flex min-h-11 cursor-pointer items-center justify-center border px-2 py-2 text-center text-xs transition-colors lg:min-h-0 lg:py-1.5 lg:text-[11px] ${
              sizeMode === mode
                ? "border-text bg-text text-white"
                : "border-border bg-white text-text-2 hover:border-border-strong hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* No helper line under this toggle. It said "Cut to your measurements,
          at no extra cost" and "Pick XS to XXL, or switch to Tailored..." --
          both of which the two buttons already say, one of them with the word
          "(free)" printed on it. Founder, 2026-08-26: too much. The size
          section is now the two buttons and the sizes. */}

      {sizeMode === "standard" ? (
        <>
          {/* 4-then-3 on a phone, one row from 640px. Trousers gained a 32,
              so seven buttons across a 342px screen would be ~42px each --
              under the 44px touch target, and "XXL" would be tight in it. */}
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {sizesForCategory(category).map((s) => (
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
                        sizeLabel(category, row) === size ? "bg-surface-2 text-text" : "text-text-2"
                      }`}
                    >
                      <th scope="row" className="py-2 pr-3 font-medium text-text">
                        {sizeLabel(category, row)}
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

          {/* "Anything usually wrong with this size?"
              Standard sizing used to be a letter and nothing else, while
              Tailored demanded four body measurements and blocked the purchase
              until it got them. Almost everyone lives in between: they know
              exactly what is wrong with their usual size and own no tape
              measure. This is that middle, and it is the brand's own sentence
              -- "those lovely shirts you wished had longer sleeves" is on
              /our-story -- turned into a control.

              Optional by construction. It sits below the size, it gates
              nothing, and an untouched question costs the customer one line of
              reading. See src/data/fitNotes.ts for why ids travel and labels
              do not. */}
          {options.length > 0 && (
            /* COLLAPSED BY DEFAULT, like the size chart above it.
               Founder, 2026-08-27: "make it your way, peut être retractable".
               Her reasoning is the good part -- a customer who does not want to
               think should be able to skip the whole thing with their eyes,
               and one who knows exactly what they want opens it. Making people
               think too hard is what stops the purchase.

               It also buys back most of the vertical space that was pushing
               Add to cart down the page, which was the other complaint. */
            <details className="group mt-4 border border-border-strong">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
                <span>
                  <span className="font-display block text-[15px] text-text">
                    Make it your way
                  </span>
                  <span className="mt-0.5 block text-[11px] text-text-3">
                    Tell us how you usually like your fit. Optional.
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-lg leading-none text-text-3 group-open:hidden"
                >
                  +
                </span>
                <span
                  aria-hidden="true"
                  className="hidden shrink-0 text-lg leading-none text-text-3 group-open:block"
                >
                  &minus;
                </span>
              </summary>
              <div className="border-t border-border px-4 py-4">
              {/* Same label treatment as SLEEVES, LENGTH and SIZE. This was
                  a 14px sentence in full-strength text, so one control on the
                  page shouted while its neighbours whispered -- which is what
                  made the column read as unfinished rather than considered.
                  The question moved down into the helper line, where the other
                  controls put their explanations. */}
                {/* The labels are the ADJUSTMENT wanted, never the fault
                    reported -- see fitNotes.ts. Ids are untouched, so orders
                    already placed still resolve. */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {options.map((n) => {
                  const on = fitNotes.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        onFitNotesChange(
                          on
                            ? fitNotes.filter((id) => id !== n.id)
                            : [...fitNotes, n.id],
                        )
                      }
                      className={`min-h-9 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        on
                          ? "border-text bg-text text-white"
                          : "border-border-strong bg-white text-text-2 hover:border-text hover:text-text"
                      }`}
                    >
                      {n.label}
                    </button>
                  );
                })}
              </div>
                {detailSlot}
              </div>
            </details>
          )}

        </>
      ) : (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FIELD_LABELS.map((f) => (
              <div key={f.key}>
                <label htmlFor={`measurement-${f.key}`} className="mb-1 block text-xs text-text-2">
                  {f.label}
                </label>
                {/* Green once the value is inside the accepted range. Users
                    reported not knowing what to type or whether a number was
                    acceptable: the field only ever spoke when it was unhappy,
                    so a correct entry got silence. */}
                <div
                  className={`flex items-center rounded-shaklek-xs border bg-white focus-within:border-accent ${
                    shownErrors[f.key]
                      ? "border-red-400"
                      : fields[f.key].trim() !== "" &&
                          Number(fields[f.key]) >= f.min &&
                          Number(fields[f.key]) <= f.max
                        ? "border-green-600"
                        : "border-border-strong"
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
                    /* The range IS the placeholder now (founder, 2026-08-26).
                       It used to be a specimen value -- "90" in the bust box --
                       with the range on a separate line underneath, so the box
                       showed a number that was not the customer's and the page
                       carried two hints per field. One hint, in the one place
                       the eye is already looking. "cm" is not repeated here
                       because the field already prints it against the right
                       edge. */
                    placeholder={`${f.min}\u2013${f.max}`}
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

            {/* "Cut to these measurements by your tailor. A stylist will
                confirm anything unclear before it's made." removed: the same
                stylist promise is made under "Add a detail" a few lines below,
                and the size hint above already says it is cut to these
                numbers. Saying it three times did not make it truer. */}
        </div>
      )}
    </div>
  );
}
