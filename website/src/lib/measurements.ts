// The measurement field set, and the pair of functions that flatten it to the
// single string `order_items.measurements` stores and read it back.
//
// This was extracted from SizePicker.tsx when the tech pack needed to parse
// measurements on the server: SizePicker is a "use client" component, and the
// alternative was a second parser in the route handler. Two parsers for one
// format drift, and this one decides what a tailor cuts to -- a measurement
// that silently fails to parse means a garment made to a size letter instead
// of to the customer's body.
//
// composeMeasurements and parseMeasurements are inverses and must stay that
// way; scripts/test-measurements.mjs round-trips them.

export type MeasurementFields = {
  bust: string;
  waist: string;
  hip: string;
  height: string;
  notes: string;
};

export const EMPTY_FIELDS: MeasurementFields = {
  bust: "",
  waist: "",
  hip: "",
  height: "",
  notes: "",
};

// These carried only `min="0"`, so a Tailored order could be placed with no
// measurements at all, or with `height: 5` / `waist: 9999`. Every unmakeable
// order costs a manual stylist round-trip against a fixed price, so the ranges
// are deliberately wide enough to fit any real adult body and narrow enough to
// catch a typo or an empty field.
export const FIELD_LABELS: {
  key: keyof Omit<MeasurementFields, "notes">;
  label: string;
  placeholder: string;
  min: number;
  max: number;
}[] = [
  { key: "bust", label: "Bust / chest", placeholder: "90", min: 60, max: 160 },
  { key: "waist", label: "Waist", placeholder: "74", min: 50, max: 150 },
  { key: "hip", label: "Hip", placeholder: "98", min: 60, max: 170 },
  { key: "height", label: "Height", placeholder: "165", min: 130, max: 210 },
];

export function composeMeasurements(fields: MeasurementFields): string {
  const parts = FIELD_LABELS.filter((f) => fields[f.key].trim()).map(
    (f) => `${f.label}: ${fields[f.key].trim()}cm`,
  );
  if (fields.notes.trim()) parts.push(fields.notes.trim());
  return parts.join(", ");
}

// The inverse of composeMeasurements. A cart line stores the flattened
// string ("Bust / chest: 90cm, Waist: 74cm, ..."), because that is the form
// the tailor's tech pack reads -- but reopening a line to edit it has to put
// the numbers back in their own inputs. Anything that doesn't parse as a known
// measurement is treated as the customer's free-text note rather than
// discarded.
export function parseMeasurements(measurements: string): MeasurementFields | undefined {
  if (!measurements.trim()) return undefined;
  const fields: MeasurementFields = { ...EMPTY_FIELDS };
  const leftovers: string[] = [];

  for (const part of measurements
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)) {
    const field = FIELD_LABELS.find((f) => part.startsWith(`${f.label}: `));
    const value = field ? part.slice(field.label.length + 2).replace(/cm$/, "").trim() : "";
    if (field && value) fields[field.key] = value;
    else leftovers.push(part);
  }

  fields.notes = leftovers.join(", ");
  return fields;
}
