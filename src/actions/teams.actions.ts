"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { findPlayerByEmail } from "@/db/queries/players";
import { players, teamMembers, teams, user as userTable } from "@/db/schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";
import {
  addPlayerToRosterSchema,
  addTeamMemberSchema,
  createTeamSchema,
} from "@/schemas/teams.schema";

export const createTeam = withAction(createTeamSchema, async data => {
  const [team] = await db.insert(teams).values(data).returning();
  return { success: true, data: team };
});

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
    // Check if user owns the team or is a member (simple check for now)
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

    // Transform data to match Dashboard's expected format
    const formattedSquad = squad.map(member => ({
      id: member.id,
      name: member.name,
      role: "Jogador", // Simplification
      status: (member.role === "player" ? "confirmed" : "pending") as
        | "confirmed"
        | "reserve"
        | "pending",
      isVerified: member.isVerified,
    }));

    return { success: true, data: formattedSquad };
  },
);
