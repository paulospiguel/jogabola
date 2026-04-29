CREATE TABLE "onboarding" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"nickname" text,
	"role" text NOT NULL,
	"location" text,
	"experience" text,
	"availability" text,
	"goals" jsonb DEFAULT '[]'::jsonb,
	"waitlist_apps" jsonb DEFAULT '[]'::jsonb,
	"custom_fields" jsonb DEFAULT '{}'::jsonb,
	"notifications_enabled" boolean DEFAULT true,
	"newsletter_enabled" boolean DEFAULT true,
	"early_access_enabled" boolean DEFAULT true,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pending_onboarding" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "pending_onboarding" CASCADE;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "nickname" text;--> statement-breakpoint
ALTER TABLE "onboarding" ADD CONSTRAINT "onboarding_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_nickname_unique" UNIQUE("nickname");