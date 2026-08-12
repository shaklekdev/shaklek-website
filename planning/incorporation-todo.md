# Incorporation — TODO

Status: **nothing started.** This has been referenced repeatedly across the other planning docs as a blocker (Stripe merchant account, trademark registration, a real business bank account) but never actually scoped until now. You're already a UAE resident with an Emirates ID and setting up in Dubai — that rules out needing an investor/residency visa as part of this, which simplifies things a lot.

Not legal or tax advice — this is a researched starting checklist, not a substitute for a real Dubai business-setup consultant or the DED itself confirming specifics before you pay for anything.

## The one decision that actually matters: Mainland, not Free Zone

Every generic "mainland vs free zone" guide leads with free zone being cheaper and faster to set up — true, but it's the wrong default for Shaklek specifically, for one concrete reason:

**Free zone companies generally cannot sell directly to UAE consumers via their own website with direct physical fulfillment.** That restriction exists specifically for the exact business model Shaklek is — direct-to-consumer, own site, physically delivering made-to-order garments — not for exporters or B2B. Free zone e-commerce licenses do allow selling *through marketplaces* like Amazon.ae/Noon, or internationally, but that's not the plan here. Shaklek's whole customer base is UAE/GCC, ordering and getting garments delivered directly.

**So: go Mainland (Dubai DED), not a free zone**, unless a specific reason to prefer free zone shows up later (there's also a hybrid option since 2025 — a free zone company can get a mainland branch permit for ~AED 5,000 for up to 6 months, so free-zone-then-add-mainland isn't a dead end if the cost tradeoff ever matters — but there's no reason to start there given the direct answer is just to go mainland first).

## Checklist, in order

- [ ] **Decide legal structure** — almost certainly a **Mainland Sole Establishment** (single owner, simplest) unless you're bringing on a co-founder/investor soon, in which case an **LLC** structure fits better. Worth deciding this before the next steps since it changes the paperwork.
- [ ] **Reserve the trade name "Shaklek"** with Dubai DED — check it's not already taken as a UAE trade name (separate from the trademark check below)
- [ ] **Confirm the business activity code(s)** with DED or a setup consultant — likely something like "Ready-made Garments Trading" plus an e-commerce activity code. Getting this wrong or too narrow can block adding services later (e.g. the tailor-swipe/trend-dashboard side of the business), so worth getting right the first time rather than cheapest-first.
- [ ] **Initial approval** from DED
- [ ] **MOA** (Memorandum of Association) if structured as an LLC — not needed for a sole establishment
- [ ] **Physical address / Ejari** — mainland licenses generally require a real registered address (could be a small office, sometimes a flexi-desk qualifies depending on activity — confirm which applies to this activity code)
- [ ] **Trade license issuance** — this is the document everything downstream depends on
- [ ] **Corporate bank account** — flag this now: UAE banks are known to be slow and selective with new small e-commerce businesses, often taking several weeks and sometimes multiple bank attempts even with a valid trade license in hand. Start this the moment the license is issued, not after.

## What this unblocks, once the trade license exists

- [ ] **Stripe merchant account** — Stripe UAE accepts a mainland trade license directly (also accepts free zone, for reference, so this specific piece wasn't actually the reason to go mainland — the direct-to-consumer restriction above was). Needs: trade license, MOA (if applicable), active UAE business bank account, and passport/Emirates ID/visa copies for any owner with 25%+ ownership. See `payment-auth-todo.md`.
- [ ] **UAE trademark registration for "Shaklek"** — start this in parallel, not after, since it's the slow one:
  - Filed once with the Ministry of Economy & Tourism's federal system — covers all 7 emirates, no separate per-emirate filing
  - Cost: roughly **AED 6,500** for application/examination/publication, plus a further **AED 5,000** final registration fee after the opposition period clears — call it **~AED 11,000–12,000 all-in per class** (a class = a category of goods/services; confirm which class(es) actually cover made-to-order clothing + a digital platform, may need two)
  - Timeline: **6–12 months** (clearance search, examination, publication, opposition window) — this is why it shouldn't wait for the trade license to be fully done first if the name search comes back clear
  - Protection: 10 years, renewable indefinitely
  - Do the trademark *search* first (not mandatory, but skipping it is reportedly the most common reason applications fail at examination) — worth doing before spending anything on the name

## Rough cost reality check

Don't take these as quotes — they vary by consultant/free zone/activity and change often — but as an order-of-magnitude sanity check against a real quote before agreeing to pay anyone:

| Item | Rough range |
|---|---|
| Mainland trade license + initial approval + name reservation | Varies significantly by activity and office requirement — get an actual DED or consultant quote, don't assume a free-zone headline price applies |
| Trademark registration (one class, all UAE) | ~AED 11,000–12,000 total, paid in two stages |
| Corporate bank account | Usually free to open, but budget time (weeks), not money |

## Next
1. Get a real quote + activity-code confirmation from Dubai DED directly, or a reputable Dubai business-setup consultant — treat this doc as the question list to bring to that conversation, not the final answer
2. Start the trademark name search in parallel — it's slow and doesn't block on the trade license
3. Once the license exists: Stripe merchant account (`payment-auth-todo.md`), corporate bank account, then the AWS/domain/email accounts can eventually move under the real legal entity instead of a personal one

---
Sources checked 2026-08-12:
- [Mainland vs. Free Zone in the UAE 2026 — Fragomen](https://www.fragomen.com/insights/mainland-vs-free-zone-in-the-uae-choosing-the-right-company-structure-in-2026.html)
- [Free Zone vs Mainland Online Business UAE 2026 — FreeZoneCompare](https://freezonecompare.com/blog/free-zone-vs-mainland-online-business-uae/)
- [E-commerce License in Dubai — IFZA](https://ifza.com/en/commercial-licence/e-commerce-license-dubai/)
- [UAE business verification requirements — Stripe Support](https://support.stripe.com/questions/uae-business-verification-requirements)
- [UAE account activation requirements — Stripe Support](https://support.stripe.com/questions/uae-account-activation-requirements)
- [Trademark Registration in UAE 2026 — Emirabiz](https://emirabiz.com/trademark-registration-process-uae/)
- [Register Trademark — UAE Ministry of Economy & Tourism](https://www.moet.gov.ae/en/w/register-trademark%C2%A0)
