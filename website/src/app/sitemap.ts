import type { MetadataRoute } from "next";
import { catalog } from "@/data/catalog";
import { SITE_URL } from "@/lib/seo";

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
  { path: "/upload", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/size-guide", changeFrequency: "monthly", priority: 0.6 },
  { path: "/shipping", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
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
