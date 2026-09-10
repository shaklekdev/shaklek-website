# Backend — TODO

Status: schema and persistence code exist (2026-08-13), and as of 2026-08-14 a real database is live — Neon Postgres, not RDS (chosen for cost, see `aws-infrastructure-todo.md`) — with `DATABASE_URL` set and orders confirmed persisting for real. The upload flow was unified into `/api/orders`/`CustomizeChat` earlier this session; there is no separate `/api/custom-requests` route anymore.

## Done
- [x] `/api/orders` — receives checkout data, resolves prices and quantities **server-side** from `catalog.ts` (never from the request body — see `src/lib/pricing.ts` and `security/rca-2026-08-23.md`), creates a Stripe Checkout Session and persists the order. Email fires from the **webhook**, once Stripe confirms payment: stylist notification to `orders@shaklek.com` plus a customer confirmation, both live via Resend.
- [x] `/dashboard/trends` — trend review dashboard UI (approve/reject/revert candidates, filter by status). Behind Clerk + `STAFF_EMAILS` since 2026-08-16. Real interaction logic, but running entirely on mock data in `src/data/trends.ts` — no database, no real Bedrock trend-intake job feeding it yet, no auth guarding it. This is the frontend half of the "Tailor swipe tool" / "Admin dashboard" items below; the AI pipeline and persistence still need building.
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
- [ ] Approved designs become catalog entries — approving in the dashboard still doesn't write anywhere. (The database has existed since 2026-08-14; it is the *trends* dashboard specifically that runs on mock data.)
- [ ] Needs its own lightweight auth (Clerk, see `payment-auth-todo.md`) — tailor and staff accounts, not customer accounts. ~~`/dashboard/trends` is unauthenticated~~ — **no longer true**: behind Clerk + `STAFF_EMAILS` since 2026-08-16, and `/api/trends/*` was locked to staff on 2026-08-23. The tailor-accounts half of this item is still genuinely open.

### 3. Admin / ops dashboard
- [x] View incoming orders — `/dashboard/orders` exists: status buttons, spec-sheet PDF download and WhatsApp handoff. Staff-only via `STAFF_EMAILS`.
- [ ] Manage catalog items
- [ ] View upload-your-own requests
- [x] **Tailor spec sheet + WhatsApp handoff — built 2026-08-17, human-in-the-loop, not automated.** Founder descoped this from full automation once the real WhatsApp Business Platform requirement (Meta business verification, message template approval) came up as a genuine external blocker, same category as the Wio bank account. `GET /api/dashboard/orders/[id]/spec-sheet` (staff-only, `PDFDocument` via `pdfkit`) generates a per-order PDF with, per item: the actual front/back catalog photo (looked up from `src/data/catalog.ts` by item name + ordered color, falls back to the item's default image pair if the color isn't in `colorImages`), plus category/fabric/color/size/measurements/customization/notes. `/dashboard/orders` shows a 3-step flow per order: "1. Download PDF" (real file download, `Content-Disposition: attachment`), "2. Open WhatsApp chat" (`wa.me/<TAILOR_WHATSAPP_NUMBER>`, prefilled with a short order summary), "3. Attach the PDF, send" (manual, since `wa.me` links can't pre-attach a file — a real WhatsApp platform limit, not a gap in this build). `TAILOR_WHATSAPP_NUMBER` is currently set to the founder's own number for testing (`971504766769`, both in `.env.local` and Amplify) — swap to the real tailor's number once decided; "Send to tailor" grays out gracefully if the env var is ever unset. Needed `serverExternalPackages: ["pdfkit"]` in `next.config.ts` (pdfkit reads its font `.afm` files relative to its own package dir at runtime, bundling breaks that lookup — `ENOENT` on `Helvetica.afm`, a known pdfkit + Next.js App Router issue) and `doc.openImage()` (untyped in `@types/pdfkit` but real at runtime, cast narrowly) to size the "Front"/"Back" captions from each photo's real aspect ratio instead of a guessed offset that overlapped non-square images.
- [ ] Real automated WhatsApp send (no human click) stays possible later, once WhatsApp Business Platform access exists — the PDF-generation half already built here is the same building block that would need.

### 4. File storage
- [ ] ⚠️ **Uploaded reference images are LOST on every paid order, not emailed.**
      This item used to say they are "base64-encoded and emailed directly",
      which was true only of the fallback branch that fires when Stripe is NOT
      configured — in production that branch never runs. On the real path the
      stylist email is built from DB rows in the Stripe webhook, and
      `order_items` stores only `hasReferenceImage: boolean`. **A customer can
      pay for a design based on their own picture and the tailor receives a
      checkbox.** Corrected 2026-08-26 after tracing the code rather than
      trusting this line. Needs object storage; see the architecture doc.

### 5. Payment webhooks
- [x] Handler for `checkout.session.completed` — `website/src/app/api/webhooks/stripe/route.ts`, done 2026-08-14 (see `payment-auth-todo.md`)
- [x] **Handler for payment failure — built 2026-08-16.** `checkout.session.expired` (~24h checkout timeout) now flips the order to `payment_failed` instead of sitting at `pending_payment` forever — same route, `api/webhooks/stripe/route.ts`. Subscribed the live webhook endpoint (`we_1U4NbRFDCtKouREXsqU49nJY`) to the new event via Stripe's API directly (no dashboard UI touched). `/dashboard/orders` shows it with a red status pill. No stylist email on this path — nothing was made, nothing to notify about. Other failure modes (e.g. a declined card retried within the same still-open Checkout Session) don't need a handler — the customer just retries, no separate Stripe event to react to.
- [ ] Handler for the refund case — dossier policy is refund-only-if-never-produced, needs to trigger through the real payment provider's refund API

### 6. Ops basics
- [x] Rate limiting on public routes — added 2026-08-23: `/api/orders` 10 per 10 min, `/api/customize` 60 per min, plus Content-Length caps and a cross-origin guard on every write route (`src/lib/rateLimit.ts`, `src/lib/requestGuards.ts`). Per-container, not a shared store — documented as such in the source; a WAF rule or Upstash is the real fix if abuse appears.
- [ ] Structured logging — right now it's `console.log`, fine for one person checking a terminal, not for anything beyond that
