// Google's public "Daily Search Trends" RSS export. Real, public, no auth,
// no scraping — this is a feed Google itself publishes and links from the
// Trends UI. Confirmed working from this project's dev environment
// (see planning/trend-sourcing.md for how that was verified).
//
// Caveat this file cannot fix: this feed is *general* daily search trends
// for a country (news, sports, celebrities — whatever spikes), not a
// fashion-specific feed. Most days it will contain zero fashion-relevant
// items. Don't expect a steady stream from this alone — see
// FASHION_KEYWORDS below for how candidates get flagged when they do show up.

export type DailyTrendItem = {
  title: string;
  approxTraffic: string | null;
  pubDate: string | null;
  fashionRelevant: boolean;
};

const FASHION_KEYWORDS = [
  "dress",
  "abaya",
  "skirt",
  "pants",
  "trouser",
  "shirt",
  "sleeve",
  "linen",
  "cotton",
  "fashion",
  "style",
  "outfit",
  "wear",
  "collection",
  "runway",
  "designer",
];

function isFashionRelevant(title: string): boolean {
  const lower = title.toLowerCase();
  return FASHION_KEYWORDS.some((kw) => lower.includes(kw));
}

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match ? match[1].trim() : null;
}

export async function fetchDailyTrendsAE(): Promise<DailyTrendItem[]> {
  const res = await fetch("https://trends.google.com/trending/rss?geo=AE", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) {
    throw new Error(
      `Google daily trends feed returned ${res.status} — likely blocked or geo param rejected`,
    );
  }

  const xml = await res.text();
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return itemBlocks.map((block) => {
    const title = extractTag(block, "title") ?? "";
    return {
      title,
      approxTraffic: extractTag(block, "ht:approx_traffic"),
      pubDate: extractTag(block, "pubDate"),
      fashionRelevant: isFashionRelevant(title),
    };
  });
}
