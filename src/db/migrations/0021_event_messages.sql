CREATE TABLE IF NOT EXISTS "event_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "match_session_id" integer NOT NULL REFERENCES "match_sessions"("id") ON DELETE cascade,
  "author_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "text" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "event_messages_session_idx" ON "event_messages" ("match_session_id");
