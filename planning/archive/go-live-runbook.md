> # ⚠️ ALREADY EXECUTED — 2026-08-22. DO NOT RE-RUN.
>
> Parts A–C were carried out and verified: Stripe live keys, live webhook registered
> for both events, Clerk production instance on `clerk.shaklek.com`, and a real
> AED 390 Apple Pay payment that settled and flowed through the webhook.
>
> Re-running this would do damage — step 3 would register a **duplicate** live
> webhook endpoint, and step 8 tells staff to re-register on an instance they are
> already on. Kept as the record of how the swap was done.
>
> Part D is complete too: the AED 390 test charge was refunded in full on
> 2026-08-23. Verified against the Stripe API — `refunded: true`,
> `amount_refunded: 39000` on charge `ch_3U7GbOFG6ccJjMKM0i0cgAZD`.

---

# Go-live runbook — Stripe live keys + Clerk production

Written 2026-08-22. Do these **in order**, then push. Nothing here needs a code
change; every step is a credential or a dashboard setting.

**Claude cannot do Part A or B.** Entering API keys and secrets is off-limits —
these are yours to paste. Everything in Part D is verification Claude can run
once you say the swap is done.

---

## Before you start

| | |
|---|---|
| Amplify app | `dqcptedylrif0`, region `eu-west-1`, branch `main` |
| Live site | `https://www.shaklek.com` (the apex `shaklek.com` 404s) |
| Stripe account | `acct_1U4N2wFG6ccJjMKM` — verified, charges and payouts enabled |
| Unpushed work | ~~15 commits on `main`~~ — stale snapshot; that work is pushed and live |

Env vars currently set in Amplify: `CLERK_SECRET_KEY`, `DATABASE_URL`,
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`,
`NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL`,
`RESEND_API_KEY`, `STAFF_EMAILS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`TAILOR_WHATSAPP_NUMBER`.

**Only four of them change.** Nothing else needs touching.

---

## Part A — Stripe: test → live

1. **Get into live mode.** Stripe replaced the old top-right "Test mode" toggle
   with **sandboxes**, switched from the **account picker at the top left**.
   Skip the navigation entirely and use the account-scoped link:

   > **API keys (live): https://dashboard.stripe.com/acct_1U4N2wFG6ccJjMKM/apikeys**
   > **Webhooks (live): https://dashboard.stripe.com/acct_1U4N2wFG6ccJjMKM/webhooks**

   **How to know which mode you are in: read the URL.** A `/test/` segment in
   the path means test mode. No `/test/` means live. That is unambiguous, and it
   does not change when Stripe redesigns the dashboard chrome.

   ⚠️ **There are three entries in your account picker**, and only one is right:

   | Picker entry | Account | Mode |
   |---|---|---|
   | **shaklek** | `acct_1U4N2wFG6ccJjMKM` | **live — use this** |
   | shaklek | `acct_1U4N2wFG6ccJjMKM` | test-mode sandbox |
   | shaklek sandbox | `acct_1U4N3HFDCtKouREX` | a **separate account** |

   "shaklek sandbox" is a different account, not a different mode of the same
   one. If the current test keys came from there, nothing configured on it —
   including any webhook — exists on the live account. Either way step 3 stands.

   One Stripe caveat worth knowing: settings changed while in the *test mode
   sandbox* can also change live mode, because the two share some settings.
   Sandboxes proper are fully isolated; the test-mode sandbox is not.

2. **Developers → API keys** → reveal and copy the **Secret key** (`sk_live_…`).
   There is no publishable key to change: this integration uses Checkout
   Sessions and redirects server-side, so the browser never holds a Stripe key.

3. **Create the webhook endpoint again, in live mode.** ⚠️ **This is the step
   that is most often missed.** Test-mode endpoints do not carry over, and live
   events are signed with a different secret — miss this and payments succeed
   while orders never flip to `paid` and no email is sent.

   - Go to the live webhooks link above → **Add endpoint**
   - URL: `https://www.shaklek.com/api/webhooks/stripe`
   - Events: **`checkout.session.completed`** and **`checkout.session.expired`**
     (those are the only two the code acts on; anything else is acknowledged
     and ignored)
   - Payload style: **Snapshot**. Scope: **Your account**
   - Copy the new **Signing secret** (`whsec_…`)

4. Amplify Console → shaklek-website → **Hosting → Environment variables** →
   update **`STRIPE_SECRET_KEY`** and **`STRIPE_WEBHOOK_SECRET`**.

## Part B — Clerk: development → production

5. Clerk Dashboard → create a **production instance** for the Shaklek
   application (or promote the existing development one).

6. **Production instances need DNS records.** Clerk will give you a set of
   CNAMEs (typically `clerk`, `accounts`, `clkmail`, and a `_domainkey` record)
   to add wherever `shaklek.com` DNS lives. Add them and wait for Clerk to show
   verified. This is the slowest step — it can take minutes or hours.

7. Set the instance paths to match the app: sign-in `/sign-in`, sign-up
   `/sign-up`. No allowlist is needed — staff access is gated separately by
   `STAFF_EMAILS` in `dashboard/layout.tsx`.

8. ⚠️ **Users do not transfer from a development instance to a production one.**
   The staff accounts that exist today will not be there. After the swap, both
   addresses in `STAFF_EMAILS` (`tlohinada@gmail.com`, `hello@shaklek.com`) must
   sign up again on the production instance. The allowlist still works — it
   matches on email, not on user id — but until they register, `/dashboard`
   locks everyone out. Do this immediately after the swap, not later.

9. Copy `pk_live_…` and `sk_live_…`, then update
   **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** and **`CLERK_SECRET_KEY`** in Amplify.

## Part C — deploy

10. Tell Claude to push `main`. Amplify builds automatically on push.

    Note the Amplify quirk already recorded in `aws-infrastructure-todo.md`:
    env vars set in the console only reach the running server because the build
    spec writes them into `.env.production`. A changed variable therefore needs
    a **build**, not just a save — pushing handles that.

## Part D — verification (Claude runs these)

11. Amplify job reaches `SUCCEED`. **A failed build is silent** — the site keeps
    serving the old version, so check the job before believing anything.
12. Stripe account API still reports `charges_enabled` and `payouts_enabled`.
13. **One real card payment, smallest item.** Confirm: order row flips
    `pending_payment` → `paid` in Neon, notification email arrives at
    `orders@shaklek.com`, order appears in `/dashboard/orders`. **Then refund it
    from the Stripe dashboard.**
14. Sign in on production keys; check `/account` loads and `/dashboard` is
    reachable for a `STAFF_EMAILS` address and refused for anything else.
15. Browser console on `www.shaklek.com` no longer shows Clerk's *"loaded with
    development keys"* warning.
16. Homepage shows AED 390 / 450, and the design page opens on the new hero
    combinations.

## If something breaks

- **Payment succeeds but the order stays `pending_payment`** → step 3. The
  webhook secret is wrong or the live endpoint was never created.
- **Everyone is locked out of `/dashboard`** → step 8. Staff have not signed up
  on the production instance yet.
- **A change is not visible on the live site** → check the Amplify job status
  first. If it succeeded, it is CloudFront caching the image optimizer response
  for 4 hours, and the fix is a new filename, not a redeploy.

## Roll back

The keys are the only change; Amplify keeps previous env var values in its job
history, and reverting means pasting the test values back and redeploying. The
code deploy rolls back with `git revert` and a push. Nothing here is one-way.
