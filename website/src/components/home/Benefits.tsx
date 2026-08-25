import { BENEFITS } from "@/data/homeContent";

/**
 * The three reasons to buy here, placed AFTER the catalogue.
 *
 * They used to sit between the steps and the clothes, which meant a phone
 * visitor read three explanations, then three more claims, before reaching a
 * single garment -- the first card did not appear until y=1864. Founder's
 * call: these belong after the catalogue, where they answer "why here" for
 * someone who has just looked at the pieces, rather than delaying them.
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

export default function Benefits() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16">
      <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
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
