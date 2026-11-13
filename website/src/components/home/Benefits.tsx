import { BENEFITS } from "@/data/homeContent";
import LineIcon from "@/components/LineIcon";

/**
 * The three reasons to buy here, placed AFTER the catalogue.
 *
 * They used to sit between the steps and the clothes, which meant a phone
 * visitor read three explanations, then three more claims, before reaching a
 * single garment -- the first card did not appear until y=1864. Founder's
 * call: these belong after the catalogue, where they answer "why here" for
 * someone who has just looked at the pieces, rather than delaying them.
 */
// The icon set lives in components/LineIcon.tsx (shared with IncludedInPrice
// since 2026-11-12); its header comment says why each icon is what it is.

export default function Benefits() {
  return (
    /* ⚠️ THE id IS AN ANCHOR TARGET, not decoration. /catalog links to
       "#why-choose-us" from its intro so a browser can understand the value
       without leaving the grid. Renaming or removing it breaks that link
       silently -- a bad hash scrolls nowhere and reports nothing.

       scroll-mt-24 because Header is `sticky top-0 z-50`: without it the
       browser scrolls the heading to y=0 and the header sits on top of it. */
    <section
      id="why-choose-us"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-12 sm:pt-16"
    >
      {/* Named, because an unlabelled row of three claims under the catalogue
          reads as decoration. As a section with a question for a title it is
          answering something the customer is actually asking by that point. */}
      {/* ⚠️ NO SLOGAN HERE, AND THIS IS THE SECOND TIME. The POSITIONING line
          ("Ready-to-wear makes thousands of a garment...") opened this section
          for about an hour on 2026-09-16 before the founder counted every
          slogan on the site and found eight: "it's too much we need to align."

          The home page already carries one in the hero. A second, four
          sections down, is the page arguing with itself. The line was not cut
          -- she likes it and so do I -- it CLOSES /our-story now, where it is
          the last thing read rather than the second thing claimed.

          Do not reintroduce a line above this heading. If the home page ever
          needs a slogan again, it replaces the hero. */}
      <h2 className="mb-6 text-lg text-text">Why choose us</h2>
      {/* BORDERED CARDS, three across, from the founder's mockup. As a bare
          list the three claims ran into the FAQ beneath them and read as more
          body copy; boxed, they read as three things rather than a paragraph,
          and each icon gets room to be seen at a size where it is legible.
          Stacks on a phone, where three columns would be unreadable. */}
      {/* FOUR, so every breakpoint divides evenly. The odd-count span below
          is kept anyway: a fifth card was added and removed within a day on
          2026-09-16, and without it the last one sits alone in a half-width
          cell at the two-column breakpoint, which reads as a rendering bug. */}
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {BENEFITS.map((b, i) => (
          <li
            key={b.k}
            className={`border border-border p-5 sm:p-6${
              BENEFITS.length % 2 === 1 && i === BENEFITS.length - 1
                ? " sm:col-span-2 lg:col-span-1"
                : ""
            }`}
          >
            <span className="block text-gold">
              <LineIcon name={b.icon} />
            </span>
            <p className="font-display mt-4 text-[16px] text-text">{b.k}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-text-2">
              {b.v}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
