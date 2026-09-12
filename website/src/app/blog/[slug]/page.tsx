import { notFound } from "next/navigation";
import Link from "next/link";
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
    case "pair":
      return (
        <figure key={i} className="my-12">
          <div className="grid grid-cols-2 gap-2">
            {[block.a, block.b].map((img, j) => (
              <Image
                key={j}
                src={img.src}
                alt={img.alt}
                width={848}
                height={1264}
                sizes="(min-width: 768px) 22rem, 50vw"
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
          <div className="grid grid-cols-2 gap-3">
            {[block.a, block.b].map((look, j) => (
              <div key={j}>
                <div className="space-y-1.5">
                  {[look.top, look.bottom].map((src, k) => (
                    <Image
                      key={k}
                      src={src}
                      alt={look.label}
                      width={848}
                      height={1264}
                      sizes="(min-width: 768px) 22rem, 50vw"
                      className="w-full bg-surface-2 object-cover"
                    />
                  ))}
                </div>
                <p className="mt-2.5 text-[12px] uppercase tracking-[0.08em] text-text-3">
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

          <div className={`${TEXT} mt-20 border-t border-border pt-10`}>
            <p className="text-[17px] text-text-2">
              Shaklek makes clothes to order in the UAE. You choose the cut, the
              length and the colour, and a tailor makes that one piece.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="border border-accent px-6 py-3 text-sm text-accent transition-colors hover:bg-accent hover:text-bg"
              >
                See the catalogue
              </Link>
              <Link
                href="/how-it-works"
                className="border border-border-strong px-6 py-3 text-sm text-text-2 transition-colors hover:border-gold hover:text-gold"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
