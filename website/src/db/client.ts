import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dbSchema from "./schema";
import { assertDatabaseMatchesStripeMode } from "@/lib/envGuard";

// No RDS instance exists yet (aws-infrastructure-todo.md) — DATABASE_URL
// isn't set anywhere. Same graceful-degradation pattern as RESEND_API_KEY
// in /api/orders: callers check getDb() for null and fall back to
// logging instead of throwing, so checkout keeps working either way.
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
