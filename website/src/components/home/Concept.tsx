import Image from "next/image";
import { STEPS, OUTCOME } from "@/data/homeContent";

/**
 * The concept: three steps, then what happens once the customer is done.
 *
 * The tailor's photograph has now been tried three ways, and the first two
 * were wrong for reasons worth recording:
 *
 *   1. A tall column beside the steps. On a phone it was 428px of image ahead
 *      of the words, so step one did not appear until y=854.
 *   2. A full-bleed background behind the whole section. It read as a second
 *      banner competing with the hero, which is not what this block is for.
 *
 * It now sits BESIDE "Then we take care of the rest" -- the one line it
 * actually illustrates. The steps are things the customer does; this is the
 * part where they hand over, and the hands are the picture of exactly that.
 * Contained, half the width, never full-bleed.
 */
export default function Concept() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-12">
      <h2 className="text-lg text-text">How it works</h2>

      <ol className="mt-6 max-w-2xl space-y-6">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-4">
            <span className="font-display shrink-0 text-lg text-gold">
              {s.n}
            </span>
            <div className="min-w-0">
              <h3
                className={
                  s.emphasis
                    ? "font-display text-[18px] leading-snug text-text"
                    : "text-[15px] font-medium text-text"
                }
              >
                {s.title}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-text-2">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* The handover. Text one side, the tailor the other. */}
      <div className="mt-8 grid items-stretch gap-0 border border-border sm:grid-cols-2">
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <h3 className="font-display text-[19px] leading-snug text-text">
            {OUTCOME.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-text-2">
            {OUTCOME.body}
          </p>
        </div>
        {/* Short on a phone so it never dominates; taller beside the text from
            sm up, where it has its own half and costs no vertical space. */}
        <div className="relative order-first h-[170px] w-full sm:order-none sm:h-auto sm:min-h-[220px]">
          <Image
            src="/marketing/story-tailoring.png"
            alt="A tailor working on a single piece"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
