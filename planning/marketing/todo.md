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

⚠️ **Do not add a fibre claim to this list until the fabric is settled.**
Fourteen customer-facing files already assert "100% linen" and are waiting on
the fabric decision. See `planning/unit-economics.md`.

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
`planning/archive/aws-infrastructure-todo.md`. The architecture diagram also records
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

`planning/archive/ai-integration-todo.md` records that **zero real AI exists in the
product and that is deliberate** — Phase 1 is a human-run concierge model, to
validate the loop before the hard engineering. This feature is Phase 2/3 and
belongs behind real Phase 1 data. **Build §2 first, gather the measurements,
then revisit this with a dataset instead of an assumption.**
