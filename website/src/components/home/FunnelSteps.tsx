import { STEPS, OUTCOME } from "@/data/homeContent";

/**
 * The funnel, stated plainly. This is the direct answer to the feedback that a
 * visitor "doesn't know what they're about to do" and "doesn't know the steps".
 *
 * Four steps because there are four. Naming three would read better and would
 * be a small lie about where the measurements come from.
 *
 * `dense` drops the descriptions and keeps only the numbered titles, for
 * layouts where the strip sits above the products and every pixel it takes is
 * a pixel of product pushed below the fold.
 */
export default function FunnelSteps({
  dense = false,
  heading,
}: {
  dense?: boolean;
  heading?: string;
}) {
  if (dense) {
    // Two rows of two on a phone, four columns from `sm` up.
    //
    // This replaced a single-line "01 → 02 → 03 → 04" ribbon. The ribbon was
    // the smallest thing that could sit above the products, but it could only
    // ever carry four titles, and "Make it yours" on its own does not tell a
    // first-time visitor anything -- it is the phrase that needed explaining.
    //
    // A phone gets the titles only, because vertical space there is the same
    // currency as a click. A wider screen has room going spare, so it gets the
    // sentence underneath as well. Same component, same words, no second block
    // further down the page repeating itself.
    return (
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-6xl px-6 py-5">
          <ol className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 sm:gap-6">
            {[...STEPS, OUTCOME].map((s, i) => (
              <li key={s.n} className="flex gap-2.5">
                {/* The outcome carries a word, not a number: the customer's
                    flow is three steps and the design page says so. */}
                <span
                  className={`font-display shrink-0 text-[13px] ${
                    i === STEPS.length ? "text-text-3" : "text-gold"
                  }`}
                >
                  {s.n}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13px] leading-snug font-medium text-text">
                    {s.title}
                  </h3>
                  <p className="mt-1 hidden text-[12px] leading-relaxed text-text-2 sm:block">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-12">
      {heading && (
        <h2 className="mb-6 text-lg text-text">{heading}</h2>
      )}
      <ol className="grid gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
        {[...STEPS, OUTCOME].map((s, i) => (
          <li key={s.n} className="flex gap-3 sm:flex-col sm:gap-2">
            <span
              className={`font-display shrink-0 text-lg ${
                i === STEPS.length ? "text-text-3" : "text-gold"
              }`}
            >
              {s.n}
            </span>
            <div>
              <h3 className="text-[15px] font-medium text-text">{s.title}</h3>
              <p className="mt-0.5 text-[13px] leading-snug text-text-2 sm:leading-relaxed">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
