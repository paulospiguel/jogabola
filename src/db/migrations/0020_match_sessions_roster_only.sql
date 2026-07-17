ALTER TABLE "match_sessions"
ADD COLUMN IF NOT EXISTS "roster_only" boolean DEFAULT false NOT NULL;
