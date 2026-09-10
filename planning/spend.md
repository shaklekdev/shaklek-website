# What this has cost, since the start

**Every figure here is either verifiable in this repo or was told to me
directly. Anything I do not know is marked `?` for the founder to fill —
a guessed number in a spend record is worse than a blank one.**

Last updated 2026-09-10.

---

## Committed and paid

| | AED | Source |
|---|---|---|
| **Trade licence** — Shaklek For Online Selling, no. 1645657 | **~1,300** | Founder, 2026-09-10. Instant Licence, Dubai |
| **Fabric** — 124m W300235, invoice 6,449.86 RMB | **3,516** | Shirley Gz, paid 2026-09-10 |
| **Packaging** — Fitoor FRP2609-1113, 50% advance of 4,567.50 | **2,284** | Paid 2026-09-10 |
| **Sample fabric** — 30% linen for 4 fit sets, 10 AED/m | **?** | Metres bought not recorded |
| | | |
| **Subtotal paid** | **~7,100** | |

## Committed, not yet paid

| | AED |
|---|---|
| Packaging balance, due before delivery | **2,284** |
| Fabric shipping, billed after weighing (~27kg) | **~861** |
| **Total still to pay** | **~3,145** |

**So the full committed position is about AED 10,250.**

---

## Running costs

| | AED | Notes |
|---|---|---|
| Claude subscription | **?** | Founder to fill: plan and monthly rate |
| AWS Amplify hosting | **?** | Should be small; check the bill |
| Neon Postgres | **?** | Likely free tier |
| Clerk | **?** | Likely free tier |
| Resend | **?** | Likely free tier |
| Domain, shaklek.com | **?** | Annual |
| Trade licence renewal | **?** | Annual |

## Image generation

Gemini, for the catalogue photography. From the cost records in `CLAUDE.md`:

| | USD |
|---|---|
| Cargo Trousers | ~2.10 |
| Banded Trousers | ~2.30 |
| A clean item, roughly | ~1.50 |
| **Eight items, estimated** | **~15** |

⚠️ **Estimated, not measured.** The actual total is in the Google AI Studio
billing history and nobody has read it. Worth checking once and recording here,
because it is the only line that scales with future catalogue work.

---

## Decided against, so far

Recorded so the savings are visible and the decisions are not re-litigated:

| | AED avoided | Why |
|---|---|---|
| Local linen instead of China | ~3,600 | 65/m against 36.08 landed, over 124m |
| Duplicate care-label design | 389 | Fitoor quoted 500 of each of two designs when only one fibre exists |
| Fitoor's cotton bag at 20 | 300 | Negotiated to 17 |
| Tissue wrap and tissue seal | 488 | Dropped; the cotton bag is already the wrap |
| Hiring tailors instead of subcontracting | — | Fixed cost plus a workshop plus visas, against a variable 40/piece. Does not break even below ~60-125 pieces a month |

## Not spent, and deliberately

- **Trademark registration** — quoted ~11,000-12,000 per class. Open, not started.
- **Advertising** — zero to date. The plan is ten organic sales first.
- **Cotton fabric** — no commitment; 25 AED/m buys it 2.2m at a time.

---

## How to keep this true

Add a row the day money leaves the account, not later. The margin model
(`margins.mjs`) covers per-garment cost; this file covers everything that is not
per-garment, which is the half that otherwise goes unrecorded.
