import Image from "next/image";
import { STEPS, OUTCOME, BENEFITS } from "@/data/homeContent";

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

function BenefitIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "tag")
    return (
      <svg {...common}>
        <path d="M3 12.5V4a1 1 0 0 1 1-1h8.5L21 11.5 12.5 20 3 12.5Z" />
        <circle cx="7.5" cy="7.5" r="1.3" />
      </svg>
    );
  if (name === "leaf")
    return (
      <svg {...common}>
        <path d="M4 20c0-8 5-14 16-15 0 11-5.5 16-13 16H4Z" />
        <path d="M9 20c1.5-4.5 4-7.5 7-9.5" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M6 3v7a6 6 0 0 0 12 0V3" />
      <path d="M12 16v5" />
      <circle cx="12" cy="21" r="1.2" />
    </svg>
  );
}

export default function Concept() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-12">
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

        {/* The tailor's hands. Already earning its place on /our-story, and it
            is the only image on the site showing the person who makes the
            garment -- which is the whole argument these three steps are
            making. Ordered second in the DOM so a phone reads the steps
            first and does not push them below an image. */}
        <div className="relative order-first aspect-[4/5] w-full overflow-hidden bg-card lg:order-none lg:sticky lg:top-[110px]">
          <Image
            src="/marketing/story-tailoring.png"
            alt="A tailor working on a single piece"
            fill
            sizes="(min-width: 1024px) 352px, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <ul className="mt-12 grid gap-6 border-t border-border pt-10 sm:grid-cols-3 sm:gap-8">
        {BENEFITS.map((b) => (
          <li key={b.k} className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-gold">
              <BenefitIcon name={b.icon} />
            </span>
            <div>
              <p className="font-display text-[15px] text-text">{b.k}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-2">
                {b.v}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
