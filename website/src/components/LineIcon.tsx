/**
 * The site's small line icons: one stroke weight, one viewBox, no fills. Used
 * by the home Benefits tiles and by IncludedInPrice (product page, home rail,
 * checkout). Moved out of home/Benefits.tsx on 2026-11-12 so the "what the
 * price includes" block could reuse the set instead of growing a second one.
 *
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
 *
 * Added 2026-11-12 for the price block, same rules: a house (the fitting is at
 * her home), sliders (the customiser is the product), a parcel (delivery), a
 * needle and thread (the alteration is sewn, not exchanged), a draped shayla.
 */
export type LineIconName =
  | "sewing-machine"
  | "flax"
  | "pin"
  | "tag"
  | "home"
  | "sliders"
  | "parcel"
  | "needle"
  | "shayla";

export default function LineIcon({ name, size = 30 }: { name: LineIconName | string; size?: number }) {
  const common = {
    width: size,
    height: size,
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

  if (name === "home")
    return (
      <svg {...common}>
        {/* her front door: the fitting happens at home, not in a shop */}
        <path d="M3.5 11.5 12 4l8.5 7.5" />
        <path d="M5.8 9.8V20h12.4V9.8" />
        <path d="M10 20v-5.2h4V20" />
      </svg>
    );

  if (name === "sliders")
    return (
      <svg {...common}>
        {/* three sliders, three knobs: the customiser */}
        <path d="M4 7h9.3M16.7 7H20" />
        <circle cx="15" cy="7" r="1.7" />
        <path d="M4 12h2.3M9.7 12H20" />
        <circle cx="8" cy="12" r="1.7" />
        <path d="M4 17h7.3M14.7 17H20" />
        <circle cx="13" cy="17" r="1.7" />
      </svg>
    );

  if (name === "parcel")
    return (
      <svg {...common}>
        {/* a closed parcel seen from a corner */}
        <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4v-9Z" />
        <path d="M3.5 7.5 12 11.5l8.5-4" />
        <path d="M12 11.5v9" />
      </svg>
    );

  if (name === "needle")
    return (
      <svg {...common}>
        {/* a needle with its thread: the alteration is sewn */}
        <path d="M5 19 18.4 5.6" />
        <ellipse cx="17.2" cy="6.8" rx="1" ry="1.9" transform="rotate(45 17.2 6.8)" />
        <path d="M18.8 4.6c2.2.5 2.8 2.9 1.2 5" />
      </svg>
    );

  if (name === "shayla")
    return (
      <svg {...common}>
        {/* a shayla draped from the shoulders, one fold */}
        <path d="M5 4.5c4.7 1.3 9.3 1.3 14 0" />
        <path d="M5 4.5c2 3.2 3.4 6.6 3.4 10.5V20" />
        <path d="M19 4.5c-2 3.2-3.4 6.6-3.4 10.5V20" />
        <path d="M8.6 11.2c2.3.9 4.5.9 6.8 0" />
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
