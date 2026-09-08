# Tailor capacity — when to hand work to the next tailor

Reference note, 2026-08-22. **This is a lead-time tool, not a limit on orders.**
Never cap ordering, never add a waitlist, never show "sold out". If demand
outruns the bench, the answer is another tailor — never a slower site.

---

## The inputs

- **1–2 days per piece, per tailor** (confirmed with the tailor, 2026-08-22)
- **~22 working days a month**
- **10 days** — the turnaround promised on the live site. This is the number
  that breaks first, and it is a public promise.

## What one tailor sustains

| Days per piece | Pieces/month | Orders/week | Safe backlog | **Hand over at** |
|---|---|---|---|---|
| 1 day | 22 | 5.1 | 9 waiting | **7 waiting, or 4/week** |
| 1.5 days (plan on this) | 14.7 | 3.4 | 5 waiting | **4 waiting, or 2.7/week** |
| 2 days | 11 | 2.5 | 4 waiting | **3 waiting, or 2/week** |

**"Safe backlog"** is how many unstarted orders one tailor can still clear inside
the 10-day promise: `(10 − make time) ÷ make time`.

**"Hand over at"** is 80% of that. The margin is not caution for its own sake —
orders arrive in lumps, especially the day an ad starts working, and a queue run
at 100% never recovers from a spike.

## The rule, in one line

> **When more than 4 paid orders are waiting to be started, or new orders have
> run above ~3 a week for two weeks, bring in the next tailor.**

That is the 1.5-day row, which is the sensible planning assumption until real
throughput data exists.

## Multiply by the bench

Both triggers scale linearly. Two tailors: hand over the moment the *queue*
exceeds 8, or sustained orders exceed ~5.4/week. Three: 12 and ~8/week.

| Tailors | Sustained orders/week | Queue trigger |
|---|---|---|
| 1 | 2.7 | 4 |
| 2 | 5.4 | 8 |
| 3 | 8.1 | 12 |
| 4 | 10.8 | 16 |

## Where to read the number

`/dashboard/orders`. Count orders sitting at **`paid`** — those are paid and not
yet started. `in_progress` is already on someone's table and does not count
toward the queue.

There is no alert for this today. It is a number to eyeball while doing the
WhatsApp handoff, which happens per order anyway.

## What would make this note wrong

- **Tailors are not interchangeable.** A second maker is only capacity if a
  customer cannot tell which one cut their garment. They must work from the same
  spec sheet to the same quality bar, or extra throughput just buys inconsistency.
- **Make time varies by garment.** A dress at 85 AED of tailoring is not a shirt
  at 40. Once there is real data, split this table by category.
- **The 10-day promise is a choice.** If it is genuinely 14 days, say 14 on the
  site and the safe backlog nearly doubles. An honest longer promise buys more
  headroom than any scheduling trick.

## Open

- [ ] How many tailors are on the bench, and are they available concurrently?
- [ ] Real make time per category, measured, not estimated
- [ ] Confirm every tailor works from the same spec sheet

---

## ⏳ OPEN WITH THE TAILOR — ask these in one visit (2026-09-08)

Eight questions, all cheap, and four of them are blocking real decisions
elsewhere. He is Danish, Taylor Moon Shine.

### Blocking the measurement form

1. **Demonstrate all seventeen measurements**, do not just name them. His list is
   in `planning/frontend-todo.md`. **Three are ambiguous and must not be guessed
   into a form:** "Need" (almost certainly Knee), "Hand length"
   (shoulder-to-wrist, or wrist-to-fingertip?), and trouser "Length" (outseam
   from the waist, or from where?).
2. **Agree the convention for each one, and write it down.** A waist at the
   narrowest point and a waist where trousers sit are 3-5cm apart. If the
   founder measures one while he cuts to the other, every garment is wrong and
   it presents as a fit failure rather than a definition mismatch. This is the
   single largest risk in the whole fitting service.

### Blocking the margin model

3. **Metres per garment, per pattern.** `planning/margins.mjs` uses **2.2m** for
   a shirt and 2.8m for a wide-leg trouser, and both are estimates from
   2026-08-28 that have never been measured. Worth up to **3 margin points** on
   every garment. Have him cut one of each and report the actual metres.
4. **Confirm his prices, and get the volume tiers.** On record: shirt 40, skirt
   60, trousers 60, dress 85. **He has confirmed the rate comes down with volume
   (2026-09-08)** — so ask for the actual numbers at 10, 20 and 30 pieces a
   month and put them in `margins.mjs`. Worth about **4.5 margin points** if it
   reaches 20 AED a shirt.

   ⚠️ **This is why hiring tailors is off the table for now, and the reasoning
   should not be re-derived.** Subcontracting is a purely variable cost: sell
   nothing, pay nothing, and his premises and machines are included in the rate.
   An employed tailor is fixed cost plus a workshop plus visa sponsorship, and
   against 40 AED a piece it only breaks even somewhere above 60-125 pieces a
   month depending on the all-in package. At 20 orders a month employing costs
   three to six times MORE per garment, not less. Revisit only when volume is
   consistently past that break-even.

### Blocking the care label (500 units, unordered)

5. **Wash a sample.** Shirley states the China linen is water-washed with **~1%
   residual shrinkage**, which would let the label say machine washable instead
   of dry clean only. That is a supplier's sentence, not a test. Wash one of the
   four fit-sample sets and measure it before 500 labels are printed. **Both
   Zara and Massimo Dutti print machine wash**, so this is now competitive, not
   just a customer nicety.
6. **What thread does he sew with?** If it is polyester, the hang tag's
   "100% PLANT BASED FABRIC" is still true (it says fabric) but "100% natural
   materials" in any marketing copy would not be. Cotton thread is weaker, so
   this is a real trade-off, not an obvious switch.

### Blocking growth, and the one nobody has costed

7. **Capacity: how many pieces per week, realistically?** Make time on record is
   1-2 days per piece per tailor. **Fulfilment is the ceiling on this business,
   not demand** — see the scaling note in `planning/unit-economics.md`. Ask what
   happens at 5 pieces a week, and at 20.
8. **When can he make the four fit-sample sets?** The 30% linen at 10 AED/m is
   already bought for exactly this, and the samples are what turn the 5% remake
   assumption into a measured number.
