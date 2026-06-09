CREATE TABLE IF NOT EXISTS "player_ratings" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "primary_position" text NOT NULL,
  "secondary_position" text,
  "finishing" integer NOT NULL,
  "defense" integer NOT NULL,
  "passing" integer NOT NULL,
  "pace" integer NOT NULL,
  "physical" integer NOT NULL,
  "technique" integer NOT NULL,
  "goalkeeping" integer,
  "overall" real NOT NULL,
  "assessed_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "player_ratings_user_id_unique" UNIQUE("user_id")
);
