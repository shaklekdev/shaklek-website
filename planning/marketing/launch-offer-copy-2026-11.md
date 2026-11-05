# Launch offer copy: waitlist page and Meta Leads campaign, 3–10 Nov 2026

Written 2026-11-03 by the marketing agent. Every factual claim below is tied to
a source in the repo or a founder line in `planning/OPEN.md`. Nothing here has
been edited into the site; this is copy for the founder to approve.

## Sources checked

- Prices: `website/src/data/catalog.ts` lines 130-133 (Oversized Shirt 449),
  172-175 (Wide-leg Trousers 519), 481-484 (Open Abaya 949), 622-636 (Slip
  Dress 699). Lowest catalogue price is 449, so "From AED 549" is true.
- Abaya includes a matching shayla: `catalog.ts` lines 753-762 (`SHAYLA`,
  `includedWith("Abaya")`).
- Fabric: `website/src/data/fabrics.ts` line 62-63, `100% natural linen`,
  `available: true`; cotton `available: false` (line 84). The BAG is a linen
  blend (`planning/OPEN.md` line 86, supplier via founder 2026-11-03), so the
  copy never says "linen bag", only "the Shaklek bag".
- Offer: `planning/OPEN.md` line 86, `launch-gift-initials`, confirmed by the
  founder 2026-11-03. First 50 orders, small gold embroidery under the logo.
  Collection mechanism undecided, so no line below says how initials are given.
- No discount exists: `planning/OPEN.md` line 38 (`det-permit`) and
  `planning/marketing/26-principles.md` #25. No price in this copy is shown as
  reduced and no code is mentioned.
- Measurements: `planning/frontend-todo.md` lines 30-40 (the tailor's list,
  7 for trousers + 10 for a shirt = 17). Founder chose the wording "up to
  seventeen" on 2026-11-01 (`planning/session-log.md` line 4924).
- "Made in the UAE", "made after you order it": already live on
  `website/src/app/coming-soon/page.tsx` (lines 14, 18, 142-148).
- Button voice: `website/src/components/WaitlistForm.tsx` lines 84-100. The
  button is the customer speaking, so it is "when YOU open", never "we".

## 1. Waitlist page section (under the hero, above the email form)

Eyebrow (3 words): **Opening 11 November**

Headline (8 words): **The first 50 orders leave with your initials.**

Line (17 words): **Small gold embroidery under the logo, on the Shaklek bag
your order comes in. From 11 November.**

Button: keep **Notify me when you open**. It is already in the customer's
voice and the founder has corrected this label once (WaitlistForm.tsx line 95).
If she wants it shorter: **Tell me when you open**. Not "Notify me".

Alternative headline if "your initials" reads as a promise of a mechanism:
**Fifty bags, fifty sets of initials.** (6 words)

## 2. Product strip

Lead-in (7 words): **From the opening collection. Every option included.**

Price format: show each piece's own price, "AED 549", not "From AED 549" per
piece. Every piece has one price with every option included (the founder's
positioning, `catalog.ts` lines 571-576), so "From" on a single piece would
imply options cost extra. Use "From AED 549" only for the collection as a
whole, as the ads do.

| Piece | Price | Source |
|---|---|---|
| Oversized Shirt | AED 549 | catalog.ts:130-133 |
| Wide-leg Trousers | AED 619 | catalog.ts:172-175 |
| Slip Dress | AED 849 | catalog.ts:622-636 |
| Open Abaya, with matching shayla | AED 999 | catalog.ts:481-484, 753-762 |

If three: drop the Slip Dress. Note the founder asked for "pants" in social
copy (session-log 2026-11-01); the catalogue name is "Wide-leg Trousers" and a
strip that links to the product page should carry the catalogue name.

## 3. Meta Leads campaign, five ad variants (CTA: Sign up)

Limits checked by script: primary ≤125, headline ≤40, description ≤25. No em
dashes, no "AI", no "free", no "gift", no "linen bag", no "your body" or "your
skin". Initials offer in a, d, e. Price in b and c.

**(a) Bag with initials, `brand-assets/bag-initials/bag-initials-ad-NT.jpg`**
- Primary: Every order comes in the Shaklek bag. The first 50 are embroidered with your initials. 100% linen, made in the UAE.
- Headline (33): First 50 orders: your initials
- Description (19): Opening 11 November

**(b) Label carousel**
- Primary (122): Most of us are wearing plastic in 40 degrees. Linen is a plant: it lets the heat go. Cut after you order it, from AED 549.
- Headline (27): 100% linen, made in the UAE
- Description (12): From AED 549

**(c) "Up to 17 measurements" slide**
- Primary (108): Up to seventeen measurements, not one size. Linen, cut after you order it and made in the UAE. From AED 549.
- Headline (28): Up to seventeen measurements
- Description (19): Opening 11 November

**(d) Clothes collage, "Nothing here exists yet"**
- Primary (125): Nothing here exists yet. Each piece is cut after it is ordered, in 100% linen, in the UAE. First 50 orders: your initials.
- Headline (23): Made after you order it
- Description (19): Opening 11 November

**(e) Teaser video**
- Primary: Shaklek opens 11 November. 100% linen, cut after you order it, in the UAE. The first 50 orders carry your initials.
- Headline (19): Opening 11 November
- Description (20): Know the day we open

## Flags before any of this ships

1. **"Gift" and DET.** The copy avoids "gift", "free" and "offer" entirely and
   describes personalisation. Whether a first-50 personalisation counts as an
   advertised promotion under the DET permit rule (`OPEN.md` line 38 covers
   discounts only) is a question for her adviser, not something copy settles.
   Do not reintroduce "free" or "gift" until that answer is in `OPEN.md`.
2. **"Opening 11 November" is a founder decision, not a code fact.**
   `STORE_OPEN` is still off and opening is the manual four-step at
   `planning/launch-checklist.md` step 0. Every variant names the day, so if
   the day slips the ads and the page section must change the same hour.
3. **"The Shaklek bag your order comes in."** `branding/packaging.md` line 61
   says the kraft paper bag is hand-over only. Confirm the linen-blend bag goes
   inside every courier parcel before the page line ships; if not, cut
   "your order comes in" and keep "on the Shaklek bag".
4. **Carousel (b) working title "Not to alarm you, but check the label".** The
   founder killed "go and check the label" on 2026-11-01 (`session-log.md`
   line 102, `reference-brands.md` lines 171-176): no instructing a stranger.
   The ad text above stands next to her ("most of us are"); the slide copy
   itself should pass the same test before it goes in the ad set.
5. **"Up to seventeen measurements."** Seventeen is trousers plus shirt on the
   tailor's list; one garment is 7 or 10. "Up to" is why the line survives.
   The site collects four (`frontend-todo.md` line 32); the rest are the
   tailor's, so never write "we take seventeen measurements online".
6. **Coming-soon page still says "Early October" in three blog answers**
   (`coming-soon/page.tsx` line 174 comment). Out of scope here; worth a look
   before 11 Nov.
7. **No delivery promise anywhere above.** The page says "About ten days" and
   the terms say "approximately 10 working days" (`legal/terms`). Those two
   do not agree, so the ads name neither.
