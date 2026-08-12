import Header from "@/components/Header";
import Link from "next/link";

const PlaceholderIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gold/70">
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
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4">
        <PlaceholderIcon />
        <p className="max-w-[32ch] text-[11px] leading-snug text-text-3">{caption}</p>
      </div>
    </div>
  );
}

const materials = [
  {
    name: "Cotton",
    body: "Gentle, breathable, and durable enough to hold its shape wash after wash — the fabric your skin already knows.",
  },
  {
    name: "Linen",
    body: "Naturally cooling, made from the flax plant, and softens beautifully — built for exactly this climate.",
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
            Shaklek means &ldquo;your shape.&rdquo;
            <br />
            That&apos;s the whole idea.
          </h1>
        </div>
      </ImagePlaceholder>

      <div className="mx-auto w-full max-w-2xl px-6 py-14">
        <p className="subtitle max-w-md">
          Trendy fashion usually costs you something — your skin, your budget, or your
          actual shape. We started Shaklek because we got tired of choosing.
        </p>
        <p className="subtitle mt-4 max-w-md">
          Every piece here starts as an idea, not a rack of stock waiting for someone
          your size to walk in. You choose the material your skin actually loves, the
          color that suits your tone, and a fit that&apos;s either standard or cut to
          your exact measurements. Then a real tailor makes it — one piece at a time,
          for the person who ordered it.
        </p>
        <p className="subtitle mt-4 max-w-md">
          There&apos;s no stock here. Nothing is made until someone chooses it. That&apos;s
          slower than a warehouse, and it&apos;s the entire point: your skin matters to
          us, your shape matters, and your uniqueness isn&apos;t a problem a size chart
          needs to solve.
        </p>
      </div>

      {/* Alternating block: materials */}
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 pb-14 sm:grid-cols-2 sm:items-center">
        <ImagePlaceholder caption="Close-up — fabric texture, hands touching raw cotton or linen" />
        <div>
          <h2 className="font-display text-xl text-gold">Why these materials</h2>
          <p className="subtitle mt-3">
            We keep the fabric choice deliberately narrow — cotton or linen, nothing
            else. One honest material is what lets a single tailor make your piece
            well, and what keeps it gentle on your skin and light on the place it
            came from.
          </p>
          <div className="mt-6 space-y-5">
            {materials.map((m) => (
              <div key={m.name} className="border-t border-border pt-4">
                <h3 className="font-display text-base text-text">{m.name}</h3>
                <p className="mt-1 text-sm text-text-2">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternating block reversed: made to order */}
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 pb-14 sm:grid-cols-2 sm:items-center">
        <div className="sm:order-2">
          <ImagePlaceholder caption="A tailor at work — cutting or sewing a piece to order" />
        </div>
        <div className="sm:order-1">
          <h2 className="font-display text-xl text-gold">Made for you, not stocked</h2>
          <p className="subtitle mt-3">
            Everything you see is a starting point, not a finished product sitting in
            a warehouse. Your AI-assisted customization — the color, the cut, the
            small details you asked for — is what we commit to making. Nothing is
            pre-made, nothing is guessed at your size.
          </p>
          <p className="subtitle mt-3">
            It takes about 7 days from confirmation to delivery. That&apos;s the cost
            of made-to-order — and why it&apos;s actually yours when it arrives.
          </p>
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
