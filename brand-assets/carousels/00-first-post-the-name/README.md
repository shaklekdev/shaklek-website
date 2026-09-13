# 00 · The first post — "Shaklek means your look, your way"

**This goes out before everything else in this folder.** The other four
carousels explain the offer and belong after launch; this one is the opener,
posted while the shop is still shut. Numbered `00` for that reason, not `05`.

Approved by the founder 2026-09-13 after about twenty rounds. Most of the final
copy is hers.

## The five slides

| | Slide | Ground |
|---|---|---|
| 1 | **Shaklek** / gold hairline / **شكلك** | ivory `#faf8f4` |
| 2 | Shaklek means your look, your way. · *In Arabic.* | ivory + huge pale **ش** |
| 3 | Made to fit your shape, not a chart. · *100% tailored.* | the tape, photographed |
| 4 | Made to let your skin breathe, not sweat in plastic. · *100% linen.* | sand + linen, vertical half |
| 5 | You don't fit fashion. / Fashion fits you. · *Join the waitlist at shaklek.com* | deep sand, **burgundy type** |

`ig/` is 1080x1350, `tt/` is 1080x1920, `caption.txt` is the same for both.

## Why it looks like this, so nobody undoes it

- ⚠️ **The palette is light and stays light.** Founder: *"I want our website to
  stay pure, ivory and white colour and just sometimes a mix with the other
  burgundy/blue/black, it needs to stay light."* An earlier cut put slide 5 on
  navy and she killed it: *"the final page in blue drop it, everything in
  nude."* The accent moved into the TYPE instead, which is why slide 5 is
  burgundy letters on sand rather than white letters on a dark field.
- ⚠️ **The lockup is Latin first, gold hairline, Arabic beneath at about half
  size**, exactly as `website/src/components/Header.tsx:139` sets it. A draft
  put شكلك on top at 178px and made it the hero. Founder: *"You put the Arabic
  version on top of the Latin version, which is not our brand."* Do not redraw
  the lockup in a carousel.
- **The three middle slides are deliberately three different things**: 3 is a
  photograph, 4 is a texture in a vertical half, 5 is flat colour. When 3 and 4
  shared a treatment she caught it immediately: *"both have the same design."*
  Same typeface and same size (106 / 100) across both, which was also a note.
- ⚠️ **The waitlist ask rides on slide 5, it does not get a slide of its own.**
  A sixth CTA slide was built and cut. Founder: *"one sentence in slide 5 saying
  join the waitlist is better than yet another slide people may never see."*
  Carousel drop-off is steep; an ask on slide 6 is an ask nobody reads.
- **ش on slide 2** is the brand monogram and the first letter of شكلك
  (`branding/voice.md`), so the slide that explains the name carries the letter.

## The copy, and where it came from

Slides 3, 4 and 5 are the founder's own sentences, lightly fixed:

> *"your shapes don't have to adapt to clothes... your skin don't suffer the
> heat... You don't fit fashion, fashion fits to you."*

Two edits she approved: *"Made to fit your shape, not **to** a chart"* dropped
the second "to" (grammar mismatch, "made to fit" is an infinitive of purpose and
"to a chart" a preposition), and *"fits to you"* became *"fits you"*.

⚠️ **"100% tailored" is correct and allowed.** `copy-rules.mjs` used to block it
on the reasoning that standard sizes sell at the same price. That reasoning was
wrong about the business and the rule was removed on 2026-09-13: nothing is cut
before it is ordered, so a customer who picks M off the chart still gets a
garment cut individually for her order, and the fitting is free to everyone.

## Regenerating

Source of truth is `brand-assets/teaser/build.mjs`, post `01-the-name`:

```bash
node brand-assets/teaser/build.mjs
```

Then copy `teaser/ig/01-the-name/` and `teaser/tt/01-the-name/` back over `ig/`
and `tt/` here. `src/` holds the two craft macros used as grounds so this folder
survives on its own.
