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
- [ ] **Hero banner** — add a nature-inspired moving visual behind the "Your look, your way." headline. No video asset exists yet. Open decision: a still photo with an ambient CSS pan/zoom (cheap, fast) vs. a real video file (bigger scope, needs a sourced or generated asset). Not picked yet.
- [x] **Slogan — decided 2026-08-17: "Your look, your way."**, unified on both `/` and `/our-story` (both hero `<h1>`s match now). Tried "You don't fit fashion. Fashion fits you." first per marketing recommendation, shipped it, founder saw it live and preferred the shorter original — reverted. Both pages also got a new subhead under the headline carrying the essentials positioning: "Elegant fashion essentials — friendly to your skin, shaped to your body" (`/`) and the matching "We make elegant fashion essentials, not fast trends..." paragraph plus "Shaklek means your way in Arabic..." opening line (`/our-story`). That positioning wasn't reverted, only the headline was. Hero banner *visual* (the moving/nature background) is still open, see the line above — headline/copy is settled now, only the visual treatment is left.
- [x] Eyebrow copy — done 2026-08-17: heading changed to "Choose an inspiration" (kept the existing "Step 1" eyebrow label above it rather than duplicating "Step 1" in both places).
- [x] Delivery timeline copy — done 2026-08-17: "7 days" → "10 days" in all five spots (`page.tsx`, `how-it-works`, `order-confirmed`, `checkout`, `orderEmail.ts`).
- [x] WhatsApp contact — done 2026-08-17: footer link to `https://wa.me/971504766769`, opens in a new tab. Only in the footer for now, not a floating chat bubble — that's a bigger design call if wanted later.

### Catalog photography corrections (cost-gated — Gemini image-gen, get go-ahead + state cost first)
- [ ] **Structured Blouse** — white and maroon front images are inconsistent with the ivory version: the waist band is missing/not visible on white and maroon. Regenerate or fix.
- [ ] **Pants items generally** — can crop from full-body generations instead of separate close-up generations, founder's call, cheaper if it works visually.
- [ ] **Cargo Trousers** — back-view pockets are inconsistent; remove the back pockets entirely to match the White Cargo Pants reference image (which has none).
- [ ] **Pleated Trousers** — use full-body images, not the current crop.

### Logo/wordmark symmetry (`src/components/Header.tsx:14`)
- [x] Done 2026-08-17: `items-start` → `items-center` on the header logo's flex column — "Shaklek", the gold bar, and "شكلك" now share a center axis. No other changes needed, the bar's `w-9` width reads fine centered.

### Favicon / app icon
- [x] Done 2026-08-17: replaced `src/app/icon.png` (bare "S") with code-generated `src/app/icon.tsx` + `src/app/apple-icon.tsx` (`next/og` `ImageResponse`, no image-gen cost) — an "SK" monogram in the same serif + gold-underline style as the header wordmark.

### Our Story page (`src/app/our-story/page.tsx`) — content + layout rewrite done 2026-08-17, real photography still pending
- [x] Opening line — now "Shaklek means your way in Arabic — your vision, your style, your shape, your skin."
- [x] Tenets rewritten, still five: **Materials that respect your skin** (now covers breathability + the hormone/skin-health angle), **Pieces customised by you, for you** (new — the "wished had longer sleeves / wish had pockets" framing), **Tailoring for your shape** (now folds in the no-overproduction point instead of a separate tenet), **Fixed prices** (rewritten per founder's line), **AI for good** (new). "An AI fashion assistant" tenet removed entirely — that's Shaklek+, not initial launch.
- [x] Layout — square corners (dropped `rounded-shaklek` off `ImagePlaceholder`), row spacing tightened (`gap-10 sm:gap-14` → `gap-8 sm:gap-10`).
- [ ] **Real photography still open** — every image on the page is still the dashed-border `ImagePlaceholder`, captions updated to describe what each shot should be but no actual photos exist yet. This is the one piece of the Our Story rewrite that wasn't a "quick fix" — needs real photography or cost-gated image generation.
