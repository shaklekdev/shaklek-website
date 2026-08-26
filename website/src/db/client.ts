import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dbSchema from "./schema";
import { assertDatabaseMatchesStripeMode } from "@/lib/envGuard";

// The database is NEON POSTGRES, not Amazon RDS. An earlier version of this
// comment said "no RDS instance exists yet — DATABASE_URL isn't set anywhere",
// which stopped being true when Neon went live on 2026-08-22 and then misled
// anyone reading it. Neon is live in production and DATABASE_URL is set in the
// Amplify console; there is a separate dev branch for local work.
//
// getDb() still returns null when DATABASE_URL is absent. That is the same
// graceful-degradation pattern as RESEND_API_KEY in /api/orders: callers check
// for null and fall back to logging instead of throwing, so a misconfigured
// preview environment cannot take checkout down.
let db: ReturnType<typeof drizzle<typeof dbSchema>> | null = null;

export function getDb() {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // Refuses a test Stripe key paired with the production database -- see
  // src/lib/envGuard.ts for why that combination used to be possible.
  assertDatabaseMatchesStripeMode(url);
  const client = postgres(url, { max: 1 });
  db = drizzle(client, { schema: dbSchema });
  return db;
}

export { dbSchema as schema };
