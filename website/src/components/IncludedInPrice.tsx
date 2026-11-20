import {
  INCLUDED_CHECKOUT_LINE,
  INCLUDED_HEADING,
  INCLUDED_HOME_CHIPS,
  INCLUDED_HOME_FOOTNOTE,
  INCLUDED_HOME_LEAD,
  INCLUDED_PRODUCT_LINES,
} from "@/data/included";

/**
 * "All included in the price", drawn four ways from one copy source
 * (data/included.ts).
 *
 * TEXT ONLY, NO ICONS. Founder, 2026-11-12, on the first version with line
 * icons and pill chips: "those emojis look cheap not high end brand". The
 * register is a luxury house's: small tracked caps, hairline rules, words.
 * And "one price is not clear", so the lead is "All included".
 *
 * - `card`  product page, under the price and Add to cart: tracked-caps
 *           heading, then the lines separated by hairlines.
 * - `sheet` product page on PHONES, first section of the details sheet
 *           (DetailsSheet): the same lines as `card`, always open, no box.
 * - `chips` home rail, under the heading: "All included" then four words
 *           separated by thin dots. Full sentence kept for screen readers.
 * - `line`  checkout, under the order lines: one quiet line between hairlines.
 */
export default function IncludedInPrice({
  variant,
}: {
  variant: "card" | "sheet" | "chips" | "line";
  // Still accepted (callers pass it) though no line depends on it since the
  // shayla line moved out, 2026-11-13.
  category?: string | null;
}) {
  if (variant === "card") {
    // FOLDED, like Product information and the home's "All included +"
    // (founder, 2026-11-13). Same box, same + / − as the other disclosures on
    // this page, so it reads as one family rather than a promotional card.
    return (
      // 2026-11-20 (first pass): below lg this and Product information were
      // made ONE two-row accordion, same 44px row, same 13px, same + sign
      // (founder: "everything is weird").
      // 2026-11-20 (second pass, same day): the card is DESKTOP ONLY now. On
      // phones the caller hides it and the `sheet` variant below shows the
      // same lines, open, at the top of the details sheet. From lg: unchanged.
      <details className="group mt-3 border border-border-strong lg:mt-5">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="text-[13px] text-text">{INCLUDED_HEADING}</span>
          <span aria-hidden="true" className="shrink-0 text-lg leading-none text-text-3 group-open:hidden">
            +
          </span>
          <span aria-hidden="true" className="hidden shrink-0 text-lg leading-none text-text-3 group-open:block">
            &minus;
          </span>
        </summary>
        <ul className="divide-y divide-border border-t border-border">
          {INCLUDED_PRODUCT_LINES.map((l) => (
            <li key={l.key} className="px-4 py-2.5 text-[13px] text-text-2">
              {l.label}
            </li>
          ))}
        </ul>
        {/* No "*In Dubai" footnote any more: the lines say it themselves
            since 2026-11-20 (data/included.ts). */}
      </details>
    );
  }

  if (variant === "sheet") {
    // PHONES, inside the details sheet. ALWAYS VISIBLE, NOT FOLDED (founder
    // 2026-11-20): she opened the sheet from "All included ⓘ" to read exactly
    // this, so a second tap to unfold it would be the clutter she asked to
    // lose. Words only, hairlines, same register as the card.
    return (
      // No rule under the list: "After you order", which follows it in the
      // sheet, draws its own, and two hairlines 16px apart read as a mistake.
      <section className="pb-1 pt-1">
        <p className="text-[13px] font-medium text-text">{INCLUDED_HEADING}</p>
        <ul className="mt-2 divide-y divide-border border-t border-border">
          {INCLUDED_PRODUCT_LINES.map((l) => (
            <li key={l.key} className="py-2.5 text-[13px] text-text-2">
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
