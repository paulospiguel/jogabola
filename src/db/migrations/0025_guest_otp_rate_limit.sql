ALTER TABLE "guest_event_otp" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;
ALTER TABLE "guest_event_otp" ADD COLUMN "locked_until" timestamp;
