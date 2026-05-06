"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
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
import { canCreateTeam, type PlanTier } from "@/lib/plan-limits";
import {
  addPlayerToRosterSchema,
  addTeamMemberSchema,
  createTeamSchema,
} from "@/schemas/teams.schema";

export interface SquadMember {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  position: string | null;
  role: string;
  status: "confirmed" | "reserve" | "pending" | "refused" | "new";
  isVerified: boolean | null;
  createdAt: Date | null;
  goals: number;
  assists: number;
  rating: number;
  games: number;
}

export const createTeam = withAuthAction(
  createTeamSchema,
  async (user, data) => {
    const [userRecord] = await db
      .select({ planTier: userTable.planTier })
      .from(userTable)
      .where(eq(userTable.id, user.id))
      .limit(1);

    const planTier = (userRecord?.planTier ?? "BASE") as PlanTier;

    const [{ teamCount }] = await db
      .select({ teamCount: sql<number>`count(*)::int` })
      .from(teams)
      .where(eq(teams.ownerId, user.id));

    if (!canCreateTeam(planTier, teamCount)) {
      return { success: false, error: { code: "PLAN_LIMIT_REACHED" } };
    }

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
      set: { role: data.role, status: data.status || "new", updatedAt: new Date() },
    })
    .returning();
  return { success: true, data: member };
});

export const addPlayerToRoster = withAuthAction(
  addPlayerToRosterSchema,
  async (user, data) => {
    const email = data.email.toLowerCase().trim();
    const teamId = data.teamId;

    if (!teamId) {
      return { success: false, error: { code: "TEAM_REQUIRED" } };
    }

    // 1. Check if user already exists in the platform
    const existingUser = await db.query.user.findFirst({
      where: eq(userTable.email, email),
    });

    if (existingUser) {
      // Check if already a member of this team
      const existingMember = await db.query.teamMembers.findFirst({
        where: and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.playerId, existingUser.id),
        ),
      });

      if (existingMember) {
        return {
          success: false,
          error: { code: "PLAYER_ALREADY_IN_TEAM" },
        };
      }

      // Add as team member with "new" status
      const [member] = await db
        .insert(teamMembers)
        .values({
          teamId,
          playerId: existingUser.id,
          role: "player",
          position: data.position,
          status: "new",
        })
        .returning();

      return { success: true, data: { id: existingUser.id, name: existingUser.name } };
    }

    // 2. Check if already in the players table (invited but not yet a user)
    const existingPlayer = await db.query.players.findFirst({
      where: eq(players.email, email),
    });

    if (existingPlayer) {
      // If they are in players table, they might be invited to another team or this one
      if (existingPlayer.teamId === teamId) {
        return {
          success: false,
          error: { code: "PLAYER_ALREADY_INVITED_TO_TEAM" },
        };
      }
      
      // Update the player record or just return error? 
      // For now, let's say they can only be in one team's pending list or we need a many-to-many for players too.
      // But let's keep it simple: error if already invited elsewhere.
      return {
        success: false,
        error: { code: "PLAYER_ALREADY_INVITED_ELSEWHERE" },
      };
    }

    // 3. Create new player record
    const [created] = await db
      .insert(players)
      .values({
        id: crypto.randomUUID(),
        displayName: data.name.trim(),
        email,
        position: data.position || null,
        experience: data.experience,
        invitedByManagerId: user.id,
        teamId: teamId,
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
    const registeredMembers = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        position: teamMembers.position,
        role: teamMembers.role,
        status: teamMembers.status,
        isVerified: userTable.emailVerified,
        createdAt: userTable.createdAt,
      })
      .from(teamMembers)
      .innerJoin(userTable, eq(teamMembers.playerId, userTable.id))
      .where(eq(teamMembers.teamId, teamId));

    const invitedPlayers = await db
      .select({
        id: players.id,
        name: players.displayName,
        email: players.email,
        image: sql<string | null>`null`,
        position: players.position,
        role: sql<string>`'player'`,
        status: sql<string>`'new'`,
        isVerified: sql<boolean>`false`,
        createdAt: players.createdAt,
      })
      .from(players)
      .where(and(eq(players.teamId, teamId), isNull(players.userId)));

    const squad = [...registeredMembers, ...invitedPlayers];

    const formattedSquad = squad.map(member => ({
      ...member,
      // Mocked stats for now to match UI expectations
      goals: 0,
      assists: 0,
      rating: 7.0,
      games: 0,
    }));

    return { success: true, data: formattedSquad as SquadMember[] };
  },
);

export const getAthleteProfile = withAuthAction(
  z.object({ playerId: z.string(), teamId: z.number() }),
  async (user, { playerId, teamId }) => {
    const [athlete] = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        position: teamMembers.position,
        role: teamMembers.role,
        status: teamMembers.status,
        isVerified: userTable.emailVerified,
        createdAt: userTable.createdAt,
      })
      .from(teamMembers)
      .innerJoin(userTable, eq(teamMembers.playerId, userTable.id))
      .where(
        and(eq(teamMembers.teamId, teamId), eq(teamMembers.playerId, playerId)),
      )
      .limit(1);

    if (athlete) {
      return {
        success: true,
        data: {
          ...athlete,
          isVerified: true,
          rating: 8.5,
          goals: 12,
          assists: 8,
          games: 15,
        } as SquadMember,
      };
    }

    const [guest] = await db
      .select({
        id: players.id,
        name: players.displayName,
        email: players.email,
        image: sql<string | null>`null`,
        position: players.position,
        role: sql<string>`'player'`,
        status: sql<string>`'new'`,
        isVerified: sql<boolean>`false`,
        createdAt: players.createdAt,
      })
      .from(players)
      .where(and(eq(players.teamId, teamId), eq(players.id, playerId), isNull(players.userId)))
      .limit(1);

    if (!guest) {
      return { success: false, error: { code: "ATHLETE_NOT_FOUND" } };
    }

    return {
      success: true,
      data: {
        ...guest,
        isVerified: false,
        rating: 0,
        goals: 0,
        assists: 0,
        games: 0,
      } as SquadMember,
    };
  },
);

export const getUserPlanTier = withAuthAction(z.any(), async user => {
  const [userRecord] = await db
    .select({ planTier: userTable.planTier })
    .from(userTable)
    .where(eq(userTable.id, user.id))
    .limit(1);

  const planTier = (userRecord?.planTier ?? "BASE") as PlanTier;

  const [{ teamCount }] = await db
    .select({ teamCount: sql<number>`count(*)::int` })
    .from(teams)
    .where(eq(teams.ownerId, user.id));

  return {
    success: true,
    data: {
      planTier,
      teamCount,
      canCreateTeam: canCreateTeam(planTier, teamCount),
    },
  };
});
