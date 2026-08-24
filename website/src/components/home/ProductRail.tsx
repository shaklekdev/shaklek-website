import CatalogCard from "@/components/CatalogCard";
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
        <h2 className="text-lg text-text">{title}</h2>
        <p className="mt-1 text-[13px] text-text-3">{subtitle}</p>
      </section>

      {/* Carousel. The edge fade hints there is more to scroll. */}
      <section className="relative w-full pb-16">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-3 sm:px-[max(1.5rem,calc((100vw-72rem)/2))]">
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
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-bg to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg to-transparent sm:hidden" />
      </section>
    </>
  );
}
