import Link from "next/link";
import CatalogCard from "@/components/CatalogCard";
import { catalog } from "@/data/catalog";
import IncludedInPrice from "@/components/IncludedInPrice";

/**
 * The four pieces shown on the home page, by catalogue slug, in this order.
 *
 * ⚠️ FOUR, NOT THE WHOLE CATALOGUE. Founder, 2026-11-12, after opening-night
 * feedback from friends: the home page repeated the entire catalogue and was
 * too long. The home shows a taste; /catalog shows everything. Change the
 * selection by editing this list -- a slug that is not in catalog.ts is
 * skipped silently rather than crashing the page, so check the rendered rail
 * after editing. Slugs are the `slug:` fields in src/data/catalog.ts.
 */
export const HOME_RAIL_SLUGS = [
  "buttoned-abaya", // Buttoned Abaya
  "structured-blouse", // Peplum Blouse
  "buttoned-dress", // Buttoned Dress (shirt collar) - founder 2026-11-12
  "wide-leg-trousers", // Relaxed Trousers
];

/** The home-page rail: four pieces in a swipeable row and a link to the rest. */
export default function ProductRail({
  title = "Custom made for you",
  // A "Tap a colour to see it on the piece" hint lived here briefly and the
  // founder cut it: a row of colour dots on a photograph is already an
  // invitation, and explaining an interaction in words is text everyone reads
  // to learn something they would have found in one tap.
  // ⚠️ THE VISIT IS NOT IN THIS SUBTITLE, AND IT WAS FOR ABOUT AN HOUR ON
  // 2026-09-16. Open item "measuring-visit-pages" asks for it on the catalogue
  // grid and this looked like the place. It is not, because of WHERE this
  // component sits: one scroll from Concept, whose step 02 is the private home
  // fitting. (Since 2026-11-12 the rail sits ABOVE Concept, under Benefits,
  // rather than directly under it -- the neighbours changed, the reasoning did
  // not.) Adding it here put the same promise twice within one scroll, and
  // the home FAQ further down makes three.
  //
  // Founder, the same day, reading the product page where the identical thing
  // had happened: "i feel a repetition". Saying an offer twice in adjacent
  // sections does not reinforce it, it makes the page read as generated.
  //
  // ⚠️ THE /catalog PAGE IS DIFFERENT and keeps it in its own intro paragraph:
  // there is no Concept section above it, so that page would otherwise never
  // say it at all. Same promise, different neighbours.
  //
  //
  // ⚠️ 2026-11-12, LATER THE SAME DAY: THE PRICE CLAIM SITS UNDER THIS
  // HEADING (IncludedInPrice "chips"). Founder priority: it must be obvious
  // that the price includes everything, and this is the first text a cold
  // visitor reads next to the clothes. It names the fitting, which the note
  // above argued against -- the difference is that this is a PRICE line (what
  // the number covers), not a second description of the visit; Concept below
  // still explains what happens. Copy lives in data/included.ts.
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const items = HOME_RAIL_SLUGS.flatMap((slug) => {
    const item = catalog.find((i) => i.slug === slug);
    return item ? [item] : [];
  });

  return (
    <>
      {/* Anchored so "Add another piece" from the cart lands on the clothes
          rather than at the top of the page, leaving the customer to scroll
          past the whole explainer they have already read. scroll-mt clears the
          sticky header, which would otherwise cover the heading. */}
      <section
        id="catalog"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-12 pb-6 sm:pt-16"
      >
        {/* The price claim sits on the RIGHT, stacked, so the left column is
            only the heading (founder, 2026-11-12: "too much text on the left"). */}
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-balance text-lg text-text">{title}</h2>
            {/* No subtitle on the home (founder, 2026-11-13, "too much text...
                be strategic"): every card already says "Customise this piece".
                Pass `subtitle` explicitly to show one. */}
            {subtitle ? <p className="mt-1 text-[13px] text-text-3">{subtitle}</p> : null}
          </div>
          {/* ⚠️ NO COUNT, same call as /catalog (founder, 2026-09-14). It read
              "{catalog.length} pieces" and she flagged it as wrong on
              2026-10-11: a number on the page goes stale every time the range
              moves, and nobody remembers to look. */}
          <IncludedInPrice variant="chips" />
        </div>
      </section>

      {/* A SWIPEABLE ROW OF FOUR, since 2026-11-12. It was a grid of the whole
          catalogue from 2026-08-25: arrows had been tried and the founder's
          note was that a carousel is not obvious to everyone, and her visitors
          said eight pieces read as two. On opening night friends said the
          opposite problem -- the home repeats the whole catalogue and is too
          long -- so the founder chose four pieces in a row plus a link to the
          rest. Two things keep the "not obvious" objection answered: on a
          phone each card is ~72% of the viewport, so the next card is always
          visibly cut off at the right edge (nothing hidden, the swipe is
          implied by the picture), and on a laptop all four fit in the row with
          nothing to scroll. Native scroll-snap, no JS, no arrows.

          -mx-6/px-6 lets the row bleed to the screen edges while the first card
          stays aligned with the heading above; scroll-pl-6 keeps that
          alignment on every snap stop.

          ⚠️ overflow-y-hidden IS LOAD-BEARING. overflow-x-auto makes the
          browser treat Y as auto too, and the row was 1px taller than its box
          (scrollHeight 442 vs 441), so on a phone the cards wobbled up and down
          while swiping; founder, 2026-11-13: "it moves both vertically and
          horizontally". overscroll-x-contain stops a swipe at the end of the
          row from dragging the page or triggering browser back. */}
      <section className="mx-auto w-full max-w-6xl px-6">
        <div
          className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-pl-6 px-6 pb-1 sm:gap-6"
          aria-label="Pieces to start with"
        >
          {items.map((item) => (
            <div
              key={item.slug}
              className="w-[72%] shrink-0 snap-start sm:w-[40%] lg:w-[calc(25%-18px)]"
            >
              <CatalogCard item={item} eager fromMouth={item.slug === "structured-blouse"} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/catalog"
            className="inline-flex min-h-[44px] items-center rounded-full border border-border-strong px-6 text-sm text-text transition-colors hover:border-text hover:bg-surface-2"
          >
            See the full catalogue
          </Link>
        </div>
      </section>
    </>
  );
}
