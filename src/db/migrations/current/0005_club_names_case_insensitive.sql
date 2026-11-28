-- Stage 2 review: season and opponent names are unique per club regardless
-- of letter case. The case-insensitive unique indexes replace the exact-match
-- constraints. If a club already holds names that differ only by case, index
-- creation fails and the migration rolls back with no change; rename those
-- rows first.
ALTER TABLE "opponents" DROP CONSTRAINT "opponents_club_name_unique";--> statement-breakpoint
ALTER TABLE "seasons" DROP CONSTRAINT "seasons_club_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "opponents_club_name_ci_unique" ON "opponents" USING btree ("club_id",lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_club_name_ci_unique" ON "seasons" USING btree ("club_id",lower("name"));