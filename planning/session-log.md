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
