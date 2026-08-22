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
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/our-story", changeFrequency: "monthly", priority: 0.7 },
  { path: "/upload", changeFrequency: "monthly", priority: 0.8 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/returns", changeFrequency: "yearly", priority: 0.3 },
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
