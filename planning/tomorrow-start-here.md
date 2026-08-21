# Start here — 2026-08-23

One page. Read this, then go. Detail lives in the linked docs.

## What happened yesterday (2026-08-22)

Customizer photography finished for **all eight catalog items**. 64 trouser
combination photos shipped, plus twelve base photos corrected. Live on
`www.shaklek.com` (commit `f4f1864`, Amplify job 109, verified serving).

The generation method is written down as **`CLAUDE.md` §4b** and it works —
cargo took about an hour, banded and pleated followed the same path. Use it for
any new pants, shirts or dresses. Do not re-derive it.

Spend: ~$11.40 on image generation. Check https://aistudio.google.com/usage.

---

## Today, in order

### 1. Go live on real money (~1 hour, no code)

Two credential swaps in the Amplify console env vars, then a redeploy:

- [ ] **Stripe:** test keys → live keys. Merchant account already verified
      (`acct_1U4N2wFG6ccJjMKM`), charges and payouts enabled, Wio attached.
- [ ] **Clerk:** create a **production instance**, then swap
      `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Dev keys have a
      hard monthly active-user cap — when it trips, sign-in breaks for everyone
      at once. This is a live hazard, not cosmetic.
- [ ] **Prove it:** one real card payment end to end, confirm the order lands in
      Neon and the email arrives, then refund it via Stripe.

Detail: `payment-auth-todo.md`.

### 2. Marketing content (the weekend goal)

There are **no followers and no organic customers yet**, and no acquisition plan
in any doc. This is the real gap now that the shop is finished.

- [ ] Marketing strategy for a UAE made-to-order linen label
- [ ] Ad content for **Snapchat, Instagram, Facebook**
- [ ] The finished customizer is the hook — "see your exact combination before
      it's made" is now a true claim, and it wasn't before yesterday

Goal: MVP test with real traffic next week.

### 3. Tailor

Founder met the tailor 2026-08-22 to walk through the designs. Whatever came out
of that — fabric, turnaround, unit cost, who cuts — **write it down**, because
the fulfilment loop is still undocumented anywhere in this repo and it decides
whether the unit economics work.

---

## If there is time left: wide-leg cleanup

~8 generations, ~$0.60. Black heels in the `wide:full` column, a frame mismatch,
and burgundy's base photo being from a different shoot. Full list in
`catalog-images-todo.md` §1. Not urgent — the item is complete and shipping.

---

## Things that will bite you

- **The site is `www.shaklek.com`.** The apex `shaklek.com` 404s.
- **Never `git add -A` from the repo root** — passport, Emirates ID, visa and
  bank letters are sitting there untracked. Stage explicit paths.
- **Overwriting an image doesn't change what visitors see** — CloudFront caches
  the optimizer response for 4 hours and Amplify offers no invalidation. Change
  the filename (`-v2`, `-v3`) when content changes.
- **Never delete a generated image.** Archive to `catalog-archive/<date>-session/`
  before the session ends; the scratchpad is wiped on exit.
- **A failed Amplify build is silent** — the site just keeps serving the old
  version. Check the job status before blaming caching.
