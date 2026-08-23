import { getVerifiedEmailLower } from "@/lib/authEmail";

// Only /dashboard/trends consumes this. It was public and unthrottled, and
// each call fans out to Google -- anyone could hammer it until Google
// rate-limited the site's egress IP. Same staff allowlist as the rest of
// /api/dashboard.
const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function requireStaff(): Promise<Response | null> {
  const email = await getVerifiedEmailLower();
  if (!email || !STAFF_EMAILS.includes(email)) {
    return Response.json({ error: "Not authorized" }, { status: 401 });
  }
  return null;
}

import { fetchAllTermInterest } from "@/lib/trends/googleInterest";
import { TREND_SEARCH_TERMS, TREND_GEO } from "@/data/trendTerms";

export async function GET() {
  const denied = await requireStaff();
  if (denied) return denied;

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
