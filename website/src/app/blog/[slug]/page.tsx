import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
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

  // Unknown slug renders notFound() below. Give the 404 nothing to index.
  if (!article) return NOINDEX;

  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/blog/${article.slug}`,
    type: "article",
  });
}

/**
 * One block, one element. The heading levels come from the data rather than
 * from how the prose was written, so an article cannot accidentally skip from
 * H2 to H4 -- which is the structural mistake that makes a page harder for a
 * search engine to read.
 */
function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={i}
          className="mt-12 font-display text-[26px] leading-tight text-text"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="mt-8 text-[17px] font-semibold text-text">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={i} className="mt-4 space-y-3 pl-5">
          {block.items.map((item, j) => (
            <li key={j} className="list-disc marker:text-gold">
              {item}
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <p
          key={i}
          className="mt-6 border-l-2 border-gold bg-surface-2 px-5 py-4 text-text"
        >
          {block.text}
        </p>
      );
    default:
      return (
        <p key={i} className="mt-4">
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

  // Article structured data. Google uses it to understand that the page is a
  // piece of writing with an author and a date rather than a product page,
  // which is what lets it appear in article-shaped results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.published,
    dateModified: article.updated ?? article.published,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${article.slug}`),
    },
  };

  const published = new Date(article.published).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <Link
          href="/blog"
          className="text-xs uppercase tracking-[0.14em] text-text-3 transition-colors hover:text-gold"
        >
          Journal
        </Link>

        {/* The one H1 on the page. */}
        <h1 className="mt-5 font-display text-[32px] leading-[1.15] text-text">
          {article.title}
        </h1>

        <p className="mt-4 text-[17px] leading-relaxed text-text-2">
          {article.intro}
        </p>

        <p className="mt-5 text-xs text-text-3">
          <time dateTime={article.published}>{published}</time>
          <span aria-hidden="true"> · </span>
          {article.readingMinutes} min read
        </p>

        <div className="mt-2 h-px w-10 bg-gold" />

        <div className="mt-6 text-[15px] leading-[1.75] text-text-2">
          {article.blocks.map(renderBlock)}
        </div>

        <div className="mt-14 border-t border-border pt-8">
          <p className="text-[15px] text-text-2">
            Shaklek makes clothes to order in the UAE. You choose the cut, the
            length and the colour, and a tailor makes that one piece.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="border border-accent px-5 py-2.5 text-sm text-accent transition-colors hover:bg-accent hover:text-bg"
            >
              See the catalogue
            </Link>
            <Link
              href="/how-it-works"
              className="border border-border-strong px-5 py-2.5 text-sm text-text-2 transition-colors hover:border-gold hover:text-gold"
            >
              How it works
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
