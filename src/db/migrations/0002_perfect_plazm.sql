CREATE TABLE "profile" (
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
	CONSTRAINT "profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DROP TABLE "onboarding" CASCADE;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;