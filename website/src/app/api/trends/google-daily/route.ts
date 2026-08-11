import { fetchDailyTrendsAE } from "@/lib/trends/googleDailyTrends";

export async function GET() {
  try {
    const items = await fetchDailyTrendsAE();
    return Response.json({
      source: "google-daily-trends-rss",
      geo: "AE",
      fetchedAt: new Date().toISOString(),
      count: items.length,
      fashionRelevantCount: items.filter((i) => i.fashionRelevant).length,
      items,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
