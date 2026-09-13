# What Belumie and Layere are actually doing

Founder sent 48 screenshots on 2026-09-13: two clothing brands and a set of
AI-video technique posts. This is the read, and what we take.

---

## Layere (@layere.co, 219K followers, already launched, drops on a date)

**The number that matters: 915 shares on a slide that is one sentence on a flat
colour.** Not a model, not a product, not a photograph. On that same carousel,
59 comments. Shares run an order of magnitude above comments, which means the
text slides are the distribution engine and the product photos are the payload.

Their format, exactly:

| Slide | What is on it |
|---|---|
| 1 | The hook, all caps, flat colour. *"FRIENDS DON'T LET FRIENDS WEAR PLASTIC."* |
| 2 | The fact. *"MOST ACTIVEWEAR IS MADE OUT OF PLASTIC."* |
| 3 | Product shot, text overlaid top-left, the "this is why we chose" line |
| 4-5 | More product, one carries the drop date |
| last | The ask. *"ENTER YOUR PHONE NUMBER FOR EARLY ACCESS ON OUR SITE NOW"* |

Every slide carries `@LAYERE.CO` bottom right. Copy is set with wide word
spacing so lines justify raggedly, which is a look, not a bug.

**Their whole argument is ours.** *"Polyester is plastic. It's made from fossil
fuels, doesn't breathe like natural fibers, and sheds microplastics."* That is
`01-check-the-label` almost sentence for sentence, and it is doing 915 shares
for a brand with a bigger audience than we will have for a year.

**What we take:** the confidence to post a sentence with no picture. The
carousel shape hook / fact / proof / ask. The handle on every slide.

**What we do not take:** the microplastics line. It is a health-adjacent claim
we have not sourced and `personas.md` rules it out. Shedding is also true of
cotton. We argue heat, sweat and smell, which anyone in this country can check
on themselves by 2pm.

Also worth noting: their bio is four lines, and the third is **the next drop
date and time** (`next drop: sept 22nd. 12pm ct.`). Scarcity as a calendar, not
as a countdown timer.

---

## Belumie (@belumie.brand, 135 followers, pre-launch, "COMING SOON 2026")

**This is us.** A brand with no customers, no launch, and a waitlist, posting
its way to a launch. Fifteen posts. Worth studying precisely because the
follower count is small enough to be honest.

Their three formats:

1. **Text carousels on a warm gradient.** Beige to tan, dark brown type, a
   sans-serif line with **one word in an italic script** for the turn:
   *"Softness your skin can trust."* *"We never believed clean had to feel plain
   or unnoticed."* Every slide ends with a thin rule and the logo mark bottom
   right. The last slide is always **"Join the waitlist." + belumie.com**.
2. **One image, no words.** Ballet shoes on a door handle. Caption does the
   work: *"some images don't need many words."*
3. **Craft reels.** A sewing machine. Scissors cutting fabric. A bag with a
   ribbon. 386 and 349 views. Their product macro did 4,144.

**The one thing to learn from their numbers:** the BTS craft reels underperform
the product macro by ten times. Belumie is posting the workshop because it is
easy to shoot, not because it works. **We should shoot the workshop anyway**,
because for us it is not decoration, it is the proof of the only claim our
competitors cannot copy: a named tailor, here, cutting after the order. But it
belongs in the feed as evidence, not as the hook.

**What we take:** the rule-and-mark footer as a repeating signature. The last
slide always being the ask, in the same place, every time. The nerve to post
before there is anything to sell.

**What we do not take:** the gradient and the script italic. We have Cormorant
and Italiana and a gold rule, and changing register to chase a look is how a
three-post-old brand ends up with no face.

---

## The AI video technique posts

Three creators (@by.shaaima, @aminox_ai, and a prompt-sharing account) all
teaching the same two-step method:

1. **Make a storyboard first**, as a single image: ten numbered panels with
   timings, in ChatGPT or Gemini.
2. **Feed the storyboard to a video model** with a prompt that says *follow the
   provided storyboard exactly*, then lists the seconds: `0-1s: wide shot of
   ... 1-2s: ...`.

Two prompt rules they all repeat and that are worth stealing verbatim:

- *"The uploaded product image is the absolute source of truth. Preserve the
  exact shape, proportions, label, colours and typography. Never redesign or
  modify it."* Without that line the model invents a different product.
- *"Everything else remains completely frozen. Perfect seamless loop with
  identical start and end frames."* The locked-off shot where exactly one thing
  moves. It is the cheapest good-looking video there is.

**Our position on this: we do not need it yet, and using it has a cost.** Our
catalogue imagery is already generated, which is a fact we have committed to
never dressing up (`scripts/social/copy-rules.mjs` blocks the word
"photograph"). Animating a generated garment into a cinematic commercial is a
second layer of the same thing, on a brand whose entire pitch is that a real
person measures you and a real person cuts the cloth.

**The videos we should make instead are two kinds, and neither needs a model:**

- **Text-motion reels**, built in code from words we already own.
  `website/scripts/social/reels.mjs`. Free, no licence, no claim risk, and in
  our own typeface. Two are built.
- **Phone footage of the actual workshop**, shot by the founder. The list is
  below. This is the thing no competitor can fake and the only footage in this
  brand that is not generated.

---

## The phone shoots, in priority order

Fifteen seconds each, vertical, no talking, natural light. Shot on a phone at
the tailor. Nothing here needs a tripod.

1. **The tape measure around a shoulder.** The single most important shot we do
   not have. It is the offer, and it is one second of footage.
2. **Chalk marking linen, then the scissors going in.** Belumie's version of
   this did 349 views with no story attached. Ours has one: this is happening
   because somebody ordered it.
3. **The seventeen measurements being written on the sheet by hand.**
   `planning/measurement-sheet.html` printed, a pen, and a hand filling it in.
4. **One garment going from flat cloth to hanging finished**, as a series of
   stills shot over one visit. Cuts together as a 10 second build.
5. **Her own hands, opening a finished piece.** The only shot where a face would
   help, and it is hers.

⚠️ **Do not caption any of these "our atelier" or anything grander than what is
in frame.** A tailor at a table is more convincing than a word that implies a
building.

---

## ⚠️ What went wrong on the first attempt, 2026-09-13

The first teaser set built from this document was rejected, and the reason is
the most useful thing on this page.

Founder: *"I feel that you took exactly what you saw and just copy-pasted from
Belumie... We are not showing you the clothes yet. Who says that? This is purely
a robot saying it."*

She was right. Every line in that set had **Shaklek as the subject**:

- "We are not showing you the clothes yet."
- "Before it had a name, it had a feeling."
- "Every piece is cut after somebody asks for it."

Four posts in which the brand talks about its own marketing. Belumie's format
was copied and Belumie's *content* was not examined, which is how you end up
with a brand being coy at strangers who have no reason to care yet.

**Layere's 915-share slide is not about Layere.** It is *"I used to be fun but
now I'm like, is there polyester in this?"* The subject is the customer's life.
The brand is the punchline. That is the whole lesson and it is easy to miss
because the layout is the easy part to copy.

### The two copy rules that came out of it

1. **The customer is the subject.** If a line would be meaningless to somebody
   who has never heard of us, it is a line about us. Cut it.
2. **Never instruct a stranger.** An early draft said *"Go and check the label
   on what you are wearing."* Founder: *"I don't want this to be like accusing
   the customer of making them feel bad for wearing polyester... no brand would
   say go and check to their customers."* The shipped version asks *"Are you
   wearing polyester right now?"* and answers itself with *"Most of us are"* —
   same fact, and we are standing next to her instead of pointing at her.

### And the observation that reframed the craft footage

Founder, same day, on Belumie's scissors and sewing-machine reels:

> *"these inspirations actually are more aligned to us than to them, because
> they're just already a to-order brand. they're not made to order."*

That is the sharpest note in the whole reference set. A shot of shears going
into cloth is **set dressing for a brand selling from stock** and a **literal
description of the process for us**. Same footage, opposite truth value. It is
why `05-nothing-here-exists-yet` and `craft.mp4` exist, and why they are the
only teasers that could not be run by either reference brand.

---

## The hook formula, 2026-09-13

The founder wrote a better hook than anything proposed to her, and the pattern
behind it is reusable. Hers:

> *"Remember that one pair of pants that fits on the hip, the waist AND the
> length? What if this could be every single pair of pants?"*
>
> *"Remember that one shirt that fits perfectly, even on your chest. What if
> every shirt of yours could fit just as perfectly?"*

**The formula: a specific good memory the reader has definitely had, then widen
it.** Not a description of the product. The reader supplies the proof out of her
own wardrobe, and you cannot argue with your own experience.

**Why every hook drafted against it failed.** They were negative reframes:
*"Everything in your wardrobe was made for someone who isn't you."*
*"Your clothes were made before anyone knew you existed."* Both are accusations
wearing an insight's clothes, and this founder has now rejected that move three
separate times in one day: *"we only want positivity here, not what can go
wrong"*, *"I don't want this to be like accusing the customer"*, and killing
*"go and check the label"* because *"no brand would say go and check to their
customers."*

⚠️ **So the test before proposing a hook: does it start with something good she
remembers, or something wrong with her?** If it is the second, it does not go out.

There is one licensed exception, and it is hers too:

> *"M is not your size. It is the average of a thousand women."*

A flat factual hook with no accusation in it, in the Layere register. That one
works because the target is the size chart, never the reader.

### The stock hook set, built on the formula

- Remember the one pair of pants that fit at the waist, the hip and the length. What if every pair did?
- Remember the one shirt that fits across the chest. What if they all did?
- Everyone has one thing in their wardrobe that fits properly. Only one.
- You own one perfect white shirt. You have never found the second.
- Remember how that one jacket sat on your shoulders. Nothing since has.
- There is one piece you keep for the days that matter. You know exactly why.
- M is not your size. It is the average of a thousand women.
