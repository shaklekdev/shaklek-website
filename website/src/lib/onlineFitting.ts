// Shared by the online-fitting screen (client) and POST /api/orders/[id]/fitting
// (server). The server never trusts a composed string from the browser: it
// re-validates every number against these ranges and composes the text the
// tailor reads itself.

export type FittingKey = "bust" | "waist" | "hip" | "height" | "shoulder" | "sleeve" | "outseam" | "inseam";

export const FITTING_RANGES: Record<FittingKey, { min: number; max: number; label: string }> = {
  bust: { min: 60, max: 160, label: "Bust" },
  waist: { min: 50, max: 150, label: "Waist" },
  hip: { min: 60, max: 170, label: "Hip" },
  height: { min: 130, max: 210, label: "Height" },
  shoulder: { min: 25, max: 60, label: "Shoulders" },
  sleeve: { min: 30, max: 90, label: "Arm length" },
  outseam: { min: 60, max: 140, label: "Waist to floor" },
  inseam: { min: 40, max: 110, label: "Inside leg" },
};

export const TOP_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const TROUSER_SIZES = ["32", "34", "36", "38", "40", "42", "44", "46"] as const;
// Bra: EU band with its UK equivalent, cups A-G (UK DD shown as E).
export const BRA_BANDS = [
  { eu: 65, uk: 30 },
  { eu: 70, uk: 32 },
  { eu: 75, uk: 34 },
  { eu: 80, uk: 36 },
  { eu: 85, uk: 38 },
  { eu: 90, uk: 40 },
  { eu: 95, uk: 42 },
  { eu: 100, uk: 44 },
] as const;
export const BRA_CUPS = ["A", "B", "C", "D", "E", "F", "G"] as const;

/**
 * Bust from bra size. EU sizing (EN 13402): the band is the underbust in cm
 * and each cup is a 2cm step of (bust - underbust): A = 12-14, B = 14-16 ...
 * so the midpoint is 13 + 2 x cupIndex. More reliable than the photo, whose
 * bust is its weakest number (hair and arms in profile), so it wins when given.
 */
export function bustFromBra(bandEu: number, cup: string): number | null {
  const i = BRA_CUPS.indexOf(cup as (typeof BRA_CUPS)[number]);
  if (i < 0 || !BRA_BANDS.some((b) => b.eu === bandEu)) return null;
  return Math.round(bandEu + 13 + 2 * i);
}

export type FittingSubmission = {
  values: Record<FittingKey, number>;
  topSize?: string;
  trouserSize?: string;
  bra?: string; // "75B"
};

/** Returns a clean submission or null. Server and client both call this. */
export function validateFitting(input: unknown): FittingSubmission | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const raw = o.values as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== "object") return null;
  const values = {} as Record<FittingKey, number>;
  for (const k of Object.keys(FITTING_RANGES) as FittingKey[]) {
    const n = Number(raw[k]);
    const r = FITTING_RANGES[k];
    if (!Number.isFinite(n) || n < r.min || n > r.max) return null;
    values[k] = Math.round(n);
  }
  const pick = (v: unknown, list: readonly string[]) =>
    typeof v === "string" && list.includes(v) ? v : undefined;
  const bra =
    typeof o.bra === "string" && /^(65|70|75|80|85|90|95|100)[A-G]$/.test(o.bra) ? o.bra : undefined;
  return {
    values,
    topSize: pick(o.topSize, TOP_SIZES),
    trouserSize: pick(o.trouserSize, TROUSER_SIZES),
    bra,
  };
}

/** The text stored in order_items.measurements and read by the tailor. */
export function composeFitting(s: FittingSubmission): string {
  const v = s.values;
  const sizes = [
    s.topSize && `top ${s.topSize}`,
    s.trouserSize && `trousers EU ${s.trouserSize}`,
    s.bra && `bra EU ${s.bra}`,
  ]
    .filter(Boolean)
    .join(", ");
  // Same "Label: Ncm" prefix as lib/measurements.ts so parseMeasurements and
  // the tech pack read bust/waist/hip/height back.
  return (
    `Bust / chest: ${v.bust}cm, Waist: ${v.waist}cm, Hip: ${v.hip}cm, Height: ${v.height}cm, ` +
    `Online fitting (estimated, confirm on WhatsApp): shoulders ${v.shoulder}cm; arm ${v.sleeve}cm; ` +
    `waist to floor ${v.outseam}cm; inside leg ${v.inseam}cm` +
    // Underbust = the EU band (EN 13402: the band IS the underbust in cm);
    // the tailor sheet reads it (founder, 2026-11-14).
    (s.bra ? `; underbust ${s.bra.match(/^\d+/)?.[0]}cm` : "") +
    (sizes ? `; usual size ${sizes}` : "")
  );
}
