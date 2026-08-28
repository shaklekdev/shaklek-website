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
/**
 * ⚠️ THESE ICONS MEAN SOMETHING. Do not swap them for whatever a library
 * offers under the same name.
 *
 * The three before these were a generic tag, a generic leaf and an abstract
 * hook, and the founder's note was that they are "trop standard" -- they read
 * as stock decoration, which is one of the things making the site look
 * machine-built. An icon that could sit on any shop says nothing about this
 * one.
 *
 * So: a sewing machine, because a solo tailor cutting one garment at a time is
 * the whole proposition and no stocked retailer can draw it; a price tag,
 * which is the one generic shape that is genuinely the right symbol here; and
 * a flax sprig, which is what linen is actually made from, rather than a leaf
 * standing in for "nature".
 */
function BenefitIcon({ name }: { name: string }) {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "sewing-machine")
    return (
      <svg {...common}>
        {/* bed, body, column, overhanging arm, needle, handwheel */}
        <path d="M2.5 20.5h19" />
        <path d="M4.5 20.5v-5.5h14v5.5" />
        <path d="M16 15V6.5H8.2" />
        <path d="M8.2 6.5v3.2" />
        <path d="M8.2 11.4v2.2" />
        <circle cx="18.2" cy="9.6" r="1.5" />
        <path d="M7 17.8h6" />
      </svg>
    );

  if (name === "flax")
    return (
      <svg {...common}>
        {/* a stem of flax: the plant linen is spun from */}
        <path d="M12 21.5V7" />
        <path d="M12 14.5c-2.6-.3-4-1.9-4.2-4.3 2.6.3 4 1.9 4.2 4.3Z" />
        <path d="M12 14.5c2.6-.3 4-1.9 4.2-4.3-2.6.3-4 1.9-4.2 4.3Z" />
        <path d="M12 10c-2-.5-3-1.9-3-3.8 2 .5 3 1.9 3 3.8Z" />
        <path d="M12 10c2-.5 3-1.9 3-3.8-2 .5-3 1.9-3 3.8Z" />
        <circle cx="12" cy="4.2" r="1.3" />
      </svg>
    );

  if (name === "pin")
    return (
      <svg {...common}>
        {/* A place marker. Generic, and deliberately so -- provenance is a
            place, and the same argument that makes a price tag right for price
            makes a pin right for here. A flag would be worse: it claims a
            nationality rather than where the garment was made. */}
        <path d="M12 21.5s7-6.1 7-11.1a7 7 0 1 0-14 0c0 5 7 11.1 7 11.1Z" />
        <circle cx="12" cy="10.2" r="2.6" />
      </svg>
    );

  // tag
  return (
    <svg {...common}>
      <path d="M3 12.5V4a1 1 0 0 1 1-1h8.5L21 11.5 12.5 20 3 12.5Z" />
      <circle cx="7.4" cy="7.4" r="1.25" />
    </svg>
  );
}

export default function Benefits() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16">
      {/* Named, because an unlabelled row of three claims under the catalogue
          reads as decoration. As a section with a question for a title it is
          answering something the customer is actually asking by that point. */}
      <h2 className="mb-6 text-lg text-text">Why choose us</h2>
      {/* BORDERED CARDS, three across, from the founder's mockup. As a bare
          list the three claims ran into the FAQ beneath them and read as more
          body copy; boxed, they read as three things rather than a paragraph,
          and each icon gets room to be seen at a size where it is legible.
          Stacks on a phone, where three columns would be unreadable. */}
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <li
            key={b.k}
            className="border border-border p-5 sm:p-6"
          >
            <span className="block text-gold">
              <BenefitIcon name={b.icon} />
            </span>
            <p className="font-display mt-4 text-[16px] text-text">{b.k}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-text-2">
              {b.v}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
