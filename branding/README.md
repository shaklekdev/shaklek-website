# Shaklek branding

Everything visual, in one place. Settled 2026-08-26 with the founder.

```
branding/
  README.md                            you are here, the decisions
  Shaklek-artwork-for-suppliers.pdf    ⭐ SEND THIS ONE. Two pages: which
                                       mark on which item, CMYK, sizes,
                                       clear space, and what cannot be done
  logo/                                44 files. 11 marks x svg/pdf/png/jpg
  packaging.md                         every element, costed against margin
  voice.md                             tone, "shhhhh", standing corrections
  pages/                               the sheets the decisions came out of
```

## Sending this to a supplier

Send **`Shaklek-artwork-for-suppliers.pdf`** and the `logo/` folder. That is the
whole handover; the PDF answers the questions they would otherwise ask.

Regenerate both with:

```bash
cd website
node scripts/brand/generate-logo.mjs
node scripts/brand/generate-supplier-pdf.mjs
```

The fonts sit in `logo/fonts/`, so this runs offline and is byte-identical every
time. The website favicon is built from `logo/shaklek-monogram-black.svg`, so
if the mark is ever regenerated, `website/src/app/icon.tsx` and `apple-icon.tsx`
must be rebuilt from the same bytes or the screen mark and the printed mark
drift apart.

---

## The marks

| | |
|---|---|
| **Wordmark** | `Shaklek` in **Italiana**, a gold rule, `شكلك` in **Reem Kufi**, stacked and centred on each other. This is the logo. |
| **Monogram** | **ش** — the Arabic sheen. Used where the lockup cannot go: the seal, a woven tab, a stitched cuff, the favicon. |

**The monogram is not an abbreviation, it is the same word.** ش *is* the "sh"
sound and the first letter of شكلك — so one mark carries the Arabic initial, the
Latin initials, and the "shhhhh" idea in `voice.md`. It is also the only part of
the identity that can be embroidered.

**The wordmark still does the naming.** Nobody knows this brand yet, so a lone
monogram says nothing. The ش is what people recognise afterwards.

## Type

| Role | Face | Note |
|---|---|---|
| Wordmark | **Italiana** | One weight, hairline thins. A signature, not a typeface anything else is set in. |
| Headings | **Cormorant Garamond** | Replaced Georgia sitewide. ⚠️ Runs small — under ~15px it thins out. |
| Arabic | **Reem Kufi** | Even strokes, no hairlines. The embroiderable one. |
| Body, and small reversed type | the system sans | Cormorant at 13px reversed out of black broke up and could not be read. |

All SIL Open Font License. Outlining and commercial use are permitted.

## Colour

| | | |
|---|---|---|
| Ink | `#1A1A1A` | Everything black. Not pure black. |
| Gold | `#9C8445` | The rule, and only the rule. Ask any supplier for a proof on the real stock — gold shifts hard between paper, kraft and cloth. |
| Natural linen | `#DED3C0` | The bag |
| Unbleached tissue | `#F1ECE1` | The wrap |
| Kraft | `#C8AB84` | The mailer, the paper bag |

Navy `#0A2D4A` and burgundy `#4A1A2D` are **garment** colourways. They belong on
the clothes, not on the packaging, or the parcel competes with what is inside it.

## The three rules that keep being re-learned

1. **Never retype the wordmark in a font.** `logo/` is the artwork. Setting
   "Shaklek" in whatever serif a supplier has to hand is how a brand ends up
   with four different logos.
2. **Weave, print, foil or stamp the lockup. Stitch the Arabic.** Satin stitch
   needs about 1–1.5 mm of stroke; Italiana's thins land near 0.2 mm on a 35 mm
   wordmark. Reem Kufi has no hairlines anywhere. Full table in `packaging.md`.
3. **Never use "shhhhh" for a discount.** See `voice.md`.

## What is still open

- **A tailor must confirm EU 32** — the smallest trouser size. Its body
  measurements are extrapolated from the ladder's own grading, not taken from
  any published chart. See `website/src/data/sizeChart.ts`.
- **Real packaging quotes**, and the per-order figure into
  `planning/pricing-todo.md` — the model still budgets AED 2 against a real
  ~16.50.
- **The "shhhhh" campaign itself.** Direction approved, nothing built.
