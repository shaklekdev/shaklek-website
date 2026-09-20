"use client";

import { colors } from "@/data/colors";
import { FABRIC_OPTIONS, SELLABLE_FABRICS } from "@/data/fabrics";
import type { Fabric } from "@/data/designSpec";

export default function FabricColorPicker({
  fabric,
  color,
  onFabricChange,
  onColorChange,
}: {
  fabric: Fabric;
  color: string;
  onFabricChange: (fabric: Fabric) => void;
  onColorChange: (color: string) => void;
}) {
  // One sellable fabric today (linen), so this is a statement of what the
  // piece is made of rather than a choice. Rendering it as a two-button
  // toggle with one button dead would be a control that punishes the tap.
  // The moment a second fabric goes `available` in fabrics.ts it becomes a
  // real toggle again, with no change here.
  const single = SELLABLE_FABRICS.length === 1 ? SELLABLE_FABRICS[0] : null;
  const upcoming = FABRIC_OPTIONS.filter((f) => !f.available);

  // TWO ROWS, not one. "Organic cotton coming soon" made the right-hand block
  // two lines tall, and `items-center` then centred that whole block against a
  // single row of colour dots -- so the 100% linen box floated above the dots
  // instead of sitting level with them. The box now shares a row with the dots
  // and the note drops underneath the pair.
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {colors.map((c) => (
          <button
            key={c.name}
            aria-label={c.name}
            aria-pressed={c.name === color}
            onClick={() => onColorChange(c.name)}
            /* ⚠️ THE CHIP IS A PHOTOGRAPH OF THE CLOTH, not a flat colour.
               The hex stays as the background underneath it so the chip is
               never blank while the image loads, and so it still reads on a
               surface that cannot fetch one. Bigger than the old 24px dot,
               because a weave has to be visible to be worth showing. */
            className={`h-9 w-9 rounded-full border-2 bg-cover bg-center transition-all ${
              c.name === color ? "border-accent scale-110" : "border-transparent"
            }`}
            style={{ backgroundColor: c.hex, backgroundImage: `url(${c.swatch})` }}
          />
        ))}
      </div>

      {single ? (
        /* The fabric NAME now sits on the photograph itself -- see FABRIC_BADGE
           in CustomizeParameters.tsx. Reviewer, 2026-08-27: "100% linen is a
           big asset but it gets lost in the information, up in the top right."
           It was a bordered box competing with the colour dots for the same
           corner. Rendering it twice would be worse than rendering it badly. */
        null
      ) : (
        <div className="flex shrink-0 gap-1.5 border border-border-strong p-1">
          {SELLABLE_FABRICS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFabricChange(f.id)}
              aria-pressed={fabric === f.id}
              className={`px-3 py-1.5 text-xs transition-colors ${
                fabric === f.id ? "bg-text text-white" : "text-text-2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      </div>
      {/* ⚠️ THE SHADE DISCLAIMER, AND IT IS NOT BOILERPLATE. Founder,
          2026-09-20: refer people "to the actual fabric pictures for exact
          shades". The chips above ARE photographs of her cloth, so this line
          tells a customer that what they are looking at is the real thing and
          that a screen is the variable, not the linen. It matters because
          every GARMENT photograph in the catalogue is still rendered, so the
          dress in the picture and the chip beside it can disagree until those
          are renormalised -- see fabric-swatch-per-colour in OPEN.md. Until
          then this line is what makes the chip the reference, not the photo. */}
      <p className="mt-3 text-[11px] leading-relaxed text-text-3">
        The circles above are photographs of the actual linen. Colours shift
        from one screen to another — these are the true shades.
      </p>
      {/* ⚠️ NO "COMING SOON" LINE. Founder, 2026-09-14: "we need to remove the
          coming soon thing from everywhere, I still see it." This rendered
          "Organic cotton coming soon" off the switched-off entry in fabrics.ts,
          which advertised a fabric with no date, no quote and no commitment to
          buy it. The fabric entry STAYS switched off rather than deleted, per
          CLAUDE.md; what has gone is telling customers it is on its way. */}
    </div>
  );
}
