import { catalog } from "@/data/catalog";

// All home-page copy in one place.
//
// Written 2026-08-25 after the founder corrected a first attempt that had
// taken an outside reviewer's suggested slogan VERBATIM. The reviewers found
// real problems -- a visitor could not tell what the site was, what they were
// about to do, or why it was not just another linen shop -- but the fix is
// those problems answered in Shaklek's own voice, not the reviewer's wording
// pasted in.
//
// The brand, in the founder's words: "timeless fashion essentials. This is
// the brand, this is our niche. People need to understand that these are
// fashion essentials: timeless, elegant, customizable, very skin-friendly,
// organic cotton or linen."
//
// ⚠️ THE FABRIC HALF OF THAT LINE IS AHEAD OF THE SUPPLY. On 2026-08-26 the
// founder confirmed there is no organic cotton supplier -- it is an online
// order with a two-week ETA -- and that the MVP ships LINEN ONLY, because all
// catalog photography was generated in linen. Every "organic cotton and linen"
// on the site has been narrowed to linen for that reason, not as a copy edit.
// Put cotton back the day fabrics.ts marks it available, and not before.
//
// So: "essentials" and "timeless" are load-bearing and should not be edited
// out for something punchier. The subtitle below is the founder's own line,
// which has now been restored twice after rewrites; if it needs to change
// again, that is her call and not a copy improvement.

export const HERO = {
  // One line, at the founder's direction on 2026-08-25. It replaced the
  // headline "Your look, your way." plus a four-clause subtitle, which she
  // judged too many words separated by commas to read on a phone.
  //
  // NOTE FOR WHOEVER TOUCHES THIS NEXT: "Your look, your way" was her own
  // line and had been restored twice. Removing it was her explicit decision,
  // not an edit to undo. /our-story still explains that Shaklek MEANS "your
  // way" in Arabic, which now reads as a fact about the name rather than an
  // echo of the hero.
  line: "Customisable pieces for you, by you, always at the same price.",
};

// The concept, on the page the visitor lands on.
//
// Moved here from /how-it-works on 2026-08-25, and the tab removed. The
// founder's reasoning, which is better than the layout argument: an explainer
// tab is a click that leads somewhere a customer cannot order from, so it
// costs a visitor and returns nothing.
//
// TWO steps, and the split is the whole point.
//   1. what SHE does -- pick the piece and change it until it is hers
//   2. what WE do -- measure her, make it, deliver it
// Founder, 2026-09-16: "you decide the piece... we do the rest (we come to
// you, take your measurement, tailor your piece only for you, and bring it to
// your door)."
//
// ⚠️ IT WAS THREE STEPS AND "ADD A DETAIL" WAS THE ONE THAT WENT. It was never
// the equal of the other two: it is an optional free-text box inside "Make it
// your way" on the design page, and as step 03 of three it read like a
// required stage of the process. The FIELD IS UNTOUCHED -- DetailField still
// renders in DesignCustomizer and the stylist promise is still made on /faq.
// Only the homepage billing of it has gone.
//
// This also fixed the older tension the three-step version carried: the
// handover block underneath ("we take care of the rest") was really a fourth
// step written as prose, so the page said "then we do the rest" twice. Now
// step 02 IS the handover, and the block under it only carries the timing.
//
// ⚠️ AND THIS FILE IS THE ONLY COPY. The homepage renders it (Concept.tsx) and
// nothing else does -- /how-it-works was deleted on 2026-09-15. They had once
// drifted into three steps here and five there, which she caught: "it needs to
// stay consistent with the home page." Do not add a local copy to any page.
export const STEPS = [
  {
    n: "01",
    // Her wording: "you decide the piece". DECIDE, not "choose" -- a rack lets
    // you choose.
    //
    // ⚠️ THE LIST OF SLIDERS IS GONE, HER CALL, 2026-09-16: "customize your
    // piece and watch it change". It read "Change the sleeve, the leg, the
    // width, the length and the colour, and watch it change with you", which
    // is the customizer's menu recited on the homepage -- and the menu differs
    // per garment, so it was also slightly wrong on every item that has no
    // sleeve. The DEMONSTRATION is on the product page, where the photo
    // actually changes. Here one line is enough to promise it.
    title: "You decide the piece",
    body: "Customise your 100% linen piece and watch it change.",
  },
  {
    n: "02",
    // ⚠️ THE VISIT COMES FIRST IN THIS SENTENCE. Founder, 2026-09-14: "the
    // first thing that needs to show is, we come to you and take your
    // measurements... our MAIN VALUE is that we come in and we take your
    // measurements." Leading with anything else makes the visit sound like a
    // service for people who cannot use a tape, rather than the offer.
    //
    // ⚠️ "FREE ON YOUR FIRST ORDER" IS THE SETTLED PHRASE for the visit --
    // commit 77848c4 exists to make it the only one on the site. Do not
    // reword it to "free measuring visit" or "complimentary".
    //
    // ⚠️ STANDARD SIZING IS NO LONGER NAMED HERE, and that is a deliberate
    // trade she made: the old body ended "Or pick a standard size, XS to XXL.
    // Same price", which is true and still offered -- SizePicker has both
    // modes, Tailored first and default. It is a fallback for someone who does
    // not want us in her house, and naming a fallback in a two-step summary
    // spends a third of the summary on it. It lives on the product page, where
    // the choice is actually made.
    //
    // She orders first and we get in touch, so never "book a fitting": there
    // is no booking system and nothing may imply one.
    // ⚠️ THREE SHORT SENTENCES, ONE PER THING WE DO: measure, make, deliver.
    // Founder's draft, 2026-09-16, and the rhythm is the point -- one clause
    // each, no conjunctions holding two of our jobs together in one breath.
    //
    // "YOUR tailor", not "one tailor" or "a tailor". Hers, and it is the
    // better word: it says the same thing the BENEFITS tile says about a
    // single maker, but as a relationship rather than a headcount. (And it
    // still implies no number -- see the no-count-of-tailors rule below.)
    //
    // Her draft said "your favourite linen piece". Dropped: it is her piece
    // before she has worn it, and calling it her favourite is the brand
    // deciding how she feels about it.
    //
    // ⚠️ AND "LINEN" LEFT THIS SENTENCE when step 01 gained "100% linen" on
    // 2026-09-16 -- two steps, twelve words apart, both saying linen made the
    // pair read like a template. The fabric is named ONCE per section and it
    // is named in 01, where she is choosing. If 01 ever loses it, this gets it
    // back: linen is the only sellable fabric and it is a reason to buy.
    title: "We do the rest",
    body: "We come to you and take your measurements*. Your tailor makes your piece. We then bring it to your door.",
    // Still the one the whole proposition rests on. With only two steps the
    // emphasis is doing less work than it was, but it is the half a visitor
    // has to believe, so it keeps it.
    emphasis: true,
  },
];

/** The asterisk on step 02. Kept next to the steps because a footnote that
 *  lives somewhere else is a footnote that goes missing in the next redesign,
 *  and this one is the difference between an offer and a mis-sold promise.
 *
 *  ⚠️ "FREE IN DUBAI", NOT "DUBAI ONLY". Founder, 2026-09-14: we will travel
 *  further, it just is not free. She asked for the cost to be confirmed per
 *  case rather than published, and the research says she is right, because
 *  "outside Dubai" is not one thing:
 *
 *    Sharjah or Ajman   ~50 km round trip, ~AED 12 of fuel, ~1.5 hours.
 *                       No worse than a far corner of Dubai.
 *    Abu Dhabi          ~280 km round trip, ~3 hours driving. Half a working
 *                       day, AED 250-400 all in, five to eight times the AED
 *                       50 the Dubai visit is modelled at in margins.mjs.
 *
 *  One published number cannot serve both: 150 loses money on Abu Dhabi, 300
 *  scares off a Sharjah customer we would have driven to for nothing. For
 *  scale, Prive Atelier charges AED 150 + VAT for a home visit INSIDE Dubai,
 *  which is roughly what we are giving away.
 *
 *  ⚠️ So do not put a price here until one is decided. "We will advise you" is
 *  a promise to answer, which we can keep. A number is a promise to hold it. */
// ⚠️ NO ASTERISK, AND NO "ELSEWHERE IN THE UAE". Founder, 2026-09-14, twice:
// "for now we cover only dubai measurement appointment and delivery, new
// locations coming soon" and "no need to put that asterix, you can just add in
// Dubai or something, to make it clear".
//
// This supersedes the note above it, which was hers from EARLIER the same day
// ("free in Dubai, not Dubai only"). Delivery is Dubai-only now as well as the
// visit, so an offer to "advise" someone in Sharjah about a visit we would not
// be delivering to was the wrong promise.
// ⚠️ THE ASTERISK IS BACK, AND IT IS HERS, 2026-09-16. She removed one on
// 2026-09-14 ("no need to put that asterix") when the body carried "free on
// your first order, in Dubai" itself and the marker pointed at nothing new.
// Her new step 02 is three clean sentences with the condition lifted out, so
// the marker now has a footnote to point AT. That is the difference, and it is
// why this is not a revert of her earlier decision.
//
// ⚠️ "FREE ON YOUR FIRST ORDER" IS THE SETTLED PHRASE -- nine places on the
// site say exactly that, and commit 77848c4 exists to make it the only one.
// Her draft read "free measurement on first order"; the wording here is hers
// with that phrase kept intact, so the homepage does not become the tenth
// variant.
export const STEPS_NOTE = "*Free on your first order, in Dubai. More locations coming soon.";


// ⚠️ THERE IS NO LEAD TIME ON THE HOMEPAGE, AND PUTTING ONE BACK IS A COPY
// DECISION SHE HAS ALREADY MADE. The OUTCOME block that sat here said "Ready
// in about 10 working days". Founder, 2026-09-16: "I would remove this, this
// is not something we want to highlight... it's something that may churn
// customers so this doesn't have to be the first thing they see."
//
// She is right about the placement and it is worth being precise about why:
// ten working days is the honest cost of made-to-order, but on the homepage it
// is an objection raised before the offer has been made, to a visitor who has
// not yet decided she wants anything. It belongs where somebody is ASKING.
//
// ⚠️ AND IT IS STILL SAID, IN EVERY PLACE THAT OWES IT -- this was checked, not
// assumed, before the block came out: /faq ("How long does it take?" and the
// made-to-order answer), /legal/terms, the checkout form, /order-confirmed,
// the order email, and the Meta product feed. Removing it here removed it from
// nowhere else. If you are ever tempted to delete one of those instead, do not:
// a lead time hidden from a buyer at checkout is a different thing entirely
// from one kept off a shop window.

// The three reasons to buy here rather than anywhere else, as tiles under the
// steps. Kept to three for the same reason the steps are three.
export const BENEFITS = [
  // Order and titles from the founder's mockup, 2026-08-27. Custom-made leads,
  // because it is the only one of these a normal shop cannot claim.
  //
  // ⚠️ FOUR, AND "DETAILS YOU CHOOSE" IS NOT A FIFTH. It was added as its own
  // card on 2026-09-16 and she rejected it the same day: "i don't agree i
  // think the custom made should include this, it's a lot." She is right that
  // it is a lot -- five cards is a list you skim instead of read -- and right
  // that it belongs here: choosing the sleeve IS what custom-made means on
  // this site. Split across two cards it read as two claims, and the second
  // one weakened the first by implying custom-made meant something less.
  {
    // ⚠️ THE OPTIONS COME FIRST IN THIS SENTENCE. "Nothing on a shelf" is the
    // made-to-order half and it is true of any bespoke tailor in the city;
    // choosing the sleeve yourself, on the page, before paying, is the half
    // they cannot do. Leading with theirs buried ours.
    //
    // ⚠️ "THE FIT" IS THE ONE TO CHECK IF THIS EVER LOOKS WRONG. Sleeve,
    // length and leg are render-tier sliders -- the photo visibly changes. Fit
    // is the "Make it your way" preferences, which are real and reach the
    // tailor but do NOT redraw the picture. The claim here is "change", not
    // "watch it change"; the watch-it-change promise lives in STEPS 01 and
    // must stay attached to the options that actually do.
    k: "100% custom-made",
    v: "Change the sleeve, the length, the leg, the fit. Your piece does not exist until you ask for it. No shelf, no overproduction.",
    icon: "sewing-machine",
  },
  // ⚠️ SECOND, AND IT SAYS LINEN, NOT "NATURAL". Both are hers, 2026-09-16:
  // "i think the 100% linen should be second, we agreed not to use natural
  // right? not sure we have the right to."
  //
  // She is right, and there is a written record of why she half-remembered it.
  // planning/tailor-capacity.md, open question 6: if the tailor sews with
  // POLYESTER THREAD, the hang tag's "100% PLANT BASED FABRIC" survives --
  // because it says fabric -- but "100% natural materials" in marketing copy
  // does not. That question is still unanswered. This card carried a bare
  // "100% natural" with no such qualifier, over a body that then said "Linen
  // only" anyway, so the heading was the weakest and least specific version of
  // its own claim.
  //
  // "100% linen" is narrower, it is verifiable from src/data/fabrics.ts, and
  // it survives whatever the thread turns out to be. It cannot need revisiting
  // when that answer arrives.
  //
  // ⚠️ "A NATURAL FIBRE" ABOUT LINEN SPECIFICALLY IS FINE and is still said on
  // /faq, the home FAQ, the terms and in VALUES below. Linen is flax; that is
  // not the claim at risk. What was at risk was an unqualified "100% natural"
  // standing for everything in the garment.
  //
  // Second because it is the other thing a customer is buying -- what it is
  // made of, right after what makes it hers -- and because price and
  // provenance are the answers to questions she has not asked yet at that
  // point on the page.
  {
    k: "100% linen",
    v: "Breathable plant fibre against your skin, never synthetic. It creases, and it softens with wear.",
    icon: "flax",
  },
  // ⚠️ THE VISIT IS IN THIS TILE, AND IT IS A PRICE CLAIM, NOT THE OFFER AGAIN.
  // Founder, 2026-09-16: "i believe we need to add the free home measurement
  // appointment in the reasons maybe, this is a big plus."
  //
  // It belongs HERE rather than in a tile of its own, and the distinction is
  // what keeps it from reading as repetition. STEPS 02 says we come and measure
  // you -- that is what happens. This says it costs nothing on top of the piece
  // price -- that is what it costs. A customer who has read step 02 has been
  // told a home visit exists; nothing before this tile tells her it is not an
  // add-on line at checkout, which is exactly what she would assume from every
  // other tailor in the city.
  //
  // ⚠️ THE TITLE LEADS ON THE VISIT, AND THE PRICE MOVED INTO THE BODY.
  // Founder, 2026-09-16: "I would make the title speak for the all included
  // starting by the free measurement... and every version chosen by the
  // customer." The title used to be the price and the visit was buried at the
  // end of a long sentence, which is the wrong way round for the thing she
  // calls the main value.
  //
  // ⚠️ "FIRST ORDER" IS BACK, AND THE REASON IT LEFT IS WHY. She took it out on
  // 2026-09-16 -- "don't add here the first order it's mentioned already" --
  // and it was, on both surfaces that render BENEFITS: STEPS_NOTE above these
  // tiles on the home page, and a line under the card grid on /our-story.
  //
  // That /our-story line was DELETED the same day as a repeat of this very
  // tile, which removed the only place /our-story qualified the word free. The
  // comment here had even said "if either of those lines is ever cut, this
  // comes back the same day" -- so this is that day, and the dependency was
  // real rather than theoretical. The homepage now says it twice, two sections
  // apart, which is the cheaper of the two mistakes: repeating a condition is
  // untidy, dropping it is selling a free visit to somebody on their second
  // order.
  //
  // ⚠️ SO DO NOT REMOVE IT AGAIN WITHOUT CHECKING /our-story. It is the page
  // with no other statement of the offer.
  //
  // ⚠️ "IN DUBAI" STAYS, and she did not ask for it to go. An unqualified "free
  // measurement" in a TITLE is the single easiest thing on this site to quote
  // back at us from Sharjah, and the body is where it costs nothing to say.
  //
  // ⚠️ THE PRICE IS STILL COMPUTED. Never type 449 here: it is the cheapest
  // live catalogue item and it moves when the catalogue does.
  {
    // ⚠️ "APPOINTMENT", NOT JUST "MEASUREMENT". Hers, 2026-09-16: "free
    // measuremen => free emasuremnt appointment". The shorter version read like
    // a free measuring SERVICE or a discount; the word appointment makes it the
    // thing it is, somebody coming to your home at a time you agree. It is also
    // the only word in the tile that implies a person.
    k: "Free measurement appointment, everything included",
    v: `One price per piece type, from AED ${Math.min(...catalog.map((i) => i.price))}. The fabric and every option you choose are in it, and your measuring visit in Dubai is free on your first order.`,
    icon: "tag",
  },
  // ⚠️ NO COUNT OF TAILORS HERE, AND DO NOT ADD ONE.
  //
  // Founder, 2026-08-28: "the customer doesn't have to know how many tailors
  // we have." This copy went through "local tailors" (mine, inferred from a
  // capacity note) and "a local tailor" (a correction to it) before either of
  // us noticed we were arguing about which NUMBER to imply. The customer needs
  // none. A count is a claim that has to stay true as the bench changes, and
  // the bench will change.
  //
  // What carries the value is the CONTRAST -- made here, not imported -- which
  // is true at any headcount. "The UAE" and not "Dubai" for the same reason it
  // always was: the licence is Dubai, where the tailor works is recorded
  // nowhere.
  //
  // This also stops the open "how many tailors?" question in
  // planning/pricing-todo.md gating anything on the site. It still matters for
  // capacity and lead time; it no longer matters for copy.
  {
    // ⚠️ "MADE IN THE UAE" IS CORRECT AND APPROVED. Do not "fix" this to
    // "sewn". It was changed to "Sewn in the UAE" on 2026-09-14 and reverted
    // the same day when the founder asked why: only "100% MADE in the UAE" is
    // banned, because the 100% implies the fibre came from here and the cloth
    // is milled abroad. personas.md:36 says it outright, "Made in the UAE is
    // the approved phrasing", copy-rules.mjs only matches the 100% form, and
    // country of origin in trade is where the substantial transformation
    // happens, which is where a garment is cut and sewn. productDisclosure.ts
    // already carries it as the legal origin field.
    k: "Made in the UAE",
    v: "Cut and sewn here by one tailor, never shipped in from a factory abroad.",
    icon: "pin",
  },
];

// ⚠️ VALUES AND POSITIONING WERE DELETED HERE ON 2026-09-16, WITH
// components/home/ValueBand.tsx WHICH WAS THEIR ONLY READER. Founder's call,
// asked and answered: "delete it."
//
// They were a SECOND answer to "why choose us" -- four reasons ("Made only for
// you", "Kind to your skin", "Tailoring is never an upgrade", "Timeless, not
// this season") that overlapped BENEFITS above without matching it, plus a
// positioning line. ValueBand was imported by no page, so nobody saw them, and
// a list nobody renders is a list nobody corrects: "Tailoring is never an
// upgrade" still argued that your own measurements cost the same as a standard
// size, which stopped being the story on 2026-09-14 when Tailored became the
// default and we started taking the measurements ourselves.
//
// This is the same failure that put "Why Shaklek?" on /our-story out of step
// with "Why choose us" on the home page -- caught the same day, one list live
// and one dormant. A dormant one is worse: it cannot be spotted by reading the
// site, and it comes back the day somebody renders the component.
//
// ⚠️ ONE LINE SURVIVED THE DELETION, AND IT IS THE ONLY ONE. Founder,
// 2026-09-16, asked whether to recover it: "yes that line is genuinely good."
//
// It now opens the BENEFITS section instead of heading a band of its own,
// which is where ValueBand's own reasoning said it belonged and the one part of
// that component worth keeping: "a visitor who has scrolled past eight garments
// is asking 'why you and not the shop I already use'". It reads as the question
// the four tiles under it answer.
//
// ⚠️ THIS IS THE ONLY POSITIONING LINE ON THE SITE. That is the point of it
// being here rather than inline in Benefits.tsx: the last time two answers to
// one question lived in two files they drifted for weeks. If a new one is ever
// wanted, it replaces this. There is never a second.
//
// ⚠️ AND IT IS THE ONE PLACE THE COMPARISON IS MADE OUT LOUD. Nothing else on
// the site argues against ready-to-wear by name; the tiles state what we do and
// let the reader draw it. One sentence doing it explicitly is a position. Two
// would be a grievance.
export const POSITIONING = {
  line: "Ready-to-wear makes thousands of a garment and hopes one of them fits you.",
  emphasis: "We make one. Yours.",
};
