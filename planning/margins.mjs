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
  // EVERY FABRIC QUOTE ON RECORD, 2026-09-06. All prices are AED PER METRE
  // LANDED, so they can be compared directly. Nothing here is an assumption:
  // the earlier model carried a linen/cotton blend at 20 and linen at 45, and
  // BOTH TURNED OUT NOT TO EXIST at those prices.
  fabrics: {
    localCotton: {
      label: "Local cotton, 100%, NOT organic",
      aedPerMetre: 20,
      source: "Local seller, 2026-09-05",
      note: "⚠️ NOT ORGANIC. fabrics.ts still labels its cotton option 'Organic cotton' -- that label becomes false the day this is bought. Width and gsm STILL NOT GIVEN.",
    },
    localBlend: {
      label: "Local 80% linen / 20% VISCOSE",
      aedPerMetre: 35,
      source: "Local seller, 2026-09-05",
      note: "⚠️ VISCOSE IS NOT A NATURAL FIBRE. It is regenerated cellulose: plant-derived but chemically man-made. The hang tag's '100% PLANT BASED FABRIC' survives it; '100% natural' would not. Recommended AGAINST on identity grounds -- it is the only non-natural fibre in the running, and it would sit in the UPGRADE tier.",
    },
    localLinen: {
      label: "Local 100% linen, UNWASHED",
      aedPerMetre: 65,
      source: "Local seller, 2026-09-05",
      note: "⚠️ 65, not the 45 this file carried for a week. Unwashed, so it shrinks 4-10% and dry-clean-only stays mandatory. Twice the China price.",
    },
    chinaLinen: {
      label: "China W300235, 100% linen, PRE-WASHED",
      aedPerMetre: 36.08,
      source: "Shirley Gz, HER OWN QUOTED TOTAL 2026-09-08: 7,941.8 RMB for 120m = AED 4,330",
      note: "✅ 138cm / 145gsm CONFIRMED by the supplier 2026-09-06, and CONFIRMED SUITABLE FOR SHIRTS the same day (her spec sheet had listed only dress/skirts/pants, and four of eight catalogue items are shirts). Water-washed and softened at the mill, which is the pre-shrink step branding/packaging.md names as the route back to a machine-washable garment. ⏳ RESIDUAL SHRINKAGE STILL UNASKED -- under ~2-3% and dry-clean-only can be dropped. Landed = 27.53 ex-works + 0.83 Shirley's 3% (of fabric, excl. shipping, as she worded it) + 4.36 air freight at 40 RMB/kg door-to-door TAX INCLUDED. ⏳ EXCLUDES the mill-to-agent inland leg, which she excluded in writing.",
    },
    chinaCotton: {
      label: "China combed cotton, 148cm/154gsm",
      aedPerMetre: 20.69,
      source: "Shirley Gz, 28 RMB/m, landed 2026-09-06",
      note: "DO NOT IMPORT. Lands 0.69/m WORSE than buying cotton in Dubai, before counting a 100m minimum and two weeks of lead time. Recorded so nobody re-derives it.",
    },
  },

  // ✅ DECIDED 2026-09-08: LINEN ONLY, 449 / 519, on chinaLinen.
  // catalog.ts now carries these prices (was 389/429). The reasoning:
  //   - all fourteen "100% linen" files stay TRUE, nothing to rewrite
  //   - the catalogue photography is already linen, so nothing to reshoot
  //   - NO code in the payment path: one fabric needs no server-side surcharge
  //     and therefore no security review before it takes a card
  //   - 449 sits exactly on Massimo Dutti's 450 regular-fit linen shirt, so the
  //     comparison argues FOR us: same price, cut to measure. 519 trousers sit
  //     81 UNDER their 600 linen trousers.
  // Cotton is added LATER at 389 as a price DROP (an easy announcement), and
  // needs no fabric commitment at all: 25 AED/m buys it 2.2m at a time, 20 at
  // 100m. The trigger is evidence that price is the objection, not a guess.
  launchOptions: [
    { label: "LINEN ONLY (chosen)", shirt: 449, pants: 519, fabric: "chinaLinen" },
    { label: "...on local cloth instead", shirt: 449, pants: 519, fabric: "localLinen" },
    { label: "Cotton tier, added later", shirt: 389, pants: 429, fabric: "localCotton" },
  ],

  // ⏳ PLACEHOLDER since 2026-08-28. Never measured against a real cut.
  // This is the single largest unverified input in the model: at 2.5m instead
  // of 2.0m a shirt loses ~3 margin points.
  // ⏳ STILL AN ESTIMATE, from 2026-08-28, never measured against a real cut.
  // 2.2 for shirt/pants at 140cm INCLUDING ~10% cutting waste; wide-leg cuts
  // are 2.7-2.9 and are the item that eats cloth. Worth up to 3 margin points.
  // On the tailor's question list -- have him cut one of each and report.
  metresPerGarment: { Shirt: 2.2, Skirt: 1.5, Pants: 2.2, Dress: 3.0 },

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
// The packaging baskets and payback below need ONE fabric to price against.
// They use the recommended launch option so they move with the decision
// instead of pointing at a fabric quote that turned out not to exist.
const REF = INPUTS.launchOptions[0];
const REF_PER_M = INPUTS.fabrics[REF.fabric].aedPerMetre;
const REF_PRICE = REF.shirt;
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
console.log(`  "cost" is per order, landed. "pts" is margin points on a ${REF_PRICE} shirt.`);
console.log(`  Flip \`keep\` in INPUTS.packaging.lines and re-run to test a basket.\n`);
console.log(`  ${"".padEnd(3)}${"line".padEnd(18)}${"rate".padStart(7)}${"cost".padStart(8)}${"pts".padStart(7)}${"cash".padStart(9)}  from`);
for (const [key, l] of Object.entries(INPUTS.packaging.lines)) {
  const c = lineCost(l);
  const mark = l.mandatory ? "[L]" : l.keep ? " + " : " - ";
  console.log(`  ${mark}${key.padEnd(18)}${l.aed.toFixed(2).padStart(7)}${c.toFixed(2).padStart(8)}${(c / REF_PRICE * 100).toFixed(2).padStart(7)}${(c * l.qty).toFixed(0).padStart(9)}  ${l.from} x${l.qty}`);
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
console.log(`\nBASKETS — what each one earns on a ${REF_PRICE} shirt (${REF.label})`);
console.log(`  ${"basket".padEnd(26)}${"pack".padStart(7)}${"margin".padStart(8)}${"gross".padStart(8)}${"cash".padStart(9)}`);
for (const [name, ov] of Object.entries(BASKETS)) {
  const { __addAed = 0, ...flags } = ov;
  const pk = packagingPerOrder(flags) + __addAed;
  const cogsNoPack = unitEconomics(REF_PRICE, "Shirt", REF_PER_M).cogs - packagingPerOrder();
  const cogs = cogsNoPack + pk, g = REF_PRICE - cogs;
  console.log(`  ${name.padEnd(26)}${pk.toFixed(2).padStart(7)}${((g / REF_PRICE) * 100).toFixed(1).padStart(7)}%${g.toFixed(0).padStart(8)}${(packagingCash(flags) + __addAed * 100).toFixed(0).padStart(9)}`);
}

console.log(`\nFABRIC QUOTES ON RECORD  (AED per metre, LANDED, directly comparable)`);
for (const [key, f] of Object.entries(INPUTS.fabrics)) {
  console.log(`  ${f.aedPerMetre.toFixed(2).padStart(6)}  ${f.label}`);
}

console.log(`\nLAUNCH OPTIONS  (✅ DECIDED 2026-09-08: linen only, 449/519, China cloth)`);
console.log(`  ${"option".padEnd(28)}${"fabric".padStart(7)}${"shirt".padStart(9)}${"margin".padStart(8)}${"pants".padStart(8)}${"margin".padStart(8)}   after ads at ${INPUTS.cacScenariosAed.join(" / ")}`);
for (const opt of INPUTS.launchOptions) {
  const perM = INPUTS.fabrics[opt.fabric].aedPerMetre;
  const sh = unitEconomics(opt.shirt, "Shirt", perM);
  const pt = unitEconomics(opt.pants, "Pants", perM);
  const cac = INPUTS.cacScenariosAed
    .map((c) => (sh.gross - c >= 0 ? "+" : "") + (sh.gross - c).toFixed(0))
    .map((x) => x.padStart(6))
    .join(" ");
  console.log(`  ${opt.label.padEnd(28)}${perM.toFixed(2).padStart(7)}${aed(opt.shirt)}${pct(sh.gm)}${aed(opt.pants)}${pct(pt.gm)}  ${cac}`);
}
console.log(`  Margins are on a SHIRT for the ads columns. Full per-item table needs a chosen fabric.`);

console.log(`\n⚠️ WHITE IS SEE-THROUGH IN THIS LINEN.  Supplier, twice: W300207 "better not to`);
console.log(`   make trousers", W300235 "white color is a little bit see through". White is one`);
console.log(`   of four colourways and FOUR OF EIGHT ITEMS ARE TROUSERS. Decide before ordering:`);
console.log(`   white on shirts only, line the white trousers (lining is currently BLOCKED in the`);
console.log(`   customizer as a constraint violation), or drop white from trousers entirely.`);

// Exposure and payback — the "can I do this without losing money" question.
const bagLine = INPUTS.packaging.lines.cottonBag;
const bagOrder = lineCost(bagLine) * bagLine.qty;
const exposure = packagingCash();
const shirt = items.find((i) => i.category === "Shirt");
const shirtGross = unitEconomics(REF_PRICE, "Shirt", REF_PER_M).gross;

console.log(`\nCASH EXPOSURE — the only money committed before an order exists`);
console.log(`  Fitoor lines in the basket     ${aed(exposure - bagOrder)}`);
console.log(`  ${bagLine.qty} cotton bags @ ${bagLine.aed}          ${aed(bagOrder)}   <- 100 is their minimum`);
console.log(`  ${"TOTAL".padEnd(30)} ${aed(exposure)}`);
console.log(`  Pays back in ${Math.ceil(exposure / shirtGross)} shirts. Bags and labels do not expire.`);
console.log(`  ⚠️ FABRIC IS NOT IN THIS FIGURE. Buying local means no fabric commitment at`);
console.log(`     all. Importing means a 100-150m roll BEFORE any customer exists:`);
console.log(`     124m ordered from Shirley = AED ${(124 * INPUTS.fabrics.chinaLinen.aedPerMetre).toFixed(0)} (~${Math.floor(124/2.2)} garments),`);
console.log(`     taking total committed to AED ${(exposure + 124 * INPUTS.fabrics.chinaLinen.aedPerMetre).toFixed(0)} before one customer exists.`);
console.log(`     Break-even vs buying local at 65/m: ${Math.ceil((124*INPUTS.fabrics.chinaLinen.aedPerMetre)/(65*2.2))} garments.`);

console.log(`\nREMAKE SENSITIVITY — a shirt at ${REF_PRICE} (${REF.label})`);
console.log(`  This, not the fabric price, is what a made-to-order brand dies of.`);
const saved = INPUTS.remakeRate;
for (const r of [0.05, 0.15, 0.3]) {
  INPUTS.remakeRate = r;
  const u = unitEconomics(REF_PRICE, "Shirt", REF_PER_M);
  console.log(`  ${(r * 100).toFixed(0).padStart(3)}% remakes   margin ${pct(u.gm)}   gross ${aed(u.gross)}`);
}
INPUTS.remakeRate = saved;

console.log(`\nPENDING INPUTS — every one of these moves the numbers above`);
console.log(`  1. Residual shrinkage on the China linen  (decides dry-clean vs machine washable)`);
console.log(`  2. Cotton bag at 300/500 units    (${bagLine.aed} agreed at 100; each AED = ~0.26 margin pts)`);
console.log(`  3. Metres per garment             (PLACEHOLDER since 2026-08-28)`);
console.log(`  4. Stripe UAE's actual fee        (assumed 2.9% + 1)`);
console.log(`  5. Real CAC                       (134 is an assumption, never measured)`);
console.log("");
