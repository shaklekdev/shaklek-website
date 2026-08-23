# Shaklek — Planning & TODOs

Working documents covering everything left to build, organized by workstream. Each one is grounded in what actually exists in the codebase today, not generic advice — cross-reference the live site's code at `../website` and the business dossier for the decisions behind each item.

- [`frontend-todo.md`](./frontend-todo.md) — what's built vs. open on the customer-facing site
- [`backend-todo.md`](./backend-todo.md) — database (done), admin tooling, tailor swipe system (mostly not built yet)
- [`ai-integration-todo.md`](./ai-integration-todo.md) — the AI roadmap, staged deliberately per the business dossier
- [`payment-auth-todo.md`](./payment-auth-todo.md) — payment gateway (done, test mode) and customer/staff authentication (auth not built yet)
- [`web-design-todo.md`](./web-design-todo.md) — design system status, imagery gap, unstyled states
- [`aws-infrastructure-todo.md`](./aws-infrastructure-todo.md) — hosting plan; **live in production**, see status below
- [`trend-sourcing.md`](./trend-sourcing.md) — where trend-intake candidates actually come from, source by source: what's real, what's legally risky, what's built and tested
- [`incorporation-todo.md`](./incorporation-todo.md) — the real-world (non-code) blocker behind Stripe and the trademark: trade license is issued, Wio business bank account is next.

## The honest priority order

1. **Get the site live** — **done**. `shaklek.com`/`www.shaklek.com` live on AWS Amplify with HTTPS.
2. **Payment gateway** — **done in test mode as of 2026-08-14**. Full pipeline verified end-to-end in production: cart → Stripe Checkout → webhook confirms payment → order persisted as `paid` in the real database → notification email confirmed delivered to `orders@shaklek.com`. Going live (real money) still needs the Wio-backed Stripe merchant account approved — see `incorporation-todo.md` — but that's an account-verification step, not more code.
3. **A real database** — **done**. Neon Postgres (not RDS — chosen for cost, see `aws-infrastructure-todo.md`), schema for customers/orders/order_items, migrated and confirmed persisting real orders.
4. Everything else — auth (decided: Clerk, not built), AI image generation, deeper design work, admin dashboard — builds on top of those three, which are now all live.
5. **Incorporation** — trade license issued 2026-08-14; corporate bank account (Wio) is the current step, which is what unlocks the real Stripe merchant account.

## Recently built
- **Full commerce pipeline** (2026-08-14) — real Stripe Checkout + webhook, real Neon database, real Resend email delivery, all verified together end-to-end with an actual test-mode payment. See `payment-auth-todo.md` and `backend-todo.md` for the technical detail, and `aws-infrastructure-todo.md` for a genuinely non-obvious Amplify+Next.js SSR gotcha hit along the way (env vars set in the Amplify Console don't reach the running server unless the build spec explicitly writes them into `.env.production` — fixed, but worth reading if a future env var mysteriously doesn't seem to be "there").
- **Trend review dashboard** (`../website/src/app/dashboard/trends`) — staff-facing screen where AI-drafted trend candidates get approved or rejected before reaching the catalog. Currently running on mock data (`src/data/trends.ts`); wiring it to the real database and the real Bedrock trend-intake job is still open (`ai-integration-todo.md`).
- **Real Google Trends integrations** (`../website/src/lib/trends/`, `../website/src/app/api/trends/`) — first real (non-mock) trend signal sources, tested live. See `trend-sourcing.md` for what's actually working vs. blocked.
- **Catalog imagery gap closed** (2026-08-15/16) — all 8 catalog items (including the newly added Cargo Trousers) now have real AI-generated photography with per-color front/back variants, replacing the CSS-gradient placeholders. See `web-design-todo.md`.
- **Arabic wordmark added to the site header** (2026-08-16) — `شكلك` set in Reem Kufi under the "Shaklek" logotype, see `web-design-todo.md`.
- **Step 2 customizer redesign finalized** (2026-08-16, not yet built) — slider-based parameters per garment type replace the freeform chat customizer, so every combination is known in advance and pre-renderable; see `frontend-todo.md`. Also decided: only linen gets pre-rendered, cotton is a no-price-difference preference (the `LINEN_UPCHARGE` removal is tracked in `frontend-todo.md`).

Last updated 16 August 2026.
