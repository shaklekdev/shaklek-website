import Header from "@/components/Header";
import Link from "next/link";

const PlaceholderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gold/70">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 17l5-5 3.5 3.5L16 12l4 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function ImagePlaceholder({
  caption,
  aspect = "aspect-[4/5]",
  children,
}: {
  caption: string;
  aspect?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden border border-dashed border-gold/40 bg-surface-2`}
    >
      {children}
      <div className="absolute inset-x-0 bottom-0 flex items-start gap-2 p-3">
        <PlaceholderIcon />
        <p className="max-w-[28ch] text-[11px] leading-snug text-text-3">{caption}</p>
      </div>
    </div>
  );
}

const tenets = [
  {
    title: "Materials that respect your skin",
    body: "Cotton or linen, always — nothing synthetic. Breathable fabric isn't just more comfortable, it matters for your skin's health: tight, non-breathable synthetics trap heat and moisture against the body, and some are linked to disrupting hormones over long, close contact. We'd rather you not have to think about that.",
    caption: "Close-up — raw cotton or linen fiber, natural texture",
  },
  {
    title: "Pieces customised by you, for you",
    body: "Those lovely shirts you wished had longer sleeves. Those comfy pants you wish had pockets. We believe in uniqueness, and in making fashion accessible to everyone — so the things you'd normally just live with, you can actually change.",
    caption: "A customer's own notes next to their finished, customized piece",
  },
  {
    title: "Tailoring for your shape",
    body: "Standard sizing or your exact measurements — cut for your body, not a size chart. And because nothing is made until you order it, there's no stock sitting on a shelf and no overproduction. The most sustainable thing a clothing brand can do is not make what nobody asked for.",
    caption: "A tailor taking measurements, or a piece mid-construction",
  },
  {
    title: "Fixed prices",
    body: "We committed to making sustainable and trendy fashion accessible to everyone. You customise your pieces — the price stays the same per piece type either way.",
    caption: "Clean product shot with the price clearly shown",
  },
  {
    title: "AI for good",
    body: "We use AI to make better decisions for the planet and your skin — lower-impact fabrics, cutting exactly what's needed instead of guessing at demand, keeping waste out of the process from the start. Technology, pointed at something that actually matters.",
    caption: "Something evoking AI + sustainability — subtle, not literal",
  },
];

export default function OurStoryPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />

      {/* Hero */}
      <ImagePlaceholder
        aspect="aspect-auto"
        caption="Full-bleed photography — a Shaklek piece worn outdoors, natural light"
      >
        <div className="flex h-[52vh] max-h-[440px] min-h-[320px] flex-col items-center justify-center px-6 pb-10 text-center">
          <p className="rounded-full bg-white/90 px-3 py-1 text-[11px] tracking-wide text-text-3 uppercase backdrop-blur-sm">
            Our story
          </p>
          <h1 className="mt-4 max-w-lg text-[30px] leading-tight text-text">
            Your look,
            <br />
            your way.
          </h1>
        </div>
      </ImagePlaceholder>

      <div className="mx-auto w-full max-w-2xl px-6 py-14">
        <p className="text-xs text-text-3">
          Shaklek means your way in Arabic — your vision, your style, your
          shape, your skin.
        </p>
        <p className="subtitle mt-3 max-w-md">
          We make elegant fashion essentials, not fast trends: pieces
          customizable to your taste, friendly to your skin, and shaped to
          your body — not the other way around.
        </p>
        <p className="subtitle mt-4 max-w-md">
          Every piece here starts as an idea, not a rack of stock waiting for
          someone your size to walk in. A real tailor makes it — one piece
          at a time, sustainably, for the person who ordered it. That comes
          down to five things:
        </p>
      </div>

      {/* Tenets — compact grid, scannable at a glance */}
      <div className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {tenets.map((t) => (
            <div key={t.title}>
              <ImagePlaceholder aspect="aspect-square" caption={t.caption} />
              <h2 className="mt-4 font-display text-xl text-gold">{t.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-text-2">
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Founder's note */}
      <div className="mx-auto w-full max-w-2xl px-6 pb-16">
        <div className="border-t border-border pt-14">
          <p className="text-xs tracking-wide text-text-3 uppercase">
            From our founder
          </p>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
            <div className="flex aspect-square w-28 shrink-0 items-center justify-center border border-dashed border-gold/40 bg-surface-2 text-center sm:w-32">
              <p className="px-2 text-[10px] leading-snug text-text-3">
                Portrait — Nada, founder of Shaklek
              </p>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-text-2">
              <p>
                I spent more than half my life trying to understand my own
                skin — endometriosis, acne, endocrine disruptors, and a long
                journey of changing everything that touched my body, day and
                night. The clothes I wore eight hours at work, then sixteen
                more after that, couldn&apos;t possibly be neutral.
              </p>
              <p>
                I still wanted to wear something trendy, classy, put
                together — without paying for it in money or in my skin. And
                once you actually find those pieces, they&apos;re either too
                expensive, not quite your taste, or not your size.
              </p>
              <p>
                I&apos;m a tech girl who happens to love fashion, and I kept
                asking myself: why couldn&apos;t AI solve this — for me, and
                for everyone like me?
              </p>
              <p>
                Shaklek means &ldquo;your way&rdquo; in Arabic — your look,
                your vision, simply you. I wanted prices everyone can afford,
                and customization for everyone, because we&apos;re all
                different: the same pair of trousers can be worn 144
                different ways, a shirt 255 more. That&apos;s what I built.
              </p>
              <p>
                I wanted this to be the personal wardrobe of everyone who
                believes what I believe: less overproduction, fewer
                materials that can harm our health, more comfort.
              </p>
              <p className="pt-1 text-sm font-medium text-text">
                — Nada, founder of Shaklek
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Closing */}
      <div className="mx-auto w-full max-w-2xl px-6 pb-20">
        <div className="rounded-shaklek-sm border border-gold/30 bg-gold/10 p-5">
          <p className="text-sm text-text">
            <strong>From AED 290, fixed.</strong> Accessible by design, not an
            afterthought — made-to-order shouldn&apos;t mean a luxury markup.
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm text-white"
        >
          Start designing
        </Link>
      </div>
    </div>
  );
}
