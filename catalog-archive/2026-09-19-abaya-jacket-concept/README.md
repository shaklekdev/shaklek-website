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

---

# APPROVED SET — 2026-09-19, later the same day

`APPROVED/` holds the six she signed off, plus `0-ALL.png` as a contact sheet.
Everything else in this folder is working material and rejects, kept on purpose.

    1-LONG-open-4closures-FRONT     4-MIDI-open-4closures-FRONT
    2-LONG-BACK                     5-MIDI-BACK
    3-LONG-closed-5closures-FRONT   6-MIDI-closed-5closures-FRONT

## ⚠️ OTHER COLOURWAYS ARE PHOTOSHOP, NOT GENERATION

Founder's decision, 2026-09-19: **"for the other colors we will use
photoshop."** Navy, burgundy and white are recolours of these exact six frames,
not new generations. That is the two-master rule of CLAUDE.md §3 taken one step
further — same pixels recoloured, so hem length, pose and framing match by
construction. Do not regenerate a colourway. `scripts/catalog/normalize-colour.mjs`
is the deterministic tool for this and it is free.

## The customisation model, as she settled it

- **Closure count** — 4 or 5. NOT decoration. Her words: the 5 version *"is
  meant for people who want to cover more so we need to show that it closes
  properly and covers more."* So 4 = worn OPEN, 5 = worn CLOSED, and the two
  options need genuinely different photographs.
- **Length** — midi or maxi, matching the `garment_length` slider that already
  exists in `parameterSliders.ts` ("Shorter" / "Longer").
- **Sleeves are FIXED.** Her words: *"the sleeves will stay the same."*

⚠️ **THE BACK IS SHARED ACROSS CLOSURE COUNTS, AND SHE SPOTTED IT.** The back is
one unbroken panel, so it is identical whether there are four closures or five.
Closure count multiplies FRONTS ONLY; length multiplies both. Per colourway that
is **4 fronts + 2 backs = 6 photographs, not 8** — 24 across four colours rather
than 32.

## ⚠️ What she caught that no metric did — every one of these was hers

The founder found all of these by eye, in sequence, on frames that had already
passed my own checks:

1. **Fabric read as wool, not linen.** Fixed only by naming 145 gsm with its
   observable consequences and escalating to Pro.
2. **Then it read as unironed.** Creasing had been pushed too hard to prove the
   weight.
3. **The whole image fading.** Chaining edits costs ~1.5 contrast points per
   render. She read it as pale lips; the fault was global.
4. **Ivory buttons.** A regeneration silently swapped the black buttons for
   cream ones.
5. **Trousers silently re-cut shorter** in a frame where only the abaya length
   had been asked for.
6. **Front-facing shoes on a back view.** Caused by passing a FRONT image as a
   framing reference — it dragged the feet across with it.
7. **Trouser hems tucked inside the shoes** instead of falling over them.
8. **Midi front and back not the same length**, then the midi-5 shorter than
   the other two midis.

⚠️ **SO: PIN EVERY ELEMENT, NOT JUST THE ONE BEING CHANGED.** Her instruction,
verbatim: *"keep always everything similar, this is a guardrail and guideline."*
Anything left unnamed in the prompt is treated as fair game and will drift.

⚠️ **AND FENCE A REFERENCE IMAGE TO ONE PROPERTY.** "References beat
descriptions" (§4b) is true and incomplete: a front view referenced for framing
put front-facing shoes on a back view, twice. Either say explicitly *"take ONLY
the hem height from IMAGE 2, take nothing else, especially not the feet"*, or
drop the reference and describe the geometry concretely — which is what finally
worked for the legs and shoes.

## The exposure fix, corrected

The one-shot linear match recorded above was not enough: it matched contrast
while leaving saturation at 0.047 against a target of 0.058, because a frame
with more dark area skews the statistics. **Iterate instead** — apply, re-measure,
repeat up to four passes until both contrast and saturation are within tolerance.
That lands every frame within 0.001 of the master, free.

## Cost

Twenty-six generations, **$2.82**. Seven Flash at $0.039, nineteen Pro at $0.134.
