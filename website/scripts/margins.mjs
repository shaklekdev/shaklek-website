// Margin model. Change an input, re-run, see what breaks.
//
//   npx tsx scripts/margins.mjs            # linen at 60 AED/m
//   npx tsx scripts/margins.mjs 15         # the old assumption, for comparison
//   npx tsx scripts/margins.mjs 60 1.6     # 60/m, and 1.6x the assumed metreage
//
// Inputs and their provenance are in planning/pricing-todo.md. The formulas
// here reproduce that file's published table exactly at 15 AED/m, which is how
// I know they are the same model and not a second one that happens to agree.
//
// PRICES ARE READ FROM catalog.ts, not from the planning doc. The doc still
// says Pants 450; the catalog was repriced to charm endings in 3f2969e and says
// 429. The number a customer actually pays is the one in the catalog.
import { catalog, BASE_PRICE_BY_CATEGORY } from "../src/data/catalog.ts";

const FABRIC_PER_M = Number(process.argv[2] ?? 60);
const METRE_SCALE = Number(process.argv[3] ?? 1);
// Welcome offer as a percentage. WELCOME20 is live in Stripe today, capped at
// 500 redemptions and expiring 2026-11-23, so changing this is a real decision
// with a live promotion code behind it, not a spreadsheet toggle.
const WELCOME_PCT = Number(process.argv[4] ?? 20);

// planning/pricing-todo.md, founder 2026-08-22.
const SHIPPING = 21;
const PACKAGING = 2;
const REMAKE = 0.05; // made-to-order's version of returns
const FEE_PCT = 0.029; // Stripe UAE, still flagged "verify" in the doc
const FEE_FIXED = 1;
const WELCOME = WELCOME_PCT / 100;
const CAC = [134, 200]; // estimated, not measured

const TAILORING = { Shirt: 40, Skirt: 60, Pants: 60, Dress: 85 };
// Flagged "Assumption -- confirm" in the doc. At 15 AED/m that hardly mattered.
// At 60 it is the most expensive unverified number in the business.
const METRES = { Shirt: 2.0, Skirt: 1.5, Pants: 2.0, Dress: 3.0 };

const price = (cat) => {
  const items = catalog.filter((c) => c.category === cat);
  return items.length ? items[0].price : BASE_PRICE_BY_CATEGORY[cat];
};

function model(cat) {
  const metres = METRES[cat] * METRE_SCALE;
  const fabric = metres * FABRIC_PER_M;
  const tailoring = TAILORING[cat];
  const cogs = (fabric + tailoring + SHIPPING + PACKAGING) * (1 + REMAKE);
  const list = price(cat);
  const fee = (p) => p * FEE_PCT + FEE_FIXED;
  const gross = list - cogs - fee(list);
  const disc = list * (1 - WELCOME);
  const grossDisc = disc - cogs - fee(disc);
  return { cat, metres, fabric, tailoring, cogs, list, gross, gm: gross / list, disc, grossDisc, gmDisc: grossDisc / disc };
}

// Real quotes, founder 2026-08-26.
const FABRICS = [
  ["100% cotton", 10],
  ["Organic cotton", 18],
  ["Linen, online", 30],
  ["Linen, in store", 40],
];

// FABRICS=1 compares them all at once. The site sells cotton and linen at the
// SAME price today, so a linen order and a cotton order earn very different
// money for the same sticker. That gap is the whole two-tier question.
if (process.env.FABRICS) {
  console.log(`\nSame prices, different cloth. ${WELCOME_PCT}% welcome offer applied.\n`);
  console.log("  fabric             AED/m " + ["Shirt", "Skirt", "Pants", "Dress"].map((c) => c.padStart(14)).join(""));
  console.log("  " + "-".repeat(78));
  const at = (perM, cat) => {
    const metres = METRES[cat] * METRE_SCALE;
    const cogs = (metres * perM + TAILORING[cat] + SHIPPING + PACKAGING) * (1 + REMAKE);
    const disc = price(cat) * (1 - WELCOME);
    const gross = disc - cogs - (disc * FEE_PCT + FEE_FIXED);
    return { gross, gm: gross / disc };
  };
  for (const [name, perM] of FABRICS) {
    const cells = ["Shirt", "Skirt", "Pants", "Dress"].map((c) => {
      const { gross, gm } = at(perM, c);
      return `${gross.toFixed(0)} (${(gm * 100).toFixed(0)}%)`.padStart(14);
    });
    console.log(`  ${name.padEnd(18)} ${String(perM).padStart(4)} ` + cells.join(""));
  }
  console.log("\n  Gross profit per garment, and gross margin, after the discount.\n");

  // What linen costs you relative to cotton, per garment. This is the number a
  // linen surcharge would have to cover.
  console.log("  What choosing linen costs you, versus organic cotton at 18:\n");
  for (const c of ["Shirt", "Skirt", "Pants", "Dress"]) {
    const base = at(18, c).gross;
    for (const [name, perM] of [["linen online 30", 30], ["linen in store 40", 40]]) {
      const gap = base - at(perM, c).gross;
      // A surcharge is also discounted and also pays a card fee, so it has to
      // be larger than the gap it closes.
      const surcharge = gap / ((1 - WELCOME) * (1 - FEE_PCT));
      console.log(
        `    ${c.padEnd(7)} ${name.padEnd(18)} you lose ${gap.toFixed(0).padStart(3)} AED  ->  charge ${surcharge.toFixed(0).padStart(3)} AED more to stay level`,
      );
    }
  }
  console.log();
  process.exit(0);
}

// EXTRA metres each customizer option adds over the cheapest cut in its
// category. ESTIMATES, and flagged as such everywhere they are used: the BASE
// metreage is already unconfirmed in planning/pricing-todo.md, so these are a
// guess sitting on top of a guess. The tailor can settle both in one answer.
const OPTION_METRES = {
  Shirt: { "sleeve_length:long": 0.25, "garment_length:longer": 0.25 },
  Pants: { "leg_width:wide": 0.35, "garment_length:full": 0.30 },
};

if (process.env.OPTIONS) {
  console.log(`\nWhat each cut costs in EXTRA fabric, at ${FABRIC_PER_M} AED/metre.`);
  console.log("Metreage per option is an ESTIMATE. Confirm with the tailor before charging for it.\n");
  for (const [cat, opts] of Object.entries(OPTION_METRES)) {
    console.log(`  ${cat}`);
    let worst = 0;
    for (const [opt, m] of Object.entries(opts)) {
      worst += m;
      const cost = m * FABRIC_PER_M;
      // A surcharge is charged once but also pays a card fee.
      const charge = cost / (1 - FEE_PCT);
      console.log(`    ${opt.padEnd(28)} +${m.toFixed(2)}m   costs ${cost.toFixed(0).padStart(3)} AED   -> charge ${charge.toFixed(0).padStart(3)}`);
    }
    const spread = worst * FABRIC_PER_M;
    console.log(`    ${"cheapest cut vs dearest".padEnd(28)} +${worst.toFixed(2)}m   costs ${spread.toFixed(0).padStart(3)} AED   <- the whole spread\n`);
  }
  process.exit(0);
}

const rows = ["Shirt", "Skirt", "Pants", "Dress"].map(model);

// `EXPLAIN=Shirt npx tsx scripts/margins.mjs 30` walks one garment line by line.
// Written because the summary table shows conclusions, and a conclusion you
// cannot rebuild yourself is one you cannot argue with a supplier about.
if (process.env.EXPLAIN) {
  const r = rows.find((x) => x.cat.toLowerCase() === process.env.EXPLAIN.toLowerCase());
  const m = (n) => `${n < 0 ? "-" : ""}${Math.abs(n).toFixed(2)}`.padStart(9);
  const line = (label, val, note = "") =>
    console.log(`  ${label.padEnd(30)} ${m(val)}   ${note}`);

  console.log(`\n${"=".repeat(76)}\nONE ${r.cat.toUpperCase()}, START TO FINISH, at ${FABRIC_PER_M} AED/metre\n${"=".repeat(76)}`);

  console.log(`\n1. WHAT THE CUSTOMER PAYS`);
  line("List price", r.list, "from catalog.ts");
  line(`Welcome offer, ${WELCOME_PCT}% off`, -(r.list - r.disc), "first-time buyer");
  line("MONEY IN", r.disc, "<- all you ever receive");

  console.log(`\n2. WHAT IT COSTS TO MAKE AND SEND`);
  line("Fabric", r.fabric, `${r.metres.toFixed(1)}m x ${FABRIC_PER_M} AED`);
  line("Tailor", r.tailoring, "what you pay him per piece");
  line("Shipping", SHIPPING, "courier to the customer");
  line("Packaging", PACKAGING, "box, tissue, label");
  const direct = r.fabric + r.tailoring + SHIPPING + PACKAGING;
  line("subtotal", direct);
  line(`Remake allowance ${REMAKE * 100}%`, direct * REMAKE, "1 in 20 remade free");
  line("TOTAL COST TO MAKE (COGS)", r.cogs);

  console.log(`\n3. WHAT THE BANK TAKES`);
  const fee = r.disc * FEE_PCT + FEE_FIXED;
  line("Card fee", fee, `${FEE_PCT * 100}% of ${r.disc.toFixed(0)} + ${FEE_FIXED}`);

  console.log(`\n4. WHAT IS LEFT  (gross profit)`);
  line("Money in", r.disc);
  line("less cost to make", -r.cogs);
  line("less card fee", -fee);
  line("GROSS PROFIT", r.grossDisc, `= ${(r.gmDisc * 100).toFixed(0)}% gross margin`);

  console.log(`\n5. WHAT IT COST TO FIND THIS CUSTOMER`);
  for (const c of CAC) {
    const net = r.grossDisc - c;
    line(`less advertising (CAC ${c})`, -c);
    console.log(
      `  ${"YOU KEEP".padEnd(30)} ${m(net)}   ${net < 0 ? "<- YOU LOSE MONEY" : "<- actual profit"}\n`,
    );
  }

  console.log(`  This still has to pay for your time, the website, the trade licence`);
  console.log(`  and everything else. Gross profit is not take-home pay.\n`);
  process.exit(0);
}
const f = (n, w = 6) => n.toFixed(0).padStart(w);
const pct = (n) => `${(n * 100).toFixed(0)}%`.padStart(5);

console.log(`\nLinen at ${FABRIC_PER_M} AED/metre` + (METRE_SCALE !== 1 ? `, metreage x${METRE_SCALE}` : ""));
console.log("Prices from catalog.ts. Shipping 21, packaging 2, remake 5%, card fee 2.9% + 1.\n");

console.log(`            metres  fabric  labour    COGS   price   gross    GM  |  after ${WELCOME_PCT}% off  gross    GM`);
console.log("            ".padEnd(12) + "-".repeat(94));
for (const r of rows) {
  console.log(
    `  ${r.cat.padEnd(8)}  ${r.metres.toFixed(1).padStart(5)}  ${f(r.fabric)}  ${f(r.tailoring)}  ${f(r.cogs)}  ${f(r.list)}  ${f(r.gross)}  ${pct(r.gm)}  |  ${f(r.disc, 12)}  ${f(r.grossDisc)}  ${pct(r.gmDisc)}`,
  );
}

console.log(`\nAgainst customer acquisition cost (estimated, never measured):`);
console.log("                 " + CAC.map((c) => `CAC ${c}`.padStart(11)).join("   ") + "     (at the discounted price)");
for (const r of rows) {
  const cells = CAC.map((c) => {
    const v = r.grossDisc - c;
    return `${v >= 0 ? "+" : ""}${v.toFixed(0)}`.padStart(11);
  });
  console.log(`  ${r.cat.padEnd(13)}` + cells.join("   ") + (r.grossDisc - CAC[0] < 0 ? "   <- LOSES MONEY" : ""));
}

// The doc's headline conclusion, tested rather than repeated.
const shirt = rows.find((r) => r.cat === "Shirt");
console.log(
  `\nIs fabric still "not the lever"?  Shirt fabric ${shirt.fabric.toFixed(0)} vs labour ${shirt.tailoring}: ` +
    (shirt.fabric > shirt.tailoring
      ? `FABRIC NOW DOMINATES, ${(shirt.fabric / shirt.tailoring).toFixed(1)}x labour. planning/pricing-todo.md says the opposite and is out of date.`
      : "yes, labour still dominates."),
);

// What price would restore the margin the ladder was designed around?
console.log("\nPrice needed to hold the original 71% gross margin at full price:");
for (const r of rows) {
  // p - cogs - (p*fee + 1) = 0.71p  ->  p(1 - 0.71 - fee) = cogs + 1
  const needed = (r.cogs + FEE_FIXED) / (1 - 0.71 - FEE_PCT);
  console.log(`  ${r.cat.padEnd(8)} ${f(r.list)}  ->  ${f(needed)}   (+${(needed - r.list).toFixed(0)})`);
}

// ---------------------------------------------------------------- the ceiling
//
// Solve for the fabric price at which each threshold is exactly met. Everything
// is measured at the DISCOUNTED price, because the welcome code is how a first
// customer arrives and a margin that only works at full price is not the margin
// you will actually earn.
//
//   gross = disc*(1 - fee%) - feeFixed - (metres*F + labour + ship + pack)*(1 + remake)
// solved for F.
function maxFabric(r, target) {
  const disc = r.disc;
  const gross = disc * (1 - FEE_PCT) - FEE_FIXED - target;
  return (gross / (1 + REMAKE) - r.tailoring - SHIPPING - PACKAGING) / r.metres;
}

const THRESHOLDS = [
  ["order breaks even (ignores acquisition)", 0],
  ["covers CAC 134, the estimate", CAC[0]],
  ["covers CAC 200, the pessimistic case", CAC[1]],
];

console.log(`\nMAX AED PER METRE, at the ${WELCOME_PCT}% discounted price:\n`);
console.log("  threshold".padEnd(46) + ["Shirt", "Skirt", "Pants", "Dress"].map((c) => c.padStart(8)).join("") + "    BINDING");
console.log("  " + "-".repeat(88));
for (const [label, target] of THRESHOLDS) {
  const vals = rows.map((r) => maxFabric(r, target));
  const worst = Math.min(...vals);
  const who = rows[vals.indexOf(worst)].cat;
  console.log(
    "  " + label.padEnd(44) + vals.map((v) => v.toFixed(0).padStart(8)).join("") + `    ${worst.toFixed(0)} (${who})`,
  );
}

// Same again if the welcome discount were cut to 10%, since that is the other
// lever and it costs nothing to see.
const DISC10 = rows.map((r) => ({ ...r, disc: r.list * 0.9 }));
const v10 = DISC10.map((r) => maxFabric(r, CAC[0]));
console.log(
  `\n  If the welcome offer were 10% instead of 20%, the CAC-134 ceiling moves to ` +
    `${Math.min(...v10).toFixed(0)} AED/m (${DISC10[v10.indexOf(Math.min(...v10))].cat}).`,
);
const vFull = rows.map((r) => maxFabric({ ...r, disc: r.list }, CAC[0]));
console.log(
  `  With no welcome offer at all, ${Math.min(...vFull).toFixed(0)} AED/m.`,
);

console.log(
  "\nMetres per garment is still an ASSUMPTION. At this fabric price every extra\n" +
    `half metre costs ${(0.5 * FABRIC_PER_M).toFixed(0)} AED a garment, so it is now the single most\n` +
    "expensive unverified number in the business. Ask the tailor for it.\n",
);
