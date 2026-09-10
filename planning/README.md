# planning/

Everything here is live. Anything superseded is in `archive/` — kept, not deleted.

## Read first

| | |
|---|---|
| **`session-log.md`** | What happened, what is open, who is holding which file. More than one Claude session works this repo. **Read before starting, update before finishing.** |
| **`launch-checklist.md`** | How to open the site. The gate breaks the Stripe and Clerk webhooks and the 06:00 reconcile job, so the order matters. |

## The money

| | |
|---|---|
| **`margins.mjs`** | **The margin model. Run it, do not retype it.** `node planning/margins.mjs` — reads prices from `catalog.ts`, holds every cost input in one block. A quote lands → change one number → re-run. |
| **`unit-economics.md`** | Whether this is viable: margins, cash exposure, the MVP sequence, the pending inputs. |
| **`pricing-todo.md`** | Decision *history*. Kept for the reasoning; any figure in it may be stale. |

## The work

| | |
|---|---|
| **`tailor-capacity.md`** | Open questions for the tailor, and his 17-measurement list. |
| **`measurement-sheet.html` / `.pdf`** | Printable fitting sheet, in his exact labels. A4, one page. |
| **`frontend-todo.md`** | Customer-facing site: built vs open. Includes the measurement-form gap. |
| **`catalog-images-todo.md`** | Photography status and known defects. |
| **`marketing/`** | Positioning, launch grids, captions, calendar. Start at `todo.md`. |
| **`security/`** | The external audit and its root-cause analyses. Read `rca-2026-08-23.md` once. |
| **`aws-architecture-diagram.html`** | What is actually deployed. Open it in a browser. **Every environment change goes in here the same session.** |

## archive/

Superseded or done, kept because the reasoning still explains decisions that are
live: incorporation, the go-live runbook, the Clerk migration plan, the
founder-notes triage, the AI roadmap, trend sourcing, AWS infrastructure,
backend, payment/auth, web design, and the old `tomorrow-start-here.md`.
