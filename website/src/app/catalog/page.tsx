import type { Metadata } from "next";
import Header from "@/components/Header";
import CatalogCard from "@/components/CatalogCard";
import { catalog } from "@/data/catalog";
import { absoluteUrl } from "@/lib/seo";

/**
 * The catalogue as a real page.
 *
 * WHY THIS EXISTS WHEN THE PRODUCTS ARE ALREADY ON THE HOME PAGE.
 * `/#catalog` works for a visitor but is not a URL: everything after the `#`
 * is never sent to a server, so Google only ever sees the home page and an ad
 * click cannot be told apart from a story click. That means the catalogue
 * cannot rank for "linen shirts UAE" on its own, and Meta spend lands on a
 * page whose job is persuasion rather than browsing.
 *
 * The home page keeps its products deliberately. At launch the traffic is
 * effectively all cold -- nobody knows the brand -- so the argument has to come
 * before the clothes, and forcing a click to reach them would be the friction
 * the founder was warned about. This page serves the other two audiences: ads,
 * and anyone who already knows what Shaklek is and just wants the range.
 *
 * ⚠️ IT IS NOT A COPY OF THE HOME SECTION. Own heading, own intro, no story
 * around it. When filters and sorting arrive they belong here, not on the home
 * page, because they need URL state.
 *
 * REVISIT WHEN MOST TRAFFIC IS RETURNING, not when the product count grows.
 * That is the real trigger for taking products off the home page.
 */
export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Every Shaklek piece, made to order in 100% linen and cut to your measurements. Shirts and trousers from AED 389.",
  alternates: { canonical: absoluteUrl("/catalog") },
};

export default function CatalogPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />

      <div className="mx-auto w-full max-w-6xl px-6 pt-12 pb-16">
        <h1 className="font-display text-[30px] leading-tight text-text sm:text-[38px]">
          Every piece we make
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-2">
          {catalog.length} essentials in 100% linen. Choose a piece, change the
          sleeve, the length or the leg, and send your measurements or pick a
          standard size. The price is the same either way.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {catalog.map((item, i) => (
            <CatalogCard key={item.slug} item={item} eager={i < 4} />
          ))}
        </div>
      </div>
    </div>
  );
}
