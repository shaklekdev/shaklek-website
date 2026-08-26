"use client";

import type { DesignSpec } from "@/data/designSpec";

const NOTE_EXAMPLES: Record<string, string> = {
  Shirt: "e.g. a wider collar, no chest pocket, sleeves a little shorter",
  Pants: "e.g. deeper pockets, a higher waist, no turn-up on the hem",
  Skirt: "e.g. a longer hem, a side slit, a flatter waistband",
  Dress: "e.g. a higher neckline, a looser waist, longer sleeves",
};

/**
 * The free-text request, step three of the founder's three.
 *
 * It used to sit inside CustomizeParameters, between the sliders and the
 * fit -- so an optional field stood between the customer and the decision they
 * came to make. It now renders after the size step, which is the order she
 * asked for: options, then size, then the optional detail, then add to cart.
 *
 * This is the escape hatch for everything the sliders cannot pre-render, and
 * unlike the measurement notes in SizePicker it is offered in both size modes.
 * It reaches the tailor's tech pack verbatim via spec.freeformNotes.
 */
export default function DetailField({
  spec,
  category,
  onSpecChange,
}: {
  spec: DesignSpec;
  category: string;
  onSpecChange: (spec: DesignSpec) => void;
}) {
  return (
    <div className="mt-8">
      <label
        htmlFor="customization-notes"
        className="mb-1 block text-lg text-text"
      >
        Add a detail <span className="text-text-3">(optional)</span>
      </label>
      <textarea
        id="customization-notes"
        value={spec.freeformNotes}
        onChange={(e) =>
          onSpecChange({ ...spec, freeformNotes: e.target.value })
        }
        rows={2}
        maxLength={500}
        placeholder={NOTE_EXAMPLES[category] ?? ""}
        className="w-full border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
      />

    </div>
  );
}
