"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import {
  players,
  session,
  teamMembers,
  teams,
  user as userTable,
} from "@/db/schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";
import { sendEmail } from "@/lib/email";
import { canCreateTeam, normalizePlanTier } from "@/lib/plan-limits";
import { userCanAccessTeam, userIsTeamOwner } from "@/lib/team-access";
import {
  addPlayerToRosterSchema,
  addTeamMemberSchema,
  createTeamSchema,
  removePlayerFromRosterSchema,
  setCoCaptainSchema,
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
  /** Stats reais ainda não disponíveis — null até Fase 2 */
  goals: number | null;
  assists: number | null;
  rating: number | null;
  games: number | null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const createTeam = withAuthAction(
  createTeamSchema,
  async (user, data) => {
    const [userRecord] = await db
      .select({ planTier: userTable.planTier })
      .from(userTable)
      .where(eq(userTable.id, user.id))
      .limit(1);

    const planTier = normalizePlanTier(userRecord?.planTier);

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
      set: {
        role: data.role,
        status: data.status || "new",
        updatedAt: new Date(),
      },
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

    const canAccessTeam = await userCanAccessTeam(user.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
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
      const [_member] = await db
        .insert(teamMembers)
        .values({
          teamId,
          playerId: existingUser.id,
          role: data.admin ? "manager" : "player",
          position: data.position,
          status: "new",
        })
        .returning();

      return {
        success: true,
        data: { id: existingUser.id, name: existingUser.name },
      };
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
  const ownedTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.ownerId, user.id))
    .orderBy(teams.name);

  const memberTeams = await db
    .select({
      id: teams.id,
      name: teams.name,
      slug: teams.slug,
      location: teams.location,
      description: teams.description,
      category: teams.category,
      homeGround: teams.homeGround,
      ownerId: teams.ownerId,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.playerId, user.id))
    .orderBy(teams.name);

  const myTeams = Array.from(
    new Map(
      [...ownedTeams, ...memberTeams].map(team => [team.id, team]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  return { success: true, data: myTeams };
});

export const switchActiveTeam = withAuthAction(
  z.object({ teamId: z.number() }),
  async (user, { teamId }) => {
    const canAccessTeam = await userCanAccessTeam(user.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    await db
      .update(session)
      .set({ teamId, updatedAt: new Date() })
      .where(eq(session.userId, user.id));

    return { success: true, data: { teamId } };
  },
);

export const removePlayerFromRoster = withAuthAction(
  removePlayerFromRosterSchema,
  async (user, { teamId, playerId }) => {
    const team = await db.query.teams.findFirst({
      where: and(eq(teams.id, teamId), eq(teams.ownerId, user.id)),
    });

    if (!team) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    if (team.ownerId === playerId) {
      return { success: false, error: { code: "CANNOT_REMOVE_OWNER" } };
    }

    const member = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.playerId, playerId),
      ),
    });

    if (member) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.playerId, playerId),
          ),
        );

      return { success: true, data: { removed: true } };
    }

    const invitedPlayer = await db.query.players.findFirst({
      where: and(
        eq(players.teamId, teamId),
        eq(players.id, playerId),
        isNull(players.userId),
      ),
    });

    if (invitedPlayer) {
      await db
        .delete(players)
        .where(
          and(
            eq(players.teamId, teamId),
            eq(players.id, playerId),
            isNull(players.userId),
          ),
        );

      return { success: true, data: { removed: true } };
    }

    return { success: false, error: { code: "PLAYER_NOT_IN_TEAM" } };
  },
);

export const getTeamSquad = withAuthAction(
  z.object({ teamId: z.number() }),
  async (user, { teamId }) => {
    const canAccessTeam = await userCanAccessTeam(user.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

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

    // Stats reais (goals/assists/rating/games) serão calculados na Fase 2.
    // Por agora retornamos null para não mostrar valores falsos na UI.
    const formattedSquad = squad.map(member => ({
      ...member,
      goals: null,
      assists: null,
      rating: null,
      games: null,
    }));

    return { success: true, data: formattedSquad as SquadMember[] };
  },
);

export const getAthleteProfile = withAuthAction(
  z.object({ playerId: z.string(), teamId: z.number() }),
  async (user, { playerId, teamId }) => {
    const canAccessTeam = await userCanAccessTeam(user.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

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
          // Stats reais serão calculados na Fase 2 — não mostrar valores falsos
          rating: null,
          goals: null,
          assists: null,
          games: null,
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
      .where(
        and(
          eq(players.teamId, teamId),
          eq(players.id, playerId),
          isNull(players.userId),
        ),
      )
      .limit(1);

    if (!guest) {
      return { success: false, error: { code: "ATHLETE_NOT_FOUND" } };
    }

    return {
      success: true,
      data: {
        ...guest,
        isVerified: false,
        rating: null,
        goals: null,
        assists: null,
        games: null,
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

  const planTier = normalizePlanTier(userRecord?.planTier);

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

export const sendRosterPlayerEmail = withAuthAction(
  z.object({
    teamId: z.number(),
    playerId: z.string(),
    subject: z.string().min(3).max(120),
    message: z.string().min(5).max(2000),
  }),
  async (user, { teamId, playerId, subject, message }) => {
    const canAccessTeam = await userCanAccessTeam(user.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    const [registered] = await db
      .select({
        email: userTable.email,
        name: userTable.name,
      })
      .from(teamMembers)
      .innerJoin(userTable, eq(teamMembers.playerId, userTable.id))
      .where(
        and(eq(teamMembers.teamId, teamId), eq(teamMembers.playerId, playerId)),
      )
      .limit(1);

    const invited = registered
      ? null
      : await db.query.players.findFirst({
          where: and(
            eq(players.teamId, teamId),
            eq(players.id, playerId),
            isNull(players.userId),
          ),
        });

    const to = registered?.email ?? invited?.email ?? null;
    const name = registered?.name ?? invited?.displayName ?? "Atleta";

    if (!to) {
      return { success: false, error: { code: "EMAIL_NOT_AVAILABLE" } };
    }

    const result = await sendEmail({
      to,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827">
          <p>Olá ${escapeHtml(name)},</p>
          <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
          <p style="margin-top:24px;color:#6b7280;font-size:12px">Mensagem enviada através do JogaBola.</p>
        </div>
      `,
    });

    if (!result.success) {
      return { success: false, error: { code: "EMAIL_SEND_FAILED" } };
    }

    return { success: true, data: { sent: true } };
  },
);

export const setCoCaptain = withAuthAction(
  setCoCaptainSchema,
  async (user, { teamId, playerId, makeCoCaptain }) => {
    // Only the owner can promote/demote co-captains.
    const isOwner = await userIsTeamOwner(user.id, teamId);
    if (!isOwner) {
      return { success: false, error: { code: "FORBIDDEN" } };
    }

    const team = await db.query.teams.findFirst({
      columns: { ownerId: true },
      where: eq(teams.id, teamId),
    });
    if (!team) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    // Never modify the owner's own role.
    if (team.ownerId === playerId) {
      return { success: false, error: { code: "CANNOT_MODIFY_OWNER" } };
    }

    const member = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.playerId, playerId),
      ),
    });
    if (!member) {
      return { success: false, error: { code: "PLAYER_NOT_IN_TEAM" } };
    }

    const [updated] = await db
      .update(teamMembers)
      .set({
        role: makeCoCaptain ? "manager" : "player",
        updatedAt: new Date(),
      })
      .where(
        and(eq(teamMembers.teamId, teamId), eq(teamMembers.playerId, playerId)),
      )
      .returning();

    return { success: true, data: updated };
  },
);
