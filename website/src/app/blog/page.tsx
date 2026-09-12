import Link from "next/link";
import type { Metadata } from "next";
import JournalHeader from "@/components/JournalHeader";
import { articlesByDate } from "@/data/blog";
import { pageMetadata } from "@/lib/seo";

// "Journal" rather than "Blog" in the visible copy, because it reads better
// beside the rest of the site. The URL stays /blog: it is what people and
// crawlers expect, and the path is the part search cares about.
export const metadata: Metadata = pageMetadata({
  title: "Journal",
  description:
    "Writing on fabric, fit and dressing for the Gulf climate, from a made-to-order label in the UAE.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <JournalHeader />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <h1 className="font-display text-[30px] leading-tight text-text">
          Journal
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-text-2">
          Notes on fabric, fit and dressing for this climate. Written by the
          people making the clothes, which means we say where the trade-offs are
          rather than only where the advantages sit.
        </p>
        <div className="mt-4 h-px w-10 bg-gold" />

        <ul className="mt-10 space-y-0">
          {articlesByDate.map((article) => (
            <li key={article.slug} className="border-t border-border">
              <Link href={`/blog/${article.slug}`} className="group block py-7">
                <h2 className="font-display text-[22px] leading-snug text-text transition-colors group-hover:text-gold">
                  {article.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-text-2">
                  {article.description}
                </p>
                <p className="mt-3 text-xs text-text-3">
                  <time dateTime={article.published}>
                    {new Date(article.published).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <span aria-hidden="true"> · </span>
                  {article.readingMinutes} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
