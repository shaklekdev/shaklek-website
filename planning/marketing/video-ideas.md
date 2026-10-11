# Video ideas — next generations (2026-10-11)

Saved at the founder's request; we continue from here. First teaser is done:
`brand-assets/reels/teaser-final.mp4` + `teaser-final.caption.txt`.

Budget when saved: ~$13 Higgsfield credit, Kling 3.0 at 50% off until about
2026-10-18 (5 s clip ≈ $0.21, with generated sound ≈ $0.32). Stills via Gemini
≈ $0.13 each at 2K.

## POST 1 — the name (her idea, her call to post it first) — DONE

Approved 2026-10-11: `brand-assets/reels/name.mp4` (8 s) + `name.caption.txt`,
built by `brand-assets/reels/teaser/build-name.mjs`. Arabic in Reem Kufi (her
pick, option 6), text in deep warm brown #3d342b, not black. Silent: add
Instagram music when posting.

Ivory linen moving softly in the background, full frame, slow. On top, text
appears little by little: **شكلك** / **Shaklek** / *means "your way" in Arabic*
then her site's own follow-up: *Your look, your vision, simply you.*
(Wording from /our-story, `website/src/app/our-story/page.tsx:217` and `:463`.)
- Footage: the approved linen weave clip (`clips/teaser-4-weave-1.mp4`) or one
  new text-to-video linen clip (~$0.21); everything else is free in the edit.
- Same film look and type as the teaser; text fades in word by word, still,
  no grain behind it.
- Note: شكل literally means shape/look, so "your look" is also true; keep
  "your way" as the headline, it is what the site says.

## Her three ideas (the ones we are working from)

**1. The struggle (make FIRST).** Trousers gaping at the waist, a shirt pulling
across the chest, too tight on the biceps. Framed on the body, no face. The
badly fitting clothes are "other brands", so no catalogue constraint on them.
Ends "Nobody is a medium." then ش SHAKLEK. ~$1.50.
- Most views: everyone has lived it, it is why made-to-measure exists.
- Fit is the trousers/shirts story; never use it for the abaya.
- Second-person body lines are fine organic, not in Meta ads.
- Next step: write the shot list and prompts for her approval.

**2. Linen, field to fabric (SECOND).** Flax field in wind, the plant, fibre,
thread, loom, soft cloth, tailor's shears. AI text-to-video works: no face, no
garment. ~$1.50.
- Do not imply it is "our" field or weaver; we do not know our linen's origin.

**3. Packaging being made (do it REAL).** Printer stamping SHAKLEK, linen bags
sewn, ribbon. AI cannot spell the logo, so ask the packaging supplier to film
their machines on a phone when they produce; we edit it in the teaser's look.

## Also on the table

- **The story behind Shaklek**: 20 s, her own voice (phone recording) over
  teaser-style images, lines lifted from /our-story (see
  founder-story-angle.md; no medical detail, no word "AI"). ~$1.50.
- **Backstage at the tailor**: must be real phone footage, not AI (a generated
  workshop presented as ours reads as a lie). 20-30 clips of 3-5 s; we edit.
- **Marketing agent's five story films** (she found them less appealing):
  Cut at the same moment (her morning / tailor cutting, split screen); The
  mirror (reflection changes the cut); One cloth (a linen roll becomes
  garments under different hands); From first light (a Gulf day in shadows,
  "The day was 44. You were linen."); The note (opening day, the card in the
  box, "I knew seventeen numbers").

## Rules learned on the teaser (keep)

- Animate only approved stills; every new still changes her face and the dress.
- Show less face: hands, fabric, backs, eyes closed. The face is what reads AI.
- Film look (grain, halation, faded colour) on footage only, never on text;
  no grain behind still text (it shimmers after compression).
- Check every fix on the final exported mp4, not intermediate frames.
- Tools: `website/scripts/social/higgsfield.mjs` (approval-gated),
  `brand-assets/reels/teaser/` (build.mjs, trim.html, frames.swift, mux.swift).
