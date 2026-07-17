ALTER TABLE "match_sessions"
  ADD COLUMN "payment_required" boolean NOT NULL DEFAULT false,
  ADD COLUMN "payment_deadline_hours" integer;
