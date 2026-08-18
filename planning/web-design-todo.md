# Web Design — TODO

Status: a real, consistent design system exists and is in production use (Georgia serif display type, cream/gold palette, ported directly from the original brand prototype). Real catalog photography closed the biggest content gap as of 2026-08-16 — what's left is mostly the polish layer and states nothing has been designed for yet.

## Done
- [x] Color and type system ported into Tailwind theme tokens (`globals.css`)
- [x] Consistent header/footer across all pages, including an Arabic wordmark lockup in the header (2026-08-16)
- [x] Catalog cards, form styling, button/badge system

## To do

### Imagery — closed as of 2026-08-16
- [x] All 8 catalog items now have real AI-generated photography with per-color front/back image variants (`website/public/catalog/`) — the CSS-gradient-placeholder gap is closed. Gradient values remain in `catalog.ts` only as a fallback background, not the primary display.
- [ ] Favicon and app icons — currently using Next.js defaults
- [ ] Open Graph / social share images per page

### States nothing has been designed for yet
- [ ] Empty states (e.g. no search results, if search gets added)
- [ ] Error states beyond the one basic message on `/upload`
- [ ] Loading skeletons for async actions (checkout submission, upload)
- [x] 404 page — brand-styled (header, serif "Nothing here" heading, "Back to catalog" button), not the Next.js default

### Not designed at all
- [ ] Account pages (login, order history, "my wardrobe")
- [ ] Shaklek+ subscription — pricing page, avatar try-on UI
- [ ] Admin/tailor-facing tools (swipe interface, order dashboard) — these need their own, more utilitarian design language, not the consumer brand system

### Polish
- [ ] Micro-interactions — hover/tap states exist but are minimal; nothing has real motion design
- [ ] Dark mode — not implemented, not yet decided if it should be
- [ ] A real accessibility/contrast audit, not just "looks fine"

## Correction backlog — logged 2026-08-16, quick fixes cleared 2026-08-17

Founder walked the live site and gave a batch of corrections in one sitting. All the straightforward text/UI items are done — what's left below is either an open creative decision, or cost-gated (Bedrock/Gemini image-gen calls) per the cost guardrail — state exact cost and get explicit go-ahead before running any of those.

### Catalog page (`/`, `src/app/page.tsx`)
- [x] **Hero banner — done 2026-08-18.** A real photo (`public/marketing/hero-banner.png`, linen fabric on a coastal dune, nature/pure themed per the founder's direction) behind the headline, with a slow ambient CSS pan/zoom (`hero-ken-burns` keyframe in `globals.css`, respects `prefers-reduced-motion`) standing in for video — the cheap option, no video asset needed.
- [x] **Slogan — decided 2026-08-17: "Your look, your way."**, unified on both `/` and `/our-story`.
- [x] Eyebrow copy — "Choose an inspiration".
- [x] Delivery timeline copy — "10 days" everywhere.
- [x] WhatsApp contact — footer link to `https://wa.me/971504766769`.

### Catalog photography corrections — first pass 2026-08-18, corrected/superseded 2026-08-18
All fixed and verified against the real images before generating (Gemini `gemini-3.1-flash-image`, using the correct-looking color variant as an edit reference so model/pose/lighting stayed identical and only the flagged detail changed):
- [x] **Structured Blouse** — `structured-blouse-white-front-v2.png` and `-burgundy-front-v2.png` now have the fitted waist band that was missing.
- [x] **Cargo Trousers, ivory-front** — button placket removed, now a smooth zip-front matching navy/burgundy/white (`cargo-trousers-ivory-front-v2.png`).
- [x] **Cargo/Pleated Trousers, back pockets — corrected 2026-08-18.** The first-pass fix matched all back pockets to the burgundy cargo trousers' flap+button style; founder corrected this reference standard to the simple welt/slit pockets used on `wide-leg-trousers` (no flap, no button). Regenerated all 4 cargo-trousers backs (`cargo-trousers-{ivory,white,navy,burgundy}-back-v2/v3.png`) and all 4 pleated-trousers backs to match that standard, with consistent belt loops added across all 4 pleated-trousers colors (previously inconsistent — burgundy had them, ivory didn't).
- [x] **Pleated Trousers — regenerated a second time.** First pass wasn't pleated enough to read as distinct from wide-leg trousers; second pass uses much deeper, more voluminous double box pleats, full body waist-to-feet, consistent belt loops and footwear across all 4 colors (`pleated-trousers-{color}-{front,back}-v2.png`).
- [x] **Cargo Trousers, navy-back — framing bug caught and fixed same day.** The navy back-pocket regeneration came back as a full-body shot with the model's face visible, breaking the neck-down/no-face crop convention used everywhere else in the catalog; recropped to match (`cargo-trousers-navy-back-v3.png`).
- Along the way, an unrelated real bug got found and fixed: catalog/design preview images were plain `<img>` tags (average ~793KB PNGs, no compression, no preloading) — switched to `next/image` with all color/view combinations preloaded, so switching colors or flipping front/back is now instant instead of a visible stall. See `frontend-todo.md`.

### Logo/wordmark symmetry (`src/components/Header.tsx:14`)
- [x] Done 2026-08-17: `items-start` → `items-center`, "Shaklek"/gold bar/"شكلك" now share a center axis.

### Favicon / app icon
- [x] Done 2026-08-17: code-generated "SK" monogram (`next/og` `ImageResponse`), no image-gen cost.

### Our Story page (`src/app/our-story/page.tsx`) — fully done 2026-08-18
- [x] Opening line, tenets (now 4, not 5 — merged "AI for good" into "Tailoring for your shape" since they overlapped on the no-overproduction point; removed the AI-assistant tenet entirely, that's Shaklek+), square corners.
- [x] Tenets grouped 2-per-image instead of 1-per-image (materials+customization share one photo, tailoring+pricing share another), alternating sides — more editorial than four small repeated squares.
- [x] **Real photography — done 2026-08-18.** Hero (`story-hero.png`) and both tenet-group images (`story-materials.png`, `story-tailoring.png`) are real generated photos now, not placeholders. Two problems caught and fixed before shipping: the first materials pass invented a fake handwritten customer note ("For Sarah... — E.M. '24"), and the first tailoring pass showed a price tag in GBP at a price nowhere near Shaklek's actual AED 290-350 — both regenerated with an explicit "no readable text" instruction. Founder portrait is still the dashed-border placeholder on purpose — generating a photo of a real named person (the founder) isn't something to fabricate; that slot needs an actual photo from her.
- [x] **Hero crop fix — done 2026-08-18.** `object-cover` alone was centering the crop and cutting off the model's head on wide/short (laptop) viewports; added `object-top` so the fixed-height hero always keeps the head in frame.
- [x] **Materials photo monogram fix — done 2026-08-18.** Embroidered monogram on the folded shirt read "AL"; regenerated with only that detail changed to "SK".
