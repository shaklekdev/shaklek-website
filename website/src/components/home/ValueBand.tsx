import Link from "next/link";
import { VALUES, POSITIONING } from "@/data/homeContent";

/**
 * Why this deserves to exist next to everything else on the market.
 *
 * Sits BELOW the products deliberately. A visitor who has scrolled past eight
 * garments is asking "why you and not the shop I already use", and that is the
 * question this answers. Putting it above the products would mean arguing with
 * someone who has not seen the clothes yet.
 */
export default function ValueBand() {
  return (
    <section className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <p className="font-display mx-auto max-w-xl text-center text-[19px] leading-relaxed text-text">
          {POSITIONING.line}{" "}
          <span className="text-gold">{POSITIONING.emphasis}</span>
        </p>

        <dl className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          {VALUES.map((p) => (
            <div key={p.k}>
              <dt className="font-display text-[16px] text-text">{p.k}</dt>
              <dd className="mt-2 text-[13px] leading-relaxed text-text-2">
                {p.v}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 text-center">
          {/* ⚠️ WAS /how-it-works, DELETED 2026-09-15: "we need to remove the
              how it works, it's too long repetitive, not good." The three
              steps live on the homepage and nowhere else now. This component
              is not rendered by any page today, but a dead link inside dead
              code is what gets revived by accident. */}
          <Link
            href="/catalog"
            className="text-[13px] text-text-2 underline underline-offset-4 hover:text-text"
          >
            See the collection
          </Link>
        </p>
      </div>
    </section>
  );
}
