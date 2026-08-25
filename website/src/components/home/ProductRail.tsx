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
      <section className="mx-auto w-full max-w-6xl px-6 pt-14 pb-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg text-text">{title}</h2>
            <p className="mt-1 text-[13px] text-text-3">{subtitle}</p>
          </div>
          <p className="shrink-0 text-[13px] text-text-3">
            {catalog.length} pieces
          </p>
        </div>
      </section>

      {/* A GRID, not a carousel. Arrows were added on 2026-08-25 and the
          founder's follow-up was that a carousel is not obvious to everyone --
          which matches what her own visitors told her, that eight pieces read
          as two. A grid has no hidden state: everything is on the page, and
          two columns on a phone means a customer sees four garments without
          touching anything. Nothing to discover, nothing to swipe. */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {catalog.map((item, i) => (
            <CatalogCard key={item.slug} item={item} eager={i < 4} />
          ))}
        </div>
      </section>
    </>
  );
}
