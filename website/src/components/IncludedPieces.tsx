import Image from "next/image";
import type { IncludedPiece } from "@/data/catalog";

// What comes with the piece, in the colour she has picked. Every abaya is sold
// with a matching shayla (catalog.ts, includedWith) and the page has to say so
// next to the colour choice, because the shayla follows that choice.
//
// ⚠️ A COLOUR WITH NO SHAYLA PHOTO SHOWS NO PHOTO, never another colour's
// picture: showing ivory while she has picked navy is the mis-selling problem
// fabric-swatch-per-colour exists to prevent. The words still render.
export default function IncludedPieces({
  pieces,
  color,
  heading,
  line,
}: {
  pieces: IncludedPiece[];
  color: string;
  heading: string;
  line: string;
}) {
  if (!pieces.length) return null;
  return (
    <div className="mt-4 space-y-2">
      {pieces.map((p) => {
        const src = p.images[color];
        return (
          <div key={p.name} className="flex items-center gap-3 border border-border p-2.5">
            {src ? (
              <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-bg-2">
                <Image src={src} alt={`${p.name} in ${color}`} fill sizes="48px" className="object-cover" />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-xs font-medium text-text">{heading}</p>
              <p className="text-[11px] leading-snug text-text-2">{line}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
