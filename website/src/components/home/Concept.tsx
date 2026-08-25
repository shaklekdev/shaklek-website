import Image from "next/image";
import { STEPS, OUTCOME } from "@/data/homeContent";

/**
 * The concept, immediately after the banner: steps on the left, the tailor's
 * hands on the right.
 *
 * This is /how-it-works brought onto the home page and cut from five steps to
 * three, at the founder's direction. Her reasoning for the ORDER is worth
 * keeping, because it is not the obvious one:
 *
 *   1. Pick your piece — basic, the same as any shop, nothing to learn.
 *   2. Your size, or your measurements — the business model. This is the data
 *      the studio runs on and the only thing a rack of clothes cannot offer.
 *   3. Add a detail — optional, and the competitive edge.
 *
 * What the tailor does afterwards is real but is NOT numbered: by then the
 * customer has nothing left to do, and three steps read as quick where five
 * read as work.
 */

export default function Concept() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-12">
      {/* The block had no heading, so on a phone a visitor met a large
          photograph and three numbered paragraphs with nothing saying what
          they were. Founder: "we don't understand where how it works is
          coming." */}
      <h2 className="mb-6 text-lg text-text">How it works</h2>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-14">
        <ol className="space-y-7">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="font-display shrink-0 text-lg text-gold">
                {s.n}
              </span>
              <div className="min-w-0">
                <h3
                  className={
                    s.emphasis
                      ? "font-display text-[19px] leading-snug text-text"
                      : "text-[15px] font-medium text-text"
                  }
                >
                  {s.title}
                </h3>
                <p
                  className={`mt-1.5 text-[13px] leading-relaxed ${
                    s.emphasis ? "text-text-2" : "text-text-2"
                  }`}
                >
                  {s.body}
                </p>
              </div>
            </li>
          ))}

          {/* Not a step, and not numbered. The customer has nothing left to do
              here, and this is the part that says they are buying a service
              rather than a product. */}
          <li className="flex gap-4 border-t border-border pt-6">
            <span className="shrink-0 text-[13px] text-text-3">Then</span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-medium text-text">
                {OUTCOME.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-2">
                {OUTCOME.body}
              </p>
            </div>
          </li>
        </ol>

        {/* The tailor's hands: the only image on the site showing the person
            who makes the garment, which is the argument these steps are
            making.
            On a phone it was `order-first` and 428px tall -- half the screen,
            ahead of the words, so step one did not appear until y=854. It now
            follows the steps and is a short landscape crop. Full height only
            from lg up, where it has its own column and costs nothing. */}
        <div className="relative aspect-[16/10] max-h-[190px] w-full overflow-hidden bg-card sm:max-h-[240px] lg:sticky lg:top-[110px] lg:aspect-[4/5] lg:max-h-none">
          <Image
            src="/marketing/story-tailoring.png"
            alt="A tailor working on a single piece"
            fill
            sizes="(min-width: 1024px) 352px, 100vw"
            className="object-cover"
          />
        </div>
      </div>

    </section>
  );
}
