# Launch checklist — how to open the SHOP

⚠️ **THIS FILE WAS ABOUT REMOVING A PASSWORD. THAT IS DONE.** Amplify basic auth
on `main` was removed on **2026-09-12** and www.shaklek.com is **public**. What
is closed now is the SHOP, not the site, and it is closed in code:

- `src/proxy.ts` rewrites every page to `/coming-soon`
- `/api/orders` refuses with a 503 independently

Both read `STORE_OPEN === "true"`. The variable is in the build-spec allowlist
with **no value set**, so it is undefined and the shop is shut. Opening it is
step 0 below. Everything about basic auth further down is **history** — kept
because the reasoning about what a branch-level gate breaks is still true, and
staging still uses one.

**Public today:** the pre-launch page, `/blog` and its articles, `/legal/*`,
both webhooks, `robots.txt`, the sitemap.
**Still closed:** `/our-story`, `/faq`, the catalogue, product pages, checkout.

Credentials are the founder's. They are **not in this repo** and must not be
committed. If lost, set new ones in Amplify → main → Access control.

---

## ⚠️ WHAT BEING GATED ACTUALLY BREAKS

Amplify basic auth gates **every path on the branch and cannot exclude one** —
this was measured on staging on 2026-08-30, which is why staging's gate was
removed. So while production is closed:

- **The Stripe webhook returns 401.** No new order can be placed anyway (nobody
  can reach checkout), so nothing is lost — but it means **you cannot complete a
  real test purchase on production while gated.** Use staging for that: it has
  test Stripe keys and its own working webhook.
- **The Clerk signup webhook returns 401.** No signup notifications, and no
  `customers` row from a signup. Nobody can reach sign-up either.
- **The 06:00 reconcile job would fail daily**, so the EventBridge rule
  `shaklek-reconcile-daily` was **DISABLED** at the same time. It must be
  re-enabled at launch or reconciliation silently never runs.
- **Google stops crawling and will drop the site from its index.** That is the
  point while private, but re-indexing after launch takes days to weeks. If the
  launch is close, weigh that.

## TO LAUNCH — do these together, in this order

0. ⚠️ **TURN THE STORE ON. IT IS OFF IN CODE NOW, AND IT FAILS CLOSED.**
   Added 2026-09-12 with the "launching soon" page: `/api/orders` refuses every
   order with a 503 unless `STORE_OPEN === "true"`. The polarity is deliberate —
   a variable that never reaches the app means CLOSED, so the switch cannot fail
   open. But that means **four steps, not one**, and the console is only one of
   them:

   ```bash
   # 1. the buildspec allowlist -- a console-only variable never reaches the app
   aws amplify get-app --app-id dqcptedylrif0 --query 'app.buildSpec' --output text | grep -o 'env | grep.*'
   #    add  -e STORE_OPEN  to that grep, then update-app
   # 2. set STORE_OPEN=true in Amplify → environment variables
   # 3. REDEPLOY -- the build spec is read at build time
   # 4. prove the RUNNING APP sees it, not the console:
   curl -s -o /dev/null -w "%{http_code}\n" -X POST https://www.shaklek.com/api/orders \
     -H 'Origin: https://www.shaklek.com' -H 'Content-Type: application/json' -d '{}'
   #    400 = store is OPEN and rejected an empty body.  503 = still shut.
   ```

   **The failure mode if this is missed is a live site with a dead Buy button
   and no error anyone can interpret.** It is step 0 because it is the one that
   looks done when it is not.

1. **Re-enable the reconcile job.** Do this FIRST so it is not forgotten:
   ```bash
   aws events enable-rule --name shaklek-reconcile-daily
   aws events describe-rule --name shaklek-reconcile-daily --query State --output text   # ENABLED
   ```
2. **Remove the gate.**
   ```bash
   aws amplify update-branch --app-id dqcptedylrif0 --branch-name main --no-enable-basic-auth
   ```
3. **Verify the site is public**, and that the things the gate was blocking work:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://www.shaklek.com/            # 200
   curl -s https://www.shaklek.com/robots.txt | head -2                          # Allow: /
   curl -s -o /dev/null -w "%{http_code}\n" -X POST https://www.shaklek.com/api/webhooks/stripe -d '{}'  # 400, NOT 401
   curl -s -o /dev/null -w "%{http_code}\n" -X POST https://www.shaklek.com/api/webhooks/clerk  -d '{}'  # 400, NOT 401
   ```
   **400 means the handler was reached and rejected an unsigned request. 401
   means the gate is still up and Stripe still cannot pay you.**
4. **Confirm in Stripe's dashboard** that the live webhook endpoint is delivering
   200s again — it will have accumulated failures while gated.
5. **Place one real order end to end** and confirm it reaches `paid`. Until that
   happens, nothing proves money completes.
6. Resubmit the sitemap in Google Search Console to speed re-indexing.


## Being considered: a public coming-soon page instead of a full gate

The founder asked whether the site could stay hidden while still gaining SEO.
**It cannot** — showing Google content that visitors cannot see is cloaking, and
Google penalises it. And the SEO at stake is currently nil: a search for pages on
the domain returns zero results, because the site is new and was never promoted.

The option on the table is a single **public** coming-soon page (brand, what she
makes, launch timing, email capture via the existing `/api/waitlist`) with
catalogue, prices and checkout still closed. **Its value is the email list, not
search.**

⚠️ It requires moving the gate out of Amplify and into `src/proxy.ts`, because
Amplify basic auth cannot exclude a path. That is a request-path change on a
card-taking site: staging first, and the webhook routes must stay reachable.

## Still open before launch (see session-log for detail)

- ✅ ~~`/upload` is live and indexed and loses the customer's photo.~~
  **REMOVED ENTIRELY, founder's decision 2026-09-12.** Gone: `src/app/upload/`,
  `src/components/CustomizeChat.tsx`, `src/lib/customizeParser.ts`,
  `src/app/api/customize/` and the sitemap entry.
- ✅ **EVERY ORDER LINE NOW MUST MATCH A REAL CATALOGUE SLUG.** With `/upload`
  gone, `pricing.ts` lost its slugless, category-priced branch. That branch was
  behind three separate defects found in one day: having a PRICE was the same as
  being ON SALE (Skirt 449, Dress 599 and a same-day Abaya 690 were all
  purchasable with no product and no quoted stitching); its ladder went stale at
  389/419/429/619 while the catalogue moved to 449/519, selling uploads 60-90
  under; and `in` on that ladder let prototype keys through as categories.
  One root cause — a second source of truth for price. There is now one.
  ⚠️ **If custom work returns, give it a real catalogue entry with a slug.**
- The pricing reopen: packaging is 36.15/order, not 2, so margins are 56–61%
  against a 65–72% band.
- DET advertising permit before ANY discount campaign is advertised.
- Clerk dev-instance webhook, so staging signups notify.
- `CLERK_WEBHOOK_SECRET` rotation (Clerk dashboard; belt-and-braces).
