# Abaya concept from the frog-closure linen jacket — 2026-09-19

Founder brought a reference photo of another brand's collarless linen jacket
with four black frog-bar closures and asked for an abaya built from it. She
approved `abaya-pressed-corrected.jpg`.

## The approved design

Collarless, small V notch at centre front. **Exactly four** black frog-bar
closures with small cream buttons, upper chest only; the front falls open
below the lowest one. Wide dropped-shoulder sleeves, full length. Long
straight column to just above the floor. No belt, no waist seam.

Founder's customisation intent, her words: **"the customization item here
would be more closing or less. and then length of the abaya, the sleeves will
stay the same."** So: closure count and length are sliders, sleeves are fixed.

⚠️ **Both of those sliders change the FRONT of the garment, so if either is
"render" tier it multiplies the shoot.** Closure count x length = 4 cells per
colour instead of 1 — 16 photographs become 64. That decision is worth making
before a camera or a generation budget is committed.

## Fabric: 100% linen, 145 gsm — this took seven of the eight generations

Her spec, given after three failed attempts: **"100% soft linen 145g texture"**,
and then **"why is it wrinkled and not ironed?"**

⚠️ **ASKING FOR "LIGHTER, SOFTER LINEN" IN PROSE FAILED THREE TIMES ON FLASH.**
Every attempt came back looking like 300gsm suiting or wool. Two things fixed
it, together:

1. **Name the weight in gsm and say what it must NOT look like.** Listing the
   observable consequences of 145gsm beat any number of adjectives: semi-sheer
   where daylight passes a single layer, no body of its own so it collapses
   against the arm and leg, many small shallow folds rather than a few
   sculptural ones, soft limp edges, fine slubby matte weave. Then the negative
   list: not 300gsm, not wool, not felt, not canvas, not coat-like.
2. **Escalate to `gemini-3-pro-image`.** Flash could not do it; Pro did it first
   try. Consistent with the trouser recipe in CLAUDE.md §4b — Flash cannot
   reshape a silhouette, and fabric hand is the same class of problem.

⚠️ **AND THEN IT OVERSHOT.** Pushing creasing hard enough to prove the weight
produced a garment that read as unironed. `abaya-pressed` is the correction:
same weight properties kept explicitly, crumple removed, "steamed five minutes
before the photograph, not taken out of a suitcase". Both are archived — the
crumpled one is the better proof of weight, the pressed one is the saleable
photograph.

## ⚠️ Chaining edits fades the image, measurably

Each re-render loses roughly 1.5 points of contrast and some saturation:

    abaya-a          contrast 31.1   saturation 0.058   (master)
    abaya-a-soft     contrast 29.7   saturation 0.052   (one edit)
    abaya-a-soft-v2  contrast 29.1   saturation 0.050   (edit of an edit)

The founder saw it before any instrument did: *"the light is fade on the last
generation, everything looks more fade even the hair and skin."* She first read
it as make-up — pale lips — and the fault was global.

**Pinning exposure in the prompt does not prevent it.** Tried, and the result
was 29.5 against the master's 31.1. What works: generate from the master rather
than from the last output, then correct deterministically —

    linear(a = master.sd / new.sd, b = new.mean * (1 - a))
    modulate({ saturation: master.sat / new.sat })

That lands within 0.2 of the master every time, at zero cost. Note this is a
GLOBAL contrast/saturation match, which is safe; it is not the hue-window
post-processing CLAUDE.md §4b forbids, which wraps into skin tones.

⚠️ **AND TWO INSTRUMENTS LIED HERE, BOTH MINE.** A "lip redness" metric
reported no difference between the versions — its crop stopped above the mouth,
so it was measuring cheeks. A dark-band counter reported "2 closures" on images
that plainly have four. Both were believed for a moment against a founder who
was looking at the picture. §7: a number that cannot be true means audit the
instrument.

## Provenance

⚠️ The reference is **another brand's product photograph**. The frog fastening
itself is a traditional closure, not anyone's IP, but the styling and the shot
are theirs. Nothing here may ship to the catalogue as-is: this is a design
study, and the real garment needs Shaklek's own model and studio setup.

⚠️ **And none of it is verified against the real cloth.** The 145gsm rendering
is the model's idea of 145gsm linen. When her ivory linen arrives, photograph it
and check this against it — a render that shows a lighter or heavier cloth than
what arrives mis-sells the garment. Same argument as the swatch card before the
110 metres.

## Cost

Eight generations, **$0.50**. Six Flash at $0.039, two Pro at $0.134.
