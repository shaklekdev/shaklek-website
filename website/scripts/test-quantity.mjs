// Adversarial check on the quantity path added in 33deaf3. Quantity multiplies
// unit_amount, so it is money and gets the same treatment price does.
// Pure functions only -- touches no database and creates no Stripe session.
//
// Run: npx tsx scripts/test-quantity.mjs
//
// It must be tsx, not plain node. pricing.ts imports "@/data/catalog", and
// that alias is resolved from tsconfig by tsx; `node scripts/test-quantity.mjs`
// dies with ERR_MODULE_NOT_FOUND before a single assertion runs. That failure
// looks exactly like a broken money test and is not one.
import { resolveQuantity, resolveOrderPricing, MAX_QUANTITY_PER_ITEM } from "../src/lib/pricing.ts";
import { catalog } from "../src/data/catalog.ts";

// Read the expected price from the catalog rather than hardcoding it. This
// assertion carried a literal 450, the catalog was repriced to 429 in 3f2969e
// ("Reprice to charm endings"), and the test then failed for two days over a
// stale number while the security property it guards was fine throughout.
// A money test that cries wolf is a money test people stop running.
const WLT = catalog.find((c) => c.slug === "wide-leg-trousers");
// Fail loudly rather than with a TypeError three lines later if the slug is
// ever renamed -- a money test has to say what broke.
if (!WLT) throw new Error("test fixture gone: no catalog item with slug wide-leg-trousers");

const cases = [
  ["missing", undefined, 1],
  ["null", null, 1],
  ["1", 1, 1],
  ["10 (at cap)", 10, 10],
  ["11 (over cap)", 11, null],
  ["0", 0, 1],
  ["-5", -5, 1],
  ["2.9 float", 2.9, 2],
  ["NaN", NaN, 1],
  ["Infinity", Infinity, 1],
  ["-Infinity", -Infinity, 1],
  ['"3" string', "3", 3],
  ['"abc"', "abc", 1],
  ["{} object", {}, 1],
  ["[] array", [], 1],
  ['["7"] array', ["7"], 7],
  ["1e9", 1e9, null],
  ["true", true, 1],
  ["1e3 string", "1e3", null],
];

let bad = 0;
console.log(`resolveQuantity  (cap = ${MAX_QUANTITY_PER_ITEM})\n`);
for (const [label, input, expected] of cases) {
  const got = resolveQuantity(input);
  const ok = got === expected;
  if (!ok) bad++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${label.padEnd(14)} -> ${got === null ? "REFUSED" : got}` +
      (ok ? "" : `   (expected ${expected === null ? "REFUSED" : expected})`),
  );
}

console.log("\nhostile body: tampered price, name and category, quantity 3");
const hostile = resolveOrderPricing([
  { slug: "wide-leg-trousers", price: 5, name: "FREE", category: "Shirt", quantity: 3 },
]);
console.log("  " + JSON.stringify(hostile));
const h = hostile.ok && hostile.priced[0];
const hostileOk =
  h &&
  h.price === WLT.price &&
  h.name === WLT.name &&
  h.category === WLT.category &&
  hostile.total === WLT.price * 3;
if (!hostileOk) bad++;
console.log(`  ${hostileOk ? "ok  " : "FAIL"} catalog price/name/category win, total = price x quantity`);

console.log("\none over-cap line refuses the whole order (no silent trim)");
const mixed = resolveOrderPricing([{ slug: "oversized-shirt", quantity: 1 }, { slug: "oversized-shirt", quantity: 11 }]);
const mixedOk = mixed.ok === false;
if (!mixedOk) bad++;
console.log(`  ${mixedOk ? "ok  " : "FAIL"} ${JSON.stringify(mixed)}`);

console.log(bad === 0 ? "\nPASS — quantity cannot be used to move money." : `\n${bad} FAILURE(S)`);
process.exit(bad === 0 ? 0 : 1);
