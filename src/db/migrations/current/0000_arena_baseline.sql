-- Canonical Arena baseline. The earlier SQL and its journal remain historical.
-- Existing installations may use manually applied Arena SQL or a Drizzle push.
DO $baseline$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname = 'public')
    AND (
      NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user'
          AND column_name = 'id' AND data_type = 'text'
      )
      OR to_regclass('public.teams') IS NULL
      OR to_regclass('public.team_members') IS NULL
      OR to_regclass('public.match_sessions') IS NULL
      OR to_regclass('public.match_reservations') IS NULL
      OR to_regclass('public.payments') IS NULL
    )
  THEN
    RAISE EXCEPTION 'Expected an empty database or an Arena schema with text user IDs and intact Arena tables';
  END IF;
END;
$baseline$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_session_id" integer NOT NULL,
	"player_id" text,
	"guest_name" text,
	"guest_email" text,
	"status" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_session_id" integer NOT NULL,
	"author_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"censored_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fines" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" text NOT NULL,
	"match_session_id" integer,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guest_event_otp" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"match_session_id" integer NOT NULL,
	"otp" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_session_id" integer NOT NULL,
	"player_id" text NOT NULL,
	"guest_access_token" text,
	"status" text DEFAULT 'reserved_unpaid' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"location" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"capacity" integer,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"recurrence" text DEFAULT 'once' NOT NULL,
	"recurrence_group_id" text,
	"price_cents" integer DEFAULT 0,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"payment_required" boolean DEFAULT false NOT NULL,
	"payment_deadline_hours" integer,
	"roster_only" boolean DEFAULT false NOT NULL,
	"roster_priority_hours" integer DEFAULT 0,
	"transfer_requires_proof" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_notices" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_session_id" integer NOT NULL,
	"author_id" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
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
CREATE TABLE IF NOT EXISTS "payment_proofs" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer NOT NULL,
	"file_url" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_reservation_id" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"method" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider_reference" text,
	"marked_by_user_id" text,
	"manual_note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_trust_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" text NOT NULL,
	"event_type" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restricted_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" text NOT NULL,
	"reason_code" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"primary_position" text NOT NULL,
	"secondary_position" text,
	"finishing" integer NOT NULL,
	"defense" integer NOT NULL,
	"passing" integer NOT NULL,
	"pace" integer NOT NULL,
	"physical" integer NOT NULL,
	"technique" integer NOT NULL,
	"goalkeeping" integer,
	"overall" real NOT NULL,
	"assessed_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_payment_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"stripe_enabled" boolean DEFAULT false NOT NULL,
	"stripe_account_id" text,
	"mbway_enabled" boolean DEFAULT false NOT NULL,
	"mbway_phone" text,
	"mbway_name" text,
	"cash_enabled" boolean DEFAULT true NOT NULL,
	"cash_instructions" text,
	"transfer_enabled" boolean DEFAULT false NOT NULL,
	"transfer_iban" text,
	"transfer_name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "players" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"display_name" text NOT NULL,
	"email" text,
	"position" text,
	"experience" text,
	"invited_by_manager_id" text,
	"team_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"player_id" text NOT NULL,
	"role" text DEFAULT 'player' NOT NULL,
	"position" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"location" text,
	"description" text,
	"category" text,
	"home_ground" text,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_transfer_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"new_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_i_d" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"completed" boolean DEFAULT false,
	"custom_fields" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"team_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"locale" text DEFAULT 'pt' NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"role" text,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"plan_tier" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
-- Restore additive changes that did not reach the historical Drizzle journal.
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'pt' NOT NULL,
  ADD COLUMN IF NOT EXISTS "notifications_enabled" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "role" text,
  ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "plan_tier" text DEFAULT 'free' NOT NULL;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "team_id" integer;
--> statement-breakpoint
ALTER TABLE "passkey" ADD COLUMN IF NOT EXISTS "aaguid" text;
--> statement-breakpoint
ALTER TABLE "teams"
  ADD COLUMN IF NOT EXISTS "location" text,
  ADD COLUMN IF NOT EXISTS "description" text,
  ADD COLUMN IF NOT EXISTS "category" text,
  ADD COLUMN IF NOT EXISTS "home_ground" text;
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "team_id" integer;
--> statement-breakpoint
ALTER TABLE "team_members"
  ADD COLUMN IF NOT EXISTS "position" text,
  ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'new' NOT NULL;
--> statement-breakpoint
ALTER TABLE "match_sessions"
  ADD COLUMN IF NOT EXISTS "slug" text,
  ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'scheduled' NOT NULL,
  ADD COLUMN IF NOT EXISTS "recurrence" text DEFAULT 'once' NOT NULL,
  ADD COLUMN IF NOT EXISTS "recurrence_group_id" text,
  ADD COLUMN IF NOT EXISTS "payment_required" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "payment_deadline_hours" integer,
  ADD COLUMN IF NOT EXISTS "roster_only" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "roster_priority_hours" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "transfer_requires_proof" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "match_reservations" ADD COLUMN IF NOT EXISTS "guest_access_token" text;
--> statement-breakpoint
ALTER TABLE "attendance"
  ALTER COLUMN "player_id" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "guest_name" text,
  ADD COLUMN IF NOT EXISTS "guest_email" text;
--> statement-breakpoint
ALTER TABLE "guest_event_otp"
  ADD COLUMN IF NOT EXISTS "attempts" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "locked_until" timestamp;
--> statement-breakpoint
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "marked_by_user_id" text,
  ADD COLUMN IF NOT EXISTS "manual_note" text;
--> statement-breakpoint
ALTER TABLE "team_payment_settings"
  ADD COLUMN IF NOT EXISTS "transfer_enabled" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "transfer_iban" text,
  ADD COLUMN IF NOT EXISTS "transfer_name" text;
--> statement-breakpoint
ALTER TABLE "event_messages"
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamp,
  ADD COLUMN IF NOT EXISTS "censored_at" timestamp;
--> statement-breakpoint
-- Normalize equivalent constraints created with PostgreSQL's automatic name.
-- Detect a conflicting constraint before adding or renaming any key.
DO $constraints$
DECLARE
  rule record;
  existing record;
  source_table regclass;
  source_column smallint;
BEGIN
  FOR rule IN
    SELECT * FROM (VALUES
      ('attendance', 'attendance_match_session_id_match_sessions_id_fk', 'match_session_id', 'f', 'FOREIGN KEY (match_session_id) REFERENCES match_sessions(id) ON DELETE CASCADE'),
      ('attendance', 'attendance_player_id_user_id_fk', 'player_id', 'f', 'FOREIGN KEY (player_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('event_messages', 'event_messages_match_session_id_match_sessions_id_fk', 'match_session_id', 'f', 'FOREIGN KEY (match_session_id) REFERENCES match_sessions(id) ON DELETE CASCADE'),
      ('event_messages', 'event_messages_author_id_user_id_fk', 'author_id', 'f', 'FOREIGN KEY (author_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('fines', 'fines_player_id_user_id_fk', 'player_id', 'f', 'FOREIGN KEY (player_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('fines', 'fines_match_session_id_match_sessions_id_fk', 'match_session_id', 'f', 'FOREIGN KEY (match_session_id) REFERENCES match_sessions(id) ON DELETE CASCADE'),
      ('guest_event_otp', 'guest_event_otp_match_session_id_match_sessions_id_fk', 'match_session_id', 'f', 'FOREIGN KEY (match_session_id) REFERENCES match_sessions(id) ON DELETE CASCADE'),
      ('match_reservations', 'match_reservations_match_session_id_match_sessions_id_fk', 'match_session_id', 'f', 'FOREIGN KEY (match_session_id) REFERENCES match_sessions(id) ON DELETE CASCADE'),
      ('match_reservations', 'match_reservations_player_id_user_id_fk', 'player_id', 'f', 'FOREIGN KEY (player_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('match_sessions', 'match_sessions_team_id_teams_id_fk', 'team_id', 'f', 'FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE'),
      ('event_notices', 'event_notices_match_session_id_match_sessions_id_fk', 'match_session_id', 'f', 'FOREIGN KEY (match_session_id) REFERENCES match_sessions(id) ON DELETE CASCADE'),
      ('event_notices', 'event_notices_author_id_user_id_fk', 'author_id', 'f', 'FOREIGN KEY (author_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('notification', 'notification_user_id_user_id_fk', 'user_id', 'f', 'FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('payment_prechecks', 'payment_prechecks_payment_proof_id_payment_proofs_id_fk', 'payment_proof_id', 'f', 'FOREIGN KEY (payment_proof_id) REFERENCES payment_proofs(id) ON DELETE CASCADE'),
      ('payment_proofs', 'payment_proofs_payment_id_payments_id_fk', 'payment_id', 'f', 'FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE'),
      ('payments', 'payments_match_reservation_id_match_reservations_id_fk', 'match_reservation_id', 'f', 'FOREIGN KEY (match_reservation_id) REFERENCES match_reservations(id) ON DELETE CASCADE'),
      ('payments', 'payments_marked_by_user_id_user_id_fk', 'marked_by_user_id', 'f', 'FOREIGN KEY (marked_by_user_id) REFERENCES "user"(id) ON DELETE SET NULL'),
      ('player_trust_events', 'player_trust_events_player_id_user_id_fk', 'player_id', 'f', 'FOREIGN KEY (player_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('restricted_players', 'restricted_players_player_id_user_id_fk', 'player_id', 'f', 'FOREIGN KEY (player_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('player_ratings', 'player_ratings_user_id_user_id_fk', 'user_id', 'f', 'FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('team_payment_settings', 'team_payment_settings_team_id_teams_id_fk', 'team_id', 'f', 'FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE'),
      ('players', 'players_user_id_user_id_fk', 'user_id', 'f', 'FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL'),
      ('players', 'players_invited_by_manager_id_user_id_fk', 'invited_by_manager_id', 'f', 'FOREIGN KEY (invited_by_manager_id) REFERENCES "user"(id) ON DELETE SET NULL'),
      ('players', 'players_team_id_teams_id_fk', 'team_id', 'f', 'FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE'),
      ('team_members', 'team_members_team_id_teams_id_fk', 'team_id', 'f', 'FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE'),
      ('team_members', 'team_members_player_id_user_id_fk', 'player_id', 'f', 'FOREIGN KEY (player_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('teams', 'teams_owner_id_user_id_fk', 'owner_id', 'f', 'FOREIGN KEY (owner_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('account', 'account_user_id_user_id_fk', 'user_id', 'f', 'FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('account_transfer_requests', 'account_transfer_requests_user_id_user_id_fk', 'user_id', 'f', 'FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('passkey', 'passkey_user_id_user_id_fk', 'user_id', 'f', 'FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('profile', 'profile_user_id_user_id_fk', 'user_id', 'f', 'FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('session', 'session_user_id_user_id_fk', 'user_id', 'f', 'FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE'),
      ('session', 'session_team_id_teams_id_fk', 'team_id', 'f', 'FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL'),
      ('match_sessions', 'match_sessions_slug_unique', 'slug', 'u', 'UNIQUE (slug)'),
      ('player_ratings', 'player_ratings_user_id_unique', 'user_id', 'u', 'UNIQUE (user_id)'),
      ('players', 'players_email_unique', 'email', 'u', 'UNIQUE (email)'),
      ('profile', 'profile_user_id_unique', 'user_id', 'u', 'UNIQUE (user_id)'),
      ('session', 'session_token_unique', 'token', 'u', 'UNIQUE (token)'),
      ('user', 'user_email_unique', 'email', 'u', 'UNIQUE (email)')
    ) AS rules(table_name, constraint_name, column_name, kind, definition)
  LOOP
    source_table := format('public.%I', rule.table_name)::regclass;
    SELECT attnum INTO STRICT source_column
      FROM pg_catalog.pg_attribute
      WHERE attrelid = source_table AND attname = rule.column_name AND NOT attisdropped;

    FOR existing IN
      SELECT conname, convalidated, pg_get_constraintdef(oid) AS definition
      FROM pg_catalog.pg_constraint
      WHERE conrelid = source_table
        AND (conname = rule.constraint_name
          OR (contype::text = rule.kind AND conkey = ARRAY[source_column]))
    LOOP
      IF NOT existing.convalidated OR existing.definition <> rule.definition THEN
        RAISE EXCEPTION 'Unexpected constraint on %.%: %',
          rule.table_name, rule.column_name, existing.conname;
      END IF;
    END LOOP;

    SELECT conname INTO existing
      FROM pg_catalog.pg_constraint
      WHERE conrelid = source_table AND contype::text = rule.kind AND conkey = ARRAY[source_column]
      ORDER BY (conname = rule.constraint_name) DESC, conname
      LIMIT 1;

    IF NOT FOUND THEN
      EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s',
        source_table, rule.constraint_name, rule.definition);
    ELSIF existing.conname <> rule.constraint_name THEN
      EXECUTE format('ALTER TABLE %s RENAME CONSTRAINT %I TO %I',
        source_table, existing.conname, rule.constraint_name);
    END IF;
  END LOOP;
END;
$constraints$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_match_player_idx" ON "attendance" USING btree ("match_session_id","player_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_messages_session_idx" ON "event_messages" USING btree ("match_session_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "match_reservations_session_player_idx" ON "match_reservations" USING btree ("match_session_id","player_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "team_payment_settings_team_idx" ON "team_payment_settings" USING btree ("team_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "team_members_team_player_idx" ON "team_members" USING btree ("team_id","player_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teams_slug_idx" ON "teams" USING btree ("slug");
--> statement-breakpoint
DO $indexes$
DECLARE
  rule record;
BEGIN
  FOR rule IN
    SELECT * FROM (VALUES
      ('attendance', 'attendance_match_player_idx', 'CREATE UNIQUE INDEX attendance_match_player_idx ON public.attendance USING btree (match_session_id, player_id)'),
      ('event_messages', 'event_messages_session_idx', 'CREATE INDEX event_messages_session_idx ON public.event_messages USING btree (match_session_id)'),
      ('match_reservations', 'match_reservations_session_player_idx', 'CREATE UNIQUE INDEX match_reservations_session_player_idx ON public.match_reservations USING btree (match_session_id, player_id)'),
      ('team_payment_settings', 'team_payment_settings_team_idx', 'CREATE UNIQUE INDEX team_payment_settings_team_idx ON public.team_payment_settings USING btree (team_id)'),
      ('team_members', 'team_members_team_player_idx', 'CREATE UNIQUE INDEX team_members_team_player_idx ON public.team_members USING btree (team_id, player_id)'),
      ('teams', 'teams_slug_idx', 'CREATE UNIQUE INDEX teams_slug_idx ON public.teams USING btree (slug)')
    ) AS rules(table_name, index_name, definition)
  LOOP
    IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_index AS pg_index
      WHERE pg_index.indexrelid = to_regclass(format('public.%I', rule.index_name))
        AND pg_index.indrelid = to_regclass(format('public.%I', rule.table_name))
        AND pg_index.indisvalid
        AND pg_get_indexdef(pg_index.indexrelid) = rule.definition
    ) THEN
      RAISE EXCEPTION 'Unexpected index on %: %', rule.table_name, rule.index_name;
    END IF;
  END LOOP;
END;
$indexes$;
