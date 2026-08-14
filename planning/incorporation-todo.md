# Incorporation — TODO

Status: **trade license issued** (as of 2026-08-14) — the Instant Licence application referenced below went through. Next real step is the corporate bank account: founder has identified **Wio Bank** (UAE digital-first business bank) as the path for the business account needed to unlock Stripe. Trade license details/number not yet logged here — worth pasting in once handy for future reference.

You're already a UAE resident with an Emirates ID and setting up in Dubai — no investor/residency visa needed. Checked directly against the official Invest in Dubai government portal (12 August 2026): the core retail activity ("Ready-made Garments Trading") is confirmed approval-free, meaning the fast ~5-minute **Instant Licence** is very likely available. Decision: apply now with Ready-made Garments Trading only — don't wait on confirming whether "Tailoring" also qualifies, that can be added later by amending the license once the business is running. Getting a real license issued matters more right now than getting the activity list perfectly complete on day one.

Not legal or tax advice — this is a researched starting checklist, not a substitute for a real Dubai business-setup consultant or the DED itself confirming specifics before you pay for anything.

## The one decision that actually matters: Mainland, not Free Zone

Every generic "mainland vs free zone" guide leads with free zone being cheaper and faster to set up — true, but it's the wrong default for Shaklek specifically, for one concrete reason:

**Free zone companies generally cannot sell directly to UAE consumers via their own website with direct physical fulfillment.** That restriction exists specifically for the exact business model Shaklek is — direct-to-consumer, own site, physically delivering made-to-order garments — not for exporters or B2B. Free zone e-commerce licenses do allow selling *through marketplaces* like Amazon.ae/Noon, or internationally, but that's not the plan here. Shaklek's whole customer base is UAE/GCC, ordering and getting garments delivered directly.

**So: go Mainland (Dubai DED), not a free zone**, unless a specific reason to prefer free zone shows up later (there's also a hybrid option since 2025 — a free zone company can get a mainland branch permit for ~AED 5,000 for up to 6 months, so free-zone-then-add-mainland isn't a dead end if the cost tradeoff ever matters — but there's no reason to start there given the direct answer is just to go mainland first).

## Which licence type — checked against the official Invest in Dubai portal

Dubai's own portal (Invest in Dubai) lists three mainland trade licence types. This matters a lot for Shaklek specifically:

- **Instant Licence** — issued in ~5 minutes, for activities that don't need external/third-party approval. Includes a **virtual site for the first year** (solves the physical-address requirement below), Dubai Chamber membership, a GDRFA establishment card, and a MOHRE establishment card allowing up to **3 employees**. Available to Sole Establishment, LLC, LLC-SO, and Civil Company structures.
- **Normal Licence** — needs an MOA and an actual site lease contract (Ejari). Required if the chosen activity needs external approval, or once the business outgrows the Instant Licence's scope.
- **eTrader Licence** — sole establishment only, home-based, ~AED 1,370 all-in (AED 1,070 licence + AED 300 Chamber fee). Cheapest and fastest, but likely too narrow for where this is headed (no employee allowance, home-based only).

**Confirmed via UAE business-activity classification: "Ready-made Garments Trading" (activity codes 4771.00–4771.95) does not require third-party approval**, and isn't subject to AML regulation. That's the specific condition the Instant Licence requires — so Shaklek's core retail activity is very likely Instant-Licence-eligible.

The one open question: Shaklek isn't *only* ready-made garments trading — it's made-to-order/tailoring plus an e-commerce platform. "Tailoring" as a services activity may sit under a different code with different rules than the pure trading code above. **This is the actual thing to check on the Invest in Dubai portal's activity search before applying** — search both "Ready-made Garments Trading" and "Tailoring," and if both come back approval-free, Instant Licence is the clear fast/cheap starting point; if tailoring needs Normal Licence, that likely governs which route the whole application takes.

## Checklist, in order

- [x] **Decide legal structure** — Mainland Sole Establishment (single owner, simplest, no MOA needed)
- [x] **Reserve the trade name "Shaklek"** with Dubai DED via the Invest in Dubai portal — done 12 August 2026, Application No. BL-20260812026191
- [x] **Apply for the Instant Licence** — trade license issued as of 14 August 2026
- [ ] **Corporate bank account** — founder is opening with **Wio Bank**. UAE banks are generally slow/selective with new small e-commerce businesses, but Wio specifically markets itself as fast digital-first onboarding for SMEs, which fits here. This is what actually unlocks Stripe below.
- [ ] *(Deferred, not blocking)* Confirm whether "Tailoring" also qualifies as approval-free — add as a second activity later via a license amendment once the business is running, not before

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
- [Request to issue a trade licence — Invest in Dubai (official Government of Dubai portal)](https://invest.dubai.ae) — Instant/Normal/eTrader licence types, confirmed directly against this page
- [Ready-made Garments Trading License in Dubai — IFZA](https://ifza.com/en/commercial-licence/ready-made-garments-trading-license-dubai/) — activity codes 4771.00–4771.95 confirmed no third-party approval required
