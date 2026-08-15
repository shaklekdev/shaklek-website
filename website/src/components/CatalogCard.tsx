import Link from "next/link";
import type { CatalogItem } from "@/data/catalog";

export default function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <Link
      href={`/design/${item.slug}`}
      className="group block overflow-hidden rounded-shaklek-sm border border-border bg-card shadow-[var(--shadow)] transition-all hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5"
    >
      <div
        className="relative aspect-[3/4] w-full"
        style={
          item.image
            ? undefined
            : {
                background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
              }
        }
      >
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
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
        <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/92 px-3 py-2 backdrop-blur-sm">
          <p className="text-[13px] font-medium text-text">{item.name}</p>
          <p className="text-xs text-text-2">
            AED {item.price} · {item.descriptor}
          </p>
        </div>
      </div>
    </Link>
  );
}
