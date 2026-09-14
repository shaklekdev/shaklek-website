/**
 * Blog articles, for search.
 *
 * WHY THIS IS DATA AND NOT MDX: the site has no MDX pipeline and adding one to
 * publish three articles is a build dependency for no gain. A block model also
 * makes the heading structure explicit, which is the entire SEO point: one H1
 * per page, H2 for sections, H3 beneath them. A markdown file lets an author
 * skip a level by accident; this does not.
 *
 * ⚠️ THE FIBRE RULE HAS EXPIRED, AND THE ARTICLES STILL FOLLOW IT ANYWAY.
 * This said "no fibre composition, the entry fabric is still being settled".
 * Linen-only was decided on 2026-09-08, so "100% linen" is now safe to write.
 * The existing three still discuss plant fibres as a CATEGORY, which is a
 * better article regardless: a piece that argues linen beats polyester in
 * humidity is useful to a stranger, and a piece that only says "ours is linen"
 * is an advertisement. Write about the category, mention what we cut once.
 *
 * ⚠️ PRICES: THE BLANKET BAN IS OVER, THE DISCIPLINE IS NOT. This used to read
 * "NO PRICES either", written while the fabric was unsettled. It then sat here
 * contradicting the file it governs, because the cost article publishes 690 on
 * the founder's own decision. The rule now, from her, 2026-09-13:
 *
 *   - A PRICE IS ALLOWED where the article's job is the price ("how much does
 *     an abaya cost in Dubai") or in a closing sell. Nowhere else. An article
 *     that scatters prices through its body is an advertisement.
 *   - IT MUST MATCH catalog.ts, read at the time of writing, never memory.
 *     Today: Shirt 449, Pants 519, Abaya 690. Change one, change both, and the
 *     comment on BASE_PRICE_BY_CATEGORY names this file for that reason.
 *   - SOMEBODY ELSE'S PRICE CARRIES `market: true` on its block. Ours never
 *     does. See the note directly below.
 *   - EVERY NUMBER CARRIES ITS CURRENCY, including the second number in a
 *     range and a price per metre. "AED 800 to AED 3,000", not "800 to 3,000";
 *     "AED 65 a metre", not "65 a metre". Founder, 2026-09-13: "you often give
 *     number with no currency this is not good."
 *   - AND NEVER A LEAD TIME, which is a different rule and still absolute. It
 *     was cut from advertising and from the terms of sale on 2026-09-12.
 *
 * ⚠️ NO ATTRIBUTION TO A PERSON AT THIS COMPANY. Founder, 2026-09-13: "i don't
 * like the part you talk about 'our founder', please check other blogs, news
 * things for general claims". A claim that cannot be sourced to a published
 * guide, a news piece, a retailer listing or our own catalogue gets CUT, not
 * attributed to her experience. Our own workshop and supplier figures are still
 * usable, said as ours.
 *
 * ⚠️ NO EM DASHES. Founder's standing correction, enforced in
 * scripts/social/kinda-chic.mjs for social copy and applied to all
 * customer-facing writing.
 */

/**
 * ⚠️ `market: true` MARKS A PRICE THAT IS SOMEBODY ELSE'S, NOT OURS.
 *
 * The stale-price rules in scripts/social/copy-rules.mjs exist to stop us
 * advertising a number the catalogue no longer charges, and they fire on any
 * "from AED 3xx" because on a social post every price is ours. An article
 * about what the Dubai market charges is the one place that is wrong: quoting
 * the shop floor at 300 is the point of the piece.
 *
 * So this flag suppresses ONLY the stale-price rules, ONLY on the block that
 * carries it, and lint-blog.mjs PRINTS every skip so a silent exemption cannot
 * accumulate. Never put it on a block describing a Shaklek price.
 */
export type Block =
  | { type: "p"; text: string; market?: boolean }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string; market?: boolean }
  | { type: "ul"; items: string[] }
  | { type: "callout"; text: string }
  /** A line worth stopping on. Breaks up a long read; use sparingly, once or
   *  twice per article, never next to a callout. */
  | { type: "quote"; text: string }
  /** Real photography. Catalogue shots are 848x1264, marketing 1584x672.
   *  ⚠️ Every image must EARN its place -- it shows the thing being described,
   *  not decoration. An article about how linen behaves in heat shows linen. */
  | { type: "image"; src: string; alt: string; caption?: string; w: number; h: number }
  /** Two portrait shots side by side, for comparisons. */
  | { type: "pair"; a: { src: string; alt: string }; b: { src: string; alt: string }; caption?: string }
  /** Two complete LOOKS, each a shirt above its trousers.
   *  ⚠️ DO NOT LABEL THESE BY SLEEVE LENGTH. Checked 2026-09-10: there is no
   *  photograph in the catalogue of a shirt with the sleeves DOWN. Every
   *  long-sleeve shot is rolled to the forearm, and the blouse, utility shirt
   *  and wrap top are all short-sleeved. A label reading "long sleeve" against
   *  a rolled cuff is a claim the picture does not support, which the founder
   *  caught. Label by the trouser cut, which is unambiguous and visible. */
  /** ⚠️ `top` IS OPTIONAL AND USUALLY SHOULD BE OMITTED. It was two photographs
   *  per column, a shirt above its trousers, and on a phone the figure ate 72%
   *  of the screen. Founder, 2026-09-13: "remove the shirts, keep the pants."
   *  She is right beyond the height: the caption compares TROUSERS, so the
   *  shirts were a second variable the text never mentioned. Show only what the
   *  caption is actually about. */
  | { type: "looks"; a: { top?: string; bottom: string; label: string };
      b: { top?: string; bottom: string; label: string }; caption?: string }
  /** A colour pairing guide: an outer colour, and the colours that work beneath
   *  it. Founder, 2026-09-13, on the first draft of the abaya article: "you can
   *  give advice, and you can put a palette of colours... this is practical
   *  advice", against prose that asserted a styling rule with nothing behind it.
   *
   *  ⚠️ EVERY ROW HAS TO BE DEFENSIBLE. These are shown as swatches, which reads
   *  as authority, so a row invented to fill the table is worse than a shorter
   *  table. Sources for the current rows are cited in the article body. */
  | {
      type: "palette";
      rows: { outer: { name: string; hex: string }; under: { name: string; hex: string }[]; note: string }[];
      caption?: string;
    }
  /** A pointer to another article.
   *
   *  ⚠️ `reason` IS NOT OPTIONAL AND IS THE ENTIRE VALUE OF THE BLOCK. Rule 5
   *  of the journal brief is "a sentence that gives a reason to follow it", and
   *  a bare "Related articles" list is precisely what that rule exists to
   *  prevent. Founder, 2026-09-13: "they all need link for each other's
   *  articles." The test for a reason: if it would read just as well at the
   *  foot of any of the other articles, it has failed. It has to say why THIS
   *  reader, having just finished THIS piece, wants that one.
   *
   *  The title is NOT stored here. It is read from the target article at render
   *  time, so retitling an article updates every link to it and a link can
   *  never advertise a headline the page no longer carries.
   *
   *  lint-blog.mjs resolves `slug` against `articles` and fails the build on a
   *  dead slug, a self-referential link, or an empty reason. It also fails on an
   *  ORPHAN: an article nothing links to, or one that links nowhere. */
  | { type: "link"; slug: string; reason: string };

export type Article = {
  slug: string;
  /** The H1. Also the <title>. Written as the question someone would type. */
  title: string;
  /** Meta description. Google truncates around 155 characters. */
  description: string;
  /** ISO date. Drives the sitemap lastModified and the Article schema. */
  published: string;
  updated?: string;
  readingMinutes: number;
  /** The standfirst under the H1. Not a duplicate of the description. */
  intro: string;
  /** Lead image, above the title. Wide crop. */
  hero: { src: string; alt: string; w: number; h: number };
  blocks: Block[];
};

export const articles: Article[] = [
  {
    // ⚠️ THE TOPIC CAME FROM THE FOUNDER, NOT FROM A KEYWORD TOOL, and then the
    // keyword data agreed with her. 2026-09-13: "the shirt and pants are what
    // goes beneath the abaya if they wish so... for emaratis they wear abaya
    // and beneath it, either a dress or some wear pants and shirts."
    //
    // UAE autocomplete returns "what to wear under an OPEN abaya" across two
    // separate phrasings, plus "abaya with pants and shirt", "abaya with pants
    // dubai", "open abaya with pants" and "what to wear under abaya in summer".
    // That is our exact product described in somebody else's search box.
    //
    // It also sells TWO GARMENTS, which is the 71% margin line: a second piece
    // in the same order pays no second lot of packaging or shipping.
    //
    // Checked and found EMPTY, so do not chase them: "hijabi office outfits
    // dubai" and "modest workwear dubai". No demand, and "modest wear" is a
    // banned term in planning/marketing/personas.md anyway.
    slug: "what-to-wear-under-an-open-abaya",
    // ⚠️ THE BRIEF, after two rejected drafts. Founder, 2026-09-13: "work
    // backwards from what people really need when they're asking these
    // questions... you're giving information, but useless information. People
    // want to know what they might be doing wrong. What is the best solution?
    // How can I mix colours?"
    //
    // The intent behind this search is NOT a physics question. Somebody typing
    // it owns or is buying an abaya and does not want to look wrong. So the
    // article is prescriptive and visual: formulas, a colour table, and the
    // specific mistakes. The fabric argument is one short section near the end.
    //
    // ⚠️ AND DO NOT ASSERT A STYLING RULE WITHOUT A SOURCE. Draft one said
    // "close tones read as deliberate", which was invented. She caught it:
    // "should it really? who says that? why?" Every claim below traces to a
    // cited source or to something visible in our own catalogue.
    title: "What to wear under an open abaya in summer",
    description:
      "The colour rule, the three combinations that work, and the four mistakes people make. A practical guide for Gulf heat, from a workshop cutting linen in the UAE.",
    published: "2026-09-13",
    readingMinutes: 6,
    intro:
      "An open abaya frames a narrow strip of whatever is underneath, from collar to ankle, all day. Getting that strip right is mostly three decisions: the colour, the cut, and the cloth.",
    hero: { src: "/marketing/hero-banner.jpg", alt: "Loose linen, worn in Gulf heat.", w: 1584, h: 672 },
    blocks: [
      {
        type: "p",
        text: "The short version: keep the shirt and the pants in the same colour as each other, keep the abaya in the same family, and let the abaya be the only loose layer. Then choose a plant fibre, because both layers have to let sweat out.",
      },

      { type: "h2", text: "The colour rule, and why it holds" },
      {
        type: "p",
        text: "The single change that fixes most outfits is to put the shirt and pants in one colour. Two colours beneath an open abaya divide the visible strip into three bands and shorten the whole line. One colour reads as a single column.",
      },
      {
        type: "p",
        text: "This is not a personal preference. Stylists call it column dressing, and the mechanism they give is always the same: a change of colour at the waist or the hip is a horizontal break, and the eye stops at it. One colour from shoulder to ankle gives the eye nothing to stop on. Tonal dressing, meaning one colour family layered within itself rather than high contrast, is also the documented direction of Gulf abaya styling for 2026 in every forecast we could find.",
      },
      {
        type: "p",
        // Reframed 2026-09-13 from a bare assertion onto what the 2026 guides
        // actually say: the colour is in the abaya, the layer underneath is the
        // quiet one. Jewel tones for evening, earthy neutrals for day.
        text: "The rule is asymmetric, which is the part most guides skip. Those forecasts put the colour in the abaya itself, jewel tones for evening and sandalwood, taupe and khaki for daytime, and treat whatever is underneath as the quiet half. So a neutral abaya can carry a coloured layer underneath. A coloured abaya wants neutrals under it.",
      },

      {
        type: "palette",
        rows: [
          {
            outer: { name: "Black abaya", hex: "#14100f" },
            under: [
              { name: "Ivory", hex: "#f5f0e8" },
              { name: "Sand", hex: "#d8c9b0" },
              { name: "Taupe", hex: "#a89684" },
              { name: "Charcoal", hex: "#3a3a3c" },
            ],
            note: "The most forgiving outer colour. Black takes almost anything, so this is the one time a soft colour underneath is safe.",
          },
          {
            outer: { name: "Beige or sand abaya", hex: "#d8c9b0" },
            under: [
              { name: "Ivory", hex: "#f5f0e8" },
              { name: "Olive", hex: "#6b7255" },
              { name: "Chocolate", hex: "#5a4436" },
            ],
            note: "Stay in the warm family. Colour guides give the same instruction for neutrals as for paint: pick the dominant neutral first, then echo its temperature. A blue-based white or a cool grey next to a warm beige is the pairing that makes the beige look muddy.",
          },
          {
            outer: { name: "Navy abaya", hex: "#0a2d4a" },
            under: [
              { name: "Ivory", hex: "#f5f0e8" },
              { name: "White", hex: "#fafafa" },
              { name: "Navy", hex: "#0a2d4a" },
            ],
            // ⚠️ THIS NOTE USED TO SAY "avoid black, which reads as an accident
            // rather than a choice". Invented, and worse, contradicted by what
            // styling guides currently say: the navy-with-black ban came out of
            // early 20th century menswear and has been retired, with tonal
            // dressing treating the two as a gradient. A swatch table reads as
            // authority, so a row cannot carry a verdict nobody published.
            note: "Navy on navy is the sharpest version and the clearest example of column dressing. Ivory beneath is the easier one. Navy with black is safe too: that old ban came out of menswear and current guides treat the pair as a tonal gradient rather than a clash.",
          },
          {
            outer: { name: "Burgundy or plum abaya", hex: "#4a1a2d" },
            under: [
              { name: "Ivory", hex: "#f5f0e8" },
              { name: "Sand", hex: "#d8c9b0" },
              { name: "Burgundy", hex: "#4a1a2d" },
            ],
            note: "A jewel tone is doing the work, so the layer underneath should not compete. Neutrals only.",
          },
        ],
        caption:
          "Navy, burgundy, ivory and white are the four we cut. Navy and burgundy sit in the jewel-tone group named across 2026 Gulf abaya forecasts; ivory and sand sit in the earthy neutral group.",
      },
      {
        type: "p",
        text: "One more, taken from hijab colour guides: pick the scarf up from a less dominant colour in the outfit rather than the most obvious one. What they are after is a single colour linking the scarf to the rest, not every piece matching.",
      },

      { type: "h2", text: "Three combinations that work" },
      { type: "h3", text: "Straight pants and a shirt, one colour" },
      {
        type: "p",
        text: "The most flexible, because it survives the abaya coming off indoors. Straight or wide pants hold the same uninterrupted vertical line the abaya makes. A tapered leg puts a break at the calf, which is exactly the horizontal interruption column dressing exists to avoid.",
      },
      { type: "h3", text: "A simple dress" },
      {
        type: "p",
        text: "One waistband fewer and faster to put on. Watch the length: a dress ending near the abaya hem creates a visible double edge at the ankle, so noticeably shorter or clearly longer both read better than almost the same.",
      },
      { type: "h3", text: "Tonal, not matched" },
      {
        type: "p",
        text: "Two shades of the same family, lighter underneath than the abaya. Sand under camel, ivory under taupe, navy under a deeper navy. This is the one the 2026 forecasts keep pointing at, and the luxury end of the Gulf market has gone the same way: variation within a single palette rather than contrast across two.",
      },

      { type: "h2", text: "The four mistakes" },
      {
        type: "ul",
        items: [
          "A tight top underneath. It shows an outline through the open front and defeats the point of the outer layer. Fitted is not the same as tight.",
          "Bulky layers. A heavy knit under a fluid abaya kills the drape that makes it hang well, and drape is most of what you paid for.",
          "Too many colours at once. Shirt, pants, abaya and scarf in four different shades leaves nowhere for the eye to rest.",
          "Pants that reach the floor. The abaya already covers the ankle, so two hems collect the same dust and the inner one always loses.",
        ],
      },
      {
        type: "p",
        text: "The last of those is the commonest and the hardest to fix off a rail, because pant length on a rail is cut for an average height rather than for yours.",
      },

      { type: "h2", text: "Fitted or loose, in 45 degrees" },
      {
        type: "p",
        text: "Styling guides say fitted underneath, to keep the abaya's line clean. Anyone who has spent August here says loose, so air can move. Both are right about their own problem, and almost nobody reconciles them.",
      },
      {
        type: "p",
        text: "The resolution is that fitted should mean skimming rather than tight, and the fibre does the rest. A linen shirt cut close to the body still stands slightly away from skin, because the cloth is stiff enough not to cling. A jersey top the same size will cling. It is the fabric, not the size on the label, that decides whether fitted is bearable in summer.",
      },
      {
        type: "quote",
        text: "Fitted is a measurement. Clinging is a fabric.",
      },

      { type: "h2", text: "And the abaya has to breathe too" },
      {
        type: "p",
        text: "Sweat leaves your skin, crosses the inner layer, and then has to get out through the abaya. There is a number for this. Textile moisture regain, the share of its own weight a fibre will hold as water, is about 12% for linen and 8.5% for cotton, against 0.2 to 0.4% for polyester. Nida and most abaya crepes are polyester. So a breathable shirt underneath a polyester abaya is sealed inside something that is not, and the outer layer is the one in direct sun.",
      },
      {
        type: "p",
        text: "This is worth knowing before buying either piece, and it decides more than the colour does.",
      },
      {
        type: "link",
        slug: "what-to-wear-dubai-summer-fabric",
        reason:
          "This article says both layers have to breathe. That one goes fibre by fibre and gives the number behind it, including the desert experiment that explains why a loose black abaya is not the mistake it is assumed to be.",
      },

      { type: "h2", text: "In short" },
      {
        type: "ul",
        items: [
          "Shirt and pants in one colour. It is the single change that fixes the most.",
          "Neutral abaya, colour underneath. Coloured abaya, neutrals underneath.",
          "Skimming, not tight, and let the abaya be the loose layer.",
          "Pants clear the floor by a centimetre or two.",
          "Both layers need to breathe, or neither does.",
        ],
      },
      {
        type: "callout",
        // ⚠️ "We cut open abayas" was a claim about a product with no catalogue
        // entry and no way to buy it. The abaya is coming; it is not made yet.
        // Say what ships and say what is coming, separately. Journal review,
        // 2026-09-13.
        // ⚠️ PRICES ADDED 2026-09-13 ON THE FOUNDER'S APPROVAL, and checked
        // against catalog.ts, not against memory: every Shirt is 449, every
        // Pants is 519, Abaya is 690. Change one, change both. This article
        // sells TWO garments, which is the ~71% margin line, and it carried no
        // number and no way to act until now.
        text: "We cut shirts and pants in 100% linen in the UAE, in ivory, white, navy and burgundy, made after they are ordered rather than before. Shirts are AED 449 and pants AED 519, with an open abaya at AED 690 joining them when we open. If you are in Dubai we come to you and take the measurements ourselves, once, at no charge, which is how the pants end up clearing the floor rather than dragging on it.",
      },
      {
        type: "link",
        slug: "how-much-does-an-abaya-cost-in-dubai",
        reason:
          "You have settled what goes underneath. If the abaya itself is still to buy, this is what the three price bands actually cost in 2026, and which souq or district each one is bought in.",
      },
      {
        type: "link",
        slug: "nobody-is-a-medium",
        reason:
          "The fourth mistake above, pants that reach the floor, is a length problem, and no size chart has your height in it. This is why the rail cannot fix it and what does.",
      },
      {
        type: "p",
        text: "Sources for the styling and colour guidance above: 2026 Gulf abaya colour forecasts from AbayaButh, Soleil UAE, Dar Al Mutahajiba, Lusso Moda and Rutba Fashion; column dressing and the horizontal-break explanation from Hayley Eleanor, Who What Wear and Gaâla; neutral undertone pairing from Palette Hunt and Cedar and Lily; the navy and black question from Coveteur and Edits Styling; scarf colour matching from Vela and Emma; moisture regain figures from Testex and TextilePulse.",
      },
    ],
  },
  {
    // ⚠️ THE ONLY ARTICLE THAT CARRIES A PRICE, so it is the one to check when
    // prices move. The file header's blanket "no prices" rule was written while
    // the fabric was unsettled; the founder settled the abaya at 690 on
    // 2026-09-13 and confirmed it could be published. An article titled "how
    // much does it cost" that refuses to say is useless, which is the failure
    // this journal brief exists to prevent.
    //
    // Search intent: she wants a number, and to know whether she is about to be
    // overcharged. Both in the first paragraph.
    slug: "how-much-does-an-abaya-cost-in-dubai",
    title: "How much does an abaya cost in Dubai?",
    description:
      "Ready-made, tailoring only, and full custom are three different prices for three different things. What each costs in 2026, and what actually drives the number.",
    published: "2026-09-13",
    readingMinutes: 6,
    intro:
      "Three different things get called an abaya price in Dubai, and they are not close to each other. Knowing which one you are being quoted is most of the answer.",
    hero: { src: "/marketing/story-tailoring.jpg", alt: "A tailor at work.", w: 1584, h: 672 },
    blocks: [
      {
        type: "p",
        // ⚠️ DO NOT LEAD WITH THE 100. Two wrong versions of this sentence, both
        // on 2026-09-13. The first said ready-made "start around AED 300",
        // which contradicted our own cited source and flattered our 690. The
        // correction then led with "from around AED 100", and the founder,
        // who lives here: "100 aed for abaya is shitty abaya, a good abaya is
        // never 100 aed, you need to go to ajman and drive 2h to get a cheap
        // polyester abaya."
        //
        // She is right and BOTH errors have the same shape: quoting one number
        // as the price of "an abaya" when the cheap end is a different product
        // in a different emirate. Best Dubai Things priced the SAME crepe piece
        // at 95 in Deira and 420 in Mall of the Emirates, a 340% spread on
        // location alone. So the honest answer is the band somebody actually
        // buys in, with the floor named as what it is and where it is.
        market: true,
        text: "The short answer, for 2026: a ready-made abaya you would actually want to wear starts at about AED 300, and there is no ceiling. Dubai's known boutique labels sit between AED 800 and AED 3,000, and the designer end runs past AED 5,000. Paying a tailor to cut and sew one when you bring your own cloth is about AED 200 to AED 350 for the labour, before the fabric. A full custom piece, where somebody sources the cloth and makes it to your measurements, usually starts at about AED 800.",
      },
      {
        type: "p",
        text: "Most confusion about abaya pricing comes from those three being quoted as though they were the same thing.",
      },

      { type: "h2", text: "The three prices, and what each one buys" },
      { type: "h3", text: "Ready-made, from AED 300 upward", market: true },
      {
        type: "p",
        // ⚠️ NO CEILING HERE. An earlier version capped ready-made at 600.
        // Founder, 2026-09-13: "there are abayas for 1000 aed". She is right:
        // CAS Abaya lists to 800, Bouguessa and Mauzan sit at 800 to 3,000,
        // and a capped band is also the one framing that makes our own number
        // look like the expensive option.
        market: true,
        text: "Made in a size run, hanging on a rail. The high street lands at about AED 300 to AED 800 in nida or crepe, and AED 300 to AED 600 is where most decent nida sits. The known Dubai labels, the ones people name when you ask, sit between AED 800 and AED 3,000, and a designer piece goes past AED 5,000. You are paying for cloth and construction, and above a certain point for the name. The fit is whatever the pattern was cut to, which for an abaya matters less than for most garments but still decides how it hangs from the shoulder and where the sleeve ends.",
      },
      {
        type: "p",
        // ⚠️ THE "OUR FOUNDER" ATTRIBUTION AND THE SINGLE MENTION OF AJMAN WERE
        // BOTH CUT ON 2026-09-13. Founder: "i don't like the part you talk
        // about 'our founder', please check other blogs, news things for
        // general claims", and "instead of citing ajman, you can tell about
        // other cities like sharjah as well, or other locations, this has to
        // feel like a real guide". One emirate named as the cheap one reads as
        // a dig and is less useful than a list of real places with a reason to
        // go to each. Everything below is sourced; nothing is attributed to a
        // person at this company.
        market: true,
        text: "Below about AED 200 you are usually looking at a different product: basic polyester off a market rail, priced to be bought fast and bargained over. It will read as cheap because it is, and it will not breathe in July. That end of the market is worth knowing about anyway, because the same piece changes price enormously with the address. A 2026 Dubai shop survey priced one crepe abaya at AED 95 in Deira and AED 420 in Mall of the Emirates, a spread of more than four times on location alone.",
      },
      {
        type: "ul",
        // A guide names places and gives a reason to go to each. Every entry
        // and every number here comes from a published 2026 shopping guide or
        // a retailer listing, cited at the foot of the article.
        items: [
          "Naif Souk, Deira. The cheapest rails in Dubai and the ones shoppers name for it. Reviewers report paying around AED 100 for pieces listed nearer AED 250 elsewhere, and bargaining is expected rather than rude.",
          "Sharjah Central Souq, the Blue Souq, by the Jubail bus station. Listings start around AED 50, and a good ready-to-wear piece in Sharjah generally runs AED 200 to AED 500. Go for the choice of abayas and shawls in one building.",
          "Meena Bazaar, Bur Dubai. Rails and tailors in the same few streets, which is the actual reason to go: you can buy cloth and have it cut on one trip.",
          "Karama, the Centre and the old market. Plain everyday abayas rather than occasion pieces, at everyday prices.",
          "Ajman market. Named across UAE shopping guides as a bargain destination on the same footing as Sharjah, worth the drive only if you are already out that way.",
          "Abaya Mall in Mirdif. Three floors of nothing but abayas, for comparing fifty in an afternoon instead of five.",
        ],
      },
      {
        type: "p",
        text: "If a quote surprises you in either direction, ask what the fibre is before anything else. That one question separates the AED 150 rail from the AED 600 one more reliably than anything you can see from across a shop.",
      },
      { type: "h3", text: "Tailoring only, about AED 200 to AED 350" },
      {
        type: "p",
        // The metre prices here are OUR OWN, from real 2026 quotes in
        // planning/pricing-todo.md: local 100% linen at AED 65/m, imported at
        // AED 36/m landed, local cotton at AED 20. Said as our own workshop
        // figures rather than as a market survey, because that is what they
        // are. That exception survives the 2026-09-13 feedback; the one that
        // did not is attributing a claim to a person at this company.
        text: "You buy the cloth yourself and pay a tailor to cut and sew it. The fabric shops and the tailors sit in the same districts, which is why people go there: Satwa for tailoring, Meena Bazaar in Bur Dubai for cloth and stitching in the same few streets, and the fabric shops off Naif Road in Deira. Published 2026 guides put plain nida stitching at AED 200 to AED 350, and Satwa tailoring listings start near AED 180 for cutting and sewing.",
      },
      {
        type: "p",
        text: "The number sounds low until the cloth is added. An abaya takes roughly three metres, and our own 2026 supplier quotes put a metre at about AED 20 for local cotton, AED 36 for imported linen landed here, and about AED 65 for good linen bought locally. So the honest total for this route is AED 260 to AED 550 before any embroidery, and it is only the cheapest one if you already know what fabric you want and do not mind two trips.",
      },
      { type: "h3", text: "Full custom, from about AED 800" },
      {
        type: "p",
        text: "Somebody else sources the cloth, takes your measurements and makes the piece. The floor is around AED 800 and the ceiling is wherever the embroidery stops. Hand embroidery, beading and lacework are the three things that move this number fastest, and they move it a long way.",
      },

      { type: "h2", text: "What actually drives the price" },
      {
        type: "ul",
        items: [
          "The fabric, and it is the biggest single line. Nida and crepe sit at the bottom, linen and silk blends well above.",
          "Hand work. Embroidery, beading and crystals are priced by the hour, so they scale with how much of the garment they cover.",
          "Whether it is cut to you. Measurements mean a fitting and a pattern, which is labour before any cloth is touched.",
          "How many are being made. A piece from a size run costs less than a piece made once, for the same reason anything does.",
        ],
      },
      {
        type: "p",
        text: "What does not move it much, despite how it is often sold: the colour, and the number of buttons.",
      },

      { type: "h2", text: "What to check before you pay" },
      {
        type: "ul",
        items: [
          "Ask what the fibre is, not what the fabric is called. If the answer is a name rather than a fibre, ask again.",
          "Ask whether the quote includes the cloth. This is where most of the confusion sits.",
          "Ask how many fittings are included, and whether alterations after the first cost extra.",
          "For anything with hand work, ask the price of the plain version first, then the addition. One number hides which half you are paying for.",
        ],
      },
      {
        type: "quote",
        // ⚠️ CORRECTED 2026-09-13. This read "Nida is a brand of polyester",
        // which is wrong: nida is a fabric name, usually 100% polyester and
        // sometimes a polyester and nylon mix, and "Korean nida" is a quality
        // grade rather than a brand. A quote block is the highest-authority
        // position on the page, so a loose fact there is the worst place for one.
        text: "Nida is a fabric name, not a fibre. It is almost always polyester. Ask for the fibre.",
      },

      { type: "h2", text: "Where a linen abaya sits" },
      {
        type: "p",
        text: "Linen is unusual in this market and costs more per metre than the polyester crepes most abayas are cut from. It is also the reason to choose one: it lets sweat out, which matters more for the outer layer than for anything worn underneath.",
      },
      {
        type: "link",
        slug: "what-to-wear-under-an-open-abaya",
        reason:
          "You know the price now. The next question is what goes under it, which turns out to be a colour decision more than a fabric one, and there is a table of pairings for it.",
      },
      {
        type: "p",
        // ⚠️ THE ONE PUBLISHED PRICE IN THE JOURNAL. It matches
        // catalog.ts BASE_PRICE_BY_CATEGORY.Abaya. Change one, change both.
        // Framed as "will be" because it is not purchasable yet, and a present
        // tense here would be a claim about a product that does not exist.
        // ⚠️ THIS ARTICLE EXISTS TO SELL. Not by bending a number, by putting
        // ours next to the right comparison. 690 is expensive beside a souq
        // rail and cheap beside a made-to-measure boutique piece, and
        // made-to-measure is what it IS. Founder, 2026-09-13: "our price
        // doesn't have to show as overpriced or too expensive, remember these
        // blogs are meant to bring people to buy on our website."
        // ⚠️ AND THE FRAME WAS WRONG UNTIL 2026-09-13. It read "that is
        // boutique-rail money ... made-to-measure normally starts where they
        // finish", which contradicted this article's own sourced floor of AED
        // 800 for full custom and put our number ABOVE a band it actually sits
        // below. Rule 3b is about framing a true number, not inventing a
        // flattering one, and an unsupportable flourish fails it just as badly.
        text: "Ours will be AED 690 when we open: cut to your measurements, in 100% linen, made after it is ordered. The comparison that matters is not the AED 300 rail, because that is a size run and this is not. It is the AED 800 that full custom starts at, and the AED 800 to AED 3,000 the Dubai boutique labels charge for a piece that was still cut to a chart rather than to you. AED 690 sits below both, and that is the whole claim. We hold the number by making one design properly instead of sourcing something different for every order, and in Dubai we come to you and take the measurements ourselves rather than charging for the visit.",
      },
      {
        type: "callout",
        text: "We open in early October. If you are in Dubai we come to you and take the measurements ourselves before anything is cut, at no charge. Leave your email on the home page and we will tell you the day.",
      },
      {
        type: "link",
        slug: "nobody-is-a-medium",
        reason:
          "The gap between a rail price and a made to measure price is almost entirely the fitting. This is what being measured changes, and what it honestly does not.",
      },
      {
        type: "link",
        slug: "what-to-wear-dubai-summer-fabric",
        reason:
          "The linen argument above rests on a single number, moisture regain. This puts that number against every other fabric on a Dubai rail, including the polyester most abayas are cut from.",
      },
      {
        type: "p",
        text: "Price ranges above are from 2026 UAE market guides published by Luxury and More, Khayat and NYLA, cross-checked against ready-made pricing listed by Dubai abaya retailers and Best Dubai Things\u2019 2026 shop survey for the Deira and Mall of the Emirates figures. The places and their prices come from 2026 abaya shopping guides by Noor Zara, Lamis, UAE Service Guide and Dubai-On, Tripadvisor reviews of Naif Souk, Sharjah retailer listings for the Central Souq figures, and Satwa tailoring listings for the stitching prices. Fabric costs per metre are our own 2026 supplier quotes. Fibre composition of nida is from abaya fabric suppliers including Fabric UK and The Hijab Company.",
      },
    ],
  },
  {
    slug: "what-to-wear-dubai-summer-fabric",
    // ⚠️ THE TITLE IS THE SEARCHED PHRASE PLUS WHAT THE PAGE IS. UAE
    // autocomplete returns "what to wear in dubai summer" verbatim, and the
    // variants under it are "what to wear in dubai as a woman in summer" and
    // "how to dress in dubai". The old tail, "how fabric changes how hot you
    // feel", was a nicer sentence that promised nothing; "a fabric-by-fabric
    // guide" says what the reader is about to get, which is what gets clicked.
    title: "What to wear in Dubai summer: a fabric-by-fabric guide",
    description:
      "Linen first, cotton second, nothing made of polyester. What each fabric does in 40 degree heat and 70 percent humidity, and why colour matters far less than you were told.",
    published: "2026-09-05",
    readingMinutes: 6,
    intro:
      "Everyone arriving in the UAE is told to wear loose and light colours. That advice is not wrong, but it skips the thing that matters most, which is what the fabric is made of.",
    hero: { src: "/marketing/hero-banner.jpg", alt: "Loose linen, worn in Gulf heat.", w: 1584, h: 672 },
    blocks: [
      {
        type: "p",
        // ⚠️ THE ANSWER GOES FIRST. This article buried it past two H2s for
        // eight days, which loses the featured snippet and is bad manners to
        // somebody who typed a question. The old opening paragraph, the one
        // that set up the climate before answering anything, is folded into
        // this one rather than left sitting underneath it.
        text: "The short answer: linen first, cotton second, and nothing made of polyester. Cover more skin rather than less, keep it loose enough that air moves underneath it, and stop worrying about whether it is black or white. The National Center of Meteorology puts average August highs in Dubai between 40.9 and 43.2 degrees, with overnight lows near 30 and relative humidity peaking between 63 and 80 percent, and in that combination what your clothes are made of does more for how hot you feel than the colour or the cut. Here is each fabric and what to expect from it.",
      },

      { type: "h2", text: "Humidity is the actual problem, not heat" },
      {
        type: "p",
        text: "Dry heat is survivable because sweat evaporates and evaporation cools you. Coastal humidity slows that evaporation down, which is why forty degrees in Dubai in August feels punishing while the same temperature inland feels merely hot.",
      },
      {
        type: "p",
        text: "Once you understand that, the rule for choosing clothing becomes simple. A good summer fabric is one that helps sweat leave your skin. A bad one is one that keeps it there.",
      },

      { type: "h2", text: "The fabrics, ranked for this climate" },
      { type: "h3", text: "Linen" },
      {
        type: "p",
        text: "The best answer for Gulf heat, and it is not close. Linen holds about 12% of its own weight in water before it feels wet, against 8.5% for cotton, and it gives that water up to the air faster. The weave is open. The fibre is stiff enough that the cloth stands slightly away from skin instead of clinging, so air moves underneath it. It creases immediately and it will not stop, and that is the trade for the other three.",
      },
      { type: "h3", text: "Cotton" },
      {
        type: "p",
        text: "Breathable, soft, and much less prone to creasing than linen. It absorbs sweat well but holds onto it longer, so a cotton shirt on a very humid day can stay damp where linen would have dried. Excellent for most of the year, slightly outclassed in August.",
      },
      { type: "h3", text: "Linen and cotton woven together" },
      {
        type: "p",
        // ⚠️ THIS PARAGRAPH USED TO CALL THE BLEND "often the more practical of
        // the three". It was unsourced, and it talked the reader out of the only
        // cloth we sell, in the article whose job is to explain why that cloth
        // is the right one. Rule 3b: notice what a draft argues for. The fix is
        // not to rubbish the blend, it is to say what the trade actually is and
        // what we chose.
        text: "A long established cloth that trades some of linen's breathability for less creasing and a softer hand. How much of each depends entirely on the ratio, so read the composition on the label rather than the word blend. We cut 100% linen instead, because the reason to wear this cloth in August is that 12% figure, and cotton sits at 8.5% and polyester at under half a percent. Every point of either in a blend moves the number the wrong way.",
      },
      { type: "h3", text: "Polyester, nylon, acrylic" },
      {
        type: "p",
        text: "Avoid in summer unless the garment was specifically engineered for sport. Polyester holds 0.2 to 0.4% of its weight in water, roughly thirty times less than linen, so sweat sits on your skin instead of moving into the cloth. A polyester dress in August humidity is uncomfortable in a way that has nothing to do with how it looks. This is also the fibre most abayas are cut from, since nida and most abaya crepes are polyester.",
      },
      { type: "h3", text: "Rayon and viscose" },
      {
        type: "p",
        text: "Made from processed wood pulp, so more breathable than polyester and often lovely to wear. They lose strength when wet and can hold sweat marks. A reasonable middle option.",
      },

      {
        // ⚠️ BOTH HALVES OF A PAIR MUST BE THE SAME COLOURWAY unless the caption
        // says otherwise. This block ran with IVORY trousers beside a WHITE
        // shirt for eight days, against a caption that talks only about cut, so
        // the two read as one outfit and the mismatch read as carelessness. The
        // founder caught it on 2026-09-13.
        //
        // ⚠️ AND HERE IS THE TRAP THAT CAUSED IT: the IVORY base photos are the
        // only ones in the catalogue with NO COLOUR WORD in the filename.
        // Ivory is `oversized-shirt-front.jpg`; white, navy and burgundy all
        // carry their name. So the file that LOOKS unlabelled is ivory, and
        // `-white-` is a different garment. Check colorImages in catalog.ts
        // before pasting any path in here, never the filename.
        type: "pair",
        a: { src: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-front-v2.jpg", alt: "Wide-leg linen pants in ivory." },
        b: { src: "/catalog/oversized-shirt/oversized-shirt-front.jpg", alt: "A loose linen shirt in ivory." },
        caption: "Both in ivory linen. Room through the leg and across the back is not a style preference in this climate. It is how air gets underneath the cloth.",
      },
      { type: "h2", text: "Cut matters, and here is the part usually left out" },
      {
        type: "p",
        text: "Loose is better than tight, because air moving between cloth and skin is what carries heat away. But loose is not the same as oversized. A garment that is simply too big bunches, sits badly and traps air in the wrong places without ever creating airflow.",
      },
      {
        type: "p",
        text: "What actually works is a garment cut with deliberate room in the places where air should move, across the back, through the sleeve, down the leg, while still fitting at the shoulder and the waist. That is a fit question, and it is difficult to get from a garment made to a standard size chart for an average body.",
      },
      {
        type: "callout",
        text: "Sleeves are worth more thought than they get. A covered arm in loose linen is frequently cooler than a bare one in direct sun, because the cloth shades the skin while air still moves underneath it. That is the same effect measured in the Negev robe study below, and it is why loose covering clothing is traditional across every hot region of the world rather than in spite of the heat.",
      },

      {
        type: "quote",
        // Was a restatement of the sentence three blocks below it. Replaced
        // with the finding that sentence rests on, which is the line actually
        // worth stopping on.
        text: "In the Negev, the man in the black robe was no hotter than the man in the white one. The robes were loose.",
      },
      { type: "h2", text: "Colour, which matters less than you have been told" },
      {
        type: "p",
        text: "White reflects more radiant heat than black, so in direct sun a white garment absorbs less. That much is true. The part nobody mentions is that it has been measured in a desert, and the answer was not what the advice implies.",
      },
      {
        type: "p",
        // The single best citation available for this article, and it was
        // missing. Shkolnik, Taylor, Finch and Borut, "Why do Bedouins wear
        // black robes in hot deserts?", Nature 283, 373-375 (1980). It supports
        // BOTH the colour section and the sleeve callout above it.
        text: "In 1980 four researchers published the experiment in Nature. A volunteer stood in the Negev at 35 to 46 degrees in a black Bedouin robe, a white Bedouin robe, a tan army uniform and shorts. The black robe absorbed two and a half times the solar radiation of the white one, and the man wearing black was no hotter. The robes are loose, so air moving between cloth and skin carried the extra heat away before it arrived. Cut and fibre did the work. Colour did almost none of it.",
      },
      {
        type: "p",
        text: "So a black linen shirt will be more comfortable than a white polyester one on almost any August afternoon, and a loose black abaya is not the mistake it is often assumed to be. What matters is whether it is loose and what it is made of.",
      },

      { type: "h2", text: "A practical summer wardrobe for the UAE" },
      {
        type: "ul",
        items: [
          "Loose linen shirts with room across the back and through the sleeve. Covering the arm is not the compromise it sounds like.",
          "Wide or straight leg pants rather than anything close fitting through the thigh.",
          "Something with sleeves kept for indoors. Air conditioning in Dubai offices and malls is genuinely cold, and the temperature swing across a single day is the real challenge of dressing here.",
          "Accept the creasing. Every fabric that performs in this heat creases, and any finish that stops it is doing so chemically.",
        ],
      },

      { type: "h2", text: "Why we make clothes this way" },
      {
        type: "p",
        text: "Shaklek is made to order in the UAE. Nothing is cut before it is ordered, which means the cut can be chosen rather than accepted: the leg width, the length, the sleeve. For a climate where airflow through a garment is the difference between comfortable and not, being able to choose how much room a piece has is worth more than it would be anywhere else. If you are in Dubai we come to you and take the measurements ourselves, once, at no charge, and they are kept for anything you order afterwards.",
      },
      {
        type: "link",
        slug: "what-to-wear-under-an-open-abaya",
        reason:
          "If your outer layer is an abaya, this argument matters more rather than less, because that is the layer standing in the sun. Colour pairings for it, and the four mistakes people make underneath one.",
      },
      {
        type: "link",
        slug: "how-much-does-an-abaya-cost-in-dubai",
        reason:
          "Nida and most abaya crepes are the polyester this article tells you to avoid. If you want a linen one instead, here is what the market charges and where each price band is actually bought.",
      },
      {
        type: "link",
        slug: "nobody-is-a-medium",
        reason:
          "Airflow needs room in specific places, across the back, through the sleeve, down the leg, while the shoulder still fits. That is a fit problem, and a standard size chart is worst at exactly that one.",
      },
      {
        type: "p",
        text: "Sources: the black and white robe experiment is Shkolnik, Taylor, Finch and Borut, “Why do Bedouins wear black robes in hot deserts?”, Nature volume 283, 1980. August temperature and humidity figures are from the UAE National Center of Meteorology as reported by Gulf News. Moisture regain figures for linen, cotton and polyester are from Testex and TextilePulse fibre property data.",
      },
    ],
  },

  {
    slug: "nobody-is-a-medium",
    // ⚠️ THIS TITLE IS THE FOUNDER'S OWN DECISION, 2026-09-13. DO NOT "FIX" IT.
    // A journal review proposed replacing it with "Why are clothing sizes so
    // inconsistent?", which is a real UAE autocomplete phrase where "nobody is
    // a medium" returns nothing. She read the argument and kept her title.
    //
    // So the search half has to be carried by the DESCRIPTION and the FIRST
    // PARAGRAPH instead, and both below are written to do exactly that: they
    // carry "made to measure", "size chart" and the brand-to-brand
    // inconsistency phrasing, which is what the query actually contains.
    // Google matches the body, not only the H1. Change either of those two and
    // this article stops being findable by the people it is for.
    //
    // ⚠️ THE SLUG STAYS `nobody-is-a-medium` and needs no redirect. It was only
    // ever going to move if the title moved.
    title: "Nobody is a medium: what made-to-measure actually changes",
    description:
      "Why clothing sizes are so inconsistent between brands, and what made to measure actually changes when a garment is cut to you instead. Plus what it does not.",
    published: "2026-09-05",
    readingMinutes: 5,
    intro:
      "A medium is not a body. It is a statistical average of thousands of bodies, and the average of a large group of people resembles almost none of them.",
    hero: { src: "/marketing/story-tailoring.jpg", alt: "A tailor at work.", w: 1584, h: 672 },
    blocks: [
      {
        type: "p",
        // ⚠️ THE ANSWER, AND THE SEARCHED PHRASING, IN PARAGRAPH ONE. The title
        // is the founder's and it is not a query anybody types, so this
        // paragraph carries the query instead: inconsistent sizes between
        // brands, the size chart, and made to measure, all in the first six
        // sentences. Do not move it down the page.
        text: "If you are a medium in one shop and a large in the next, that is not you. Nobody has to follow a size chart. The United States published a voluntary sizing standard in 1958, Commercial Standard 215-58, and withdrew even that in 1983, and there has been no mandatory clothing size standard since. Every brand now drafts its own chart on its own fit model, which is why a 10 in one shop is a 16 in another and neither of them is wrong. The deeper problem is that no chart could work anyway, because a size is an average of several measurements at once and almost nobody is average on several measurements at once. Made to measure is the alternative, and this is what it actually changes.",
      },
      {
        type: "p",
        text: "Ready to wear clothing is built on a size chart, and a size chart is a compromise made before anyone knew who would wear the garment. It has to be. A factory cutting five thousand shirts cannot know whose shoulders they will sit on.",
      },
      {
        type: "p",
        text: "The compromise works reasonably well for people near the middle of the distribution on every measurement at once, and it works badly for everyone else. Which, once you look at more than one measurement, is most people.",
      },

      { type: "h2", text: "Why the average fits almost nobody" },
      {
        type: "p",
        // ⚠️ NAME THE STUDY. This said "thousands of pilots" and "the 1950s",
        // which is a summary of a citation rather than a citation. Lt Gilbert S.
        // Daniels, "The 'Average Man'?", USAF Wright Air Development Center
        // technical note, 1952. The number is 4,063 and it is the whole point.
        text: "There is a well known finding from aviation. In 1952 a US Air Force researcher called Gilbert Daniels measured 4,063 pilots on ten dimensions and checked how many fell within the middle range on all ten at once. The answer was none. Not a small number. Zero. The Air Force's response was to ban the average outright and require adjustable cockpits instead.",
      },
      {
        type: "p",
        text: "Clothing has exactly the same problem. You may be a medium across the shoulders and a large through the hip. Your arms may be longer than the chart expects for your chest. Your waist to hip ratio is yours and not the chart's. Each individual measurement can be close to average while the combination is not, and a garment cut to the combination is what actually fits.",
      },

      {
        type: "quote",
        text: "Four thousand and sixty-three pilots, measured on ten dimensions. The number who were average on all ten at once was zero.",
      },
      { type: "h2", text: "What actually changes" },
      { type: "h3", text: "The shoulder, which is the one that cannot be fixed later" },
      {
        type: "p",
        text: "A tailor can take in a waist, shorten a sleeve, adjust a hem. Almost nothing can be done about a shoulder seam sitting in the wrong place, because the whole garment hangs from it. If the shoulder is wrong the piece will never look right no matter what else is altered, which is why a garment cut to your shoulder is a different object from one that was altered to approximately fit it.",
      },
      { type: "h3", text: "Sleeve length, separately from everything else" },
      {
        type: "p",
        text: "On a size chart, sleeve length is tied to chest size. On a person it is not. Tailors list sleeve length and taking in the back as the two alterations most often asked for on a shirt, and hemming as the most requested alteration of any kind. Neither is an alteration when the garment is cut individually in the first place. It is just the pattern.",
      },
      { type: "h3", text: "Length, for your actual height" },
      {
        type: "p",
        text: "Pant length in particular is set for a height the chart assumed. Getting it right is the difference between a pant that looks intentional and one that looks borrowed.",
      },

      {
        // ⚠️ ONLY ONE THING MAY CHANGE BETWEEN THE TWO COLUMNS, because the
        // caption claims only one thing changed. This block previously paired
        // the base ivory shirt on the left with the SHORT-SLEEVE ivory shirt on
        // the right, so the sleeve moved as well as the trouser while the
        // caption said "the same trouser, two cuts". Same defect the founder
        // caught in the pair block of the summer article on 2026-09-13.
        // Same shirt both sides now; the trouser is the only variable.
        //
        // ⚠️ IVORY BASE PHOTOS CARRY NO COLOUR WORD: ivory is
        // `oversized-shirt-front.jpg`, white is `-white-front.jpg`. Read
        // colorImages in catalog.ts, not the filename.
        type: "looks",
        a: {
          bottom: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-full-front.jpg",
          label: "Wide leg, full length",
        },
        b: {
          bottom: "/catalog/banded-trousers/banded-trousers-navy-combo-straight-cropped-front.jpg",
          label: "Straight leg, cropped",
        },
        caption: "The same navy pant, two cuts of it. You choose which one gets made, and nothing is cut until you do.",
      },
      {
        type: "p",
        // ⚠️ SOURCED, and it has to be. This is a "X flatters Y" claim, which is
        // exactly the kind rule 2 refuses without a citation, and it sits under
        // two photographs, which reads as proof. Rise, hem placement at the calf
        // versus the ankle, and the unbroken colour line are all documented in
        // the styling guides listed at the foot of this article. The founder
        // asked for this paragraph on 2026-09-13; she did not ask for invented
        // rules to fill it.
        text: "Same measurements, same cloth, two cuts. They do not look the same on a body, and two things decide that.",
      },
      {
        type: "p",
        text: "The first is where the waistband sits. The higher it sits, the more of your leg is below it, and the longer your legs look. That is the single biggest change you can make to a pant.",
      },
      {
        type: "p",
        text: "The second is where it stops. Your calf is the widest part of your lower leg and your ankle is the narrowest. A hem that ends at the calf cuts you off at the widest point and your legs look shorter. A hem just above the ankle does not.",
      },
      {
        type: "p",
        text: "That is the difference between the two above. The full-length one runs in one line from the waist to the floor, so nothing interrupts it. The cropped one stops on purpose and puts the attention on your ankle. Neither is better. They are two different garments, and off a rail you get whichever one the size run happened to be cut to.",
      },
      { type: "h2", text: "What it does not change, and this matters" },
      {
        type: "p",
        text: "Made to measure is not magic, and brands that imply otherwise are overselling it.",
      },
      {
        type: "ul",
        items: [
          "It cannot fix a design you do not like. If the cut is wrong for you, measurements will not rescue it.",
          "It is slower. Something made after you order it takes time to make, and anyone promising made to measure at the speed of a warehouse is not doing one of the two things.",
          "It depends on the measurements being right. This is the real failure point, and it is why any serious made to order brand should tell you how to measure properly and stand behind it if the fit is wrong.",
          "It is not the same as bespoke tailoring, where a pattern is drafted from scratch for you over multiple fittings. Made to measure adjusts an existing pattern to your numbers. It is a large improvement on standard sizing rather than a replacement for a Savile Row cutter.",
        ],
      },

      { type: "h2", text: "Why it is possible now when it was not before" },
      {
        type: "p",
        text: "Made to order used to mean a shop, an appointment and several fittings, and it was priced accordingly. Two things changed. Measurements can now be taken once and kept, so the second piece needs no appointment at all. And a garment can be shown accurately on a screen before it exists, so choosing a cut no longer requires imagining it.",
      },
      {
        type: "p",
        text: "That combination is what makes it possible to sell a garment that was never made in advance. Nothing is cut until somebody orders it, which also means nothing is produced that nobody wanted.",
      },

      { type: "h2", text: "What it means for buying less" },
      {
        type: "p",
        text: "The garment that gets worn is the one that was worth making. A piece that fits badly is worn twice and then avoided, which makes it expensive per wearing however cheap it was to buy. Fit is not a luxury feature. It is the thing that decides whether a garment is used or wasted.",
      },
      {
        type: "p",
        text: "Shaklek is made to order in the UAE. You choose the cut, the length and the colour, you see the piece as you choose it, and a tailor makes that one. Nothing sits in a warehouse waiting for a body it might fit. If you are in Dubai we come to you and take the measurements ourselves, once, at no charge, and they are kept, so the second piece needs no appointment at all.",
      },
      {
        type: "link",
        slug: "what-to-wear-dubai-summer-fabric",
        reason:
          "In this climate, fit and fabric are the same question: room in the right places only helps if the cloth will let sweat out. Which fibres do, with the numbers.",
      },
      {
        type: "link",
        slug: "what-to-wear-under-an-open-abaya",
        reason:
          "The place a standard size fails most visibly is pant length, and under an open abaya a pant that reaches the floor is the commonest mistake there is.",
      },
      {
        type: "link",
        slug: "how-much-does-an-abaya-cost-in-dubai",
        reason:
          "What you pay for is largely whether the garment was cut to you. This puts real numbers on that gap in one market, abayas in Dubai, from the souq rail up to made to measure.",
      },
      {
        type: "p",
        text: "Sources: the pilot measurements are Lt Gilbert S. Daniels, “The ‘Average Man’?”, US Air Force Wright Air Development Center, 1952. The sizing standard history, Commercial Standard 215-58 and its withdrawal in 1983, is from Seamwork and The Good Trade. The most requested alterations are from published alteration guides including Oscar Jacobson and Next Level Wardrobe. Pant rise, hem placement at the calf versus the ankle, and the unbroken colour line are from 2026 styling guides by Who What Wear, An Indigo Day, Soya Concept and Luna Fashion House.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Newest first, which is the order the index renders. */
export const articlesByDate = [...articles].sort((a, b) =>
  b.published.localeCompare(a.published),
);
