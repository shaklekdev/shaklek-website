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
