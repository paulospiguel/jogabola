"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { findPlayerByEmail } from "@/db/queries/players";
import {
  players,
  session,
  teamMembers,
  teams,
  user as userTable,
} from "@/db/schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";
import {
  addPlayerToRosterSchema,
  addTeamMemberSchema,
  createTeamSchema,
} from "@/schemas/teams.schema";

export const createTeam = withAuthAction(
  createTeamSchema,
  async (user, data) => {
    const existingName = await db.query.teams.findFirst({
      where: eq(teams.name, data.name.trim()),
    });

    if (existingName) {
      return { success: false, error: { code: "TEAM_NAME_ALREADY_EXISTS" } };
    }

    const existingSlug = await db.query.teams.findFirst({
      where: eq(teams.slug, data.slug.trim()),
    });

    if (existingSlug) {
      return { success: false, error: { code: "TEAM_SLUG_ALREADY_EXISTS" } };
    }

    const [team] = await db
      .insert(teams)
      .values({ ...data, ownerId: user.id })
      .returning();

    await db.insert(teamMembers).values({
      teamId: team.id,
      playerId: user.id,
      role: "owner",
    });

    await db
      .update(session)
      .set({ teamId: team.id, updatedAt: new Date() })
      .where(eq(session.userId, user.id));

    return { success: true, data: team };
  },
);

export const addTeamMember = withAction(addTeamMemberSchema, async data => {
  const [member] = await db
    .insert(teamMembers)
    .values(data)
    .onConflictDoUpdate({
      target: [teamMembers.teamId, teamMembers.playerId],
      set: { role: data.role, updatedAt: new Date() },
    })
    .returning();
  return { success: true, data: member };
});

export const addPlayerToRoster = withAuthAction(
  addPlayerToRosterSchema,
  async (user, data) => {
    const email = data.email.toLowerCase().trim();
    const existing = await findPlayerByEmail(email);
    if (existing) {
      return { success: false, error: { code: "PLAYER_EMAIL_ALREADY_EXISTS" } };
    }

    const [created] = await db
      .insert(players)
      .values({
        id: crypto.randomUUID(),
        displayName: data.name.trim(),
        email,
        position: data.position || null,
        experience: data.experience,
        invitedByManagerId: user.id,
      })
      .returning({ id: players.id, name: players.displayName });

    return { success: true, data: created };
  },
);

export const getMyTeams = withAuthAction(z.any(), async user => {
  const myTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.ownerId, user.id))
    .orderBy(teams.name);

  return { success: true, data: myTeams };
});

export const getTeamSquad = withAuthAction(
  z.object({ teamId: z.number() }),
  async (user, { teamId }) => {
    const squad = await db
      .select({
        id: teamMembers.playerId,
        name: userTable.name,
        role: teamMembers.role,
        isVerified: userTable.emailVerified,
      })
      .from(teamMembers)
      .innerJoin(userTable, eq(teamMembers.playerId, userTable.id))
      .where(eq(teamMembers.teamId, teamId));

    const formattedSquad = squad.map(member => ({
      id: member.id,
      name: member.name,
      role: "player", // Simplification
      status: (member.role === "player" ? "confirmed" : "pending") as
        | "confirmed"
        | "reserve"
        | "pending",
      isVerified: member.isVerified,
    }));

    return { success: true, data: formattedSquad };
  },
);
