import Link from "next/link";
import Image from "next/image";
import type { CatalogItem } from "@/data/catalog";

export default function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <Link href={`/design/${item.slug}`} className="group block">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-shaklek-sm bg-card"
        style={
          item.image
            ? undefined
            : {
                background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
              }
        }
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 640px) 248px, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        {item.badge && (
          <span className="absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 text-[9px] font-medium tracking-wide text-white">
            {item.badge}
          </span>
        )}
        {item.dressTier === "elaborate" && (
          <span className="absolute top-3 left-3 rounded-full bg-gold px-2.5 py-1 text-[9px] font-medium tracking-wide text-white">
            ELABORATE
          </span>
        )}
      </div>
      <div className="mt-4 text-center">
        <p className="font-display text-[15px] text-text">{item.name}</p>
        <p className="mt-1 text-[11px] tracking-wide text-text-3 uppercase">
          {item.descriptor}
        </p>
        <p className="mt-1.5 text-xs text-text-2">AED {item.price}</p>
      </div>
    </Link>
  );
}
