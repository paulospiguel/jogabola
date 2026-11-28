import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { clubs } from "./clubs";
import { user } from "./users";

export const teams = pgTable(
  "teams",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    location: text("location"),
    description: text("description"),
    category: text("category"),
    homeGround: text("home_ground"),
    // Optional club scope (ADR 0004). Null for existing teams.
    clubId: integer("club_id").references(() => clubs.id, {
      onDelete: "restrict",
    }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  table => ({
    slugIdx: uniqueIndex("teams_slug_idx").on(table.slug),
    // Target of the composite FK that keeps a fixture's team in its club.
    idClubUnique: unique("teams_id_club_unique").on(table.id, table.clubId),
  }),
);

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  displayName: text("display_name").notNull(),
  email: text("email").unique(),
  position: text("position"),
  experience: text("experience"),
  invitedByManagerId: text("invited_by_manager_id").references(() => user.id, {
    onDelete: "set null",
  }),
  teamId: integer("team_id").references(() => teams.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("player"),
    position: text("position"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  table => ({
    memberIdx: uniqueIndex("team_members_team_player_idx").on(
      table.teamId,
      table.playerId,
    ),
  }),
);
