-- The tailor's measurement set on customers, 2026-09-15.
--
-- ⚠️ ADDITIVE AND NULLABLE, EVERY ONE, AND THAT IS NOT STYLE. Amplify never
-- runs migrations (CLAUDE.md trap 3), and Drizzle's bare db.select() expands to
-- an explicit column list, so code naming a column that does not exist yet does
-- not break the new page, it breaks EVERY query on `customers`. Two of those
-- are /api/orders and the Stripe webhook, so the failure is "nobody can buy"
-- and "cards are charged and the order is never marked paid".
--
-- THEREFORE: run this against prod BEFORE the code that reads these columns is
-- pushed. node scripts/db-migrate.mjs --target=prod, then verify against
-- information_schema, never against the exit code.
--
-- Safe in the other order too, which is the point of nullable: the running code
-- simply ignores columns it does not know about.

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_stomach" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_shoulder" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_neck" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_thigh" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_crotch" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_shirt_length" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_sleeve_length" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_trouser_length" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measurement_fitting_notes" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "measured_at" timestamp with time zone;
