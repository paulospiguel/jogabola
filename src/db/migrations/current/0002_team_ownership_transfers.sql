CREATE TABLE "team_ownership_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text,
	"to_email" text,
	"token_hash" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	CONSTRAINT "team_ownership_transfers_status_check" CHECK ("team_ownership_transfers"."status" IN ('pending', 'accepted', 'cancelled', 'expired')),
	CONSTRAINT "team_ownership_transfers_recipient_check" CHECK ("team_ownership_transfers"."to_user_id" IS NOT NULL OR "team_ownership_transfers"."to_email" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "team_ownership_transfers" ADD CONSTRAINT "team_ownership_transfers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_ownership_transfers" ADD CONSTRAINT "team_ownership_transfers_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_ownership_transfers" ADD CONSTRAINT "team_ownership_transfers_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "team_ownership_transfers_one_pending_idx" ON "team_ownership_transfers" USING btree ("team_id") WHERE "team_ownership_transfers"."status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "team_ownership_transfers_token_hash_idx" ON "team_ownership_transfers" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "team_ownership_transfers_to_user_idx" ON "team_ownership_transfers" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "team_ownership_transfers_to_email_idx" ON "team_ownership_transfers" USING btree ("to_email");