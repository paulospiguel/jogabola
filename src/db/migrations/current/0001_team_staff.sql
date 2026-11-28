CREATE TABLE "team_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'other' NOT NULL,
	"permissions" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_staff_permissions_check" CHECK ("team_staff"."permissions" <@ ARRAY['events.manage', 'attendance.manage', 'roster.manage', 'payments.manage', 'communication.manage', 'match.manage']::text[]),
	CONSTRAINT "team_staff_title_check" CHECK ("team_staff"."title" IN ('coach', 'director', 'finance', 'secretary', 'other'))
);
--> statement-breakpoint
CREATE TABLE "team_staff_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"actor_user_id" text,
	"subject_user_id" text,
	"type" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_staff" ADD CONSTRAINT "team_staff_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_staff" ADD CONSTRAINT "team_staff_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_staff" ADD CONSTRAINT "team_staff_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_staff_events" ADD CONSTRAINT "team_staff_events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_staff_events" ADD CONSTRAINT "team_staff_events_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_staff_events" ADD CONSTRAINT "team_staff_events_subject_user_id_user_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "team_staff_team_user_idx" ON "team_staff" USING btree ("team_id","user_id");--> statement-breakpoint
-- Data: legacy co-captains (role 'manager', not the owner) become staff with the legacy permission set.
INSERT INTO "team_staff" ("team_id", "user_id", "title", "permissions", "created_by")
SELECT tm."team_id", tm."player_id", 'other',
  ARRAY['events.manage', 'attendance.manage', 'payments.manage', 'communication.manage', 'roster.manage']::text[],
  t."owner_id"
FROM "team_members" AS tm
JOIN "teams" AS t ON t."id" = tm."team_id"
WHERE tm."role" = 'manager' AND tm."player_id" <> t."owner_id"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Data: team_members becomes the athlete roster only; no row is deleted (owners stay athletes).
UPDATE "team_members" SET "role" = 'player' WHERE "role" <> 'player';
