-- Add soft-delete and captain censorship columns to event_messages
ALTER TABLE "event_messages" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "event_messages" ADD COLUMN IF NOT EXISTS "censored_at" timestamp;
