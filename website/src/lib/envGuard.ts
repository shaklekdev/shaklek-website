// Stops local development from writing into the production database.
//
// Until 2026-08-23 both halves of the stack shared one Neon branch: local dev
// ran the Stripe SANDBOX key against the PRODUCTION database, so test
// checkouts wrote real rows into the live orders table. That is why production
// ended up with `cs_test_` sessions sitting alongside real `cs_live_` orders,
// polluting the dashboard and the revenue figures. Stripe was correctly split
// into live and sandbox; the database was not split at all.
//
// The pairing is now enforced rather than remembered:
//
//   sk_live_  ->  the production branch      (Amplify)
//   sk_test_  ->  any other branch           (local dev)
//
// Deliberately asymmetric:
//
//   * A TEST key against the production database THROWS. That is the
//     dangerous direction -- it writes junk into live data -- and it can only
//     ever happen in development, so throwing costs nothing.
//   * A LIVE key against a non-production database only WARNS. If the
//     production branch is ever recreated, PRODUCTION_DB_ENDPOINT below goes
//     stale, and a throw here would take the live storefront down over a
//     hostname constant. A loud log is the right severity for that.
//
// If the production Neon branch is recreated, update this constant. It is a
// hostname, not a credential.
const PRODUCTION_DB_ENDPOINT = "ep-blue-cell-b1krtp0o";

let checked = false;

export function assertDatabaseMatchesStripeMode(databaseUrl: string): void {
  if (checked) return;
  checked = true;

  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  if (!stripeKey) return; // Stripe not configured — nothing to cross-check.

  const isLiveKey = stripeKey.startsWith("sk_live_");
  const isTestKey = stripeKey.startsWith("sk_test_");
  if (!isLiveKey && !isTestKey) return;

  // Strip credentials before the host is touched, so nothing secret can reach
  // a log line or an error message.
  const host = databaseUrl.replace(/^[a-z]+:\/\/[^@]*@/, "").split("/")[0];
  const isProductionDb = host.startsWith(PRODUCTION_DB_ENDPOINT);

  if (isTestKey && isProductionDb) {
    throw new Error(
      "Refusing to start: STRIPE_SECRET_KEY is a TEST key but DATABASE_URL points at the " +
        "PRODUCTION database. Test checkouts would write real rows into live orders. " +
        "Point DATABASE_URL at the Neon `dev` branch (see src/lib/envGuard.ts).",
    );
  }

  if (isLiveKey && !isProductionDb) {
    console.error(
      `[envGuard] STRIPE_SECRET_KEY is a LIVE key but DATABASE_URL host (${host}) is not the ` +
        "expected production branch. Either the production branch was recreated -- update " +
        "PRODUCTION_DB_ENDPOINT in src/lib/envGuard.ts -- or live payments are being written " +
        "to the wrong database.",
    );
  }
}
