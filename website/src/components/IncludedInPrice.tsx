import {
  INCLUDED_CHECKOUT_LINE,
  INCLUDED_HEADING,
  INCLUDED_HOME_CHIPS,
  INCLUDED_HOME_FOOTNOTE,
  INCLUDED_HOME_LEAD,
  includedLines,
} from "@/data/included";

/**
 * "All included in the price", drawn three ways from one copy source
 * (data/included.ts).
 *
 * TEXT ONLY, NO ICONS. Founder, 2026-11-12, on the first version with line
 * icons and pill chips: "those emojis look cheap not high end brand". The
 * register is a luxury house's: small tracked caps, hairline rules, words.
 * And "one price is not clear", so the lead is "All included".
 *
 * - `card`  product page, under the price and Add to cart: tracked-caps
 *           heading, then the lines separated by hairlines.
 * - `chips` home rail, under the heading: "All included" then four words
 *           separated by thin dots. Full sentence kept for screen readers.
 * - `line`  checkout, under the order lines: one quiet line between hairlines.
 */
export default function IncludedInPrice({
  variant,
  category,
}: {
  variant: "card" | "chips" | "line";
  category?: string | null;
}) {
  if (variant === "card") {
    return (
      <section aria-labelledby="included-in-price" className="mt-6 border-t border-border pt-5">
        {/* A <p>, not an <h2>: globals.css styles every h2 in the display
            font at section size, which turned this into a 2-line banner. */}
        <p
          id="included-in-price"
          className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-text"
        >
          {INCLUDED_HEADING}
        </p>
        <ul className="mt-3 divide-y divide-border">
          {includedLines(category).map((l) => (
            <li key={l.key} className="py-2.5 text-[13px] leading-snug text-text-2">
              {l.label}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (variant === "chips") {
    // Home rail, right of the heading: "All included +" only; tapping unfolds
    // the list (founder, 2026-11-13: "keep the all included with a + that
    // unfolds and shows all options" -- too much text above the clothes).
    // <details>, so it works without JavaScript and is keyboard-accessible.
    return (
      // The list drops DOWN over the top of the cards (absolute) rather than
      // widening this column, so the title beside it never re-wraps on open.
      <details className="group relative z-10 shrink-0 text-right">
        <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text sm:tracking-[0.18em] [&::-webkit-details-marker]:hidden">
          {INCLUDED_HOME_LEAD}
          <span aria-hidden="true" className="text-base font-light leading-none text-gold transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="absolute right-0 top-full w-max border border-border bg-bg px-4 py-3 shadow-sm">
          <ul className="space-y-0.5 text-[10px] uppercase leading-relaxed tracking-[0.12em] text-text-2 sm:tracking-[0.14em]">
            {INCLUDED_HOME_CHIPS.map((c) => (
              <li key={c.key}>{c.label}</li>
            ))}
          </ul>
          <p className="mt-1 text-[10px] tracking-[0.1em] text-text-3">{INCLUDED_HOME_FOOTNOTE}</p>
        </div>
      </details>
    );
  }

  // line
  return (
    <p className="mt-4 border-y border-border py-3 text-xs leading-relaxed text-text-2">
      {INCLUDED_CHECKOUT_LINE}
    </p>
  );
}
