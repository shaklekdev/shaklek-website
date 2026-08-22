# Pricing — model, assumptions, and the one missing number

Written 2026-08-22. **This file exists because the margin work was done in a
chat session and never written down** — nothing about unit cost survived
anywhere in the repo, and it had to be redone from scratch. Do not let the
next revision live only in a conversation.

---

## Inputs

| Input | Value | Source |
|---|---|---|
| Fabric | **10–20 AED/metre** | Founder, 2026-08-22 |
| Shipping | **21 AED/shipment** | Founder, 2026-08-22 |
| Packaging | **2 AED/package** (1,000 AED per 500) | Founder, 2026-08-22 |
| **Tailoring per piece** | Shirt **40** · Skirt **60** · Pants **60** · Dress **85–300** | Founder, 2026-08-22 |
| Blazer tailoring | **UNKNOWN** — estimated 150–250 | ⚠️ ask the tailor |
| Make time | 1–2 **(units unconfirmed — days assumed)** per piece | Founder, 2026-08-22 |
| Metres per garment | Shirt 2.0 · Pants 2.0 · Dress 3.0 | **My assumption — confirm with the tailor** |
| Payment fees | ~2.9% + 1 AED | Verify against Stripe's UAE pricing page |
| Remake allowance | 5% of orders | My assumption; made-to-order's version of returns |

**Fabric is not the lever.** At 2 metres it is 20–40 AED per garment. Tailoring
labour dominates COGS, which is why the missing number is the whole model.

## Current prices

Shirt 290 · Skirt 320 · Pants 350 · Dress 490 (dossier §9, `catalog.ts:32`).

## 1. Where the prices actually stand

Fabric at 15/m, 5% remake allowance, Stripe 2.9% + 1.

| Item | Fabric | Tailoring | COGS | Price today | Gross | GM% | Break-even CAC |
|---|---|---|---|---|---|---|---|
| Shirt | 30 | 40 | 98 | 290 | 183 | **63%** | 183 |
| Skirt | 23 | 60 | 111 | 320 | 199 | **62%** | 199 |
| Pants | 30 | 60 | 119 | 350 | 220 | **63%** | 220 |
| Dress (simple) | 45 | 85 | 161 | 490 | 314 | **64%** | 314 |
| Dress (elaborate) | 53 | 300 | 394 | 670 | 255 | **38%** | 255 |
| Blazer (estimated) | 45 | ~200 | 281 | — | — | — | — |

**Current pricing is healthy, not broken.** 62–64% gross margin is squarely in the
DTC target band. An earlier version of this file said a 290 shirt loses money on
every acquired customer — that was computed against an assumed 100 AED tailoring
cost, before the real figures existed. It was wrong. The real cost is 40.

**The one genuinely mispriced item is the elaborate dress**: at 300 AED of
tailoring it carries a 38% margin, roughly half the rest of the range.

## 2. CAC, and why it sets the price more than cost does

Estimated cold-traffic CAC for a new UAE label: **~134 AED** (CPM 30, CTR 1.5%,
1.5% purchase rate → ~67 clicks per order; plausible range 80–250). Industry-
typical assumptions, **not measurements** — spend 2–3k AED and count.

Price needed for a 25% contribution margin after ads:

| Item | Today | CAC 80 | CAC 134 | CAC 200 |
|---|---|---|---|---|
| Shirt | 290 | 250 | **330** | 420 |
| Skirt | 320 | 270 | **350** | 440 |
| Pants | 350 | 280 | **360** | 450 |
| Dress (simple) | 490 | 340 | **420** | 510 |
| Dress (elaborate) | 670 | 660 | **740** | 830 |
| Blazer (est.) | — | 510 | **580** | 670 |

Sensitivity, and this is the strategic point:

- **+50 AED of tailoring → +70 AED of price**
- **+100 AED of CAC → +140 AED of price**

**Marketing efficiency is worth about twice as much as tailoring cost.** Negotiating
the tailor down is a rounding error next to a bad ad account.

## 3. The constraint that actually governs this business

One tailor, 1–2 days per piece, ~22 working days:

| | Pieces/month | Revenue ceiling @ ~350 |
|---|---|---|
| 1 day/piece | ~22 | **7,700 AED** |
| 2 days/piece | ~11 | **3,850 AED** |

**Shaklek is supply-constrained, not demand-constrained.** That inverts the usual
pricing logic. When capacity is the binding limit, the goal is to maximise
contribution *per piece*, not volume — every order you take at a thin margin
consumes a slot that a better-priced order could have used.

It also caps ad spend: there is no point generating more demand than 11–22
garments a month until there is a second tailor. Scale the tailor bench first,
then the ad budget.

## 4. Recommended ladder

Rounded up from the CAC 134 column, with the supply constraint arguing for the
higher end of each range:

| Item | Today | Proposed |
|---|---|---|
| Shirt | 290 | **350** |
| Skirt | 320 | **370** |
| Pants | 350 | **390** |
| Dress (simple) | 490 | **520** |
| Dress (elaborate) | 670 | **780** |
| Blazer | — | **650** (pending a real tailoring quote) |

## 5. Launch discount — the right way round

Do **not** discount today's prices. Raise list, then sell a founding-customer
discount back to roughly where you are now:

- Shirt list 350 → founding 20% → **280**, essentially today's 290.
- First buyers pay what they would have paid anyway; everyone after anchors on 350.
- It gives a real reason to capture an email, which nothing on the site does today.

Stripe Checkout supports promotion codes natively (`allow_promotion_codes`);
there is no discount mechanism anywhere in the codebase (grepped 2026-08-22).

**Now is the cheapest moment to reprice — there are no customers to upset.**

## Open

- [ ] **Blazer tailoring cost** — needed before a blazer can be listed
- [ ] **Confirm "1–2 per piece" is days, not hours** — it changes the revenue
      ceiling by a factor of 8 and decides how much ad spend is even useful
- [ ] Confirm metres per garment with the tailor (Shirt 2.0 / Pants 2.0 /
      Dress 3.0 are my assumptions)
- [ ] Verify Stripe's UAE fee (assumed 2.9% + 1 AED)
- [ ] Re-run once real CAC data exists (after ~2–3k AED of ad spend)
- [ ] Reprice the elaborate dress first — it is the only item outside the band
