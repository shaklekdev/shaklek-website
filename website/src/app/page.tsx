import Link from "next/link";
import Header from "@/components/Header";
import CatalogCard from "@/components/CatalogCard";
import { catalog } from "@/data/catalog";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />

      <section className="mx-auto w-full max-w-3xl px-6 pt-14 pb-8 text-center">
        <h1 className="text-[28px] leading-tight text-text">
          Your look,
          <br />
          your way.
        </h1>
        <p className="subtitle mx-auto mt-3 max-w-sm">
          Every piece is made to order — no stock, cut for you in cotton or
          linen, at a fixed price.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-wide text-text-3 uppercase">Step 1</p>
            <h2 className="mt-1 text-lg text-text">Start with an idea</h2>
          </div>
          <p className="hidden text-[13px] text-text-3 sm:block">
            From AED 290 · Fixed prices · 7 days
          </p>
        </div>
      </section>

      {/* Carousel — edge fade hints there's more to scroll */}
      <section className="relative w-full">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-3 sm:px-[max(1.5rem,calc((100vw-72rem)/2))]">
          {catalog.map((item) => (
            <div key={item.slug} className="w-[220px] shrink-0 snap-start sm:w-[248px]">
              <CatalogCard item={item} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-bg to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg to-transparent sm:hidden" />
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pt-6 pb-20">
        <Link
          href="/upload"
          className="flex items-center justify-between gap-4 rounded-shaklek-sm border border-border-strong px-6 py-5 transition-colors hover:border-accent"
        >
          <div className="flex items-center gap-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 text-text-3">
              <path
                d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-text">Don&apos;t see what you want?</p>
              <p className="text-xs text-text-3">
                Upload your own photo, screenshot, or sketch — same fixed prices.
              </p>
            </div>
          </div>
          <span className="text-sm text-text-2">→</span>
        </Link>
      </section>
    </div>
  );
}
