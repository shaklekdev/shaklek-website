# Session log

More than one Claude session works on this repo at once, against **one shared
working tree**. Uncommitted work is therefore visible to — and clobberable by —
the other session.

**Read this before you start. Update it before you finish.**

Rules that make this work:

- Claim files here *before* you edit them, not after.
- `git diff <file>` before `git add <file>`. Never `git add -A` (and never from
  the repo root — passport, Emirates ID and visa sit there untracked).
- If a file you need is claimed below, say so and coordinate rather than
  editing it underneath the other session.

---

## Active claims

### THE LIST FOR 2026-09-01 — rewritten after everything below landed

**Site status: `www.shaklek.com` is PRIVATE.** Amplify basic auth on `main`,
founder's call, credentials hers and not in this repo. See
`planning/launch-checklist.md` for exactly how to open it again — the checklist
exists because the gate breaks the Stripe and Clerk webhooks and the 06:00
reconcile job, and those have to come back in the right order.

**Closed since last night, all verified on live systems, none of it broken:**
P0 staging built and proving a full test checkout · signup notifications working
end to end · the email-casing defect fixed *and* now enforced by a database index
· the free-confirmed-order fallback closed · staging stripped of every production
secret · `RECONCILE_TOKEN` rotated in both places it lives · the chunked-body
bypass closed · staging noindexed at the header · the repo moved out of iCloud.

#### Hers, and the gate makes two of them urgent

1. ⚠️ **`/upload` — decide BEFORE the gate comes down.** It is live, was in the
   sitemap, and loses the customer's reference photo: the tailor receives a
   boolean. Zero orders have hit it. Remove it properly, or pay for image
   storage. While the site is private this is free to fix; the day it opens it
   is a live defect again.
2. **Pricing — the analysis is DONE, do not redo it.** ⚠️ An earlier version of
   this list said "packaging 36.15, margins 56–61%". **Both numbers are stale**
   and shaklek-83 corrected them; verified against `ec111f7`. The real Fitoor
   quote landed (100-unit pricing is far worse than the 500-unit estimates), and
   the founder then changed strategy: **cotton base at today's prices, linen a
   +90 upgrade, packaging local except the cotton bag.** That earns **62.4%
   cotton / 60.9% linen** and is the first version that is profitable at a 250
   CAC. Full working in `planning/pricing-todo.md` under "THE PLAN AS IT STANDS,
   2026-08-31".

   **What is left is not analysis — it is two prices the founder is sourcing this
   week:** a 100% cotton quote in the four colourways (ask **width and gsm**, not
   just price per metre — width moves the answer more), and a cotton bag at or
   near AED 10. Nothing further can be computed until those land.

3. ⚠️ **BLOCKER — the care label and hang tag both say 100% LINEN.** Its own
   line, because it is not a pricing question: it is the legal fibre disclosure,
   and the Fitoor quote covers **500** care labels reading `كتان 100% / 100%
   LINEN`. Under a cotton-base catalogue those are wrong on most garments.
   **The packaging order cannot be placed until this artwork is settled.**

4. ⚠️ **AND THE SAME PROBLEM REACHES THE WHOLE SITE, WHICH NOBODY HAS COSTED.**
   Cotton as the base fabric is not only a labelling change. **14 customer-facing
   files assert "100% linen"** — the catalogue intro, `/how-it-works`,
   `/our-story`, both FAQs, `/upload`, the customizer, `homeContent.ts`,
   `seo.ts`, `productDisclosure.ts` — **and `/feed/meta.xml` emits
   `<g:material>100% linen</g:material>` to Meta's ad catalogue.** Selling a
   cotton garment against any of those is a false claim, and the ad feed one is a
   false claim inside an ad platform.

   Three more things inherit it: `fabrics.ts` still has cotton `available:
   false`; **every catalog photograph was generated in linen** (CLAUDE.md is
   explicit that selling cotton against a linen photograph is the same defect in
   the other direction); and the supplier certificate verified last night covers
   **linen article W300235 only** — a cotton base needs its own written
   confirmation.

   **This is the cheapest it will ever be to fix, because the site is closed.**
   The day the gate lifts it is a live false-claim problem across 14 pages and an
   ad feed. It is also large enough that it should be scoped before the fabric
   decision is finalised, not after.
5. **`CLERK_WEBHOOK_SECRET` rotation** — Clerk dashboard only, belt-and-braces
   now that staging no longer holds production's copy.
6. **A test Resend key for staging**, if she wants email flows testable there.
   Staging currently cannot send mail at all, deliberately.
7. Supplier: fabric width, and one line in writing that **W300235 as sold to us
   is 100% linen**. Two AED 3.89 refunds. Sentry. Meta pixel. DET permit before
   any advertised discount. TikTok account. One lawyer hour. Arimo font swap.

#### Mine, unblocked

0. **A public coming-soon page, with everything else still gated.** Founder
   asked 2026-08-31, after asking whether the site could keep gaining SEO while
   hidden.

   ⚠️ **The premise had to be corrected first, and the correction matters more
   than the feature.** There is no way to show Google the full catalogue while
   showing visitors a login. Serving crawlers different content from people is
   **cloaking**, one of the few things Google actually penalises. The sanctioned
   paywall markup requires genuinely handing Googlebot the content and is built
   for subscription publishers.

   **And the SEO being protected is worth roughly nothing today.** A search for
   pages on the domain returns zero — the site is two weeks old, never promoted,
   and was not meaningfully indexed before the gate went up. There is no clock
   running out. **Do this for the email list, not for search.**

   The shape: one public page — brand, what she makes, launch timing, email
   capture — with catalogue, prices and checkout still closed. `/api/waitlist`
   already exists and works; it is what powers the Shaklek+ early-access mails
   she has been receiving.

   ⚠️ **Amplify basic auth is all-or-nothing and cannot exclude a path** —
   measured on staging 2026-08-30. So selective access means moving the gate
   **into the code** (`src/proxy.ts`), which is a request-path change on a site
   that takes live cards. **Through staging first, and mind that the webhook
   routes must stay reachable** or the same 401 problem returns by a different
   route. Also needs the noindex logic revisited: the public page should be
   indexable while everything behind it is not.


6. **The marketing agent's three highest-value changes** — the false-claim
   captions are already fixed; the remaining two are hers to approve: move the
   fit promise out of a collapsed FAQ to where money is decided, and promote her
   own thesis line out of the /our-story basement. Four content files are ready
   in `planning/marketing/`.
7. **P2 the remake flow.** Still needs a delivery date recorded and a
   "remake used" flag, or "one free remake within 14 days" is unenforceable.
8. **Two staleness flags** the marketing audit found: `src/lib/seo.ts` still
   comments that the apex 404s (it 301-redirects), and the delivery promise reads
   "ten **working** days" on the home FAQ but "ten days" on `/faq`.
9. **`CLAUDE.md` still warns the repo root holds passport/Emirates ID/visa.** It
   does not — the root is project directories only and those live in
   `~/Desktop/shak-docs`. The `never git add -A` advice stands; its stated reason
   is stale. **Left for her**, because a safety warning that is wrong about WHY
   is one people eventually stop believing.

#### Worth knowing

- **iCloud is still duplicating her Desktop files outside the repo** —
  `send-to-supplier` and `send-to-supplier 2` both exist, with *different* file
  counts, so they have genuinely diverged. Moving the repo fixed the repo, not
  the Desktop. Turning off iCloud Desktop & Documents sync is hers to decide.
- **Everyone must restart Claude Code from `~/dev/Shaklek`.**
- **Bloom MCP is connected but its tools load at session start** — the restart
  picks it up.

### The three open security items are CLOSED (2026-08-31, founder awake and approving)

#### 1. Staging no longer holds anything of production's

`RESEND_API_KEY`, `STAFF_EMAILS`, `TAILOR_WHATSAPP_NUMBER`, `RECONCILE_TOKEN`
and `CLERK_WEBHOOK_SECRET` are now branch-level overrides. **Zero** app-level
variables are inherited.

⚠️ **AMPLIFY SILENTLY DROPS EMPTY-STRING VARIABLES, AND A DROPPED BRANCH
OVERRIDE FALLS BACK TO INHERITING THE APP-LEVEL ONE.** The first attempt set
three to `""`, which read back as *absent* — so staging was still inheriting
production's secrets while appearing overridden. **Blanking is not a way to
override.** Use a non-empty, obviously-invalid placeholder and read it back.

Staging's Resend key is deliberately junk, so **staging cannot send email at
all** — that closes the spam/quota channel against the founder's inbox without
needing a second Resend account. **Cost, recorded honestly:** email flows cannot
be tested on staging until she supplies a test key. Verified: production token
→ 401 on staging, staging waitlist → 502 (cannot send), staging checkout still
creates a Stripe session, production untouched.

#### 2. `lower(email)` unique index — applied to both databases

`customers_email_lower_idx`. Dev first, then production, each gated on a
pre-check that `count(distinct lower(email))` equalled `count(*)`. It did, so
nothing needed cleaning. Declared in `schema.ts` too, so a future
`drizzle-kit push` cannot drop it.

**Verified against `pg_indexes`, never the ledger** — that ledger has already
reported a migration applied that never ran. On dev it was proven by inserting
an actual case-duplicate and confirming Postgres rejected it; **production got
no probe row**. Indexes now match across both databases.

#### 3. Both Low findings closed

**`readBoundedText`** caps on bytes ACTUALLY RECEIVED. The old guard trusted the
declared `Content-Length`, so a chunked request walked past it. **Proven by
measurement, not reasoning:** the same 200KB chunked body returned **400 on
production's old code** — meaning it buffered the whole thing and only then
failed the signature — and **413 on staging's new code**.

**`X-Robots-Tag: noindex, nofollow` on every non-`main` branch.** ⚠️ The default
is deliberately *production*: an unset `AWS_BRANCH` falls through to NOT setting
noindex, because de-indexing the live storefront would be far worse than the leak
it closes. Verified in both directions by building twice and reading
`routes-manifest.json`, then on the live hosts: staging has the header, and
production's home, catalog, a product page and /our-story have **none**.

#### 4. `RECONCILE_TOKEN` rotated on production

⚠️ **The token lives in TWO places** — the Amplify variable and the
**EventBridge connection `shaklek-reconcile-conn`** that fires
`shaklek-reconcile-daily` at 06:00. Rotating one alone breaks the scheduled job
**silently**, which is this project's signature failure. Both were updated, then
production redeployed so the app reads the new value.

Verified end to end: **old token → 401** (the copied one is dead), **new token →
200** (the scheduled job still works), no token → 401, and staging rejects the
new production token too. The old value is kept in this session's scratch only.

**Still hers:** `CLERK_WEBHOOK_SECRET` cannot be rotated from here — it is
regenerated in the Clerk dashboard. Staging no longer holds production's copy,
so the exposure is closed; rotating is belt-and-braces.

### THE REPO MOVED — `~/Desktop/Shaklek` → `~/dev/Shaklek` (2026-08-31)

**Founder's go-ahead, coordinated with shaklek-83, verified at every step.**
`~/Desktop` is synced by iCloud Desktop & Documents; the full reasoning and what
iCloud actually did to `.git` is now in **CLAUDE.md §6**, because a repo location
is environment state and this had been written off four times as a cosmetic
curiosity.

**Pre-move gate, all checked before touching anything:** tree clean, `main` and
`staging` both level with origin, zero stashes, no build or dev server running,
no open write handles into the repo. The only processes holding a cwd inside it
were the two Claude sessions.

**The move was `mv` on the same volume — an atomic rename.** Nothing was copied
and nothing deleted, which matters because the repo carries 2.1 GB and four
**gitignored** trees that git could not have restored:
`send-to-packagin-supplier-final` (15 files, the founder's packaging hand-off),
`brand-assets` (433), `insparation` (105), `catalog-archive` (369), and
`website/.env.local`.

**Verified after:** file list **identical, 37,562 before and 37,562 after**, all
five gitignored items present, `git fsck` clean, HEAD and remote intact,
`npm run build` exit 0, `tsc` exit 0, and the derived `REPO_ROOT` in the patched
scripts now resolves to the new path.

⚠️ **Nine scripts hardcoded the old absolute path and would have broken
SILENTLY.** They now derive it from `import.meta.url`. shaklek-83 found and
fixed a tenth independently (`build-final-folder.mjs`, `a618366`) — its
suggestion, `grep -rn '/Users/nadatlohi'` across the whole tree rather than
trusting the docs, is what caught the ones the planning files never mentioned.
**Do that sweep before any future move.**

**Everyone must restart from `~/dev/Shaklek`.** A Claude Code session keys its
project directory to the path it started in, so this session kept trying to
reset its shell to a directory that no longer exists. The founder needs a
restart anyway to pick up the Bloom MCP connector.

**Follow-up, same night — the old path came back, and was cleaned.**
`~/Desktop/Shaklek` reappeared holding 13 files, 872 KB, entirely
`website/.next/build` turbopack output written *after* the move. No `.git`, and
zero files outside `.next/`, so it was disposable. shaklek-83 spotted it; the
cause is that **a Claude Code session keys its project directory to the path it
started in**, so both sessions' shells kept resolving to a directory that no
longer existed and something recreated it. Checked for `.git` and for any file
outside `.next/` before `rm -rf`, then confirmed it did not return. The shell
then reported the deletion outright — `working directory was deleted, cwd
recovered to ~` — which is the clearest possible argument for restarting.

⚠️ **iCloud is still duplicating her working files outside the repo.**
`~/Desktop` holds both `send-to-supplier` and `send-to-supplier 2`. Moving the
repo fixed the repo; it did not fix the Desktop. If the packaging or artwork
folders on her Desktop matter, they carry the same exposure the catalog images
had — **the real remedy is turning off iCloud Desktop & Documents sync, which is
hers to decide.**

**Not done, and worth knowing:** `CLAUDE.md` still warns that the repo root
holds untracked personal documents (passport, Emirates ID, visa). **It no longer
does** — the root is now project directories only, and those files live in
`~/Desktop/shak-docs`, outside the repo. The `git add -A` warning is still good
advice, but its stated reason is stale. Left for the founder rather than edited,
since it is a safety warning and softening one is her call.

### iCloud is syncing the git repository, and that is the actual bug (2026-08-31)

The "file 2" duplicates have been logged four separate times as a curiosity.
They are not a curiosity. **`~/Desktop` is synced by iCloud Desktop & Documents,
and this repo lives in it**, so a file syncer and git are writing the same files
and only one of them understands git.

⚠️ **WHAT WAS ACTUALLY FOUND ON 2026-08-31: NINETEEN COPIES OF `.git/index`.**
That is git's staging area, the file rewritten on every `git add`. iCloud was
racing git's own writes to it. Also `.git/refs/remotes/origin/main 2`, a
null-sha1 ref that made `git fsck` report an error and every `git branch` print
a warning.

The repository was checked and is **healthy** — `HEAD` matches `origin/main`,
`fsck`'s only error was that ref, dangling objects are normal. All 20 stray
files removed; `fsck` and `git branch` are now clean. **But a corrupted index
loses staged work, and nothing about this arrangement stops it happening again.**

`brctl status` also shows `last-reset: 2026-08-26 (CKUnderlyingErrorContainerReset)`
— an iCloud container reset, which forces a full reconcile. That is almost
certainly what produced the 143 catalog `.png` twins noticed two days later.

**Where it has bitten, worst first:**
`.git/index` (19 copies) · `.git/refs` (broken ref) · `.next/types` (breaks
`tsc` with phantom duplicate-identifier errors, the one that actually stops
work) · `public/catalog` + `public/marketing` (143 twins) · `planning/marketing`
(5 copies, twice in one night).

**Done, and it is a bandage:**
- `.gitignore` now excludes `* <digits>` and `* <digits>.*`. Verified it catches
  the real cases and that **no tracked file becomes ignored**.
- `website/scripts/clean-icloud-duplicates.mjs`, wired first into `npm run build`
  and `npm run verify` — before `tsc`, since a stale `.next/types` copy is what
  breaks the typecheck. It **deletes copies under `.next/` only** (generated,
  reproducible) and merely **reports** any elsewhere, even byte-identical ones:
  source and planning files are not a script's to delete, per the standing rule
  that `rm` has no undo. **Always exits 0** — a sync artefact must never be why
  a deploy fails. Tested by planting the exact `.next/types` file that broke
  `tsc` plus a source-dir copy, and confirming it removed the first, spared the
  second, and left `tsc` clean.

⚠️ **THE REAL FIX IS THE FOUNDER'S CALL AND I DID NOT TAKE IT: move the repo out
of `~/Desktop`** (e.g. `~/dev/Shaklek`), or turn off iCloud's Desktop &
Documents sync. Everything above only stops the mess reaching git history; it
does not stop iCloud writing into `.git`.

**I did not move it unilaterally, deliberately.** Another Claude session shares
this working tree, `CLAUDE.md` and the planning docs carry absolute
`~/Desktop/Shaklek` paths, and the Claude Code project directory is keyed to the
path. Moving it out from under a live session is exactly the class of action
that needs her awake.

### THE LIST FOR 2026-08-31 — REWRITTEN after three Fable agent reviews

Supersedes the earlier "THE LIST FOR 2026-08-31" below. Three agents ran on the
founder's instruction: `shaklek-security` on tonight's code, `shaklek-security`
on the live configuration, and `shaklek-marketing` on the site against 26
principles she supplied (`planning/marketing/26-principles.md`).

**No Critical and no High findings anywhere.** Both security agents independently
re-verified the §0 non-negotiables on what is deployed and found them holding:
server-owned pricing, gated webhook transitions, guards on every write route,
`isUuid`, `envGuard`, security headers, no secrets committed. The Svix verifier
was attacked with 16 adversarial inputs plus Svix's published vector and holds.
`a601ded` was judged correct.

**Shipped tonight (`519030d`, staging job 5 then production job 288, both green,
production re-verified on the right commit):** the PII log line, the Postgres
error-message log, the stale "changes no state" comment, and three ready-to-post
captions that claimed "cotton or linen" when cotton is `available: false`.

---

#### 1. ✅ EMAIL CASING — FIXED AND PROVEN (`17829eb`, production job 291)

**Founder, 2026-08-31: "fix what you've broken first, nothing has to be broken."**
Fair. Done, and proven on staging before production — the first bug on this
project to be caught by a review, reproduced in a real environment, and fixed
without a customer ever meeting it.

**What it was.** `customers` is keyed by email and a Postgres `text` unique index
is CASE-SENSITIVE, so `jane@x.com` and `Jane@X.com` were two customers. `e8d003b`
made the signup webhook write lowercase — right in itself — which turned a latent
inconsistency into a deterministic one: `persistOrder` stored the address AS
TYPED and the `/account` readers matched case-sensitively. Sign up, then type a
capital at checkout, and you get a second customers row, your order attaches to
it, **and it stops appearing on your own account.**

**Checked before changing anything:** both databases hold **zero** mixed-case
addresses and distinct-case-insensitive equals total, so nothing needed
migrating and no existing row was orphaned.

**The fix.** Normalised at the DATABASE BOUNDARY in `persistOrder`, not at the
top of the handler — the address the customer typed is still what Stripe shows
her and what her confirmation is addressed to; only the key is canonical. The
four `/account` call sites moved to `getVerifiedEmailLower()`, which already
existed.

**`/api/orders/[id]` fixed in the same pass** (was security finding #3): it read
`currentUser().primaryEmailAddress` directly, the only customer-facing route
bypassing `getVerifiedEmail`, so it skipped the verification check that exists
so authorization never trusts an unverified address. Not reachable today only
because a Clerk Dashboard toggle is set — which is the dependency the helper
exists to remove.

**Proven, not asserted.** On staging, the exact broken scenario:

| step | result |
|---|---|
| order as `casetest@example.com` | 1 customer row |
| order as `CaseTest@Example.COM` | **still 1 row** |
| both orders on one customer id | **PASS — 2 orders, 1 customer** |

Before the fix that second order created a second customer and vanished from
`/account`. Production after deploy: home/catalog/checkout 200, `/account` 307,
origin guard 400/403, an unauthorised order read still 404, and data untouched
at 5 customers / 12 orders / 2 paid / 0 mixed-case.

⚠️ **Still worth doing, separately:** a `unique index on customers (lower(email))`
so the DATABASE enforces this instead of four call sites remembering to. That is
a migration — index first, then code, per Deploy Trap 3.

#### 2. Staging holds production secrets, and they should be rotated

Both agents found this independently. `CLERK_WEBHOOK_SECRET` and
`RECONCILE_TOKEN` are inherited unchanged; staging `/api/admin/reconcile`
returns **401 not 404**, which proves the production token is live on a public
host. `RESEND_API_KEY`, `STAFF_EMAILS` and `TAILOR_WHATSAPP_NUMBER` are shared
too — so anyone can drive public staging's `/api/waitlist` to send mail **from
the production sending domain to the founder's inbox**, burning the quota of the
one alerting channel this project depends on.

**Do:** override all five on the staging branch (own Resend key, a drain or
`+staging` address, the dev Clerk instance's own webhook secret, a separate
reconcile token), **then rotate `RECONCILE_TOKEN` and `CLERK_WEBHOOK_SECRET` on
production**, since both have now been copied to a lower-trust host. The
build-spec allowlist already carries every name, so **no spec edit is needed** —
branch overrides are enough. ⚠️ I am blocked from doing this: the permission
classifier refuses Amplify writes, correctly.

#### 3. `/api/orders/[id]` is the one route that bypasses `getVerifiedEmail()`

It reads `user.primaryEmailAddress.emailAddress` directly (~line 45). Not
exploitable today — the production Clerk instance was checked live and enforces
`required: true` + `verify_at_sign_up: true` — but it depends on a Dashboard
toggle staying correct, which is exactly what `authEmail.ts` exists to avoid.
One-line fix.

#### 4. Smaller, all Low

- `rejectOversizedBody` trusts `Content-Length`, so a chunked body reaches
  `req.text()` before the signature check on a public endpoint. Pre-existing,
  same on `/api/orders`; CloudFront caps upstream.
- Staging's noindex is `robots.txt` only. An `X-Robots-Tag` header gated the same
  `AWS_BRANCH` way would be a second layer. ⚠️ **Get the condition right** — a
  noindex leaking onto production would be far worse than the risk it closes.
- Clerk retries re-send the notification email (no `svix-id` dedupe). Harmless.

#### 5. Marketing — the audit's verdict, and it is a good one

**#23 Protect long-term trust is the site's strongest principle**, and the agent
found evidence: the false "real photograph" claim was removed, the pre-shrink
disclosure was cut, the 192-ways figure is computed rather than typed. **#3, #15,
#17, #22 are already done well.**

The real gap is **#2 / #9 / #18** — the site leads with what the product IS, not
what it does for the customer. Named exactly: the hero
`"Customisable pieces for you, by you, always at the same price."`, STEPS[0]
`"Timeless essentials in 100% linen."`, and the catalog intro. Meanwhile the
site's best customer-first lines — `"Your body isn't standard. Why should your
clothes be?"` — sit at the **bottom of /our-story**, the least-read position.

**Her three highest-value moves**, in the agent's order:
1. The false-claim captions — **done tonight**.
2. **Move the fit promise to where money is decided.** "One free alteration or
   remake within 14 days" is the brand's whole answer to "will it fit", and it
   currently debuts inside a *collapsed FAQ*. ⚠️ Note the precedent: she
   deliberately cut a *refund* remedy from a caption. The alteration promise is a
   different and safer claim, but the call is hers.
3. **Promote her own thesis line out of the /our-story basement** — it is already
   her published sentence, and it converts the hero from IS to DOES.

Four new files in `planning/marketing/`: `homepage-propositions.md`,
`objection-handling.md`, `founder-story-angle.md`,
`organic-content-additions.md`. All permit-free, no invented testimonials, no
manufactured urgency, no em dashes.

**Two more staleness flags it found, not fixed:** `src/lib/seo.ts` still comments
that the apex 404s (it 301-redirects), and the delivery promise reads "ten
**working** days" on the home FAQ but "ten days" on `/faq`.

#### 6. Blocked on her, unchanged

Bloom MCP is connected at the CLI but its tools load at session start, so **a
Claude Code restart is needed** before it can be used. Plus: the pricing reopen
(packaging 36.15/order, margins 56–61% against a 65–72% band), the Clerk dev
webhook, `/upload`, the supplier's written "W300235 is 100% linen" and fabric
width, Arimo, two AED 3.89 refunds, Sentry, Meta, DET permit, TikTok, lawyer hour.

### THE LIST FOR 2026-08-31 — written 2026-08-30, checked against live systems

**Production verified tonight, so nobody re-checks it:** 5 customers, 12 orders,
2 paid, **0 emails stored with a capital**, **0 orders with no line items**, and
**0 orders that ever took the silent-fallback path**. The free-order bug existed
for eight days and never actually fired on production. Working tree clean,
nothing unpushed.

#### Mine, unblocked — start here

1. **Staging still inherits two PRODUCTION secrets.** `CLERK_WEBHOOK_SECRET`
   and `RECONCILE_TOKEN` were never overridden at branch level, so staging holds
   production's values. Consequence today is small — no production Clerk webhook
   points at staging, and reconcile only reaches the dev DB — but it is the same
   inheritance trap that would have given staging the live Stripe key, and it
   means staging cannot verify a Clerk **dev-instance** webhook until it is
   fixed. **Override both.** Small, and it should be done before anything else
   is built on staging.
2. **P2 — the remake request flow.** Designed, not built, not blocked. Two
   things must exist first or "one free remake within 14 days" is
   unenforceable: **no delivery date is recorded anywhere**, so the 14 days
   counts from nothing, and **nothing records that the remake was used**, so
   "one" cannot be enforced. Both small, both additive.
3. **P3 — email normalisation at checkout.** Re-checked tonight: **0 customers
   affected.** Genuinely not urgent. Wants its own careful job because it
   touches the payment path.

#### Blocked on her decision, then mine

4. **`/upload` — still 200 and STILL in the live sitemap.** Verified again
   tonight. A visitor from search can configure an upload, pay, and the
   reference photo is never stored; the tailor receives a boolean. **Zero orders
   have hit it.** Two honest options: take it off the sitemap and the router, or
   build image storage (there is no S3 bucket, so that is real work).

#### Worth a pass, not urgent

5. **`shaklek-security` on `a601ded`.** A payment-path change shipped tonight
   without the review CLAUDE.md asks for, because this session cannot spawn
   agents. Low risk by my reading — one early return that can only turn a 200
   into a 500 — but unreviewed, and it should not have a second payment change
   stacked on it first.

#### Hers

- **The pricing reopen is the biggest business item.** Packaging is **36.15 per
  order**, not the 2 the file assumed, so margins are **56–61%** against a
  65–72% design band. The "+49 is off" conclusion of 2026-08-28 rested on the
  wrong number. Other session has it. **Nobody is buying and no campaign is
  running, so prices can still move freely — that stops the day ads start.**
- **Clerk DEV-instance webhook** at `…staging…/api/webhooks/clerk`, so staging
  signups notify. Needs item 1 done first.
- **Supplier:** fabric width (the 110m / ~50 garments estimate rests on 140cm,
  unconfirmed), and one line in writing that **W300235 as sold to us is 100%
  linen** — the thing that actually backs the claim on ~20 pages.
- **Arimo font swap** in the artwork PDFs — shaklek-83 is holding for her word.
- Two **AED 3.89** refunds; **Sentry**; **Meta** pixel + domain verification;
  **DET advertising permit before any discount campaign**; **TikTok** business
  account + UAE advertiser permit; **one lawyer hour** (tailor/ECAS, privacy,
  terms).

### Session K — the silent-fallback fix, shipped through staging (2026-08-30)

**`a601ded`. Staging job 4, then production job 285. Both green.** The first
change on this project to be proven on staging before it touched production —
which is the whole point of building it.

**What was wrong:** `/api/orders` catches a persistence failure, leaves
`orderId` null, and falls past `if (orderId && stripe)` into the **pre-Stripe
demo flow** — which emails a confirmation and returns `ok: true` without ever
creating a Checkout Session. Correct while there was no Stripe account.
**One has existed since 2026-08-22**, so for eight days any failure that nulled
`orderId` turned a live checkout into a free confirmed order. No error, no 5xx,
and a row on the dashboard indistinguishable from an abandoned checkout.

**Now:** `if (stripe && !orderId)` returns **500** with *"You have not been
charged. Please try again."* Gated on `stripe`, so a local checkout with no
secrets still gets the demo flow it is meant to get.

**Verified by reproducing the failure, not by reading the diff.** A local
production build pointed at an unreachable database:

| | before | after |
|---|---|---|
| response | `200 ok:true` | **500** |
| customer sees | "Order confirmed" | "You have not been charged" |
| confirmation email | sent | not sent |
| Stripe session | none | none |

Then on **staging**: healthy path still returns a `cs_test_` checkout URL,
foreign origin still 403, empty body still 400. Then production: home, catalog
and checkout all 200; `/api/orders` 400 own-origin and 403 foreign; both webhook
routes still 400; still serving `pk_live_`.

⚠️ **The security agent was NOT run on this, and CLAUDE.md asks for it on
anything in the payment blast radius.** This session is configured not to spawn
agents. The change is one early-return that can only turn a 200 into a 500 and
cannot reach `unit_amount`, pricing, or auth — but that is my assessment, not a
review. **Worth a pass by `shaklek-security` before the next payment change
lands on top of it.**

### Session K — STAGING PROVED A FULL CHECKOUT, AND FOUND THREE BUGS DOING IT (2026-08-30)

**End to end on staging, with a Stripe test card: order created -> Stripe
Checkout -> payment -> webhook delivered -> signature verified -> order `paid`.**
Shipping name, phone, address, emirate and country all persisted; the line item
carries its colour, size, price and changes. **Zero production risk taken: test
card, test keys, dev database.** That is the thing the founder asked for on
2026-08-28.

It took three bugs to get there, and **two of them are latent PRODUCTION
risks, not staging quirks.**

#### 1. ⚠️ A FAILED LINE-ITEM INSERT CONFIRMS AN ORDER WITHOUT TAKING PAYMENT

The dev database was missing `order_items.fit_notes`, a column production has.
So: the order row was written, the **items insert failed**, `orderId` came back
null, and `/api/orders` fell through `if (orderId && stripe)` to the
**pre-Stripe fallback** — which emails a confirmation and returns `ok: true`.
The founder saw "order confirmed", was never asked for a card, and the row sat
at `pending_payment` with **0 items** and no session.

**The missing column was the trigger; the silent fallback is the defect.** That
branch exists for "no Stripe account wired up yet", a condition that has not
been true since 2026-08-22. On production it means **any** failure that nulls
`orderId` turns a checkout into a free confirmed order, with no error shown and
nothing in the dashboard to distinguish it. **Recommended, not done (payment
path, founder's call): when Stripe IS configured, a null `orderId` should be a
5xx, not a fallback.**

Diagnostic that found it, worth reusing: an order row with **0 line items** is
the signature. Compare `items` count against `stripe_session_id` — a healthy
order has both, this one had neither.

#### 2. ⚠️ THE MIGRATION LEDGER LIED, AND `db-migrate` WOULD HAVE SKIPPED THE FIX

`shaklek_migrations` on **dev** records `0005_naive_rockslide.sql` — the
migration whose entire body is `ALTER TABLE order_items ADD COLUMN fit_notes` —
as applied at 2026-08-28T17:43:45. **The column was not there.** So the ledger
we built to replace drizzle's broken one has now produced a false "applied" of
its own, and `node scripts/db-migrate.mjs --target=dev` would have exited 0
having done nothing.

Applied the column directly against a host-checked connection instead, then
**diffed every column of both databases**: dev and prod are now identical, no
drift in either direction.

**This is the third instrument on this project to report success for work that
did not happen.** The rule holds: verify against `information_schema`, never
against a ledger or an exit code.

#### 3. The origin allowlist is hardcoded, so no non-production host can check out

`allowedOrigins()` hardcodes the shaklek.com domains, and it does two jobs:
CSRF admission **and** choosing Stripe's `success_url`. On staging the first
rejected checkout outright ("Cross-origin request rejected"), and the second
would have redirected a staging payment to **www.shaklek.com/order-confirmed**.

Fixed with configuration, **not by touching the CSRF guard**:
`NEXT_PUBLIC_APP_URL` set at branch level. Verified that staging now accepts its
own origin (400 validation) and still rejects `evil.example.com` (403), and that
production still rejects staging's origin (403).

#### 4. Amplify basic auth gates EVERY path and cannot exclude one

Stripe and Clerk got **401** on `/api/webhooks/*`, so staging could never test a
checkout. Basic auth is off with the founder's explicit go-ahead; indexing is
blocked instead by `robots.ts` returning `Disallow: /` when
`AWS_BRANCH !== "main"`.

#### Cost of the whole thing to production: nothing. It was never touched.

### Session K, later — P0 STAGING ENVIRONMENT IS BUILT (2026-08-30)

**Founder supplied the two blocking values, so P0 is no longer blocked — it is
done.** Nothing held.

| | production | staging |
|---|---|---|
| git branch | `main` | **`staging`** (new, pushed) |
| Amplify stage | PRODUCTION | DEVELOPMENT |
| URL | `www.shaklek.com` | `staging.dqcptedylrif0.amplifyapp.com` |
| public | yes | **no — basic auth, 401** |
| database | `ep-blue-cell` | `ep-jolly-cloud` (dev) |
| Stripe | `sk_live_` | `sk_test_` |
| Clerk | `pk_live_` | `pk_test_` (dev instance) |
| auto-deploy | push to `main` | push to `staging` |

Basic auth: user `shaklek`, password in the founder's hands (generated, not
committed).

⚠️ **THE TRAP THAT WOULD HAVE MADE THIS WORSE THAN USELESS: Amplify branches
INHERIT app-level environment variables.** A `staging` branch created without an
explicit override for every sensitive variable runs the **live Stripe key
against the production database** — a second production wearing a staging name,
which is strictly more dangerous than having no staging at all. All twelve
variables are overridden at branch level.

**So the branch was created with `--no-enable-auto-build`**, the overrides were
**read back from the API and asserted** (`sk_test_`, `pk_test_`, dev DB host)
*before* the first build was allowed to run, and auto-build was turned on only
after. Do it in that order for any future branch.

`src/lib/envGuard.ts` is the backstop and it already covered this case: a
`sk_test_` key against the production DB **throws on startup**. It was written
for local dev; it turns out to be exactly the staging guard too.

**Verified, not assumed:** staging 401 without credentials, 200 with them,
`/sign-up` serves `pk_test_`; production still 200 and still `pk_live_`; first
staging build succeeded. Auto-branch-creation was checked and is **off**, so
pushing the git branch could not have auto-provisioned anything with production
values.

**Still outstanding (needs the founder, both are five-minute dashboard jobs):**
- **Stripe TEST-mode webhook** → `https://staging.…amplifyapp.com/api/webhooks/stripe`,
  then set `STRIPE_WEBHOOK_SECRET` on the staging branch. Until then a staging
  checkout will not mark orders paid.
- **Clerk DEV-instance webhook** → `…/api/webhooks/clerk`, then
  `CLERK_WEBHOOK_SECRET` on the staging branch. Until then staging signups do
  not notify.

Note both are **branch-level** variables. The build-spec allowlist is
app-level and already carries every name, so no spec change is needed.

**Update, same session — Stripe webhook wired, and basic auth deliberately
removed.**

⚠️ **Amplify basic auth gates EVERY path on a branch and cannot exclude one.**
So `/api/webhooks/stripe` and `/api/webhooks/clerk` returned **401** to Stripe
and Clerk, and staging could not test a checkout — the one thing it exists for.
Measured, not assumed: staging returned 401 where production returned 400.

**Basic auth is now OFF, with the founder's explicit go-ahead**, and the real
harm it was covering is closed more precisely: `src/app/robots.ts` returns
`Disallow: /` whenever `AWS_BRANCH !== "main"`. It reads an **Amplify built-in
at BUILD time**, so `/robots.txt` being statically generated means no new
variable and **no build-spec allowlist change** — a `NEXT_PUBLIC_` variable
would have needed the console *and* the spec, which is the RECONCILE_TOKEN
two-step. Verified by building both ways before pushing, then on the live sites:
staging is `Disallow: /`, production's is byte-for-byte unchanged.

What the exposure actually is: a public copy of the storefront on `sk_test_`
keys, so no real card can be charged, against the dev Neon branch, so no live
customer row is reachable.

**Stripe test-mode webhook is done** — endpoint `shaklek-staging` registered
against the staging URL for `checkout.session.completed` and
`checkout.session.expired` only; `STRIPE_WEBHOOK_SECRET` merged into the
staging branch's variables (12 → 13, read back and asserted, still `sk_test_`
and still the dev DB).

**Still outstanding:** the Clerk **dev instance** webhook endpoint, so
`CLERK_WEBHOOK_SECRET` is unset on staging and staging signups do not notify.
Production signups are unaffected and working.

**Minor, noticed in passing:** `git branch -a` warns
`ignoring ref with broken name refs/remotes/origin/main 2` — the macOS/iCloud
"file 2" duplicate that CLAUDE.md already documents for `.next/types`, this time
inside `.git/refs`. Harmless, but it is the third place that pattern has shown up.

### Session K — Clerk signup notification (2026-08-30) — DONE, deployed, nothing held

**Shipped `e461777`, Amplify job 278 SUCCEED, verified on production.**
New files only; no existing file was touched.

**The gap:** a customer could create an account and it produced no email, no
row, no dashboard entry. There was no Clerk webhook of any kind — only
Stripe's. `customers` rows are written when someone ORDERS, so an account with
no order lived entirely inside Clerk and was invisible to everyone. The founder
found it when a friend signed up and nothing happened.

⚠️ **Diagnose before fixing: the mail pipeline was never broken.** The first
theory was that notifications were going to `orders@`/`hello@` mailboxes she
could not read, and a "repoint everything at STAFF_EMAILS" change was proposed.
She then pasted two notification emails she HAD received. Resend, DKIM
(`resend._domainkey.shaklek.com`), the `send.shaklek.com` SPF subdomain and
DMARC `p=quarantine` are all correctly configured and delivering. **The
proposed fix was withdrawn — it would have changed working code and fixed
nothing.** The only real defect was the missing webhook.

**What was built**
- `src/lib/svixVerify.ts` — Svix HMAC verification, no new dependency (~40 lines
  of `node:crypto` beats a package in the tree, where a failed `npm ci` is a
  silent Amplify failure). Constant-time compare, 5-minute replay window,
  multi-signature support for key rotation.
- `src/app/api/webhooks/clerk/route.ts` — `user.created` → one email to
  `STAFF_EMAILS`. Writes nothing, touches no database, does not import
  `orderEmail.ts`. A signup notification has no business in the payment blast
  radius.

**Verification, in the order it was done**
- 13/13 unit tests, including **Svix's own published test vector** rather than
  an HMAC computed by the code under test — the standing rule about not
  verifying with a metric that shares the transform's own thresholds. Negative
  cases: tampered body, wrong secret, wrong `svix-id`, truncated and empty
  signatures, both ends of the replay window, malformed headers, `v0` ignored.
- `tsc --noEmit` clean, `npm run build` exit 0, route registers as
  `ƒ /api/webhooks/clerk`.
- On production: unsigned POST → **400**, and a signature forged with the wrong
  secret → **400**.

⚠️ **The 400 is the load-bearing observation, not the 200.** A missing
`CLERK_WEBHOOK_SECRET` returns **501**, so 400 is what proves the variable
actually reached the running app. That is the only cheap external test that
distinguishes "allowlist correct" from "console set, runtime undefined" — the
`RECONCILE_TOKEN` failure. **Probe for the 400 after any future env-var
addition.**

**Two guard rails held, and both were right to.** The permission classifier
blocked `aws amplify update-app`, so the founder made both console changes
herself — correct, because `update-app` REPLACES the whole variable map and a
bad merge silently wipes `DATABASE_URL` and `STRIPE_SECRET_KEY`. Her first
attempt put `-e CLERK_WEBHOOK_SECRET` *after* the `>>`, which would have
redirected the build output into a file named `-e` and dropped every variable;
she asked before saving it. **Both values were read back from Amplify and
diffed against a 14-variable snapshot before anything was pushed.**

**Still open:** no end-to-end delivery from Clerk itself has run yet — the
signature path is proven, the Clerk-to-inbox path is not. Create a throwaway
account, or use the Clerk dashboard's test event.


### Session J — /our-story + a live nav bug (2026-08-28) — DONE, no files held

**The Catalog menu link was broken on every page** and is the more urgent half
of this. A hash link to the URL you are already on is a no-op in the App
Router, so on the home page Catalog worked exactly once: 976, then 0, then 0.
Fixed in `Header.tsx` and measured 976/976/976.

**/our-story** rebuilt to the founder's mockup over several rounds of her
feedback, shown on localhost before anything shipped. A first attempt at her
written proposal was previewed and rejected ("not sure this is what was
meant") and deleted; what shipped is the parts she confirmed, one at a time.

⚠️ **Two standing rules I broke and had to be told about.** I put em dashes
back into customer copy -- a documented founder correction with a linter for it
in the social builder. And a vignette read "not a size chart", which sells
against standard sizing, a real equally-priced option the page links to. Both
caught by her, not by me.

⚠️ **143 more resurrected .png duplicates** appeared in public/catalog and
public/marketing, all byte-identical to their .jpg twins, all with original
mtimes. Moved to `_archive/duplicate-png-names/`. That is the third occurrence;
see `_archive/README.md` for the sync-tool explanation.


### Security agent — RCA for the five 2026-08-26/27 bugs (2026-08-27)

**HOLDING, uncommitted, awaiting founder review — do not edit or commit:**

- `planning/security/rca-2026-08-27.md` (new; RCA for `426484b`, `3908db2`
  and the RECONCILE_TOKEN build-spec fix, written at the founder's request)

### Session G — TikTok + Instagram launch content (2026-08-27, overnight)

**HOLDING these files. Please do not edit them tonight:**

- `website/scripts/social/tiktok-launch.mjs` (new, the frame/video engine)
- `website/scripts/social/tiktok-videos.mjs` (new, the video set)
- `website/scripts/social/carousel.mjs` (new)
- `planning/marketing/tiktok-launch.md` (new)
- `planning/marketing/instagram-launch-2026.md` (new)
- `brand-assets/TIKTOK/`, `brand-assets/INSTA/` (output only, gitignored)
- `branding/` (finished earlier tonight, committed, not held any more)
- `.claude/agents/shaklek-marketing.md` (done, committed)

**Not touching** `website/src/`, the catalogue, pricing, or anything under
`planning/` other than `marketing/`. Earlier tonight I did touch
`src/app/icon.tsx`, `apple-icon.tsx`, `globals.css`, `layout.tsx`,
`Header.tsx`, `SizePicker.tsx`, `DetailField.tsx`, `FabricColorPicker.tsx`,
`sizeChart.ts`, `designSpec.ts` and `homeContent.ts` — all committed and pushed,
so pull before you edit those.

⚠️ **TWO WHITELIST-BY-NAME FAILURES TONIGHT, SAME ROOT CAUSE. Read this.**

1. `fabrics.ts` was on disk and never committed while two committed files
   imported it. **Production failed to build for two commits** and the site
   quietly served the old version. `npm run build` reads the WORKING TREE;
   Amplify builds a git CHECKOUT. A green local build is not evidence.
2. `.gitignore` whitelists `branding/` **by named folder**. Renaming `logo/`
   into three folders silently un-tracked **47 artwork files** while the commit
   that removed the old ones looked perfectly successful.

`website/scripts/verify-imports.mjs` now fails the build on (1). For (2), run
`git ls-files <dir>` after any rename inside an ignored tree. **In a shared
working tree, "on disk" and "in git" are different things, and only one of them
deploys.**


### Session I — reviewer UI feedback (2026-08-27, IN PROGRESS)

⚠️ **Holding `website/src/components/Header.tsx`,
`website/src/components/CustomizeParameters.tsx`,
`website/src/components/SizePicker.tsx`, `website/src/components/DetailField.tsx`
and `website/src/components/DesignCustomizer.tsx`.** Session G committed its
sizing work and its social run does not touch these, but check before editing.

Working an outside reviewer's list, relayed with two annotated mockups: centre
the logo and bring the header icons off the corners, surface the WhatsApp
number, put "100% linen" on the photo, give the customizer's section titles
real weight and separators, raise Add to cart above the fold, and rework
"Anything usually wrong with this size?" into a retractable positive
"Make it your way".

### Session I — repo tidy (2026-08-27, DONE)

⚠️ **Holding the repo ROOT only.** Creating `_archive/` and a root `README.md`,
and moving stale root files into it. **Touching none of:** `website/`,
`branding/`, `planning/`, `catalog-archive/`, and — deliberately —
**`brand-assets/` and `insparation/`**, because the other session is producing
TikTok and Instagram content out of the first and `insparation/` was modified
2026-08-26, so both are live inputs to work in flight.


### Session G — sizing, fit questions, and a two-commit production outage (2026-08-26)

**Status: DONE, deployed, verified on production (job 193, `9f8d143`).**

⚠️ **I BROKE PRODUCTION FOR TWO COMMITS AND EVERY LOCAL CHECK SAID GREEN.**
Read this part before anything else in this entry.

`website/src/data/fabrics.ts` was Session F's, on disk and never committed. I
staged `designSpec.ts` and `api/orders/route.ts` for my own changes **without
running `git diff` on them first** — the rule at the top of this file — so
their imports of `@/data/fabrics` went to main while the file did not. Amplify
builds a git CHECKOUT; `npm run build` reads the WORKING TREE, where the file
exists. Jobs 191 and 192 failed, the site kept serving the old version, and I
only looked because I happened to check job 192.

Two guards now run before `next build`, so this class cannot recur silently:

- **`scripts/verify-imports.mjs`** — every `@/` import in every TRACKED file
  must resolve to a TRACKED file. Replayed against the broken commit it names
  exactly the two errors Amplify reported. **In a shared working tree, "on disk
  but not in git" is a normal state, so a green local build was never evidence.**
- **`scripts/test-techpack-origins.mjs`** — see below.

**Lesson, for whoever is next: `npm run build` passing does not mean the deploy
will pass, and a failed deploy is silent.** Check the job.

#### Shipped

- **Standard sizing is the default** (`designSpec.ts`). It was `tailored`, and
  Add to cart is disabled until four body measurements validate — so every
  visitor was asked for a tape measure before the site would sell anything.
  Tailored is now the opt-in and its button reads **"Tailored (free)"**.
- **Trousers and skirts are sold as EU numbers** — 34 to 44 — tops stay XS–XXL.
  A LABELLING RULE, NOT A SECOND SIZE SYSTEM: one chart, one set of body
  measurements, and `sizeChart.ts` grew `sizeLabel`/`sizesForCategory`/
  `rowForSize`. The stored value is the label the customer saw, and `rowForSize`
  resolves a letter OR a number so pre-2026-08-26 orders still find their row.
  ⚠️ **EU 32 was NOT added** — it is below the current smallest size and needs a
  body-measurement row the published charts do not cover. Founder's call, open.
- **"Anything usually wrong with this size?"** (`src/data/fitNotes.ts`, new) —
  optional taps under the size, standard mode only, printed on the tech pack.
  **Ids travel, never text**, re-resolved server-side against the category the
  SERVER priced. Needed `drizzle/0005` — `order_items.fit_notes`, applied to
  live Neon by the founder; 13 existing rows untouched.
- **Measurement ranges moved into the input placeholder.** The same four boxes
  existed in THREE places with three behaviours; they share `FIELD_LABELS` now.
- **Catalog menu → `/#catalog`**, and the mobile menu now closes on a hash link
  (it closed on pathname changes, and a hash is not one).
- **"Timeless essentials in 100% linen"** — "Eight" dropped, founder's wording.

#### The tech pack was clipping its own sentences, and had been for a while

The founder spotted the new fit-note caveat ending at "Adjust from the standard
block by". pdfkit keeps `doc.x` where the last positioned draw left it, and this
document writes values at `left + 118`, so any later `doc.text(str, { width })`
opens its column at x=190 and loses ~118pt off the right of every line.

**`techPack.ts` already carried a comment explaining this exact trap.** It
happened anyway. The static check found **two more live instances nobody had
reported** — the tailored-order size cross-check, and **"Customer's fit note:",
the customer's own words to the tailor, truncated on every tailored order that
had one.** The text is CORRECT inside the PDF and only its origin is wrong, so
no string search, byte diff or content assertion can see it. Only eyes, or
`test-techpack-origins.mjs`.

#### Known, not chased

`scripts/test-techpack.mjs` cannot run on this Node — it fails to resolve the
`@/` alias on main as well, so it is pre-existing. The size and fit-note logic
was unit-tested directly with `tsx` instead.


### Session E — pricing model rebuilt on real fabric costs (2026-08-26)

**Status: DONE, committed. No code touched — `planning/pricing-todo.md` only.**

The founder gave the first real fabric quotes: cotton 10, organic cotton 20,
linen 30 AED/m **online**, and **linen cannot be had below 40 in store**. The
launch runs on store prices. In-store prices for the other fabrics, and metres
consumed per design, arrive **Friday 2026-08-28** and are marked as placeholders
in the file.

**Three things in that file were wrong and are corrected, not patched over:**

1. **It listed a ladder that never shipped** — 390/420/450/620. Live is
   **389 / 419 / 429 / 619**, read out of `BASE_PRICE_BY_CATEGORY`. Pants were
   21 AED below the number the whole margin case was built on.
2. **It computed margins on a blended 15 AED/m** that corresponds to nothing the
   founder can buy. At real in-store linen the live prices earn **57–61%**, not
   the 69–72% claimed — about **11 points thinner**.
3. **It said "fabric is not the lever."** At 40 AED/m and 2 metres, fabric is
   80 AED — the largest single line on a shirt, more than cut-and-sew.

**Only ONE fabric is sellable today: linen** (`src/data/fabrics.ts`, set this
morning — organic cotton has no supplier and all catalog photography is linen).
So every live price is already a linen price, and the founder's "+49 for linen"
is a **price rise, not a surcharge**. Recorded as such.

⚠️ **Do not build a fabric surcharge for a single-fabric catalogue.** The right
change is moving base prices in `catalog.ts` with `surchargeAed` left at 0.
`surchargeAed` earns its keep when organic cotton becomes sellable — and at
20 AED/m it arrives *cheaper* than linen, so it is a discount below linen, not a
supplement on top of it.

**The metre count matters more than the fabric price.** At 2.0m a 65% shirt is
471; at 2.5m it is 536. That is why Friday's per-design metre counts are the
most valuable number outstanding, and why the ladder is not being re-set today.

**Nobody is buying and nothing is promoted** (founder, 2026-08-26), so prices
can move freely right now. That stops being true the day the first campaign
runs.

**The 20% welcome offer was withdrawn the same day (founder, 2026-08-26).** It
will be **10% or nothing**. On real linen a 20%-off shirt earned 151 gross — 49
AED *underwater* against a pessimistic 200 CAC — so the old file's blessing of
it was computed on a fabric price that does not exist.

⚠️ **`WELCOME20` is DEACTIVATED in live Stripe, 0 redemptions ever.** Done via
the API with the live key read from Amplify and never printed; verified
independently afterwards with the read-only Stripe tool —
`GET /v1/promotion_codes?active=true` returns an empty list. **No active
promotion code exists.** A code is enterable on Shaklek's OWN checkout page,
which validates it against the API, so an active code is reachable by anyone
who guesses the word whether it is advertised or not. Do not leave one active
"for later".

**10% and the +49 are one decision, not two.** At today's prices a 10%-off
shirt is still −11 against CAC 200; at 438 it is +32. Taking the price rise and
keeping 10% beats leaving the price alone and offering nothing.

**Also corrected: `catalog.ts` restated the ladder in a comment** — "Shirt 390 ·
Skirt 420 · Pants 450 · Dress 620" — while the object three lines below it said
389/419/429/619, and the margin case was argued from the comment. The comment
now refuses to restate the numbers at all. `planning/marketing/meta-ads-setup.md`
listed WELCOME20 as live; corrected.


### Session H — self-hosting the fonts (2026-08-26) — DONE, no files held

Session G owns the typography *choices*; this changed only how those exact
fonts are DELIVERED. **Verified no visual change:** pixel diff of the phone
viewport before and after — 0.10% of pixels differ by more than 8, and **zero**
differ by more than 60. That is antialiasing on glyph edges, nothing else.

Founder reported latency again after the Clerk fix. Measured: the Google Fonts
stylesheet is **render-blocking, on a third origin, 357 ms TTFB**, and the
request asks for **15 font files / 245 KB**, including a Cormorant italic with
**zero uses anywhere in the codebase**.

`next/font/google` now downloads them at build time and serves them from our
own origin: no third-party DNS/TLS, no render-blocking external stylesheet.
**DOMContentLoaded 1595 ms -> 542 ms** on the same page.

Two things dropped because nothing used them: the Cormorant **italic** (grep: 0
italic classes) and Reem Kufi's **latin subset** — that face sets exactly one
thing, the four-glyph Arabic wordmark in the header, so its latin glyphs could
never render. It stays preloaded: the wordmark is above the fold on every page
and a swap flash on the brand name is not acceptable.

⚠️ **Bytes went UP slightly (420 KB -> 465 KB) while the page got much
faster.** Total transferred is the wrong instrument here — the win is removing
a blocking third-party round trip from the critical path, not shrinking the
payload. Do not "optimise" this back by chasing the byte count.

### Session F — save-measurements popup, catalogue CTA, linen-only MVP, Clerk perf (2026-08-26)

**Status: DONE, COMMITTED, DEPLOYED AND VERIFIED ON PRODUCTION.
No files held.**

Four commits: `426484b` measurements saving, `5efe983` linen-only + catalogue
CTA, `609bd1c` Clerk scoping, `5e973f8` architecture doc + monitoring.
Deployed in Amplify job **197** (which carried Session G's `fc8f6a6` on top).

⚠️ **I never actually ran `git push` — Session G pushed main and carried my
four commits with it.** `git push` answered "Everything up-to-date". Worth
knowing in a shared tree: your commits can ship on someone else's push, so
"committed but not pushed" is not a state you can rely on holding.

**Measured on production after the deploy: 705 KB -> 377 KB** on the home
page, DOMContentLoaded 2373 ms -> 1734 ms, and zero occurrences of "clerk" in
the served HTML. Clerk is still present on `/size-guide`, `/design/[slug]` and
`/checkout`, which is exactly the intended split. All 13 public routes 200,
`/account` correctly 307.

Committed at the founder's instruction while Session G was still writing, so
the Clerk-performance commit also carries **Session G's black-nav-bar rewrite
of `Header.tsx`** — the two edits landed in the same file and could not be
separated. Their sizing work (`SizePicker`, `DetailField`, `sizeChart`) went in
as its own commit, attributed to them.

Files that were held:

⚠️ **Renamed from "Session E" — the pricing session above claimed the same
letter on the same day.** Two blocks called Session E is exactly the collision
this file exists to prevent. Pick the next free letter, not the one you saw
last.

⚠️ **This session's additions to `planning/pricing-todo.md` were overwritten**
by that session's commits (`52ad109`, `5eab4ce`) — shared working tree, both
sessions editing the same file within the hour. **No loss worth recovering:**
their rebuild is on the same real quotes, corrects three things mine did not
(the ladder in that file never shipped, pants were 21 AED off, and the "fabric
is not the lever" line), and reaches the same conclusion about cotton landing
below linen rather than above it. They also deactivated WELCOME20 in live
Stripe, which is the action this session was blocked from taking. **The lesson
is the mechanical one: claim the file before editing, not after.**

**FABRIC WORK IS ON HOLD UNTIL FRIDAY 2026-08-28** (founder, 2026-08-26). She
has the real in-store quotes and the per-design metre counts arriving that day.
Her plan if both fabrics can be bought: **cotton keeps today's displayed prices,
linen goes to +49 AED per piece.** That is a price rise in `catalog.ts`, not a
`surchargeAed`, because linen is the only sellable fabric today and every live
price is already a linen price. The cotton entry in `src/data/fabrics.ts` is
kept and switched off rather than deleted, so Friday's restore is one flag.
**No price moved in this session and none should before Friday.**

- `website/src/components/SaveMeasurements.tsx`
- `website/src/components/CatalogCard.tsx`
- `website/src/components/LaunchOffer.tsx`
- `website/src/components/FabricColorPicker.tsx`
- `website/src/data/designSpec.ts`, `website/src/data/homeContent.ts`
- `website/src/app/faq/page.tsx`, `website/src/components/home/HomeFaq.tsx`
- `website/src/app/how-it-works/page.tsx`, `website/src/app/our-story/page.tsx`
- `website/src/lib/seo.ts`, `website/src/app/feed/meta.xml/route.ts`
- `website/src/lib/measurements.ts`, `website/src/components/MeasurementsForm.tsx`
- `website/src/app/api/account/measurements/route.ts`, `website/src/app/api/orders/route.ts`
- `website/src/data/fabrics.ts` (new), `website/scripts/test-measurements.mjs`
- `website/src/app/legal/terms/page.tsx`, `website/src/app/upload/page.tsx`,
  `website/src/app/upload/layout.tsx`
- `website/src/app/how-it-works/page.tsx`, `website/src/app/not-found.tsx`,
  `website/src/app/checkout/page.tsx`, `website/src/app/account/page.tsx`,
  `website/src/app/order-confirmed/page.tsx`
- `planning/aws-architecture-diagram.html`, `CLAUDE.md`, `.gitignore`
- **Clerk scoping — DONE, verified:** `website/src/app/layout.tsx`,
  `website/src/components/Header.tsx`, `website/src/components/AuthProvider.tsx`
  (new), `website/src/app/account/page.tsx`, and `layout.tsx` under
  `app/account`, `app/design/[slug]`, `app/size-guide`, `app/sign-in`,
  `app/sign-up`, `app/checkout`, `app/order-confirmed`, `app/dashboard`.
- `website/src/db/client.ts`
- `planning/pricing-todo.md`

#### The save button's popup was never missing. The save was.

The founder's report was "there is no pop-up". Clerk's modal opens correctly
and always did. **Two things behind it were broken, and both were silent:**

1. **`/api/account/measurements` never stored what the button sent.** The
   handler only ever read the field shape `{bust, waist, hip, height, notes}`.
   `SaveMeasurements` posts the FLATTENED string a cart line carries,
   `{measurements: "Bust / chest: 90cm, ..."}` -- so the body matched nothing,
   five empty columns were written, and it answered `{ok: true}`. The button
   then said "Saved. Next time these are filled in for you." Indistinguishable
   from success from the customer's side, and the reason nothing was ever
   pre-filled. The route now parses the flattened shape with the same
   `parseMeasurements` the tech pack uses. `scripts/test-measurements.mjs`
   asserts both body shapes reach the columns.

2. **Amplify sets `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/account`**, so
   completing the sign-up threw the customer off the design page to /account
   and the measurements held in a React ref died with the navigation. Verified
   in a real browser: `Clerk.buildAfterSignUpUrl()` returned
   `http://localhost:3311/account` while standing on /size-guide. `openSignUp`
   now passes `forceRedirectUrl: window.location.href`, which Clerk's own types
   say takes precedence over the environment variable. Belt to that braces: the
   numbers are parked in sessionStorage (`shaklek.pendingMeasurements.v1`,
   exported from `lib/measurements.ts`) and `/account`'s MeasurementsForm
   drains the same key, so the save lands wherever the flow ends up.

⚠️ **Do not read credential/config state out of a doc for this** -- the
redirect variable lives in the Amplify console and leaves no git trace. Same
trap as the Stripe key mode. Check it with `aws amplify get-app`.

**Could not complete a real sign-up end to end:** Clerk's modal carries a
Cloudflare Turnstile bot check, and completing one is off limits. Everything up
to that point is verified in a browser; the post-sign-up POST is verified by
unit test and by the redirect override being what Clerk's types document.

#### The tooltip

Founder's note: the sentence must appear on hover and on click, but must not
sit under the button as standing text. It is now an absolutely positioned
`role="tooltip"` above the button. Verified in a browser at both call sites
(design page and size guide): appears on `mouseover`, on `focusin` and on a tap
that cannot proceed, disappears on leave and the moment the numbers are valid,
and **layout shift is 0px** (measured against a following element and the
panel's own height).

#### Cleanup and documentation pass (same session)

**Duplicates removed.** Three macOS sync-conflict copies, each verified
byte-identical (or, for `fabrics 2.ts`, a stale copy of a file whose current
version is a strict superset) **before** deleting, and the original kept in
every case: `shaklek-spec-bc7bbb09 2.pdf`, `website/src/data/fabrics 2.ts`,
`website/scripts/social/encode 2`. Also 5 `.DS_Store` files, and
`website/.next/` which had accumulated six duplicated build directories and
**803MB** — wiped and rebuilt clean at 111MB.

**Two new gitignore rules**, both for things that were one `git add .` away
from being committed:

- `/shaklek-spec-*.pdf` — a downloaded tech pack. The filename carries an order
  id and the document carries **that customer's measurements**. ⚠️ One is
  sitting in the repo root right now. It is ignored, not deleted, because it is
  the founder's file.
- `website/scripts/social/encode` — an 88KB Mach-O binary compiled from
  `encode.swift`. Rebuild it, don't commit it.

**`planning/aws-architecture-diagram.html` rewritten.** It described a plan
from before launch and had been wrong for months. It named **Amazon RDS** (the
database is Neon), showed an **S3 bucket** (none exists), and drew **Gemini in
the live request path** called during a customer session (it is a build-time
tool on a laptop, and CLAUDE.md says plainly that zero AI runs in the product).
Every status was still "not deployed". The new version is checked against the
running system, marks the three errors as corrections rather than silently
fixing them, and adds the deploy traps, the security posture and a
"deliberately not built" section. **Rendered and read in a browser in both
light and dark before being called done** — the first two passes had colliding
connector labels that only showed up in the render.

**`src/db/client.ts` carried a comment saying "No RDS instance exists yet —
DATABASE_URL isn't set anywhere".** False since 2026-08-22 and actively
misleading about which database this is. Corrected.

`planning/aws-infrastructure-todo.md` was checked and is accurate — it already
says Neon-not-RDS and correctly marks S3 as not done. No change.

#### The reported lag is Clerk, not the images. Measured, not guessed.

The founder reported the site "lagging a lot" and proposed moving catalog
images to S3 + CloudFront to fix it. **It would have fixed nothing.**
`scripts/perf-check.mjs` against production, 390px, 4x CPU throttle:

    home page   705 KB across 43 requests, DOMContentLoaded 2373 ms
    design page 836 KB across 52 requests

**The six heaviest files on both pages are Clerk, totalling 356 KB** -- half
the home page. Catalog images are already WebP at 23-35 KB, already CloudFront
cache HITs (verified with `x-cache: Hit from cloudfront`), heaviest single
image 36 KB. HTML TTFB is 75-330 ms. **Images are not the problem and an S3
migration would have been a week spent on the wrong number.**

Cause: `src/components/Header.tsx` statically imports Clerk's `UserButton` -- a
UI component -- and the header renders on every route, so `@clerk/ui` (277 KB
across four files) ships to signed-out visitors who will never open it. Only
`clerk.browser.js` (79 KB) is needed to know whether someone is signed in.
**Not fixed yet**, and the lazy-load hypothesis is written up as a hypothesis:
the provider may pull that bundle regardless, so it must be tested before it is
believed.

This is the section-7 "pick the right instrument" rule paying for itself. The
script even exists because of a previous round of this -- its own header says
*"the site feels laggy is not actionable and guessing at causes has already
cost time here."*

**The obvious fix was tried, measured, and DID NOT WORK. Do not retry it.**
`Header.tsx` statically imports `UserButton` while only rendering it when
signed in, so splitting it behind `next/dynamic` looked like a 277KB win. Built
it, measured it: **740KB vs 738KB baseline. No change.** Reverted.

The reason, and this is the bit worth keeping: those files are **not in our
bundle at all.** `find .next -name "*clerk*ui*"` returns nothing. They are
fetched at runtime by Clerk's own `clerk.browser.js` from
`clerk.shaklek.com`, so nothing in our import graph can defer them, and
`@clerk/nextjs` v7 exposes no `clerkJSVariant` knob (only
`__internal_clerkJSUrl` / `__internal_clerkJSVersion`).

**The only real lever left:** `ClerkProvider` wraps the ROOT layout, so every
marketing page mounts Clerk. Scoping it to the routes that actually need auth
(`/account`, `/dashboard`, `/checkout`, `/cart`, `/design`, sign-in/up) would
take Clerk off the home page entirely. The cost is that `Header` calls
`useUser()` to show the signed-in avatar, so marketing pages would show a plain
sign-in link instead. **That is a product trade-off and the founder's call, so
it is not built.**

⚠️ **A measurement of mine was also wrong and is corrected here.** I counted
"137 images totalling 2,454 KB" on the home page and briefly treated it as a
scroll-weight problem. That was **every rung of Next's srcset ladder** (32w,
48w ... 3840w) summed together; a browser downloads exactly one rung per image.
The real figure is ~10 images, 4 eager and 5 lazy, and
`CatalogCardPhoto.tsx` already declares a tight
`sizes="(min-width: 640px) 248px, 220px"` so the browser picks w=256/384, not
w=3840. **Images are genuinely fine. Do not "optimise" them.**

#### Clerk scoped off the marketing pages — 738 KB to 310 KB

Founder approved the trade-off. `ClerkProvider` is out of the root layout and
mounted per-route by `src/components/AuthProvider.tsx`.

    home page    738 KB / 45 req  ->  310 KB / 30 req    (-58%)
    /our-story                        346 KB / 28 req
    /faq                              316 KB / 31 req
    /how-it-works                     226 KB / 24 req

Verified in a real browser, not inferred: on `/` **`window.Clerk` is undefined
and there are ZERO network requests matching /clerk/i**. Every Clerk file is
gone from the heaviest-resources list; the top item is now our own 65 KB chunk.

**The unlock was `Header.tsx`, which no longer touches Clerk at all.** It
called `useUser()` to choose between `<UserButton>` and a sign-in link, and
Header renders on all ten pages — so one hook put 356 KB everywhere. It now
renders a single unconditional person icon linking to `/account`, which is
correct for both states because `clerkMiddleware` bounces a signed-out visitor
to sign-in and lands a signed-in one on their orders.

⚠️ **Sign-out moved to `/account`.** It only ever existed inside the
`<UserButton>` menu, so removing that would have left customers with no way to
sign out at all — staff had their own button in the dashboard layout, customers
had nothing else. Easy to miss; check it survives any future header rework.

⚠️ **The dashboard layout needed the provider on BOTH branches.** Its
"you aren't on the staff list" refusal screen renders `<SignOutButton>`, a
Clerk component, so wrapping only the allowed path would have thrown for
exactly the person being refused.

**Routes that still mount Clerk**, and why: `/account`, `/checkout`,
`/dashboard`, `/order-confirmed`, `/sign-in`, `/sign-up`, `/design/[slug]` and
**`/size-guide`** — the last two both carry `SaveMeasurements`. The size guide
is easy to mistake for a marketing page; it is not.

Functionally verified in-browser after the change: size guide and design page
both load Clerk, fill measurements, open the sign-up modal, stash the numbers
and stay on the page. All 16 routes smoke-tested (`/account` and `/dashboard`
correctly 307 to sign-in while signed out). Full test suite green.

Note `SaveMeasurements` no longer renders by default on the design page — the
other session made **Standard** the default size mode in `351502e`, and it only
appears under Tailored. That is their change, not a regression; verified the
whole flow still works after switching to Tailored.

#### Monitoring — BUILT, verified end to end (was genuinely at zero)

Founder chose **hello@shaklek.com** as the alert address; subscription
confirmed. Full runbook in `planning/aws-infrastructure-todo.md`. Four alerts:
any 5xx, zero requests for an hour, p90 latency over 3s, and a failed Amplify
deploy. **~$0.30/month.**

Three things worth keeping from building it:

- **The zero-requests alarm needs `--treat-missing-data breaching`.** A totally
  dead site emits no metrics at all, so an error-rate alarm cannot see it. That
  flag is the difference between catching an outage and catching nothing.
- **The SNS topic policy is load-bearing and easy to forget.** Without explicit
  publish statements for `events.amazonaws.com` and `cloudwatch.amazonaws.com`,
  every alarm and rule fires into a void while the console shows everything
  configured. Check it first if alerts go quiet.
- **The event pattern was tested BOTH ways** with `aws events
  test-event-pattern` — matches FAILED, does not match SUCCEED. A rule that
  silently matches everything is worse than no rule, and a rule that matches
  nothing looks identical to a healthy site.

Sentry is deliberately not done: it needs an account, which is the founder's to
create. Everything else is wired.

#### (superseded) Monitoring was genuinely at zero

Verified against the account: **zero CloudWatch alarms, zero SNS topics.**
Cheapest path, in order: Amplify's built-in per-branch build notification
(`update-branch --enable-notification`, free) covers the silent-failed-build
case alone; CloudWatch alarms are $0.10/alarm/month with SNS email free for the
first 1,000/month; Sentry's free tier for application errors, because an alarm
says the 5xx rate moved and not which line threw. Roughly $0.50/month total.

#### Founder's re-ranking (2026-08-26)

Upload demoted from P0 -- **`/upload` is linked from nowhere**, so it is not a
funnel she is running. It does still return 200 and sits in `sitemap.ts` at
priority 0.8, so the cheap fix is removing it from the sitemap rather than
building object storage for a page nobody is sent to. Order-status emails and
Tabby/Tamara moved to P3 at her call (large brands go quiet between purchase
and shipping too). Conversions API approved. Rate limiting approved if cheap --
Upstash free tier, not AWS WAF at ~$8/month. S3 for catalog images kept, but
**re-argued on the 230MB build cap and cache-busting, not on latency.**

#### Two things the architecture pass turned up

**1. The customer's uploaded reference photo is lost on every paid order.**
`/upload` invites a sketch or a screenshot. `order_items` stores only
`hasReferenceImage: boolean`; the image is never persisted. The stylist email
is built FROM THE DB ROWS in the Stripe webhook, and the attachment code in
`orderEmail.ts` only runs on the fallback branch that fires when Stripe is NOT
configured -- which in production is never. **A customer can pay for a design
based on their own picture and the tailor receives a checkbox.** Not fixed
here: it needs object storage and it touches the payments webhook. Written up
as P0 in the architecture doc.

**2. "The apex domain 404s" is false and had been copied forward for days.**
`curl` says `shaklek.com` returns **301 → https://www.shaklek.com/**. It was in
CLAUDE.md, and I repeated it into the new architecture doc without testing it
before catching it on a later pass. Both corrected. ⚠️ It is the same failure
mode as the credential warning at the top of CLAUDE.md: infrastructure state
lives outside git, so a sentence about it goes stale silently. **Test the claim,
do not inherit it.**

The architecture doc now carries a ranked **"What to build next"** section --
P0 the lost reference photo, P1 no error monitoring / the 230MB build cap
(463 files, 38MB today) / per-container rate limiting, P2 Conversions API and
customer status emails, P3 unverified Neon backups and Resend domain auth.

#### The security agent found one thing, and it was real

`shaklek-security` reviewed the diff. One Low, no Critical/High/Medium, and the
Low was worth fixing before it shipped:

**The pending stash had no expiry and was only cleared after a successful
save.** Abandon the sign-up modal and one person's measurements sat in
sessionStorage for the life of the tab. On a shared browser -- a family iPad, a
shop display -- the next person to sign in had those measurements silently
POSTed onto THEIR account, over their own, with no UI beyond the word "Saved".
Both directions bad: A's PII to B, B's tailoring data clobbered.

Fixed: the stash now carries a timestamp, expires after 15 minutes, refuses a
clock that has moved backwards, deletes anything unparseable, and is cleared
whenever a page carrying the save button loads while signed out with no sign-up
in flight. Key bumped v1 -> v2 so an old bare-string entry cannot be adopted.
`scripts/test-measurements.mjs` asserts all of it -- **if those go red the hole
is back.** Verified in a real browser too: a planted stash is gone after
landing signed-out on any page with the button.

What the agent cleared, so it does not need redoing: the flattened body cannot
bypass the `boundedText` caps (30,000-char value still sliced to 20),
`parseMeasurements` is linear on hostile input (31KB of commas in 4ms, no
ReDoS), `customers.measurement*` has no reader outside its own route,
`resolveFabric` can only return a member of the closed union and actually
*removes* a free-text path into the order email, and `forceRedirectUrl:
window.location.href` is same-origin by construction so it is not an open
redirect.

One pre-existing note it raised, NOT introduced here: `rejectOversizedBody`
trusts `Content-Length` only, so a chunked body with no declared length passes
that gate. Its own comment already admits this. Unchanged by this work.

#### Every "go to the catalogue" button now goes to the catalogue

`/our-story` and `/size-guide` already pointed at `/#catalog`. Six more did
not, and three of them were labelled "Back to catalog" while landing on the top
of the home page: `/how-it-works` ("Start with a piece"), `/checkout` empty
state, `/account` empty state, `/not-found`, and both on `/order-confirmed`.
Also the launch-offer dialog's "Start designing", which only closed itself.
The Header logo and the dashboard's "Back to site" deliberately still go to "/".

#### Linen-only MVP

`src/data/fabrics.ts` is new and is the single place that says which fabrics
can be made. `FabricColorPicker` renders a two-button toggle only when more
than one is `available` -- today it prints "100% linen" plus "Organic cotton
coming soon", and flipping one flag in fabrics.ts turns the toggle back on.
`resolveFabric()` pins the stored value server-side in `/api/orders`, the same
rule as price: a request body cannot name a fabric we cannot cut.

**Eleven files of copy were narrowed from "organic cotton and linen" to
linen.** This includes the VALUES entry on the home page and the Meta product
feed's `<g:material>`. It was going to be false the moment the first order was
placed. ⚠️ The founder's own brand definition line quoted in `homeContent.ts`
says "organic cotton or linen"; the comment there now carries the reason the
fabric half is ahead of the supply, and says to put cotton back the day
fabrics.ts marks it available.

#### Pricing

`planning/pricing-todo.md` has a new 2026-08-26 section. Headline: **the MVP
does not need a linen surcharge -- the discount was the problem, not the
fabric.** At her real quotes with the offer off, the shirt clears 58-64% GM and
+93 to +227 against estimated CAC. The stale "fabric is not the lever"
conclusion at the top of that file is struck through: at 30-40 AED/metre fabric
now costs more than the tailor.

⚠️ **WELCOME20 is still live in Stripe** (0 redemptions, expires 2026-11-23).
Nothing on the site advertises it, but the checkout has a promo box. Awaiting
the founder's yes before deactivating it -- that is a live payment-system
change.

### Session C — overnight social content (2026-08-25 night)

**Status: DONE. No files held. Nothing posted, nothing scheduled, nothing
deployed. No API spend.**

#### The brief had a trap in it, and it is the main thing to read

The founder asked for a "kinda chic" campaign with lines like *"kinda chic to
customize your own shirt"*. I researched the format before writing.

**It is not a product format.** It began April 2026 as a body-positivity and
wellbeing format: describing deliberately UNglamorous things as chic, explicitly
instead of luxury. Soft yellow caption. Drew Barrymore's was "Kinda chic to be
in your 50s". Others in the wild: "Kinda chic to repeat outfits", "Kinda chic to
cheer on other women".

Every one of the brief's example lines is a product feature. Posted as written,
that is a brand taking a body-positivity format and turning it into an ad, on a
trend whose entire charge comes from refusing the flex.

**There is a fit, and it is stronger than the product angle.** Shaklek's real
proposition is clothes cut to the body you have instead of you being sorted into
someone's size chart. That is a body-positivity statement that is also true of
the product. All copy is written from there. `planning/marketing/kinda-chic.md`
carries the lines, the rejected ones with reasons, and the Meta organic-only
marking per line.

**This is the founder's call, not a Claude decision.** Both sets are written up.

#### Shipped to disk

- `brand-assets/INSTA/kinda-chic/` — 20 stills, 10 lines x IG 4:5 and TikTok 9:16
- `brand-assets/INSTA/VIDEO-9-structured-recut.mp4` — 18.3s
- `brand-assets/INSTA/VIDEO-10-what-if-recut.mp4` — 24.6s

⚠️ `brand-assets/` is gitignored. **These exist on disk only** and cannot be
recovered from git. The builders are committed, so they can be regenerated.

#### The reels, against her notes

`VIDEO-9`: all four sleeve/length cuts now visible and distinct, the zoom out
switches to the banded trousers look rather than the plain one, colourway change
kept, and the three colour "what if you were the designer" panel added.

`VIDEO-10`: her note was *"you did not show the right parts of the images"*.
The old cut used one crop for the whole reel, so it announced a sleeve change
and then showed a frame where nothing moved. Each section now crops to the part
of the body it is about.

#### The rule that came out of tonight, now in scripts/social/README.md

**The crop follows the subject, not the flattery.** It bit three times in one
night, in both directions: a single flattering crop hid the sleeves and legs in
the reel, and a 4:5 crop tuned for a blouse sliced a trouser model's head in
half in the stills. Sleeves crop to the arms, hems to the hem, legs to the legs.

`kinda-chic.mjs` also lints every caption for em dashes, "photograph" and "AI"
and refuses to render rather than trusting whoever writes the copy. Those three
are founder corrections, relayed by Session D, not style preferences.

#### Verified, not assumed

Session D renamed 113 catalog files to `.jpg` mid-session. The tech pack
resolves flats by constructed filename and reads catalog images through pdfkit,
so I checked rather than hoped: `test-flats` 64/64, `test-techpack` green, every
`catalog.ts` reference resolves, against `f6196d3`.

### Session D — catalog reframe + Meta ads prep (2026-08-25)

**Status: DONE. All committed, deployed and verified on production. No files held.**

- `website/src/data/catalog.ts` (image path references only)
- `website/public/catalog/utility-shirt/`, `website/public/catalog/wrap-top/`
- `website/scripts/catalog/{gen-verified,edit,edit2}.mjs` (API key moved to a header)
- `website/package.json` (wiring verify-catalog into the build)
- `catalog-archive/2026-08-25-reframe/` (new)

Do not run `git add website/public/catalog/` while this is open -- it would
swallow another session's uncommitted work in that tree. Stage explicit paths.

**Catalog: every image is now 2:3.** 252 referenced images between 0.666 and
0.685, from 23 distinct pixel sizes and a 0.667-1.390 range that morning.
Utility Shirt was landscape throughout and Wrap Top mixed four ratios, so its
preview box resized while the customer moved the sliders.

CROPPED, not padded. Padding adds a band in a sampled backdrop colour that
does not match the studio white, and a release review measured it would also
leave 41% of the home-page card empty (the card is `object-cover` in a 3:4
box). Cropping only ever removes backdrop.

⚠️ **The subject-width instrument saturates on the studio backdrop gradient**
and reported all 56 images as clipping the subject. It is wrong. Every batch
here was verified by eye on a contact sheet, which is what section 4b says is
the only reliable channel. Do not trust that measure.

**Wrap Top's 8 "normal length" backs were a POSE defect, not a framing one** --
over-the-shoulder close-ups, hand to hair, with the hem not in frame. Moving
the Length slider on the back view changed the pose instead of the length.
Each replacement was derived from that colour's approved LONGER back by
shortening the hem, so model, pose and backdrop match by construction. Same
prompt, only the colour word changed. **5 Flash generations, no Pro, ~$0.20.**
`colorImages[c].back` and `comboImages[c]["long:normal"].back` depict the same
combination and now share one file, which is why the check reports 252 paths
rather than 256.

**113 files now carry a true .jpg extension.** The deployed optimizer picks its
output format from the extension, not the magic bytes, so a client without webp
was served **248,667 bytes of PNG** where a webp client got 18,390. Measured on
production, before and after: 9.4x smaller. Renaming was already required for
cache-busting, so this cost nothing. **Any future image rename should use .jpg,
not the old JPEG-under-.png convention.**

⚠️ **`npm run build` now runs `verify-catalog.mjs` first.** A catalog.ts entry
pointing at a missing file used to build GREEN and deploy broken images -- Next
does not validate image paths and there is no `onError` on any catalog image.
It exits 1 now. It caught a real mistake within the hour (a `-v4`->`-v5` bump a
glob missed).

**Four reviews were run before the image work and they did not agree.** Fable
argued me out of a $4-8 plan to regenerate 64 images as full-body: the items
use visibly different models, so cross-item uniformity was unachievable, and
64 independent lower-half inventions is the exact anti-pattern section 3
exists to prevent. Actual spend: ~$0.20. Performance separately vetoed padding
and measured CLS at 0.0000 everywhere -- standardising the ratio has ZERO
performance benefit and is a brand fix only.

### Meta ads preparation (same session)

Full checklist: `planning/marketing/meta-ads-setup.md`.

**Everything ships INERT.** Without `NEXT_PUBLIC_META_PIXEL_ID` no script
loads, no cookie is set, nothing reaches Meta. Enabling ads is an Amplify
environment variable plus a redeploy, not a code change.

⚠️ **The CSP was the silent blocker.** `script-src` had no
`connect.facebook.net`, `connect-src` had no `www.facebook.com`. The pixel
would have loaded, fired nothing, and reported zero conversions with no
visible error. Added and verified in a real browser: fbq defined, Meta's
library fetched, **0 CSP violations**, and `unsafe-eval` still absent from the
production header.

Events verified end to end against a production build: ViewContent, AddToCart
(not on edit), InitiateCheckout, Purchase. **Purchase is guarded in
localStorage by order id** -- the confirmation page polls up to five times and
a refresh or return visit would each count again.

**No PII leaves the site.** Verified by typing an email into checkout and
confirming it appears in no payload. Advanced Matching is OFF deliberately.
`track()` cannot throw; it sits on the add-to-cart and pay paths.

⚠️ **The privacy policy is tied to the same env var as the pixel.** It claimed
"no advertising trackers" in two places, which would have become false the
moment ads went on. **If Advanced Matching or CAPI is ever enabled, the
paragraph about not sending personal data STOPS BEING TRUE and must be
rewritten first.**

Product feed at `/feed/meta.xml`: 32 entries, one per item and colour, built
from catalog.ts. All 96 URLs in it fetched as Meta's crawler, zero failures.

**Conversions API deliberately NOT done** -- it means editing the payments
webhook, the AED 5 blast radius, and should not happen unreviewed overnight.
Biggest remaining accuracy win before scaling spend.

**Ad policy, from Session C:** Meta rejects creative implying knowledge of a
viewer's body. `h01` and `h03` in social-playbook.md are organic-only;
`h01ad`/`h03ad` are the ad-safe rewrites.



### Session D — reviewer feedback: home page, voice, colour dots (2026-08-25)

**Status: BUILT AND VERIFIED, NOT COMMITTED. Holding these files:**

- `website/src/components/CatalogCard.tsx`
- `website/src/app/page.tsx`
- `website/src/app/our-story/page.tsx`, `website/src/app/faq/page.tsx`
- `website/src/app/how-it-works/page.tsx`
- `website/src/app/size-guide/page.tsx`, `website/src/app/shipping/page.tsx`
- any new component under `website/src/components/home/`
- `website/src/data/homeContent.ts` (new)
- `website/src/components/DesignCustomizer.tsx` (URL handoff for slider choices)
- `website/src/app/preview/` (new, dev-only variant comparison)

No overlap with Session C's tech-pack files. Source: two outside reviewers'
feedback relayed by the founder, 2026-08-25. `npm run build` passes;
`npx tsc --noEmit` clean.

The feedback was ~14 separate complaints that collapsed into three problems.

**1. Colour dots navigated away instead of changing the photo.** Every dot on a
catalog card was a `<Link>` to `/design/<slug>?color=`, so four colourways were
on screen and none could be SEEN without committing to a product page first.
Now the dot swaps the photo in place and the picture links through carrying
whatever colour is showing. New `CatalogCardPhoto.tsx` is the client half;
`CatalogCard.tsx` stays a server component deliberately, because a client
boundary there would serialise every `comboImages` path (24+ per item, 8 items)
into the payload of the page most of this brand's traffic loads on a phone.
Colours nobody taps are never downloaded.

Verified in real headless Chrome at 390px, 8/8: stays on the home page, exactly
one photo visible, it is the navy file, it changed, the right dot reads pressed,
only one pressed, the link gained `?color=Navy`, untapped colours not fetched.
Then the handoff itself: `/design/oversized-shirt?color=Navy` hydrates with the
navy photo and the Navy control pressed. Script kept at
`scratchpad/check-dots.mjs` (scratchpad dies with the session — move it into
`scripts/` if this needs re-running).

**2. The home page never said what Shaklek is.** It was a hero and a carousel.
A visitor could not tell what the site was, what they were about to do, what
the steps were, or why this was not just another linen shop.

⚠️ **A first attempt got this wrong and the founder corrected it.** It pasted a
reviewer's suggested slogan into the hero VERBATIM, displacing her own line.
The reviewers found real problems; the fix is those problems answered in
Shaklek's voice, not the reviewer's wording. Her correction, kept here because
it is the brand definition: *"timeless fashion essentials. This is the brand,
this is our niche. People need to understand that these are fashion essentials:
timeless, elegant, customizable, very skin-friendly, organic cotton or linen."*
The hero subtitle is hers and has now been restored twice. **It is not a copy
improvement target.** All home copy is in `src/data/homeContent.ts` with that
warning attached.

**Three layouts were built to compare, not one to accept.** `/preview/a`,
`/preview/b`, `/preview/c` in development, with a switcher bar. They share the
same copy module, so comparing them compares layout and not two different sets
of words. Dev-only: `notFound()` unless NODE_ENV is development, **verified
against a real `next start`** (home 200, all three preview routes 404, absent
from sitemap.xml) — not assumed, because a crawlable second copy of the home
page would be an SEO problem.

Measured on a true 390x844 viewport, where the first product card lands:

    A "Explained"      y=946   below the fold, no demo
    B "Least friction" y=770   VISIBLE on the opening screen   <- live on /
    C "Show, don't tell" y=1748  far below

**B ships** because it is the only one where a garment is on screen at load.

**The demo is the piece worth keeping** (bottom of B, top of C). A real
Oversized Shirt on the home page with a sleeve toggle and the four colours;
tapping swaps to the real photograph of that combination, because all eight
already exist. It demonstrates the one claim that matters and is least
believable — every option is a real photograph — instead of asserting it, and
it REMOVES a step: the choice travels to the design page.

`DesignCustomizer.tsx` was extended to accept render-slider values in the URL
(`?color=Burgundy&sleeve_length=short`). Nothing trusts the URL: values are
matched against each slider's own option list, unknown values fall back to the
default, and **premium sliders are excluded on purpose** so a hand-typed URL
cannot unlock Shaklek+ options. Verified: valid combo resolves to
`oversized-shirt-burgundy-combo-short-normal-front.png`; `sleeve_length=banana`
and `color=NotAColour` both fall back cleanly.

**The funnel is 3 steps + an outcome, and the 3 is load-bearing.** The design
page prints "Step N of 3" (`TOTAL_STEPS` in `DesignCustomizer.tsx`). The first
draft of the home funnel announced four, so the site contradicted itself about
the single thing the visitor was trying to learn. What the tailor does is now
rendered as "Then", not "04" — real, on the page, but not a step the customer
takes. **If TOTAL_STEPS ever changes, homeContent.ts must change with it.**

Also: the product rail subtitle now reads "Tap a colour to see it on the
piece", which teaches the new colour dots exactly where they are, at zero
vertical cost.

Browser-verified, 6/6: the demo starts on the ivory base photo, preloads all 8
combinations on idle, Short swaps to the short-sleeve photograph, exactly one
image visible, Burgundy swaps correctly, and the CTA carries both choices.

**3. It read as AI-written, and said "AI" out loud.** Removed the claim on
/our-story that "we use AI to plan exactly what's needed instead of guessing at
demand" — off-brand per the reviewer, and **also simply false**: CLAUDE.md
states zero real AI exists in the product. Removed the defensive "there is no
AI deciding anything about your garment" from /faq. Every rendered em dash on
the six customer-facing pages is gone (a reviewer: "ça fait très texte généré
par l'IA"); verified by stripping tags from the served HTML, all six 200 and
clean. SEO title separators (`Shaklek — tagline`) were left alone on purpose —
that is a title convention, not prose.

**The founder rewrote her own note** and it is used verbatim (diffed against her
text: exact match, 1330 chars). Two things not to "improve" back: she removed
the naming of her own medical conditions from the opening line, and she KEPT the
technology framing after a reviewer argued for dropping it — the reviewer's
actual objection was the word "AI", which is now gone sitewide. She typed "192
different ways"; the code keeps `{SHIRT_WAYS}` computed from
`parameterSliders.ts`, which evaluates to 192 today, because that sentence has
already gone stale twice with a number typed into it.

**Not done, still open:**

- **Reduce clicks to purchase** — the reviewer's "plus tu rajoutes des cliques,
  plus tu décourages le client à faire l'achat" cuts against the 3-step stepper
  Session B shipped in `33deaf3`. Not touched; wants the real flow walked first.
- **Maternity as a market** — the reviewer's strongest idea (bodies change
  monthly, made-to-measure plus 10-day turnaround plus loose cuts). Founder's
  call, not a code task.
- **Catalog cards still use `object-cover`** in a 3:4 box, so tall garments are
  cropped — the same defect fixed on the customizer on 2026-08-24, still live on
  the home page. Out of scope for this batch and NOT part of the feedback.
- **The mobile customizer sticky preview.** The founder tested on a real phone
  and judged it fine, so it was dropped from the list. Note the `sticky
  top-[98px] z-10` with `lg:static` at `CustomizeParameters.tsx:100` still means
  the phone layout pins the photo over a single column of controls. If the
  complaint recurs, that is the line.


### Session C — spec sheet -> real tech pack (2026-08-24)

**Status: BUILT AND VERIFIED, NOT COMMITTED. Holding these files:**

- `website/src/lib/techPack.ts` (new -- the document itself)
- `website/src/app/api/dashboard/orders/[id]/spec-sheet/route.ts` (now auth + DB only)
- `website/src/lib/measurements.ts` (new -- extracted from SizePicker)
- `website/src/components/SizePicker.tsx` (imports the extracted module)
- `website/src/data/construction.ts`, `website/src/data/flats.ts` (new)
- `website/src/app/dashboard/orders/page.tsx` (copy: "spec sheet" -> "tech pack")
- `website/scripts/catalog/{gen-flat,run-flats,audit-flats,contact-sheet}.mjs` (new)
- `website/scripts/{render-techpack,test-construction,test-measurements,test-techpack,test-flats}.mjs` (new)
- `website/public/catalog/flats/` (new, 60 files, 3.7MB)
- `catalog-archive/2026-08-24-flats/` (new, 8 rejected generations)

Founder decision: **every design shows both the photograph and a technical
flat**, "as reliable as possible".

**What the document gained.** Standard sizes print the real bust/waist/hip and
EU/UK/US from `sizeChart.ts` instead of the bare letter "M" -- the weakest line
on the old sheet, since it assumed the tailor already knew Shaklek's M.
Identical order lines group as `CUT 3` rather than printing the same page three
times. Premium slider choices (pocket count, closure) reach the tailor at all
for the first time -- they were committed at their defaults and shown to
nobody. Bill of materials with a printed colour chip. Making-standard and
sign-off fields as ruled blanks.

**Nothing is invented.** No seam allowance, stitch density or tolerance is
stated, because Shaklek has no house standard for them; they print as blanks
for the workshop to fill and return. `scripts/test-techpack.mjs` asserts that
no such number ever appears. Same reasoning as the provenance warning at the
top of `sizeChart.ts`, whose "body, not garment" caveat is now printed on every
measurement page.

### The flats -- all 64 done

One flat per (item, combination, view), generated from the **Navy** photo of
that exact combination. Colour is not part of the key: a line drawing has no
colourway, so this was 64 images, not the 256 the photography needed. The flat
is looked up with the same `comboKeyFromLabels()` as the photograph, so the two
on a page cannot disagree about what was ordered.

**Cost: ~$2.65 for 68 Flash generations. Zero Pro escalations** -- Flash draws
flats reliably, unlike the silhouette reshaping in section 4b.

**Complete: 64 of 64.** Two Banded Trousers flats were generated, inspected,
found wrong and archived rather than shipped (see the defect notes below), then
regenerated against the corrected prompt and verified. The tech pack still
carries the missing-flat warning for any combination that lacks one -- it just
has nothing to report today.

**Credit ran out three times** during this work. `run-flats.mjs` regenerates
only what is missing, so re-running it after a top-up is always safe and never
repeats paid work. A 429 is not billed, so failed retries cost nothing. Top-ups
at https://ai.studio/projects.

### Two defect classes no image check could see

**A flat can draw the wrong garment.** `banded-trousers straight:cropped back`
came back with a whole peplum top -- sleeves and all -- above the trousers.
Faithfully: **every Banded Trousers photograph has the model wearing that top**,
and nothing in the prompt said to ignore it. A second garment is achromatic, on
white, symmetric, and sits in the normal ink band, so all four image checks pass
it. Only words fix this, and the prompt now carries an explicit "draw ONLY the
trousers / ONLY the upper garment" clause for both categories.
`scripts/catalog/detect-extra-garment.mjs` finds it geometrically -- a trouser
alone never pinches in at the waist, a trouser under a top does. It swept all 32
and found exactly the one already spotted by eye.

**The advisory proportion numbers caught a true positive that was dismissed.**
The "cropped is longer than full" flag on that same flat was real -- the extra
top made the drawing taller. It was written off as instrument noise. The lesson
is not to re-add a hard gate (three rulers were tried and all three disagree),
it is that a flagged pair has to be looked at before it is dismissed.

### What the verifier had to learn -- read before generating more flats

`gen-verified.mjs` cannot check a flat: its two tests are colour drift and
greyscale pixel-diff, and a flat is deliberately achromatic and deliberately
enormous-diff. `gen-flat.mjs` uses four independent tests instead -- achromatic,
white border, ink coverage, bilateral symmetry.

**A grey-filled drawing passes every test except ink.** Four flats came back as
solid grey silhouettes rather than outlines; fill has no saturation, so the
achromatic check is blind to it. The original `inkMax` of 0.35 was picked in the
abstract and let them through. Real line art clusters at **1.6-4.3%, median
2.3%**, so the ceiling is now 0.08, set from 64 observations. Those four were
archived, not deleted, and regenerated.

**Proportion measurement was tried three ways and gates on none of them.**
height/frame (each flat fills its own canvas, so size is a framing choice),
height/width (conflates length with the leg-width option), height/hip (the hip
band lands on waistbands and pockets, and reported cropped as 44% *longer* than
full). Checked by eye against the source photographs: pairs the second ruler
failed were correct. `audit-flats.mjs` therefore prints numbers and exits 0 --
a check that cries wolf gets ignored when it is finally right. The real
verification is `contact-sheet.mjs` plus eyes, which is what section 4b already
says about pale images, and a line drawing on white is the palest case there is.

**Three pairs are still flagged for a human look**, all trousers, front wide
cropped-vs-full on Wide-leg and Banded, plus Banded back straight. Wide-leg's
was inspected against its source and looked right.

### Adaptive Pricing — pinned in code, and the log entry was wrong

The standing note said Adaptive Pricing was **ON in the sandbox**. Verified
against the Stripe API on 2026-08-24: **it is off, and was already off.** A
Checkout Session created in the sandbox without the flag comes back
`adaptive_pricing: {enabled: false}`, and the field is responsive — asking for
`enabled: true` returns true — so that is the real account setting, not an
uninformative default. Exactly the "never read config state out of a doc"
failure CLAUDE.md records for credentials, in a second place.

`/api/orders` now sets **`adaptive_pricing: { enabled: false }`** explicitly on
every Checkout Session. The API default IS the Dashboard toggle, which means the
currency a customer is charged in otherwise depends on a checkbox that leaves no
git trace, differs per account, and nobody reviews. Stated in code it is
identical in every environment and a change to it is reviewable. Shaklek prices
and settles in AED; Adaptive Pricing would present a converted price with a 2-4%
conversion fee paid by the customer.

⚠️ **This touches `/api/orders`** — the handler with the AED 5 history. It is one
added field that only restricts behaviour, and `test-promo-discount` and
`test-quantity` both pass, but CLAUDE.md section 0 asks for the security agent
before anything in that blast radius ships. Not run.

### Fixed: `scripts/test-quantity.mjs` was failing on a stale number

Pre-existing, unrelated to this session's work. The assertion hardcoded
`price === 450`; the catalog was repriced to 429 in `3f2969e` and the test was
never updated, so it had been reporting `1 FAILURE(S)` while the security
property it guards — a tampered body price losing to the catalog — was fine the
whole time. It now reads the price from `catalog.ts`, so it cannot go stale
again. A money test that cries wolf is a money test people stop running.

### Security review — run, clean, and what it proved

`.claude/agents/shaklek-security.md` was run over the whole changeset on
2026-08-24, as CLAUDE.md section 0 requires for anything touching `/api/orders`.
**No Critical, High or Medium findings. Verdict: safe to ship.**

It disproved risks by executing them rather than reading for them, which is
worth copying:

- **Path traversal via `item.changes` is impossible, demonstrated.**
  `comboKeyFromLabels("Pants", ["../../.env.local"])` returns `straight:full`.
  Customer labels only *select among* `param.options`; the key is built from
  fixed option values and never from label text. Prototype keys
  (`__proto__`, `constructor`) fall back to the catalog default.
- **`/api/orders`** is one added field; every guard intact and `unit_amount`
  still server-only. The webhook interaction is *favourable*: with adaptive
  pricing off `session.currency` is guaranteed `aed`, so the unexpected-currency
  fallback becomes dead code.
- **Spec-sheet authorization is byte-for-byte preserved** through the extraction.
- **No PII**: `buildPdf` receives only `{id, createdAt, items}`; the route joins
  `customers` and passes none of it.

Two Low findings, both fixed here:

- The **Gemini API key was in the URL query string** (`gen-flat.mjs`). It bills
  real money and a URL reaches proxy logs and pasted errors. Now sent as
  `x-goog-api-key`; header auth verified, and one real generation confirmed the
  POST path rather than assuming it.
- `test-quantity.mjs` had an **unguarded `catalog.find`** — a renamed slug would
  crash with a TypeError instead of naming the problem. It now throws.

⚠️ Commits `813339f` and `c135402` landed mid-review and are **not covered**.

### Handed to this session, NOT done -- both need a decision first

The concurrent session passed over two items. Neither is guessable, so neither
was touched:

1. **The "No measurement needed. Want a more precise fit? Switch to Tailored
   above." line** (`SizePicker.tsx:207`). Held here for the tech-pack
   extraction, so handing it over was right. What was NOT said is what to change
   it to. Note the real defect while deciding: **the same instruction appears
   twice in the same branch** -- `SizePicker.tsx:196`, inside the collapsed size
   chart, already says "Between two sizes, or not close to any of them? Switch
   to Tailored". One of the two should go; which one is a copy decision.
2. **"Picture sizing"** on the design page -- entirely unspecified. Possibly the
   standing `catalog-images-todo.md` item about the eight source images being
   eight different aspect ratios, which `object-contain` currently works around.

⚠️ **Another session had six files STAGED in the shared index** while this work
was committed (`cart/page.tsx`, `checkout/page.tsx`, `CheckoutForm.tsx`,
`CustomizeParameters.tsx`, `DesignCustomizer.tsx`, `parameterSliders.ts`) --
their undeployed batch. This commit used `git commit --only <paths>` so none of
it was swept in. The reverse already happened once today: this session's log
section was committed inside `e561249` by whoever ran `git add planning/session-log.md`
while it was dirty. **`git diff --cached` before every commit in this repo.**

### De-branded and trimmed -- founder decisions, 2026-08-24 (second pass)

**No brand anywhere on the tech pack.** *"They only make the pieces, they don't
have to get access to the idea."* No wordmark, no company name, and the
reference lost its `SHK-` prefix -- it is now just the order id's first 8
characters, which identifies the order to us without naming us. Body copy that
said "goes through Shaklek" now says "back to whoever gave you this document".
Filename is `techpack-<id>.pdf`.

**PDF metadata is pinned blank too.** It travels with the file, nobody sees it
on screen, and defaults are exactly how a name creeps back in later.
`scripts/test-techpack.mjs` fails if any brand string reappears in the rendered
text *or* the metadata.

What this does and does not buy: it stops the *document* identifying Shaklek if
it is forwarded, subcontracted, or left on a bench. It does not make us
anonymous to the tailor -- we pay them and we send it from our own number.

⚠️ **`dashboard/orders/page.tsx:29` still says "Shaklek order ..." in the
WhatsApp handoff message.** Same disclosure surface, deliberately left: the
founder is sending it from their own number, so it is arguably fine. Flagged,
not changed.

**The 11 ruled blanks are gone.** Thread, buttons/zip, interfacing, labels,
seam allowance, hem allowance, stitch density, tolerance, and the three sign-off
lines. They asked the workshop for data Shaklek does not hold, on every order,
forever -- and no tailor ever asked for them. They were this session's design
idea, not a requirement. The pack is now only what to make, from data actually
collected. The "never print an invented seam allowance" assertion was KEPT and
widened to stitch density: with the prompt to supply a real standard gone, the
risk shifts from "empty line" to "someone helpfully fills in a plausible one".

**No cover page on a single-spec order.** Its index would list one item and the
next page would repeat every word of it. The reference instruction and the
no-identity statement move to the foot of the spec page. Multi-item orders keep
the cover, where an index earns its page. One tailored garment: 3 pages -> 2.

### Two layout bugs, both found by dumping text per page rather than looking

Worth copying as a technique -- neither was visible in a thumbnail:

- **The customer's own instruction was orphaned.** "CUSTOMER REQUEST" sat at the
  foot of one page and their words landed alone on the next, because `section()`
  drew its heading before checking anything fit beneath it. It now takes a
  `needs` height and moves the whole block together. Of everything on the page,
  the customer's words are the worst thing to strand.
- **The standard-size provenance caveat printed on tailored orders**, where the
  numbers came off the customer's own body -- small print about published market
  charts, about something not on the page. Now conditional.

Also: `test-techpack.mjs` matched prose with `includes()`, so a sentence that
WRAPPED in the PDF failed the assertion for a line break rather than for missing
text. Phrase checks now collapse whitespace first.

### Text was being clipped off the page -- and no content test could see it

Founder pasted a mangled paragraph from a real order (`4B1E715E`): *"Apply the
hoThe figures are consolidated ... where they disagworkshop's own block"*.

**The text in the PDF was correct the whole time. Only its origin was wrong.**
The measurement rows draw at `left + 118`, and the caveat below them passed only
`{ width }` with no x -- so it inherited `doc.x = 158`, and with `width: 515` on
a 595pt page every line ran ~78pt past the right edge and lost its tail.

This is why it survived a content assertion suite: `test-techpack.mjs` checked
what the PDF *said*, and the PDF said the right thing. The check that catches it
measures geometry -- it parses each text run's `Tm` x and `Tf` size, measures the
string with pdfkit, and fails if `x + width` crosses the right margin. Verified
by reintroducing the bug: it flagged both lines with their coordinates.

All small print now goes through one `para()` helper that always anchors to the
left margin, so a fourth call site cannot repeat it. Three did: the cover note,
the missing-flat warning and the caveat.

### The customer's special request was invisible when empty

Also founder-reported, same order. The path is intact end to end -- the
customizer's "Any detail to focus on?" box, the cart line, `/api/orders`, the
DB, the pack. Nothing drops it.

The flaw was that the section only rendered `if (item.freeformNotes)`, so an
empty one produced no section at all and there was **no way to tell "the
customer asked for nothing" from "the pack lost it"**. It now always renders,
saying so explicitly when there is nothing. Whitespace-only counts as empty.

This is deliberately NOT a return of the 11 removed blanks: those asked the
workshop for data Shaklek does not hold; this reports a fact about the order.

Also: fabric printed lowercase ("linen") next to "Ivory", because designSpec's
`Fabric` type is a lowercase union. Capitalised for display.

⚠️ **Wording worth a tailor's eye, not changed:** on Wide-leg Trousers the
CONSTRUCTION block says *"falling straight from the hip with no taper"* while
CUT AS ORDERED says *"Wide leg. Widening from the hip through to the hem"*. The
first describes the base garment and the second the ordered variation, but read
together they can look contradictory. `construction.ts` is garment language and
belongs to whoever cuts -- flagged rather than reworded.

### Open for the founder

- **Review the contact sheets** -- `npx tsx scripts/catalog/contact-sheet.mjs <slug> /tmp/x.png`.
- **Nothing is committed or pushed.** No deploy has happened. Total generation
  spend ~$2.93 across 74 Flash calls, zero Pro escalations.
- The customer's free-text request prints verbatim, so a phone number typed
  into it reaches the tailor. Everything else is stripped by design. Left alone
  deliberately -- redacting a customer's own words could remove real making
  instructions. Founder's call.
- The construction text in `src/data/construction.ts` is derived from the
  photography and the descriptors, **not from patterns**. The tailor should
  read it once and correct it.

### Pre-deploy security review — 2026-08-25 (Session D)

Run against the uncommitted home-page / customizer / checkout work before
pushing, because `DesignCustomizer` and `CheckoutForm` are the blast radius
that produced the AED 5 bug and paid ads were about to point at them.
**No Critical or High findings. Nothing in this batch can affect price.**
Confirmed by simulation: a URL slider value has no path to `unit_amount`; the
option-list filter rejects unknown values twice over; premium sliders cannot
be set from a URL.

**Finding 1 (Medium) — the preview photo can show a different cut, and it is
now deep-linkable.** Independently re-verified by enumerating every render
combination against `comboImages`:

    wide-leg / banded / pleated trousers   missing straight:full   (4/4 colours)
    cargo-trousers                         missing straight:full   (4/4 colours)
    wrap-top / structured-blouse           missing short:normal    (4/4 colours)
    utility-shirt                          missing short:normal    (4/4 colours)
    oversized-shirt                        complete

**7 combinations, 4 colours, front and back = 56 images not yet generated.**
The default combination legitimately has no photo of its own (it IS the base
photo, section 2). These seven are *non-default* and fall through the same two
`??` fallbacks, so the customer sees the base photo of a different cut while
the labels, cart, order and tailor's sheet are all correct. Pre-existing and
reachable by clicking sliders; the URL work made it shareable, and the footnote
added the same day claims images are "illustrative of the combination you
chose", which is untrue in exactly these cells.

**Mitigated, not fixed.** `DesignCustomizer` now computes `photoMatchesCombo`
and the page says so plainly: *"We have not photographed this exact
combination yet, so the picture shows our standard cut. Your piece will be made
straight leg, full length, as chosen."* Browser-verified 5/5: appears on
`banded-trousers?leg_width=straight&garment_length=full` and
`wrap-top?sleeve_length=short&garment_length=normal`, absent on combinations
that do have photos.

⚠️ **The real fix is the 56 images**, and until they exist **do not run ads that
deep-link into those seven combinations.** Method is section 4b; these are
silhouette reshapes (de-taper / shorten sleeves), so budget Pro calls for the
backs. Gemini credit was exhausted on 2026-08-24 and the founder is topping it
up for Session C's flats.

**Finding 2 (Low) — FIXED.** The colour gate was `item.colorImages?.[name]`, a
truthy lookup that walks the prototype chain: `constructor`, `toString`,
`valueOf`, `__proto__` and `hasOwnProperty` were all accepted. So
`?color=constructor` set `spec.color = "constructor"`, the preview fell back to
Ivory, and on payment `"constructor"` was written to the cart line and then to
`order_items.color` — onto the tailor's sheet, with no allowlist downstream.
Now `Object.hasOwn`, applied on both the `?color=` path and cart restore.
Verified: five prototype names rejected, four real colours still accepted.

**Informational — the premium tier is client-side only.** A URL cannot set a
premium slider, but `/api/orders` accepts any `changes` labels from the body
and `changesFromLabels` will restore premium labels from an edited
`shaklek-cart` localStorage entry. Price-neutral and pre-existing, recorded so
nobody later assumes the tier is server-enforced.

### Session B — cart & customizer UX (2026-08-23)

**Status: DONE — committed as `33deaf3`. No files held. Not pushed.**

Shipped:

- **Editable cart lines.** `/design/<slug>?edit=<lineId>` restores colour,
  fabric, every slider, notes and measurements, and saves over that line
  instead of appending a second one.
- **The design page is a real stepper** — "Make it yours" / "Get the fit",
  each showing `step N of 3`, with back and next on both. Step 1 is choosing
  the piece on the catalog.
- **Real cart thumbnails** — resolves the ordered combination photo.
- **Quantity**, with the cart and header badge counting garments not lines.
- **Checkout email** — the Pay button no longer sits greyed out unexplained.

### Session B — promotion codes & charged-amount recording (2026-08-23)

**Status: DONE. No files held.**

- `allow_promotion_codes: true` on the Checkout Session.
- The webhook now records `session.amount_total` as the order total, so a
  discounted order stops reporting the pre-discount figure. Previously a
  99%-off order recorded AED 390 against AED 3.90 collected, and every
  welcome-offer order would have overstated revenue.

The discount is only ever read from Stripe's signed webhook payload, after
`constructEvent()` has verified it — never from the request body, and never
asserted by the caller. `amount_total` arrives in fils (AED is two-decimal
per docs.stripe.com/currencies), and the conversion is guarded on
`session.currency`: an unexpected currency leaves the total as booked and
logs loudly, rather than silently under-recording by 100x.

Knock-on, fixed in the same commit: the confirmation emails would otherwise
have listed items summing to AED 390 above a total of AED 3.90, which reads
as a broken email. Both emails now name the discount. It is derived from
the gap between subtotal and total, so nothing extra had to be persisted.

`scripts/test-promo-discount.mjs` covers both calculations.

**Not verified end to end.** Creating a discounted Checkout Session would
mean a live Stripe session against production, which CLAUDE.md forbids. A
real discounted payment is the founder's to run — which enabling promotion
codes was partly meant to make cheap.

### Session B — on-site promo code + handoff note (2026-08-23)

**Status: DONE. No files held.**

A discount code can now be applied on our own `/checkout`, so someone
arriving from a campaign sees the reduced total before the redirect instead
of having to trust that Stripe will honour it.

The customer only ever sends a code *string*. `/api/promo/validate` looks it
up in Stripe to show the discount, and `/api/orders` resolves it again
server-side before passing the promotion code id into the Session. A caller
cannot assert a discount, a percentage or an amount, and the figure finally
recorded still comes off the signed webhook.

`allow_promotion_codes` and `discounts` are mutually exclusive in the
Checkout Session API, so it is now conditional: a code applied on our page
is passed as `discounts` (Stripe opens already-discounted), and Stripe's own
field is kept as the fallback when no code was entered. Nobody is stuck
either way.

Session A's `1c1a141` note already covers the address handoff, and it is
better than the one drafted here (it names card details too) — so no second
note was added.

**`TEST99` now exists and is correctly configured** — verified against the
live Stripe API on 2026-08-23: `active: true`, `duration: "once"`,
`percent_off: 99`, no expiry, no redemption cap, and
`first_time_transaction: false` (so a repeat payer can still use it).

**Still untested: the success path.** Only the invalid-code path was
exercised end to end (verified: "That code isn't valid" — that run predates
the code existing). The success run was cut short when the session wrapped.
What still needs one pass:

1. Apply `TEST99` on `/checkout` → preview should read
   *Discount −AED 386.10 / New total AED 3.90*.
2. Pay → Stripe's page should open **already discounted** at AED 3.90, with
   no promotion-code field (that is correct: `discounts` and
   `allow_promotion_codes` are mutually exclusive).
3. After payment → the order row, `/order-confirmed` and both emails should
   all read **3.90**, not 390.

**Minor, for Session A:** the dev-only origin allowance in `requestGuards.ts`
is hardcoded to port 3000, but the two-session convention is to pin other
ports. Any dev server not on 3000 gets 403s from every write route unless
`NEXT_PUBLIC_APP_URL` is set to match. Not changed here — it is a security
guard and it is your file.

### Session A — security & infrastructure

Holding (per its own commits): `src/db/client.ts`, `src/lib/envGuard.ts`,
`scripts/check-db-branch.mjs`, `scripts/test-env-guard.mjs`.

---

## Notes across sessions

**Session A: Session B has touched `/api/orders` and `pricing.ts`** in
`33deaf3` — the handler with the history. Worth a re-audit. What changed: cart
lines now carry a `quantity`, so `line_items[].quantity` and the `order_items`
insert are no longer hardcoded to 1.

**Quantity is money** and is treated as such. It multiplies `unit_amount`, so
it is resolved server-side in `src/lib/pricing.ts` (`resolveQuantity`) exactly
like price is, and never read from the request body for anything but
re-resolution. Caps: 10 per line (`MAX_QUANTITY_PER_ITEM`), 20 garments per
order (`MAX_UNITS` in `/api/orders`), both checked against server-resolved
values. The cart's own clamp is display only.

**Quantity deliberately needs no migration.** A line ordered twice is written
as **two `order_items` rows**, not one row with a count. Each row is one
garment to cut, which is what the tailor's spec sheet and the dashboard
already assume. This was chosen specifically so no schema change had to land
on the live Neon DB ahead of a deploy: there is no migrate step in the Amplify
build (`package.json` has no migrate script), so a migration and the code that
depends on it can never ship atomically. Adding a `quantity` column later is
still possible, but nothing needs it today.

**Session A's re-audit verdict on the quantity work: no objection.** Read
`pricing.ts` and `/api/orders` at the working-tree state, no edits made.
`resolveQuantity()` never trusts the body — non-integer, negative, NaN and
missing all collapse to 1, and anything over the cap is refused rather than
silently trimmed. `resolveOrderPricing` multiplies `price * quantity`, so the
server total stays authoritative and the client `total` remains advisory. The
one-row-per-garment choice is the right call for the reason given. This is the
same handler that caused the AED 5 bug, and the trust boundary was handled
correctly this time.

**Session A holds no uncommitted files.** Everything of Session A's is pushed,
so nothing of its work can be clobbered. Its claim list above is historical, not
a lock.

---

## Done and deployed — 2026-08-23

Kept here because both sessions keep re-discovering it. Full record and root
cause analysis: `planning/security/rca-2026-08-23.md`.

An external audit found four Critical/High issues; a follow-up source audit
found nine more. All are fixed, deployed and verified against production.

`e7980b9` — the four Critical/High:

1. **Client-controlled prices.** `/api/orders` passed `items[].price` straight
   into Stripe's `unit_amount`, so an AED 450 garment could be bought for AED 5
   against live cards. Now recomputed server-side from `catalog.ts` by slug.
2. **False "Order confirmed".** No `res.ok` check, so a failed order cleared the
   cart and rendered success. Now checked, with a visible error.
3. **No authorization on `/api/orders/:id`.** Now needs an HMAC token minted at
   checkout or a Clerk session owning the order; unauthorized and nonexistent
   both return 404, so it is not an existence oracle.
4. **No security headers.** Added, plus CSP and `poweredByHeader: false`.

Found in follow-up, not by the external audit: open redirect via a reflected
`Origin` in `success_url`; a non-idempotent Stripe webhook that re-sent both
emails on retry; HTML injection into the confirmation email; authorization
trusting `primaryEmailAddress` without checking Clerk had verified it
(`src/lib/authEmail.ts`); public `/api/trends/*` fanning out to Google; no rate
limiting; unbounded request bodies; no CSRF guard; unguarded cart `localStorage`
write.

`eaa9f90` — mobile nav (every header link was `hidden sm:inline` with no
hamburger anywhere, so below 640px only the logo and cart showed) and
measurement validation (Tailored orders could be placed empty, or `height: 5`).

`b796653` — size chart behind XS–XXL, in the Step 3 selector.
⚠️ Consolidated from published UAE-market charts, **not measured from Shaklek's
own patterns**. Provenance and that caveat are in `src/data/sizeChart.ts`.

`775c3e6` — **local dev was writing to the production database.** Stripe was
split into live and sandbox, but both halves shared one Neon branch — which is
why production has `cs_test_` sessions among real orders. Local now runs against
a `dev` branch (schema-only, no PII copied) and `src/lib/envGuard.ts` enforces
the pairing: a test key against the production DB throws; a live key against a
non-production DB only warns, so a stale hostname constant can never take the
storefront down.

`7f6da48` — verification tooling in `website/scripts/`. `csp-check.mjs`,
`clerk-check.mjs`, `render-page.mjs`, `verify-size-chart.mjs`,
`list-orders.mjs`, `delete-audit-rows.mjs`, `check-db-branch.mjs`,
`test-env-guard.mjs`. These drive real headless Chrome over the DevTools
Protocol with no Puppeteer/Playwright install — useful for anything a header
dump or a typecheck cannot prove.

**Data cleanup.** Deleted the 6 orders, 6 `order_items` and 2 customers the
external audit created by POSTing probe orders at the live API. The real live
order `bc7bbb09` and all customer orders were untouched.

---

## Open — nobody is working on these

| Item | Owner | Notes |
|---|---|---|
| 4 live Stripe sessions from the audit | user | Unpaid, self-expiring. Order rows already deleted, so paying one creates nothing. Decided: ignore. |
| Apex deep links 404 | deferred | `shaklek.com/design/x` → 404; the other three URL shapes work. GoDaddy cannot fix it. **Nice-to-have, not MVP** — see `aws-infrastructure-todo.md`. |
| 7 old test rows in production DB | user | From August testing (`cs_test_` sessions). Harmless, clutter the dashboard. Awaiting go-ahead. |
| Image optimizer error | unowned | `unsupported image format` in dev. Not any of the 286 catalog images. |
| CSP keeps `'unsafe-inline'` on `script-src` | accepted | Removing it needs nonces via `proxy.ts`, forcing dynamic rendering across the catalog. Documented in `next.config.ts`. |

---

## Rules that came out of today

In `CLAUDE.md` §0 and `.claude/agents/shaklek-security.md`. Repeated because
they are what a second session is most likely to break.

- **The server owns every price and every quantity.** Nothing from a request
  body reaches `unit_amount` or the database.
- **When a value starts being used for something new** — money, identity,
  authorization — re-audit every place it enters the system. Extending a handler
  is a new threat model for every field it already read. That one mistake caused
  three of the four Critical/High findings.
- **Never read credential or deployment state out of a doc.** It lives in the
  Amplify console and goes stale silently. Verify it.
- **Never create test orders against production.** That is what left real Stripe
  sessions and order rows behind. Use the `dev` Neon branch with the sandbox
  key, or test pure functions directly with `npx tsx --eval`.

---

## Open, not owned by either session

- **`33deaf3` is committed but not pushed.** Pushing deploys. Nothing in it
  needs a migration first (see the quantity note above), but it does change
  the live checkout, so it deserves a real payment test after deploy.
- **Dev-server image error, pre-existing.** `next dev` logs `Input buffer
  contains unsupported image format` from the image optimizer. All 286 catalog
  images and all 4 marketing PNGs decode cleanly under sharp, and the only
  other images in `public/` are unreferenced Next starter SVGs
  (`next.svg`, `vercel.svg`, …). Not tracked down further; nothing user-facing
  is broken. Whoever picks this up: it predates both sessions' current work.

---

## Session A re-audit of `33deaf3` (the quantity / cart-edit batch)

Requested by Session B in `82dd584`. Done adversarially, not by reading.
`scripts/test-quantity.mjs` is committed so it can be re-run.

**Money path: PASS.** 19 hostile inputs to `resolveQuantity` — floats,
negatives, `NaN`, `±Infinity`, numeric strings, `"1e3"`, `{}`, `[]`, `["7"]`,
`true`, `1e9` — all either collapse to 1 or are refused. A body claiming
`price: 5, name: "FREE", category: "Shirt"` on `wide-leg-trousers` with
`quantity: 3` resolves to the catalog's `Wide-leg Trousers / Pants / 450` and
a total of 1350. Verified end to end against a production build: tampered
price → 409, 21 garments → the `MAX_UNITS` message.

**One defect found and fixed (Session A, on released files).** The per-line cap
refused correctly but reported the wrong reason: `resolveItem()` returns `null`
for both an unknown slug and an over-cap quantity, so an honest request for 11
shirts came back as `"Unrecognised item in order"`. A refusal, as intended, but
for a reason that is not true and that the customer cannot act on — the
opposite of the goal of refusing rather than silently trimming.
`resolveOrderPricing` now checks the cap first and says so. Verified: quantity
11 → 400 with the new message, 10 and 1 → 200 with a Checkout Session.

**Incidental proof the dev split works.** Those successful test checkouts
created `cs_test_` sessions and wrote 2 orders / 11 `order_items` into the
**dev** Neon branch. Production untouched. Before 2026-08-23 the same test
would have written into the live orders table — which is exactly how the 7
stale `cs_test_` rows got there.

**Pushed 2026-08-23** after the AED 390 test charge was refunded in full
(`ch_3U7GbOFG6ccJjMKM0i0cgAZD`, `refunded: true`, `amount_refunded: 39000`,
verified against the Stripe API rather than taken on trust). The cart-edit,
stepper, thumbnail and quantity work is live. **A real payment test on a real
phone is still the outstanding verification** — this batch changes the flow
where money moves, and no synthetic check substitutes for that.


---

## Closed: the "unsupported image format" error

Left open by Session B after two passes. It is **not the image optimizer and not
any catalog image** — which is why checking all 286 of them found nothing.

It is `GET /icon` — the code-generated "SK" favicon (`src/app/icon.tsx`, an
`ImageResponse`) — returning **500** under `next dev`. Caught by running the dev
server with its output captured, driving the pages in headless Chrome so the
browser actually requested the icon, and reading the log around the error rather
than guessing at candidates.

**Dev only. Production serves `/icon` and `/apple-icon` as 200.** Session B's
call that nothing user-facing was broken was right. Not worth chasing further.

## Fixed: the CSP was breaking React's dev tooling

Found in the same log. `next dev` was logging *"eval() is not supported in this
environment"* — React uses `eval()` in development to reconstruct callstacks and
power other debugging features, and the CSP added on 2026-08-23 applies to the
dev server too. Next's own CSP guide calls this out.

`script-src` now includes `'unsafe-eval'` **in development only**.

⚠️ **Keyed off the config `phase`, not `NODE_ENV`.** `NODE_ENV` was tried first
and leaked `'unsafe-eval'` into the *production* header — it is not reliably
`"production"` at the moment `next.config.ts` is evaluated. Verified both ways
after the change: `next start` has no `unsafe-eval`, `next dev` has it. A
security header must not depend on a signal that loose.

---

## Break point — 2026-08-23

**Decision waiting on the founder: whether to push.**

`0f48268` (the on-site discount-code field) is committed locally and **not
pushed**. Everything before it is deployed and live.

That gap has a practical consequence worth knowing:

- **On production right now**, `TEST99` works — but only on Stripe's hosted
  page after the redirect, via `allow_promotion_codes`. That path is live and
  can be tested today.
- **The field on our own `/checkout` is not live** until `0f48268` is pushed.

Pushing deploys, and it changes the checkout flow on a site taking real
cards, so it should go out alongside the three-step verification above rather
than unattended.

**Not touched, belongs to someone else:** `website/src/data/catalog.ts` is
modified and uncommitted, and `website/scripts/delete-old-test-rows.mjs` is
untracked — neither is Session B's. `shaklek-spec-bc7bbb09.pdf` at the repo
root is a generated artefact and deliberately unstaged.

**Still open for the founder** (carried over, not done by either session):

- Refund the AED 390 test order.
- Run the Neon cleanup of the 7 old test rows — production DB access exists
  only in the Amplify console by design, so no session can do it.
- Confirm Apple Pay on a real iPhone. **When testing with a discount, apply
  the code before tapping Apple Pay** — it pays immediately, and tapping it
  first buys a full-price garment on a real card.

---

## 2026-08-24 — discount path proven, and one bug it exposed

**The full discounted path works on production.** A real payment ran at
AED 3.89 with `TEST99` applied, and Stripe confirms `times_redeemed: 1`.
Apple Pay showed the discounted amount correctly.

**Bug found by that payment, now fixed:** the Pay button read the raw cart
total, so it said **"Pay AED 389"** directly beneath a summary saying the new
total was 3.89, and beside an Apple Pay sheet that correctly said 3.89. The
most prominent price on the page was the only wrong one. It now follows the
discount, and still shows a clean integer when no code is applied.

**Not verified in a browser.** Two attempts were cut short — coordinates
drifting as the window resized, then the browser extension disconnecting. The
underlying arithmetic is covered by `scripts/test-promo-discount.mjs` and the
change is one expression, but the rendered button has not been seen with a
code applied. Worth one look on the next real test.

### Local testing now works — read this before testing discounts locally

**Local dev runs on Stripe TEST keys; production runs on LIVE.** The
`sk_test_51U4N3HF...` key belongs to the **sandbox** account
(`acct_1U4N3HFDCtKouREX`), not the live account. A code created in the
Dashboard's live mode is invisible to a local dev server, which reports
"That code isn't valid" — correctly, and confusingly.

A matching **`TEST99` (99% off, once) now exists in the sandbox account**, so
the discount flow can be exercised locally without touching live money.

Also note: the dev-only origin allowance in `requestGuards.ts` is hardcoded
to port 3000, so any dev server on another port needs
`NEXT_PUBLIC_APP_URL=http://localhost:<port>` or every write route 403s.


---

## Founder decisions, 2026-08-24 — settled, do not re-raise

**Stripe Adaptive Pricing is OFF.** Turned off in the Dashboard by the founder.
It was converting prices to the customer's local currency — a French billing
address saw EUR 94.56 instead of AED 390 — which is what produced the "paid 390
but refunded 390.20" confusion. Stripe refunded exactly what was charged
(`refunded: true`, `amount_refunded: 39000`); the 20 fils was the customer's
own bank converting EUR back to AED at a different rate hours later. Adaptive
Pricing also adds a 2–4% conversion fee the customer pays, and we only ship to
the UAE, so showing a marked-up foreign price served nobody.

**Verification note:** this cannot be confirmed from the repo. It will show on
the next real order — a session with no `presentment_details`, or one whose
presentment currency is AED, means it is off.

**Licence number is 1645657.** Confirmed by the founder. The other number on
the trade licence (2084779) sits beside the owner's name and is *not* the
licence number. 1645657 is what is published in `/legal/terms` and
`/legal/privacy`.

**The WhatsApp number stays as the founder's personal mobile** (+971504766769,
the same number printed on the trade licence). Raised as something to decide
deliberately rather than leave by default; the founder has decided to keep it
for now. Appropriate for a concierge brand at this stage. Revisit if volume
makes a separate business line worthwhile.

**Tailoring is not a Shaklek activity.** The tailor is an independent third
party, not an employee. The licence's "Active Seller Online" is correct and
sufficient — see `incorporation-todo.md`.

---

# START HERE — 2026-08-25

Everything below is committed, pushed and live. Working tree clean apart from
two untracked marketing drafts belonging to the other session
(`planning/marketing/instagram-content-pack.md`, `social-playbook.md`) and a
generated spec-sheet PDF at the repo root.

## What shipped on 2026-08-24

**The customizer bug ten people called a bug — it was one.** The preview was
sticky and the controls sat in the *same* column, so on scroll every option
slid under the photo and got sliced mid-button. Two causes beneath it: the
column width was derived from viewport *height* (`w-[40.5vh]`), so anything
that did not fit overflowed sideways; and `max-w-xl` capped the whole
customizer at 576px, leaving ~60% of a 1440px screen empty. Now one column on
phones, two from `lg` up.

**Photos were cropping the garment on phones.** `object-cover` cut the hem off
trousers — the exact thing a customer is choosing between. Now `object-contain`
everywhere with the box matched to the dominant photo ratio. ⚠️ See the aspect-
ratio note in `catalog-images-todo.md`: the source images are **eight different
shapes**, and the UI fix is a workaround, not a cure.

**Sharp corners** across the customizer, matching the catalog. **Tailored is the
default fit** — made-to-order only justifies its price if the garment is cut to
the customer.

**Legal.** Returns merged into one Terms document (~250 → ~2100 words), with
the clauses that were missing entirely: right to decline an order, pricing
errors, risk on delivery, faulty goods as a separate remedy, uploads and IP,
liability, force majeure, jurisdiction. Privacy rewritten — the old one
described **camera-based measurement that does not exist**. Both now name the
real entity: **Shaklek For Online Selling**, licence **1645657**.

**New pages:** `/faq`, `/size-guide`, `/shipping`. **Shaklek+** takes an email
for early access (`/api/waitlist`, no DB table on purpose). **Tabby removed.**
**Discount code** on our checkout only — Stripe's field is hidden.

**Copy.** Hero back to the founder's signature line, with readability fixed
rather than the words rewritten. Founder's note updated, and its "288 ways /
576 ways" corrected to **192**, computed from `parameterSliders.ts` so it
cannot drift. It had been advertising locked Shaklek+ options nobody can pick.

## Pick up here

**Audited 2026-08-25.** Three rows were stale and are corrected below rather
than left to mislead a third session — the same failure this project keeps
hitting with docs that outlive the thing they describe.

### Done since this table was last written — do not re-pick

| | |
|---|---|
| ~~Spec sheet → real tech pack~~ | **DONE and live** (`0f39959`, `ea9d85e`, `437ae74`). Photo + technical flat per garment, real size numbers, construction text, de-branded, trimmed. 64 flats. |
| ~~Adaptive Pricing still ON in the sandbox~~ | **The claim was FALSE.** Verified against the Stripe API: it was already off in the sandbox. It is now also pinned `enabled: false` in code on every Checkout Session, so neither Dashboard decides the currency. |
| ~~The five-item cart batch~~ in `tomorrow-start-here.md` | **All five shipped.** "Add another piece", edit-from-cart, real thumbnails, quantity, checkout email. That whole file is superseded. |

### Actually open

| | Who | Notes |
|---|---|---|
| **A real order on a real phone** | founder | The one thing nothing else proves. A 99%-off code makes it ~AED 4. Confirms AED-only end to end, and Apple Pay. |
| **Show the tech pack to the tailor** | founder | `construction.ts` is derived from the photographs and descriptors, **not from patterns**, and it is now the text a garment is made from. Specifically: Wide-leg's "falling straight from the hip" vs the ordered "Wide leg. Widening from the hip" reads as a contradiction. |
| **Normalise catalog image ratios** | in progress | Measured 2026-08-25 across the 256 referenced images — see the breakdown below. Free, deterministic, no model cost. |
| Saved addresses for returning customers | unassigned | |
| Catalog cannot be paged on desktop | unassigned | Needs arrows for non-touch. |
| Feedback link | unassigned | A `hello@` link and the WhatsApp number. **Not a form** — a form implies a ticketing system that does not exist. |
| "I'll take it as shown" | unassigned | Skip-customisation, worded so it does not undercut the thing that justifies the price. |
| SEO structured data | unassigned | `Product` / `Offer` schema on catalog pages. |
| The duplicated "Switch to Tailored" line | unassigned | `SizePicker.tsx:196` and `:207` say the same thing in the same branch. |
| WhatsApp handoff still says "Shaklek order" | founder's call | `dashboard/orders/page.tsx:29`. Same disclosure surface as the now de-branded pack. |
| Instagram launch kit, written and ready | founder | `planning/marketing/instagram-launch.md` |

### Image ratios — the real numbers, 2026-08-25

256 referenced images, 0 missing. **2 of 8 items are uniform, 6 are not:**

| Item | Distinct ratios | |
|---|---|---|
| utility-shirt | 0.666, 0.667 | effectively done — reframed to 2:3 in `1e919cb` |
| structured-blouse | 0.671 | already uniform |
| banded-trousers | 0.667, 0.671 | nearly there |
| oversized-shirt | 0.671, 0.747 | |
| cargo-trousers | 0.667, 0.671, 0.680, 0.756, 0.778 | |
| pleated-trousers | 6 distinct | |
| wide-leg-trousers | 7 distinct | |
| **wrap-top** | 0.778, 1.157, 1.287, 1.389, 1.390 | **worst — most of its images are LANDSCAPE on a portrait card** |

`scripts/catalog/crop-to-ratio.mjs` exists and did utility-shirt. Wrap Top is
the one to do next: a 1.39 landscape photo in a portrait frame is not a
rounding difference, it is a different picture.

## Two standing warnings

⚠️ **Neither legal document is lawyer-reviewed.** They name the real entity now,
which does not change that. A UAE lawyer should read them against Federal Law
15/2020 (consumer) and Federal Decree-Law 45/2021 (data protection).

⚠️ **Verify on a phone, not a laptop.** Both of the day's real bugs — the sliced
button and the cropped hem — were invisible at 1440px and obvious at 390px. Most
of this brand's traffic is mobile. Check there first.

## 2026-08-28 — session a5450c67 (packaging + /fit)

**Committed, NOT PUSHED. Do not push until the migration is run** (see below).

- `/fit` — post-delivery fit feedback, reached by a QR on the thank-you card.
  New: `src/app/fit/`, `src/app/api/fit-feedback/`, `src/components/FitFeedbackForm.tsx`,
  `src/data/fitFeedback.ts`. Modified: `src/db/schema.ts` (3 new `customers`
  columns), `src/lib/techPack.ts`, the spec-sheet route, `legal/privacy`.
- Business card + rewritten thank-you card in `branding/send-to-supplier/artwork/`
  (10, 10b, 04, 05). Both carry QR codes drawn as vector.
- `CLAUDE.md` gained deploy Trap 3.

⚠️ **`npx drizzle-kit migrate` must run before this is pushed** — Amplify has no
migrate step (CLAUDE.md deploy Trap 3).

The blast radius shrank on the founder's instruction to stop overwriting. This
started as three columns on `customers`, which put the migration in the path of
`/api/orders` and the Stripe webhook — seven files do a bare `db.select()` on
that table, so deploying first would have broken checkout and stopped paid
orders being marked paid. It is now a **new `fit_feedback` table** and
`customers` is untouched, so a premature deploy would only affect `/fit`
itself. Migrate first anyway.

Security review done (`shaklek-security`), four findings fixed in `38d699a`'s
follow-up. Two accepted and reported to the founder: `rejectOversizedBody`
trusts `Content-Length` site-wide, and there is no staff path to delete stored
fit feedback (nor saved measurements — pre-existing, and `legal/privacy`
already promises one).

Not held by me: `src/data/versionIds.ts` and `scripts/render-collection-book.mjs`
are the other session's.

## 2026-08-28 — session 2a816505 (version IDs + wide-leg band)

Committed `b799fcd`, **not pushed** (the other session's migration must run
first — see the entry above).

- `src/data/versionIds.ts` — a short stable code per render-tier combination
  (32 of them: `OVS-LN`, `WLT-WF`). The collection book prints the code above
  each column with a ruled blank beside it, so metres per cut can be written on
  the page at the workshop meeting and matched back afterwards. **The codes are
  a key, not a label** — changing one orphans whatever was recorded against it.
  Book re-rendered: `brand-assets/tailor-samples/collection-book.pdf`.
- Wide-leg trousers: the flat grey bar across the bottom of the `wide:full`
  photos is gone. Deterministic, no generation —
  `scripts/catalog/fix-bottom-band.mjs` copies the real backdrop rows just
  above the band downward over it. 7 of 8 files fixed, filenames bumped to
  -v2/-v3, originals in `catalog-archive/2026-08-28-wideleg-bottom-band/`.

**Two instruments lied today, both worth knowing about.**

- A *mean* of the outer columns as a row-background estimate is dragged down
  several levels by the model's floor shadow. Use a median. And a median over
  both edges is bimodal when the backdrop has a left-to-right gradient, so it
  returns a cluster edge rather than a middle — do not use it as an anchor.
- `strings` and an ad-hoc PDF stream parser both reported the collection book
  had zero version codes in it. It had all 32. Verifying a PDFKit document by
  scraping bytes does not work; wrap `PDFDocument.prototype.text` and log what
  is actually drawn.

**Blocked, needs the founder.** The Oversized Shirt's new shorter "normal"
would not generate: three attempts, the hem does not move, and the diff is
uniform across the whole frame (the model re-renders and changes nothing).
Pro — the tier that reshapes silhouettes — returned 503 six times running.
Separately, the current base's hem already sits at the belt, so promoting it to
"longer" would leave almost no visible difference between the two lengths.
Raised with her.

Wrap Top shortening *does* work: navy `long:longer` front came back hip-length
first try. Waiting on her approval before the remaining seven fronts.

### Same session, later — fabric decision and the burgundy hem

**Everything below is committed and pushed.** Nothing held.

- **The fabric question is closed and prices do NOT move.** Supplier is 100%
  linen online at **AED 24/metre**, one price per colour. In-store was
  abandoned: ≥45 AED/m *and not 100% linen*, so it failed the claim printed on
  every product page before it failed on price. At 24 AED/m the live ladder
  earns **65–67%**, inside the band it was designed for, so **the +49 rise is
  off**. Opening order: **110 metres, AED 2,640** — 40 ivory, 30 navy, 25
  burgundy, 15 white, aimed at ~50 garments. Full working in
  `planning/pricing-todo.md`.
  ⚠️ That rests on **2.2m per garment at 140cm width, which is an estimate**.
  At 110cm width it is ~40 garments, not 50. The supplier has not been asked
  the width. The collection book has a blank per version code for the tailor's
  real numbers.
- **Wrap Top burgundy `long:longer` front** fixed — its *longer* length
  disagreed with its own short-sleeved version. Founder found it. Committed
  `1047638`, approved.
- **The Wrap Top length change was dropped** by the founder after review, and
  the **Oversized Shirt shorter "normal" is blocked** and needs her decision.
  Both written up in `planning/catalog-images-todo.md`.

**Two process notes worth carrying.**

- **I queried the wrong database and nearly reported it as fact.** `.env.local`
  points at `ep-jolly-cloud` (dev); production is `ep-blue-cell`. The dev branch
  holds three unpaid audit rows from 2026-08-23, so it reads as "almost no
  orders". **Print the DATABASE_URL host before believing any query about
  production.** The same gap put the `fit_feedback` table on dev while the code
  went live — handed to the other session, which owns the fix.
- **I compared a fabric cost to gross retail revenue** and called AED 1,680
  of linen "against AED 12,000 of finished stock". There is no finished stock;
  nothing is made until it is ordered. The founder caught it. The number that
  means something is **AED 53 of linen per garment, ~14% of a 389 shirt**.

**Still needs the founder** (not checkable from any system, so it lives here):
supplier's fabric width; the Oversized Shirt length decision; two AED 3.89
refunds (`ch_3U7iQk…`, `ch_3U8GfH…`, verified still unrefunded in live Stripe);
Sentry account; Meta pixel ID and domain verification; DET advertising permit;
ECAS lawyer. Everything else on her list is checkable — run the
`shaklek-assistant` agent rather than trusting this paragraph tomorrow.

### 2026-08-28, end of session — THE LIST FOR TOMORROW

**Ordered. Everything above the line is mine, everything below needs her.**

#### P0 — Staging environment. Blocked on her for keys.

A migration went to the dev Neon branch while the code was already on
production; `/account` broke for signed-in customers; what caught it was
another session asking an unrelated fabric question, not any control in this
repo. See the P0 callout in `aws-architecture-diagram.html`.

| | staging | production |
|---|---|---|
| git branch | `staging` (new) | `main` |
| Amplify | second branch, basic auth on | `main`, public |
| database | the **dev** Neon branch, already there | `ep-blue-cell…` |
| Stripe | **test** keys | live |
| Clerk | development instance | production |

**She must supply: Stripe test keys, a Clerk development instance.**
**Do it before any paid advertising.**

#### P1 — `/upload` is live, indexed, and loses the photo. Decide, then act.

The founder believes this feature was removed. **It is not.** It returns 200,
it is in the live sitemap at priority 0.8 so Google indexes it, and it calls
`addItem()` then pushes to `/cart` — so a visitor arriving from search can
configure an upload, pay for it, and the reference photo is never stored.
`order_items.has_reference_image` records only a boolean; the image itself
exists solely in the request body of the non-Stripe fallback path and is
attached to the stylist email there. On the live Stripe path it is simply lost.

**Zero orders have hit this**, so it has never bitten. Two honest options:
either take it off the sitemap and off the router properly, or build image
storage. There is no S3 bucket, so storage is real work.

#### P2 — The remake request flow. Designed, not built. Not blocked.

One form, not two: `/fit` gains a final question, "would you like us to alter
or remake it?", so the reason is captured by the survey she has just filled in.
Her order reference is now visible to her (shipped today), which was the
prerequisite for asking an unsigned-in customer to identify her order.

Two things must exist first or "one free remake within 14 days" is
unenforceable: **there is no delivery date anywhere in the system**, so the 14
days counts from nothing, and **nothing records that the free remake was
used**, so "one" cannot be enforced. Both are small.

The photo stays on WhatsApp regardless, because the site cannot store images
(see P1) and a photo is the best abuse filter she has.

#### P3 — Normalise emails at checkout. Touches the payment path.

`/api/orders` stores a guest address exactly as typed, so a customer who typed
a capital has orders invisible in her own `/account`. **Zero customers are
currently affected** — checked against production — so this is not urgent, but
it wants its own careful job with a one-off cleanup of existing rows.

---

#### Hers, and nothing of mine is waiting on most of it

- **Stripe test keys + a Clerk dev instance** → unblocks P0.
- **Send Ada the folder** on the Desktop. Complete, 12 files, nothing pending.
- **Verdict on `00-you-are-the-designer.mp4`** → unblocks rebuilding 5 videos.
- **Friday's fabric numbers** (in-store prices, metres per design) — overdue,
  blocking the price ladder.
- **Decide on `/upload`** (P1 above): remove it properly, or pay for storage.
- One lawyer hour: the tailor/ECAS exemption, privacy, terms/returns.
- TikTok Business account and the free UAE advertiser permit.
- Film the three phone clips.

---

#### Verified today, so nobody re-checks it tomorrow

Production audited directly: **no schema drift**, 11 orders (2 paid, 1 in
progress, 8 abandoned checkouts), 13 line items with **0 unmakeable**, colour
and fabric on every line, **0 orders with no line items**, 3 customers, and
**0 emails stored with a capital**.

⚠️ **Both paid orders DO carry the emirate.** It is in `shipping_state` as
`"إمارة دبيّ"`, which is what Stripe returns for a UAE address, and the
dashboard already renders it. An earlier note in this session claimed the city
was missing; that was an audit script that printed every shipping field except
`state`. Nothing is lost.



**Build a staging environment. Founder's call, and it outranks everything else
on the list.**

Why, in one line: a migration went to the dev Neon branch while the code was
already on production, `/account` broke for signed-in customers, and the thing
that caught it was the other session rather than any control in this repo.

The shape, half of which already exists:

| | staging | production |
|---|---|---|
| git branch | `staging` (new) | `main` |
| Amplify | second branch, basic auth on | `main`, public |
| database | the **dev** Neon branch, already there | `ep-blue-cell…` |
| Stripe | **test** keys | live |
| Clerk | development instance | production |

**Blocked on the founder for:** Stripe test keys, a Clerk dev instance.

**Do it before any paid advertising.** Paid traffic landing on a broken
checkout costs the ad spend as well as the orders.

Also still open and not blocked by the above:
- Guest emails are stored unnormalised at checkout, so a customer who typed a
  capital has orders invisible in her own account. Touches the payment path,
  wants its own careful job.
- The remake request flow: designed, not built. The order reference is now
  visible to the customer, which was its prerequisite.

---

## 2026-08-29 — the supplier could not quote, and it was our document's fault

**Status: BUILT AND VERIFIED, NOT COMMITTED. Holding these files:**
- `branding/send-to-supplier/READ-ME-FIRST-Shaklek-artwork.pdf` (4 pages -> 7)
- `branding/send-to-supplier/READ-ME-FIRST.txt`
- `branding/send-to-supplier/artwork/05b-thank-you-envelope-back.pdf` (new)
- `branding/send-to-supplier/artwork/09-mailer-placement.pdf` (resized)
- `website/scripts/brand/generate-supplier-pdf.mjs`
- `website/scripts/brand/generate-packaging-artwork.mjs`
- `branding/packaging.md`

She wrote back with four things: no envelope size or design, no mailer
dimensions, no business cards in the file, and "you want to use kraft paper to
wrap cotton bags — will that be sturdy enough?" She also quoted the mailer
against her own standard courier bag, because there was no dimension on the
page to quote against.

**The root cause is not the missing sizes. It is that the artwork is generated
by one script and described by another, and only the first one was re-run.**
The business card was added on 2026-08-28; the spec sheet was last built on
2026-08-27. So she received twelve files and a document describing ten of them
— and that document also still drew a hang tag with an order number on it, a
design withdrawn the day before, and a care label saying "wash symbols" when
the artwork says DRY CLEAN ONLY.

⚠️ **Nothing would have caught that.** The two scripts had no relationship a
machine could check, so staying in sync depended on someone remembering. The
fix is not another rule in CLAUDE.md — it is `auditArtworkAgainstSizes()` in
`generate-supplier-pdf.mjs`, which reads the artwork folder and refuses to
write the PDF if a file exists that the document never mentions, if the
document names a file that is not there, or if a printed size disagrees with
the file's actual MediaBox. Both failure modes were tested by breaking them on
purpose and confirming exit code 1.

**Three more guards, all of which caught something real on the first run:**
- a caption-overflow check in `mockPage` — caught the Mailer caption running
  9pt into the cell below it
- a 4-items-per-page check — one group had five, and **pdfkit had silently
  auto-paginated the document to twelve pages** without a word
- an asserted `EXPECTED_PAGES = 7`

**Founder's decisions, 2026-08-29:** envelope is C6 114 x 162 (back prints
only); mailer is a MINIMUM of 320 x 400 internal, her stock size welcome;
kraft at 120 gsm+ with a self-seal strip, no poly. All recorded in
`branding/packaging.md`.

**Instrument note, for the running list of them:** the first PDF text extractor
reported 0 of 14 phrases present in a document that contained all of them — it
looked for `Tj` and pdfkit writes hex `TJ` arrays. Second version found 13 and
missed one to its own double-space at a line break. Consistent with the rule:
"cannot be true" means audit the instrument.

**Not done, hers:** send the folder back to the supplier, and ask her for a
sample of the 120 gsm kraft before any run.

### Correction, same day: the envelope was drawn portrait

Founder: "I need the envelope to be horizontally taller than vertically, this
is not how envelopes and thank you cards look." She was right.

C6 is 114 x 162 as a sheet, and I wrote the dimension down correctly and then
drew it the wrong way up. The distinction is manufacture, not taste:

  WALLET  flap hinged on the LONG edge  -> landscape. Cards, invitations.
  POCKET  flap hinged on the SHORT edge -> portrait.  Invoices, statements.

Same sheet, same price, so nothing was saved by getting it wrong — a pocket
envelope in this parcel just reads as post rather than as a note. **"C6" alone
does not specify it; the order has to say "C6 wallet, landscape".**

⚠️ **The artwork audit did not catch this and could not have.** It compares the
declared size against the file's MediaBox, and both said 114 x 162 — the
document and the artwork agreed with each other and were both wrong. A
consistency check cannot see outside the pair it is checking. This one needed
an eye, and it needed the founder's, because I looked at the render and saw a
correct C6.

Second version also failed on first look: the flap and the two lower back seams
were bare dashed lines to the same centre point, which drew a symmetrical X
across the whole envelope. Technically the seams of an envelope back; you could
not tell which triangle was the flap. Tinting the flap fixed it in one glance,
and the lower seams turned out to be unnecessary. The tint is a guide, so the
file now says on its face that it does not print.

**Left as it is, and worth her deciding:** the thank-you card stays A6 PORTRAIT,
105 x 148. It goes into a landscape envelope turned on its side, which is
normal for a card. If she wants it to slide in without turning, the card becomes
A6 landscape and 04 + 05 are a real redesign — the wordmark, the paragraph, the
ruled handwriting guides and the QR all re-place.

### And the cotton bag turned landscape too

Founder, same day: "the cotton bag will be in landscape as well, more long
horizontally, it doesn't change anything for you right?"

Almost right, and the almost is worth writing down. **It is the same rectangle
turned on its side** — 400 x 500 becomes 500 x 400, same cloth, same area, same
long edge — so the fold is the same, the packed bundle is the same, and the
**mailer minimum of 320 x 400 does not move.** Cost and fabric unaffected.

But `08-linen-bag-print.pdf` still had to be rebuilt, because **the mark is
placed as a fraction of the bag's HEIGHT.** "A third of the way down" is 150 mm
on a 500 mm bag and 120 mm on a 400 mm one. A placement guide written in
proportions is not orientation-free — easy to assume, and wrong.

Caught while redrawing it: the mockup drew the bag's wordmark at **62% of the
bag width when 90 mm on a 500 mm bag is 18%** — roughly three times life size,
on a page whose own title says "drawn to proportion" and from which a supplier
may set up the screen. Now drawn to true scale. It looks modest because it is.

⚠️ **Open, and hers:** the mark is still 90 mm, which is 18% of a 500 mm width
where it was 22.5% of 400 mm. It has not shrunk but it reads smaller on a wider
bag. Left at 90 mm deliberately — a print size she already settled should not
change as a side effect of turning the bag. **About 110 mm restores the old
proportion.**

### The card follows the envelope, and the bag mark goes to 110 mm

Founder, 2026-08-29: "the thank you card should be same as envelope."

**04 and 05 are now A6 LANDSCAPE, 148 x 105.** Same sheet turned on its side,
so paper and price do not move. The reason is the handling, not the look: a
portrait card in a landscape envelope has to be turned ninety degrees to go in
and turned back to be read — a small constant awkwardness in the one moment the
unboxing is meant to feel considered. Matched, it slides straight in.

The layout was **re-proportioned, not rotated.** A wider card fits more words
per line, so the paragraphs drop to fewer lines, and that is what buys back the
43 mm of height turning it costs. The back's QR went 30 mm -> 28 mm and
`qr()` reports 0.76 mm per module, well clear of the 0.4 mm floor. Both faces
were rendered and looked at, not just built.

**Bag mark: 90 mm -> 110 mm.** Her call, on proportion rather than size — 90 mm
was 22.5% of a 400 mm bag and only 18% of a 500 mm one. It had not shrunk, the
bag got wider, but it read smaller than the version she had approved. Verified
by measuring the rendered file rather than trusting the build log: ink spans
21.5% of the width, about 108 mm against a 110 mm nominal (the 2 mm is the
right sidebearing of the last letter, which is expected).

**Screen printing is priced by the run, not by image size, so this is free.**

Note for whoever writes the next supplier answer: she asked "what did you
correct exactly" and was right to — an earlier reply had run the artwork file
and the illustration of it together in one sentence, so it read as though the
thing she prints from had been wrong. It never was. **Say which artefact
changed, every time: the print file, the drawing of it, or the words about it.**

### Packaged for Ada, and the README was audited because it was wrong

`~/Desktop/Shaklek-artwork-for-Ada-2026-08-29.zip` — 27 files, 413 KB. Contains
`branding/send-to-supplier/` only, so nothing personal from the repo root.

⚠️ **READ-ME-FIRST.txt had gone stale twice over while the PDF and the artwork
were kept current.** It still said the bag mark was "90 mm wide" after it went
to 110, and still described the card as "105 x 148" after it turned landscape.
It is a HAND-WRITTEN text file describing GENERATED artwork — the pairing that
always drifts — and it is the document a supplier opens first. Its section
heading also said "SEVEN NOTES" over eight notes.

**So the build now audits it**, alongside the spec sheet: every `artwork/*.pdf`
line in the README has its stated size compared against the file's real
MediaBox, every artwork file must be listed, and a short list of prose values
that have each been wrong at least once is checked for presence (110 mm,
148 x 105, 162 x 114, 120 gsm, WALLET) and absence (the old 90 mm, the old
250 x 350, the withdrawn A7F3C210). Both failure modes were tested by
reintroducing the exact errors and confirming the build refuses.

The notes are now numbered 1-8 with **no count in the heading** — a total that
has to be maintained by hand is another thing that goes stale.

**The general shape of every defect this session:** one artefact regenerated,
its sibling not. Artwork vs spec sheet, spec sheet vs README, print file vs the
drawing of it. None of it was missing knowledge.

---

## 2026-08-30 — the linen test report, verified against the lab

**No repo changes. Nothing held.** Everything produced went to
`~/Desktop/shak-docs/`, outside the repo.

The founder asked whether the fibre-composition certificate her fabric supplier
sent is enough. Short answer: **the document is genuine, and it still is not
what backs the claim on the site.** Both halves matter.

### What the document is

`certif_W300235 成分检测报告（全英）.pdf` — report `ZFLJ2761423`, anti-fake code
`2718292117`, issued by CNTAC Testing Service Co., Ltd. (Foshan). Applicant
**Guangzhou Xinjishang Textile Co., Ltd.**, brand *Amazhiyu*. One 30x30cm swatch
of "woven 21S 100% linen", tested 2022-03-30, reported 2022-04-01.
**Fibre content only** (FZ/T 01057). Result: `Flax 100`. Judgement standard: `/`
— a raw result, not a pass/fail against any spec.

### Verified, not assumed

The lookup passed and the lab served **its own stored copy** of the report. Its
text was diffed line by line against the supplier's PDF: **identical, all 55
lines**, including the fibre result. The supplier's copy is not doctored. Lab
copy archived as `certif_W300235_LAB-VERIFIED-COPY_ZFLJ2761423.pdf` with a
plain-text record beside it, `certif_W300235_VERIFICATION-NOTE.txt`, which
carries the re-verification steps.

⚠️ **The portal actively misleads you, which is why the note exists.**
`www.fcl-sz.org.cn` lands on a STAFF LOGIN (用户名 / 密码). The report number and
the code are **not** a username and password and are rejected forever. The real
form only appears after clicking **质检报告防伪查询** below the box, and it renders
*underneath* the login panel where it is easy to miss. It wants both fields:
报告编号 = `ZFLJ2761423`, 防伪码 = `2718292117`.

Also resolved: the report's "United Testing Services" watermark, the CNTAC
Foshan letterhead and the 中联品检(北京) portal are **one organisation** — the UTS
logo is on the portal's own login box. Three names, no discrepancy.

### What it does NOT do, and this is the part that matters

- **It does not name the fabric being bought.** `W300235` appears only in the
  supplier's *filename*. The lab never wrote it. Nothing links the report to the
  110m order.
- It is **four years old**, covers **one undyed swatch**, and tests fibre content
  only — no dye/azo/formaldehyde work, no colourfastness, no shrinkage. The four
  sellable colours are untested.
- The lab says so itself: "results refer only to sample(s) tested".

**What actually backs "100% linen" on ~20 pages of the site is the supplier
confirming in writing that article W300235 as sold to Shaklek is 100% linen —
ideally on the invoice.** This report is then corroboration, now known to be real
corroboration. That written line is still outstanding and is hers; it belongs in
the same message as the unanswered fabric-width question.

### Instrument note, for the running list

**A fifth PDF extractor lied, and for a new reason: the file is encrypted.**
`strings`, a zlib stream walk, and raw `/DCTDecode` extraction all returned
nothing usable — 0 text streams, and the embedded JPEGs had no `FFD8` header
because the stream bytes are encrypted. `sips` renders page 1 only, at 72dpi.

What worked: **PDFKit through JXA** (`osascript -l JavaScript`), which decrypts
transparently. `PDFDocument.string` gave the complete text of all three pages
first try.

Two JXA traps, both costly: **`console.log` writes to stderr**, so `> out.txt`
captures an empty file — redirect `2>`. And **two-argument selectors do not
bridge** in this build (`writeToFile$atomically`, `insertPage$atIndex` are all
`undefined`); route binary out via `base64EncodedStringWithOptions(0)` and
decode in the shell instead.

Consistent with the standing rule — "cannot be true" means audit the instrument,
not the belief. Four instruments disagreed with a document that was entirely
intact.

### Told her, not acted on

- The applicant on the report may not be the company invoicing her. If her seller
  is a reseller, this is someone else's certificate. Worth one glance at the
  order chat.
- **Get a swatch card before the 110 metres.** Not compliance — colour. Every
  catalog photo is rendered at exact values (Ivory `#f5f0e8`, Navy `#0a2d4a`,
  Burgundy `#4a1a2d`, White `#fafafa`). A navy that arrives visibly different
  means the photography misrepresents the goods, discovered with all 110m paid
  for.
- Whether any of this is *required* is a lawyer question, not mine. It sits with
  the tailor/ECAS hour already on her list. Nothing here is a legal requirement
  as far as I could establish; a certificate is not a compliance document, and
  the real duty is simply not to describe the product inaccurately.

⚠️ **I over-scoped this at the start and she pushed back twice** ("you don't have
to be this extra"). She was right: I bundled the fabric-width question and a
swatch-archiving routine into what read as a compliance checklist, when the
actual ask was "is this document enough". **Answer the question asked, then
offer the rest separately.**
