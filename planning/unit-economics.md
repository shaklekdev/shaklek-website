# Unit economics, and whether this MVP can run without losing money

**Written 2026-09-01**, after the evening's supplier calls. This file answers
one question the founder asked directly: *"how can this business be profitable
and viable and do this MVP without losing money?"*

> ⚠️ **DO NOT RETYPE NUMBERS FROM THIS FILE INTO ANOTHER ONE.**
> Every margin figure here comes from `planning/margins.mjs`, which reads
> prices from `website/src/data/catalog.ts` and holds every cost input in one
> block. Run it:
>
> ```bash
> node planning/margins.mjs
> ```
>
> This project has twice shipped a decision computed on a stale input —
> packaging recorded at 2 AED when it was 36, fabric at 24 when it was 32
> landed. Both were copied forward for a week with nothing to catch them.
> **When a quote lands, change one number in `margins.mjs` and re-run it.**
> `planning/pricing-todo.md` is the decision *history*; this file plus the
> script is the *current model*.

---

## The short answer

The unit economics work. The exposure is small. The open risk is not cost — it
is whether a customer can be acquired cheaply enough, and that is a dial the
founder controls rather than a number that can sink her.

| | |
|---|---|
| Gross margin | **~60% entry, ~56% upgrade** |
| Cash committed before the first order | **~AED 4,094** (packaging only) |
| Orders to pay that back | **18 shirts** |
| Inventory risk | **None.** Fabric is bought per order, locally, no minimum |
| The thing that could still break it | Acquisition cost, and fit |

## What one garment earns

Run `node planning/margins.mjs` for the full eight-item table. The shape:

| | Sells for | Costs | Keeps | Margin |
|---|---|---|---|---|
| Shirt, entry blend | 389 | 153 | **236** | 60.6% |
| Trousers, entry blend | 429 | 175 | **254** | 59.1% |
| Shirt, 100% linen | 479 | 208 | **271** | 56.5% |
| Trousers, 100% linen | 519 | 230 | **289** | 55.6% |

That includes fabric, cut-and-sew, shipping, packaging, Stripe's cut and a 5%
remake allowance. **No price on the site has to change** — 389 and 429 stand.

---

## The three fabrics, and why there are three

Settled 2026-09-01. Each does a different job and only two are ever sold.

| | Fabric | Price | Job |
|---|---|---|---|
| Samples | 30% linen | **10/m** | 4 fit sets. Never sold. |
| **Entry** | linen/cotton blend | **~20/m** | 389 / 429 |
| Upgrade | 100% linen | **45/m** | 479 / 519 (+90) |

### Why a blend and not plain cotton — this is the founder's idea and it is better

The plan up to 2026-08-31 was **cotton at 389, linen at 479**. It carried a cost
nobody had priced: **every catalogue photograph was generated in linen**, and
CLAUDE.md is explicit that selling cotton against a linen photograph is a real
defect, not a technicality. Cotton-as-base meant reshooting the catalogue — the
single largest asset in the repo and the product's actual differentiator — or
shipping a false picture.

A linen/cotton blend drapes and reads as linen. **The photographs survive.**
It also degrades the claim gracefully: "linen-cotton" is a recognised premium
fabric, where "cotton" beside "linen" reads as the cheap option. And
*"100% natural materials"* is true of both fibres and is a defensible line.

⚠️ **This only pays off if the linen content is high enough.** At 60–70% it will
look like the photographs. **At 30% it will not** — it is a cotton fabric with
some linen in it, and the care label reads *70% cotton*, which is the first
thing a customer sees. The 10 AED/m fabric already bought is 30% linen and is
for **fit samples only**; it must not become the product fabric.

### ⚠️ The blend percentage is a legal disclosure

The care label must state the actual ratio, and it must be accurate — this is
the fibre disclosure, not marketing copy. So the paperwork requirement goes
**up**, not down: a pure-linen base needed one line confirming 100% linen; a
blend needs the exact composition in writing from the supplier.

Two label versions are now required either way: the blend and the 100% linen.
**The packaging order still cannot be placed until that artwork is settled** —
the Fitoor quote covers 500 care labels reading `كتان 100% / 100% LINEN`.

### Why local at 45 beat China at ~37

Recorded because the arithmetic said the opposite of the decision, and the
decision was still right.

Shirley (Guangzhou) quoted article **W300235 at 48.5 RMB/m**, 145gsm, 138cm —
about **AED 37.50 landed**, and **W300207 at 50.5 RMB**, 190gsm, at about
**AED 41 landed**. Against local in-store linen at 45, the saving is 4–8 AED/m.

It was not taken, and the reason is not the price:

- **150m is roughly 75 garments of fabric bought before a single customer
  exists.** That is the one risk a made-to-order brand structurally does not
  have to take, and taking it would have handed back the entire advantage.
- 25-day production, no lead time ever given despite asking twice.
- Buying locally means fabric is bought **per order**, seen before paying.

**The 4 AED/m is real and it is the cheapest insurance in the business.**

⚠️ **Shipping was never quoted.** Both landed figures use Helen Wu's implied
$9.29/kg. The standing rule holds: *every China quote is EXW until proven
otherwise* — an error already made twice here, on fabric and on packaging.

### ⚠️ A gsm contradiction that lands on the only piece of paper

Shirley says **W300235 is 145gsm**. Helen Wu's cloth is on record at **195gsm**;
her article number was never captured. Either Helen was selling a different
article — plausibly something like W300207 at 190gsm — or one figure is wrong.

This matters because **the fibre certificate is the only document behind
"100% linen" on ~20 pages of the site**, and `W300235` appears nowhere in the
lab report itself — only in the supplier's filename. If Helen was never selling
W300235, the certificate never covered the cloth being bought. See
`session-log.md` for the full certificate verification.

Shirley independently quoting the same article code is mild corroboration that
W300235 is a real mill article rather than a filename. **Resolve before ordering
from either.**

---

## Cash exposure — the actual answer to "without losing money"

**There are only two ways a clothing business loses real money.**

**One: buying fabric that does not sell.** This is what kills most labels —
rails of stock nobody wanted. Shaklek has **structurally eliminated it**:
made-to-order, local supplier, no minimum, buy after the customer has paid.
Parking the 150m China order is what preserved this, and it is worth more than
the margin it cost.

**Two: paying more to find a customer than the customer is worth.** This is the
only real risk left, and it is not yet answerable.

| | AED |
|---|---|
| Fitoor packaging order (everything except the cotton bag) | 2,594 |
| 100 cotton bags @ 15 — 100 is their minimum | 1,500 |
| **Total committed before a single order** | **4,094** |
| Pays back in | **18 shirts** |

Bags and labels do not expire. If it takes six months, nothing is lost — the
cash was merely early.

### The acquisition question, stated honestly

A shirt keeps **236 AED**, so up to 236 can be spent finding a buyer before the
sale loses money.

| Cost to acquire a customer | Shirt | Trousers |
|---|---|---|
| 134 — the working estimate | +102 | +120 |
| 200 | +36 | +54 |
| 250 | **−14** | +4 |

⚠️ **134 is an industry assumption and has never been measured for this brand.**
It could be 80. It could be 300. Note that the **entry price is thinner than the
upgrade** — 389 goes underwater at a 250 CAC where 479 does not. The base is
what most people will buy, so the entry fabric price matters more than the
linen one.

---

## The MVP sequence — how to answer the CAC question without betting on it

1. **Prove fit first, on the sample fabric.** Four sets at 10 AED/m are already
   bought. This is the highest-value spend in the whole plan.
2. **Sell the first ten organically. Zero ad spend.** Own network, Instagram,
   TikTok — the launch grid, captions and posting calendar are already written
   in `planning/marketing/`. Ten sales is ~2,350 AED and covers most of the
   packaging order. More importantly it answers the two things that cannot be
   guessed: **do people buy at 389, and does the garment fit on arrival.**
3. **Only then test ads, with money that can be afforded as a loss.**
   500–1,000 AED, measure the real CAC. Under ~150 and it scales. At 300, that
   was learned for 1,000 AED instead of 15,000, and the brand grows through
   community instead — slower, but it costs nothing.

**Do not scale ad spend on the 134 estimate.** It is the only number in this
file that could be wrong by a factor of two.

## The thing that would actually sink this is fit, not price

| Remake rate | Margin on a 389 shirt |
|---|---|
| 5% (the assumption) | 60.6% |
| 15% | 58.0% |
| 30% | 54.1% |

Even 30% does not destroy the margin — but it destroys the brand and the
founder's time. **This is why the four fit-sample sets matter more than every
price negotiated this evening.** The remake rate is currently an assumption;
the samples are what turn it into a measurement.

Related and still open: **P2, the remake flow.** "One free remake within 14
days" is unenforceable today — no delivery date is recorded and there is no
"remake used" flag.

---

## Pending inputs — each one moves the numbers above

| | What | Why it matters |
|---|---|---|
| 1 | **Linen % in the 20 AED blend** | Product risk, not margin. 60–70% keeps the photographs honest |
| 2 | **Cotton bag price** — asked 15 of Hashir | Each AED ≈ 0.26 margin points. Ask 300/500 pricing too |
| 3 | **Colour match, blend vs 100% linen** | One photo set serves both fabrics. Check all four against `#f5f0e8` `#fafafa` `#0a2d4a` `#4a1a2d` in daylight |
| 4 | **Both compositions in writing** | The blend ratio is a legal disclosure; the linen line is still outstanding |
| 5 | **Metres per garment** | PLACEHOLDER since 2026-08-28. 2.5m instead of 2.0 costs a shirt ~3 points |
| 6 | **Stripe UAE's real fee** | Assumed 2.9% + 1, never verified |
| 7 | **Real CAC** | The only number that decides whether this scales |

## Still true, and unchanged by tonight

**Fourteen customer-facing files assert "100% linen"**, and
`src/app/feed/meta.xml/route.ts` emits `<g:material>100% linen</g:material>`
into Meta's ad catalogue. Under a blend entry fabric those are false for the
base product — softer than the cotton-base case, but the same fourteen files.
`fabrics.ts` also still has cotton at `available: false`.

**This is cheapest to fix while the site is gated** (`www.shaklek.com` returns
401 — verified 2026-09-01). It is step 4 in the founder's sequence and must not
start until the fabric is confirmed.
