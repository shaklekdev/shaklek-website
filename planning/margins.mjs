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
  packaging: {
    cottonBagAed: 17, // AGREED with Hashir Packaging Dubai, 2026-09-02.
    //                   Negotiated down from Fitoor's 20; founder asked 15,
    //                   settled at 17. Ada Zhang (China) was ~10.87 landed but
    //                   25 days production. NOT YET ASKED: 300/500 unit pricing,
    //                   which is where the real saving usually sits at these
    //                   quantities -- at 100 units the setup cost dominates.
    // ✅ VERIFIED 2026-09-02 against the actual quote (FRP2608-1149, 31/08/2026),
    // not against a summary of it. All ten lines reconstruct the document's
    // own subtotal of 5,115.00 + 255.75 VAT = 5,370.75 exactly. Rates are
    // EX-VAT on the quote; VAT is added at the bottom.
    fitoorLines: {
      handBag: 9.2,
      wovenBrandLabel: 0.7,
      careLabel: 0.74, // ⚠️ quoted under ACTIVITY "Sticker"; must be sewn satin
      hangTag: 2.3, //     ⚠️ reads "100% NATURAL LINEN" -- blocked on the fabric
      thankYouCard: 2.7,
      envelope: 3.3,
    },
    // Dropped from the order but present on the quote: businessCard 1.80,
    // tissueSeal 0.85, tissueWrap 3.80. The cotton bag (Fitoor 20.00) is
    // bought from Hashir instead.
    // Dropped from the order: tissue seal (0.85), tissue wrap (3.80),
    // business card (1.80).
    vatRate: 0.05,
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

  // Cash that must be committed before the first order can ship.
  packagingOrderAed: 2594, // Fitoor revised, everything except the cotton bag
  cottonBagOrderQty: 100, // their minimum
};

// ---------------------------------------------------------------------------

function packagingPerOrder() {
  const { fitoorLines, cottonBagAed, vatRate } = INPUTS.packaging;
  const fitoor = Object.values(fitoorLines).reduce((a, b) => a + b, 0);
  return { fitoor, withVat: fitoor * (1 + vatRate), total: fitoor * (1 + vatRate) + cottonBagAed };
}

function unitEconomics(price, category, fabricAedPerMetre) {
  const metres = INPUTS.metresPerGarment[category];
  const tailoring = INPUTS.tailoringAed[category];
  const fabric = metres * fabricAedPerMetre;
  const make = fabric + tailoring;
  const pack = packagingPerOrder().total;
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
if (!items.length) {
  console.error("Could not parse website/src/data/catalog.ts — has its shape changed?");
  process.exit(1);
}

const p = packagingPerOrder();
console.log("\nSHAKLEK — UNIT ECONOMICS");
console.log("=".repeat(78));
console.log(`Prices read from catalog.ts (${items.length} items). Run date: ${new Date().toISOString().slice(0, 10)}`);

console.log(`\nPACKAGING PER ORDER`);
console.log(`  Fitoor lines (ex VAT)          ${aed(p.fitoor)}`);
console.log(`  + VAT ${(INPUTS.packaging.vatRate * 100).toFixed(0)}%                       ${aed(p.withVat - p.fitoor)}`);
console.log(`  + cotton bag (Hashir, agreed)  ${aed(INPUTS.packaging.cottonBagAed)}   <- 2026-09-02`);
console.log(`  ${"".padEnd(30)} ${aed(p.total)}`);
console.log(`  ✅ RECONCILED 2026-09-02 against quote FRP2608-1149. The 2026-08-31`);
console.log(`  plan's 30.76 implied 20.76 ex-bag; the document itemises ${p.withVat.toFixed(2)}.`);
console.log(`  That earlier figure was overstated by 0.87. This one is the quote.`);
console.log(`  ⚠️ Hashir's 17 is assumed VAT-INCLUSIVE. Fitoor's rates are ex-VAT;`);
console.log(`  if Hashir's is too, the bag is 17.85 and margins drop ~0.2 pts.`);

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
const bagOrder = INPUTS.packaging.cottonBagAed * INPUTS.cottonBagOrderQty;
const exposure = INPUTS.packagingOrderAed + bagOrder;
const shirt = items.find((i) => i.category === "Shirt");
const shirtGross = unitEconomics(shirt.price, shirt.category, INPUTS.fabrics.entry.aedPerMetre).gross;

console.log(`\nCASH EXPOSURE — the only money committed before an order exists`);
console.log(`  Fitoor order (ex bag)          ${aed(INPUTS.packagingOrderAed)}`);
console.log(`  ${INPUTS.cottonBagOrderQty} cotton bags @ ${INPUTS.packaging.cottonBagAed}          ${aed(bagOrder)}   <- 100 is their minimum`);
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
console.log(`  2. Cotton bag at 300/500 units    (${INPUTS.packaging.cottonBagAed} agreed at 100; each AED = ~0.26 margin pts)`);
console.log(`  3. Metres per garment             (PLACEHOLDER since 2026-08-28)`);
console.log(`  4. Stripe UAE's actual fee        (assumed 2.9% + 1)`);
console.log(`  5. Real CAC                       (134 is an assumption, never measured)`);
console.log("");
