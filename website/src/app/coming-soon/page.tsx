import type { Metadata } from "next";
import Image from "next/image";
import WaitlistForm from "@/components/WaitlistForm";

// THE PRE-LAUNCH PAGE. Every path on the site rewrites here while STORE_OPEN is
// not "true" (src/proxy.ts), so this is the whole site to a visitor today.
//
// ⚠️ COPY RULES, from planning/marketing/personas.md. Not style preferences.
// These are claims that would be false:
//   - NO PRICE, anywhere. Pricing is still being reworked.
//   - "100% linen", never "100% plant based". There are buttons and a zip fly.
//   - "Cut and sewn in the UAE", never "100% made in the UAE". The cloth is
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
  title: "Shaklek",
  description:
    "Made to order clothing in 100% linen, cut to your measurements and sewn in the UAE. Opening early October. Leave your email to hear when.",
  openGraph: {
    title: "Shaklek",
    description:
      "Made to order clothing in 100% linen, cut to your measurements and sewn in the UAE. Opening early October.",
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
    title: "100% linen. It breathes.",
    body: "A plant fibre that moves air and takes water off your skin. Nothing from a barrel of oil.",
  },
  {
    // Already the right photograph: shears, tailor's chalk and linen on the
    // bench. Do not swap it for a garment shot, which shows the result and not
    // the making.
    src: "/marketing/pre-launch/tailor-hands.jpg",
    alt: "A tailor's hands pinning linen, with shears and chalk on the bench.",
    title: "Cut to you.",
    body: "Your measurements, and the shape you choose, down to the sleeve.",
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
    // ⏳ ONE THING OUTSTANDING: the UAE regulates commercial use of the
    // national flag. Confirm a brand page is within those rules before this
    // goes public.
    src: "/marketing/pre-launch/uae-desert.jpg",
    alt: "A United Arab Emirates flag among date palms in the desert at low sun.",
    title: "Made in the UAE.",
    body: "By a tailor we know by name, for the weather we actually live in.",
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
        <div className="relative aspect-[1584/672] w-full overflow-hidden">
          <Image
            src="/marketing/hero-banner.jpg"
            alt="Linen clothing, worn."
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-5 text-center">
          {/* The founder's business-card line, TRIMMED. "Made in the UAE" came
              off the end on 2026-09-12 because it is said again on the third
              card and the line was too long to land. The first two clauses are
              hers, verbatim. */}
          <p className="font-display text-2xl leading-snug text-text sm:text-3xl">
            Your skin breathing. Your clothes fitting.
          </p>
          {/* ⚠️ DO NOT PUT THE GUILT HOOK BACK. This read "Check the label on
              whatever you have on right now. If it says polyester, you have
              been wearing plastic through a Gulf summer." It is a good VIDEO
              hook and it is in the content plan as one, where being provocative
              earns a stop-scroll. On the brand's own front page it opens by
              telling a stranger she got dressed wrong, which sells to people
              already convinced and repels everyone else.

              The same fact still appears, aimed at the material instead of the
              reader: "plastic traps both", on the second card.

              TWO SMALL THINGS, BOTH THE FOUNDER'S CALL, 2026-09-12: the
              temperature is a NUMERAL because spelled out it slows the line
              down, and it is 40 rather than 45 because 45 is a number she has
              not personally lived through here. A claim a reader can check
              against her own memory of last August is worth more than a
              bigger one. */}
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-text-2">
            Linen in 40 degrees feels like almost nothing. We cut it to your
            measurements.
          </p>
        </div>

        {/* ⚠️ THE MEASURING VISIT, AND IT IS THE MOST IMPORTANT BLOCK ON THE
            PAGE. Founder, 2026-09-13: "the measurements are for everyone...
            this is how we will get customers. we still don't have a name, we
            need to build trust so these needs to be A BIG PART of our
            advertisement."
            
            It sits ABOVE the email box on purpose: it is the reason to give an
            address, so it has to be read before the ask. The competitors
            launching alongside us cannot say this, which is the whole point of
            leading with it rather than with fabric.

            ⚠️ NO PRICE AND NO THRESHOLD. The 550 rule was removed the same day
            (planning/margins.mjs): the visit is for everyone, first order, and
            gating it would undo the trust it exists to build. Dubai only, and
            it says so, because somebody in Sharjah reading a promise that does
            not name a city has been mis-sold. */}
        <div className="flex flex-col gap-3 border border-gold bg-surface-2 px-6 py-7 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">In Dubai</p>
          <p className="font-display text-xl leading-snug text-text sm:text-2xl">
            We come to you, and we measure you.
          </p>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-text-2">
            Before your first piece is cut. Not a size chart, and nothing to pay
            for the visit.
          </p>
        </div>

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

        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {PILLARS.map((pillar) => (
            <li key={pillar.title} className="flex flex-col gap-3">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-2">
                {pillar.src ? (
                  <Image
                    src={pillar.src}
                    alt={pillar.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <p className="text-sm text-text">{pillar.title}</p>
              <p className="text-sm leading-relaxed text-text-2">{pillar.body}</p>
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
