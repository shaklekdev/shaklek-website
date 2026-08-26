# `_archive/` — superseded, but deliberately not deleted

Nothing in here is used by the website, referenced by any code, or part of any
build. It is kept because **deleting is not reversible and some of it cost
money to produce.**

If you are looking for something the site actually uses, it is not here — see
the README at the repo root.

| Folder | What it is | Why it is kept |
|---|---|---|
| `generated-not-in-catalog/` | 12 Pleated Trousers combos, generated 2026-08-21, that `catalog.ts` never referenced | **Money already spent.** CLAUDE.md's rule is that a generated image is never deleted — a rejected shape is often the right answer for a different item. Has its own README |
| `early-brand-story-2026-08-10.html` | The first brand-story page | Superseded by the live site and `branding/voice.md`. Referenced by nothing |
| `shaklek_logo_*.html` (3 files) | Logo prototypes from 2026-08-15 | Superseded by `branding/send-to-supplier/`, which holds the final artwork as PDF and PNG. Referenced by nothing |
| `screenshots-2026-08-15/` | 21 screenshots | Purpose unclear, nothing references them. **Gitignored** — 31MB with no value in history |
| `downloaded-tech-packs/` | Tech pack PDFs downloaded from the dashboard | ⚠️ **Gitignored, and must stay so.** The filename carries an order id and the document carries that customer's measurements |

## What is NOT here, on purpose

- **`catalog-archive/`** stays at the root. It is the archive of paid image
  generations and is actively consulted; it is not superseded work.
- **`insparation/`** stays at the root. It was modified 2026-08-26 and is a
  live input to the social content being produced.
- **`brand-assets/`** stays at the root. It is the working folder for Instagram
  and TikTok production. ⚠️ It is gitignored and exists **on disk only** — it
  cannot be recovered from git if it is lost.
