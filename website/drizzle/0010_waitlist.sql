-- Waitlist: everyone who asked to be told when the shop opens.
--
-- ADDITIVE AND SAFE IN THIS ORDER. A new table is invisible to the running
-- code, so applying this to production BEFORE deploying the code that uses it
-- cannot break anything. Reversed, the code queries a table that does not
-- exist -- which is what took /account down on 2026-08-28.
--
--   node scripts/db-migrate.mjs --target=prod
--   then verify against information_schema, never against the exit code.
CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  -- Lowercased at the boundary. UNIQUE so a repeat signup updates rather than
  -- duplicating; a list holding the same person three times is not a list.
  "email" text NOT NULL UNIQUE,
  "source" text DEFAULT 'unknown' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  -- NULL means "asked, but has not proved the inbox is hers". Countable, not
  -- mailable. Only a click in the real inbox sets this.
  "confirmed_at" timestamp,
  -- When the contact reached Resend, so a failed push can be retried without
  -- guessing who already made it across.
  "synced_at" timestamp
);

-- The launch query is "everyone confirmed and not yet synced", so index that.
CREATE INDEX IF NOT EXISTS "waitlist_confirmed_idx" ON "waitlist" ("confirmed_at");
