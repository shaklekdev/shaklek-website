# Objection handling for a made-to-order brand with no track record (2026-08-30)

Principle #22: answer the question before the customer asks it. These are the
five objections that actually block a first order here, with copy that is true
of the shipped product, plus WhatsApp reply templates for when the question
arrives anyway (#17 listen more than you speak).

Rules applied: no em dashes, no invented proof, no guarantee beyond what
/legal/terms and the checkout already state, no urgency. Every factual claim
is sourced at the end of its section.

---

## 1. "Will it actually fit?"

The deepest objection, because the customer cannot try it on.

**Copy (site, social caption, or reply):**

> You choose how sure you want to be. Pick a standard size, XS to XXL for
> tops, 32 to 44 for trousers, and we cut to that. Or send your own
> measurements and we cut to those instead, at the same price. Either way, if
> the fit is not right when it arrives, you get one free alteration or remake
> within 14 days. Message us a photo and a stylist arranges it.

**WhatsApp template:**

> Good question. If you know your size, pick it and we cut to the standard
> chart on our size guide. If you want it exact, send your measurements
> instead, it costs the same. And if anything is off when it arrives, the
> first alteration or remake is free within 14 days. You are not stuck with a
> guess.

Sources: sizeChart.ts (XS to XXL, EU 32 to 44), productDisclosure.ts returns
row, terms#returns, checkout details block.

## 2. "How long will it take?"

**Copy:**

> About ten working days from when a stylist confirms your details, which
> usually happens within a day. It takes that long because your piece does not
> exist yet. Nothing is cut until you order it, and one tailor makes it, one
> piece at a time. Delivery anywhere in the UAE is included.

Do not apologise for the ten days and do not promise faster. The founder's
adviser was right that speed is the wrong headline for made-to-order; the
honest frame is that the wait is the proof the piece is yours.

Sources: faq/page.tsx, HomeFaq.tsx, tailor-capacity.md (10 days is the number
that breaks first; never shorten it in copy).

## 3. "Can I return it if I change my mind?"

Answer it straight, fit promise first, and never bury the no-refund rule.
UAE consumer law lets a retailer decline change-of-mind refunds only where the
policy is displayed, so hiding it is both dishonest and self-defeating.

**Copy:**

> A made-to-order piece is cut for one person, so we do not offer
> change-of-mind refunds once it is made. What we do instead: if the fit is
> wrong, one free alteration or remake within 14 days. If a piece arrives
> faulty or is not what you ordered, we remake or refund it in full, no
> argument.

Sources: CheckoutForm.tsx open text, faq/page.tsx returns answer,
legal/terms#returns.

## 4. "Who are you? Is this real?"

The honest answer for a brand with two orders is people and paperwork, not
numbers. Never imply a customer base, review count, or press that does not
exist (#10, #23).

**Copy:**

> Shaklek is a licensed Dubai business, Shaklek For Online Selling, licence
> 1645657, and the licence is printed on every product page. A person reads
> every order before anything is cut, a tailor in the UAE makes it, and a
> person answers the WhatsApp line. The founder reads feedback herself; her
> note is on the story page.

**WhatsApp template (for "is this a real shop?"):**

> Completely fair to ask. We are a licensed Dubai business (licence 1645657,
> it is on every product page under Sold by). Every order is confirmed by a
> stylist before the tailor cuts anything, and you are talking to a person
> right now. Ask us anything before you order.

Sources: productDisclosure.ts Sold by row, faq/page.tsx "Is there a real
person behind this?".

## 5. "Why is it AED 389?"

The price needs a frame, not a defence (#3 state price with confidence, #14
value over price). The frame is what is inside the number.

**Copy:**

> AED 389 is the whole price. The linen, cutting to your measurements instead
> of a standard size, every option you change, and delivery across the UAE are
> all included. There is no tailoring surcharge and nothing added at checkout.
> Compare it to what you actually pay for a shirt that almost fits: the shirt,
> then a tailor to fix the sleeves. Here the tailor is not an extra. The
> garment is cut for you the first time.

**Do not** publish a cost breakdown (fabric X, tailoring Y) without the
founder. The internal numbers exist in pricing-todo.md and the margin is
thinner than the older docs claimed; an Everlane-style transparency graphic is
a possible future move but it is a pricing decision, not a caption.

Sources: catalog.ts BASE_PRICE_BY_CATEGORY (Shirt 389, verified 2026-08-30),
homeContent.ts BENEFITS, faq price answer ("No quotes, and no surprises at
checkout").

---

## After the order: the loyalty moment (#16, #17)

The brand's real loyalty asset is the saved measurements: the second order
needs no guessing at all. The site never says this to anyone. Two places it
costs nothing:

**Delivery follow-up WhatsApp (also the only honest path to #10 proof):**

> Your piece should have arrived. How is the fit? If anything is off, the
> first alteration or remake is free within 14 days, just send a photo. And
> if you love it, we would genuinely like to see it worn. Only if you are
> happy for us to share it.

Real customer photos gathered this way, with explicit consent each time, are
the only testimonials this brand is allowed. Never paraphrase a customer into
words they did not send, and never post without the ask and the yes in
writing.

**Order confirmation or account page line (site copy, founder's call):**

> Your measurements are saved to your account. Next time, the fit is already
> done.
