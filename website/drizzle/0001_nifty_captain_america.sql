ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending_payment';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_session_id" text;