# The fold, measured

The Open Abaya's folded front edge is the whole design and it has been lost or
wrong in most generations. Founder, 2026-09-20: *"it is good on the top but it
doesn't unfold properly, it's like the folding line just disappears"*, then
*"check the full folding on the burgundy one and how the folding changes until
down the length"*.

So it was measured off `abaya-burgundy-front-wb.jpg` rather than described from
memory. Luminance scanned outward from the opening edge, at five heights:

| height | crease distance from the opening edge |
|---|---|
| neck (0.19) | wide, and diffuse — this is the collar roll, not the band |
| chest (0.32) | **40 px** |
| hip (0.50) | **40 px** |
| knee (0.68) | **38 px** |

## ⚠️ THE BAND DOES NOT TAPER. That is the correction.

Every prompt written before this said *"narrowing steadily as it descends"* or
*"relaxing"*, and the model did what it was told: it let the fold fade out below
the bust. **The band holds a constant width — about 4.7% of frame width — from
the chest to the hem.**

What changes down the length is not the WIDTH, it is the CRISPNESS:

- **neck** — a wide, deep, rolled turn, pressed and holding its shape, the
  widest point of the whole edge
- **chest to knee** — a constant-width doubled band, a soft rounded crease on
  the outside, and a hard dark shadow line along the free inner edge. The
  shadow is the most reliable tell: it reads as a near-black line at every
  height.
- **hem** — same width, but the free inner edge LIFTS away from the body and
  ripples instead of lying flat. It is loose here, not pressed. This is what
  the founder means by "opening at the end": the fold opens *outward*, it does
  not disappear.

## Wording that follows from this

> Each front edge is folded back on itself to the outside, making a doubled band
> of the SAME WIDTH from the chest all the way to the hem — it never narrows and
> it never fades out. Along its free inner edge runs a hard dark shadow line,
> visible at every height. What changes as it falls is only how pressed it is:
> deep and rolled at the neck, softer through the body, and at the hem the inner
> edge lifts away from the body and ripples loosely. It is a fold, never a sewn
> band, a facing, a trim or a printed stripe.

⚠️ And pass `/tmp/fold-ref.jpg` — a crop of the real edge — as a reference.
CLAUDE.md §4b: references beat descriptions. Three attempts at describing this
failed; the crop plus the corrected wording is what finally held it.

---

# Vary the pose between the narrow and wide cells

Founder, 2026-09-20: *"the tip for this is change the pause of the model, if you
change the pause nobody can tell if it's not the exact length between the midi
narrow sleeve and midi wide sleeve, same for maxi wide or maxi narrow"*.

⚠️ **THIS IS A PHOTOGRAPHY INSTRUCTION, NOT A CHEAT.** The two cells of a sleeve
pair differ only in sleeve volume, so an identical pose invites the eye to
compare every other edge — and a hem two centimetres out reads as a fault.
Change the stance, the hands, the weight, the angle of the shoulders, and the
customer sees two photographs of the same garment instead of a spot-the-
difference.

It also matches how the rest of this catalogue was shot: no two shirts share a
pose either.

**What must still match exactly**, pose or no pose: the garment's length as a
proportion of the figure, the sleeve width difference between narrow and wide,
the fold, the colour, the backdrop and the framing. The pose hides small
imprecision in hem height between SIBLING cells. It does not license a midi that
is really a maxi — that is what the measured ratios in this file are for.

**What to write in the prompt:** name the change. "She stands with her weight on
one hip, one hand resting at her side and the other lifted slightly" beats "vary
the pose", which the model ignores.
