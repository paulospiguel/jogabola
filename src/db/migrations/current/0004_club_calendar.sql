-- Stage 2 (ADR 0004/0005): clubs, club members, seasons, opponents, fixtures
-- and the optional fixture/match-session link. Reviewed by hand: the unique
-- constraints targeted by composite foreign keys are created before the keys.
-- Existing teams keep club_id NULL; no historical row is reassigned.
CREATE TABLE "club_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "club_members_club_user_unique" UNIQUE("club_id","user_id"),
	CONSTRAINT "club_members_role_check" CHECK ("club_members"."role" IN ('admin', 'member'))
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opponents" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opponents_id_club_unique" UNIQUE("id","club_id"),
	CONSTRAINT "opponents_club_name_unique" UNIQUE("club_id","name")
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer NOT NULL,
	"name" text NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seasons_id_club_unique" UNIQUE("id","club_id"),
	CONSTRAINT "seasons_club_name_unique" UNIQUE("club_id","name"),
	CONSTRAINT "seasons_dates_check" CHECK ("seasons"."ends_on" IS NULL OR "seasons"."starts_on" IS NULL OR "seasons"."ends_on" >= "seasons"."starts_on")
);
--> statement-breakpoint
CREATE TABLE "fixture_match_sessions" (
	"fixture_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"match_session_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fixture_match_sessions_fixture_unique" UNIQUE("fixture_id"),
	CONSTRAINT "fixture_match_sessions_match_session_unique" UNIQUE("match_session_id")
);
--> statement-breakpoint
CREATE TABLE "fixtures" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"opponent_id" integer NOT NULL,
	"competition_name" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fixtures_id_team_unique" UNIQUE("id","team_id")
);
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "club_id" integer;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_sessions" ADD CONSTRAINT "match_sessions_id_team_unique" UNIQUE("id","team_id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_id_club_unique" UNIQUE("id","club_id");--> statement-breakpoint
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opponents" ADD CONSTRAINT "opponents_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixture_match_sessions" ADD CONSTRAINT "fixture_match_sessions_fixture_team_fk" FOREIGN KEY ("fixture_id","team_id") REFERENCES "public"."fixtures"("id","team_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "fixture_match_sessions" ADD CONSTRAINT "fixture_match_sessions_match_session_team_fk" FOREIGN KEY ("match_session_id","team_id") REFERENCES "public"."match_sessions"("id","team_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_team_club_fk" FOREIGN KEY ("team_id","club_id") REFERENCES "public"."teams"("id","club_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_season_club_fk" FOREIGN KEY ("season_id","club_id") REFERENCES "public"."seasons"("id","club_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_opponent_club_fk" FOREIGN KEY ("opponent_id","club_id") REFERENCES "public"."opponents"("id","club_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX "fixtures_club_starts_at_idx" ON "fixtures" USING btree ("club_id","starts_at");--> statement-breakpoint
CREATE INDEX "fixtures_team_idx" ON "fixtures" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "fixtures_season_idx" ON "fixtures" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "fixtures_opponent_idx" ON "fixtures" USING btree ("opponent_id");
