ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false NOT NULL;
