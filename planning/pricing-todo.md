# Pricing — the model behind the numbers in `catalog.ts`

Last revised **2026-08-22**, after the real unit costs arrived. Prices in this
file are live in `website/src/data/catalog.ts`.

**This file exists because the first round of margin work was done in a chat
session and never written down** — nothing about unit cost survived anywhere in
the repo and it had to be rebuilt from scratch. Do not let the next revision
live only in a conversation.

---

## Inputs

| Input | Value | Source |
|---|---|---|
| Fabric | 10–20 AED/metre (15 used) | Founder, 2026-08-22 |
| Shipping | 21 AED/shipment | Founder, 2026-08-22 |
| Packaging | 2 AED/package (1,000 per 500) | Founder, 2026-08-22 |
| Tailoring | Shirt **40** · Skirt **60** · Pants **60** · Dress **85** | Founder, 2026-08-22 |
| Make time | **1–2 days per piece, per tailor — confirmed** | Founder, 2026-08-22 |
| Tailor bench | **More than one tailor available** | Founder, 2026-08-22 |
| Metres per garment | Shirt 2.0 · Skirt 1.5 · Pants 2.0 · Dress 3.0 | **Assumption — confirm** |
| Payment fees | ~2.9% + 1 AED | **Verify** against Stripe UAE pricing |
| Remake allowance | 5% of orders | Assumption; made-to-order's "returns" |

**Scope decisions (founder, 2026-08-22):**

- **No blazers.** The tailor does not make them, so structured tailoring is out.
  The `CatalogItem` category union already reads Shirt | Skirt | Pants | Dress.
- **Simple dresses only.** The elaborate tier (300 AED of tailoring, 670 price)
  is dropped. It was the one item that could not hold the margin band anyway.

**Fabric is not the lever.** At 2 metres it is 20–40 AED against a ~100–160 AED
COGS. Tailoring labour dominates.

---

## The ladder, and what it earns

| Item | Fabric | Tailoring | COGS | **List** | Gross | GM | **With 20% welcome** | Gross | GM | vs CAC 134 | vs CAC 200 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Shirt | 30 | 40 | 98 | **390** | 280 | 72% | 312 | 204 | 65% | +70 | +4 |
| Skirt | 23 | 60 | 111 | **420** | 296 | 70% | 336 | 214 | 64% | +80 | +14 |
| Pants | 30 | 60 | 119 | **450** | 317 | 71% | 360 | 230 | 64% | +96 | +30 |
| Dress | 45 | 85 | 161 | **620** | 440 | 71% | 496 | 320 | 65% | +186 | +120 |

Previously 290 / 320 / 350 / 490.

**A correction worth keeping.** An earlier version of this file concluded that a
290 shirt lost money on every acquired customer. That was computed against an
*assumed* 100 AED tailoring cost, before the real figures existed. At the actual
40 AED the old shirt carried a 63% margin and broke even at a CAC of 183. The
claim was wrong. The reprice rests on positioning and capacity, not on rescuing
a broken margin.

## Why 390 and not 290

1. **Positioning.** Dubai's tailoring trade will make a shirt for well under
   150 AED. At 290 Shaklek invited a comparison it loses on price and
   turnaround. At 390 it is a designed label that happens to be made to
   measure — judged on design and the customizer instead.
3. **CAC.** The ladder clears a 20% welcome offer with 23–37% contribution at
   an estimated 134 AED CAC, and stays non-negative even at 200.
2. **Price is the only quality signal available.** No reviews, no press, no
   social proof. In that vacuum 290 for "made to order" reads as *too cheap to
   be real*.

## Why the welcome offer is 20%, not 25%

At a 390 shirt, 25% off leaves **−15 AED** per order at the pessimistic end of
the CAC range. 20% stays positive across the whole range (+70 at CAC 134, +4 at
200) while still being a real incentive to hand over an email.

**It is applied as a Stripe promotion code at checkout, never by discounting the
list price.** No struck-through price that nobody ever paid — that is fake
reference pricing, and Dubai separately requires a DET permit to advertise a
discount campaign (**verify before running one**).

## CAC, and why it sets the price more than cost does

Estimated cold-traffic CAC for a new UAE label: **~134 AED** — CPM 30, CTR 1.5%,
1.5% purchase rate, so ~67 clicks per order. Plausible range 80–250.
**Industry-typical assumptions, not measurements.** Spend 2–3k AED and count.

- **+50 AED of tailoring → +70 AED of price**
- **+100 AED of CAC → +140 AED of price**

Ad efficiency is worth roughly twice what the tailor charges. Negotiating the
tailor down is a rounding error next to a badly run ad account.

## Throughput — a lead-time input, not a ceiling

**Correction, 2026-08-22.** An earlier version of this file called Shaklek
"supply-constrained, not demand-constrained" and concluded there was no point
generating more demand than 11–22 garments a month. **That was wrong.** There is
more than one tailor available, so capacity scales with the bench.

**Never cap ordering.** Nothing in the codebase limits orders, and nothing should
— no stock counts, no waitlists, no "sold out". A made-to-order brand that turns
away demand has given up the one structural advantage it has over stocked
retail. Verified 2026-08-22: no inventory, stock or quantity limit exists
anywhere in `src/`.

What per-tailor throughput actually governs is **lead time**, which is a promise
on the live site ("10 days"), not a revenue ceiling:

| Tailors | Pieces/month @ 1 day each | @ 2 days each |
|---|---|---|
| 1 | ~22 | ~11 |
| 2 | ~44 | ~22 |
| 3 | ~66 | ~33 |

The number to watch is orders per week against the bench available that week. If
that ratio pushes the promised turnaround past 10 days, the answer is another
tailor, never a slower site or a closed order form.

**What this changes about the pricing above: nothing.** The ladder rests on
positioning, quality signalling and CAC economics — all three hold regardless of
how many tailors are on the bench.

**What it changes about ads:** the earlier version said to hold spend down to
match capacity. Scrap that. The real constraint on early spend is that Meta and
TikTok need roughly **50 conversions a week** to leave the learning phase, and a
new brand will not hit that on purchases alone at first. Optimising for **email
signups** gets there far sooner, and the list converts by email at no cost per
send. That is a ramp tactic for the cold-start problem — not a way of rationing
demand.

## Open

- [x] ~~Confirm "1–2 per piece" is days, not hours~~ — **days per tailor,
      confirmed 2026-08-22.** Not a ceiling: the bench is more than one tailor.
- [ ] **How many tailors are available, and at what combined throughput?**
      Decides whether the live "10 days" promise survives a good ad week
- [ ] Confirm each tailor works to the same spec sheet and quality bar — a
      second maker is only capacity if the output is indistinguishable
- [ ] Confirm metres per garment with the tailor
- [ ] Verify Stripe's UAE fee (assumed 2.9% + 1 AED)
- [ ] Verify whether a DET permit is needed for the welcome offer as advertised
- [ ] Build the capture flow: `subscribers` table, unique promotion codes,
      Resend email, `allow_promotion_codes` on the Checkout session
- [ ] Re-run this once real CAC data exists (~2–3k AED of ad spend)
