import { notFound } from "next/navigation";
import Link from "next/link";
import { isStoreOpen } from "@/lib/storeOpen";
import Image from "next/image";
import type { Metadata } from "next";
import JournalHeader from "@/components/JournalHeader";
import { articles, getArticle, type Block } from "@/data/blog";
import { NOINDEX, SITE_NAME, SITE_URL, absoluteUrl, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return NOINDEX;

  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/blog/${article.slug}`,
    type: "article",
    images: [
      { url: article.hero.src, width: article.hero.w, height: article.hero.h, alt: article.hero.alt },
    ],
  });
}

/**
 * ⚠️ THE MEASURE IS THE WHOLE POINT OF THIS LAYOUT.
 *
 * The first version set 15px text across a 672px column, which is about 95
 * characters a line. Comfortable reading is 60-75. The founder's verdict was
 * that it did not invite reading, and she was right -- it was not the writing,
 * it was the line length.
 *
 * So: text sits in a 34rem column (~68 characters at 17px) while images break
 * out to the full 44rem. That difference in width is what gives a long read its
 * rhythm; a column of undifferentiated prose is what makes one feel endless.
 *
 * Body stays in the system sans. Cormorant is a DISPLAY face here and
 * globals.css says so explicitly -- it runs small and high-contrast, and it is
 * wrong for long paragraphs.
 */
const TEXT = "mx-auto w-full max-w-[34rem]";
// ⚠️ JUSTIFIED, with hyphenation. Founder, 2026-09-10: "the text is still not
// square, lines finish at different parts". Ragged-right is the typographic
// default and she does not want it. hyphens-auto is NOT optional alongside it --
// justifying at this measure without hyphenation opens rivers of white space.
// Same treatment LegalPage already uses.
const PROSE = `${TEXT} text-justify hyphens-auto`;

/**
 * ⚠️ GARMENT FIGURES ARE CAPPED WELL BELOW THE TEXT COLUMN.
 *
 * Founder, 2026-09-13, on the four-photo `looks` block: "i don't like the 4
 * pictures you put, it's way toooooo big". She was right and it was arithmetic,
 * not taste. Two 2:3 portraits side by side across the full 34rem measure are
 * 34rem tall on their own; stacked two deep, a `looks` block was about 68rem,
 * which is more than three phone screens of photograph before a word is read.
 *
 * 19rem caps a `looks` column at roughly 9.1rem wide and 13.7rem tall, so the
 * whole four-photo block lands near 27.5rem: under half what it was, and under
 * one screen. `pair` is one row, so it lands near 13.7rem.
 *
 * ⚠️ AND THE `sizes` HINT HAS TO COME DOWN WITH IT. It said 22rem per column
 * against a box that is now about 9rem, so the browser fetched an asset more
 * than twice the width it would ever paint. `sizes` is what the optimizer picks
 * the source width from; leaving it stale makes the page heavier while looking
 * smaller, which is the worst of both.
 */
const FIGURE = "mx-auto w-full max-w-[19rem]";
const FIGURE_SIZES = "(min-width: 768px) 9rem, 42vw";

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className={`${TEXT} mt-16 font-display text-[30px] leading-[1.2] text-text`}>
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className={`${TEXT} mt-10 text-[18px] font-semibold leading-snug text-text`}>
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={i} className={`${TEXT} mt-5 space-y-3.5 pl-5 text-justify hyphens-auto`}>
          {block.items.map((item, j) => (
            <li key={j} className="list-disc pl-1 marker:text-gold">
              {item}
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <p key={i} className={`${PROSE} mt-8 border-l-2 border-gold bg-surface-2 px-6 py-5 text-text`}>
          {block.text}
        </p>
      );
    case "quote":
      // A line worth stopping on. Set in the display face, big, with air around
      // it -- this is the visual break that stops a long article reading as one
      // undifferentiated block.
      return (
        <blockquote key={i} className={`${TEXT} my-14`}>
          <div className="mb-5 h-px w-10 bg-gold" />
          <p className="font-display text-[26px] leading-[1.35] text-text">{block.text}</p>
          <div className="mt-5 h-px w-10 bg-gold" />
        </blockquote>
      );
    case "image":
      return (
        <figure key={i} className="my-12">
          <Image
            src={block.src}
            alt={block.alt}
            width={block.w}
            height={block.h}
            sizes="(min-width: 768px) 44rem, 100vw"
            className="max-h-[420px] w-full bg-surface-2 object-cover"
          />
          {block.caption && (
            <figcaption className={`${TEXT} mt-3 text-[13px] leading-relaxed text-text-3`}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "palette":
      // ⚠️ THIS FIGURE MUST BE WIDTH-CONSTRAINED LIKE THE TEXT. It had no width
      // class at all, so the full-bleed border-y ran wider than every paragraph
      // around it and the table looked like a different page. Founder,
      // 2026-09-13: "the color palettes are not aligned to the width of the
      // full blog, it's too wide."
      // A colour guide you can use at a glance, rather than a paragraph
      // describing colours. Each row is one outer colour and the shades that
      // sit under it. Swatches carry a text name too: colour alone is not an
      // accessible way to convey information, and a screen reader gets nothing
      // from a coloured square.
      return (
        <figure key={i} className={`${TEXT} my-12`}>
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {block.rows.map((row, j) => (
              <div key={j} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex shrink-0 items-center gap-3 sm:w-44">
                  <span
                    aria-hidden="true"
                    className="h-8 w-8 shrink-0 rounded-full border border-border-strong"
                    style={{ background: row.outer.hex }}
                  />
                  {/* NOT ${TEXT}: that is a centred 34rem column, meaningless
                      on a label and it was fighting the row layout. */}
                  <span className="text-sm font-medium text-text">{row.outer.name}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {row.under.map((u, k) => (
                      <span key={k} className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 rounded-full border border-border-strong"
                          style={{ background: u.hex }}
                        />
                        <span className={`${TEXT} text-[13px] text-text-2`}>{u.name}</span>
                      </span>
                    ))}
                  </div>
                  <p className={`${TEXT} text-[13px] leading-relaxed text-text-3`}>{row.note}</p>
                </div>
              </div>
            ))}
          </div>
          {block.caption && (
            <figcaption className={`${TEXT} mt-3 text-[13px] leading-relaxed text-text-3`}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "pair":
      return (
        <figure key={i} className="my-12">
          {/* Same size problem as `looks` below, same fix. See that comment. */}
          <div className={`${FIGURE} grid grid-cols-2 gap-2`}>
            {[block.a, block.b].map((img, j) => (
              <Image
                key={j}
                src={img.src}
                alt={img.alt}
                width={848}
                height={1264}
                sizes={FIGURE_SIZES}
                className="w-full bg-surface-2 object-cover"
              />
            ))}
          </div>
          {block.caption && (
            <figcaption className={`${TEXT} mt-3 text-[13px] leading-relaxed text-text-3`}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "looks":
      // Two complete outfits, each a shirt above its trousers, so the eye reads
      // DOWN a column as one look rather than across as four separate garments.
      return (
        <figure key={i} className="my-12">
          <div className={`${FIGURE} grid grid-cols-2 gap-3`}>
            {[block.a, block.b].map((look, j) => (
              <div key={j}>
                <div className="space-y-1.5">
                  {/* ⚠️ filter, do not map over a possibly-undefined top. The
                      founder dropped the shirts on 2026-09-13 because two
                      photographs per column filled a phone screen. */}
                  {[look.top, look.bottom].filter((src): src is string => Boolean(src)).map((src, k) => (
                    <Image
                      key={k}
                      src={src}
                      alt={look.label}
                      width={848}
                      height={1264}
                      sizes={FIGURE_SIZES}
                      className="w-full bg-surface-2 object-cover"
                    />
                  ))}
                </div>
                <p className="mt-2.5 text-[11px] uppercase tracking-[0.08em] text-text-3">
                  {look.label}
                </p>
              </div>
            ))}
          </div>
          {block.caption && (
            <figcaption className={`${TEXT} mt-4 text-[13px] leading-relaxed text-text-3`}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "link": {
      // ⚠️ THE TITLE IS READ FROM THE TARGET, NEVER STORED ON THE LINK. A
      // retitled article updates every link pointing at it, and a link can
      // never advertise a headline the page no longer carries.
      //
      // The null branch is unreachable in a green build: lint-blog.mjs runs in
      // `npm run build` and fails on a dead slug. It is here so a bad slug
      // renders nothing rather than throwing the whole page.
      const target = getArticle(block.slug);
      if (!target) return null;
      return (
        <div key={i} className={`${TEXT} mt-6 border-l-2 border-border-strong pl-5`}>
          <Link
            href={`/blog/${target.slug}`}
            className="font-display text-[20px] leading-[1.25] text-text transition-colors hover:text-gold"
          >
            {target.title}
          </Link>
          <p className="mt-2 text-[14px] leading-relaxed text-text-3">{block.reason}</p>
        </div>
      );
    }
    default:
      return (
        <p key={i} className={`${PROSE} mt-5`}>
          {block.text}
        </p>
      );
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: absoluteUrl(article.hero.src),
    datePublished: article.published,
    dateModified: article.updated ?? article.published,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${article.slug}`) },
  };

  const published = new Date(article.published).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <JournalHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="flex-1 pb-20">
        {/* Lead image first, before the title. It is what makes someone stop. */}
        <div className="mx-auto w-full max-w-[56rem] px-4 pt-6">
          <Image
            src={article.hero.src}
            alt={article.hero.alt}
            width={article.hero.w}
            height={article.hero.h}
            priority
            sizes="(min-width: 900px) 56rem, 100vw"
            className="h-[38vw] max-h-[420px] min-h-[220px] w-full bg-surface-2 object-cover"
          />
        </div>

        <div className="mx-auto w-full max-w-[44rem] px-6 text-[17px] leading-[1.75] text-text-2">
          <div className={`${TEXT} mt-10`}>
            <Link
              href="/blog"
              className="text-[11px] uppercase tracking-[0.16em] text-text-3 transition-colors hover:text-gold"
            >
              Journal
            </Link>

            <h1 className="mt-4 font-display text-[38px] leading-[1.1] text-text sm:text-[44px]">
              {article.title}
            </h1>

            <p className="mt-5 text-justify text-[19px] leading-[1.6] text-text-2 hyphens-auto">{article.intro}</p>

            <p className="mt-6 text-[12px] uppercase tracking-[0.1em] text-text-3">
              <time dateTime={article.published}>{published}</time>
              <span aria-hidden="true"> · </span>
              {article.readingMinutes} min read
            </p>
            <div className="mt-6 h-px w-full bg-border" />
          </div>

          {article.blocks.map(renderBlock)}

          {/* ⚠️ THIS CTA USED TO SEND EVERY READER TO TWO GATED PAGES.
              /catalog and /how-it-works both rewrite to /coming-soon while the
              shop is shut, so the two buttons at the end of every article were
              a dead end, and /how-it-works is ALSO out of date: it was written
              before the free measuring visit and still describes the old flow
              (launch-checklist.md). Founder, 2026-09-13: "it should never be
              visible to customers before launch".

              So while shut there is ONE honest destination, the pre-launch page,
              and the reason to go there is the measuring visit rather than a
              catalogue nobody can open. It reverts to the real buttons the
              moment STORE_OPEN is true, which is why this is a branch and not a
              deletion. */}
          <div className={`${TEXT} mt-20 border-t border-border pt-10`}>
            <p className="text-[17px] text-text-2">
              Shaklek makes clothes to order in the UAE. You choose the cut, the
              length and the colour, and a tailor makes that one piece.
            </p>
            {isStoreOpen() ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="border border-accent px-6 py-3 text-sm text-accent transition-colors hover:bg-accent hover:text-bg"
                >
                  See the catalogue
                </Link>
                {/* ⚠️ THE SECOND BUTTON WENT WITH /how-it-works, DELETED
                    2026-09-15. This branch only renders when the shop is OPEN,
                    so leaving it would have ended every article on a 404 the
                    day we launch, which is the same failure 512fb20 fixed for
                    the shut state. One button is also the honest number here:
                    a reader who has finished an article wants the clothes. */}
              </div>
            ) : (
              <>
                <p className="mt-3 text-[17px] text-text-2">
                  We are not open yet. If you are in Dubai we come to you and
                  take your measurements ourselves, once, at no charge.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/coming-soon"
                    className="border border-accent px-6 py-3 text-sm text-accent transition-colors hover:bg-accent hover:text-bg"
                  >
                    Tell me when you open
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Articles you might like. Founder, 2026-09-13. The inline `link`
              blocks are for a reader mid-article; this is for one who has
              finished and would otherwise leave. Every other article, newest
              first, so nothing is orphaned as the journal grows. */}
          {(() => {
            const others = articles.filter((o) => o.slug !== article.slug);
            if (!others.length) return null;
            return (
              <aside className={`${TEXT} mt-16 border-t border-border pt-10`}>
                <h2 className="text-[12px] uppercase tracking-[0.1em] text-text-3">
                  Articles you might like
                </h2>
                <ul className="mt-6 flex flex-col divide-y divide-border border-y border-border">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link href={`/blog/${o.slug}`} className="group block py-5">
                        <span className="font-display text-[21px] leading-snug text-text transition-colors group-hover:text-gold">
                          {o.title}
                        </span>
                        <span className="mt-1.5 block text-[14px] leading-relaxed text-text-3">
                          {o.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            );
          })()}
        </div>
      </article>
    </div>
  );
}
