CREATE TABLE "event_application" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pendente',
	"message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "public_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizer_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"city" text,
	"country" text,
	"latitude" double precision,
	"longitude" double precision,
	"search_radius" double precision,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"game_style" text,
	"experience_level" text,
	"min_age" text,
	"max_age" text,
	"gender" text,
	"position_needed" text,
	"participation_criteria" jsonb DEFAULT '{}'::jsonb,
	"max_participants" text,
	"current_participants" text DEFAULT '0',
	"is_public" boolean DEFAULT true,
	"language" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'ativo',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "event_application" ADD CONSTRAINT "event_application_event_id_public_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."public_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_application" ADD CONSTRAINT "event_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_event" ADD CONSTRAINT "public_event_organizer_id_user_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;