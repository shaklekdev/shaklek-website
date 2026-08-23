// Body measurements per standard size, in centimetres.
//
// XS–XXL was offered with nothing behind it, while the returns policy and the
// Our Story page both referred to a size chart that did not exist. Sizing
// mistakes are the largest driver of the free alteration or remake the returns
// policy promises, and each one is a full remake against a fixed price.
//
// PROVENANCE — these are consolidated from published UAE-market body-measurement
// charts, not measured from Shaklek's own patterns:
//   - Ounass (ounass.ae) alpha↔EU/UK/US conversion table, read from live PDP data
//   - Namshi (en-ae.namshi.com/size-guide) women's clothing chart
//   - H&M ladies size guide (per-EU-number cm values; its alpha letters run
//     1–2 sizes large and were deliberately not used)
// Zara UAE and Mango UAE publish their charts only behind a bot-protected
// JS modal and could not be read.
//
// Ounass and Namshi agree on the XS=EU34/UK6 … XXL=EU44/UK16 ladder, so that
// is the spine. Hips are regularised to a uniform bust+8 grading (sources
// ranged bust+4 to bust+8) and the step widens 4cm→5cm at XXL, as all three
// sources do at the top end.
//
// ⚠️ These describe the BODY a size is cut to fit, not the finished garment.
// Confirm against the tailor's actual patterns before treating them as a
// promise — a chart that disagrees with the patterns causes the very remakes
// it exists to prevent.

export type SizeChartRow = {
  size: string;
  eu: number;
  uk: number;
  us: number;
  bust: number;
  waist: number;
  hip: number;
};

export const SIZE_CHART: SizeChartRow[] = [
  { size: "XS", eu: 34, uk: 6, us: 2, bust: 80, waist: 64, hip: 88 },
  { size: "S", eu: 36, uk: 8, us: 4, bust: 84, waist: 68, hip: 92 },
  { size: "M", eu: 38, uk: 10, us: 6, bust: 88, waist: 72, hip: 96 },
  { size: "L", eu: 40, uk: 12, us: 8, bust: 92, waist: 76, hip: 100 },
  { size: "XL", eu: 42, uk: 14, us: 10, bust: 96, waist: 80, hip: 104 },
  { size: "XXL", eu: 44, uk: 16, us: 12, bust: 101, waist: 85, hip: 108 },
];

// Suggests the closest standard size from a bust measurement, so a customer who
// has measured themselves for Tailored mode can sanity-check a standard size.
export function nearestSize(bustCm: number): SizeChartRow {
  return SIZE_CHART.reduce((best, row) =>
    Math.abs(row.bust - bustCm) < Math.abs(best.bust - bustCm) ? row : best,
  );
}
