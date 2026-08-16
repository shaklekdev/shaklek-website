# Frontend — TODO

Status: core purchase flow is built and interaction-tested (Next.js 16, TypeScript, Tailwind, at `~/Desktop/Shaklek/website`).

## Done
- [x] Catalog page (`/`) — 8 items, correct finalized pricing, dress tiers, real photography with per-color image variants (see below — the placeholder-gradient gap is closed)
- [x] Design detail + customization (`/design/[slug]`) — size, fabric, color, plus a real chat-based customize flow (see below) — Quick Customize's fake local-color-cycle is gone
- [x] Checkout (`/checkout`) — order summary, payment method selection UI
- [x] Order confirmation (`/order-confirmed`) — stylist handoff trigger
- [x] Upload your own (`/upload`) — file upload → garment-type pick → same customize chat as the catalog flow → submits structured spec + notes to stylist
- [x] How it works (`/how-it-works`)
- [x] Legal pages (`/legal/terms`, `/legal/returns`, `/legal/privacy`)
- [x] Shared header/footer, brand styling ported from prototype
- [x] **Unified customize flow** — `src/data/designSpec.ts` (shared spec schema, catalog-start or upload-start), `CustomizeChat.tsx` + `FabricColorPicker.tsx` (shared between `/design/[slug]` and `/upload`), `/api/customize` (rule-based intent parsing — see `ai-integration-todo.md`, this is explicitly a stand-in for real NLP, not Phase 2 itself). Constraint violations (second fabric, lining, logo) block Continue/Send until the customer clears the flagged request or drops it.

## Open decisions
- [ ] **Multi-item cart or one-design-at-a-time checkout?** Currently built single-item — flagged to the founder, not yet decided. This affects checkout, order data shape, and confirmation copy if it changes.

## To build
- [ ] **Replace the chat-based Step 2 customizer with slider-based parameters.** Prototyped and finalized 2026-08-16 (see the parameter-sliders artifact) — fixed set of sliders per garment type (shirt: sleeves, pockets, closure, length; pants: leg width, length, waist, closure, pockets), each capped at 3 options, so every resulting combination (144 for shirt, 288 for pants, × 4 colors) is known in advance and can be pre-rendered instead of relying on freeform chat + live AI parsing. Not yet built into `DesignCustomizer.tsx`/`CustomizeChat.tsx`.
- [ ] **Remove the linen upcharge.** Decided 2026-08-16: only linen gets pre-rendered/photographed; cotton is offered as a no-price-difference fit preference. `LINEN_UPCHARGE` in `src/data/colors.ts` and its use in `DesignCustomizer.tsx` still reflect the old +60 pricing and need removing.
- [ ] **Customer accounts / order history** — "my wardrobe" page (dossier §10's retention loop depends on this existing) — depends on auth being built (see `payment-auth-todo.md`)
- [ ] **Loading and error states** — API calls (checkout, upload) currently have minimal handling; needs skeleton states and clearer failure messaging
- [ ] **Mobile device testing** — built responsive via Tailwind, but only verified at desktop viewport widths so far, not on real devices
- [ ] **SEO/OG metadata** per page (product pages especially — currently only the root layout has metadata)
- [ ] **Analytics** — none installed yet. Needs to track the metrics from the business dossier §15 (first-suggestion acceptance rate proxy, repeat purchase rate, etc.)
- [ ] **Accessibility pass** — keyboard navigation, ARIA labels on interactive elements (color swatches, Quick Customize), contrast check
- [ ] **Shaklek+ subscription UI** — avatar try-on, unlimited customization — not designed or built, depends on the subscription/payment system existing
- [ ] `/api/customize`'s intent parsing is rule-based keyword matching (`src/lib/customizeParser.ts`), not real NLP — swap for Claude on Bedrock once that's wired up (see `ai-integration-todo.md`); the route/component contract is already shaped for that swap
- [ ] Live preview is still the gradient/uploaded-photo placeholder, not a real generated image — depends on Titan Image Generator on Bedrock (blocked on AWS account + Bedrock access)
