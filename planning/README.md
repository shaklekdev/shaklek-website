# Shaklek — Planning & TODOs

Working documents covering everything left to build, organized by workstream. Each one is grounded in what actually exists in the codebase today, not generic advice — cross-reference the live site's code at `../website` and the business dossier for the decisions behind each item.

- [`frontend-todo.md`](./frontend-todo.md) — what's built vs. open on the customer-facing site
- [`backend-todo.md`](./backend-todo.md) — database, admin tooling, tailor swipe system (mostly not built yet)
- [`ai-integration-todo.md`](./ai-integration-todo.md) — the AI roadmap, staged deliberately per the business dossier
- [`payment-auth-todo.md`](./payment-auth-todo.md) — payment gateway and customer/staff authentication (neither exists yet)
- [`web-design-todo.md`](./web-design-todo.md) — design system status, imagery gap, unstyled states
- [`aws-infrastructure-todo.md`](./aws-infrastructure-todo.md) — hosting plan; **nothing is deployed yet**, this is the most time-sensitive item here
- [`trend-sourcing.md`](./trend-sourcing.md) — where trend-intake candidates actually come from, source by source: what's real, what's legally risky, what's built and tested
- [`incorporation-todo.md`](./incorporation-todo.md) — the real-world (non-code) blocker behind Stripe and the trademark: forming the actual UAE legal entity. Nothing started; researched checklist as of 12 August 2026.

## The honest priority order

1. **Get the site live** (`aws-infrastructure-todo.md`) — right now `shaklek.com` shows nothing. Everything else matters less until this is done.
2. **Payment gateway** (`payment-auth-todo.md`) — checkout can't actually take money without this. Provider decided (Stripe); merchant account blocked on incorporation — see `incorporation-todo.md`.
3. **A real database** (`backend-todo.md`) — orders currently only exist as emails, which doesn't scale past a handful of pilot orders.
4. Everything else — auth (decided: Clerk), AI, deeper design work — builds on top of those three.
5. **Incorporation** (`incorporation-todo.md`) — not code, but it's what's actually gating #2. Runs in parallel to the above, not after.

## Recently built
- **Trend review dashboard** (`../website/src/app/dashboard/trends`) — staff-facing screen where AI-drafted trend candidates get approved or rejected before reaching the catalog. Currently running on mock data (`src/data/trends.ts`); wiring it to RDS and the real Bedrock trend-intake job is still open (`ai-integration-todo.md`, `aws-infrastructure-todo.md`).
- **Real Google Trends integrations** (`../website/src/lib/trends/`, `../website/src/app/api/trends/`) — first real (non-mock) trend signal sources, tested live. See `trend-sourcing.md` for what's actually working vs. blocked.

Last updated 11 August 2026.
