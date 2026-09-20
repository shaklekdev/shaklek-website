# Tailor specification sheets

`sent/` is what actually went to the tailor. `generator/` rebuilds the drawings.

## Sent 2026-09-20

    BUTTONED-ABAYA-MAXI.jpg      maxi, four closures. THIS IS THE ONE HE IS MAKING.
    OPEN-ABAYA-MAXI.jpg          maxi, narrow sleeve. THIS IS THE ONE HE IS MAKING.
    BUTTONED-ABAYA-TAILOR-SHEET.jpg   all four variants, reference only
    OPEN-ABAYA-TAILOR-SHEET.jpg       all four variants, reference only
    OVERSIZED-SHIRT-for-tailor.jpg    the correction after the shirt came back fitted

⚠️ **THE TWO `-MAXI` FILES ARE THE BRIEF. The founder cut the options down
deliberately** — "he will be only doing that otherwise we will lose him". One
garment, one length, front and back. Do not hand a tailor the four-variant sheet
when he is making one thing.

## ⚠️ THE METHOD, AND IT IS THE ONLY PART THAT MATTERS

**PUT THE PHOTOGRAPH BESIDE THE DRAWING AND LOOK AT THEM TOGETHER.** Every
single error below was found that way, and none of them was found any other way.
Seven errors, all caught by the founder or by that comparison, on drawings that
had already been declared finished:

| wrong | right |
|---|---|
| V notch at the neck | ROUND neck, then a V |
| that V widening downward | that V **points down** — wide at the neck, tapering to the first bar |
| a yoke seam across the back | the Buttoned back has **nothing on it at all** |
| closure bars a third of the body width | about **a fifth**, with a small button |
| front closed to the hem | four closures is **worn open** — the edges part below the lowest bar |
| the Open's folded band tapering away | the band **runs to the hem**; "relaxing" means unpressed, not absent |
| the Open drawn as a straight column | it **sweeps** — the hem is wider than the chest |
| a turned-back cuff on the Buttoned | **only the Open has one**; the Buttoned sleeve end is plain |
| the Open drawn with a closed neckline | it has **no neckline at all** — two panels hanging free |

⚠️ **EVERY ONE CAME FROM THE SAME CAUSE: drawing from the wording of the
generation prompt, or from what a garment usually has, instead of from the
photograph of the thing that was actually approved.** The prompt says what was
asked for. The photo shows what exists. They diverge, and the photo wins.

Her line, and it is the right frame: **"every detail you miss is a return
item."**

## What these sheets do NOT contain

- ⚠️ **No measurements in centimetres.** Shape and construction only. He cuts to
  her measurements, which is right for made-to-order, but there is no ease
  figure holding him to anything.
- ⚠️ **The 6 cm shoulder drop and the cuff depth are the session's numbers, not
  hers and not measured off a garment.** Reasonable, unverified.
- ⚠️ **The pictures are RENDERS, not photographs of a sample that exists.** He
  cannot be shown the garment because there isn't one, and a render can show a
  detail that is awkward to actually sew. The first piece off his table is the
  real test of these sheets.

## The one number that is sourced

**138 cm cloth, 145 gsm** — from margins.mjs, quoted 2026-09-06. It settles the
sleeve question on both garments: a one-piece cut-on sleeve needs shoulder plus
both sleeves in a single span across the cloth, about 167 cm. It does not fit.
So both abayas are SET-IN SLEEVE, and that is the cloth deciding, not taste.

## Rebuilding

    cd planning/tailor-specs/generator
    node -e '...'   # see the build() signature in make2.js

`v3.js` draws one flat; `make2.js` lays out photographs, flats, the note box and
the detail list. Both carry the corrections above as comments at the line that
would otherwise repeat the mistake.

⚠️ The sheets use the ORIGINAL catalogue photographs. A second set on the
catalogue backdrop (`-wb` suffix) landed in 86cf033; the garment is identical
and only the backdrop differs, so the construction shown is unaffected.
