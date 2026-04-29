CREATE TABLE "wallet" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"address" text NOT NULL,
	"chain" text DEFAULT 'solana' NOT NULL,
	"provider" text,
	"label" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wallet_address_unique" UNIQUE("address")
);
--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;