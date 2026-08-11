# Backend — TODO

Status: essentially none exists yet. There are two Next.js API routes (`/api/orders`, `/api/custom-requests`) that email a stylist — no database, no persistence, no admin tooling.

## Done
- [x] `/api/orders` — receives checkout data, emails `orders@shaklek.com` via Resend (needs `RESEND_API_KEY` to actually send — currently logs instead)
- [x] `/api/custom-requests` — receives upload-your-own submissions with image attachment, same email pipeline
- [x] `/dashboard/trends` — trend review dashboard UI (approve/reject/revert candidates, filter by status). Real interaction logic, but running entirely on mock data in `src/data/trends.ts` — no database, no real Bedrock trend-intake job feeding it yet, no auth guarding it. This is the frontend half of the "Tailor swipe tool" / "Admin dashboard" items below; the AI pipeline and persistence still need building.

## To build, roughly in order

### 1. A real database
Nothing is persisted right now — every order only exists as an email, if that. This is the most urgent gap.
- [ ] Stand up Postgres (see `aws-infrastructure-todo.md` for hosting choice)
- [ ] **Orders table** — every checkout should be a durable record, not just an email
- [ ] **Customer table** — the business dossier's "customer database" (§5): style preferences, measurements, order history
- [ ] **Tailor table** — the dossier's "tailor database": skills by garment type, spec-compliance history, reliability
- [ ] **Catalog table** — move catalog items out of the hardcoded `src/data/catalog.ts` file into the database once there's an admin tool to manage it

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
- [ ] Handler for payment confirmation/failure events from whichever gateway gets chosen (`payment-auth-todo.md`)
- [ ] Handler for the refund case — dossier policy is refund-only-if-never-produced, needs to trigger through the real payment provider's refund API

### 6. Ops basics
- [ ] Rate limiting on public forms (`/upload`, checkout) — nothing stops spam submissions right now
- [ ] Structured logging — right now it's `console.log`, fine for one person checking a terminal, not for anything beyond that
