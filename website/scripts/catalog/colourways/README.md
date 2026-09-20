# Colourways

Four commands. The only step a machine cannot do is deciding where the garment
ends, and that is the only step with a human in it — **once per photograph,
ever**. After that every colour is free, including colours nobody has asked for
yet.

```bash
node scripts/catalog/colourways/prepare-masks.mjs      # candidate masks
node scripts/catalog/colourways/preview-masks.mjs      # one sheet to check them
node scripts/catalog/colourways/mask-editor.mjs        # ← her part, in a browser
node scripts/catalog/colourways/recolour.mjs           # every missing colour
node scripts/catalog/colourways/install-colourways.mjs # check, then --apply
```

Working folder: `~/Shaklek-colourways`, deliberately **outside the repo**.
The masks are what cost human time, so those get committed, as small PNGs.
**Not `~/Desktop`** — iCloud syncs it, and a file syncer writing the same bytes
as another process is what corrupted this repo's git index nineteen times over
(CLAUDE.md §6).

## ⚠️ There is no Photoshop in this pipeline, and there was never a need for one

The installed copy is Photoshop 2020 (21.2.2), which asks for macOS 10.13. This
machine is on **26.6.2** and it will not launch. Buying a Creative Cloud
subscription to paint sixteen masks is not a reasonable answer, and neither is
uploading unreleased product photography to a free web editor.

The recolour itself is arithmetic — remap luminosity, set hue and saturation —
and `recolour.mjs` does it with sharp, deterministically. Photoshop was only
ever wanted for the masking, so `mask-editor.mjs` covers that and nothing else:
a brush, an eraser, undo, save. It binds to `127.0.0.1` and nothing leaves the
machine.

## Why a human masks at all

Colour alone cannot find this garment's edge. Burgundy sits at h≈353 and its hue
window wraps past 360 into skin; shadowed skin and shadowed burgundy are
genuinely the same colour. A full day of automated attempts on 2026-09-19 ended
at *"hands are still blue claude"* and *"it's very very bad"*.

The candidates exist so she refines rather than cuts. Two different strategies,
both measured rather than assumed:

| Garment | Found by | Because |
|---|---|---|
| Open Abaya, burgundy | hue near 353, lightness ≤ 0.62 | dark on a pale set |
| Buttoned Abaya, ivory | warmth `R-B ≥ 5`, lightness ≥ 0.65 | the linen is warm, the studio is cool |

The second one replaced background subtraction, which produced a moth-eaten
mask that caught her hair and the shadow at her feet. The numbers behind it are
in `prepare-masks.mjs` and they are a property of **these photographs**, not of
the colour ivory. Re-measure on a new shoot.

## The one result to look at first

`recolour.mjs` goes light-to-dark easily and **dark-to-light badly**. The Open
Abaya is burgundy at l≈0.25; Ivory sits at l≈0.94. Judge Open Abaya / Ivory
before trusting the batch — if the linen goes plastic there, that colourway
wants a real photograph, not a recolour. Navy from burgundy is a small move and
came out clean on the first pass.

## Verified

- `recolour.mjs` has been run end to end: 16 files to Navy, and the Open Abaya's
  result is clean with the weave intact.
- `install-colourways.mjs` refuses a **partial** colourway rather than
  installing what it has. A colour missing one cell falls back to another
  silhouette on that slider position and reads as a rendering bug, not a
  missing file.
- `mask-editor.mjs` has been started and served, but the brush itself has only
  been exercised by hand — expect a rough edge and say so.
