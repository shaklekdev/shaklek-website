# Web Design — TODO

Status: a real, consistent design system exists and is in production use (Georgia serif display type, cream/gold palette, ported directly from the original brand prototype). What's missing is mostly *content* — real imagery — and the polish layer.

## Done
- [x] Color and type system ported into Tailwind theme tokens (`globals.css`)
- [x] Consistent header/footer across all pages
- [x] Catalog cards, form styling, button/badge system

## To do

### Imagery — the biggest gap
- [ ] Every catalog item is currently a CSS gradient block, not a real photo or illustration. This needs a real decision: commission flat-sketch illustrations now (cheap, fast, matches the "technical spec" feel), or wait for the pilot to produce real photography (more authentic, slower). A sample illustrated catalog has been produced separately for tailor/AI reference — see the shared artifact — which could double as a starting point for real site imagery.
- [ ] Favicon and app icons — currently using Next.js defaults
- [ ] Open Graph / social share images per page

### States nothing has been designed for yet
- [ ] Empty states (e.g. no search results, if search gets added)
- [ ] Error states beyond the one basic message on `/upload`
- [ ] Loading skeletons for async actions (checkout submission, upload)
- [ ] 404 page — currently the Next.js default, not brand-styled

### Not designed at all
- [ ] Account pages (login, order history, "my wardrobe")
- [ ] Shaklek+ subscription — pricing page, avatar try-on UI
- [ ] Admin/tailor-facing tools (swipe interface, order dashboard) — these need their own, more utilitarian design language, not the consumer brand system

### Polish
- [ ] Micro-interactions — hover/tap states exist but are minimal; nothing has real motion design
- [ ] Dark mode — not implemented, not yet decided if it should be
- [ ] A real accessibility/contrast audit, not just "looks fine"
