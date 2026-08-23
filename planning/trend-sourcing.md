# Trend Sourcing — where trend-intake candidates actually come from

Status: **the dashboard at `/dashboard/trends` currently shows 100% fabricated data.** The 7 candidates in `src/data/trends.ts` were invented to demonstrate the UI — no pipeline, no API call, no real source has fed it yet. This doc is the honest breakdown of what's real, what's easy-but-wrong, and what's actually been built and tested so far.

"Scrape Instagram + sales data + influencers" bundles together three very different levels of difficulty and legal risk. Broken out individually:

## The five candidate sources

| Source | Verdict | Why |
|---|---|---|
| **Google Trends — daily trending searches (RSS)** | ✅ Built, verified working | Public, documented, no auth. See below — but the *signal* it produces is weak. |
| **Google Trends — interest-over-time for curated terms** | 🟡 Built, currently blocked | The actually-useful targeted signal. Code is correct; Google 429s this project's dev sandbox. See below. |
| **UAE retailer "trending now" pages** (Namshi, Ounass) | Not started — doable | Public marketing pages, no login. Each site's ToS needs a quick read before building a recurring checker. Extract structured signal (which silhouettes/categories recur), never copy photos or full listings. |
| **Instagram / hashtags** | Do not automate | ToS explicitly prohibits scraping; aggressive rate-limiting/IP-blocking; "public data" scraping is not settled-safe law. The legitimate path (Graph API) is built for a business's own account insights, not general trend discovery — that requires a paid social-listening tool (Brandwatch, Meltwater), real subscription cost, overkill at pilot stage. |
| **Sales data** | Own data only, post-launch | Shaklek's own RDS order data once real orders exist — completely fine, first-party. Other retailers' sales data isn't public anywhere; if ever offered, it's leaked/improperly obtained — don't touch it. |
| **Influencers** | Manual, not automated | Same ToS problem as Instagram, plus a sharper IP-attribution risk: "we tracked one creator's feed and copied what they wore" is much harder to defend under the originality-distance rule (dossier §11) than "balloon sleeves recurring across 14 sources." Better as a stylist manually noting what they're seeing, not a scraper. |

## What got built and tested this round

Two real (non-mock) integrations now exist in the codebase, both hit live and verified against the actual running dev server — not assumed to work from documentation.

### 1. Daily trending searches (RSS) — works
- `src/lib/trends/googleDailyTrends.ts` — fetches Google's own public "Daily Search Trends" RSS export (`trends.google.com/trending/rss?geo=AE`), a feed Google itself publishes and links from the Trends UI. No auth, no ToS conflict.
- `src/app/api/trends/google-daily/route.ts` — exposes it as `GET /api/trends/google-daily`
- **Confirmed working** — real UAE trending searches returned live.
- **The catch, confirmed by actually looking at the output**: today's 10 items were football scores, weather, and a UK royal — zero fashion-relevant. This is a *general* country-wide daily trends feed, not a fashion feed. It will surface something fashion-relevant only rarely, when fashion happens to spike into the general news cycle. Real, legal, working — but not, by itself, a reliable trend-intake signal for a fashion vertical. `fashionRelevant` boolean is included on each item as a lightweight keyword filter, but expect it to be `false` on most days.

### 2. Interest-over-time for curated fashion terms — built, currently blocked
- `src/lib/trends/googleInterest.ts` + `src/data/trendTerms.ts` (7 curated terms: linen dress, abaya, co-ord set, wide leg pants, wrap skirt, oversized shirt, puff sleeve dress) — this is the actually useful signal: targeted terms, numeric interest scores over time, exactly what "which silhouettes are trending in the UAE right now" needs.
- `src/app/api/trends/google-interest/route.ts` — exposes it as `GET /api/trends/google-interest`
- **Tested live, and it's blocked**: every one of the 7 terms comes back `429 Too Many Requests` from this dev environment. This is Google Trends' unofficial internal API (the same one the `pytrends` Python library wraps) — it's well known for rate-limiting datacenter/cloud IP ranges far more aggressively than residential ones. This isn't a code bug; the request/response handling is correct and fails cleanly with a typed `GoogleTrendsBlockedError` per term rather than crashing.
- **Real open risk, not just a dev-sandbox quirk**: AWS Lambda's outbound IPs are also datacenter-range. There's a real chance this same 429 shows up again once this is deployed as the actual weekly trend-intake job, not just here. Before relying on this for production:
  - Retest from a normal residential/office connection to confirm it's specifically datacenter IPs being blocked (likely, but not yet confirmed)
  - If Lambda also gets blocked, options are: a paid trends-data provider with an actual API (Glimpse, Exploding Topics, SEMrush), or running this specific step from somewhere with a residential-class egress IP. **Did not build a proxy/evasion layer to route around Google's rate-limiting** — that crosses into the kind of bot-detection evasion this project should stay away from regardless of the benign end goal.

## What this changes about the trend-intake pipeline design

The AWS architecture doc's Lambda trend-intake job (`aws-architecture-diagram.html`, flow B, step 2 — "Lambda pulls trend signals from configured sources") was written assuming this would be straightforward. It's more accurately: Google's daily RSS is a free, always-on but low-yield input; the higher-value curated-term signal needs its production reliability confirmed before the Lambda design leans on it; retailer trending pages are the more promising near-term real source and haven't been started yet.

## Next, in order
1. Retest `google-interest` from a non-datacenter connection to know if this is really a permanent blocker or just this environment
2. Build the Namshi/Ounass "trending now" page checker (structured signal extraction, not scraping full listings) — ToS check per site first
3. Only once both of the above are real: wire actual results into `/dashboard/trends` instead of the mock data in `src/data/trends.ts`, and have the Lambda-equivalent step call Google Gemini (~~Claude on Bedrock~~ — superseded 2026-08-12) to turn raw signals into the candidate-concept shape the dashboard expects

---
*This file, `ai-integration-todo.md`, and the rest of `planning/` are the shared source of truth across every session working on this project — keep them current rather than letting decisions live only in chat history.*
