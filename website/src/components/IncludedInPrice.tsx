import {
  INCLUDED_CHECKOUT_LINE,
  INCLUDED_HEADING,
  INCLUDED_HOME_CHIPS,
  INCLUDED_HOME_FOOTNOTE,
  INCLUDED_HOME_LEAD,
  INCLUDED_HOME_LINE,
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
    // Home rail, right of the heading: "All included" then one item per line,
    // right-aligned (founder, 2026-11-12: "put all included on the right side
    // with the options below").
    return (
      <div className="shrink-0 text-right">
        <p className="sr-only">{INCLUDED_HOME_LINE}</p>
        <div aria-hidden="true">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-text">
            {INCLUDED_HOME_LEAD}
          </p>
          <ul className="mt-1.5 space-y-0.5 text-[10px] uppercase leading-relaxed tracking-[0.14em] text-text-2">
            {INCLUDED_HOME_CHIPS.map((c) => (
              <li key={c.key}>{c.label}</li>
            ))}
          </ul>
          <p className="mt-1 text-[10px] tracking-[0.1em] text-text-3">{INCLUDED_HOME_FOOTNOTE}</p>
        </div>
      </div>
    );
  }

  // line
  return (
    <p className="mt-4 border-y border-border py-3 text-xs leading-relaxed text-text-2">
      {INCLUDED_CHECKOUT_LINE}
    </p>
  );
}
