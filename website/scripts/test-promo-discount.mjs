// Check on the promotion-code path. Two money questions:
//
//   1. Does the fils -> AED conversion in api/webhooks/stripe record what
//      Stripe actually charged? Stripe sends amount_total in the currency's
//      minor unit, and AED is a two-decimal currency (docs.stripe.com/
//      currencies -- it is not in the zero-decimal list), so it is fils.
//   2. Does the discount shown in the emails match the gap between the
//      catalog subtotal and what was collected?
//
// Pure functions only -- touches no database, creates no Stripe session,
// sends no email.
import { discountLine } from "../src/lib/orderEmail.ts";

let bad = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) bad++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name} -> ${JSON.stringify(got)}${ok ? "" : ` (want ${JSON.stringify(want)})`}`);
};

// The exact expression the webhook uses.
const toAed = (amountTotal) => (amountTotal / 100).toFixed(2);

console.log("amount_total (fils) -> AED recorded on the order");
eq("39000 = full-price shirt", toAed(39000), "390.00");
eq("31200 = 20% welcome offer", toAed(31200), "312.00");
eq("390 = 99%-off live test", toAed(390), "3.90");
eq("168000 = multi-item cart", toAed(168000), "1680.00");
eq("31201 = odd fils", toAed(31201), "312.01");
eq("0 = fully discounted", toAed(0), "0.00");

console.log("\ndiscount shown in the confirmation emails");
eq("99% off one shirt", discountLine([{ price: 390 }], 3.9), 386.1);
eq("20% off one shirt", discountLine([{ price: 390 }], 312), 78);
eq("no promotion code", discountLine([{ price: 390 }], 390), 0);
eq("quantity respected, undiscounted", discountLine([{ price: 390, quantity: 2 }], 780), 0);
eq("quantity respected, discounted", discountLine([{ price: 390, quantity: 2 }], 624), 156);
eq("multi-line undiscounted", discountLine([{ price: 390 }, { price: 450, quantity: 2 }], 1290), 0);

console.log("\nnothing is presented as a negative discount");
eq("charge exceeds subtotal", discountLine([{ price: 390 }], 400), 0);
eq("sub-fil rounding noise", discountLine([{ price: 390 }], 389.999), 0);

console.log(
  bad === 0
    ? "\nPASS — the order records what Stripe charged, and the emails say why."
    : `\n${bad} FAILURE(S)`,
);
process.exit(bad === 0 ? 0 : 1);
