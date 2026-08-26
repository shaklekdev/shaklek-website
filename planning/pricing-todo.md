# Pricing — the model behind the numbers in `catalog.ts`

Last revised **2026-08-26**, after the founder's real fabric quotes arrived.
Prices in this file are **read from the code**, not remembered — see "How to
re-check this file" at the bottom.

**This file exists because the first round of margin work was done in a chat
session and never written down** — nothing about unit cost survived anywhere in
the repo and it had to be rebuilt from scratch. Do not let the next revision
live only in a conversation.

⚠️ **Nothing is being promoted yet and nobody is buying.** Confirmed by the
founder, 2026-08-26. There are no customers holding an old price and no ad
creative quoting one, so **prices can be changed freely right now** — this is
the cheapest moment this decision will ever have. That stops being true the day
the first campaign runs.

---

## What is actually live (verified against the code, 2026-08-26)

`website/src/data/catalog.ts` → `BASE_PRICE_BY_CATEGORY`:

| Category | Live price | Where it can be bought |
|---|---|---|
| Shirt | **AED 389** | 4 catalog items |
| Skirt | **AED 419** | **no catalog item** — `/upload` only |
| Pants | **AED 429** | 4 catalog items |
| Dress | **AED 619** | **no catalog item** — `/upload` only |

The eight catalog items are four shirts/tops at 389 and four trousers at 429.
**Skirt and Dress prices only ever reach a customer through the upload-your-own
path**, so a repricing decision on those two is worth much less than it looks.

**A previous version of this file listed 390 / 420 / 450 / 620 as the ladder.
That was never what shipped.** Pants in particular are live at 429, not 450 —
21 AED below the number the margin case was built on. Corrected here rather
than left to mislead the next session.

## The fabric situation — read before any margin maths

**Only ONE fabric is sellable today: 100% linen.** See
`website/src/data/fabrics.ts`. Organic cotton is present in the vocabulary but
`available: false`, because there is no supplier — it is an online-only order
with a two-week ETA. It is also the correct call for a second reason: **all
catalog photography was generated in linen**, so selling cotton against those
photographs would misrepresent the garment.

**Therefore every live price above is already a linen price.** A "linen
surcharge" on top of a linen-only catalogue is not a surcharge, it is a price
rise. That distinction is the whole of the decision below.

`fabrics.ts` already carries a `surchargeAed` field, 0 for every fabric. The
wiring is there for the day a second fabric is sellable; it is deliberately not
used yet.

---

## Inputs

| Input | Value | Source |
|---|---|---|
| **Cotton, 100%, online** | **10 AED/m** | Founder, 2026-08-26 |
| **Organic cotton, online** | **20 AED/m** | Founder, 2026-08-26 |
| **Linen, online** | **30 AED/m** | Founder, 2026-08-26 |
| **Linen, in store** | **≥ 40 AED/m** | Founder, 2026-08-26 — cannot be had for less |
| **In-store prices, all fabrics** | ⏳ **PLACEHOLDER — founder, Friday 2026-08-28** | Launch runs on store prices, not online ones |
| **Metres per garment, per design** | ⏳ **PLACEHOLDER — founder, Friday 2026-08-28** | Currently assumed Shirt 2.0 · Skirt 1.5 · Pants 2.0 · Dress 3.0 |
| Shipping | 21 AED/shipment | Founder, 2026-08-22 |
| Packaging | 2 AED/package (1,000 per 500) | Founder, 2026-08-22 |
| Tailoring | Shirt **40** · Skirt **60** · Pants **60** · Dress **85** | Founder, 2026-08-22 |
| Make time | 1–2 days per piece, per tailor | Founder, 2026-08-22 |
| Tailor bench | More than one tailor available | Founder, 2026-08-22 |
| Payment fees | ~2.9% + 1 AED | **Still unverified** against Stripe UAE |
| Remake allowance | 5% of orders | Assumption; made-to-order's "returns" |

**The launch runs on the in-store figures, not the online ones.** The founder is
buying in store; the online quotes are the floor of what the market can do, not
what Shaklek pays. Until Friday, **40 AED/m is the working linen number** and
every table below uses it.

**Fabric stopped being "not the lever" the moment the real numbers arrived.** An
earlier version of this file said fabric was 20–40 AED against a ~100–160 COGS
and that tailoring dominated. At 40 AED/m and 2 metres, fabric is **80 AED** —
as much as a shirt's cut-and-sew and shipping combined. It is now the largest
single line on a shirt.

---

## What the live prices actually earn, on real linen

Per unit, at 2.0m (shirt/pants), 1.5m (skirt), 3.0m (dress). COGS includes the
5% remake allowance; gross is after the Stripe fee.

| Item | Live price | Linen @30 (online) | **Linen @40 (store — the real case)** |
|---|---|---|---|
| Shirt | 389 | 248 gross · 64% | **227 gross · 58%** |
| Skirt | 419 | 271 · 65% | **256 · 61%** |
| Pants | 429 | 265 · 62% | **244 · 57%** |
| Dress | 619 | 392 · 63% | **361 · 58%** |

**The ladder was designed for a 65–72% band and it is not hitting it.** The old
file computed 69–72% using a blended 15 AED/m that no longer corresponds to
anything the founder can buy. At the price linen actually costs in a Dubai
store, the live prices earn **57–61%**.

Nothing here is loss-making and nothing is urgent. But the margin the whole
positioning argument rested on is roughly **11 points thinner than the file
claimed**, and that gap is exactly the fabric quote.

## The decision on the table: +49 AED

Founder's proposal, 2026-08-26: **add AED 49** to shirts and pants.

| Item | New price | Gross @ linen 40 | GM | vs today |
|---|---|---|---|---|
| Shirt | **438** | 274 | **63%** | +47 |
| Pants | **478** | 292 | **61%** | +47 |
| *(Skirt)* | *468* | *303* | *65%* | *+47* |
| *(Dress)* | *668* | *408* | *61%* | *+47* |

**It is the right move and it is roughly the right size.** It recovers about
two-thirds of what the fabric quote took away, and it does it while nobody is
watching the price. Whether it should be 49 or somewhat more is a Friday
question, not a today question.

What +49 does **not** do is restore the original band. To hold a target margin
at in-store linen:

| Item | For 65% GM | For 70% GM | Live |
|---|---|---|---|
| Shirt | 471 | 558 | 389 |
| Pants | 536 | 635 | 429 |
| Skirt | 471 | 558 | 419 |
| Dress | 749 | 887 | 619 |

And if Friday's metre counts come back higher than the assumption — 2.5m for a
shirt instead of 2.0m — those become 536 / 602 / 536 / 814 for 65%. **The metre
count moves the answer more than the fabric price does**, which is why it is the
single most valuable number the founder is bringing on Friday.

### Two things to settle once, not twice

1. **A flat +49 is wrong for a dress.** The surcharge is only defensible as a
   flat number while every garment uses about the same fabric. A dress at 3m
   consumes 50% more than a shirt; at 3.5m it is 75% more. If Skirt and Dress
   ever get real catalog items, they need their own numbers, not shirt's.
   Today it does not matter — neither is buyable outside `/upload`.
2. **Do not build a fabric surcharge for a single-fabric catalogue.** The
   cleanest change today is to move the base prices in `catalog.ts` and leave
   `surchargeAed` at 0. `surchargeAed` earns its keep the day organic cotton
   becomes sellable — at 20 AED/m online it is *half* the linen cost, so it
   would arrive as a cheaper option, and the sensible shape is then **linen at
   the current price with cotton priced below it**, not a supplement on linen.

---

## Why 389 and not 289 — the positioning case, unchanged

1. **Positioning.** Dubai's tailoring trade will make a shirt for well under
   150 AED. Low, Shaklek invites a comparison it loses on price and turnaround.
   At 389+ it is a designed label that happens to be made to measure — judged on
   design and the customizer instead.
2. **Price is the only quality signal available.** No reviews, no press, no
   social proof. In that vacuum, cheap reads as *too cheap to be real*.
3. **CAC.** See below — acquisition cost sets the floor far more than unit cost
   does.

**A correction worth keeping.** An earlier version concluded that a 290 shirt
lost money on every acquired customer, computed against an *assumed* 100 AED
tailoring cost before the real 40 existed. The claim was wrong. The reprice
rests on positioning and capacity, not on rescuing a broken margin — and that
is still true at the new fabric prices.

## The welcome offer at 20%, and where it now gets thin

Applied as a Stripe promotion code at checkout, **never** by discounting the
list price. No struck-through price nobody ever paid — that is fake reference
pricing, and Dubai separately requires a DET permit to advertise a discount
campaign (**verify before running one**).

At +49 and in-store linen, with the 20% code applied:

| Item | Customer pays | Gross | vs CAC 134 | vs CAC 200 |
|---|---|---|---|---|
| Shirt | 350 | 189 | +55 | **−11** |
| Pants | 382 | 199 | +65 | **−1** |

⚠️ **This is the case to watch.** A discounted linen shirt no longer clears a
pessimistic 200 AED acquisition cost. It was +4 under the old (wrong) fabric
assumption and it is −11 under the real one. The lever is **not** shrinking the
welcome offer to 15% — it is that 134 is an assumption and 200 is a guess.
**Spend 2–3k AED and measure the real CAC before treating either as a
constraint.** If the real number lands near 134, all of this is comfortable.

## CAC, and why it sets the price more than cost does

Estimated cold-traffic CAC for a new UAE label: **~134 AED** — CPM 30, CTR 1.5%,
1.5% purchase rate, so ~67 clicks per order. Plausible range 80–250.
**Industry-typical assumptions, not measurements.**

- **+50 AED of tailoring → +70 AED of price**
- **+10 AED/metre of fabric → ~+30 AED of price on a 2m garment**
- **+100 AED of CAC → +140 AED of price**

Ad efficiency is still worth more than any input cost. Negotiating the tailor
down is a rounding error next to a badly run ad account — but at 40 AED/m,
**negotiating the fabric down is no longer a rounding error.** 10 AED/m off the
store price is worth ~20 AED of gross on every shirt and every trouser, for one
conversation with a supplier.

## Throughput — a lead-time input, not a ceiling

**Never cap ordering.** Nothing in the codebase limits orders, and nothing
should — no stock counts, no waitlists, no "sold out". A made-to-order brand
that turns away demand has given up its one structural advantage over stocked
retail. Verified 2026-08-22: no inventory, stock or quantity limit exists
anywhere in `src/`.

What per-tailor throughput governs is **lead time**, which is a promise on the
live site ("10 days"), not a revenue ceiling:

| Tailors | Pieces/month @ 1 day each | @ 2 days each |
|---|---|---|
| 1 | ~22 | ~11 |
| 2 | ~44 | ~22 |
| 3 | ~66 | ~33 |

If orders per week push the promised turnaround past 10 days, the answer is
another tailor, never a slower site or a closed order form.

**On ads:** the real constraint on early spend is that Meta and TikTok need
roughly **50 conversions a week** to leave the learning phase, and a new brand
will not hit that on purchases alone. Optimising for **email signups** gets
there far sooner. That is a ramp tactic for the cold-start problem, not a way of
rationing demand.

---

## Open

### Waiting on the founder — Friday 2026-08-28

- [ ] **In-store price per metre, every fabric she can actually buy.** Linen is
      known to be ≥40; cotton and organic cotton in store are unknown, and the
      online figures (10 / 20 / 30) are not what the launch runs on.
- [ ] **Metres consumed per design**, per item, not per category. This moves the
      answer more than the fabric price does — see the two tables above.
- [ ] Then: re-run every table here and settle the final ladder in one edit.

### Standing

- [ ] Confirm each tailor works to the same spec sheet and quality bar — a
      second maker is only capacity if the output is indistinguishable
- [ ] How many tailors are available, and at what combined throughput?
- [ ] Verify Stripe's UAE fee (assumed 2.9% + 1 AED)
- [ ] Verify whether a DET permit is needed for the welcome offer as advertised
- [ ] Build the capture flow: `subscribers` table, unique promotion codes,
      Resend email, `allow_promotion_codes` on the Checkout session
- [ ] Re-run this once real CAC data exists (~2–3k AED of ad spend)
- [x] ~~Confirm "1–2 per piece" is days, not hours~~ — days per tailor,
      confirmed 2026-08-22

---

## How to re-check this file

Every number below the "Inputs" line is derived. The two that are not — live
prices and which fabrics are sellable — come from the code and go stale
silently, which is what happened to the last version of this file:

```bash
cd website
grep -A 6 "BASE_PRICE_BY_CATEGORY" src/data/catalog.ts   # the live ladder
grep -n "available" src/data/fabrics.ts                  # which fabrics sell
```

⚠️ **A price change is a `pricing.ts` change.** That file is the AED 5 blast
radius — it is the reason nothing about money may come from the request body.
Editing catalog prices is safe (the server recomputes from them); introducing a
per-option surcharge is not, because the option travels in the request. Run
`.claude/agents/shaklek-security.md` before shipping any surcharge.
