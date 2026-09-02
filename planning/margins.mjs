#!/usr/bin/env node
/**
 * Shaklek unit economics — the live margin model.
 *
 *   node planning/margins.mjs
 *
 * WHY THIS IS A SCRIPT AND NOT A TABLE IN A MARKDOWN FILE.
 * Every margin number in this project has gone stale at least once, and twice
 * it went stale silently: packaging was recorded at 2 AED when it was 36, and
 * fabric at 24 when it was 32 landed. Both were true of their inputs on the day
 * they were written, and both were copied forward for a week. A hand-maintained
 * table cannot be re-derived; this can. When a quote lands, change ONE number
 * in INPUTS below and every figure in the project moves with it.
 *
 * Prices are READ FROM `website/src/data/catalog.ts`, never retyped here — the
 * catalogue is the single source of truth for what a customer actually pays.
 *
 * Everything in INPUTS carries a source and a date. Anything marked PENDING is
 * a guess and is printed as such, so no one can mistake an assumption for a
 * quote. That distinction is the whole point of the file.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Derive the repo root from this file's own location. Never hardcode an
// absolute path: the repo moved off ~/Desktop on 2026-08-31 and nine scripts
// that hardcoded the old path would have broken silently.
const REPO = dirname(dirname(fileURLToPath(import.meta.url)));

// ---------------------------------------------------------------------------
// INPUTS — the only block anyone should need to edit
// ---------------------------------------------------------------------------

const INPUTS = {
  fabrics: {
    // The three fabrics do three different jobs. Only two are ever sold.
    sample: {
      label: "30% linen (fit samples only, never sold)",
      aedPerMetre: 10,
      source: "Founder, bought 2026-09-01 — 4 sample sets",
    },
    entry: {
      label: "Linen/cotton blend — the ENTRY fabric",
      aedPerMetre: 20,
      pending: "LINEN % NOT CONFIRMED. Needs 60-70% to look like the catalogue photographs.",
      source: "Founder, 2026-09-01, same local supplier as the 100% linen",
    },
    linen: {
      label: "100% linen — the UPGRADE fabric",
      aedPerMetre: 45,
      source: "Local in-store, on record 2026-08-31. Chosen over China 2026-09-01.",
    },
  },

  // Charged on top of the entry price when the customer picks 100% linen.
  // Sized so the upgrade earns comparably to the base; re-check if either
  // fabric price moves.
  linenUpgradeAed: 90,

  // ⏳ PLACEHOLDER since 2026-08-28. Never measured against a real cut.
  // This is the single largest unverified input in the model: at 2.5m instead
  // of 2.0m a shirt loses ~3 margin points.
  metresPerGarment: { Shirt: 2.0, Skirt: 1.5, Pants: 2.0, Dress: 3.0 },

  // Cut-and-sew, paid to the subcontracted tailor.
  tailoringAed: { Shirt: 40, Skirt: 60, Pants: 60, Dress: 85 },

  shippingAed: 21, // Founder, 2026-08-22

  // Fitoor Packaging LLC (Ajman), estimate FRP2608-1149, 100-unit pricing.
  // The cotton bag is deliberately NOT bought from Fitoor — at AED 20 it was
  // 39% of their whole quote and worth ~2.5 margin points on every garment.
  // ✅ VERIFIED 2026-09-02 against the actual quote (FRP2608-1149, 31/08/2026),
  // not against a summary of it. All ten lines reconstruct the document's own
  // subtotal of 5,115.00 + 255.75 VAT = 5,370.75 exactly. Rates are EX-VAT on
  // the quote; VAT is added at the bottom.
  //
  // TO TEST AN ORDER: flip `keep` and re-run. Every margin below moves with it.
  packaging: {
    vatRate: 0.05,
    lines: {
      // qty is Fitoor's MINIMUM, not what one order consumes. Labels come in
      // 500s, everything else in 100s. Per-order cost is the unit rate either
      // way -- one label per garment.
      cottonBag: { aed: 17, qty: 100, keep: true, from: "Hashir",
        note: "THE CENTREPIECE, and the reveal. Fitoor 20; Hashir 17 agreed 2026-09-02. WARNING Fitoor quoted 35x45 but the approved spec is 500x400 landscape -- 27% more cloth" },
      handBag: { aed: 9.2, qty: 100, keep: true, from: "Fitoor",
        note: "NOT OPTIONAL, AND NOT A SECOND LAYER. Founder, 2026-09-02: in Dubai delivery IS done with a hand bag -- it is the delivery vehicle, not packaging inside a mailer. branding/packaging.md's 'only if there is a physical handover' is misleading here, because local delivery is a handover. The kraft mailer is for orders shipped OUTSIDE Dubai" },
      wovenBrandLabel: { aed: 0.7, qty: 500, keep: true, from: "Fitoor",
        note: "Sewn into the garment. No size, no care text (founder)" },
      careLabel: { aed: 0.74, qty: 500, keep: true, from: "Fitoor", mandatory: true,
        note: "LEGAL FIBRE DISCLOSURE, not optional. SPLIT RUN agreed 2026-09-02: ~250 reading 100% LINEN (wording already settled) and ~250 carrying the blend ratio (PENDING the percentage). ⚠️ ASK FITOOR WHAT THE SPLIT COSTS -- two artworks on one 500 run is likely a setup surcharge, and 0.74 assumes a single version. ⚠️ Quoted under ACTIVITY 'Sticker'; must be sewn satin. DRY CLEAN ONLY stays: founder's decision 2026-08-28, and it is a FIT decision not a laundry one. Unwashed linen shrinks 4-10% on first wash and these are cut to a customer's measurements, so wash-at-30 gives a garment that fits once and then does not, with the remake free under our own returns policy. Cotton shrinks too, so the blend does not change it. The route back is pre-washing the cloth before cutting -- do not propose wash-at-30 without doing that first" },
      hangTag: { aed: 2.3, qty: 100, keep: true, from: "Fitoor",
        note: "UNBLOCKED 2026-09-02. Was '100% NATURAL LINEN', which would need reprinting per fabric. Founder's fix: a fabric-agnostic line, true of linen and of the blend, so it is printed once and never again. ⚠️ Say FABRIC not MATERIALS -- 'materials' claims the whole garment including thread and buttons, and sewing thread is usually polyester" },
      thankYouCard: { aed: 2.7, qty: 100, keep: true, from: "Fitoor",
        note: "The note moment. Drop this and the envelope has no job left" },
      envelope: { aed: 3.3, qty: 100, keep: true, from: "Fitoor",
        note: "Exists ONLY to hold the thank-you card. Never keep it without the card" },
      businessCard: { aed: 1.8, qty: 100, keep: false, from: "Fitoor",
        note: "⚠️ ASK WHERE IT GOES BEFORE COSTING IT. In every parcel it is 0.49 margin points on every order forever, and a card in a parcel from a brand with no shopfront does little. In the founder's wallet for markets, suppliers and press it is a ONE-OFF 189 AED marketing spend and costs zero margin -- in that case keep: false is correct here and the 189 is simply not COGS" },
      tissueSeal: { aed: 0.85, qty: 100, keep: false, from: "Fitoor",
        note: "Dropped. Only earns a place if there is tissue to seal" },
      tissueWrap: { aed: 3.8, qty: 100, keep: false, from: "Fitoor",
        note: "Dropped. The cotton bag already is the wrap" },
    },
  },

  // ⚠️ Still unverified against Stripe UAE's actual published rate.
  paymentFee: { pct: 0.029, fixedAed: 1 },

  // Made-to-order's equivalent of returns. Assumption, not a measurement —
  // the four fit-sample sets exist to turn this into a real number.
  remakeRate: 0.05,

  // Cost to acquire one customer. INDUSTRY ASSUMPTION, NOT MEASURED.
  // 134 = CPM 30, CTR 1.5%, 1.5% purchase rate. This is the number that
  // decides whether the business scales, and nobody has measured it.
  cacScenariosAed: [134, 200, 250],

};

// ---------------------------------------------------------------------------

// Landed per-order cost of one packaging line. Fitoor's rates are ex-VAT;
// Hashir's 17 is ASSUMED VAT-inclusive and that assumption is printed loudly.
function lineCost(l) {
  return l.from === "Fitoor" ? l.aed * (1 + INPUTS.packaging.vatRate) : l.aed;
}

function packagingPerOrder(overrides = {}) {
  let total = 0;
  for (const [key, l] of Object.entries(INPUTS.packaging.lines)) {
    const keep = key in overrides ? overrides[key] : l.keep;
    if (keep) total += lineCost(l);
  }
  return total;
}

// Up-front cash for a given basket. Labels come in 500s, so their cash cost is
// five times a 100-unit line even though per-order they are pennies.
function packagingCash(overrides = {}) {
  let cash = 0;
  for (const [key, l] of Object.entries(INPUTS.packaging.lines)) {
    const keep = key in overrides ? overrides[key] : l.keep;
    if (keep) cash += lineCost(l) * l.qty;
  }
  return cash;
}

function unitEconomics(price, category, fabricAedPerMetre) {
  const metres = INPUTS.metresPerGarment[category];
  const tailoring = INPUTS.tailoringAed[category];
  const fabric = metres * fabricAedPerMetre;
  const make = fabric + tailoring;
  const pack = packagingPerOrder();
  const fees = price * INPUTS.paymentFee.pct + INPUTS.paymentFee.fixedAed;
  // A remake costs the make and the second shipment, not the packaging again.
  const remake = INPUTS.remakeRate * (make + INPUTS.shippingAed);
  const cogs = make + INPUTS.shippingAed + pack + fees + remake;
  return { price, fabric, tailoring, pack, fees, remake, cogs, gross: price - cogs, gm: (price - cogs) / price };
}

function readCatalog() {
  const src = readFileSync(join(REPO, "website/src/data/catalog.ts"), "utf8");
  const items = [];
  const re = /slug:\s*"([^"]+)"[\s\S]{0,400}?name:\s*"([^"]+)"[\s\S]{0,200}?category:\s*"([^"]+)"[\s\S]{0,200}?price:\s*(\d+)/g;
  for (const m of src.matchAll(re)) items.push({ slug: m[1], name: m[2], category: m[3], price: Number(m[4]) });
  return items;
}

const aed = (n) => n.toFixed(2).padStart(8);
const pct = (n) => (n * 100).toFixed(1).padStart(5) + "%";

// ---------------------------------------------------------------------------

const items = readCatalog();
const SHIRT_PRICE = (items.find((i) => i.category === "Shirt") || { price: 389 }).price;
if (!items.length) {
  console.error("Could not parse website/src/data/catalog.ts — has its shape changed?");
  process.exit(1);
}

console.log("\nSHAKLEK — UNIT ECONOMICS");
console.log("=".repeat(78));
console.log(`Prices read from catalog.ts (${items.length} items). Run: ${new Date().toISOString().slice(0, 10)}`);

const packTotal = packagingPerOrder();
console.log(`\nPACKAGING — EVERY LINE, AND WHAT IT COSTS YOU`);
console.log(`  Quote FRP2608-1149 reconstructs exactly: 5,115.00 + 255.75 VAT = 5,370.75.`);
console.log(`  "cost" is per order, landed. "pts" is margin points on a ${SHIRT_PRICE} shirt.`);
console.log(`  Flip \`keep\` in INPUTS.packaging.lines and re-run to test a basket.\n`);
console.log(`  ${"".padEnd(3)}${"line".padEnd(18)}${"rate".padStart(7)}${"cost".padStart(8)}${"pts".padStart(7)}${"cash".padStart(9)}  from`);
for (const [key, l] of Object.entries(INPUTS.packaging.lines)) {
  const c = lineCost(l);
  const mark = l.mandatory ? "[L]" : l.keep ? " + " : " - ";
  console.log(`  ${mark}${key.padEnd(18)}${l.aed.toFixed(2).padStart(7)}${c.toFixed(2).padStart(8)}${(c / SHIRT_PRICE * 100).toFixed(2).padStart(7)}${(c * l.qty).toFixed(0).padStart(9)}  ${l.from} x${l.qty}`);
}
console.log(`  ${"".padEnd(3)}${"IN THIS BASKET".padEnd(18)}${"".padStart(7)}${packTotal.toFixed(2).padStart(8)}${"".padStart(7)}${packagingCash().toFixed(0).padStart(9)}`);
console.log(`  [L] = legally required.  + = ordering.  - = dropped.`);
console.log(`  ⚠️ Hashir's 17 is assumed VAT-INCLUSIVE. Fitoor's rates are all ex-VAT;`);
console.log(`     if his is too, the bag is 17.85 and every margin drops ~0.2 pts.`);

// Baskets worth comparing. Each is a set of overrides on the `keep` flags.
// The hand bag is NOT a droppable line -- in Dubai it is how the order is
// delivered (founder, 2026-09-02). The real variant is an order shipped
// OUTSIDE Dubai, where a ~2 AED kraft mailer replaces it.
const MAILER_AED = 2.0; // her own stock, not on the Fitoor quote
const BASKETS = {
  "Everything on the quote": { businessCard: true, tissueSeal: true, tissueWrap: true },
  "PLAN - Dubai (hand bag)": {},
  "Outside Dubai (mailer)": { handBag: false, __addAed: MAILER_AED },
  "+ business card in parcel": { businessCard: true },
  "If the note were cut": { thankYouCard: false, envelope: false },
};
console.log(`\nBASKETS — what each one earns on a ${SHIRT_PRICE} shirt`);
console.log(`  ${"basket".padEnd(26)}${"pack".padStart(7)}${"margin".padStart(8)}${"gross".padStart(8)}${"cash".padStart(9)}`);
for (const [name, ov] of Object.entries(BASKETS)) {
  const { __addAed = 0, ...flags } = ov;
  const pk = packagingPerOrder(flags) + __addAed;
  const cogsNoPack = unitEconomics(SHIRT_PRICE, "Shirt", INPUTS.fabrics.entry.aedPerMetre).cogs - packagingPerOrder();
  const cogs = cogsNoPack + pk, g = SHIRT_PRICE - cogs;
  console.log(`  ${name.padEnd(26)}${pk.toFixed(2).padStart(7)}${((g / SHIRT_PRICE) * 100).toFixed(1).padStart(7)}%${g.toFixed(0).padStart(8)}${(packagingCash(flags) + __addAed * 100).toFixed(0).padStart(9)}`);
}

for (const [key, fab] of [["entry", INPUTS.fabrics.entry], ["linen", INPUTS.fabrics.linen]]) {
  const upgrade = key === "linen" ? INPUTS.linenUpgradeAed : 0;
  console.log(`\n${fab.label.toUpperCase()} — ${fab.aedPerMetre} AED/m${upgrade ? `, +${upgrade} upgrade` : ""}`);
  if (fab.pending) console.log(`  PENDING: ${fab.pending}`);
  console.log(`  ${"item".padEnd(22)}${"price".padStart(8)}${"cogs".padStart(9)}${"gross".padStart(9)}${"margin".padStart(8)}   after ads at ${INPUTS.cacScenariosAed.join(" / ")}`);
  for (const it of items) {
    const u = unitEconomics(it.price + upgrade, it.category, fab.aedPerMetre);
    const cac = INPUTS.cacScenariosAed
      .map((c) => (u.gross - c >= 0 ? "+" : "") + (u.gross - c).toFixed(0))
      .map((s) => s.padStart(6))
      .join(" ");
    console.log(`  ${it.name.padEnd(22)}${aed(u.price)}${aed(u.cogs)}${aed(u.gross)}${pct(u.gm)}  ${cac}`);
  }
}

// Exposure and payback — the "can I do this without losing money" question.
const bagLine = INPUTS.packaging.lines.cottonBag;
const bagOrder = lineCost(bagLine) * bagLine.qty;
const exposure = packagingCash();
const shirt = items.find((i) => i.category === "Shirt");
const shirtGross = unitEconomics(shirt.price, shirt.category, INPUTS.fabrics.entry.aedPerMetre).gross;

console.log(`\nCASH EXPOSURE — the only money committed before an order exists`);
console.log(`  Fitoor lines in the basket     ${aed(exposure - bagOrder)}`);
console.log(`  ${bagLine.qty} cotton bags @ ${bagLine.aed}          ${aed(bagOrder)}   <- 100 is their minimum`);
console.log(`  ${"TOTAL".padEnd(30)} ${aed(exposure)}`);
console.log(`  Pays back in ${Math.ceil(exposure / shirtGross)} shirts. Bags and labels do not expire.`);
console.log(`  Fabric is bought per order from a local shop — no inventory risk.`);

console.log(`\nREMAKE SENSITIVITY — a ${shirt.name} at ${shirt.price}`);
console.log(`  This, not the fabric price, is what a made-to-order brand dies of.`);
const saved = INPUTS.remakeRate;
for (const r of [0.05, 0.15, 0.3]) {
  INPUTS.remakeRate = r;
  const u = unitEconomics(shirt.price, shirt.category, INPUTS.fabrics.entry.aedPerMetre);
  console.log(`  ${(r * 100).toFixed(0).padStart(3)}% remakes   margin ${pct(u.gm)}   gross ${aed(u.gross)}`);
}
INPUTS.remakeRate = saved;

console.log(`\nPENDING INPUTS — every one of these moves the numbers above`);
console.log(`  1. Linen % in the ${INPUTS.fabrics.entry.aedPerMetre} AED blend      (product risk, not margin)`);
console.log(`  2. Cotton bag at 300/500 units    (${bagLine.aed} agreed at 100; each AED = ~0.26 margin pts)`);
console.log(`  3. Metres per garment             (PLACEHOLDER since 2026-08-28)`);
console.log(`  4. Stripe UAE's actual fee        (assumed 2.9% + 1)`);
console.log(`  5. Real CAC                       (134 is an assumption, never measured)`);
console.log("");
