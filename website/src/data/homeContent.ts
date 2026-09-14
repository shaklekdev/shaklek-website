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
// THREE steps, not five, and the order is deliberate:
//   1. basic, and the same as any shop -- nothing to learn
//   2. the measurements, which are both the business model and the thing that
//      makes this different from a rack
//   3. optional, and the competitive edge
// What the tailor does afterwards is real but is NOT a step, because the
// customer has nothing left to do by then. Three reads as quick and
// deliberate; five reads as work.
// ⚠️ THREE STEPS, AND ALL THREE ARE THINGS SHE DOES. Founder, 2026-09-14:
// "the goal is just to show the customer that it's a fast process... you pick
// a piece, we come take your measurements, do it for you, add your details,
// and ship it."
//
// That is the whole idea and it survived four rejected drafts of
// /how-it-works: the customer's list is SHORT, and everything after it is
// ours. So each step is one line, none of them describes our work, and the
// handover below is where our work starts and stays.
//
// ⚠️ AND THIS FILE IS THE ONLY COPY. The homepage and /how-it-works both
// render it. They had drifted into three steps here and five there, saying
// different things, which she caught: "it needs to stay consistent with the
// home page." Do not add a local copy to either page.
//
// ⚠️ `more` IS RENDERED ONLY ON /how-it-works. The homepage keeps the short
// version. Founder, 2026-09-14: "we can add more details later on how it works,
// the version on the home page should be a smaller one." Two lengths, still one
// list, so they cannot contradict each other the way they did when each page
// owned its own copy.
export const STEPS = [
  {
    n: "01",
    title: "Choose your piece",
    body: "Change the sleeve, the leg, the length and the colour, and watch it change with you.",
    more: "Every combination has its own image, front and back, so you can see what you are choosing instead of imagining it. Shirts and pants in 100% linen, in ivory, white, navy and burgundy.",
  },
  {
    n: "02",
    // ⚠️ THE VISIT COMES FIRST IN THIS STEP, AND THE ALTERNATIVES COME AFTER.
    // The first draft read "Your measurements, or ours" and opened with "send
    // your own". Founder, 2026-09-14: "the first thing that needs to show is,
    // we come to you and take your measurements. You can also send your own if
    // you prefer... our MAIN VALUE is that we come in and we take your
    // measurements."
    //
    // So the order of the sentence is the argument. Leading with "send your
    // own" makes the visit sound like a fallback for people who cannot use a
    // tape; leading with the visit makes it the offer, and the other two the
    // fallbacks. Same three options either way.
    //
    // ⚠️ DUBAI SITS IN THE FOOTNOTE, NOT THE SENTENCE. Her instruction: "you
    // can put an asterisk, say, explaining that this is a Dubai-based offer."
    // It still has to be SAID, because somebody in Sharjah reading a promise
    // that names no city has been mis-sold, but in the line it was the caveat
    // interrupting the offer. See STEPS_NOTE.
    //
    // She orders first and we get in touch, so never "book a fitting": there
    // is no booking system and nothing may imply one.
    title: "We take your measurements",
    body: "We come to you and take them ourselves, free on your first order.* Prefer to send your own numbers, or pick XS to XXL? That works too.",
    more: "A tailor cuts to far more measurements than a form can sensibly ask for, and the shoulder is both the hardest to take on yourself and the one that cannot be altered once the cloth is cut. Twenty minutes with a tape is the difference between a piece that fits and one that nearly does.",
    // The one the whole proposition rests on, so it is allowed to look
    // different from its neighbours rather than being one of three equals.
    emphasis: true,
  },
  {
    n: "03",
    title: "Add a detail",
    body: "A wider collar, a shorter sleeve. Tell us and a stylist confirms it before anything is cut.",
    more: "In your own words, in the box on the piece you are ordering. A stylist reads every order and tells you what is possible before the cloth is cut, so nothing is a surprise.",
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
export const STEPS_NOTE = "* Free in Dubai. Elsewhere in the UAE, ask us and we will advise you.";

/** The same note, in full, for /how-it-works. */
export const STEPS_NOTE_FULL =
  "* Free in Dubai, and we get in touch after you order to find a time that suits you. Elsewhere in the UAE, reach out on WhatsApp or email and we will advise you.";

// Where she stops and we start. ⚠️ Hedged on purpose: "strive to" and
// "approximately", matching the terms of sale, which call it an estimate and
// not a guarantee. And WORKING days, her correction on 2026-09-14: every page
// said "10 days", which is a week and a half, not two calendar weeks.
export const OUTCOME = {
  title: "We take care of the rest",
  body: "One tailor makes your piece, nothing before you order it. We strive to have it ready in approximately 10 working days, and it arrives at your door.",
};

// The three reasons to buy here rather than anywhere else, as tiles under the
// steps. Kept to three for the same reason the steps are three.
export const BENEFITS = [
  // Order and titles from the founder's mockup, 2026-08-27. Custom-made leads,
  // because it is the only one of the three a normal shop cannot claim.
  {
    k: "100% custom-made",
    v: "Nothing on a shelf. Your piece does not exist until you ask for it. No overproduction, no waste.",
    icon: "sewing-machine",
  },
  {
    k: `One price, from AED ${Math.min(...catalog.map((i) => i.price))}`,
    v: "One price per piece type. Fabric and every option included.",
    icon: "tag",
  },
  {
    k: "100% natural",
    v: "Linen only. Breathable natural fabric against your skin, never synthetic.",
    icon: "flax",
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
    k: "Made in the UAE",
    v: "Cut and sewn here, never shipped in from a factory abroad.",
    icon: "pin",
  },
];

// Why this deserves to exist next to everything else in the market. Each one
// is a thing a customer gets that a rack of ready-to-wear cannot give them.
export const VALUES = [
  {
    k: "Made only for you",
    v: "Nothing is cut until you order it. No warehouse, no overproduction, and nothing waiting for a body it happens to fit.",
  },
  {
    k: "Kind to your skin",
    v: "100% linen, and nothing else. Breathable natural fibre against your skin all day, never synthetic.",
  },
  {
    k: "Tailoring is never an upgrade",
    v: "Your own measurements cost exactly the same as a standard size. Customizing every option costs the same too.",
  },
  {
    k: "Timeless, not this season",
    v: "Essentials chosen to still be worn in five years, cut properly, in fabric that softens instead of wearing out.",
  },
];

// The positioning line. This is the "why do we deserve to be in this market"
// answer in one sentence, and it is the only place the comparison is made
// out loud.
export const POSITIONING = {
  line: "Ready-to-wear makes thousands of a garment and hopes one of them fits you.",
  emphasis: "We make one. Yours.",
};
