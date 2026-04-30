"use server";

import { db } from "@/db/client";
import { players, teamMembers, teams } from "@/db/schema";
import { findPlayerByEmail } from "@/db/queries/players";
import {
  addPlayerToRosterSchema,
  addTeamMemberSchema,
  createTeamSchema,
} from "@/schemas/teams.schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";

export const createTeam = withAction(createTeamSchema, async (data) => {
  const [team] = await db.insert(teams).values(data).returning();
  return { success: true, data: team };
});

export const addTeamMember = withAction(addTeamMemberSchema, async (data) => {
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
