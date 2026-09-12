-- "You can leave the list whenever you like" is a promise, so leaving has to
-- work. Additive and safe: the running code ignores a column it does not know.
--
--   node scripts/db-migrate.mjs --target=prod   (BEFORE deploying the code)
ALTER TABLE "waitlist" ADD COLUMN IF NOT EXISTS "unsubscribed_at" timestamp;
