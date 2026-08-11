// Interest-over-time for curated fashion search terms (see src/data/trendTerms.ts),
// via Google Trends' unofficial internal API — the same one the pytrends
// library wraps. This is the genuinely useful signal (targeted terms,
// numeric interest scores), unlike the general daily-trends RSS feed.
//
// KNOWN ISSUE, confirmed by hand: this endpoint 429s from this project's
// dev sandbox — Google rate-limits datacenter/cloud IP ranges much more
// aggressively than residential ones. It has not been confirmed working
// from anywhere yet. See planning/trend-sourcing.md before assuming this
// works in production — it may also get blocked from AWS Lambda's IPs for
// the same reason. Retest from a normal residential connection before
// relying on this for the real pipeline.

export class GoogleTrendsBlockedError extends Error {
  constructor(status: number) {
    super(
      `Google Trends returned ${status} — likely rate-limited by IP. This endpoint is known to block datacenter/cloud IPs; try from a residential connection.`,
    );
    this.name = "GoogleTrendsBlockedError";
  }
}

export type InterestPoint = { time: string; value: number };
export type TermInterest = {
  term: string;
  points: InterestPoint[];
  avgInterest: number;
};

// Google prefixes these JSON responses with )]}',\n to prevent naive
// same-origin JSON hijacking — has to be stripped before parsing.
function stripJsonGuard(text: string): string {
  return text.replace(/^\)\]\}',?\n/, "");
}

type ExploreWidget = { id: string; token: string; request: unknown };
type ExploreResponse = { widgets?: ExploreWidget[] };
type TimelinePoint = { formattedTime?: string; time?: string; value: number | number[] };
type WidgetDataResponse = { default?: { timelineData?: TimelinePoint[] } };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const text = await res.text();
  if (!res.ok) throw new GoogleTrendsBlockedError(res.status);
  try {
    return JSON.parse(stripJsonGuard(text)) as T;
  } catch {
    // A 200 that isn't real JSON (e.g. an HTML interstitial) is still a block.
    throw new GoogleTrendsBlockedError(res.status);
  }
}

export async function fetchTermInterest(
  term: string,
  geo: string,
): Promise<TermInterest> {
  const exploreReq = {
    comparisonItem: [{ keyword: term, geo, time: "today 3-m" }],
    category: 0,
    property: "",
  };
  const exploreUrl = `https://trends.google.com/trends/api/explore?hl=en-US&tz=-240&req=${encodeURIComponent(JSON.stringify(exploreReq))}`;
  const explore = await fetchJson<ExploreResponse>(exploreUrl);

  const timeseriesWidget = explore.widgets?.find((w) => w.id === "TIMESERIES");
  if (!timeseriesWidget) {
    throw new Error(`No TIMESERIES widget returned for "${term}"`);
  }

  const widgetUrl = `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=-240&req=${encodeURIComponent(
    JSON.stringify(timeseriesWidget.request),
  )}&token=${timeseriesWidget.token}`;
  const widgetData = await fetchJson<WidgetDataResponse>(widgetUrl);

  const timeline = widgetData.default?.timelineData ?? [];
  const points: InterestPoint[] = timeline.map((p) => ({
    time: p.formattedTime ?? p.time ?? "",
    value: Array.isArray(p.value) ? p.value[0] : p.value,
  }));
  const avgInterest = points.length
    ? Math.round(points.reduce((sum, p) => sum + p.value, 0) / points.length)
    : 0;

  return { term, points, avgInterest };
}

export async function fetchAllTermInterest(
  terms: string[],
  geo: string,
): Promise<{ results: TermInterest[]; errors: { term: string; message: string }[] }> {
  const results: TermInterest[] = [];
  const errors: { term: string; message: string }[] = [];

  // Sequential, not Promise.all — hitting this endpoint concurrently makes
  // the rate-limiting worse, not better.
  for (const term of terms) {
    try {
      results.push(await fetchTermInterest(term, geo));
    } catch (err) {
      errors.push({
        term,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { results, errors };
}
