import { Fragment } from "react";
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
    return (
      <div className="mt-3">
        <p className="sr-only">{INCLUDED_HOME_LINE}</p>
        <p
          aria-hidden="true"
          className="text-[11px] uppercase leading-relaxed tracking-[0.18em] text-text-2"
        >
          {/* The dot travels with the word before it, so a wrapped line never
              starts with one. */}
          <span className="whitespace-nowrap">
            <span className="font-medium text-text">{INCLUDED_HOME_LEAD}</span>
            <span className="ml-2 text-gold">·</span>
          </span>
          {INCLUDED_HOME_CHIPS.map((c, i) => (
            <Fragment key={c.key}>
              {" "}
              <span className="whitespace-nowrap">
                {c.label}
                {i < INCLUDED_HOME_CHIPS.length - 1 && <span className="ml-2 text-gold">·</span>}
              </span>
            </Fragment>
          ))}
        </p>
        <p aria-hidden="true" className="mt-1 text-[10px] tracking-[0.1em] text-text-3">
          {INCLUDED_HOME_FOOTNOTE}
        </p>
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
