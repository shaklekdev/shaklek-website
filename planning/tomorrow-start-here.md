> ⛔ **FULLY SUPERSEDED — 2026-08-25. Do not work from this file.** Every item
> in its queue has shipped: the whole five-item cart batch, and the spec sheet
> it asks about is now a real tech pack, live. The one thing still open from it
> is the founder's own line: a real order on a real phone. The live list is the
> "Pick up here" table in `session-log.md`. Kept only as a record of what
> 2026-08-22 looked like.
>
> ⚠️ **Written 2026-08-22 evening. Superseded for anything after that date —
> read `session-log.md` first.** This file predates the 2026-08-23 external
> security audit and the 13 fixes that followed it, the mobile nav, the size
> chart, measurement validation, and the Neon dev-branch split. It also
> predates a second Claude session working this repo concurrently.
>
> Two items below are now claimed by that session and must not be
> double-assigned: **"Edit from the cart"** and **"Quantity"** are built and
> uncommitted — see `session-log.md`.

---

# Start here — 2026-08-22, evening session

## Where things stand: Shaklek takes real money

Live on real Stripe keys and a real Clerk production instance since this
afternoon. **One real payment ran end to end and was verified**: AED 390 on a
live card → webhook fired → order marked `paid` in Neon → visible on
`/dashboard/orders` with the tailor handoff ready.

`www.shaklek.com` · Amplify `dqcptedylrif0` (eu-west-1) · deploys on push to `main`.

---

## Do these first — founder's, not Claude's

- [x] ~~**Refund the AED 390 test order.**~~ **DONE.** Verified against the
      Stripe API on 2026-08-26, not recalled: charge
      `ch_3U7GbOFG6ccJjMKM0i0cgAZD`, AED 390.00, `refunded: true`,
      `amount_refunded` equals the full amount.
- [x] ~~**Confirm Apple Pay on a phone.**~~ **DONE — confirmed by the founder,
      and the charges prove it.** All three live charges carry
      `payment_method_details.card.wallet.apple_pay`. It is not a claim any
      more, it is in the payment records.

- [ ] ⚠️ **Two live charges of AED 3.89 are still unrefunded** —
      `ch_3U7iQkFG6ccJjMKM1ARqYmrs` and `ch_3U8GfHFG6ccJjMKM0fbRXZnf`, both on
      the founder's own card, both `refunded: false`. These are the TEST99
      runs: 99% off a 389 shirt. Small money, but they are real charges on a
      live account and they sit in the books until refunded.
- [ ] **Download the new spec sheet and say what the tailor still needs.** The
      structure is rebuilt; only the tailor knows what is missing from it.

## The queue — the cart batch

All five are one workflow. Ship together, not as five deploys.

1. [ ] **Continue shopping.** Adding to cart dead-ends on `/cart`. No way back to
       add a second piece — e.g. the same trouser in another colour.
2. [ ] **Edit from the cart.** No route from a cart line back to its design page.
       Should return to `/design/<slug>?color=<colour>`.
3. [ ] **Real thumbnail in the cart.** Currently a blank square. The cart line
       already stores slug, colour and change labels, and `comboKeyFromLabels()`
       already resolves those to the exact photo.
4. [ ] **Quantity.** No way to order two of the same shirt. Touches CartContext,
       the cart UI, the order payload and the Stripe line items — biggest of the
       five.
5. [ ] **Checkout email.** Customers do not realise the email field must be
       filled before payment is possible.

## Shipped today

**Going live** — Stripe test → live keys, live webhook endpoint created and
verified (`checkout.session.completed` + `.expired`); Clerk development →
production instance on `clerk.shaklek.com` with DNS and SSL; Stripe Link
disabled so Apple Pay is the direct path.

**Commerce correctness** — delivery address and phone now collected by Stripe
Checkout and persisted (migration `0004`, applied); customer email removed from
the tailor's spec sheet; `SHK-XXXXXXXX` reference shared by the spec sheet,
the WhatsApp handoff and a new dashboard column; spec sheet rebuilt as a proper
tech pack; dashboard shows the delivery address inline or warns when missing;
spec sheet now resolves the *ordered* combination photo — it was sending the
wrong silhouette on 96 of 128 possible orders.

**Storefront** — new price ladder (390/420/450/620); hero photo per item is now
its best combination, with `defaultChanges` matched so the design page opens on
the same look; clickable colour swatches deep-linking to `?color=`; sliders
replaced with native radio buttons; sticky preview; free-text request field with
per-category examples; square corners; justified prose; revised founder's note;
"Free bucket size" and the AI mention removed.

**Plumbing** — sitemap, robots, per-page metadata and OG images; header blur
removed (scroll jank); hero image weight cut; `npm run verify` catalog integrity
check; `eager` loading for above-the-fold cards; WCAG tap-target fixes.

## Known and unresolved

- [ ] **Apple Pay still opens on Stripe's page, not ours.** Turning Link off
      removed the extra screen, but checkout still redirects to
      `checkout.stripe.com`. A true in-page Apple Pay sheet means switching to
      **embedded checkout** — a few hours, and it touches the one flow currently
      proven to work with real money. Do it on its own, after the cart batch,
      with a real test payment to prove it.
- [ ] **Customizer arrow keys unverified.** The options are native radios now,
      which should give arrow-key navigation for free, but two attempts to
      deliver real key events failed (zero keydown events captured). Needs the
      other session's CDP harness. Not a blocker — tap, click, Tab and Space all
      work.
- [x] ~~**Clerk loads on every route**~~ — **DONE 2026-08-26, deployed.**
      `ClerkProvider` moved out of the root layout into per-route
      `AuthProvider` (`609bd1c`). Measured on production: home page **705 KB →
      377 KB**, DOMContentLoaded 2373 ms → 1734 ms, and zero occurrences of
      "clerk" in the served HTML. Clerk still mounts on `/account`,
      `/checkout`, `/dashboard`, `/order-confirmed`, `/design/[slug]`,
      `/size-guide` and sign-in/up. ⚠️ **The obvious fix does not work** —
      `next/dynamic` on Header's `UserButton` changed nothing, because Clerk's
      UI bundle is fetched at runtime from `clerk.shaklek.com` and is not in
      our bundle at all. Sign-out moved to `/account`; it only existed inside
      the removed avatar menu.
- [ ] **Founder's note claims 288 shirt / 576 trouser combinations.** What ships
      is 32 per garment (192 with sizes); the rest count locked Shaklek+
      sliders. Founder's copy, founder's call — but it is checkable.
- [ ] **`/upload` is built but unlinked** from the nav. Link it or leave it.
      ⚠️ Two things found 2026-08-26: it is **in `sitemap.ts` at priority 0.8**,
      so search engines can send people to a page nothing links to; and the
      reference photo it collects is **never persisted** — `order_items` stores
      only `hasReferenceImage: boolean`, and the stylist email is built from DB
      rows in the Stripe webhook, so on a paid order the tailor receives a
      checkbox instead of the customer's picture. Cheapest resolution while it
      is not a funnel being run: remove it from the sitemap.
- [ ] **Welcome-offer capture flow not built** — `subscribers` table, unique
      promotion codes, Resend email, `allow_promotion_codes` on the session.
      This is what makes ads work: at Shaklek's order volume a purchase-optimised
      campaign never leaves the learning phase, so ads should optimise for email
      signups instead.
- [ ] Wide-leg photo defects and three headless trouser crops —
      `catalog-images-todo.md`. Costs money; nothing is broken.

## Decided today — do not relitigate

- **Prices**: Shirt 390 · Skirt 420 · Pants 450 · Dress 620. Reasoning in
  `pricing-todo.md`. No blazers, simple dresses only.
- **Welcome offer is 20%, not 25%** — at a 390 shirt, 25% goes underwater at the
  pessimistic end of the CAC range.
- **Never cap ordering.** No stock counts, no waitlist, no "sold out". If demand
  outruns the bench, add a tailor. Thresholds in `tailor-capacity.md`.
- **Keep WhatsApp** alongside email. In the UAE it is the customer service
  channel and a trust signal for a brand with no history.
- **The tailor never sees customer identity.** Spec sheets carry the garment and
  `SHK-XXXXXXXX`, nothing else.
- **Link stays off** until there is a real repeat-customer base.
- **Homepage headline stays "Your look, your way."** A sharper alternative was
  written and rejected: it broke with the story page, the site title, and the
  meaning of the word Shaklek.

## Traps

- **Two sessions share one working tree.** `git diff <file>` before `git add
  <file>` — an uncommitted change of the other session's was swept into an
  unrelated commit this way. Pin dev-server ports and confirm they bound.
- **CloudFront caches the HTML *and* the stylesheet reference inside it.** A
  change can be live and still invisible in a browser holding the old page —
  this cost time twice today. Verify by fetching the CSS that a *fresh* HTML
  response points at, never the one a cached page names.
- **Never `git add -A`** from the repo root — passport, Emirates ID and visa sit
  there untracked.
- A **failed Amplify build is silent**; the site keeps serving the old version.
- **macOS/iCloud creates "file 2.ext" duplicates.** Two appeared inside
  `.next/types` and broke a typecheck with phantom duplicate-identifier errors.
  Generated files only, never committed — delete and re-run.
