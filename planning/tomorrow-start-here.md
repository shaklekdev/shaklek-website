# Start here — evening session, 2026-08-22

## Where things stand: Shaklek takes real money

Live on real Stripe keys and a real Clerk production instance since this
afternoon. **One real payment ran end to end and was verified**: AED 390 on a
live card → webhook fired → order marked `paid` in Neon → visible on
`/dashboard/orders` with the tailor handoff ready.

`www.shaklek.com` · Amplify `dqcptedylrif0` (eu-west-1) · deploys on push to `main`.

---

## Do these first — they are the founder's, not Claude's

- [ ] **Refund the AED 390 test order.** It is a real charge on a real card.
- [ ] **Turn Stripe Link off** — Settings → Payment methods, **live mode**. Link
      is what forced the extra page before Apple Pay. Apple Pay itself now works.
- [ ] **Download the new spec sheet and say what the tailor still needs.** The
      structure is rebuilt; only the tailor knows what is missing from it.

## The queue for tonight — the cart batch

All five are one workflow and should ship together, not as five deploys.

1. [ ] **Continue shopping.** Adding to cart dead-ends on `/cart`. No way to go
       back and add a second piece — e.g. the same trouser in another colour.
2. [ ] **Edit from the cart.** No route from a cart line back to its design page
       to change anything. Should return to `/design/<slug>?color=<colour>`.
3. [ ] **Real thumbnail in the cart.** Currently a blank square. The cart line
       already stores slug, colour and the change labels, and
       `comboKeyFromLabels()` already resolves those to the exact photo.
4. [ ] **Quantity.** No way to order two of the same shirt. Touches CartContext,
       the cart UI, the order payload and the Stripe line items — the biggest of
       the five.
5. [ ] **Checkout email.** Customers do not realise the email field must be
       filled before payment is possible.

## Known and unresolved

- [ ] **The customizer's arrow keys are unverified.** The option buttons are now
      native radios, which should give arrow-key navigation for free, but two
      attempts to deliver real key events failed (zero keydown events captured).
      Needs the other session's CDP harness. Not a blocker — tap, click, Tab and
      Space all work.
- [ ] **Clerk still loads on every route** — 188.7kb raw / 54.7kb gzipped, 24% of
      homepage JS, all from `ClerkProvider` in the root layout. Plan written in
      `clerk-migration-plan.md`. **Do not start it** until production sign-in has
      been exercised for a while; never change the auth layer in the same window
      as auth credentials.
- [ ] **Founder's note claims 288 shirt / 576 trouser combinations.** What ships
      is 32 per garment (192 with sizes); the larger numbers count locked
      Shaklek+ sliders. Founder's copy, founder's call — but it is checkable.
- [ ] **`/upload` is built but unlinked** from the nav. Link it or leave it.
- [ ] Wide-leg photo defects and three headless trouser crops —
      `catalog-images-todo.md`. Costs money to fix, nothing is broken.

## Decided today, do not relitigate

- **Prices**: Shirt 390 · Skirt 420 · Pants 450 · Dress 620. Model and reasoning
  in `pricing-todo.md`. No blazers, simple dresses only.
- **Welcome offer is 20%, not 25%** — at a 390 shirt, 25% goes underwater at the
  pessimistic end of the CAC range.
- **Never cap ordering.** No stock counts, no waitlist, no "sold out". If demand
  outruns the bench, add a tailor. Thresholds in `tailor-capacity.md`.
- **Keep WhatsApp** alongside email. In the UAE it is the customer service
  channel and a trust signal for a brand with no history.
- **The tailor never sees customer identity.** Spec sheets carry the garment and
  `SHK-XXXXXXXX`, nothing else.

## Traps

- **Two sessions share one working tree.** `git diff <file>` before `git add
  <file>` — an uncommitted change of the other session's was swept into an
  unrelated commit this way. Pin dev-server ports and confirm they bound.
- **CloudFront caches HTML and the CSS reference in it.** A change can be live
  and still invisible in a browser that is holding the old page. Verify by
  fetching the CSS the *fresh* HTML points at, not the one a cached page names.
- **Never `git add -A`** from the repo root — passport, Emirates ID and visa sit
  there untracked.
- A **failed Amplify build is silent**; the site keeps serving the old version.
