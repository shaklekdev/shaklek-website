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
| **Tailoring per piece** | **UNKNOWN** | ⚠️ still missing |
| Metres per garment | Shirt 2.0 · Pants 2.0 · Dress 3.0 | **My assumption — confirm with the tailor** |
| Payment fees | ~2.9% + 1 AED | Verify against Stripe's UAE pricing page |
| Remake allowance | 5% of orders | My assumption; made-to-order's version of returns |

**Fabric is not the lever.** At 2 metres it is 20–40 AED per garment. Tailoring
labour dominates COGS, which is why the missing number is the whole model.

## Current prices

Shirt 290 · Skirt 320 · Pants 350 · Dress 490 (dossier §9, `catalog.ts:32`).

## 1. Gross margin at today's prices (fabric at 15/m)

| Category | Price | Tailoring 50 | 75 | 100 | 150 |
|---|---|---|---|---|---|
| Shirt | 290 | 59% | 50% | **41%** | **23%** |
| Pants | 350 | 66% | 58% | 51% | **36%** |
| Dress | 490 | 72% | 66% | 61% | 50% |

DTC apparel wants **60–70%**. Below ~55% there is not enough left to fund
advertising. At a tailoring cost of 100 AED, a 290 shirt is already under water
on that test; at 150 it is not a business.

## 2. The number that actually decides the price: CAC

Gross profit is not profit. It is the **entire budget** for ads, overhead and
profit combined.

- Shirt at 290, tailoring 100 → gross **120 AED**. Break-even at CAC 120.
- Pants at 350, tailoring 100 → gross **178 AED**. Break-even at CAC 178.

Estimated CAC for a new UAE fashion label, cold traffic on Meta/Snap/TikTok:

```
CPM 20–60 AED  ·  CTR 1–2%  ·  landing→purchase 1–2%
CPM 30 @ CTR 1.5%          → ~2 AED per click
1.5% purchase rate         → ~67 clicks per order
                           → CAC ≈ 134 AED   (plausible range 80–250)
```

**These are industry-typical assumptions, not measurements.** The only way to
know Shaklek's real CAC is to spend 2,000–3,000 AED and count. Everything below
should be re-run once that number is real.

At CAC 134 and tailoring 100, a 290 shirt **loses money on every acquired
customer.** That, not margin percentage, is the argument for repricing.

## 3. Price for a 25% contribution margin after ads

`P − COGS − fees − CAC ≥ 0.25P`

| | CAC 80 | CAC 134 | CAC 200 |
|---|---|---|---|
| **Shirt** (now 290), tailoring 75 | 300 | **380** | 470 |
| tailoring 100 | 340 | **420** | 510 |
| tailoring 150 | 410 | **490** | 580 |
| **Pants** (now 350), tailoring 100 | 340 | **420** | 510 |
| **Dress** (now 490), tailoring 100 | 360 | **440** | 530 |

## 4. What this says

- **Shirts are the most underpriced item.** Dresses at 490 are roughly right.
- **Shirt and Pants come out at the same price** on these assumptions, because
  both use ~2m of fabric and I had to assume equal labour. That is almost
  certainly wrong — trousers take more work than a shirt. **The price ladder
  should follow tailoring hours per garment**, which is exactly the number
  still missing.
- Provisional target, pending the real tailoring cost: **Shirt ~420, Pants
  ~450–480, Dress ~590**. Treat as a shape, not a decision.

## 5. Launch discount — the right way round

Do **not** discount 290. Raise list to where the economics work, then sell a
founding-customer discount down to roughly today's price:

- List 420 → founding discount 25% → **315**, close to today's 290.
- First buyers pay what they would have paid anyway.
- Everyone after anchors on 420, not 290.
- It gives a real reason to capture an email, which nothing on the site does today.

Stripe Checkout supports promotion codes natively (`allow_promotion_codes`);
there is no discount mechanism anywhere in the codebase today (confirmed by
grep, 2026-08-22).

**Now is the cheapest possible moment to reprice: there are no customers to
upset.**

## Open

- [ ] **Tailoring cost per piece, per category** — blocks everything above
- [ ] Confirm metres per garment with the tailor
- [ ] Verify Stripe's UAE fee (assumed 2.9% + 1 AED)
- [ ] Re-run this once real CAC data exists (after ~2–3k AED of ad spend)
- [ ] Decide whether Skirt (320) stays between Shirt and Pants once labour is known
