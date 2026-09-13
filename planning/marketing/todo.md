# Marketing — the list

Founder's brief, 2026-09-08, plus the competitive work done the same day.
Positioning lives here; the campaign assets live in the other files in this
folder (`instagram-launch.md`, `tiktok-launch.md`, `posting-calendar.md`,
`objection-handling.md`, `homepage-propositions.md`).

---

## 1. The positioning, in the founder's words

> *"Our brand is for people who value sustainability, made to order, limited
> waste. We have our own people, and people who want things cut for them.
> Not everyone has this."*

Four claims, and **every one of them is true of the product as it actually
ships**, which is the bar this folder exists to hold:

| Claim | Why it stands |
|---|---|
| **Made to order** | Nothing is cut before it is bought. Structural, not a slogan. |
| **Limited waste** | No stock, no markdowns, no unsold rails. Follows from the above. |
| **Our own people** | A named tailor in the UAE, not an anonymous factory. |
| **Cut for you** | Measurements, not S/M/L. The one thing a mass brand cannot copy. |

~~⚠️ **Do not add a fibre claim to this list until the fabric is settled.**~~
✅ **SETTLED 2026-09-12.** 100% linen. 124 metres of W300235 bought and paid
from Shirley, landing 27 Sept to 1 Oct. The fourteen customer-facing files that
already assert "100% linen" are correct. **The fibre claim is now the brand's
strongest argument, not a liability** — it is the whole "skin breathing" pillar,
and this warning had outlived its reason by a month while that pillar sat
unused. Personas and the copy built on it: `personas.md`.

### The competitive reality, checked 2026-09-08

The founder pulled real UAE prices. **Zara and Massimo Dutti are the same
company** (Inditex) — one machine at two price points, and neither can cut for
one person.

| | 100% linen shirt |
|---|---|
| Zara | 139 |
| Massimo Dutti, slim fit | 380 |
| **Massimo Dutti, regular fit** | **450** ← the modal price |
| Massimo Dutti, some | 500 |

**Zara is not a competitor.** Different customer, and Shaklek's cost of goods
alone is ~199. Do not benchmark against it and do not try to reach it.

**Massimo Dutti at 450 is the real comparison**, and Shaklek loses to them on
price, fabric provenance (certified European flax, traced value chain),
availability, brand trust and returns. It wins on **fit**, and that is enough,
because fit is the one they structurally cannot offer.

**Recommended price: 449, not 479.** It matches their regular fit exactly and
makes the comparison do the work:

> **Massimo Dutti will sell you a linen shirt for 450. We will make you one for
> the same price, in your measurements.**

⚠️ **But the customer does not shop by category.** "We are made-to-order, not
fast fashion" is the *argument*, not an exemption from the comparison. She sees
two linen shirts at similar prices and one brand she has heard of. **The reason
it is different has to be the first thing she reads on the product page**, not
something she finds in a collapsed FAQ. That is already an open item from the
marketing review: *move the fit promise to where money is decided.*

### Two things to go and get

- **The upper anchor.** Ask the tailors what a **bespoke** shirt costs in Dubai.
  If it is 800 or 1,200, then 449 stops reading as "more than Massimo Dutti" and
  starts reading as *a fraction of what made-to-measure normally costs*. That is
  a far better frame and it costs nothing to obtain.
- **The flax origin.** Ask Shirley **where the flax is grown**. Most of the
  world's flax is grown in France and Belgium, and Chinese mills routinely weave
  imported European flax. If W300235 is European flax, that closes most of the
  provenance gap with Massimo Dutti for free. If it is not, say nothing about
  origin and compete on fit. **What must not happen is charging their price and
  going quiet when someone asks.**

---

## 2. In-house measurement service, for a fee

**Founder's idea, 2026-09-08. This is the stronger of the two ideas on this
page and it should come first.**

Someone measures the customer properly, in person, for a fee.

- It attacks the **actual** risk in the business. Made-to-order lives or dies on
  whether the garment fits, and the remake rate is what the margin dies of:
  5% remakes is 58% margin, 30% is 54% plus a damaged brand. **Bad measurements
  are the single most likely cause of a remake**, and this removes them.
- It is **revenue, not cost**.
- It is maximally on-brand for *"we have our own people"*. Nobody else in this
  price bracket comes to you.
- It needs **no technology at all**, so it can exist next week.
- ⚠️ **And it produces the dataset.** Real measured bodies alongside photos is
  exactly the ground truth any automated advisor would need later. So this is
  not a detour around §3 — it is step one of it.

**To scope:** price, geography (Dubai only at first), who does it, whether the
fee is credited against the first order, and how the measurements land in
`/account` where the customer's saved measurements already live.

---

## 3. Sizing Agent (AI size advisor) — Phase 2 or 3, not now

**Founder's spec, 2026-09-08, recorded as given:**

> Claude 3.5 Sonnet on Amazon Bedrock for vision and image analysis. Body
> measurement via webcam using TensorFlow.js + MoveNet in the browser, with the
> model doing the analysis and size recommendation afterwards.

The idea is right and it is the natural end state. **Three corrections before
anyone builds it**, and one of them is the whole engineering problem.

### ⚠️ 3a. The model named is two generations old

Claude 3.5 Sonnet is superseded. The current family is **Claude Opus 5**
(`claude-opus-5`), **Sonnet 5** (`claude-sonnet-5`) and **Haiku 4.5**
(`claude-haiku-4-5`). Do not ship a spec naming a 2024 model.

### ⚠️ 3b. Bedrock was deliberately abandoned on this project

**Superseded 2026-08-12** in favour of the Google Gemini API, and the reason was
explicitly *not to split AI across two vendors* — see
`planning/technical/aws-infrastructure-todo.md`. The architecture diagram also records
that **Amplify is the only AWS service in the system**. Adding Bedrock
reintroduces an AWS dependency that was removed on purpose.

If Claude is genuinely wanted here, the **direct Anthropic API is simpler than
Bedrock** — Bedrock is partner-operated with its own pricing and its own
availability lag. But note this would mean three AI vendors (Gemini for images,
Claude for sizing) unless the Gemini decision is revisited at the same time.

### ⚠️ 3c. MoveNet does not produce measurements, and this is the whole problem

Pose estimation returns **2D keypoints** — joint positions in *pixels*. It does
not return centimetres, and no amount of model choice changes that.

Two gaps sit between keypoints and a usable measurement:

1. **Scale.** Pixels become centimetres only with a calibration reference — an
   object of known size in frame, or known camera geometry. Without it every
   number is a ratio, not a length.
2. **Circumference.** Chest, waist and hip are the measurements a garment
   actually needs, and **a circumference is not recoverable from a single
   front-facing 2D skeleton.** It has to be estimated from a trained model on a
   large dataset of real bodies, or inferred from multiple angles or depth.

That gap *is* the product. Commercial body-measurement apps solve it with
multiple photos plus a reference object, depth sensors, or regression models
trained on thousands of scanned bodies.

### ⚠️ 3d. And a wrong measurement is worse than no measurement

If the advisor is confidently wrong, it produces a garment that does not fit,
a free remake, and a customer who tells people it did not fit. **The fit promise
is the entire brand.** Do not automate it before it is measurably accurate.

### Where this sits

`planning/technical/ai-integration-todo.md` records that **zero real AI exists in the
product and that is deliberate** — Phase 1 is a human-run concierge model, to
validate the loop before the hard engineering. This feature is Phase 2/3 and
belongs behind real Phase 1 data. **Build §2 first, gather the measurements,
then revisit this with a dataset instead of an assumption.**


---

## 6. The Dubai signature (from shaklek-15, 2026-09-12)

A foot line **"Shaklek, Dubai · Privacy"** went on the pre-launch page to carry
the legal link. **The founder liked it unprompted** and asked where else it earns
a place. Agreed with her:

- Site footer, every page, once the shop opens
- **Order confirmation emails** — a stranger who has just paid a large sum to an
  unknown brand is looking for exactly that signal
- Instagram bio
- ⚠️ **NOT anything printed yet.** Hang tag, card and labels are at Fitoor with
  the 50% advance paid and samples due ~29 Sept. Changing artwork mid-production
  for a signature is not worth it. Next print run.

**The value is the word Dubai, not the layout.** A customer buying made-to-order
from an unknown brand wants to know returns do not cross a border and the fitting
offer is real. Against Zara, being here is half the argument. Being honest about
the limit: it reassures people who are already looking, and brings nobody on its
own.

## 7. The wordmark is one typeface in three treatments

⚠️ **The "font change" seen on several outputs was never a font change.** The site
header (`Header.tsx:139`) and the print artwork (`generate-packaging-artwork.mjs`)
are both Italiana and match exactly. What differed was CASE and TRACKING:
the pre-launch page used all-caps, and the carousels used all-caps at 0.20-0.30em.
Italiana in caps with wide tracking does not read as the same typeface.

**The rule: mixed case "Shaklek", Italiana, tracking ratio 4/29 (0.138em).**
Both were fixed 2026-09-12. Nothing at Fitoor is affected.


---

## 8. ⚠️ The unsubscribe, and the promise it has to keep

**Founder's decision, 2026-09-12:** *"we need the newsletter, it's very important
for new drops"*. So **"Nothing else, ever" is removed** from the waitlist confirm
email and the confirmed page, and replaced with what she will actually do: the
opening day, and now and then when something new is made.

✅ **BUILT AND LIVE THE SAME DAY, so this is no longer a to-do.**
`/api/waitlist/unsubscribe` (GET for a click, POST for RFC 8058 one-click),
`List-Unsubscribe` and `List-Unsubscribe-Post` on every send from that route,
an `unsubscribed_at` column in migration 0011 applied to production, and tokens
that sign a PURPOSE so a forwarded confirm link cannot unsubscribe the
forwarder. Verified in the code and the migration list. **The one-click POST is
the part that matters commercially: it is what Gmail and Apple Mail call from
their own button, which turns "mark as spam" into "unsubscribe".**

**The reasoning below stands as the WHY, and as the rule for anything new.** The new copy says *"You can leave the list whenever you like."* A
promise is a promise the moment it is written.

- Resend adds an unsubscribe to **broadcasts**. It does **not** add one to a
  transactional `POST /emails` send, which is how the confirm email goes out.
- **So a drop announcement sent as a one-off transactional email would carry no
  unsubscribe and would break the sentence above.** Send campaigns as broadcasts
  to the segment, or build the unsubscribe.

**Why this was changed while the list is still tiny, which is the whole point:**
every person who signs up under "nothing else, ever" and later receives a drop
email has been told something untrue. The way people express that is a spam
complaint — against the same sending domain that carries **order
confirmations**. The risk is not the wording, it is deliverability on the emails
that have to arrive.

⚠️ **The rule survives the fix: any NEW send has to carry the header too.** It
is on the waitlist route today. A drop announcement written somewhere else, as a
one-off transactional send, would not inherit it.


---

# TOMORROW — 2026-09-13

Written 2026-09-12 at the end of a long day. Ordered by what costs money or
credibility if it waits, not by effort.

## Hers, and nobody else can do these

1. **Push whatever is still local.** She is driving pushes; check rather than
   assume. ✅ The unsubscribe, the waitlist table and her copy change all
   shipped on 2026-09-12 in build 334, migrations 0010 and 0011 on production.
2. **POST THE CAROUSELS.** Three are finished and exported-ready in
   `brand-assets/carousels/`. Accounts exist, nothing has gone out since
   2026-08-27, and the plan wants ten organic sales before any ad spend. This
   is the only item whose value decays while it sits.
3. **Fitoor**: samples were due ~29 Sept and the 50% advance is paid. Chase.
4. **Shirley**: flax origin, the composition certificate naming W300235, and
   whether the invoice bills actual weight (30kg charged against ~24kg, worth
   about AED 87).
5. **The tailor, remaining questions**: volume rate at 10/20/30 pieces a month,
   the measurement conventions written down, metres per garment, and a quote
   for the GILET and the SKIRT — the last two placeholders in the model.

## Decided today, so nobody re-opens them

- **Trousers, not Pants**, customer-facing. No code change needed: "Pants" is
  an internal category key and never reaches a screen.
- **Emails, not pre-orders.** No money before fabric and packaging land.
- **"Opening early October"**, never a named day, until Fitoor confirms.
- **No lead time in advertising.** In the terms it is "about two to three
  weeks", said as an estimate. Ten working days and two weeks are the same
  duration; the third week is real headroom.
- **No health claims, ever.** The hormone line is off `/our-story`.
- **"Sustainable" is out** of `/our-story`, all three instances.

## Open, and waiting on her

- **Noor** — the sleeve/coverage persona in `personas.md`. She said she had not
  followed what personas were for; it is a yes/no on whether to speak to that
  customer at all. If no, delete her.
- **A preview path** for the real storefront. The gate is off and the proxy
  rewrites every storefront page to the launch page for everyone, her
  included. `staging.dqcptedylrif0.amplifyapp.com` works today; a preview
  cookie on production would be better.
- **A real photo of the tailor's hands.** `brand-assets/generated/tailor-hands.jpg`
  is GENERATED and it sits on the slide that argues a real person makes your
  clothes. A phone photo beats it and costs nothing.

## ⚠️ The tailor's new quote changes the abaya question

**Founder, 2026-09-12: "abaya and dress price is 80-90 aed for both."**
`planning/margins.mjs` now models BOTH at **90**, the top of the range, on the
same rule as the shirt: if a number is a range the model takes the worse one,
so a surprise moves margin up and never down.

**The abaya was a 100 placeholder and is now quoted.** With cloth at 36.08/m:

| item | metres | cloth | stitch | make | to hit bench 56.8% | at 60% |
|---|---|---|---|---|---|---|
| Dress | 3.0 | 108 | 90 | 198 | **668** | 725 |
| Abaya | 3.2 | 115 | 90 | 205 | **686** | 745 |

⚠️ **So the 130 EUR (554 AED) abaya benchmark does not work.** At 554 the
garment cannot carry cloth plus stitching at anything like the shirt's margin.
Either the abaya sells around 690, or it sells at a deliberately lower margin
and that is a decision taken with open eyes. **Do not set the price from the
European number** — check what an abaya actually sells for in the UAE first.

### ⚠️ And the dress and abaya can no longer justify their price gap

**They now cost the SAME to sew: 90 each.** The only cost difference left
between them is **0.2 metres of cloth, which is 7.22 AED** (3.2m vs 3.0m at
36.08). That is arithmetic, not a model output.

So the proposed **dress 599 / abaya 690** puts a **91 AED gap** on top of a
**7 AED** cost difference. Either the dress is underpriced or the abaya is
overpriced; the costs no longer tell them apart, so the answer has to come from
what each one is worth in this market, not from the spreadsheet.

✅ **DECIDED 2026-09-12: NO DRESS FOR LAUNCH. ABAYAS ONLY.** Her call once the
tailor quoted 90 for both. The dress earns 52.2% at 599 and the abaya 57.0% at
690, they cost the same to sew, and **the abaya is the piece nobody else cuts to
measure** — which is the whole argument for the brand. The Dress category stays
in the code; nothing gets photographed, priced or listed. Do not reopen the
dress price: the question is closed, not deferred.

⚠️ Consequence to watch: the free-shipping threshold band is (519, 599] and was
set so "a single dress or abaya qualifies". With no dress, check the band still
does what it should against the abaya alone.


---

## 9. Emails and the journal — tomorrow's work in this area

**From shaklek-15, and both are copy problems rather than code problems.**

1. **The emails need shortening and an HTML version.** A 90-character signed URL
   printed in full wraps across four lines on a phone and reads like phishing.
   Her words: *"we can't display this like that."* A link with visible text
   instead of a raw URL, and a body that survives a phone screen.
   ⚠️ **Keep BOTH unsubscribe routes if you touch that file**: the
   `List-Unsubscribe` headers AND the visible "Leave the list" line. Gmail
   surfaces a header-based unsubscribe only on mail it classifies as bulk, and a
   first transactional send is not bulk — so the header alone is invisible
   exactly when it matters most.
2. **The journal rewrite.** Reasoning and three proposed angles are in
   `frontend-todo.md`, awaiting her reaction. Her read: essays where they should
   be answers, and the searches still worth winning are **local and
   decision-shaped**, not general explainers.

## 10. ⚠️ The www timeouts — what is actually known

Do not re-measure this from scratch, and **do not blame CloudFront**; she
rejected that and was right that nothing had ruled us out.

**Measured 2026-09-12, from one sandbox:**

- During the failures, `www.shaklek.com` returned `000` (connection never
  established, DNS resolving fine) **while `example.com` AND
  `staging.dqcptedylrif0.amplifyapp.com` both returned 200 in the same minute.**
  Staging is also CloudFront. **So a dead CloudFront edge does not explain it** —
  another CloudFront property was reachable at the moment ours was not.
- Later, 60 consecutive probes across four hosts (ours, staging, an AWS
  CloudFront asset host, and a non-CloudFront control) returned **60/60 OK**. The
  fault was not present and could not be reproduced.

**So: intermittent, specific to the www.shaklek.com hostname while it lasts, not
CloudFront-wide, and not reproducible on demand.** That is the honest state.
Anything narrower than that is a guess. The next useful measurement is one taken
**while it is failing**, from the machine that is failing — not afterwards.
