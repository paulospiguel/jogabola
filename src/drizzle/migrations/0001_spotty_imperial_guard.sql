CREATE TABLE "onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"experience" text,
	"availability" text,
	"goals" jsonb DEFAULT '[]'::jsonb,
	"waitlist_apps" jsonb DEFAULT '[]'::jsonb,
	"notifications_enabled" boolean DEFAULT true,
	"newsletter_enabled" boolean DEFAULT true,
	"early_access_enabled" boolean DEFAULT true,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "onboarding_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "onboarding" ADD CONSTRAINT "onboarding_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;