ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "marked_by_user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "manual_note" text;
