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
