# Homepage propositions, built from the 26 principles (2026-08-30)

Three options for the hero and its supporting line, each tagged with the
principles it applies. **Nothing here ships without the founder.** The current
hero line is her own ("Customisable pieces for you, by you, always at the same
price."), it has been restored twice after rewrites, and replacing it is her
call, not a copy improvement. These exist because principles #2, #9, #18 and
#19 all point the same way: the current hero says what the product IS, and the
strongest lines this brand owns say what it DOES for the person reading.

Every claim below is true of the shipped product: 100% linen, made to order in
the UAE, XS to XXL or your own measurements at the same price, from AED 389
(`catalog.ts` BASE_PRICE_BY_CATEGORY, verified 2026-08-30), about 10 working
days, one free alteration or remake within 14 days.

House rules applied throughout: no em dashes, no urgency, no discounts, no
invented proof, no "AI".

---

## Option A: her own thesis, promoted

> **Clothes that adapt to you, not the other way around.**
>
> Made to order in the UAE in 100% linen. Your measurements or a standard
> size, always the same price. From AED 389.

- **Why:** this is a near-verbatim lift of the founder's own line on
  /our-story ("what if clothes adapted to us instead of us adapting to
  clothes?"). It is already the thesis of the whole site; today it sits behind
  a click at the bottom of the story page.
- **Principles:** #2 transformation, #18 customer as hero, #24 story creates
  connection, #23 nothing claimed that is not true.
- **Risk:** none identified. It keeps "same price", which she has protected in
  every rewrite.

## Option B: the claim no rack can copy

> **Cut for your body, not a size chart.**
>
> Every piece is made after you order it, in 100% linen, by a tailor in the
> UAE. Standard sizes or your own measurements, same price. From AED 389.

- **Why:** it is the brand's positioning sentence said plainly, and it names
  the customer's real pain (nothing off a rack fits everyone) without a single
  product noun in the headline.
- **Principles:** #4 solve pain first, #2, #9 results, #15 specific.
- **Risk:** second person body reference is fine on our own site, but do not
  reuse this exact line in Meta paid creative; use the third-person variant
  from social-playbook.md ("A size chart is an average of everyone").

## Option C: lead with the demo, because the demo is the product

> **Change the sleeve. Watch the piece change.**
>
> Every option shows you the actual combination before you order. Then one
> tailor cuts that exact piece to your size or your measurements. From AED 389.

- **Why:** #19 says create curiosity early, and the customizer is the one
  genuinely surprising thing a first-time visitor can do here. The hero
  currently spends its one line describing; this one invites.
- **Principles:** #19 curiosity, #26 visuals convert, #20 amplify the product.
- **Care taken:** "shows you the actual combination" claims what the images
  show, not how they were made. Never write "photograph" of the catalog
  imagery; that claim was removed from /how-it-works on 2026-08-25 for being
  false and must not come back in a hero.
- **Best paired with** a hero visual of the garment changing shape (the
  four-cell trouser sequence), which is also the top asset in the social
  playbook. A static banner under this line wastes the line.

---

## The supporting band, whichever hero she picks

The value stack exists on the site but is scattered (price on one tile,
delivery in the FAQ, the fit promise at checkout). #25 says combine the risk
reducers; the honest version for this brand, with no urgency and no offers:

> One price per piece, from AED 389. Fabric, every option and UAE delivery
> included. Your measurements cost nothing extra. If the fit is not right,
> one free alteration or remake within 14 days.

Four sentences, all currently true, all already published somewhere on the
site, never yet in one place a first-time visitor reads. Sources:
`homeContent.ts` BENEFITS, `faq/page.tsx` price and delivery answers,
`productDisclosure.ts` returns row.

**Note before shipping:** a facts strip under the hero was removed by the
founder on sight on 2026-08-25 (`Hero.tsx` comment). So this band belongs
lower on the page, near the catalog rail or above the FAQ, not back under the
hero.
