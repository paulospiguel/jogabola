-- Arena tables: teams, players, team_members, match_sessions, match_reservations,
-- attendance, notification, payments, payment_proofs, payment_prechecks, player_trust_events

CREATE TABLE IF NOT EXISTS "teams" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "owner_id" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teams_slug_idx" ON "teams" ("slug");
--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_user_id_fk"
  FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "players" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text,
  "display_name" text NOT NULL,
  "email" text,
  "position" text,
  "experience" text,
  "invited_by_manager_id" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "players_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_invited_by_manager_id_user_id_fk"
  FOREIGN KEY ("invited_by_manager_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "player_id" text NOT NULL,
  "role" text DEFAULT 'player' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "team_members_team_player_idx" ON "team_members" ("team_id", "player_id");
--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk"
  FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_player_id_user_id_fk"
  FOREIGN KEY ("player_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_sessions" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "title" text NOT NULL,
  "location" text NOT NULL,
  "starts_at" timestamp NOT NULL,
  "ends_at" timestamp,
  "capacity" integer,
  "price_cents" integer DEFAULT 0,
  "currency" text DEFAULT 'EUR' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "match_sessions" ADD CONSTRAINT "match_sessions_team_id_teams_id_fk"
  FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_reservations" (
  "id" serial PRIMARY KEY NOT NULL,
  "match_session_id" integer NOT NULL,
  "player_id" text NOT NULL,
  "status" text DEFAULT 'reserved_unpaid' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "match_reservations" ADD CONSTRAINT "match_reservations_match_session_id_match_sessions_id_fk"
  FOREIGN KEY ("match_session_id") REFERENCES "public"."match_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "match_reservations" ADD CONSTRAINT "match_reservations_player_id_user_id_fk"
  FOREIGN KEY ("player_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendance" (
  "id" serial PRIMARY KEY NOT NULL,
  "match_session_id" integer NOT NULL,
  "player_id" text NOT NULL,
  "status" text NOT NULL,
  "note" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_match_player_idx" ON "attendance" ("match_session_id", "player_id");
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_match_session_id_match_sessions_id_fk"
  FOREIGN KEY ("match_session_id") REFERENCES "public"."match_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_player_id_user_id_fk"
  FOREIGN KEY ("player_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "metadata" jsonb,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
  "id" serial PRIMARY KEY NOT NULL,
  "match_reservation_id" integer NOT NULL,
  "amount_cents" integer NOT NULL,
  "currency" text DEFAULT 'EUR' NOT NULL,
  "method" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "provider_reference" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_match_reservation_id_match_reservations_id_fk"
  FOREIGN KEY ("match_reservation_id") REFERENCES "public"."match_reservations"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_proofs" (
  "id" serial PRIMARY KEY NOT NULL,
  "payment_id" integer NOT NULL,
  "file_url" text NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_payment_id_payments_id_fk"
  FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_prechecks" (
  "id" serial PRIMARY KEY NOT NULL,
  "payment_proof_id" integer NOT NULL,
  "decision" text NOT NULL,
  "confidence" integer NOT NULL,
  "extracted_amount" integer,
  "extracted_date" text,
  "extracted_recipient" text,
  "risk_flags" jsonb DEFAULT '[]'::jsonb,
  "raw_check" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payment_prechecks" ADD CONSTRAINT "payment_prechecks_payment_proof_id_payment_proofs_id_fk"
  FOREIGN KEY ("payment_proof_id") REFERENCES "public"."payment_proofs"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_trust_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "player_id" text NOT NULL,
  "event_type" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "player_trust_events" ADD CONSTRAINT "player_trust_events_player_id_user_id_fk"
  FOREIGN KEY ("player_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
