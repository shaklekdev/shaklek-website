# Launch checklist — how to open the site again

**www.shaklek.com is PRIVATE as of 2026-08-31.** The founder asked for it to be
closed until the official launch. It returns **401 to everyone**, including the
apex (which 301s to www and then hits the wall).

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

- `/upload` is live and indexed and loses the customer's photo — remove it or
  build storage. **Decide before the gate comes down.**
- The pricing reopen: packaging is 36.15/order, not 2, so margins are 56–61%
  against a 65–72% band.
- DET advertising permit before ANY discount campaign is advertised.
- Clerk dev-instance webhook, so staging signups notify.
- `CLERK_WEBHOOK_SECRET` rotation (Clerk dashboard; belt-and-braces).
