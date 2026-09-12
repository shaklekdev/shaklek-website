import type { MetadataRoute } from "next";
import { catalog } from "@/data/catalog";
import { articles } from "@/data/blog";
import { SITE_URL } from "@/lib/seo";
import { isStoreOpen } from "@/lib/storeOpen";

// Public, crawlable routes. /dashboard, /account, /sign-in, /sign-up, /cart,
// /checkout and /order-confirmed are deliberately absent -- they are private
// or transactional and carry robots: { index: false } of their own.
const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  // Second only to the home page: it is the page ads point at and the one
  // that can rank for product intent, which "/catalog" never could.
  { path: "/catalog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/our-story", changeFrequency: "monthly", priority: 0.7 },
  // The journal is the only part of the site that can rank for informational
  // searches. Product pages answer "buy a linen shirt Dubai"; nothing here
  // answered "what fabric is best in Dubai heat" until these existed.
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/size-guide", changeFrequency: "monthly", priority: 0.6 },
  { path: "/shipping", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // WHILE THE SHOP IS SHUT, EVERY ROUTE BELOW REWRITES TO /coming-soon.
  // Listing them anyway would hand Google a sitemap of URLs that all serve the
  // same page, which is a duplicate-content problem we would then have to
  // undo. The home page is the splash, and the legal pages are genuinely
  // themselves because the proxy lets them through.
  if (!isStoreOpen()) {
    return ["/", "/legal/terms", "/legal/privacy"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.3,
    }));
  }

  return [
    ...STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    // One entry per article, using the article's own date rather than the
    // build date -- an article that has not changed should not claim it has.
    ...articles.map((article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.updated ?? article.published),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // One entry per catalog item, so the design pages stay in step with
    // catalog.ts without a second list to maintain.
    ...catalog.map((item) => ({
      url: `${SITE_URL}/design/${item.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
