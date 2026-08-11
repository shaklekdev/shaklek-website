# Frontend — TODO

Status: core purchase flow is built and interaction-tested (Next.js 16, TypeScript, Tailwind, at `~/Desktop/Shaklek/website`).

## Done
- [x] Catalog page (`/`) — 7 items, correct finalized pricing, dress tiers
- [x] Design detail + customization (`/design/[slug]`) — size, fabric, color, Quick Customize (capped, revert works, fixed a real state bug here)
- [x] Checkout (`/checkout`) — order summary, payment method selection UI
- [x] Order confirmation (`/order-confirmed`) — stylist handoff trigger
- [x] Upload your own (`/upload`) — real file upload, notes, email, submits to stylist
- [x] How it works (`/how-it-works`)
- [x] Legal pages (`/legal/terms`, `/legal/returns`, `/legal/privacy`)
- [x] Shared header/footer, brand styling ported from prototype

## Open decisions
- [ ] **Multi-item cart or one-design-at-a-time checkout?** Currently built single-item — flagged to the founder, not yet decided. This affects checkout, order data shape, and confirmation copy if it changes.

## To build
- [ ] **Real catalog imagery.** Every catalog card is a CSS gradient placeholder right now, not a photo or illustration. Needs either real tailor photography once the pilot produces pieces, or commissioned flat-sketch illustrations sooner.
- [ ] **Customer accounts / order history** — "my wardrobe" page (dossier §10's retention loop depends on this existing) — depends on auth being built (see `payment-auth-todo.md`)
- [ ] **Loading and error states** — API calls (checkout, upload) currently have minimal handling; needs skeleton states and clearer failure messaging
- [ ] **Mobile device testing** — built responsive via Tailwind, but only verified at desktop viewport widths so far, not on real devices
- [ ] **SEO/OG metadata** per page (product pages especially — currently only the root layout has metadata)
- [ ] **Analytics** — none installed yet. Needs to track the metrics from the business dossier §15 (first-suggestion acceptance rate proxy, repeat purchase rate, etc.)
- [ ] **Accessibility pass** — keyboard navigation, ARIA labels on interactive elements (color swatches, Quick Customize), contrast check
- [ ] **Shaklek+ subscription UI** — avatar try-on, unlimited customization — not designed or built, depends on the subscription/payment system existing
- [ ] Quick Customize currently cycles through a hardcoded local color list — once Phase 2 AI exists (see `ai-integration-todo.md`), this should call the real backend instead of simulating locally
