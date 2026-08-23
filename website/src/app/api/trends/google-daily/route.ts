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

import { fetchDailyTrendsAE } from "@/lib/trends/googleDailyTrends";

export async function GET() {
  const denied = await requireStaff();
  if (denied) return denied;

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
  } catch {
    return Response.json(
      { error: "Upstream trends request failed" },
      { status: 502 },
    );
  }
}
