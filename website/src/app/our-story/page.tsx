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
      className={`relative ${aspect} w-full overflow-hidden rounded-shaklek border border-dashed border-gold/40 bg-surface-2`}
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
    body: "Cotton or linen, always — nothing synthetic, sustainably sourced, and nothing that fights your skin.",
    caption: "Close-up — raw cotton or linen fiber, natural texture",
  },
  {
    title: "Tailoring for your shape",
    body: "Standard sizing or your exact measurements — cut for your body, not a size chart.",
    caption: "A tailor taking measurements, or a piece mid-construction",
  },
  {
    title: "An AI fashion assistant",
    body: "See the color that matches your tone and the fit that flatters your shape, before you commit to anything.",
    caption: "The color/fit assistant in use, on a real customer's screen",
  },
  {
    title: "No over-production",
    body: "Nothing is made until you order it. No stock, no waste — the most sustainable thing a clothing brand can do is not make what nobody asked for.",
    caption: "A single finished piece, not a warehouse rail of stock",
  },
  {
    title: "Fixed prices",
    body: "From AED 290, always. Healthy, sustainable, well-made clothing shouldn't be a luxury exception.",
    caption: "Clean product shot with the price clearly shown",
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
            You don&apos;t fit fashion.
            <br />
            Fashion fits you.
          </h1>
        </div>
      </ImagePlaceholder>

      <div className="mx-auto w-full max-w-2xl px-6 py-14">
        <p className="text-xs text-text-3">
          Shaklek means &ldquo;your shape&rdquo; — that&apos;s not a coincidence.
        </p>
        <p className="subtitle mt-3 max-w-md">
          Trendy fashion usually costs you something — your skin, your
          budget, your actual shape, or the planet it came from. We started
          Shaklek because we got tired of choosing.
        </p>
        <p className="subtitle mt-4 max-w-md">
          Every piece here starts as an idea, not a rack of stock waiting for
          someone your size to walk in. A real tailor makes it — one piece
          at a time, sustainably, for the person who ordered it. That comes
          down to five things:
        </p>
      </div>

      {/* Tenets — homogeneous, each with its own image */}
      <div className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-3">
          {tenets.map((t) => (
            <div key={t.title}>
              <ImagePlaceholder aspect="aspect-[4/3]" caption={t.caption} />
              <h2 className="mt-4 font-display text-lg text-gold">{t.title}</h2>
              <p className="mt-1 text-sm text-text-2">{t.body}</p>
            </div>
          ))}
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
