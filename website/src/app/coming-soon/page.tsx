import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import Image from "next/image";
import WaitlistForm from "@/components/WaitlistForm";

// THE PRE-LAUNCH PAGE. Every path on the site rewrites here while STORE_OPEN is
// not "true" (src/proxy.ts), so this is the whole site to a visitor today.
//
// ⚠️ COPY RULES, from planning/marketing/personas.md. Not style preferences.
// These are claims that would be false:
//   - NO PRICE, anywhere. Pricing is still being reworked.
//   - "100% linen", never "100% plant based". There are buttons and a zip fly.
//   - "Made in the UAE" is APPROVED and is what this page says. Only "100%
//     made in the UAE" is banned, because the 100% claims the fabric. The cloth is
//     milled abroad and we do not volunteer where (founder, 2026-09-12).
//   - The words "sustainable", "eco" and "green" appear NOWHERE. The mechanism
//     is the credible version: "made after you order it" is a fact a visitor
//     can check against how the site works. A label is not.
//   - Never "long sleeve": no catalogue photograph shows a sleeve worn down.
//   - No urgency, no countdown, no discount code, no em dashes.
//   - No delivery promise. "About ten days" is the number the capacity note
//     says breaks first, and nothing has been made at volume yet.
//   - "Early October", never a named day. Packaging decides the date, because
//     the care label is the legal fibre disclosure, and samples have not landed.
//
// ⚠️ AND KEEP IT SHORT. Founder, 2026-09-12: the manifesto version was "too
// heavy on the eyes". The body is now about sixty words in total and each
// block is a heading plus one sentence. If a line is being added here, take
// one out. The images carry the weight the paragraphs used to.
//
// The headline is the founder's own approved line from the business card,
// verbatim. Do not rewrite it.
export const metadata: Metadata = {
  // ⚠️ ONE CANONICAL, AND IT COVERS EVERY SHUT URL. /faq, /catalog, /cart,
  // /design/* and the rest are REWRITTEN here, so they all render this page's
  // metadata and all returned 200 with identical HTML and no canonical.
  // robots.txt says Allow: /, so Google would have treated them as duplicates,
  // picked its own canonical (possibly /faq) and held a splash-page snippet
  // against that URL after opening. Security review, 2026-09-12.
  alternates: { canonical: "https://www.shaklek.com/" },
  // ⚠️ ABSOLUTE, BECAUSE THE ROOT LAYOUT APPENDS THE BRAND. layout.tsx sets
  // `template: "%s · Shaklek"`, so a plain title of "Shaklek" rendered as
  // "Shaklek · Shaklek" -- and while the shop is shut proxy.ts rewrites every
  // URL here, so that was the tab title on THE ONLY PAGE THE PUBLIC CAN SEE.
  // Found on 2026-09-16 by reading the live title back off www.shaklek.com
  // after a deploy, not off localhost, which is the only way to catch it: the
  // rewrite does not happen locally with STORE_OPEN=true.
  //
  // Same bug was fixed the same day on both /waitlist pages, which set
  // title: "Shaklek" for the same reason. If you add another page that wants
  // the bare brand name, it needs `absolute` too.
  //
  // It carries SITE_TAGLINE so the shut site and the open one agree: this page
  // IS the home page today, and /'s title is `${SITE_NAME} · ${SITE_TAGLINE}`.
  title: { absolute: `${SITE_NAME} · ${SITE_TAGLINE}` },
  description:
    "Clothing in 100% linen, cut to your measurements and made in the UAE, after you order it. Opening early October. Leave your email to hear when.",
  openGraph: {
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description:
      "Clothing in 100% linen, cut to your measurements and made in the UAE, after you order it. Opening early October.",
  },
};

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
    title: "100% linen, it breathes.",
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

export default function ComingSoonPage() {
  return (
    <main className="flex flex-col items-center px-6 py-14 sm:py-20">
      <div className="flex w-full max-w-3xl flex-col gap-12">
        <header className="flex flex-col items-center gap-3 text-center">
          {/* ⚠️ "Shaklek", NOT "SHAKLEK", and the tracking is not free-hand.
              Header.tsx sets the mark at 27px with 4px of tracking, and
              generate-packaging-artwork.mjs shapes it from
              branding/source/fonts/Italiana-Regular.ttf at exactly (size*4)/29.
              Both are already the same, and the Fitoor artwork is in
              production against that.

              This page shipped it as SHAKLEK at 0.18em for a few hours and the
              founder read it as a FONT change. It was not: Italiana in caps
              with wide tracking simply does not look like Italiana in mixed
              case. 0.138em is 4/29 expressed relatively, so it holds at any
              size. Do not retune it here without changing the header and the
              artwork together. */}
          <p className="font-wordmark text-4xl tracking-[0.138em] text-text sm:text-5xl">
            Shaklek
          </p>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">
            Opening early October
          </p>
        </header>

        {/* priority: this is the only image above the fold on a phone and the
            page has nothing else to paint, so lazy-loading it just leaves a
            grey box in the first frame. */}
        {/* ⚠️ TWO SHAPES. On a phone this is a TALL 4:5 frame carrying the
            headline; from sm up it is the original wide 1584/672 banner with
            the headline below it.

            Why: the banner is 2.36:1, so at phone width it is about 210px
            tall, and three lines of display type over it collided with the
            hanging cloth and became unreadable. Tried and rejected on
            2026-09-14. A taller crop gives the words quiet sand to sit on.

            THE TRADE IS REAL: the hero is much taller on a phone, so the email
            box sits further down. Worth it because the headline is doing the
            selling now rather than decorating a page you scroll past. If that
            ever stops being true, this is the thing to undo.

            object-position 60% keeps the cloth in frame when the crop narrows;
            at 50% the tall crop cut the right-hand sheet in half. */}
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[1584/672]">
          <Image
            src="/marketing/hero-banner.jpg"
            alt="Linen clothing, worn."
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover object-[60%_50%] sm:object-center"
          />
          {/* Phone only: the scrim exists to carry the words, so it dies with
              them at sm. It stops short of the top so the sky is untouched. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent sm:hidden"
          />
          {/* The shadow is not decoration. The last line sits over the
              brightest sand in the frame and was the softest of the three
              without it; a heavier scrim alone would have dulled the cloth. */}
          <p className="absolute inset-x-0 bottom-0 px-6 pb-8 font-display text-2xl leading-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] sm:hidden">
            <span className="block">Clothes that fit you perfectly,</span>
            <span className="block">and respect your skin,</span>
            <span className="block">should not be an occasion.</span>
          </p>
        </div>

        {/* ⚠️ ONE LINE, AND IT IS DOING FOUR JOBS. Founder's, 2026-09-14.

            "should not be an occasion" is the load-bearing phrase and the
            reason this line exists. It makes the democratising argument
            WITHOUT the two things that sank every earlier attempt: it never
            says "for everyone", which the prices do not support and which she
            rejected outright ("our prices are not really for everyone"), and
            it never flattens the feeling the customer is actually paying for
            ("some people who want to feel special will not identify in this").
            It says the piece is precious AND that it should be ordinary
            anyway. Nothing shorter has managed both.

            It also carries both pillars in one clause, "fit you perfectly" and
            "respect your skin", which is why there is no second paragraph and
            no tagline above it.

            ⚠️ THE BUSINESS-CARD LINE IS DELIBERATELY NOT HERE. This block used
            to open "Your skin breathing. Your clothes fitting." with a
            paragraph underneath restating both halves, and the three cards
            below say the SAME two things a third time as "100% linen, it
            breathes" and "100% tailored, it fits". Founder: "isn't it
            repetitive". It was, three times over. The tagline still lives on
            the business card, the packaging and the footer, which is where a
            tagline belongs.

            DO NOT PUT THE GUILT HOOK BACK. This block once read "Check the
            label on whatever you have on right now. If it says polyester, you
            have been wearing plastic through a Gulf summer." It is a good
            VIDEO hook and it is in the content plan as one, where being
            provocative earns a stop-scroll. On the brand's own front page it
            opens by telling a stranger she got dressed wrong, which sells to
            people already convinced and repels everyone else. */}
        <div className="hidden flex-col gap-5 text-center sm:flex">
          <p className="mx-auto max-w-xl font-display text-2xl leading-snug text-text sm:text-3xl">
            {/* ⚠️ THE LINE BREAK IS DELIBERATE, do not let it reflow. Founder,
                2026-09-14: "I find this sentence too long, it's very hard to
                read." The cause is nine words of subject before the verb
                arrives, so the reader carries the whole clause before the
                sentence resolves. Breaking before "should" puts the subject on
                one line and the payoff on the next, and changes no words.

                THREE PHRASES, NOT TWO. Breaking only before "should" left an
                eight-word first clause that still wrapped, orphaning "skin" on
                a line of its own, which read worse than no break at all. Each
                span is now a phrase that fits, and the commas mean it still
                reads correctly if a narrow screen reflows one of them. */}
            <span className="block">Clothes that fit you perfectly,</span>
            <span className="block">and respect your skin,</span>
            <span className="block">should not be an occasion.</span>
          </p>
        </div>

        {/* ⚠️ THE MEASURING VISIT USED TO BE A GOLD-BORDERED BLOCK HERE, and
            it was removed on 2026-09-14 at the founder's instruction: "this is
            saying way too much before the launch, it should be integrated in
            our page."

            IT IS NOT GONE. It now sits inside the "100% tailored" card below,
            in one clause. That is a deliberate downgrade in volume, not a
            change of mind about the offer: the code comment that used to live
            here called it the most important block on the page, quoting her
            own instruction from 2026-09-13, and she superseded that a day
            later. If it ever comes back up the page, keep it one line.

            The constraints on the promise itself have NOT changed: Dubai only
            and it says so, no price, no threshold, and the sequence is that
            she orders first and we reach out. */}

        {/* THE FORM SITS HERE, MID PAGE, NOT AT THE FOOT. Founder, 2026-09-12.
            An email address is the only thing this page asks for, and at the
            bottom it was behind three cards a reader may never scroll past.
            Above it there is now a reason to care; below it there is support
            for the claim. Both orders are defensible; this one does not depend
            on the scroll. */}
        <div className="flex flex-col items-center gap-4 border-y border-border py-10 text-center">
          <p className="text-sm text-text">Know the day we open.</p>
          <div className="flex w-full justify-center">
            <WaitlistForm />
          </div>
        </div>

        {/* ⚠️ TWO DIFFERENT LAYOUTS, AND THE PHONE ONE IS THE POINT.
            Founder, 2026-09-14: "we need a specific layout for the three
            pictures on phone because it shows too long, too big."

            She was right about the number. Three 4:5 images stacked in one
            column is roughly 1400px of scroll on a 375px phone, for three
            cards, below the email box. Most readers never saw the third one.

            PHONE: 16:9 banners, title laid ON the image over a scrim, body
            hidden. About 630px for all three.
            DESKTOP (sm and up): the original 3-up grid of 4:5 portraits, title
            and body beneath, unchanged.

            The title sits on the image on BOTH, because that is what she asked
            for. On desktop it is the only thing on the image and the body
            still reads underneath it. */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
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
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
                />
                <p className="absolute inset-x-0 bottom-0 px-4 pb-4 font-display text-lg leading-snug text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] sm:px-3 sm:pb-3 sm:text-base">
                  {pillar.title}
                </p>
              </div>
              {/* ⚠️ SHOWN ON PHONE, deliberately, 2026-09-14. These were hidden
                  when the bodies were long paragraphs; they are one short line
                  each now, and the whole section still fits in about 630px.
                  The founder thought this was already done, which is a fair
                  read: the LAYOUT changed this morning, the bodies did not.
                  Hiding them meant a phone reader got "100% linen" as a claim
                  and never the reason, which is the one thing she has said
                  repeatedly that people do not understand. */}
              <p className="text-sm leading-relaxed text-text-2">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>

        {/* A minimal foot, carrying the legal link rather than a line spent on
            it alone. The site's real Footer is hidden while the shop is shut
            (src/app/layout.tsx) because it is a menu of links that all rewrite
            back to this page, so this is the ONLY route to the privacy policy
            anywhere on the site. It collects an email address from the public,
            so that route has to exist. */}
        <p className="text-center text-xs text-text-2">
          Shaklek, Dubai{" "}
          <span aria-hidden="true" className="px-1">
            &middot;
          </span>{" "}
          <a href="/legal/privacy" className="underline underline-offset-2 hover:text-text">
            Privacy
          </a>
        </p>
      </div>
    </main>
  );
}
