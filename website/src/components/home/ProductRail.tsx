import CatalogCard from "@/components/CatalogCard";
import ProductRailScroller from "./ProductRailScroller";
import { catalog } from "@/data/catalog";

/** The catalog carousel, extracted so the home-page variants can order the
 *  page differently without duplicating it. */
export default function ProductRail({
  title = "Start with a piece",
  // A "Tap a colour to see it on the piece" hint lived here briefly and the
  // founder cut it: a row of colour dots on a photograph is already an
  // invitation, and explaining an interaction in words is text everyone reads
  // to learn something they would have found in one tap.
  subtitle = "Make it yours in the next step.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-6 pt-12 pb-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg text-text">{title}</h2>
            <p className="mt-1 text-[13px] text-text-3">{subtitle}</p>
          </div>
          {/* The count, stated. A phone shows one card and a sliver of the
              next, so eight pieces read as two -- which is what the founder
              was told by real visitors. The arrows fix the mechanism; this
              fixes the impression, before anyone has scrolled at all. */}
          <p className="shrink-0 text-[13px] text-text-3">
            {catalog.length} pieces
          </p>
        </div>
      </section>

      {/* Carousel. The edge fade alone was not enough of a hint -- see
          ProductRailScroller. */}
      <section className="relative w-full pb-16">
        <ProductRailScroller label="Catalogue">
          {catalog.map((item, i) => (
            <div
              key={item.slug}
              className="w-[220px] shrink-0 snap-start sm:w-[248px]"
            >
              {/* The first two cards are above the fold at every width, so they
                  should not wait for the lazy-load intersection check. `eager`,
                  not `priority` -- priority would inject a preload competing
                  with the hero, which is the LCP element. */}
              <CatalogCard item={item} eager={i < 2} />
            </div>
          ))}
        </ProductRailScroller>
      </section>
    </>
  );
}
