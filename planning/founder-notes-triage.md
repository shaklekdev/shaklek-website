# Founder notes — triaged 2026-08-23

Raw notes from the founder, checked against what the code and the live site
actually do today. Three were already fixed. The rest are real, with evidence
and an owner where one is obvious.

Ordered by **money and trust first**, then conversion, then brand.

---

## Already done — no action, do not re-do

**"In the checkout customer doesn't understand they need to enter the email
first."** Fixed by Session B and deployed. `CheckoutForm.tsx:161` now shows
*"Enter your email above to continue."* under a disabled Pay button, instead
of it sitting greyed out with no explanation.

**"We still don't ask for the address of the customer."** We do — but the note
points at a real *perception* problem, so see **A1** below rather than closing
this outright.

**Website lag — "still lagging, this is confirmed."** Confirmed real and now
measured, but the cause is not what it looks like. See **B1**.

---

## A. Money and trust

### A1. The checkout page never says the address comes next — HIGH
The address **is** collected: `/api/orders` sets
`shipping_address_collection: { allowed_countries: ["AE"] }` and
`phone_number_collection`, Stripe collects both on its hosted page before the
payment completes, and the webhook persists them onto the order.

But the founder — who built this — looked at the checkout page and concluded
we never ask. A customer will conclude the same, and the note *"who would pay
before adding their address?"* is exactly the thought that loses a sale at the
last step.

Nothing is broken. The **copy** is. One line under the Pay button along the
lines of *"Delivery address and payment are taken on the next screen, secured
by Stripe"* removes the doubt.

> ⚠️ One caveat worth checking: the real 2026-08-22 payment
> (`cs_live_a1c0Nx77Sjv8…`) has `shipping_address_collection: null` — it
> predates commit `78db150`. Any order placed **before** that commit has no
> address on it. Only one live order exists, so this is a one-row problem, but
> confirm the address for it by hand before making that garment.

### A2. Prices should end in 99 — shirt 389, pants 429 — MEDIUM
A pricing decision, not a bug. Every price lives in
`website/src/data/catalog.ts` and `BASE_PRICE_BY_CATEGORY`. Because pricing is
now server-authoritative, changing them there changes them everywhere —
catalog, customizer, cart, Stripe — with no other edits.

Two things to decide first, because they interact:
- `pricing-todo.md` derives the current ladder (390/420/450/620) from real unit
  costs. Dropping to 389/429 is ~0.3–5% off margin. Small, but it should be a
  decision, not a slip.
- It collides with **A3**. Decide the discount mechanism first, then set the
  list prices once.

### A3. Launch discount — "first joiner" offer — MEDIUM
Already the documented intent: `CLAUDE.md` says the welcome offer is applied
as a **Stripe promotion code at checkout, never by discounting the list
prices**. That is the right design and it must stay that way — a discount that
comes from the request body is the AED 5 bug again.

Blocked on the promotion-code work assigned to Session B (enable
`allow_promotion_codes`, and persist `session.amount_total` so a discounted
order does not record full price). Once that lands, a launch code is a
Dashboard entry, not code.

---

## B. Conversion

### B1. Latency — measured, and the cause is Clerk — HIGH
Measured on production at a 390px viewport with a 4× CPU slowdown (a
mid-range phone), via `scripts/perf-check.mjs`:

```
DOMContentLoaded   1485 ms
load               2876 ms
transferred         674 KB across 45 requests
long tasks             0        <- so it is NOT scroll jank
cumulative shift       0        <- and NOT layout instability
```

**Clerk is 353 KB of that 674 KB — over half the page**, and it loads on the
homepage, where a logged-out visitor needs none of it:

```
124 KB  @clerk/ui   ui-common
 78 KB  @clerk/clerk-js
 65 KB  @clerk/ui   vendors
 43 KB  @clerk/ui   ui.browser
 43 KB  @clerk/ui   framework
```

Worth being precise about what this is and is not. There are **no long tasks
and no layout shift**, so the feeling of lag is not the scroll handler or the
hero animation — the ken-burns effect is a GPU-composited `transform` and it
already honours `prefers-reduced-motion`. It is **page weight and time to
interactive**.

The lever is loading Clerk only where it is needed — the header's signed-in
button, `/account`, `/dashboard`, `/sign-in` — rather than from the root
layout on every page. Expect roughly half the JS off the homepage.

Second lever: the four marketing PNGs are ~800 KB each on disk (3.2 MB total).
They are served through Next's optimizer so visitors get less, but they are
worth re-encoding — and note `CLAUDE.md`'s rule that catalog images are JPEG
q92 under `.png` filenames because Amplify rejects a build over 230 MB.

### B2. "Skip customisation" straight to size — MEDIUM
Cheap to add now that Session B has built the stepper. Worth thinking about
against the product thesis first: `CLAUDE.md` says *the customizer **is** the
product* — made-to-order only sells if choosing an option visibly changes the
garment. A skip link that most people take would undercut the one thing that
justifies the price. Frame it as *"I'll take it as shown"* rather than *"skip"*.

### B3. Feedback button — LOW, easy
Founder's own wording, worth keeping verbatim: *"Shaklek is not just a brand,
it's your brand. We care about your thoughts and feedback. Any improvement
idea? We're happy to hear from you. Every email and message is read
carefully."*

Simplest honest version: a link to `hello@shaklek.com` and the existing
WhatsApp number. A form implies a ticketing system that does not exist — and
the copy promises every message is read, so only ship what can be kept.

### B4. SEO — MEDIUM
Sitemap, robots and per-page metadata with OG images shipped 2026-08-22, so
the foundation exists. What is missing is substance rather than plumbing:
- No structured data (`Product` / `Offer` schema) on catalog pages
- The apex deep-link 404 splits any link equity — see
  `aws-infrastructure-todo.md`
- No content that ranks for anything beyond the brand name

---

## C. Craft and brand

### C1. Customizer parameters look wrong — MEDIUM
*"Parameters still show behind the picture, they're too wide, they need to be
smaller and more subtle and luxurious. Cotton and linen can be on the same row
as colours to save a row. The parameters can be way smaller and finer."*

Note this predates Session B's Step 2 rework (native radios, new stepper), so
**re-check it on the live site before acting** — some of it may already be
different. The "behind the picture" part sounds like a z-index or overflow
issue, which is a bug, not taste. Owner: `shaklek-ui` agent.

### C2. Spec sheet should be a real tech pack — MEDIUM
*"Spec req needs to be better than this, if we can regenerate an actual clear
tech pack for the tailor it would be better."*

Today `/api/dashboard/orders/[id]/spec-sheet` renders a pdfkit document. A
real tech pack means flat sketch, measurement table, construction notes,
fabric and colour swatch. This is the document the garment is made from, so
errors here cost a remake — the same cost driver as the size chart.

### C3. Real fabric photography instead of colour swatches — MEDIUM
*"Check the exact colours and add pictures of the material instead of just a
colour palette."* Right instinct: a flat hex swatch cannot show linen slub or
cotton weave, and that texture is the product. Note `CLAUDE.md` §1 on token
discipline before generating anything, and §4b on the two-master method.

### C4. Packaging with the logo — LOW, offline
Not a code task.

---

## D. Marketing — the largest item, and least defined

*"Generate content for Instagram and TikTok, both empty. Generate the logo
image from the HTML file so I can update the profile picture. Suggest
scenarios. Onboard me on ads from scratch — I know nothing. Maybe start with
video on TikTok?"*

Genuinely several jobs, and worth splitting:

1. **Profile picture** — smallest and unblocks the accounts today. The "SK"
   monogram already exists as code (`src/app/icon.tsx`); export it at profile
   resolution.
2. **Launch content** — the catalog photography is done and is the best asset
   available; a first grid can be built from it without new shoots.
3. **Ads onboarding** — a written explainer, not a build task. Should cover
   what a campaign objective is, what a realistic budget looks like at this
   stage, and what to measure. ⚠️ It should also say plainly that paid ads
   before the funnel converts is spending to find out the funnel does not
   convert.
4. **TikTok video** — needs a real filming plan, not generated images.

Owner: `shaklek-marketing` agent, which already carries the rule that claims
must match what the product actually does — relevant here, because empty
social accounts get filled with aspirational copy fastest.

---

## Suggested order

1. **A1** checkout copy — one line, removes doubt at the payment step
2. **B1** Clerk loading — measured, biggest single win, no design decisions
3. **A2 + A3** together — decide the price ladder and the discount mechanism once
4. **C1** re-check on the live site, fix the layering bug
5. **D1** profile picture, then the rest of marketing
6. **B4 / C2 / C3** as capacity allows
