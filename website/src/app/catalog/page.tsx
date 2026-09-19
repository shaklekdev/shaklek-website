import type { Metadata } from "next";
import Header from "@/components/Header";
import CatalogCard from "@/components/CatalogCard";
import Benefits from "@/components/home/Benefits";
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
    "Every Shaklek piece, made to order in 100% natural linen and cut to your measurements. Shirts and pants from AED 449.",
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
          {/* ⚠️ NO COUNT. This read "{catalog.length} essentials", which
              rendered as "8 essentials" and did the range no favours: a number
              that small reads as a limitation to a stranger, and it shrinks
              every time something sells out. Founder, 2026-09-14. */}
          {/* ⚠️ TWO SENTENCES, SIXTEEN WORDS. Founder, 2026-09-19, on the
              four-sentence version: "this is way too long."

              What it used to also carry, and where that lives now:
                "change the sleeve, the length or the leg"  -- every product
                  page, and the home page's "100% custom-made" tile
                "Or pick a standard size"                   -- the Tailored /
                  Standard toggle on every product page, where the choice is
                  actually made
                "The price is the same either way"          -- the toggle says
                  "Tailored (free)" on its own button, and the cards below this
                  paragraph all show their price

              ⚠️ THE CITY STAYS. This paragraph is the ONLY place /catalog
              names Dubai -- there is no steps section on this page and the
              cards carry no copy -- so cutting it removes the scope limit from
              the page entirely.

              ⚠️ "FREE ON YOUR FIRST ORDER" CAME OUT, hers 2026-09-19. Safe,
              because this no longer claims the visit is free at all: it states
              the service and stops. The condition only has to travel with the
              word "free", and the word is gone. If "free" ever comes back into
              this sentence, "on your first order" comes back with it.

              ⚠️ "Customisable", not "customizable". The hero says
              "Customisable pieces" and the site is on UK spelling throughout;
              only "customizer" as a thing we call the tool keeps the z. */}
          Customisable and tailored essentials in high-quality 100% natural linen; we
          come and measure you in Dubai.
        </p>

        {/* ⚠️ A PLAIN <a>, NOT next/link, AND THAT IS THE WHOLE TRICK. A hash
            link whose path matches the page you are already on does nothing in
            the App Router -- no navigation, so nothing scrolls. It is the bug
            the founder reported as "the Catalog button bugs, it doesn't work
            always", and Header.tsx carries a useHashNav workaround for it.
            A bare anchor never reaches the router, so the browser just scrolls.

            The label matches the heading it lands on, word for word. A link
            called something else makes the reader spend the click working out
            whether they arrived. */}
        <p className="mt-3">
          <a
            href="#why-choose-us"
            className="text-[13px] text-text-2 underline underline-offset-4 hover:text-text"
          >
            Why choose us
          </a>
        </p>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {catalog.map((item, i) => (
            <CatalogCard key={item.slug} item={item} eager={i < 4} />
          ))}
        </div>
      </div>

      {/* ⚠️ THE SAME "Why choose us" THE HOME PAGE SHOWS, not a second copy.
          Founder, 2026-09-19: a way "to know more... so they understand the
          value without taking them to another page."

          It renders BENEFITS, so this page cannot drift from the home page and
          /our-story the way "Why Shaklek?" did before 2026-09-16. Three
          surfaces, one array.

          Under the grid deliberately: somebody who has scrolled past eight
          garments is asking "why you and not the shop I already use". Above
          them it would be arguing with a visitor who has not seen the clothes.
          Same reasoning that put it below the products on the home page. */}
      <Benefits />
    </div>
  );
}
