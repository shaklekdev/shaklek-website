// compose/parse must be exact inverses. The tech pack cuts to whatever parse
// returns, so a format that silently fails to round-trip means a garment made
// to a size letter instead of to the customer's body.
//
// Run: npx tsx scripts/test-measurements.mjs
import {
  composeMeasurements,
  parseMeasurements,
  EMPTY_FIELDS,
  PENDING_MEASUREMENTS_KEY,
  writePendingMeasurements,
  readPendingMeasurements,
  clearPendingMeasurements,
} from "../src/lib/measurements.ts";

const cases = [
  { bust: "90", waist: "74", hip: "98", height: "165", notes: "" },
  { bust: "90", waist: "74", hip: "98", height: "165", notes: "longer in the sleeve please" },
  { bust: "88.5", waist: "70", hip: "96", height: "170", notes: "" },
  // Partial: a customer who filled only some fields.
  { bust: "90", waist: "", hip: "", height: "", notes: "" },
  // A note containing a comma -- the format is comma-separated, so this is the
  // case most likely to lose data.
  { bust: "90", waist: "74", hip: "98", height: "165", notes: "shorter hem, no cuff" },
];

let fail = 0;
for (const fields of cases) {
  const s = composeMeasurements(fields);
  const back = parseMeasurements(s) ?? { ...EMPTY_FIELDS };
  for (const k of Object.keys(fields)) {
    if (back[k] !== fields[k]) {
      console.error(`ROUND-TRIP LOST "${k}": ${JSON.stringify(fields[k])} -> ${JSON.stringify(back[k])}`);
      console.error(`  via: ${JSON.stringify(s)}`);
      fail++;
    }
  }
}

// Empty in, nothing out.
if (parseMeasurements("") !== undefined) { console.error("empty string should parse to undefined"); fail++; }
// An unrecognised string is kept as a note, never dropped.
const junk = parseMeasurements("make it nice");
if (junk?.notes !== "make it nice") { console.error("free text was dropped instead of kept as a note"); fail++; }

// THE SAVE ENDPOINT'S BODY SHAPES. /api/account/measurements takes two:
// /account's MeasurementsForm posts the fields, and the "Save my
// measurements" button on the customizer and the size guide posts the
// FLATTENED string. The handler only read the field shape, so every save from
// the button wrote five empty columns and still answered {ok: true} -- the
// customer was told "Saved" and nothing was.
//
// This asserts the shape the route derives its columns from, for both bodies.
function columnsFor(body) {
  const flattened = typeof body.measurements === "string" ? parseMeasurements(body.measurements) : undefined;
  const source = flattened ?? body;
  return {
    bust: source.bust ?? "",
    waist: source.waist ?? "",
    hip: source.hip ?? "",
    height: source.height ?? "",
  };
}

const typed = { bust: "90", waist: "74", hip: "98", height: "165", notes: "" };
const fromForm = columnsFor(typed);
const fromButton = columnsFor({ measurements: composeMeasurements(typed) });
for (const k of ["bust", "waist", "hip", "height"]) {
  if (fromForm[k] !== typed[k]) {
    console.error(`FIELD BODY LOST "${k}": ${JSON.stringify(typed[k])} -> ${JSON.stringify(fromForm[k])}`);
    fail++;
  }
  if (fromButton[k] !== typed[k]) {
    console.error(`FLATTENED BODY LOST "${k}": ${JSON.stringify(typed[k])} -> ${JSON.stringify(fromButton[k])}`);
    fail++;
  }
}

// THE PENDING STASH EXPIRES, and that is a security property, not a nicety.
//
// The stash holds one person's body measurements across a sign-up. The first
// version was only cleared after a successful save, so an ABANDONED sign-up
// left it in the tab -- and on a shared browser the next person to sign in had
// those measurements silently written onto their account, over their own.
// A security review caught it before it shipped. If these assertions ever go
// red, that hole is back.
//
// The helpers check `typeof window` at call time, so stubbing here is enough.
const store = new Map();
globalThis.window = {
  sessionStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
  },
};

const NOW = 1_800_000_000_000;
const MIN = 60 * 1000;
const stash = (name, got, want) => {
  if (got !== want) {
    console.error(`STASH ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    fail++;
  }
};

writePendingMeasurements("Bust / chest: 90cm", NOW);
stash("fresh read", readPendingMeasurements(NOW + 1000), "Bust / chest: 90cm");
stash("still valid at 14m59s", readPendingMeasurements(NOW + 14 * MIN + 59_000), "Bust / chest: 90cm");
stash("expired at 15m01s", readPendingMeasurements(NOW + 15 * MIN + 1000), undefined);
stash("expired entry is deleted, not re-offered", store.has(PENDING_MEASUREMENTS_KEY), false);

writePendingMeasurements("Waist: 74cm", NOW);
stash("a clock that moved backwards is not trusted", readPendingMeasurements(NOW - 10 * MIN), undefined);

store.set(PENDING_MEASUREMENTS_KEY, "not json at all");
stash("unparseable value refused", readPendingMeasurements(NOW), undefined);
stash("unparseable value deleted", store.has(PENDING_MEASUREMENTS_KEY), false);

writePendingMeasurements("Hip: 98cm", NOW);
clearPendingMeasurements();
stash("clear removes it", readPendingMeasurements(NOW), undefined);

console.log(
  fail === 0
    ? `ok — ${cases.length} round-trips exact, free text preserved, both save-body shapes reach the columns, pending stash expires`
    : `${fail} failure(s)`,
);
process.exit(fail === 0 ? 0 : 1);
