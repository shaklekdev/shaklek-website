import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our story",
  description:
    "Why Shaklek makes clothes to order: fewer pieces, cut properly, in sustainable cotton and linen — made in the UAE.",
  path: "/our-story",
  images: [
    {
      url: "/marketing/story-hero.png",
      width: 1584,
      height: 672,
      alt: "Shaklek tailoring studio.",
    },
  ],
});

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
  src,
  sizes,
  children,
}: {
  caption: string;
  aspect?: string;
  src?: string;
  sizes?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden ${src ? "bg-surface-2" : "border border-dashed border-gold/40 bg-surface-2"}`}
    >
      {src && (
        <Image src={src} alt={caption} fill sizes={sizes ?? "(min-width: 640px) 50vw, 100vw"} className="object-cover" />
      )}
      {children}
      {!src && (
        <div className="absolute inset-x-0 bottom-0 flex items-start gap-2 p-3">
          <PlaceholderIcon />
          <p className="max-w-[28ch] text-[11px] leading-snug text-text-3">{caption}</p>
        </div>
      )}
    </div>
  );
}

const tenetGroups = [
  {
    caption: "A finished piece: natural fabric texture, a personal detail visible",
    image: "/marketing/story-materials-v2.png",
    items: [
      {
        title: "Materials that respect your skin",
        body: "Cotton or linen, always, nothing synthetic. Breathable fabric isn't just more comfortable, it matters for your skin's health. Tight, non-breathable synthetics trap heat and moisture against the body, and some are linked to disrupting hormones over long, close contact. We'd rather you not have to think about that.",
      },
      {
        title: "Pieces customised by you, for you",
        body: "Those lovely shirts you wished had longer sleeves. Those comfy pants you wish had pockets. We believe in uniqueness, and in making fashion accessible to everyone, so the things you'd normally just live with, you can actually change.",
      },
    ],
  },
  {
    caption: "A tailor at work on a single piece, price tag visible",
    image: "/marketing/story-tailoring.png",
    items: [
      {
        title: "Tailoring for your shape",
        body: "Standard sizing or your exact measurements, cut for your body, not a size chart. Nothing is made until you order it, and we use AI to plan exactly what's needed instead of guessing at demand, so there's no stock sitting on a shelf and no waste. The most sustainable thing a clothing brand can do is not make what nobody asked for.",
      },
      {
        title: "Fixed prices",
        body: "We committed to making sustainable and trendy fashion accessible to everyone. You customise your pieces, the price stays the same per piece type either way.",
      },
    ],
  },
];

export default function OurStoryPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />

      {/* Hero */}
      <div className="relative h-[52vh] max-h-[440px] min-h-[320px] w-full overflow-hidden">
        <Image
          src="/marketing/story-hero.png"
          alt="A Shaklek piece worn outdoors, natural light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-10 text-center">
          {/* The hero carries the slogan only. The page title moved below it:
              a floating "Our story" chip over the photograph read as a stray
              button rather than a heading. */}
          <p className="max-w-lg font-display text-[30px] leading-tight text-text drop-shadow-[0_1px_12px_rgba(255,255,255,0.8)]">
            Your look,
            <br />
            your way.
          </p>
          {/* The founder's note is the most personal thing on the site and it
              sits at the very bottom. This is the shortcut to it. */}
          <a
            href="#from-our-founder"
            className="mt-5 inline-block border-b border-text/30 pb-0.5 text-[13px] text-text transition-colors hover:border-text"
          >
            From our founder ↓
          </a>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 py-14">
        <h1 className="mb-5 text-[26px] text-text">Our story</h1>
        <p className="text-xs text-text-3">
          Shaklek means your way in Arabic: your vision, your style, your
          shape, your skin.
        </p>
        <p className="subtitle mt-3 max-w-md">
          We make elegant fashion essentials, not fast trends. Pieces
          customizable to your taste, friendly to your skin, and shaped to
          your body, not the other way around.
        </p>
        <p className="subtitle mt-4 max-w-md">
          Every piece here starts as an idea, not a rack of stock waiting for
          someone your size to walk in. A real tailor makes it, one piece at
          a time, sustainably, for the person who ordered it. That comes down
          to four things:
        </p>
      </div>

      {/* Tenets — grouped by theme, one image per pair, alternating sides */}
      <div className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="flex flex-col gap-14 sm:gap-16">
          {tenetGroups.map((group, i) => (
            <div
              key={group.caption}
              className={`flex flex-col items-center gap-8 sm:gap-14 ${
                i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"
              }`}
            >
              <div className="w-full sm:w-1/2">
                <ImagePlaceholder aspect="aspect-[4/5]" caption={group.caption} src={group.image} />
              </div>
              <div className="w-full space-y-8 sm:w-1/2">
                {group.items.map((t) => (
                  <div key={t.title}>
                    <h2 className="font-display text-xl text-gold">{t.title}</h2>
                    <span
                      className="mt-2 block h-px w-8 bg-gold"
                      aria-hidden="true"
                    />
                    <p className="mt-3 max-w-sm text-justify text-[14px] leading-relaxed text-text-2 hyphens-auto">
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder's note. No portrait: an empty dashed box reads as an
          unfinished page, and the words carry this section on their own. */}
      <div id="from-our-founder" className="mx-auto w-full max-w-2xl px-6 pb-16">
        <div className="border-t border-border pt-14">
          <p className="text-xs tracking-wide text-text-3 uppercase">
            From our founder
          </p>
          <div className="mt-6">
            <div className="space-y-4 text-justify text-[15px] leading-relaxed text-text-2 hyphens-auto">
              <p>
                I spent more than half my life trying to understand my own
                skin. Endometriosis, acne, endocrine disruptors, and a long
                journey of changing everything that touched my body, day and
                night. The clothes I wore eight hours at work, then sixteen
                more after that, couldn&apos;t possibly be neutral.
              </p>
              <p>
                I still wanted to wear something trendy, classy, put together.
                And once I actually find those pieces, they&apos;re either too
                expensive, not quite my taste, or not my fit.
              </p>
              <p>
                I&apos;m a tech girl who happens to love fashion, and I kept
                asking myself: why couldn&apos;t AI solve this, for me and for
                everyone like me?
              </p>
              <p>
                Shaklek means &ldquo;your way&rdquo; in Arabic. Your look, your
                vision, simply you. I wanted customization for our taste and
                shape, because we&apos;re all different. On Shaklek, you can
                customize the same shirt in 288 different ways, the same
                trousers in 576. That&apos;s what I built.
              </p>
              <p>
                I wanted this to be the personal wardrobe of everyone who
                believes what I believe: less overproduction, fewer materials
                that can harm our health, more comfort.
              </p>
              <p>
                If you have an idea or feedback to improve Shaklek, please
                reach out. This is not just a brand — it&apos;s your brand.
              </p>
              <p className="pt-1 text-sm font-medium text-text">
                Nada, founder of Shaklek
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Closing */}
      <div className="mx-auto w-full max-w-2xl px-6 pb-20">
        <div className="rounded-shaklek-sm border border-gold/30 bg-gold/10 p-5">
          <p className="text-sm text-text">
            <strong>From AED 390, fixed.</strong> Accessible by design, not
            an afterthought. Made-to-order shouldn&apos;t mean a luxury
            markup.
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
