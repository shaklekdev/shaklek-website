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
      source: "Shirley Gz. INVOICED 2026-09-09 for the real order: 124m at 50.5 RMB = 6,262 goods + 187.86 service (3%) = 6,449.86 RMB = AED 3,516. Every line checked against the metres ordered. Shipping billed SEPARATELY after the goods are weighed at the agent's warehouse -- which is the outcome we wanted, since it means actual weight rather than her 30kg estimate. At ~27kg gross that is 40x27+500 = 1,580 RMB = AED 861, so about AED 4,378 all in, or 36.08/m.",
      // ⚠️ THE MILL'S SHADE CODES. Record these forever: a REORDER MUST QUOTE
      // THEM or the colour will not match the catalogue photography. A
      // different code guarantees a different shade; the same code gets the
      // same recipe but NOT the same dye lot, which is a separate problem for
      // anyone ordering a shirt and trousers together in one colour.
      //   #3 White  ·  #4 Ivory  ·  #440 Navy  ·  #29 Burgundy
      // Ordered 2026-09-09: White 22m, Ivory 43m, Navy 32m, Burgundy 27m.
      note: "✅ FULLY QUOTED, NOTHING OUTSTANDING ON COST. 138cm / 145gsm confirmed 2026-09-06, and confirmed SUITABLE FOR SHIRTS the same day (her spec sheet had listed only dress/skirts/pants, and four of eight catalogue items are shirts). ✅ SHRINKAGE ANSWERED 2026-09-08: ~1% residual, machine washable at regular temperature -- the cloth is water-washed and softened at the mill, which is the pre-shrink step branding/packaging.md named as the route back to home washing, and the care label changed on the strength of it. ✅ THE INLAND LEG IS NO LONGER EXCLUDED: her 500 RMB line explicitly covers to-door delivery AND warehouse transportation, which is the gap she had excluded in writing on 2026-09-02. 36.08/m is HER OWN TOTAL, not an estimate of it: 120m x 50.5 x 1.03 = 6,241.8 fabric-plus-fee, + 1,700 shipping = 7,941.8 RMB = AED 4,330. ⏳ The only open item is her billing 30kg against ~24kg of actual cloth; ask whether the invoice is on actual weight, worth about AED 87."
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
  // Abaya/Gilet are ESTIMATES pending a real cut (138cm cloth). An open abaya
  // is the metre-hungry item in the range: at 3.2m the CLOTH ALONE costs more
  // than the stitching, which is why its price cannot be set from the tailor's
  // quote the way a shirt's can.
  // ✅ ANSWERED 2026-09-14, founder: "2 meters per garment, 4 meters for a set."
  // A set is a shirt and a pair of pants, so 2.0 each, and the two agree.
  // This had been a PLACEHOLDER at 2.2 since 2026-08-28, which overstated
  // cloth on the two shipping categories by 10%.
  // ⏳ Her answer covers SHIRT and PANTS. Dress, Abaya, Skirt and Gilet are
  // still modelled, not quoted, and the abaya is the metre-hungry one.
  // ✅ DRESS 2.75 AND ABAYA 3.0-3.5, FOUNDER 2026-09-20: "abaya is between 3 and
  //    3.5 depending on the size, for me it's 3m... since the dress is
  //    sleeveless i think it's less, around 2.5-3m". Both dresses are
  //    SLEEVELESS by design, which is where the saving comes from.
  //    Dress modelled at 2.75, the middle of her range, because both ends are
  //    hers rather than one being a worst case. Abaya STAYS AT 3.5, the worse
  //    end, per the rule above: her own 3m is a size-S data point, not the
  //    range. At 3.0 the abaya reads 60.0% instead of 57.4%.
  metresPerGarment: { Shirt: 2.0, Skirt: 1.5, Pants: 2.0, Dress: 2.75, Abaya: 3.5, Gilet: 2.0 },

  // Cut-and-sew, paid to the subcontracted tailor.
  // ✅ SHIRT 35, NOT 40 — the tailor quotes 30-35, founder 2026-09-12. The
  // CONSERVATIVE end is modelled on purpose: if a number is a range, the model
  // takes the worse one, so a surprise moves margin UP and never down. At 30
  // the shirt gains a further ~1.1 points.
  // ✅ PANTS 50, NOT 60 — the tailor's real rate, founder 2026-09-12. Worth
  // ~1.9 margin points on every trouser sold.
  // ✅ DRESS AND ABAYA BOTH 90 — tailor, founder 2026-09-12, later the same day:
  //    "abaya and dress price is 80-90 aed for both". Modelled at the TOP of the
  //    range for the same reason as the shirt: if a number is a range the model
  //    takes the worse one, so a surprise moves margin UP and never down. At 80
  //    each gains roughly 1.8 points on a 554 abaya.
  //    ⚠️ THE ABAYA WAS A 100 PLACEHOLDER AND IS NOW QUOTED. That is a real
  //    10 AED saving, and it lands on the garment whose price was least certain.
  // ⏳ GILET AND SKIRT STILL NOT QUOTED. Those two remain placeholders.
  // ⏳ DRESS RAISED 90 -> 110 ON 2026-09-20, AND THIS ONE IS A GUESS, NOT A
  //    QUOTE. His 80-90 was for "abaya and dress" meaning a PLAIN dress, and
  //    that still fits the slip dress. The BUTTONED dress is a different
  //    garment to make: a waist seam, a shirt collar, side pockets and
  //    EIGHTEEN buttonholes. 110 is the conservative figure for the pair, per
  //    the range rule above.
  //    ⚠️ ASK HIM FOR A PRICE ON EACH DRESS SEPARATELY. Both are sold at 649,
  //    so the buttoned one sets the floor: at 110 it earns 55.5%, at 140 it
  //    falls to about 54% and 649 is too low.
  tailoringAed: { Shirt: 35, Skirt: 60, Pants: 50, Dress: 110, Abaya: 90, Gilet: 55 },

  shippingAed: 21, // Founder, 2026-08-22

  // Fitoor Packaging LLC (Ajman), estimate FRP2608-1149, 100-unit pricing.
  // The cotton bag is deliberately NOT bought from Fitoor — at AED 20 it was
  // 39% of their whole quote and worth ~2.5 margin points on every garment.
  // ✅ VERIFIED AGAINST THE REVISED QUOTE, FRP2609-1113 (07/09/2026): eight
  // lines, subtotal 4,350.00 + 217.50 VAT = 4,567.50, which this model
  // reconstructs exactly. Supersedes FRP2608-1149, and two things changed:
  // tissue seal and tissue wrap are OUT, and the duplicate care-label design is
  // gone (they had quoted 500 of EACH of two designs, 1,000 labels, when the
  // blend is dead and only one fibre exists -- catching that saved 388.50).
  // Rates are EX-VAT; VAT is added at the bottom.
  //
  // ⏳ ONE THING STILL WRONG ON IT, flagged to them 2026-09-10:
  //     The invoice reads "Shakalek". The company is "Shaklek For Online
  //     Selling". It is a VAT invoice and must match the trade licence.
  //
  // ✅ THE BAG SIZE IS SETTLED AND IS NOT AN OPEN ITEM. 35x45cm WITH A HANDLE,
  //    as quoted. The founder chose it deliberately as a PRICE decision
  //    (2026-09-10, re-confirmed 2026-09-12) and the print artwork was rebuilt
  //    to match -- 08-linen-bag-print is 350x450 PORTRAIT.
  //    ⚠️ DO NOT RE-RAISE 500x400 LANDSCAPE DRAWSTRING WITH FITOOR. This file
  //    carried it as a pending item for two days after the decision; acting on
  //    it would reverse her call, orphan the print file, and reopen a settled
  //    price mid-production. The 17 is quoted against the bag we are buying.
  //
  // TO TEST AN ORDER: flip `keep` and re-run. Every margin below moves with it.
  packaging: {
    vatRate: 0.05,
    lines: {
      // qty is Fitoor's MINIMUM, not what one order consumes. Labels come in
      // 500s, everything else in 100s. Per-order cost is the unit rate either
      // way -- one label per garment.
      cottonBag: { aed: 17, qty: 100, keep: true, from: "Fitoor",
        note: "THE CENTREPIECE, and the reveal. ⚠️ HASHIR IS FITOOR -- he is the contact there, NOT a second supplier. This model treated him as one until 2026-09-08 and therefore treated his 17 as VAT-inclusive; it is ex-VAT like every other line on quote FRP2608-1149, so the bag lands at 17.85. Negotiated down from their own 20 (the founder asked 15, settled at 17). ✅ SIZE SETTLED: 35x45 WITH A HANDLE, and the 17 is quoted against exactly that bag -- founder 2026-09-10, re-confirmed 2026-09-12. Do NOT re-raise 500x400 drawstring. Still to ask: 300/500 unit pricing" },
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
  // MEASURED 2026-09-14 from the founder's own Stripe balance history, not
  // assumed. Two real charges solve it exactly:
  //     390.00 AED -> 12.93 fee      3.89 AED -> 1.17 fee
  //     => 3.046% + 1.052 AED, reproducing both to the fils.
  // The old 2.9% + 1 understated the fee on a 390 order by 0.62 AED.
  //
  // RADAR IS FOLDED INTO THE FIXED PART and was missing entirely before today.
  // Stripe bills it separately at 0.20 + 0.01 VAT = 0.21 per charge. Folded in
  // rather than given its own field because every call site adds fixedAed
  // exactly once per order, which is how Radar bills; a new field would have
  // sat unread and changed no number.  1.052 + 0.21 = 1.262
  paymentFee: { pct: 0.03046, fixedAed: 1.262 },

  // Made-to-order's equivalent of returns. Assumption, not a measurement —
  // the four fit-sample sets exist to turn this into a real number.
  remakeRate: 0.05,

  // ✅ THE IN-PERSON FITTING, FREE ABOVE A BASKET THRESHOLD. Founder decision,
  // 2026-09-12: 50 AED an hour, ONCE PER CUSTOMER, and the threshold is set so
  // that a single dress or abaya qualifies as well as any two pieces.
  //
  // ⚠️ THE DRESS IS 649 AS OF 2026-09-20, NOT 599, AND THE BAND STILL HOLDS.
  // Both dresses are priced at 649 (see the pricing note below), which is
  // comfortably above 550, so a dress still qualifies on its own. The band is
  // set by the dearest thing that must NOT qualify -- the 519 trousers -- and
  // by the cheapest that must, which is now the 649 dress rather than a 599
  // one. Raising the dress WIDENED the band to (519, 649]; 550 sits in it
  // either way. If a dress ever drops below 550 this threshold breaks
  // silently, which is the failure this note exists to prevent.
  //
  // WHY 550. The band is (519, 599]: it must sit ABOVE the dearest single
  // garment that should NOT qualify (trousers, 519) and AT OR BELOW the
  // cheapest that SHOULD (the dress, 599). 550 is the round number in it.
  //   qualifies   dress 599 · abaya 690 · any two pieces (cheapest pair 898)
  //   does not    shirt 449 · gilet 479 · trousers 519
  // ⚠️ THE DRESS AND ABAYA PRICES ARE STILL PROPOSALS, NOT IN catalog.ts. If
  //    the dress lands below 550 the threshold breaks silently and a 449 item
  //    could start qualifying. Set the dress price FIRST, then this.
  //
  // WHY ONCE PER CUSTOMER IS THE PART THAT MAKES IT CHEAP. 50 AED against an
  // assumed 134 to buy a customer through ads: an hour that makes someone come
  // back costs a third of buying a new one, and it is never paid twice.
  // ⚠️ IT NEEDS SOMEWHERE TO RECORD THAT IT WAS USED -- a nullable column on
  //    `customers`. Read the migration trap in CLAUDE.md first: column on PROD
  //    before the code ships, via scripts/db-migrate.mjs --target=prod, or
  //    checkout breaks for everyone.
  //
  // WHY A FITTING AND NOT A DISCOUNT. At these baskets they cost about the
  // same, and the fitting wins on everything else: it is CAPPED AT ONE HOUR
  // however large the basket (a percentage is not), it cannot be guessed or
  // shared the way a promo code can (see CLAUDE.md on WELCOME20), it does not
  // train anyone to wait for a sale, and it cuts the remake rate -- which is
  // the one number that can actually sink this. See the printed comparison.
  //
  // ⚠️ THE HOUR IS THE SCARCE INPUT, NOT THE 100 AED. One qualifying order is
  // one hour, so this offer does not survive contact with volume: it caps out
  // around 4-5 a week. Word it as "by appointment" so it can be capped without
  // breaking a promise.
  // ⚠️ THE THRESHOLD IS GONE. Founder, 2026-09-13: "the measurements are for
  // everyone... this is how we will get customers. we still don't have a name,
  // we need to build trust so these needs to be A BIG PART of our
  // advertisement."
  //
  // She is right, and the 550 rule below is kept only as struck-through
  // history. The reasoning for gating it was margin; the reasoning for opening
  // it is that nobody has heard of us and a person coming to your door is the
  // cheapest trust a new brand can buy.
  //
  // ⚠️ READ THIS AS CAC, NOT AS COGS, OR IT LOOKS LIKE A DISASTER. It is 50 AED
  // ONCE PER CUSTOMER, not per order. On a first shirt it takes 56.8% down to
  // ~45.7%, which looks alarming in a margin table and is not the right table:
  // the comparison is the 134 AED this model assumes to buy a customer through
  // ads. Fifty is cheaper than that and it is spent on somebody who has already
  // decided to order. Every order after it carries nothing.
  //
  // thresholdAed stays in the object at 0 so the printed section still computes,
  // and so the next person can see it was deliberately set to zero rather than
  // forgotten.
  fitting: { aed: 50, thresholdAed: 0, oncePerCustomer: true, dubaiOnly: true, everyone: true },

  // Cost to acquire one customer. INDUSTRY ASSUMPTION, NOT MEASURED.
  // 134 = CPM 30, CTR 1.5%, 1.5% purchase rate. This is the number that
  // decides whether the business scales, and nobody has measured it.
  cacScenariosAed: [134, 200, 250],

};

// ---------------------------------------------------------------------------

// Landed per-order cost of one packaging line. Every rate on quote
// FRP2608-1149 is ex-VAT, and there is only ONE packaging supplier, so VAT
// applies to all of them. The `from` field is kept for the day a line really
// is bought elsewhere.
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
console.log(`  Quote FRP2609-1113 (07/09/2026) reconstructs exactly: 4,350.00 + 217.50 = 4,567.50.`);
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
console.log(`  ✅ ONE SUPPLIER. Hashir is Fitoor's contact, not a second vendor -- this`);
console.log(`     model had that wrong until 2026-09-08 and therefore treated the bag's`);
console.log(`     17 as VAT-inclusive. Every line is ex-VAT, so the bag lands at 17.85.`);
console.log(`  ✅ BAG SIZE SETTLED: 35x45 WITH A HANDLE, which is what FRP2609-1113 quotes`);
console.log(`     and what the 17 is priced against. The founder chose it on price and the`);
console.log(`     artwork was rebuilt to match. Do NOT re-raise 500x400 drawstring.`);

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
console.log(`  Fitoor, everything but the bag ${aed(exposure - bagOrder)}`);
console.log(`  ${bagLine.qty} cotton bags @ ${bagLine.aed} +VAT     ${aed(bagOrder)}   <- 100 is their minimum`);
console.log(`  ONE invoice, ONE 50% advance, 14-21 business days.`);
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

// ---------------------------------------------------------------------------
// NEW ITEMS — what a garment must sell for, and what stitching it can carry.
//
// Added 2026-09-12, when the founder asked: "a 100% linen abaya to be sold
// around 130 euros — how much can the stitching be?"
//
// The answer is an INVERSION of the margin formula, not a guess. Solving
//   GM = 0.971 - (1.05*(fabric+tailoring) + 60.79) / price
// for either unknown gives both directions: the price a known make-cost needs,
// and the stitching a known price can afford.
// ---------------------------------------------------------------------------
const EUR_AED = 4.26; // open.er-api.com, 2026-09-12. AED is pegged to USD, so
                      // this moves only with EUR/USD — re-check before pricing.

// Margin benchmarks come from the SHIPPING catalogue, never from a target
// typed in here: the shirt at 449 is the bar the founder already accepted.
const BENCH = unitEconomics(REF_PRICE, "Shirt", REF_PER_M).gm;

function priceFor(category, gm, perM = REF_PER_M, tailoring = INPUTS.tailoringAed[category]) {
  const make = INPUTS.metresPerGarment[category] * perM + tailoring;
  const fixed = 1.05 * make + (INPUTS.shippingAed * 1.05) + packagingPerOrder() + INPUTS.paymentFee.fixedAed;
  return fixed / (1 - INPUTS.paymentFee.pct - gm);
}

function tailoringFor(category, price, gm, perM = REF_PER_M) {
  const fabric = INPUTS.metresPerGarment[category] * perM;
  const budget = price * (1 - INPUTS.paymentFee.pct - gm)
    - (INPUTS.shippingAed * 1.05) - packagingPerOrder() - INPUTS.paymentFee.fixedAed;
  return budget / 1.05 - fabric;
}

// ---------------------------------------------------------------------------
// THE 850 THRESHOLD — a free in-person fitting above a basket value, to push
// orders past one garment. Added 2026-09-12.
// ---------------------------------------------------------------------------
function orderEcon(parts, price, extra = 0, rr = INPUTS.remakeRate) {
  const make = parts.reduce((t, c) => t + INPUTS.metresPerGarment[c] * REF_PER_M + INPUTS.tailoringAed[c], 0);
  const cogs = make + INPUTS.shippingAed + packagingPerOrder()
    + (price * INPUTS.paymentFee.pct + INPUTS.paymentFee.fixedAed)
    + rr * (make + INPUTS.shippingAed) + extra;
  return { gross: price - cogs, gm: (price - cogs) / price, remakeCost: make + INPUTS.shippingAed };
}

const TH = INPUTS.fitting.thresholdAed, FIT = INPUTS.fitting.aed;
const singles = Object.entries(INPUTS.metresPerGarment);
console.log(`\nTHE ${TH} THRESHOLD — free in-person fitting, ${FIT} AED, ONCE PER CUSTOMER`);
console.log(`  Set so a single dress or abaya qualifies, as well as any two pieces.`);
console.log(`    qualifies      dress 649 · abaya 699 · any pair (cheapest 2 shirts ${(2 * SHIRT_PRICE).toFixed(0)})`);
console.log(`    does not       shirt ${SHIRT_PRICE} · gilet 479 · trousers 519`);
console.log(`  The band is (519, 649]. ⚠️ The DRESS tailoring is a guess, not a quote -- see`);
console.log(`  tailoringAed. Both dresses sell at 649; the buttoned one sets the floor.`);

const BASKETS2 = [
  ["Shirt + trousers", ["Shirt", "Pants"], 968],
  ["Shirt + shirt", ["Shirt", "Shirt"], 898],
  ["Abaya + gilet", ["Abaya", "Gilet"], 1169],
  ["Abaya + gilet + shirt", ["Abaya", "Gilet", "Shirt"], 1618],
];
console.log(`\n  A FITTING AT ${FIT} vs 10% OFF — what each costs you on the same basket`);
console.log(`  ${"basket".padEnd(24)}${"list".padStart(7)}${"10% off".padStart(9)}${"fitting".padStart(9)}${"fitting wins by".padStart(17)}`);
for (const [name, parts, price] of BASKETS2) {
  const disc = orderEcon(parts, Math.round(price * 0.9)).gross;
  const fit = orderEcon(parts, price, FIT).gross;
  const d = fit - disc;
  console.log(`  ${name.padEnd(24)}${price.toFixed(0).padStart(7)}${disc.toFixed(0).padStart(9)}${fit.toFixed(0).padStart(9)}${((d >= 0 ? "+" : "") + d.toFixed(0)).padStart(17)}`);
}
console.log(`  At ${FIT} the fitting is cheaper than a discount on EVERY basket, and the gap widens`);
console.log(`  as baskets grow, because the fitting is FLAT and a percentage is not. It also`);
console.log(`  cannot be guessed or shared the way a promo code can, and it is paid ONCE per`);
console.log(`  customer where a discount is paid on every order forever.`);

const oneShirt = orderEcon(["Shirt"], SHIRT_PRICE);
const pairFit = orderEcon(["Shirt", "Pants"], 968, FIT);
console.log(`\n  AND IT PAYS FOR ITSELF AS RISK CONTROL. A remake costs the make plus a second`);
console.log(`  shipment, and it scales with the order the fitting is gating:`);
console.log(`    remake on one shirt        ${oneShirt.remakeCost.toFixed(0).padStart(5)} AED`);
console.log(`    remake on shirt + trousers ${pairFit.remakeCost.toFixed(0).padStart(5)} AED   <- ${FIT} of fitting against ${pairFit.remakeCost.toFixed(0)} of risk`);
console.log(`  Buyers under the threshold are not left bare: they keep the per-garment fit`);
console.log(`  guarantee that is already built. The fitting is the upgrade, not the floor.`);
console.log(`\n  ⚠️ ONE QUALIFYING ORDER IS ONE HOUR. At 4 a week that is 4 hours; this offer`);
console.log(`     does not survive volume. Word it "by appointment" so it can be capped.`);
console.log(`  ✅ NOTHING BLOCKS IT. The cart already holds many lines with quantities and`);
console.log(`     /api/orders takes items[] up to MAX_ITEMS=20. planning/frontend-todo.md`);
console.log(`     claimed "currently built single-item" for weeks; that was stale and was`);
console.log(`     believed without opening the code. Verify, do not inherit.`);

console.log(`\nNEW ITEMS — the price each one needs  (linen at ${REF_PER_M.toFixed(2)}/m, 1 EUR = ${EUR_AED} AED)`);
console.log(`  Benchmark is the SHIPPING shirt: ${REF_PRICE} at ${pct(BENCH)}. Stitching marked ⏳ is not quoted.`);
console.log(`  ${"item".padEnd(10)}${"m".padStart(5)}${"cloth".padStart(8)}${"stitch".padStart(8)}${"make".padStart(8)}${"@bench".padStart(9)}${"@60%".padStart(8)}   EUR @bench`);
for (const cat of ["Dress", "Abaya", "Gilet"]) {
  const m = INPUTS.metresPerGarment[cat], t = INPUTS.tailoringAed[cat];
  const cloth = m * REF_PER_M;
  // Dress and Abaya were both quoted by the tailor on 2026-09-12 ("80-90 for
  // both"). Gilet and Skirt are still placeholders, so they keep the marker.
  const quoted = cat === "Dress" || cat === "Abaya" ? " " : "⏳";
  console.log(`  ${cat.padEnd(10)}${m.toFixed(1).padStart(5)}${cloth.toFixed(0).padStart(8)}${(quoted + t).padStart(8)}${(cloth + t).toFixed(0).padStart(8)}${priceFor(cat, BENCH).toFixed(0).padStart(9)}${priceFor(cat, 0.6).toFixed(0).padStart(8)}   ${(priceFor(cat, BENCH) / EUR_AED).toFixed(0).padStart(5)}`);
}

console.log(`\nTHE ABAYA QUESTION — what stitching does a ${(130 * EUR_AED).toFixed(0)} AED (130 EUR) abaya afford?`);
console.log(`  ${"metres".padStart(7)}${"cloth".padStart(8)}${"@bench".padStart(9)}${"@50%".padStart(8)}${"@45%".padStart(8)}`);
for (const m of [2.8, 3.0, 3.2, 3.5]) {
  const saveM = INPUTS.metresPerGarment.Abaya;
  INPUTS.metresPerGarment.Abaya = m;
  const p = 130 * EUR_AED;
  console.log(`  ${m.toFixed(1).padStart(7)}${(m * REF_PER_M).toFixed(0).padStart(8)}${tailoringFor("Abaya", p, BENCH).toFixed(0).padStart(9)}${tailoringFor("Abaya", p, 0.5).toFixed(0).padStart(8)}${tailoringFor("Abaya", p, 0.45).toFixed(0).padStart(8)}`);
  INPUTS.metresPerGarment.Abaya = saveM;
}
console.log(`  Read it as a CEILING: the most the tailor can charge and still hit that margin.`);
console.log(`  A negative number means the price cannot carry the cloth at all.`);
console.log(`  ⚠️ 130 EUR is a EUROPEAN price and this sells in AED. It is a sanity check,`);
console.log(`     not a price — check it against what an abaya actually sells for here.`);

console.log(`\nPENDING INPUTS — every one of these moves the numbers above`);
console.log(`  1. Real CAC (134 is an assumption). NOT measurable until ads run.`);
console.log(`     Founder 2026-09-14: nothing to do now, and she is right.`);
console.log(`\n  SETTLED 2026-09-14. DO NOT RE-RAISE THESE:`);
console.log(`     Fitoor and the cotton bag are PAID and closed. She had already said so.`);
console.log(`     Stripe fee MEASURED from her Stripe balance history, not assumed.`);
console.log(`     Metres per garment: 2.0 a shirt, 2.0 a pair of pants, 4.0 a set.`);
console.log("");
