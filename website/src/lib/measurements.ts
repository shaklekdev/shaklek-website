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

// Where the "Save my measurements" button parks the numbers while the
// customer signs up. It has to outlive a possible navigation: the deployed
// environment sets NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/account, and
// although SaveMeasurements now overrides that per call, a sign-up that
// completes in another tab (email link) or any future redirect would still
// land the customer somewhere else with their numbers only in a React ref.
// /account drains the same key, so the save happens wherever they end up.
export const PENDING_MEASUREMENTS_KEY = "shaklek.pendingMeasurements.v2";

// ⚠️ THE STASH IS SOMEONE'S BODY MEASUREMENTS, AND IT EXPIRES.
//
// A security review of the first version caught this: the key was written
// before Clerk's modal opened and only ever cleared after a signed-in save.
// Dismiss the modal and it survives for the life of the tab. On a shared
// browser -- a family iPad, a shop display -- the next person to sign in had
// the previous person's measurements silently POSTed onto THEIR account,
// overwriting their own. Both directions are bad: one person's PII leaks, the
// other's tailoring data is clobbered, and the only UI is the word "Saved".
//
// So the stash carries the time it was written and is refused once stale. A
// sign-up takes a minute or two; fifteen is generous and closes the realistic
// window. The write is also cleared whenever a drain point loads with no
// sign-up in flight.
const PENDING_TTL_MS = 15 * 60 * 1000;

export function writePendingMeasurements(value: string, now: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PENDING_MEASUREMENTS_KEY,
      JSON.stringify({ v: value, ts: now }),
    );
  } catch {}
}

export function clearPendingMeasurements(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_MEASUREMENTS_KEY);
  } catch {}
}

/**
 * Returns the parked measurements, or undefined if there are none or they are
 * too old to be this person's. A stale entry is deleted rather than left to be
 * offered again on the next page.
 */
export function readPendingMeasurements(now: number): string | undefined {
  if (typeof window === "undefined") return undefined;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(PENDING_MEASUREMENTS_KEY);
  } catch {}
  if (!raw) return undefined;

  let parsed: { v?: unknown; ts?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearPendingMeasurements();
    return undefined;
  }

  const value = typeof parsed.v === "string" ? parsed.v : "";
  const ts = typeof parsed.ts === "number" ? parsed.ts : 0;
  // A clock that has moved backwards (timezone change, manual set) reads as a
  // future timestamp; treat that as untrustworthy rather than as fresh.
  if (!value || ts <= 0 || now - ts > PENDING_TTL_MS || ts > now + 60_000) {
    clearPendingMeasurements();
    return undefined;
  }
  return value;
}

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
  min: number;
  max: number;
}[] = [
  // No specimen placeholder. Both forms used to prefill the box with a
  // plausible number -- "90" in the bust field -- and print the accepted range
  // on a separate line below. That is two hints per field, one of which is
  // somebody else's measurement sitting where the customer's should be. The
  // range is now the placeholder in both places (founder, 2026-08-26).
  { key: "bust", label: "Bust / chest", min: 60, max: 160 },
  { key: "waist", label: "Waist", min: 50, max: 150 },
  { key: "hip", label: "Hip", min: 60, max: 170 },
  { key: "height", label: "Height", min: 130, max: 210 },
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
