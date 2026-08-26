# Shaklek branding

## If you only read one line

**Send `send-to-supplier/`.** That folder is the entire handover, and the PDF
inside it answers the questions a supplier would otherwise email you.

```
branding/
  send-to-supplier/    ⭐ THIS ONE. 6 marks as PDF + PNG, and the spec sheet.
  other-formats/       JPGs, name-only, Arabic-only. Only if asked.
  source/              SVG masters and the two fonts. Do not send these.
  packaging.md         every packaging element, costed against the margin
  voice.md             tone, the "shhhhh" idea, standing corrections
  pages/               the three visual sheets the decisions came out of
```

---

## The two marks

| | |
|---|---|
| **Logo** | `Shaklek` in **Italiana**, a gold rule, `شكلك` in **Reem Kufi**, stacked and centred on each other. |
| **Monogram** | **ش** — the Arabic sheen. For anything too small for the logo: seals, tabs, the favicon, embroidery. |

**The monogram is not an abbreviation, it is the same word.** ش *is* the "sh"
sound and the first letter of شكلك, so one mark carries the Arabic initial, the
Latin initials, and the "shhhhh" idea in `voice.md`. It is also the only part of
the identity that can be embroidered.

**The logo still does the naming.** Nobody knows this brand yet, so a lone
monogram says nothing. The ش is what people recognise afterwards.

## Type

| Role | Face | Note |
|---|---|---|
| The name | **Italiana** | One weight, hairline thins. A signature, not a typeface anything else is set in. |
| Headings | **Cormorant Garamond** | Replaced Georgia sitewide. ⚠️ Runs small: under ~15px it thins out. |
| Arabic | **Reem Kufi** | Even strokes, no hairlines. The embroiderable one. |
| Body, and small reversed type | the system sans | Cormorant at 13px reversed out of black broke up and could not be read. |

All SIL Open Font License. Outlining and commercial use are permitted.

## Colour

| | | |
|---|---|---|
| Ink | `#1A1A1A` | Everything black. Not pure black. |
| Gold | `#9C8445` | The rule and the seal, nowhere else. Always ask for a proof on the real stock: gold shifts hard between paper, kraft and cloth. |
| Natural linen | `#DED3C0` | The bag |
| Unbleached tissue | `#F1ECE1` | The wrap |
| Kraft | `#C8AB84` | The mailer, the paper bag |

Navy `#0A2D4A` and burgundy `#4A1A2D` are **garment** colourways. They belong on
the clothes, not on the packaging, or the parcel competes with what is inside it.

## The three rules that keep being re-learned

1. **Never retype the name in a font.** `source/` is the artwork. Setting
   "Shaklek" in whatever serif a supplier has to hand is how a brand ends up
   with four different logos.
2. **Weave, print, foil or stamp the logo. Stitch the monogram.** Satin stitch
   needs about 1–1.5 mm of stroke; Italiana's thins land near 0.2 mm on a 35 mm
   logo. Reem Kufi has no hairlines anywhere.
3. **Never use "shhhhh" for a discount.** See `voice.md`.

## Rebuilding the artwork

```bash
cd website
node scripts/brand/generate-logo.mjs          # every mark, every format
node scripts/brand/generate-supplier-pdf.mjs  # the spec sheet
```

The fonts sit in `source/fonts/`, so both run offline and produce identical
files every time. The website favicon is built from
`source/shaklek-monogram.svg` — if the mark is regenerated,
`website/src/app/icon.tsx` and `apple-icon.tsx` must be rebuilt from the same
bytes, or the screen mark and the printed mark drift apart.

## Still open

- **A tailor must confirm EU 32**, the smallest trouser size. Its measurements
  are extrapolated from the ladder's own grading, not from a published chart.
- **Real packaging quotes**, and the per-order figure into
  `planning/pricing-todo.md` — the model still budgets AED 2 against a real ~16.50.
- **The "shhhhh" campaign.** Direction approved, nothing built.
