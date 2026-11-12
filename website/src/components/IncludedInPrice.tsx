import LineIcon from "@/components/LineIcon";
import {
  INCLUDED_CHECKOUT_LINE,
  INCLUDED_HEADING,
  INCLUDED_HOME_CHIPS,
  INCLUDED_HOME_LEAD,
  INCLUDED_HOME_LINE,
  includedLines,
} from "@/data/included";

/**
 * "The price includes everything", drawn three ways from one copy source
 * (data/included.ts). Founder, 2026-11-12: "I'm expecting you to put this info
 * nicely" -- so a designed block, not a bullet list: the Benefits tile icons,
 * the display font for the heading, the site's border and surface tokens.
 *
 * - `card`  product page, under the price and Add to cart. Two columns from sm,
 *           one on a phone, one icon per line.
 * - `chips` home rail, under the heading: "One price." and four icon chips.
 *           The full sentence is kept for screen readers so what is read aloud
 *           is the marketing-cleared line, not four fragments.
 * - `line`  checkout, under the order lines: one quiet row with the flax icon.
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
      <section
        aria-labelledby="included-in-price"
        className="mt-5 rounded-shaklek-sm border border-border bg-surface px-5 py-5 sm:px-6"
      >
        <h2
          id="included-in-price"
          className="font-display text-[19px] leading-tight tracking-normal text-text"
        >
          {INCLUDED_HEADING}
        </h2>
        <ul className="mt-4 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
          {includedLines(category).map((l) => (
            <li key={l.label} className="flex items-start gap-3">
              <span className="mt-px shrink-0 text-gold">
                <LineIcon name={l.icon} size={20} />
              </span>
              <span className="text-[13px] leading-snug text-text-2">{l.label}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (variant === "chips") {
    return (
      <div className="mt-4">
        <p className="sr-only">{INCLUDED_HOME_LINE}</p>
        <div aria-hidden="true" className="flex flex-wrap items-center gap-2">
          <span className="font-display text-[17px] leading-none text-text">{INCLUDED_HOME_LEAD}</span>
          {INCLUDED_HOME_CHIPS.map((c) => (
            <span
              key={c.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] leading-none text-text-2"
            >
              <span className="text-gold">
                <LineIcon name={c.icon} size={14} />
              </span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // line
  return (
    <p className="mt-3 flex items-start gap-2.5 rounded-shaklek-sm bg-surface-2 px-4 py-3 text-xs leading-relaxed text-text-2">
      <span className="mt-px shrink-0 text-gold">
        <LineIcon name="flax" size={16} />
      </span>
      {INCLUDED_CHECKOUT_LINE}
    </p>
  );
}
