// ONE SWITCH, READ IN THREE PLACES: the proxy (what a visitor can reach),
// /api/orders (what can be charged) and the root layout (what chrome renders).
//
// ⚠️ THE POLARITY IS THE WHOLE DESIGN. `=== "true"`, NEVER `!== "false"`.
//
// Amplify's build spec carries an explicit allowlist and STORE_OPEN is not in
// it as of 2026-09-12:
//   env | grep -e DATABASE_URL -e STRIPE_SECRET_KEY ... >> .env.production
// A variable set in the Amplify console but missing from that grep is simply
// undefined in the running app while the console shows it set. That cost an
// hour on RECONCILE_TOKEN (see CLAUDE.md) and it is the single most likely way
// this switch goes wrong.
//
// Written as `!== "false"`, that failure would mean OPEN: a public marketing
// site with live Stripe keys, taking real cards for garments that cannot be cut
// until the fabric lands. Written this way the same failure means CLOSED, which
// is visible, embarrassing and harmless.
//
// ⚠️ AND SO TURNING THE SHOP ON IS FOUR STEPS, NOT ONE. See step 0 of
// planning/launch-checklist.md:
//   1. add `-e STORE_OPEN` to the build spec   2. set STORE_OPEN=true in the
//   console   3. redeploy (the spec is read at BUILD time)   4. prove the
//   RUNNING APP sees it, not the console.
//
// SERVER ONLY. Never NEXT_PUBLIC_: a client-readable flag is a flag a client
// can be tempted to branch on, and this one decides whether money can move.
export function isStoreOpen(): boolean {
  return process.env.STORE_OPEN === "true";
}
