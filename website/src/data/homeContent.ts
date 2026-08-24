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
  headline: ["Your look,", "your way."],
  // The founder's line. "Elegant" became "timeless" at her direction, because
  // timelessness is the positioning: essentials that outlast a season, as
  // opposed to fast fashion.
  subtitle:
    "Timeless essentials, customizable to your taste, friendly to your skin, shaped to your body.",
};

// The funnel.
//
// THREE numbered steps, not four, and the count is not a style choice: the
// design page's own stepper prints "Step N of 3" (TOTAL_STEPS in
// DesignCustomizer.tsx), where step 1 is choosing the piece on the catalog. A
// home page promising four steps and a customizer counting three is the site
// contradicting itself about the one thing the visitor is trying to learn.
//
// What the tailor does afterwards is real and belongs on the page -- it is
// most of why this brand exists -- but it is not a step the customer takes, so
// it is rendered as an outcome rather than given a number.
export const STEPS = [
  {
    n: "01",
    title: "Choose your piece",
    body: "Timeless essentials in organic cotton or linen.",
  },
  {
    n: "02",
    title: "Make it yours",
    // NOT "a real photograph". The catalog images are generated, not
    // photographed, so claiming photography is a false statement about the
    // product to someone deciding whether to spend AED 389 -- and it is the
    // exact claim that makes a customer feel cheated if the garment differs.
    // Founder's call, 2026-08-25. Describe what the customer DOES instead.
    body: "Sleeve, length, leg, width, colour, and more to come. Customize your piece and watch it change.",
  },
  {
    n: "03",
    title: "Give your measurements",
    // Measurements first, standard size second -- the founder's instruction,
    // and it is not a wording preference. Cutting to a real body is the whole
    // reason this brand charges what it does; leading with "pick XS to XXL"
    // described Shaklek as a shop that also does alterations. Tailored is
    // already the DEFAULT in the size picker, so listing it second also
    // disagreed with what the product actually does.
    body: "Send your own measurements, or pick a standard size. Same price either way.",
  },
];

export const OUTCOME = {
  n: "Then",
  title: "A tailor makes it",
  body: "Every piece you pick is tailored only for you. 10 days to your door.",
};

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
