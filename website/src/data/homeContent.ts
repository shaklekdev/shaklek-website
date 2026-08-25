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
  line: "Customisable pieces for you, by you, at the same price either way.",
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
export const STEPS = [
  {
    n: "01",
    title: "Pick your piece",
    body: "Eight essentials in linen or organic cotton. Change the sleeve, leg or length and watch the piece change with it.",
  },
  {
    n: "02",
    title: "Your size, or your measurements",
    body: "Send your measurements and it is cut to them, or pick XS to XXL. Same price either way.",
    // The one the whole proposition rests on, so it is allowed to look
    // different from its neighbours rather than being one of three equals.
    emphasis: true,
  },
  {
    n: "03",
    title: "Add a detail",
    body: "A wider collar, a shorter sleeve. Tell us and a stylist confirms it before anything is cut.",
  },
];

export const OUTCOME = {
  title: "We take care of the rest",
  body: "One tailor, one piece, nothing made before you order it.",
};

// The three reasons to buy here rather than anywhere else, as tiles under the
// steps. Kept to three for the same reason the steps are three.
export const BENEFITS = [
  {
    k: `From AED ${Math.min(...catalog.map((i) => i.price))}`,
    v: "One price per piece type. Fabric and every option included.",
    icon: "tag",
  },
  {
    k: "Nothing on a shelf",
    v: "Your piece does not exist until you ask for it. No overproduction, no waste.",
    icon: "leaf",
  },
  {
    k: "Cotton and linen only",
    v: "Breathable natural fabric against your skin. Never synthetic.",
    icon: "thread",
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
    v: "Organic cotton and linen, and nothing else. Breathable natural fibre against your skin all day, never synthetic.",
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
