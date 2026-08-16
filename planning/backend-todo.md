# Backend — TODO

Status: schema and persistence code exist (2026-08-13), and as of 2026-08-14 a real database is live — Neon Postgres, not RDS (chosen for cost, see `aws-infrastructure-todo.md`) — with `DATABASE_URL` set and orders confirmed persisting for real. The upload flow was unified into `/api/orders`/`CustomizeChat` earlier this session; there is no separate `/api/custom-requests` route anymore.

## Done
- [x] `/api/orders` — receives checkout data, emails `orders@shaklek.com` via Resend (needs `RESEND_API_KEY` to actually send — currently logs instead)
- [x] `/dashboard/trends` — trend review dashboard UI (approve/reject/revert candidates, filter by status). Real interaction logic, but running entirely on mock data in `src/data/trends.ts` — no database, no real Bedrock trend-intake job feeding it yet, no auth guarding it. This is the frontend half of the "Tailor swipe tool" / "Admin dashboard" items below; the AI pipeline and persistence still need building.
- [x] **Order schema + persistence code** — `website/src/db/schema.ts` (Drizzle): `customers`, `orders`, `order_items` tables; migration generated at `website/drizzle/0000_quiet_fallen_one.sql`. `/api/orders` now writes to the DB via `getDb()` (`website/src/db/client.ts`) before emailing — no-ops with a log line when `DATABASE_URL` is unset, same degrade-gracefully pattern as the Resend key, so this shipped without needing RDS to exist first.

## To build, roughly in order

### 1. A real database — done
- [x] Neon Postgres provisioned, `DATABASE_URL` set in Amplify env vars, migration applied — confirmed persisting real orders in production as of 2026-08-14
- [x] **Orders + order_items tables** — schema written and live
- [x] **Customers table** — schema written and live (email only for now; style preferences/measurement history from dossier §5 not modeled yet)
- [ ] **Tailor table** — the dossier's "tailor database": skills by garment type, spec-compliance history, reliability — not started, waits on the tailor swipe tool actually needing it
- [ ] **Catalog table** — move catalog items out of the hardcoded `src/data/catalog.ts` file into the database once there's an admin tool to manage it — not started, waits on that admin tool

### 2. Tailor swipe tool
From dossier §5 — the mechanism that builds the catalog and validates producibility. The AI-trend-candidate half of this now has a working UI at `/dashboard/trends` (mock data) — still needs: real candidates from the Bedrock trend-intake job (`ai-integration-todo.md`), a database instead of hardcoded mock data, and tailor-specific producibility review distinct from the stylist's originality/quality review.
- [ ] Approved designs become catalog entries — currently approving in the dashboard doesn't write anywhere, since there's no database yet
- [ ] Needs its own lightweight auth (Clerk, see `payment-auth-todo.md`) — tailor and staff accounts, not customer accounts. `/dashboard/trends` is unauthenticated right now — anyone with the URL can reach it.

### 3. Admin / ops dashboard
- [ ] View incoming orders (currently only visible via email)
- [ ] Manage catalog items
- [ ] View upload-your-own requests

### 4. File storage
- [ ] Uploaded reference images are currently base64-encoded and emailed directly — fine at near-zero volume, won't scale. Needs an S3 bucket (see AWS doc) once volume picks up.

### 5. Payment webhooks
- [x] Handler for `checkout.session.completed` — `website/src/app/api/webhooks/stripe/route.ts`, done 2026-08-14 (see `payment-auth-todo.md`)
- [x] **Handler for payment failure — built 2026-08-16.** `checkout.session.expired` (~24h checkout timeout) now flips the order to `payment_failed` instead of sitting at `pending_payment` forever — same route, `api/webhooks/stripe/route.ts`. Subscribed the live webhook endpoint (`we_1U4NbRFDCtKouREXsqU49nJY`) to the new event via Stripe's API directly (no dashboard UI touched). `/dashboard/orders` shows it with a red status pill. No stylist email on this path — nothing was made, nothing to notify about. Other failure modes (e.g. a declined card retried within the same still-open Checkout Session) don't need a handler — the customer just retries, no separate Stripe event to react to.
- [ ] Handler for the refund case — dossier policy is refund-only-if-never-produced, needs to trigger through the real payment provider's refund API

### 6. Ops basics
- [ ] Rate limiting on public forms (`/upload`, checkout) — nothing stops spam submissions right now
- [ ] Structured logging — right now it's `console.log`, fine for one person checking a terminal, not for anything beyond that
