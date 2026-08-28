import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { renderParamsForCategory } from "@/data/parameterSliders";
import { colors, sizes } from "@/data/colors";

export const metadata: Metadata = pageMetadata({
  title: "Our story",
  description:
    "Why Shaklek makes clothes to order: fewer pieces, cut properly, in 100% linen, made in the UAE.",
  path: "/our-story",
  images: [
    {
      url: "/marketing/story-hero.jpg",
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

// THE FOUR VIGNETTES, from the founder's mockup 2026-08-27.
//
// WHY THEY EXIST: measured on a real 390px phone, /our-story ran 3,423px --
// 4.1 screens -- and the four tenets alone spanned 1,659px of it, almost two
// full screens, with 1,290px of that being three full-bleed photographs. Half
// the page was one section, and most of that section was decoration. "People
// get annoyed and leave."
//
// These carry the same four ideas in four to six words each. The long-form
// versions still follow underneath, where they do their real job, which is
// SEO and the reader who has decided to care.
// ⚠️ NO "YOUR" IN THESE TITLES, ON PURPOSE. They read Your body / Your style
// before, four lines above a line that already says "your shape, your skin,
// your style". The founder's note: too many yours, repeated again after the
// cards. The one list on this page is hers, in the intro; these carry the same
// four ideas without competing with it.
const VIGNETTES = [
  {
    // ⚠️ THIS USED TO SAY "not a size chart", WHICH CONTRADICTS THE PRODUCT.
    // Standard sizing is a real, equally-priced option -- SizePicker offers XS
    // to XXL and the chart sits right beside it. Dismissing it here sold
    // against something we actually offer. Founder caught it.
    k: "Cut to fit",
    v: "Send your measurements, or pick a standard size. Same price either way.",
  },
  { k: "Details you choose", v: "Change the sleeve, the length, the leg, the fit. More coming." },
  {
    k: "100% natural fabrics",
    v: "Plant-based only. Breathable against the skin, never synthetic.",
  },
  { k: "Made to order", v: "Nothing is cut until you order, so nothing is wasted." },
];

const tenetGroups = [
  {
    caption: "A finished piece: natural fabric texture, a personal detail visible",
    image: "/marketing/story-materials-v2.jpg",
    items: [
      {
        title: "Materials that respect your skin",
        body: "Plant-based fibre only, never synthetic. Breathable fabric isn't just more comfortable, it matters for your skin's health. Tight, non-breathable synthetics trap heat and moisture against the body, and some are linked to disrupting hormones over long, close contact. We'd rather you not have to think about that.",
      },
      {
        // "Timeless" folded in here at the founder's direction rather than
        // given a tenet of its own, so the page does not grow a fifth item
        // for one idea. It matters more than its size suggests: timeless
        // essentials is the brand's stated niche, and until now the site
        // never said so anywhere a customer would read it.
        title: "Timeless pieces, customised by you, for you",
        body: "Those lovely shirts you wished had longer sleeves. Those comfy pants you wish had pockets. We believe in uniqueness, and in making fashion accessible to everyone, so the things you'd normally just live with, you can actually change. And they are essentials, not this season's: chosen to still be worn in five years, cut properly, in fabric that softens instead of wearing out.",
      },
    ],
  },
  {
    caption: "A tailor at work on a single piece, price tag visible",
    image: "/marketing/story-tailoring.jpg",
    items: [
      {
        title: "Tailoring for your shape",
        // ⚠️ THIS REPEATED TWO VIGNETTES ALMOST WORD FOR WORD -- "cut for
        // your body, not a size chart" and "nothing is made until you order
        // it" are both card copy now. Founder: "cut for you and made to order
        // are repeated a lot". The long version says what a card cannot.
        body: "A solo tailor cuts one piece at a time, so there is no minimum run and no stock waiting for a body that happens to fit it. That is the part most labels cannot copy: the most sustainable thing a clothing brand can do is not make what nobody asked for, and that only works if nothing is made in advance.",
      },
      {
        title: "Fixed prices",
        body: "We committed to making sustainable and trendy fashion accessible to everyone. You customise your pieces, the price stays the same per piece type either way.",
      },
    ],
  },
];

// The founder's note claimed 288 ways for a shirt and 576 for trousers.
// Neither is right, and both are the same number as each other in reality:
// 2 sleeve/leg options x 2 lengths x 4 colours x 2 fabrics x 6 standard sizes
// = 192. The higher figures appear to have counted the Shaklek+ sliders, which
// are locked and cannot be chosen. Computed here rather than typed, so it
// follows parameterSliders.ts and colors.ts instead of drifting away from them.
// The fabric factor is 2 and stays 2. FOUNDER'S DECISION, 2026-08-28: cotton is
// coming, and 192 is the number she wants on the page.
//
// I changed this to read SELLABLE_FABRICS.length without asking her, which made
// it say 96, and that was not my call to make. A number on a customer-facing
// page is a brand decision, not a bug. Ask.
//
// ⚠️ What it does mean, for whoever reads this next: until cotton is
// `available: true` in fabrics.ts, half of these 192 ways cannot be ordered.
// That is a known and accepted state, not an oversight. It stops being a
// question the moment cotton is sellable.
const SHIRT_WAYS =
  renderParamsForCategory("Shirt").reduce((n, p) => n * p.options.length, 1) *
  colors.length *
  2 *
  sizes.length;

export default function OurStoryPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />

      {/* Hero */}
      <div className="relative h-[34vh] max-h-[300px] min-h-[240px] w-full overflow-hidden sm:h-[52vh] sm:max-h-[440px] sm:min-h-[320px]">
        <Image
          src="/marketing/story-hero.jpg"
          alt="A Shaklek piece worn outdoors, natural light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/45 to-black/25"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-10 text-center">
          {/* The hero carries the slogan only. The page title moved below it:
              a floating "Our story" chip over the photograph read as a stray
              button rather than a heading. */}
          {/* ⚠️ WHITE TYPE ON A SCRIM, NOT DARK TYPE ON A DROP SHADOW.
              This was text-text with a white drop-shadow, which only works
              while the photograph stays pale exactly where the words fall --
              founder: "it's not visible with the colors behind it". A scrim
              guarantees contrast whatever the image does, same as the band
              lower down. */}
          <p className="text-[12px] tracking-[0.16em] text-white/85 uppercase">
            Shaklek means &ldquo;your way&rdquo; in Arabic
          </p>
          <h1 className="font-display mt-3 max-w-xl text-[26px] leading-tight text-white sm:text-[34px]">
            your shape, your skin, your style, your Shaklek.
          </h1>
          {/* The founder's note is the most personal thing on the site and it
              sits at the very bottom. This is the shortcut to it. */}
          <a
            href="#from-our-founder"
            className="mt-6 inline-block border-b border-white/40 pb-0.5 text-[13px] text-white transition-colors hover:border-white"
          >
            From our founder ↓
          </a>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 py-14">
        <p className="subtitle mt-3 max-w-md text-justify hyphens-auto">
          We make elegant fashion essentials, not fast trends. Pieces you can
          change to your taste, kind to the skin, and shaped to fit you, not
          the other way around.
        </p>
        <p className="subtitle mt-4 max-w-md text-justify hyphens-auto">
          Every piece here starts as an idea, not a rack of stock waiting for
          someone your size to walk in. A real tailor makes it, one piece at
          a time, sustainably, for the person who ordered it. That comes down
          to four things:
        </p>
      </div>

      {/* WHY SHAKLEK? — the four ideas in four words each, before the long
          versions. On a phone this section is the whole answer; the prose
          below is for search engines and for the reader who wants more. */}
      <div className="mx-auto w-full max-w-5xl px-6 pb-14">
        <p className="text-xs tracking-[0.14em] text-text-3 uppercase">
          Why Shaklek?
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5">
          {VIGNETTES.map((v) => (
            <li
              key={v.k}
              className="border border-border-strong p-4 sm:p-6"
            >
              <p className="font-display text-[15px] text-text sm:text-[18px]">
                {v.k}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-2 sm:text-[14px]">
                {v.v}
              </p>
            </li>
          ))}
        </ul>
      </div>


      {/* A FULL-BLEED HORIZONTAL BAND, text over the image.
          The portraits were hidden on phones to save 1,290px, which fixed the
          scroll and stripped the page of any visual. Founder: "we need
          pictures and visuals". A band is the cheap way back in -- 21:9 at
          390px wide is 186px tall against 487px for the 4:5 portrait, so it
          buys the imagery back for roughly a third of the height.

          The scrim is not decoration. White type over a photograph is only
          legible if something guarantees the contrast, and these are pale
          studio shots; without it the line disappears into the linen. */}
      <section className="relative mb-14 w-full overflow-hidden">
        <Image
          src="/marketing/story-tailoring.jpg"
          alt="A tailor at work on a single piece"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/25"
        />
        <div className="relative mx-auto flex min-h-[280px] max-w-6xl items-center px-6 py-12 sm:min-h-[340px]">
          <div className="max-w-md">
            {/* Founder's line, 2026-08-28. She first proposed "your tailor,
                your piece, made for you", which is warmer but puts three
                "your" back on a screen we had just cleared them from, and
                trades a checkable fact for a sentiment any label could print.
                This keeps the one claim most brands cannot make -- a single
                tailor, cutting after the order -- and one "your". */}
            <p className="font-display text-[22px] leading-snug text-white sm:text-[30px]">
              Your piece, cut by one tailor, after you order it.
            </p>
            {/* THE CTA GOES HERE, NOT IN THE HERO.
                A call to action converts where intent peaks, and on a story
                page that is AFTER the argument: by this point the reader has
                the four cards and the tailor behind them. In the hero they
                have had one line, and it would fork against
                "From our founder", which is a scroll action pointing the other
                way. The nav bar already offers Catalog to anyone who wants to
                skip the page entirely. */}
            <p className="mt-6">
              <Link
                href="/#catalog"
                className="inline-block bg-white px-6 py-3 text-sm text-text transition-opacity hover:opacity-90"
              >
                Create your piece
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Tenets — the long-form versions. One image per pair on desktop,
          alternating sides. ⚠️ IMAGES ARE HIDDEN ON PHONES: they were 1,290px
          of a 3,423px page, pushing the words that actually persuade a screen
          and a half further down. The vignettes above carry this section on a
          phone. */}
      <div className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="flex flex-col gap-14 sm:gap-16">
          {tenetGroups.map((group, i) => (
            <div
              key={group.caption}
              className={`flex flex-col items-center gap-8 sm:gap-14 ${
                i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"
              }`}
            >
              <div className="hidden w-full sm:block sm:w-1/2">
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

          {/* THE QUESTION IS OUT LOUD; THE LETTER IS BEHIND A CLICK.
              Founder's own proposal, 2026-08-27, and it is the same reasoning
              that fixed the product page: a wall of text before anything else
              loses the reader, and someone who wants the story will open it.
              This sentence is the thesis of the whole page, so it is the one
              thing that should never be collapsed. */}
          <p className="font-display mt-5 text-[21px] leading-snug text-text sm:text-[23px]">
            So I started wondering: what if clothes adapted to us instead of us
            adapting to clothes?
          </p>

          <details className="group mt-6 border border-border-strong">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:hidden">
              <span className="text-[14px] text-text">
                Read how Shaklek started
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-lg leading-none text-text-3 group-open:hidden"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="hidden shrink-0 text-lg leading-none text-text-3 group-open:block"
              >
                &minus;
              </span>
            </summary>
            <div className="border-t border-border px-5 py-5">
              <div className="space-y-4 text-justify text-[15px] leading-relaxed text-text-2 hyphens-auto">
              {/* The founder's note, rewritten by her on 2026-08-25 and used
                  verbatim. Two changes worth not "improving" back:

                  She removed the naming of her own conditions from the opening
                  line. That was her call about her own medical history and it
                  is not an omission to be helpfully restored.

                  She kept the technology framing after an outside reviewer
                  argued for dropping it in favour of artisans and craft. The
                  reviewer's concern was specifically the word "AI", which is
                  now gone from the whole site; "technology" in a founder's own
                  account of why she built the thing is hers to keep.

                  The one thing NOT taken literally: she wrote "192 different
                  ways". It stays as {SHIRT_WAYS}, computed from
                  parameterSliders.ts and colors.ts, because this sentence has
                  already gone stale twice with a typed number in it. The
                  computed value is 192 today, so the page reads exactly as she
                  wrote it. */}
              <p>
                I&apos;ve spent more than half my life trying to understand my
                own body, and a long stretch of it changing everything that
                touched my skin, day and night. The clothes I wore all day,
                full of polyester and chemical finishes, couldn&apos;t possibly
                have no effect on me.
              </p>
              <p>
                I wanted something timelessly elegant, comfortable, and kind to
                my skin. And whenever I finally found the piece, it was too
                expensive, not quite my taste, or not my fit.
              </p>
              <p>
                I&apos;m a tech girl who happens to love fashion, and I kept
                asking: why can&apos;t technology solve this? Show me every
                version of a piece before it exists. Then make only the one I
                chose. Nothing sitting in a warehouse waiting for a body it
                happens to fit.
              </p>
              <p>
                We all have our own taste and our own proportions. Clothes
                should be cut to flatter the body wearing them, and to sit
                kindly on the skin underneath.
              </p>
              <p>
                Shaklek means &ldquo;your way&rdquo; in Arabic. Your look, your
                vision, simply you.
              </p>
              <p>
                On Shaklek, the same shirt can be made {SHIRT_WAYS} different
                ways before we even take your measurements, and then it&apos;s
                cut to those. That&apos;s what I built.
              </p>
              <p>
                I wanted this to be the personal wardrobe of everyone who
                believes what I believe: less overproduction, fewer materials
                that can harm our health, more comfort.
              </p>
              <p>
                If you have an idea or feedback to make Shaklek better, please
                reach out. This isn&apos;t just a brand. It&apos;s yours.
              </p>
                <p className="pt-1 text-sm font-medium text-text">
                  Nada, founder of Shaklek
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* THE CLOSER, ON THE MATERIALS PHOTOGRAPH.
          The founder asked for the shirt-and-cotton shot to sit behind text
          somewhere it makes sense. This is the place: it is the last thing
          read, the line is short enough to hold its own over an image, and it
          puts the fabric in front of someone at the moment they decide to
          click. A band in the middle of the prose would have been decoration;
          here it is the ending.

          Taller than the other band because it carries two lines and a button,
          and centred type needs the room on a phone. */}
      <section className="relative w-full overflow-hidden">
        <Image
          src="/marketing/story-materials-v2.jpg"
          alt="A finished linen piece with raw cotton beside it"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/55"
        />
        <div className="relative mx-auto flex min-h-[340px] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center sm:min-h-[380px]">
          <p className="font-display text-[24px] leading-snug text-white sm:text-[32px]">
            Your body isn&apos;t standard.
            <br />
            Why should your clothes be?
          </p>
          <p className="mt-8">
            {/* /#catalog, not "/". A button that drops someone at the top of
                the home page makes them scroll past the whole page they have
                just read. */}
            <Link
              href="/#catalog"
              className="inline-block bg-white px-7 py-3.5 text-sm text-text transition-opacity hover:opacity-90"
            >
              Create your piece
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
