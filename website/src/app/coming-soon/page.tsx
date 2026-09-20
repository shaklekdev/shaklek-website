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
    "Clothing in 100% natural linen, cut to your measurements and made in the UAE, after you order it. Opening soon. Leave your email to hear when.",
  openGraph: {
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description:
      "Clothing in 100% natural linen, cut to your measurements and made in the UAE, after you order it. Opening soon.",
  },
};


export default function ComingSoonPage() {
  return (
    <main className="flex flex-col items-center px-6 py-5 sm:py-20">
      <div className="flex w-full max-w-3xl flex-col gap-5 sm:gap-12">
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
          <p className="font-wordmark text-3xl tracking-[0.138em] text-text sm:text-5xl">
            Shaklek
          </p>
          {/* ⚠️ NO DATE. Founder, 2026-09-19: "remove early october, just say
              opening soon." A month on the page is a promise with a deadline
              attached, and it ages badly the moment it slips. NOTE: "early
              October" is still written into three blog answers in
              src/data/blog.ts -- left alone because she named this page, but
              they are the next thing to look at if the date moves. */}
          <p className="text-xs uppercase tracking-[0.22em] text-gold">
            Opening soon
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

            ⚠️ IT WAS 4:5 AND IT COST US THE SIGNUP. The note here used to say
            the taller crop pushed the email box down and was worth it. It was
            not. Founder, 2026-09-19, from her own phone: "when a customer comes
            on the page they don't understand there is the subscribe to the
            waitlist, it doesn't appear at all, all we see is the picture and
            the slogan." On a 390px phone the 4:5 frame is 427px tall and put
            the input at roughly 723px, below the fold on every iPhone once
            Safari's chrome is taken off. A waitlist page whose waitlist is
            invisible has no purpose.

            13:12 AS OF 2026-09-19, AND THE RATIO IS NOW LOAD-BEARING IN BOTH
            DIRECTIONS. It went 4:5 -> square -> 6:5 -> 13:12 in one afternoon,
            which looks like fiddling and is not: each step traded hero height
            against what else has to fit on the first screen. Removing the
            "Know the day we open." label handed back about 36px and the founder
            asked for the picture to take some of it.

            ⚠️ THE CEILING IS NOT TASTE, IT IS THE THIRD THING THAT MUST BE
            VISIBLE. Founder, 2026-09-19: "make the first of the next 3 cards
            still visible so that people know they need to scroll to see more."
            So the first screen has to carry the wordmark, the hero, the email
            button AND a slice of card one. Grow this ratio and the slice is the
            first thing to disappear -- check it on a real phone, not in
            headless, which will not lay out below about 500px wide here.

            THE FLOOR, FOR THE SAME AFTERNOON'S OTHER REASON: at 390px wide
            13:12 is about 316px tall, and the three lines of text-2xl with
            their pb-8 need roughly 116px of it, leaving about 200px of
            photograph above the words. 6:5 (285px) was the tightest that still
            read; below that the headline sits back down on the cloth, which is
            the thing rejected on 2026-09-14.

            NOT THE BANNER EITHER. Do not "fix" this by going back to
            sm:aspect-[1584/672] on the phone: that is 2.36:1, about 210px at
            this width, and three lines of display type over it collided with
            the hanging cloth and became unreadable. Tried and rejected
            2026-09-14. Square is 342px here, which still leaves the headline
            (3 lines at text-2xl, about 116px with its pb-8) quiet sand to sit
            on, and hands back ~85px.

            That 85px is only half of it. py-14 -> py-8, gap-12 -> gap-8 and the
            waitlist block's py-10 -> py-6 are all phone-only for the same
            reason, and all four restore their old values at sm. Together they
            move the input up by roughly 157px. The image still comes first and
            the headline still does the selling -- it just no longer eats the
            ask.

            object-position 60% keeps the cloth in frame when the crop narrows;
            at 50% the tall crop cut the right-hand sheet in half. */}
        <div className="relative aspect-[13/12] w-full overflow-hidden sm:aspect-[1584/672]">
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
        {/* ⚠️ BORDER-B ONLY, NOT BORDER-Y. Founder, 2026-09-19: "drop the ruler
            between the picture and the know when we open." The top rule was
            there to fence the form off as its own band, which is right on
            desktop where the banner sits well above it. On a phone the square
            hero ends in a hard edge a few pixels earlier, so the rule read as a
            stray line between two things that were already separated. The
            bottom rule stays: it is what still separates the ask from the three
            pictures below. */}
        <div className="flex flex-col items-center gap-4 border-b border-border py-6 text-center sm:py-10">
          <div className="flex w-full justify-center">
            <WaitlistForm />
          </div>
        </div>

        {/* ⚠️ THE THREE CARDS ARE PARKED, NOT DELETED. Founder, 2026-09-20:
            "remove the three cards from the opening soon page, keep them
            somewhere saved and their draft but for now we need to start teasing
            people slowly without saying what the brand is about."

            The copy, the layout and every decision behind them are saved whole
            in planning/marketing/coming-soon-pillars.md, and the three
            photographs are untouched in public/marketing/pre-launch/. If they
            come back, they come back from there -- the copy is finished and she
            edited it line by line over three sessions.

            ⚠️ DO NOT REPLACE THEM WITH SOMETHING ELSE THAT EXPLAINS THE BRAND.
            Removing them is a change of PURPOSE: this page now teases and does
            not explain. Anything that answers "why linen", "how does the fit
            work" or "where is it made" belongs on the storefront, not here. */}

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
