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
 * ⚠️ NO PRICES either. They are one founder decision away from moving, and a
 * stale price in an indexed article outlives the decision that changed it.
 *
 * ⚠️ NO EM DASHES. Founder's standing correction, enforced in
 * scripts/social/kinda-chic.mjs for social copy and applied to all
 * customer-facing writing.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
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
  | { type: "looks"; a: { top: string; bottom: string; label: string };
      b: { top: string; bottom: string; label: string }; caption?: string };

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
    // ⚠️ THE TITLE IS THE SEARCHED PHRASE, not a nicer sentence. UAE
    // autocomplete returns "what to wear under abaya in summer" and "what to
    // wear under an open abaya"; it does not return "Gulf heat", which is what
    // this said first. The climate detail belongs in the body, where it is
    // useful, not in the title, where it costs the match.
    title: "What to wear under an open abaya in summer",
    description:
      "An open abaya shows a narrow strip of whatever is underneath, all day. A practical guide to choosing it for summer, from a workshop cutting clothes in the UAE.",
    published: "2026-09-13",
    readingMinutes: 5,
    intro:
      "An abaya is the layer everyone else sees. What is underneath is the layer you feel for fourteen hours, and through a Gulf summer that is the one that decides whether the day is comfortable.",
    hero: { src: "/marketing/hero-banner.jpg", alt: "Loose linen, worn in Gulf heat.", w: 1584, h: 672 },
    blocks: [
      // ⚠️ THE ANSWER GOES FIRST, before any context. That is what wins a
      // featured snippet, and it is also just better manners for somebody who
      // typed a question.
      {
        type: "p",
        text: "The short answer: a plant fibre, cut loose, in a colour that sits quietly against the abaya. Trousers with a shirt, or a simple dress. Whatever you choose is going to spend the day pressed between you and a second layer, so breathability matters more here than it does for anything worn alone.",
      },

      { type: "h2", text: "Why the layer underneath matters more than the abaya" },
      {
        type: "p",
        text: "An abaya moves. It hangs away from the body, catches air at the hem and the sleeve, and is open at the front for most of the day. The garment beneath it does none of that. It sits against skin, under a second layer, in forty degrees.",
      },
      {
        type: "p",
        text: "That is why the usual advice about abayas, which is almost entirely about the abaya, misses the part that actually governs comfort. If the piece underneath is polyester, no amount of good tailoring on the outer layer will fix the afternoon.",
      },
      {
        type: "quote",
        text: "The outer layer is what people see. The inner layer is what you feel.",
      },

      { type: "h2", text: "Trousers and a shirt, or a dress" },
      {
        type: "p",
        text: "Both work, and the choice is mostly about how you want the day to go rather than about rules.",
      },
      { type: "h3", text: "Trousers and a shirt" },
      {
        type: "p",
        text: "The more practical of the two, and the more flexible. It survives the abaya coming off indoors, which a dress cut purely as an underlayer often does not. Straight or wide trousers sit better under a long outer layer than anything narrow, because narrow trousers fight the abaya at every step and pull it out of line.",
      },
      {
        type: "p",
        text: "A shirt with a little room through the body is worth more than it sounds. Two fitted layers trap air between them with nowhere to go.",
      },
      {
        type: "pair",
        a: {
          src: "/catalog/structured-blouse/structured-blouse-ivory-combo-long-normal-front.jpg",
          alt: "A loose ivory linen shirt.",
        },
        b: {
          src: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-combo-normal-full-front.jpg",
          alt: "Wide-leg linen trousers in ivory.",
        },
        caption: "Loose through the body and straight through the leg, so neither layer fights the other.",
      },
      { type: "h3", text: "A dress" },
      {
        type: "p",
        text: "Simpler to put on and cooler in the sense that there is one waistband fewer. The thing to watch is length: a dress that ends near the abaya hem creates a visible double edge at the ankle. Either noticeably shorter or clearly longer reads better than almost the same.",
      },

      { type: "h2", text: "What the open front actually shows" },
      {
        type: "p",
        text: "An open abaya frames a vertical strip roughly a hand wide, from collar to ankle. That narrow window is the whole of what anybody sees of the layer beneath, and it changes what is worth paying attention to.",
      },
      {
        type: "ul",
        items: [
          "The collar and the first few centimetres of the shirt, because that is at eye height.",
          "The line down the centre. A shirt with a straight front placket reads as a clean vertical; a busy one breaks it.",
          "The hem of the trousers, which is the only other place the inner layer is visible.",
          "The colour relationship. Close tones read as deliberate. A hard contrast turns the opening into a stripe.",
        ],
      },
      {
        type: "p",
        text: "Almost nothing else shows. Detail on a sleeve or across the back is spent on a layer nobody will see while the abaya is on, which is worth knowing before paying for it.",
      },

      { type: "h2", text: "The fabric question, briefly" },
      {
        type: "p",
        text: "Linen first, for the reason it always wins here: the fibre takes moisture off skin and gives it up to the air quickly, and the cloth is stiff enough to stand slightly away from the body instead of clinging. Under a second layer, standing away is the property that matters.",
      },
      {
        type: "p",
        text: "Cotton next, and perfectly good for most of the year, though it stays damp longer on a humid August afternoon. Polyester last, and genuinely uncomfortable in this specific situation, because sweat has nowhere to go and now there are two layers holding it there.",
      },
      {
        type: "image",
        src: "/marketing/pre-launch/flax-stalks.jpg",
        alt: "A tied bundle of dried flax stalks, the plant linen is spun from.",
        caption: "Flax, before it becomes linen.",
        w: 637,
        h: 800,
      },

      { type: "h2", text: "Length, and why it is the thing most often wrong" },
      {
        type: "p",
        text: "Trousers under an abaya want to clear the floor by a centimetre or two, not brush it. The abaya is already doing the job of covering the ankle, so trousers that also reach the ground give you two hems collecting the same dust, and the inner one always loses.",
      },
      {
        type: "p",
        text: "This is the single most common thing people get wrong, and it is also the hardest to fix off a rail, because trouser length off a rail is cut for an average height rather than yours.",
      },

      { type: "h2", text: "In short" },
      {
        type: "ul",
        items: [
          "Choose the inner layer for breathability first. It is under two layers and it is the one you feel.",
          "Trousers and a shirt are more flexible than a dress, and survive the abaya coming off.",
          "Keep both layers loose. Two fitted layers trap air with nowhere to go.",
          "Only a hand-wide strip shows, so spend attention on the collar, the centre line and the hem.",
          "Get the trouser length right. It is the detail that most often looks wrong and is easiest to fix when something is cut for you.",
        ],
      },
      {
        type: "callout",
        text: "We cut shirts and trousers in 100% linen in the UAE, made after they are ordered rather than before. If you are in Dubai we come to you and take the measurements ourselves, so the length under an abaya is right the first time.",
      },
    ],
  },
  {
    slug: "natural-fabrics-better-for-your-body",
    title: "Why clothes made from natural fabrics are better for your body",
    description:
      "How plant fibres like linen and cotton handle heat, moisture and skin contact differently from polyester, and what that means for what you wear every day.",
    published: "2026-09-05",
    readingMinutes: 6,
    intro:
      "Most clothing sold today is made from plastic. Not loosely, not as a figure of speech: polyester, nylon and acrylic are petroleum products spun into thread. Here is what that actually changes about wearing them.",
    hero: { src: "/marketing/story-materials-v2.jpg", alt: "Linen cloth, close.", w: 1584, h: 672 },
    blocks: [
      {
        type: "p",
        text: "Around two thirds of the world's clothing is now made from synthetic fibre. It is cheap, it is strong, and it holds a printed colour well. Those are real advantages, and they are why it took over. But the properties that make polyester good to manufacture are not the properties that make a garment good to wear against skin for fourteen hours in a hot country.",
      },
      {
        type: "p",
        text: "Plant fibres behave differently, and the difference is structural rather than a matter of opinion.",
      },

      { type: "h2", text: "The difference is what the fibre does with water" },
      {
        type: "p",
        text: "This is the whole thing, and almost everything else follows from it. Your body cools itself by evaporating sweat off your skin. A fabric either helps that happen or gets in its way.",
      },
      {
        type: "h3",
        text: "Plant fibres absorb moisture. Synthetics repel it.",
      },
      {
        type: "p",
        text: "Linen and cotton are hydrophilic, which means the fibre itself takes water into its structure. Linen can hold a significant share of its own weight in moisture before it even begins to feel damp, then releases it into the air. Sweat moves off your skin, into the cloth, and away.",
      },
      {
        type: "p",
        text: "Polyester is hydrophobic. The fibre will not absorb water, so moisture has nowhere to go except to sit on your skin or bead on the inside surface of the garment. Performance synthetics work around this with engineered weaves that wick liquid along the surface, and the good ones genuinely work. A cheap polyester blouse does not have that engineering. It just holds the damp against you.",
      },
      {
        type: "h3",
        text: "Which is why one feels cooler than the other at the same temperature",
      },
      {
        type: "p",
        text: "Two garments in the same room, on the same person, at the same air temperature, do not feel the same. Linen has a loose, irregular weave and stiff fibres that hold the cloth slightly off the skin rather than clinging to it, so air moves through and underneath. That moving air is what carries evaporating sweat away. Cotton sits closer but still breathes. A tight synthetic weave traps a still, warm, humid layer against you, and still humid air is the one condition in which sweating stops working.",
      },

      {
        type: "image",
        src: "/marketing/story-hero.jpg",
        alt: "Linen, close.",
        caption: "Linen holds itself slightly off the skin. That gap is where the air moves.",
        w: 1584, h: 672,
      },
      { type: "h2", text: "What sits against your skin all day" },
      {
        type: "p",
        text: "Skin is not a sealed barrier. It is in contact with fabric for most of your life, and for anyone with eczema, sensitive skin or a tendency to heat rash, what that fabric is made of and what was done to it during manufacture both matter.",
      },
      {
        type: "ul",
        items: [
          "Friction and heat. A fabric that holds moisture against skin in a warm climate creates exactly the conditions that irritate it. Heat rash is a blocked sweat duct, and a fabric that stops sweat evaporating makes that more likely, not less.",
          "Finishing chemicals. Wrinkle-resistant, stain-resistant and permanent-press finishes are applied to fabric after weaving, and some are formaldehyde based. These are applied to natural fibres too, so untreated matters as much as natural does.",
          "Dyes. Certain azo dyes are restricted in the EU and elsewhere because of what they break down into. This is a question about the dyeing, not about the fibre, and it is worth asking a brand regardless of what its cloth is made of.",
        ],
      },
      {
        type: "callout",
        text: "Natural does not automatically mean untreated. A heavily finished cotton shirt can carry more chemistry than a plain synthetic one. The useful question is not only what the fibre is, but what was done to it afterwards.",
      },

      { type: "h2", text: "The microplastic question, stated honestly" },
      {
        type: "p",
        text: "Synthetic garments shed microscopic plastic fibres when they are washed and, in smaller quantities, when they are simply worn. Those fibres pass through wastewater treatment and into rivers and oceans, and a meaningful share of ocean microplastic is now attributed to textiles.",
      },
      {
        type: "p",
        text: "What that does to human health is still being studied and it would be dishonest to claim otherwise. What is not in question is where the fibres end up. Plant fibres shed too, but what they shed is cellulose, which breaks down.",
      },

      {
        type: "quote",
        text: "Synthetics win on durability, cost and holding their shape. Plant fibres win on everything to do with wearing the garment in heat.",
      },
      { type: "h2", text: "Where natural fibres are genuinely worse" },
      {
        type: "p",
        text: "A page that only listed advantages would not be worth reading. Plant fibres lose on several counts:",
      },
      {
        type: "ul",
        items: [
          "Linen creases, and it will crease within an hour of putting it on. This is a property of the fibre, not a fault in the cloth, and no finish removes it without adding chemistry.",
          "Cotton is thirsty to grow. Conventional cotton uses a great deal of water and pesticide. Linen, made from flax, needs considerably less of both, which is why it tends to be the better environmental answer of the two.",
          "Natural fibres shrink, particularly on a first wash if the cloth was never pre-shrunk. Synthetics hold their dimensions almost perfectly.",
          "They wear faster at stress points. Polyester is genuinely stronger.",
        ],
      },
      {
        type: "p",
        text: "The honest summary is that synthetics win on durability, cost and dimensional stability, and plant fibres win on everything to do with wearing the garment in heat.",
      },

      { type: "h2", text: "How to tell what you are actually buying" },
      {
        type: "p",
        text: "The composition label is a legal requirement in most markets, including the UAE, and it is the only part of a garment that has to tell the truth. The front of the shop can say breathable and natural without either word meaning anything specific.",
      },
      {
        type: "ul",
        items: [
          "Read the composition label, not the marketing. Percentages are what count.",
          "Watch for a small synthetic percentage. A cloth described as linen can be mostly something else, and even a modest share of elastane or polyester changes how the garment breathes.",
          "Blends are not automatically a compromise. Linen and cotton woven together is a long established cloth that keeps the breathability of both and creases less than pure linen. A plant fibre blended with another plant fibre is a different proposition from a plant fibre blended with plastic.",
          "Ask what the finish is. Wrinkle-free on a natural fabric usually means something was added.",
        ],
      },

      { type: "h2", text: "Why this matters more in the Gulf" },
      {
        type: "p",
        text: "In a temperate climate the difference between fabrics is a matter of comfort. In a Dubai August, when it is forty two degrees outside and the humidity is high, it stops being subtle. Air conditioning solves the problem indoors and does nothing for the walk between the car and the door.",
      },
      {
        type: "p",
        text: "This is the reason linen has been worn in hot countries for thousands of years and is still worn in them now. It is not nostalgia. It is that the fibre does something useful with heat and sweat that a plastic thread cannot do.",
      },
      {
        type: "p",
        text: "Shaklek makes clothes to order in the UAE, cut by a tailor after you order rather than made in advance, and we make them from plant based fabric for the reasons above. If you want to see how that works, our catalogue lets you change the cut and see the piece before anything is made.",
      },
    ],
  },

  {
    slug: "what-to-wear-dubai-summer-fabric",
    title: "What to wear in Dubai summer: how fabric changes how hot you feel",
    description:
      "Colour and cut matter less than what the cloth is made of. A practical guide to staying comfortable through a UAE summer, from someone making clothes here.",
    published: "2026-09-05",
    readingMinutes: 5,
    intro:
      "Everyone arriving in the UAE is told to wear loose and light colours. That advice is not wrong, but it skips the thing that matters most, which is what the fabric is made of.",
    hero: { src: "/marketing/hero-banner.jpg", alt: "Loose linen, worn in Gulf heat.", w: 1584, h: 672 },
    blocks: [
      {
        type: "p",
        text: "A Dubai summer runs from roughly May to September, sits above forty degrees for weeks at a time, and carries humidity along the coast that makes it feel considerably worse than the number suggests. Most wardrobe advice for it is about colour and looseness. Both help. Neither helps as much as the fibre.",
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
        text: "The best answer for Gulf heat, and it is not close. The fibre absorbs moisture readily and gives it up to the air quickly. The weave is open. The fibre is stiff enough that the cloth stands slightly away from skin instead of clinging, so air moves underneath it. It creases immediately and permanently, and in this part of the world that has long been read as a sign of the real thing rather than a flaw.",
      },
      { type: "h3", text: "Cotton" },
      {
        type: "p",
        text: "Breathable, soft, and much less prone to creasing than linen. It absorbs sweat well but holds onto it longer, so a cotton shirt on a very humid day can stay damp where linen would have dried. Excellent for most of the year, slightly outclassed in August.",
      },
      { type: "h3", text: "Linen and cotton woven together" },
      {
        type: "p",
        text: "A long established cloth that gets most of linen's breathability with noticeably less creasing and a softer hand. For daily wear in this climate it is often the more practical of the three, which is why it has been made for centuries rather than invented as a compromise.",
      },
      { type: "h3", text: "Polyester, nylon, acrylic" },
      {
        type: "p",
        text: "Avoid in summer unless the garment was specifically engineered for sport. The fibre will not absorb moisture, so sweat sits on your skin. A polyester dress in August humidity is genuinely uncomfortable in a way that has nothing to do with how it looks.",
      },
      { type: "h3", text: "Rayon and viscose" },
      {
        type: "p",
        text: "Made from processed wood pulp, so more breathable than polyester and often lovely to wear. They lose strength when wet and can hold sweat marks. A reasonable middle option.",
      },

      {
        type: "pair",
        a: { src: "/catalog/wide-leg-trousers/wide-leg-trousers-ivory-front-v2.jpg", alt: "Wide-leg trousers in linen." },
        b: { src: "/catalog/oversized-shirt/oversized-shirt-white-front.jpg", alt: "A loose white linen shirt." },
        caption: "Room through the leg and across the back is not a style preference in this climate. It is how air gets underneath the cloth.",
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
        text: "Sleeves are worth more thought than they get. A long sleeve in loose linen is frequently cooler than a bare arm in direct sun, because it shades the skin while still letting air through. This is why long, loose clothing is traditional across every hot region of the world.",
      },

      {
        type: "quote",
        text: "A black linen shirt will be more comfortable than a white polyester one on almost any August afternoon.",
      },
      { type: "h2", text: "Colour, which matters less than you have been told" },
      {
        type: "p",
        text: "White reflects more radiant heat than black, so in direct sun a white garment absorbs less. That much is true. But once you are in shade or indoors the effect is small, and it is entirely outweighed by whether the fabric breathes. A black linen shirt will be more comfortable than a white polyester one on almost any August afternoon.",
      },

      { type: "h2", text: "A practical summer wardrobe for the UAE" },
      {
        type: "ul",
        items: [
          "Loose plant fibre shirts with room across the back and through the sleeve. Long sleeves are not the compromise they sound like.",
          "Wide or straight leg trousers rather than anything close fitting through the thigh.",
          "Something with sleeves kept for indoors. Air conditioning in Dubai offices and malls is genuinely cold, and the temperature swing across a single day is the real challenge of dressing here.",
          "Accept the creasing. Every fabric that performs in this heat creases, and any finish that stops it is doing so chemically.",
        ],
      },

      { type: "h2", text: "Why we make clothes this way" },
      {
        type: "p",
        text: "Shaklek is made to order in the UAE. Nothing is cut before it is ordered, which means the cut can be chosen rather than accepted: the leg width, the length, the sleeve. For a climate where airflow through a garment is the difference between comfortable and not, being able to choose how much room a piece has is worth more than it would be anywhere else.",
      },
    ],
  },

  {
    slug: "nobody-is-a-medium",
    title: "Nobody is a medium: what made-to-measure actually changes",
    description:
      "Standard sizes are an average of bodies that do not exist. What changes when a garment is cut to your measurements instead, and what it honestly does not.",
    published: "2026-09-05",
    readingMinutes: 5,
    intro:
      "A medium is not a body. It is a statistical average of thousands of bodies, and the average of a large group of people resembles almost none of them.",
    hero: { src: "/marketing/story-tailoring.jpg", alt: "A tailor at work.", w: 1584, h: 672 },
    blocks: [
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
        text: "There is a well known finding from aviation. In the 1950s the United States Air Force measured thousands of pilots on ten dimensions and checked how many fell within the middle range on all ten at once. The answer was none. Not a small number. Zero.",
      },
      {
        type: "p",
        text: "Clothing has exactly the same problem. You may be a medium across the shoulders and a large through the hip. Your arms may be longer than the chart expects for your chest. Your waist to hip ratio is yours and not the chart's. Each individual measurement can be close to average while the combination is not, and a garment cut to the combination is what actually fits.",
      },

      {
        type: "quote",
        text: "The United States Air Force measured thousands of pilots on ten dimensions and checked how many were average on all ten at once. The answer was none.",
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
        text: "On a size chart, sleeve length is tied to chest size. On a person it is not. This is the single most common complaint about ready to wear and the easiest thing to solve when a garment is cut individually.",
      },
      { type: "h3", text: "Length, for your actual height" },
      {
        type: "p",
        text: "Trouser length in particular is set for a height the chart assumed. Getting it right is the difference between a trouser that looks intentional and one that looks borrowed.",
      },

      {
        type: "looks",
        a: {
          top: "/catalog/oversized-shirt/oversized-shirt-front.jpg",
          bottom: "/catalog/banded-trousers/banded-trousers-navy-combo-wide-full-front.jpg",
          label: "Wide leg, full length",
        },
        b: {
          top: "/catalog/oversized-shirt/oversized-shirt-ivory-combo-short-normal-front.jpg",
          bottom: "/catalog/banded-trousers/banded-trousers-navy-combo-straight-cropped-front.jpg",
          label: "Straight leg, cropped",
        },
        caption: "The same trouser, two cuts. You choose which one gets made, and nothing is cut until you do.",
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
        text: "The most sustainable garment is the one that gets worn. A piece that fits badly is worn twice and then avoided, which makes it expensive per wearing however cheap it was to buy. Fit is not a luxury feature. It is the thing that decides whether a garment is used or wasted.",
      },
      {
        type: "p",
        text: "Shaklek is made to order in the UAE. You choose the cut, the length and the colour, you see the piece as you choose it, and a tailor makes that one. Nothing sits in a warehouse waiting for a body it might fit.",
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
