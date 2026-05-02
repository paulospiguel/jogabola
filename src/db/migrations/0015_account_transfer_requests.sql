CREATE TABLE IF NOT EXISTS "account_transfer_requests" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "new_email" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_transfer_requests"
  ADD CONSTRAINT "account_transfer_requests_user_id_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
