# Shaklek — Planning & TODOs

Working documents covering everything left to build, organized by workstream. Each one is grounded in what actually exists in the codebase today, not generic advice — cross-reference the live site's code at `../website` and the business dossier for the decisions behind each item.

- [`tomorrow-start-here.md`](./tomorrow-start-here.md) — **read this first each morning**: what happened yesterday, what to do today, and the traps that keep costing time
- [`frontend-todo.md`](./frontend-todo.md) — what's built vs. open on the customer-facing site
- [`backend-todo.md`](./backend-todo.md) — database (done), admin tooling, tailor swipe system (mostly not built yet)
- [`ai-integration-todo.md`](./ai-integration-todo.md) — the AI roadmap, staged deliberately per the business dossier
- [`payment-auth-todo.md`](./payment-auth-todo.md) — payment gateway (done, test mode) and customer/staff authentication (auth not built yet)
- [`web-design-todo.md`](./web-design-todo.md) — design system status, imagery gap, unstyled states
- [`aws-infrastructure-todo.md`](./aws-infrastructure-todo.md) — hosting plan; **live in production**, see status below
- [`trend-sourcing.md`](./trend-sourcing.md) — where trend-intake candidates actually come from, source by source: what's real, what's legally risky, what's built and tested
- [`incorporation-todo.md`](./incorporation-todo.md) — the real-world (non-code) blocker behind Stripe and the trademark: trade license is issued, Wio business bank account is next.
- [`catalog-images-todo.md`](./catalog-images-todo.md) — per-item/per-colour status of the customizer photography (all eight items complete as of 2026-08-22), remaining defects, and the decisions behind how these images are produced. The *method* lives in root `CLAUDE.md` §4b.

## The honest priority order

1. **Get the site live** — **done**. `shaklek.com`/`www.shaklek.com` live on AWS Amplify with HTTPS.
2. **Payment gateway** — **done in test mode as of 2026-08-14**, and the **Stripe merchant account is now verified and live as of 2026-08-20**: `charges_enabled` and `payouts_enabled` both true, Wio bank account attached, no outstanding requirements. The remaining step to take real money is swapping the Stripe test keys for live keys in Amplify's env vars — a credential change, not code. See `payment-auth-todo.md`.
3. **A real database** — **done**. Neon Postgres (not RDS — chosen for cost, see `aws-infrastructure-todo.md`), schema for customers/orders/order_items, migrated and confirmed persisting real orders.
4. **Customizer photography** — **done 2026-08-22**. All eight items have a complete combination matrix in four colours, front and back. This is the product differentiator: made-to-order only sells if choosing an option visibly changes the garment. Method in root `CLAUDE.md` §4b; remaining defects in `catalog-images-todo.md`.
5. **Go live on real money** — **the current blocker, and it is two credential swaps, not code**: Stripe test → live keys, and Clerk dev → production keys in Amplify env vars. Then one real end-to-end payment and refund to prove it.
6. **Demand** — the honest gap. Every doc in this folder is a build doc; there is no customer-acquisition plan yet. A finished shop with no visitors earns the same as an unbuilt one. Marketing content for Snapchat/Instagram/Facebook is the next workstream after the key swap.
7. Everything else — AI image generation as a *product* feature, deeper design work, admin tooling — is Phase 2/3 and gated on the above proving out.
8. **Incorporation** — trade license issued 2026-08-14; Wio corporate account open; Stripe merchant account verified 2026-08-20. Done.

## Recently built
- **Full commerce pipeline** (2026-08-14) — real Stripe Checkout + webhook, real Neon database, real Resend email delivery, all verified together end-to-end with an actual test-mode payment. See `payment-auth-todo.md` and `backend-todo.md` for the technical detail, and `aws-infrastructure-todo.md` for a genuinely non-obvious Amplify+Next.js SSR gotcha hit along the way (env vars set in the Amplify Console don't reach the running server unless the build spec explicitly writes them into `.env.production` — fixed, but worth reading if a future env var mysteriously doesn't seem to be "there").
- **Trend review dashboard** (`../website/src/app/dashboard/trends`) — staff-facing screen where AI-drafted trend candidates get approved or rejected before reaching the catalog. Currently running on mock data (`src/data/trends.ts`); wiring it to the real database and the real Bedrock trend-intake job is still open (`ai-integration-todo.md`).
- **Real Google Trends integrations** (`../website/src/lib/trends/`, `../website/src/app/api/trends/`) — first real (non-mock) trend signal sources, tested live. See `trend-sourcing.md` for what's actually working vs. blocked.
- **Catalog imagery gap closed** (2026-08-15/16) — all 8 catalog items (including the newly added Cargo Trousers) now have real AI-generated photography with per-color front/back variants, replacing the CSS-gradient placeholders. See `web-design-todo.md`.
- **Arabic wordmark added to the site header** (2026-08-16) — `شكلك` set in Reem Kufi under the "Shaklek" logotype, see `web-design-todo.md`.
- **Step 2 customizer redesign finalized** (2026-08-16, not yet built) — slider-based parameters per garment type replace the freeform chat customizer, so every combination is known in advance and pre-renderable; see `frontend-todo.md`. Also decided: only linen gets pre-rendered, cotton is a no-price-difference preference (the `LINEN_UPCHARGE` removal is tracked in `frontend-todo.md`).
- **Stripe merchant account verified** (2026-08-20) — live account approved, charges and payouts enabled, Wio bank account attached. See `payment-auth-todo.md`.
- **Customizer photography complete for all eight items** (2026-08-22) — four shirts on sleeve/length, four trousers on a `straight/wide` × `full/cropped` matrix. 64 trouser combination photos, front and back, four colours each, plus twelve *base* photos corrected (banded had tapered backs contradicting straight fronts; cargo backs were cropped above the hem so length changes were invisible from behind). Pleated Trousers use a **barrel leg** for their wide option so they read as a different garment from Wide-leg. The generation recipe — order of generation, colour order, which edits need Pro rather than Flash, the reference-image technique, and which measuring instruments lie — is root `CLAUDE.md` §4b, and it generalises to new pants, shirts and dresses. Remaining defects: `catalog-images-todo.md`.
- **Catalog images re-encoded as JPEG** (2026-08-21) — an Amplify deploy failed because the build output hit 291MB against a 230MB cap, with the catalog alone at 185MB. Now 17MB. Keep new catalog images in this format.

Last updated 22 August 2026.
