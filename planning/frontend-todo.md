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
- [x] **Replace the chat-based Step 2 customizer with slider-based parameters.** Built 2026-08-16: `src/data/parameterSliders.ts` (fixed per-category slider specs), `src/components/CustomizeParameters.tsx` (new component, used by `DesignCustomizer.tsx` for catalog items only). Shirt: sleeves, pockets, closure, length. Pants: leg width, length, waist, closure, pockets. `CustomizeChat.tsx` (freeform, AI-parsed) is kept as-is and still used by `/upload`, since uploaded reference photos don't have a fixed base style to define sliders against. Verified end-to-end: slider selections flow into cart/checkout as readable labels (e.g. "Straight leg, Full length, Normal waist, Button fly, Pockets").
- [x] **Remove the linen upcharge.** Done 2026-08-16: `LINEN_UPCHARGE` removed from `src/data/colors.ts` and all 4 call sites (`DesignCustomizer.tsx`, `upload/page.tsx` ×2, `FabricColorPicker.tsx`). Fabric picker now reads "Linen" / "Organic cotton" with no price difference; linen is the default (only linen gets pre-rendered).
- [x] **Customer accounts / order history** — built 2026-08-16: `/account` has order history, saved measurements and name, behind Clerk. Only the richer "my wardrobe" framing below is still open. Original note: — "my wardrobe" page (dossier §10's retention loop depends on this existing) — depends on auth being built (see `payment-auth-todo.md`)
- [ ] **Loading and error states** — API calls (checkout, upload) currently have minimal handling; needs skeleton states and clearer failure messaging
- [ ] **Mobile device testing** — built responsive via Tailwind, but verified at desktop widths. **Mobile navigation now exists** (hamburger in `Header.tsx`, 2026-08-23) and was confirmed working on a real phone by the founder; broader real-device testing is still unrecorded so far, not on real devices
- [x] **SEO/OG metadata** — done 2026-08-22: sitemap, robots, per-page metadata and OG images. Original note: per page (product pages especially — currently only the root layout has metadata)
- [ ] **Analytics** — none installed yet. Needs to track the metrics from the business dossier §15 (first-suggestion acceptance rate proxy, repeat purchase rate, etc.)
- [ ] **Accessibility pass** — keyboard navigation, ARIA labels on interactive elements (color swatches, Quick Customize), contrast check
- [ ] **Shaklek+ subscription UI** — avatar try-on, unlimited customization — not designed or built, depends on the subscription/payment system existing
- [ ] `/api/customize`'s intent parsing is rule-based keyword matching (`src/lib/customizeParser.ts`), not real NLP — swap for Google Gemini (~~Claude on Bedrock~~ — superseded 2026-08-12, see `aws-infrastructure-todo.md`) once that's wired up (see `ai-integration-todo.md`); the route/component contract is already shaped for that swap
- [ ] The "LIVE PREVIEW" badge on `/design/[slug]` overpromises what actually happens: the photo only changes with fabric color, not with any of the sleeve/pocket/closure/length sliders (those only update the text chips below). **SUPERSEDED 2026-08-22 — this was built.** Every catalog item now has a full `comboImages` matrix, so the photo genuinely changes with the render-tier sliders, and the badge no longer overpromises. Original note: Real per-combination rendering would need live AI image generation, which doesn't exist anywhere in the codebase yet (confirmed 2026-08-18) — see `payment-auth-todo.md`'s Shaklek+ section for the cost/scope tradeoffs. Founder's current direction (2026-08-18): pre-render a reduced combination set per item (only the visually-significant sliders, front-only, no face) and store it, rather than either the current text-only chips or full live generation. Not built yet.
- [x] **Catalog/design preview images switched to `next/image` — done 2026-08-18.** Root cause of a real "bugging when I switch photos" complaint: all 64 catalog PNGs average ~793KB (some 1.7MB+), served via plain `<img>` with no compression, no preloading, and no loading state — every color/front-back switch was a fresh multi-hundred-KB download. `CatalogCard.tsx` and `CustomizeParameters.tsx` now use `next/image` (automatic format negotiation + responsive sizing), and `DesignCustomizer.tsx` computes every color/view combination for the current item and preloads all of them via hidden `priority` `Image` tags sharing the same `sizes` value as the visible one. Verified live on production: color switching is now instant (previously a visible stall).
