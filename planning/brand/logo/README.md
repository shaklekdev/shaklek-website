# Shaklek logo files

Generated 2026-08-26. **Text is converted to outlines** — no printer needs the
fonts installed, and no substitution can happen silently at the plate.

Latin: **Italiana**. Arabic: **Reem Kufi**. Both SIL Open Font License, so
outlining and commercial use are permitted.

## Which file to send

| File | Use |
|---|---|
| `shaklek-lockup-colour.svg` | **The default.** Black wordmark, gold rule (#9C8445), Arabic. Anything printed in more than one colour. |
| `shaklek-lockup-black.svg` | One-colour printing — the rule goes black too. Cheaper on nearly every process. |
| `shaklek-lockup-white.svg` | Reversed, for anything dark: the mailer, a navy bag, a black card. |
| `shaklek-wordmark-black.svg` / `-white.svg` | Latin only, where the lockup is too tall — a narrow label, a strip along a bag. |
| `shaklek-arabic-black.svg` / `-white.svg` | **The embroidery file.** See below. |
| `*@3000.png`, `*@1600.png` | Transparent PNG, for a supplier who cannot take vector. Vector first, always. |

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

The generator lives in this session's notes rather than the repo, because it
runs once. It uses `fontkit` (already a dependency of the website) to shape and
outline the text. **The shaping is the part not to hand-roll:** `شكلك` is four
joining letters and Reem Kufi builds `ش` from `س` plus its dots, so a naive
per-character glyph lookup produces five disconnected shapes that still render,
still export, and would reach a printer looking wrong to every Arabic reader.
The output here was checked side by side against the live site before shipping.
