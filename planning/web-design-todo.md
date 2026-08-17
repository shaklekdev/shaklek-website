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

## Correction backlog — logged 2026-08-16, nothing below is started

Founder walked the live site and gave a batch of corrections in one sitting. Logged as-is with the exact current-state details found while triaging, so the next session can act without re-deriving. Two items have genuinely open decisions (marked below); the image regen items are cost-gated (Bedrock/Gemini calls) per the cost guardrail — state exact cost and get explicit go-ahead before running any of them.

### Catalog page (`/`, `src/app/page.tsx`)
- [ ] **Hero banner** — add a nature-inspired moving visual behind the "Your look, your way." headline. No video asset exists yet. Open decision: a still photo with an ambient CSS pan/zoom (cheap, fast) vs. a real video file (bigger scope, needs a sourced or generated asset). Not picked yet.
- [ ] **Slogan — open decision.** The site currently runs two different slogans in two places: `/` uses "Your look, your way." (`page.tsx`), `/our-story`'s hero already uses "You don't fit fashion. Fashion fits you." (`our-story/page.tsx:76-80`). Founder wants ONE slogan picked (either of these, or a better one) and the *same* hero banner used on both `/` and `/our-story`. Needs a marketing call — not made yet.
- [ ] Eyebrow copy: "STEP 1 · Start with an idea" → "Step 1 : choose an inspiration"
- [ ] Delivery timeline copy: change "7 days" → "10 days" everywhere it appears — `src/app/page.tsx:29` ("From AED 290 · Fixed prices · 7 days"), `src/app/how-it-works/page.tsx:23`, `src/app/order-confirmed/page.tsx:182`, `src/app/checkout/page.tsx:63`, `src/lib/orderEmail.ts:117`. Five occurrences, all need to move together.
- [ ] Add a WhatsApp contact option — nothing exists today (footer only has a `hello@shaklek.com` mailto). Needs a business WhatsApp number from the founder before building the link/button.

### Catalog photography corrections (cost-gated — Gemini image-gen, get go-ahead + state cost first)
- [ ] **Structured Blouse** — white and maroon front images are inconsistent with the ivory version: the waist band is missing/not visible on white and maroon. Regenerate or fix.
- [ ] **Pants items generally** — can crop from full-body generations instead of separate close-up generations, founder's call, cheaper if it works visually.
- [ ] **Cargo Trousers** — back-view pockets are inconsistent; remove the back pockets entirely to match the White Cargo Pants reference image (which has none).
- [ ] **Pleated Trousers** — use full-body images, not the current crop.

### Logo/wordmark symmetry (`src/components/Header.tsx:14`)
- [ ] The header logo wraps "Shaklek", the gold divider bar, and the Arabic wordmark "شكلك" in a flex column set to `items-start` — this left-aligns all three instead of centering them on a shared axis, so the bar and Arabic text read as off-center under the Latin wordmark. Fix is likely as simple as `items-start` → `items-center`, but re-check the bar's fixed `w-9` width still looks right once centered.

### Favicon / app icon (`src/app/icon.png`)
- [ ] Current icon is a lone black serif "S" over a gold underline — founder doesn't want a bare "S", wants something short but meaningful and tied to the real logo: full "Shaklek" wordmark, or an "SK" monogram, not an arbitrary shape. Needs a real design pass, not a quick swap.

### Our Story page (`src/app/our-story/page.tsx`) — full content + layout rewrite
Currently: placeholder tenets, all imagery is literally `ImagePlaceholder` (dashed border, no real photo), rounded corners (`rounded-shaklek`) on every image, alternating left/right row layout. Founder wants this to read as real marketing copy, not the current filler.
- [ ] Opening line — replace "Shaklek means 'your shape'" with the fuller framing: "Shaklek means your way in Arabic — it's your vision, your style, your shape, your skin."
- [ ] Tenets — rewrite the five, per founder's direction:
  - **Materials that respect your skin** — needs real depth, not just "nothing synthetic": explain breathability and why that matters for skin health, including the hormone/endocrine-disruptor angle for synthetic fabrics.
  - **Pieces customised by you, for you** (new tenet, doesn't exist today) — uniqueness + accessibility framing: "those lovely shirts you wished had longer sleeves, or those comfy pants you wish had pockets — now you can."
  - **Tailoring for your shape** (exists) — keep, but fold the "no over-production" message into this same section rather than as its own separate tenet (it's currently tenet #4, standalone).
  - **An AI fashion assistant** (existing tenet) — **delete entirely.** That's a Shaklek+ feature, not part of the initial launch, and shouldn't appear on the public story page yet.
  - **Fixed prices** (exists) — rewrite: "We committed to making sustainable and trendy fashion accessible to everyone. You customise your pieces, our price remains unchanged per piece type."
  - **AI for good** (new tenet, doesn't exist today) — "we wanted to merge AI to fashion for the good of earth and skin." Vague as given — needs real marketing copy written around it, not just the raw line.
- [ ] Real photography — every image on the page is currently a placeholder; needs actual meaningful pictures once photography/generation is ready.
- [ ] Layout — square corners instead of the current rounded ones (reference: Zara's product/story pages), and address the "images feel too separate" note — likely means tightening the grid/spacing rather than the current loosely-alternating rows.
