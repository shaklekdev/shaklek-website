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

| | Who |
|---|---|
| **Spec sheet → real tech pack** — biggest open item, and the document the garment is actually made from | unassigned |
| **Cheap live payment test** on the new checkout — a 99%-off code makes it ~AED 4, and confirms AED-only now Adaptive Pricing is off | founder + Session B |
| **Adaptive Pricing is still ON in the Stripe *sandbox*** — live is off. A test order can show EUR while real customers correctly see AED | founder |
| Saved addresses for returning customers | unassigned |
| Catalog cannot be paged on desktop — needs arrows for non-touch | unassigned |
| Normalise catalog image ratios (deterministic padding, no model cost) | unassigned |
| Feedback link, "I'll take it as shown", SEO structured data | unassigned |
| Instagram launch kit is written and ready to post — `planning/marketing/instagram-launch.md` | founder |

## Two standing warnings

⚠️ **Neither legal document is lawyer-reviewed.** They name the real entity now,
which does not change that. A UAE lawyer should read them against Federal Law
15/2020 (consumer) and Federal Decree-Law 45/2021 (data protection).

⚠️ **Verify on a phone, not a laptop.** Both of the day's real bugs — the sliced
button and the cropped hem — were invisible at 1440px and obvious at 390px. Most
of this brand's traffic is mobile. Check there first.
