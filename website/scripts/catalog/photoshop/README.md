# Colourways, through Photoshop

Four scripts. Two run in Node, two run inside Photoshop. The only step that
needs a human is the masking, and it is needed **once per photograph, ever** --
after that every colour is free, including colours nobody has thought of yet.

```
1  node scripts/catalog/photoshop/prepare-masks.mjs     candidate masks
2  node scripts/catalog/photoshop/preview-masks.mjs     one contact sheet to check them
3  Photoshop: File > Scripts > Browse > build-psds.jsx  16 ready-to-edit PSDs
   -- the founder corrects each "garment" channel and saves --
4  Photoshop: File > Scripts > Browse > recolour.jsx    48 recoloured JPEGs
5  node scripts/catalog/photoshop/install-colourways.mjs   check, then --apply
```

Working folder is `~/Shaklek-colourways`, deliberately **outside the repo**:
PSDs with alpha channels run to several MB and sixteen of them would put ~60MB
of derivable binary in git forever. The masks are what cost human time, so those
get committed, as small 8-bit PNGs.

**Not `~/Desktop`.** iCloud syncs it, and a file syncer writing the same bytes
as another process is what corrupted this repo's git index nineteen times over
(CLAUDE.md §6).

## What the founder actually does

In each PSD: `Select > Load Selection > garment`, fix it, then
`Select > Save Selection > Channel: garment (Replace)`, save.

White inside the garment, black everywhere else. Hands, face, hair, shoes and
the dress underneath are all **not** garment.

## Why a human does it at all

Colour alone cannot find this garment's edge. Burgundy sits at h≈353 and its hue
window wraps past 360 into skin; shadowed skin and shadowed burgundy are
genuinely the same colour. A full day of automated attempts on 2026-09-19 ended
at *"hands are still blue claude"* and *"it's very very bad"*, and the founder's
own conclusion was to use Photoshop. She is right: the boundary is a judgement.

The candidate masks exist so she refines rather than cuts from scratch. They are
a starting point and nothing checks their quality but her eye.

## The one result to look at first

`recolour.jsx` goes light-to-dark easily and **dark-to-light badly**. The Open
Abaya is burgundy at l≈0.25 and Ivory sits at l≈0.94; lifting it that far
amplifies noise and flattens the weave. Judge Open Abaya / Ivory before trusting
the batch. Navy from burgundy is a small move and should be clean.

## Status

⚠️ **`build-psds.jsx` and `recolour.jsx` have never been run against Photoshop.**
Driving Photoshop from the shell needs macOS automation permission that is not
granted on this machine (`AppleEvent timed out (-1712)`), so they were written
but not executed. Run them from Photoshop's own `File > Scripts > Browse...`,
which needs no permission, and expect to fix something the first time.
