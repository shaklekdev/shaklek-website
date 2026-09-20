# The three cards — parked 2026-09-20

Removed from `/coming-soon` on the founder's instruction: *"remove the three
cards from the opening soon page, keep them somewhere saved and their draft but
for now we need to start teasing people slowly without saying what the brand is
about."*

⚠️ **NOT DELETED, AND NOT A DRAFT THAT NEEDS REWRITING.** This is finished,
approved copy that she edited line by line over three sessions. Every sentence
below survived a cut she made herself. If the cards come back, they come back
from here — do not rewrite them from scratch.

⚠️ **THE IMAGES ARE STILL IN THE REPO** at `website/public/marketing/pre-launch/`
— `flax-stalks.jpg`, `tailor-hands.jpg`, `uae-desert.jpg`. Nothing was removed
from disk. The flag image in particular took three attempts and its flag was
verified band by band; regenerating it would be wasted money.

## Why they came off

The page's whole job now is to tease **without saying what the brand is about**.
These three cards were the opposite: they explained the fibre, the fit and the
origin. They answered "why linen" for a reader who has never thought about it,
which was right when the page was trying to convert, and is wrong while it is
trying to intrigue.

So this is a change of purpose, not a judgement on the copy.

## The data, exactly as it shipped

```tsx
// THE FOUR PILLARS, in the founder's own words, 2026-09-12: "100% linen,
// breathable, tailored, made in the UAE." Each block is one of them. Nothing
// else earns a block.
//
// ⚠️ The rejected version opened "For people who would rather own four things
// they love than twelve they tolerate." She was right to cut it: it describes a
// type of person instead of speaking to one, and it is a line any slow-fashion
// brand could have written. Address the reader, in the second person, about
// something she can check herself.
const PILLARS = [
  {
    src: "/marketing/pre-launch/flax-stalks.jpg",
    alt: "A tied bundle of dried flax stalks, the plant linen is spun from.",
    title: "100% natural linen, it breathes.",
    // ⚠️ THIS CARD EXISTS TO ANSWER "WHY LINEN", for a reader who has never
    // once thought about what a garment is made of. Founder, 2026-09-14:
    // "many people still don't understand why linen".
    //
    // It gives the substance of a non-toxic claim WITHOUT the word. "Non
    // toxic", "low tox" and "clean" all assert that something was tested for
    // or excluded, and we hold no OEKO-TEX or GOTS certificate and the cloth
    // is milled abroad. Heat, sweat and smell are three things a reader can
    // check against her own last August, which is worth more than a claim she
    // has to take on trust.
    //
    // ⚠️ KEEP IT TO ONE SENTENCE AND ONE CONTRAST. A four-sentence version
    // spelling out petroleum and air flow was cut for length: "toooo long".
    // "Flax" was cut too, because nobody knows the word.
    body: "Linen is a plant. Unlike polyester, which is plastic, it does not hold the heat, the sweat or the smell.",
  },
  {
    // Already the right photograph: shears, tailor's chalk and linen on the
    // bench. Do not swap it for a garment shot, which shows the result and not
    // the making.
    src: "/marketing/pre-launch/tailor-hands.jpg",
    alt: "A tailor's hands pinning linen, with shears and chalk on the bench.",
    title: "100% tailored, it fits.",
    // ⚠️ THE MEASURING VISIT IS NOT ON THIS PAGE AT ALL ANY MORE. It was a
    // gold-bordered block, then one clause here, and on 2026-09-14 the founder
    // cut it to nothing: "only this: Your true measurements, and the fit you
    // choose." Her reasoning has been consistent across both cuts, that the
    // offer says too much before there is anything to buy. The offer itself is
    // unchanged and still lives in SizePicker on the storefront.
    body: "Your true measurements, and the fit you choose.",
  },
  {
    // Generated, and APPROVED by the founder on sight, 2026-09-12. Kept
    // rather than replaced with stock because it came back genuinely
    // photographic where three oasis attempts did not.
    //
    // ⚠️ THE FLAG WAS CHECKED, NOT ASSUMED. These models routinely mis-render
    // a national flag, and the 4:5 crop could have clipped the hoist band
    // without looking wrong. Verified by cropping the flag region and reading
    // it: red vertical band at the pole, then green, white, black. If this
    // image is ever re-cropped or regenerated, check that again by eye.
    //
    // The flag question is CLOSED. A previous session left a ⏳ note here
    // saying UAE rules on commercial use of the national flag needed
    // confirming. The founder settled it on 2026-09-14: the image is
    // generated, it shows the flag the way any UAE business shows it, and she
    // does not consider it an issue. Do not raise it with her again.
    src: "/marketing/pre-launch/uae-desert.jpg",
    alt: "A United Arab Emirates flag among date palms in the desert at low sun.",
    // ⚠️ "MADE IN THE UAE", AND THE MISSING "100%" IS THE POINT. Founder,
    // 2026-09-14: "on the cards just put Made in the UAE, NO NEED FOR 100%".
    //
    // The other two cards lead with 100% and this one deliberately does not,
    // which will look like an oversight to the next editor. It is not. "100%
    // made in the UAE" claims the fabric too, and the cloth is milled in
    // Guangzhou; she cut that exact phrase from the business card for the same
    // reason. Plain "Made in the UAE" is the approved origin claim and is
    // simply true, since origin follows where a garment is cut and sewn.
    title: "Made in the UAE.",
    // "LOCAL" is the founder's, 2026-09-14, and it is the word carrying the
    // card: the title says where, this says who, and local is what makes the
    // two one claim rather than a fact and a nicety.
    body: "By your local tailor, who works to every detail you choose.",
  },
];
```

## The rendering, exactly as it shipped

Two layouts — a phone triptych and a desktop 3-up grid. Both are in here because
the phone one took several rounds to settle.

```tsx
        {/* ⚠️ TWO DIFFERENT LAYOUTS, AND THE PHONE ONE IS THE POINT.
            Founder, 2026-09-14: "we need a specific layout for the three
            pictures on phone because it shows too long, too big."

            She was right about the number. Three 4:5 images stacked in one
            column is roughly 1400px of scroll on a 375px phone, for three
            cards, below the email box. Most readers never saw the third one.

            PHONE: 16:9 banners, title laid ON the image over a scrim, body
            hidden, and NO GAP between them -- 2026-09-19, so the three read as
            one panel of three pictures rather than three separate cards.
            DESKTOP (sm and up): the original 3-up grid of 4:5 portraits, title
            and body beneath, unchanged.

            The title sits on the image on BOTH, because that is what she asked
            for. On desktop it is the only thing on the image and the body
            still reads underneath it. */}
        <ul className="grid grid-cols-1 gap-0 sm:grid-cols-3 sm:gap-6">
          {PILLARS.map((pillar) => (
            <li key={pillar.title} className="flex flex-col gap-3">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2 sm:aspect-[4/5]">
                {pillar.src ? (
                  <Image
                    src={pillar.src}
                    alt={pillar.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
                {/* The scrim is bottom-weighted and stops short of the top, so
                    the photograph still reads as a photograph. Without it the
                    title is unreadable over the flax stalks, which are pale. */}
                {/* The scrim carries the title, so it is heavier than a
                    tasteful gradient would be. The pale flax photograph is the
                    constraint: white Cormorant at this size disappears into it
                    without both a dark foot AND a shadow on the glyphs. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-black/40 sm:bg-gradient-to-t sm:from-black/85 sm:via-black/35 sm:to-transparent"
                />
                {/* ⚠️ CENTRED ON PHONE, BOTTOM-LEFT ON DESKTOP. Founder,
                    2026-09-19: "for the 3 cards, i think text should be
                    centered. like all 3 cards become one same collage picture,
                    make it artistic."

                    The collage is what the centring is FOR. Three bottom-left
                    captions under three bottom-weighted gradients read as three
                    cards stacked; one centred line over one even scrim, with no
                    gap between the panels, reads as a triptych. So the scrim
                    changed with the type: flat black/40 across the whole frame
                    on phone (even tone, three panels that match), and the
                    original bottom gradient from sm up, where the captions are
                    still bottom-left under a 3-up grid.

                    inset-0 + flex centres it; sm:top-auto releases the top edge
                    so it falls back to the bottom, and sm:block drops the flex.
                    Do not swap sm:top-auto for sm:inset-auto -- that resets the
                    horizontal edges too and the caption collapses to its text
                    width. */}
                <p className="absolute inset-0 flex items-center justify-center px-6 text-center font-display text-xl leading-snug text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] sm:top-auto sm:block sm:px-3 sm:pb-3 sm:text-left sm:text-base">
                  {pillar.title}
                </p>
              </div>
              {/* ⚠️ HIDDEN ON PHONE AGAIN, 2026-09-19, AND THIS REVERSES A
                  DELIBERATE DECISION -- read both before changing it back.

                  2026-09-14, for showing them: hiding the bodies meant a phone
                  reader got "100% linen" as a claim and never the reason,
                  which is the thing she has said repeatedly that people do not
                  understand.

                  2026-09-19, for hiding them: "on the phone version no need to
                  add the text under the 3 cards. I also feel the 3 cards can
                  be merged in one layout with 3 pictures and text on them."
                  She was looking at her own phone at the time. The titles
                  still carry the claim ON the image, the gap between the three
                  is gone so they read as one panel rather than three cards,
                  and the reasons are one tap away on the site proper.

                  The tension is real and is hers to settle: this page is now
                  three claims without their reasons on a phone. If bounce goes
                  up, this is a candidate. */}
              <p className="hidden text-sm leading-relaxed text-text-2 sm:block">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>
```

## If they come back

- The copy above is approved; use it verbatim.
- ⚠️ **"Made in the UAE" has NO "100%" and that is deliberate.** Her instruction,
  2026-09-14: *"on the cards just put Made in the UAE, NO NEED FOR 100%"*. The
  other two cards lead with 100% and this one must not, because "100% made in
  the UAE" claims the fabric too and the cloth is milled in Guangzhou.
- ⚠️ **The flag question is CLOSED.** She settled it 2026-09-14 and asked not to
  be asked again.
- ⚠️ **The measuring visit is deliberately absent.** Cut twice, most recently to
  nothing: the offer says too much before there is anything to buy. It still
  lives in SizePicker on the storefront.
