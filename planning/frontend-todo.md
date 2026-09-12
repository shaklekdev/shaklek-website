# Frontend — TODO

Status: core purchase flow is built and interaction-tested (Next.js 16, TypeScript, Tailwind, at `~/dev/Shaklek/website`).

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

## ⚠️ THE MEASUREMENTS COLLECTED DO NOT MATCH THE GARMENTS SOLD

**Founder, 2026-09-08, and she is right.** `src/lib/measurements.ts` defines four
fields: **bust, waist, hip, height**. Both entry points use them -- `SizePicker`
tailored mode per order item, and `/account` per customer.

**The defect: the customizer sells length options that these four cannot
execute.** `PANTS_PARAMS` offers cropped/full; shirts offer normal/longer.
Cropped *against what?* There is no leg measurement, so the tailor derives leg
length from total height using a population ratio -- which is the average-body
assumption this brand exists to reject, reintroduced in the one place it must
not be. Two people at 165cm have very different leg-to-torso proportions.

### ✅ THE TAILOR'S ACTUAL LIST (Danish, Taylor Moon Shine, 2026-08-30)

Not designed here. This is what the person cutting the garment asked for.
**Seventeen measurements. The site collects four, and one of those four is not
on either list.**

| # | TROUSERS (7) | Site has it? |   | # | SHIRT (10) | Site has it? |
|---|---|---|---|---|---|---|
| 1 | Length | ✗ | | 1 | Shirt length | ✗ |
| 2 | Waist | ✅ | | 2 | Shoulder | ✗ |
| 3 | Hips | ✅ | | 3 | Chest | ✅ (bust) |
| 4 | Crotch (rise) | ✗ | | 4 | Stomach | ✅ (waist) |
| 5 | Thigh | ✗ | | 5 | Hips | ✅ |
| 6 | Knee ⏳ | ✗ | | 6 | Hand length (sleeve) | ✗ |
| 7 | Bottom (hem opening) | ✗ | | 7 | Biceps | ✗ |
| | | | | 8 | Elbow | ✗ |
| | | | | 9 | Cuff | ✗ |
| | | | | 10 | Neck | ✗ |

**3 of 7 for trousers. 3 of 10 for shirts.**

⚠️ **HEIGHT IS ON NEITHER LIST.** The tailor never asked for it. The site's
fourth field is one nobody cutting a garment uses.

✅ **ALL THREE AMBIGUITIES RESOLVED 2026-09-10** by the tailor's own labelled
diagrams (two hand drawings, one per garment, WhatsApp 2026-08-30):

- **"Need" is KNEE** — drawn as a line across the leg at knee height.
- **Trouser "Length" is the OUTSEAM** — the arrow runs from the waist down the
  *outside* of the leg to the hem. Not the inseam.
- **"Hand length" is SHOULDER TO WRIST** along the arm, not wrist-to-fingertip.

A printable sheet using **his exact labels and his order** is at
`planning/measurement-sheet.html`, so nothing is translated between what the
founder writes down and what he cuts to. It also carries the **band/tie position**
field he asks for, measured **from the top downwards**.

### Seventeen is too many to ask online -- but not all seventeen are body facts

Three different kinds of number are mixed together in that list:

- **Body, and only the customer has it:** waist, hips, chest, stomach, shoulder,
  neck, thigh, crotch, shirt length, sleeve length, trouser length.
- **STYLE, and the customizer already decides it:** **Bottom** is the leg opening
  -- that is the straight/wide slider, not a fact about a leg. Knee is largely
  the same. **Do not ask the customer for these; derive them from the chosen
  combination.**
- **Derivable within a loose fit's tolerance:** biceps, elbow, cuff, from chest
  plus an ease allowance -- or taken properly at a fitting.

**That is the design.** The form asks only for the first group, the customizer
supplies the second, and the third is derived or measured in person.

### The shape of the fix -- fields should follow the GARMENT, not the customer

Nobody should be asked for an inseam to buy a shirt. Roughly:

- **Shirt:** bust, waist, shoulder, sleeve, length
- **Trousers:** waist, hip, inseam, thigh

⚠️ **BUT MORE FIELDS MEANS MORE ABANDONMENT**, and shoulder width is genuinely
hard to measure on yourself. That tension is real and it is the argument for the
in-person fitting (`planning/marketing/todo.md` §2): **the website form stays
short, the fitting captures the full set** and puts the extras in the notes
field. The fitting does not just reduce errors, it produces a better-fitting
garment than the form can.

### ⏳ ASK THE TAILOR FIRST. Do not design this list from first principles.

The tailor has to cut from these numbers, so the tailor's list is the correct
one -- exactly like the metres-per-garment question in `planning/pricing-todo.md`,
which is still a placeholder for the same reason. **Ask what they need per
pattern, and agree the convention for each** (a "waist" at the narrowest point
and a "waist" where trousers sit are 3-5cm apart; measuring one while the tailor
cuts to the other makes every garment wrong and looks like a fit problem).

### ⚠️ When it is built

- `customers` carries four `measurement_*` columns and `order_items.measurements`
  is a composed string (`composeMeasurements`). New fields are a **schema
  change**, so read CLAUDE.md's Trap 3: Amplify never runs a migration, additive
  nullable columns only, **migrate production BEFORE deploying the code**, use
  `node scripts/db-migrate.mjs --target=prod`, and verify against
  `information_schema` rather than the exit code.
- This is the cheapest moment it will ever be. Nobody has ordered, so no stored
  measurement has to be migrated or re-asked.

## ⏳ ARABIC BLOG — planned, not built (founder: "we'll do it later, I will check")

Three English articles are live in `src/data/blog.ts` at `/blog`. **No Arabic
version exists**: no `/ar` route, no hreflang.

**ADAPT, DO NOT TRANSLATE.** Arabic searchers in the Gulf type تفصيل, خياطة and
قماش كتان, not translations of English phrases. A literal translation ranks for
things nobody searches. Google will not penalise it (translated pages are not
duplicate content with hreflang set), it simply earns little.

- *Natural fabrics and your body* — adapts well, the argument travels.
- *Nobody is a medium* — adapts well, made-to-measure is a strong Arabic space.
- *Dubai summer / fabric* — **rewrite around Arabic search terms**, do not
  translate. It lives or dies on vocabulary.
- Ideally one written natively for Arabic search, with no English equivalent.
  That is where the empty space actually is.

**Build:** `/ar/blog` routing plus hreflang. The RTL plumbing already works —
`ProductDisclosure` handles `dir="rtl"` and `lang="ar"` correctly, including the
mixed-digit trap. Roughly two hours.

⚠️ **THE FOUNDER MUST READ EVERY ARABIC LINE BEFORE IT PUBLISHES.** This is her
own standing rule from `productDisclosure.ts`, written after a feminine verb
survived review. Nobody on this side can check Arabic grammar or typesetting the
way a measurement can be checked.

⚠️ Not a compliance fix. `ProductDisclosure` already carries the Cabinet
Resolution 66/2023 Art. 40 disclosure in Arabic on every product page. This is
growth, not law.

## Open decisions
- [x] ~~**Multi-item cart or one-design-at-a-time checkout?**~~ ✅ **RESOLVED — IT IS MULTI-ITEM AND ALWAYS HAS BEEN.** Corrected 2026-09-12. `src/app/cart/page.tsx` holds many lines with per-line quantities, and `/api/orders` takes an `items[]` array up to `MAX_ITEMS = 20`, writing one `order_items` row per line. ⚠️ This entry read "currently built single-item" for weeks and was taken at face value in a pricing session, which nearly sank the 850 fitting threshold as "unreachable". Check the code, not this file.

## To build
- [ ] ⭐ **"Complete the look" on every product page — the highest-value UI change on the money side.** Founder, 2026-09-12. Under each item, show the rest of the outfit so the customer can add it in the same order:
  - **Trousers** → the matching shirt, and an abaya worn open on top
  - **Shirt** → the matching trousers, and an abaya worn open on top
  - **Abaya** → a matching dress, or a matching shirt + trousers set

  **Why this and not a generic "you may also like".** A second garment in the same order earns ~71% margin, because packaging (37.74) and shipping (21) are already paid, and it shares one cost of acquisition. It is also what makes the **550 fitting threshold** reachable: a shirt at 449 does not qualify, a shirt plus anything does. Run `node planning/margins.mjs` for the current figures.

  **The picture does the selling, not the widget.** A rail of separate cut-out product photos is a related-products list and reads as one. What sells the set is ONE photograph of the whole look on one model — which is why the photography note below is the real dependency, not the component.

  **Data shape.** Needs a way to say "these go together" in `catalog.ts`. Two options, decide before building: a `pairsWith: string[]` of slugs per item (simple, but every pair has to be listed twice and stays in sync by hand), or a `looks` table — a named set of slugs plus the one photograph of them worn together (a look is authored once and every item in it links back to the same image). **The looks table is the better fit** precisely because the selling unit is the photograph, not the pair.

  ✅ **Dye lot is not a concern and should not be re-raised.** Founder, 2026-09-12: there is ONE lot. The 124m ordered from Shirley is a single roll per colour (White 22m, Ivory 43m, Navy 32m, Burgundy 27m), so every garment cut this season matches by construction and "matching" is safe to use in copy. This only becomes a question on a REORDER, which must quote the mill's shade codes — #3 White, #4 Ivory, #440 Navy, #29 Burgundy.

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
