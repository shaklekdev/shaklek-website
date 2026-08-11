import { fetchAllTermInterest } from "@/lib/trends/googleInterest";
import { TREND_SEARCH_TERMS, TREND_GEO } from "@/data/trendTerms";

export async function GET() {
  const { results, errors } = await fetchAllTermInterest(
    TREND_SEARCH_TERMS,
    TREND_GEO,
  );
  return Response.json({
    source: "google-trends-interest-over-time",
    geo: TREND_GEO,
    fetchedAt: new Date().toISOString(),
    results,
    errors,
  });
}
