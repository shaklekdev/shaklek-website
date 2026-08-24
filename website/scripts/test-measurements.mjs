// compose/parse must be exact inverses. The tech pack cuts to whatever parse
// returns, so a format that silently fails to round-trip means a garment made
// to a size letter instead of to the customer's body.
//
// Run: npx tsx scripts/test-measurements.mjs
import { composeMeasurements, parseMeasurements, EMPTY_FIELDS } from "../src/lib/measurements.ts";

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

console.log(fail === 0 ? `ok — ${cases.length} round-trips exact, free text preserved` : `${fail} failure(s)`);
process.exit(fail === 0 ? 0 : 1);
