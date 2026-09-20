# Navy, by generation

Founder, 2026-09-20: *"we don't need the same pose at all, we don't also need
the same woman if it's easier, the only thing that matters is the garment. it
has to be the same. the color has to be relevant to the navy shade we've been
doing. also the length has to be the same on the long and short version. the
width should also be the same for wider and more narrow as the other color."*

So: **pose free, model free, garment fixed, colour fixed, and the four cells
must relate to each other exactly as burgundy's four do.**

## ⚠️ The framing is NOT free, and that is deliberate

Pose and model can change; the CROP and the figure's scale in frame cannot.
Every length and width she is asking me to hold is verified as a fraction of
the frame, so if the figure is bigger or smaller in one shot the measurement
stops meaning anything and "the same length" becomes an opinion again. Same 2:3
crop, same full-length framing, feet in frame, head in frame.

## FIT — goes in EVERY prompt, for every colour, forever

Founder, 2026-09-20: *"make sure you include all the fit measurements from the
master for the new colors generations."*

⚠️ **FRAME FRACTIONS CANNOT GO IN A PROMPT.** "Hem at 0.916 of frame height" is
meaningless to the model and stops being true the moment the pose or the crop
moves — which she has just made free. So every measurement is expressed as a
ratio to the garment's OWN SHOULDER WIDTH, which is pose-invariant, and as the
anatomical landmark it lands on. The fractions stay, as MY verification, below.

Measured off the burgundy masters:

| cell | length ÷ shoulder | widest ÷ shoulder | widest point |
|---|---|---|---|
| maxi:narrow | 3.49 | 1.47 | 46% down |
| maxi:wide   | 3.52 | 1.60 | 47% down |
| midi:narrow | 3.05 | 1.44 | 55% down |
| midi:wide   | 3.06 | 1.65 | 55% down |

**The prompt block, verbatim:**

> FIT, which must match our existing colourway exactly:
> — LENGTH: the garment is three and a half times as long as its own shoulders
>   are wide. It reaches the floor and breaks on the instep, covering the top of
>   the foot. The ankle is not visible.
> — WIDTH: at its widest, a little under halfway down, the garment measures
>   about one and a half times its own shoulder width. It falls straight and
>   sweeping from the shoulder, with no taper at the hem and no cinching at the
>   waist.
> — the sleeve reaches the wrist bone and no higher.

For the SHORT version, replace the length line with:

> — LENGTH: the garment is three times as long as its own shoulders are wide.
>   It stops at mid-calf, clearly above the ankle, and the whole ankle and the
>   shoe are visible.

For the WIDE version, replace the width line with:

> — WIDTH: at its widest, a little under halfway down, the garment measures
>   about one and two-thirds its own shoulder width — noticeably fuller through
>   the sleeve and the body than our narrow version, still with no taper.

## The numbers navy has to hit

Measured off the burgundy masks, which are accurate to the garment edge:

| cell | hem (lowest garment row) | widest row | sleeve span at y=0.45 |
|---|---|---|---|
| maxi:narrow | 0.917 | 0.472 | 0.438 |
| maxi:wide   | 0.915 | 0.508 | 0.458 |
| midi:narrow | 0.794 | 0.440 | 0.412 |
| midi:wide   | 0.808 | 0.520 | 0.472 |

**maxi hem 0.916 ± 0.010. midi hem 0.801 ± 0.015. The gap between them is 0.115
and that gap is the product** — it is what a customer sees when she moves the
Length slider. Narrow widest row ~0.456, wide ~0.514.

## Order — one master, then derive. Never four independent generations.

This is CLAUDE.md §3 and §4b and it is the whole reason the burgundy set is
consistent:

1. **maxi:narrow** — the master. Generate from `abaya-burgundy-front.jpg`.
   Approve it before anything else exists.
2. **midi:narrow** — from the MASTER, shorten only.
3. **maxi:wide** — from the MASTER, widen only.
4. **midi:wide** — from **maxi:wide**, shorten only. Never from the master:
   generating it from the base makes the model shorten and quietly skip the
   widening, which is how three of four Wide-leg colours ended up with
   `wide:cropped` narrower than `straight:cropped`.

Backs follow their own fronts the same way.

## Prompt — the master

Tool: `edit2.mjs`. Model: **gemini-3-pro-image**.
INPUT = `abaya-burgundy-front.jpg`. REF = `cargo-trousers-navy-front.jpg`.

> A woman wearing an open, floor-length NAVY linen abaya, photographed for a
> catalogue: full length, feet and head in frame, a single smooth seamless
> studio backdrop with NO visible panel edges, vertical lines, seams or dark
> bands.
>
> THE GARMENT IS THE SUBJECT AND IT MUST BE EXACTLY THE ONE IN THE INPUT IMAGE:
> — open down the full front, no fastening of any kind
> — the front edge FOLDED BACK ON ITSELF to the outside, doubled and obvious at
>   the neck, symmetrical on both edges, then relaxing as it falls and lying
>   open by the hem. Folded, NOT sewn: a soft rounded crease with a free
>   unstitched inner edge and a shadow under it, reading as a second layer of
>   cloth lying on top.
> — long sleeves covering the whole forearm to the WRIST, generous, with a deep
>   turned-back cuff
> — a plain hem, one continuous sheet of cloth to the floor. NO hem band, no
>   turn-up at the bottom.
> — no collar, no lapel, no buttons, no pockets, no belt
>
> THE COLOUR is the navy of the trousers in the reference image: a deep,
> desaturated ink navy, about #182639. Not royal, not teal, not petrol, not a
> bright or electric blue. Copy the reference's depth and its muted saturation,
> and the way its highlights fall to soft grey-blue rather than to brighter
> blue.
>
> IT IS LINEN. The weave stays visible — slubs, grain, soft creases across the
> body, deep shadow inside the folds. Do not smooth, flatten or airbrush it. It
> must read as cloth photographed, not as colour filled in.
>
> LENGTH: the hem reaches the floor and just breaks over the shoe.
> She wears nude leather HIGH-HEELED sandals, never flat shoes, and a plain
> IVORY slip dress underneath which stays ivory.
>
> The pose and the model may differ from the input image. The garment may not.

## Verify before deriving anything

Measure the master the same way the table above was measured, and check the hem
lands at 0.916 ± 0.010 before generating a single derived cell. **Every master
revision costs the whole column beneath it** — that is the abaya shoot's
$4.42-against-a-$2-estimate, where 28 of 45 generations were rebuilding cells
under a master the founder revised five times.

## Cost

Master $0.134. Open Abaya's eight frames ~$1.07. Both abayas ~$2.14 before
retries, and retries are likely on the derived widths — budget ~$3.
