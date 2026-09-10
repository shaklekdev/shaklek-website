# AWS Cloud Infrastructure — TODO

Status (2026-08-23): **live and taking real card payments** at `www.shaklek.com` on AWS Amplify (app `dqcptedylrif0`, `eu-west-1`). Stripe on live keys, Clerk on production keys, Neon Postgres for orders, Resend for mail.

⚠️ The line above used to read "nothing is deployed anywhere yet" long after the site was live. Stale status text in a planning doc is not harmless — a stale credential claim in `CLAUDE.md` caused a live price vulnerability to be assessed as "test mode, no real money" on 2026-08-23. Verify state, don't read it: see `planning/security/rca-2026-08-23.md`.

**See [`aws-architecture-diagram.html`](./aws-architecture-diagram.html) for the full visual architecture** — every component, what's built vs. decided vs. open, and which pieces are genuinely AWS versus external APIs AWS-hosted code happens to call.

This plan is deliberately sized for a pre-revenue pilot, not a scaled business — real AWS, priced for near-zero traffic, not a toy and not overbuilt. Revisit sizing once there's real order volume.

## Revision note
Originally scoped around a raw EC2 instance. Switched to **AWS Amplify** instead — it's AWS's own managed hosting product, purpose-built for apps like this one (automatic HTTPS, CDN, CI/CD from git, no manual server/Nginx/process-manager setup). Gets the same "real AWS, cost-optimized" goal with close to none of raw EC2's manual operational overhead, and likely cheaper at near-zero traffic since it's usage-priced rather than a server running 24/7.

## AI: Google Gemini API (Nano Banana), not Amazon Bedrock
**Superseded 12 August 2026.** Previously decided Amazon Bedrock (Claude + Nova Canvas, itself a correction from an earlier Titan Image Generator reference) — now moved to the **Google Gemini API** for both text and image, external to AWS entirely. Reasoning:
- Nano Banana's specific strength is consistent, targeted image edits — change one thing on a garment photo, keep everything else identical — a better technical fit for the live customization preview than Nova Canvas was. Not a lateral swap, a real capability upgrade for the core product loop.
- Text parsing moved too, for operational simplicity: one external AI vendor (Google) instead of splitting across AWS Bedrock (Claude) and Google (images). Consistent with this project's running pattern of favoring least ongoing maintenance for a solo founder (same logic as Clerk over Cognito, Stripe over Telr).
- The real cost of this move: AI no longer shares AWS's bill or IAM. It's a genuine external dependency now, same category as Clerk and Stripe — own account, own outage surface, own bill. That's a real trade-off, not a free upgrade.
- Two callers, same API: Amplify calls Gemini synchronously for live customization parsing + preview generation during a customer session; the weekly Lambda trend-intake job calls Gemini to analyze trend signals and regenerate an inspired (not copied) candidate image. See `aws-architecture-diagram.html` for the full flow, and `ai-integration-todo.md` for the product-level detail.
- Open item: confirm exactly which Gemini image model/tier is in use (Nano Banana vs. Nano Banana Pro have different free-tier terms) before this becomes a real cost line.

## Immediate: get the site live at all
- [x] **AWS Amplify Hosting** — connected, deploys on every push to `main`, HTTPS and CDN handled automatically
- [x] Point `shaklek.com`'s DNS at the Amplify app — done, DNS stayed at GoDaddy. `www` is a CNAME to CloudFront and works fully. The apex has a caveat, see "Nice to have" below.
- [x] **AWS Budgets + a billing alarm** — verified 2026-08-23, it exists and is wired: `shaklek-monthly-budget`, USD 50/month on account `793168138974`, with four notifications (ACTUAL at $10 and $25 absolute, plus ACTUAL and FORECASTED at 100%). Re-check with `aws budgets describe-budgets --account-id 793168138974` and `aws budgets describe-notifications-for-budget --account-id 793168138974 --budget-name shaklek-monthly-budget`.

## Nice to have — NOT required for MVP

### Move DNS to Route 53 so the apex domain preserves paths
**Not blocking anything. Do this on a calm morning, never in a hurry.**

The problem, precisely — three of four URL shapes already work:

| URL | Result |
|---|---|
| `shaklek.com` | ✅ 301 → www, works |
| `www.shaklek.com` | ✅ works |
| `www.shaklek.com/design/oversized-shirt` | ✅ works |
| `shaklek.com/design/oversized-shirt` | ❌ 404 |

Only a hand-typed apex **deep link** breaks. Anything copied from a browser already carries `www`, and typing the bare domain works. So the practical fix is simply to **always publish the address as `www.shaklek.com`** — bio, WhatsApp, print. That costs nothing and closes the real-world gap.

**Why GoDaddy cannot fix it.** The apex A-records point at GoDaddy's forwarding service (`15.197.225.128`, `3.33.251.168`), which forwards the root and discards the path. Its dialog offers only 301, 302 and *forward with masking* — no path-preserving option. Masking must **not** be used: it frames the site and wrecks SEO. This is not a settings oversight — the DNS spec forbids a CNAME at a zone apex, and CloudFront can only be targeted by CNAME or an ALIAS-type record. GoDaddy offers no ALIAS. Route 53 does. That is the entire reason this needs a registrar-side move.

**Why it is deliberately deferred.** The migration means recreating every record, and this domain carries live business email. Getting MX or SPF wrong takes down mail — a far worse outcome than a 404 on a URL shape nobody types. The website risk is near zero; the email risk is not.

**Records that must be recreated exactly (captured 2026-08-23):**

```
shaklek.com        MX    0 shaklek-com.mail.protection.outlook.com.   # Microsoft 365 — DO NOT LOSE
shaklek.com        TXT   "v=spf1 include:secureserver.net -all"
shaklek.com        TXT   "NETORGFT21015113.onmicrosoft.com"           # MS domain verification
_dmarc             TXT   "v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;"
send               TXT   "v=spf1 include:dc-fd741b8612._spfm.send.shaklek.com ~all"   # Resend
send               MX    10 feedback-smtp.eu-west-1.amazonses.com.                    # Resend
www                CNAME dpe3ldtzdjeo5.cloudfront.net.               # Amplify
clerk              CNAME frontend-api.clerk.services.                # Clerk — sign-in breaks without it
accounts           CNAME accounts.clerk.services.                    # Clerk
autodiscover       CNAME autodiscover.outlook.com.                   # Outlook
_55d0a0b6fb6877d59f43893b29272a90  CNAME _f4cb8edcc66756b68800358652efbd7a.jkddzztszm.acm-validations.aws.   # ACM cert validation
```

**Order of work when it is finally done:**
1. Re-capture the live records first (they may have changed): `for t in A MX TXT CNAME NS; do dig +short shaklek.com $t; done`
2. Create the Route 53 hosted zone for `shaklek.com` and recreate every record above **before** touching nameservers
3. Verify against Route 53's nameservers directly, without switching: `dig @<route53-ns> shaklek.com MX`
4. Only then change nameservers at GoDaddy
5. Send and receive a test email to prove Microsoft 365 still works
6. Amplify → Domain management → remove and re-add `shaklek.com`; it creates the apex ALIAS itself and flips `verified` to true
7. Confirm: `curl -sI https://shaklek.com/design/oversized-shirt` returns 301 to the www equivalent, path intact

Rollback: switch the nameservers back at GoDaddy. Allow for propagation delay, so do not attempt this immediately before anything that matters.

## Database
- [x] **Neon Postgres** (not RDS) — decided 2026-08-14, ~$0/month at pilot scale vs. RDS's flat ~$15/month, since Neon auto-suspends when idle instead of billing for an always-on instance. Project `shaklek`, Postgres 18, region Frankfurt (`eu-central-1` — Neon doesn't offer Ireland, and Frankfurt is the nearest region to Amplify's `eu-west-1` compute). Neon's own "Backend Services" (built-in auth) was deliberately left off — Clerk is still the decided auth provider, see below.
- [x] Schema + persistence code (`website/src/db/schema.ts`, wired into `/api/orders`) — done, migrated onto the real Neon instance, verified with real inserts.
- [x] **Amplify + Next.js SSR gotcha, hit and fixed 2026-08-14 — hit again 2026-08-16**: environment variables set in the Amplify Console are only injected at *build* time by default — a Next.js server route (or `proxy.ts`) reading `process.env.X` at runtime sees nothing, even after a redeploy, until the build spec explicitly writes them into `.env.production`. Confirmed via AWS's own docs (`docs.aws.amazon.com/amplify/.../ssr-environment-variables.html`). Fixed by updating the app's build spec (`aws amplify update-app --build-spec ...`, since this app has no repo-committed `amplify.yml` — the spec lives on the App resource itself). **Recurred 2026-08-16**: adding Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STAFF_EMAILS`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`) to the Console env vars wasn't enough on its own — `/dashboard/*` 500'd in production (worked fine locally) until those 4 names were also added to the grep list. Current full list: `env | grep -e DATABASE_URL -e STRIPE_SECRET_KEY -e STRIPE_WEBHOOK_SECRET -e RESEND_API_KEY -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY -e CLERK_SECRET_KEY -e STAFF_EMAILS -e NEXT_PUBLIC_CLERK_SIGN_IN_URL >> .env.production` before `npm run build` (also dropped the now-unused `DASHBOARD_PASSWORD` from the list). **Any future secret env var added in the Amplify Console must also be added to that grep list**, or it silently won't reach the running site — confirmed twice now to be genuinely easy to lose time to.

## Storage
- [ ] **S3 bucket** for catalog images and uploaded reference photos — genuinely a small task: create the bucket, attach an IAM permission so Amplify can write to it, swap the base64-emailing of reference photos for an S3 upload (note: `/api/custom-requests` no longer exists — it was unified into `/api/orders`). Not the same scope as the database work.

## Authentication — Clerk, BUILT and on production keys
- [x] **Clerk** over Cognito and Auth.js — outside the AWS umbrella, but the least ongoing maintenance of the three for a solo maintainer (managed sign-in UI, sessions, magic link all handled), and its free tier covers pilot scale. See `payment-auth-todo.md` for the full reasoning. Needed for customer accounts and separate staff logins (tailor swipe tool, admin dashboard, trend review dashboard).

## Payment gateway — Stripe, LIVE and taking real money
- [x] **Stripe** over Telr/PayTabs — best docs, Stripe Checkout removes most PCI burden, settles in AED. See `payment-auth-todo.md` for the full reasoning. Most gateways require a registered business entity for a real merchant account, so account creation is still gated on the incorporation decision, not a purely technical one.

## Email
- [x] Already handled outside AWS — Microsoft 365 (`hello@`, `orders@`, `support@shaklek.com`) is already purchased and configured. No need for SES unless/until transactional volume from the app itself gets large — **Resend is wired in and live** — the key is set and both the stylist notification and the customer confirmation send from the Stripe webhook.

## Cost discipline
- [ ] On-demand / usage-based pricing only — no Reserved Instance or Savings Plan commitment until there's a real, predictable traffic pattern to commit against
- [ ] No multi-AZ redundancy until real concurrent traffic or uptime requirements justify the added cost — matches the same capacity-paced philosophy the business dossier applies to tailor recruiting and ad spend
- [ ] Rough target: still roughly **$30–50/month or less** at pilot scale, likely on the lower end of that given Amplify's usage-based pricing versus a 24/7 EC2 instance. Re-check once real usage exists.

## Sequencing note
Originally: don't build the database until `backend-todo.md`'s schema work is actually ready to use it. **Fully done as of 2026-08-14** — Neon is provisioned, migrated, and confirmed persisting real orders in production (see Database section above).

---

## Monitoring and alerting — BUILT 2026-08-26

Before this, **nothing watched the site.** Zero CloudWatch alarms, zero SNS
topics, verified against the account. A failed Amplify build is silent — the
site just keeps serving the previous version — and a 500 went to CloudWatch,
which nobody reads. The detection mechanism was the founder noticing.

Everything below is in **eu-west-1**, account `793168138974`, tagged
`project=shaklek`.

### The topic

`arn:aws:sns:eu-west-1:793168138974:shaklek-alerts` → email
**hello@shaklek.com** (subscription confirmed 2026-08-26).

Its access policy allows publish from `events.amazonaws.com` and
`cloudwatch.amazonaws.com`. ⚠️ **Without those two statements the alarms and
the rule fire into nothing and the whole setup looks configured while
notifying no one.** If alerts ever go quiet, check the topic policy first.

### What fires

| Alarm | Condition | Why this shape |
|---|---|---|
| `shaklek-5xx-errors` | any 5xx in 5 min | A *rate* threshold hides a handful of failed checkouts at low traffic. At this size, one server error is worth an email. |
| `shaklek-site-silent` | 0 requests in 1 hour | Catches a **total outage**, which the 5xx alarm cannot: a dead site emits no errors, it emits nothing. `--treat-missing-data breaching` is the whole trick. |
| `shaklek-slow-responses` | p90 latency > 3s for 15 min | Three consecutive periods, so one slow spike does not page anyone. |
| `shaklek-build-failed` (EventBridge) | Amplify job `FAILED` or `CANCELLED` on any branch | The silent-failed-build case. Message includes the `get-job` command to read the log. |

The event pattern was checked **both ways** with `aws events test-event-pattern`:
it matches a `FAILED` deployment event and does **not** match a `SUCCEED` one.
A rule that quietly matches everything is worse than no rule.

### Cost

Roughly **$0.30/month**: three standard-resolution alarms at $0.10 each. SNS
email is free for the first 1,000 notifications a month, and EventBridge
charges nothing for AWS service events.

### Verified end to end

A test message was published to the topic and delivered — this is not a
config-only claim.

### The nightly order reconciliation — added 2026-08-27

`shaklek-reconcile-daily`, `cron(0 6 * * ? *)` → EventBridge **API
destination** → `GET /api/admin/reconcile`. Bearer token lives in an
EventBridge **Connection**, which stores it in Secrets Manager — never in a
rule definition and never in git. Two retries, one hour max age.

**Proved end to end before being left alone**, not just configured: a
temporary `rate(1 minute)` rule fired the same target twice — **2 invocations,
0 failures** — then was deleted. That is the only way to test that the
Connection's stored `Authorization` header actually works.

`shaklek-reconcile-not-running` alarms on the rule's `FailedInvocations`.
Every failure mode of this check ends in "nobody was told", so the check needs
watching too.

⚠️ **SNS cannot be an EventBridge dead-letter target** — it must be SQS. The
FailedInvocations alarm does the same job here without another queue.

### Still open

- [ ] **Sentry (free tier) for application errors.** CloudWatch tells you the
      5xx rate moved; it cannot tell you which line threw. Requires creating an
      account, which is the founder's to do. Once the DSN exists it is
      `@sentry/nextjs` plus one environment variable.
- [ ] Consider a second subscription to a phone-reachable address if
      hello@shaklek.com is not checked daily. An alert nobody reads is the same
      as no alert.
