# Shaklek logo files

Generated 2026-08-26. **Text is converted to outlines** — no printer needs the
fonts installed, and no substitution can happen silently at the plate.

Latin: **Italiana**. Arabic: **Reem Kufi**. Both SIL Open Font License, so
outlining and commercial use are permitted.

## Which file to send

**Formats.** Every mark exists as four files. Send the supplier vector; the
rest are fallbacks.

| | |
|---|---|
| `.svg` | Vector. Universal, opens in anything. |
| `.pdf` | Vector. What most print and label suppliers actually ask for. |
| `.png` | Transparent, 3000px wide (1600px for the square marks). For anyone who cannot take vector. |
| `.jpg` | Flattened, same size. White behind the dark marks, **black behind the reversed ones**, so a reversed mark is not delivered as black on black. |

**Marks.**

| File | Use |
|---|---|
| `shaklek-lockup-colour` | **The default.** Black wordmark, gold rule, Arabic. Anything printed in more than one colour. |
| `shaklek-lockup-black` | One colour: the rule goes black too. Cheaper on nearly every process. |
| `shaklek-lockup-white` | Reversed, for anything dark. |
| `shaklek-wordmark-black` / `-white` | Latin only, where the lockup is too tall. |
| `shaklek-arabic-black` / `-white` | `شكلك` on its own. |
| `shaklek-monogram-black` / `-white` / `-gold` | **ش, the short mark.** Seals, tabs, favicons, embroidery. |
| `shaklek-seal-gold` | The mark reversed out of a gold disc. The tissue sticker. |

**Send `../Shaklek-artwork-for-suppliers.pdf` with them.** It is the two-page
sheet that says which mark goes on which item, the colours in CMYK, minimum
sizes, clear space, and which processes will not work. It is drawn as vector
outlines, so it is itself usable artwork.

## The Arabic is the embroidery file, and that is deliberate

Italiana is very high contrast — its thin strokes run close to hairlines, which
is what makes it look like a fashion label and also what stops it being
stitched. Satin stitch needs roughly **1–1.5 mm** of stroke; on a 35 mm wordmark
Italiana's thins land near **0.2 mm**.

`شكلك` in Reem Kufi has even, substantial strokes and no hairlines anywhere. It
embroiders at any size on any cloth. The gold rule stitches well too.

**So: weave, print, foil or stamp the full lockup. Stitch the Arabic.**
Full reasoning and the process table are in `../packaging.md`.

## Rules

- **Never retype the wordmark in a font.** These files are the artwork. Setting
  "Shaklek" in whatever serif a supplier has to hand is how a brand ends up with
  four different logos.
- **Keep the proportions.** Scale the whole file; never stretch one axis, and
  never move the Arabic or the rule independently — they centre on the wordmark.
- **Leave clear space** of about the wordmark's cap height on every side.
- **The gold is #9C8445.** For anything spot-printed, ask the supplier to match
  to that value on the actual stock and send a proof — gold shifts hard between
  paper, kraft and cloth.

## Regenerating

```bash
cd website
node scripts/brand/generate-logo.mjs          # all marks, all formats
node scripts/brand/generate-supplier-pdf.mjs  # the sheet to send with them
```

The two fonts sit in `fonts/` beside this file, so both run offline and produce
identical output a year from now. The generator uses `fontkit` to shape and
outline the text. **The shaping is the part not to hand-roll:** `شكلك` is four
joining letters and Reem Kufi builds `ش` from `س` plus its dots, so a naive
per-character glyph lookup produces five disconnected shapes that still render,
still export, and would reach a printer looking wrong to every Arabic reader.
The output here was checked side by side against the live site before shipping.
