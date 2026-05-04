CREATE TABLE IF NOT EXISTS "team_payment_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE cascade,
  "stripe_enabled" boolean NOT NULL DEFAULT false,
  "stripe_account_id" text,
  "mbway_enabled" boolean NOT NULL DEFAULT false,
  "mbway_phone" text,
  "mbway_name" text,
  "cash_enabled" boolean NOT NULL DEFAULT true,
  "cash_instructions" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "team_payment_settings_team_idx" ON "team_payment_settings" ("team_id");
