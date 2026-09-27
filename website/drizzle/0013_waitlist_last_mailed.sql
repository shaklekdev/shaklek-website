-- The waitlist's real rate limit. rateLimit() is an in-memory Map and Amplify
-- runs many containers, so it throttled nothing in production (100 requests,
-- zero 429s). This column is the shared store: a per-address cooldown and a
-- global hourly cap on outgoing mail are both read from it. Additive, nullable,
-- safe: the running code ignores a column it does not know.
--
--   node scripts/db-migrate.mjs --target=dev    (then staging)
--   node scripts/db-migrate.mjs --target=prod   (BEFORE pushing main)
ALTER TABLE "waitlist" ADD COLUMN IF NOT EXISTS "last_mailed_at" timestamp;
CREATE INDEX IF NOT EXISTS "waitlist_last_mailed_at_idx" ON "waitlist" ("last_mailed_at");
