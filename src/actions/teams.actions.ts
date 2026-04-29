"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { players, teamMembers, teams } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  addPlayerToRosterSchema,
  addTeamMemberSchema,
  createTeamSchema,
} from "@/schemas/teams.schema";
import type { ActionResult } from "@/types/common";

export async function createTeamAction(
  input: unknown,
): Promise<ActionResult<typeof teams.$inferSelect>> {
  return createTeam(input);
}

export async function createTeam(
  input: unknown,
): Promise<ActionResult<typeof teams.$inferSelect>> {
  const parsed = createTeamSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const [team] = await db.insert(teams).values(parsed.data).returning();

  return { success: true, data: team };
}

export async function addTeamMemberAction(
  input: unknown,
): Promise<ActionResult<typeof teamMembers.$inferSelect>> {
  return addTeamMember(input);
}

export async function addTeamMember(
  input: unknown,
): Promise<ActionResult<typeof teamMembers.$inferSelect>> {
  const parsed = addTeamMemberSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const [member] = await db
    .insert(teamMembers)
    .values(parsed.data)
    .onConflictDoUpdate({
      target: [teamMembers.teamId, teamMembers.playerId],
      set: { role: parsed.data.role, updatedAt: new Date() },
    })
    .returning();

  return { success: true, data: member };
}

export async function addPlayerToRosterAction(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  return addPlayerToRoster(input);
}

export async function addPlayerToRoster(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  const managerId = session?.user?.id;

  if (!managerId) {
    return { success: false, error: { code: "UNAUTHORIZED" } };
  }

  const parsed = addPlayerToRosterSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: { code: "PLAYER_EMAIL_ALREADY_EXISTS" } };
  }

  const [created] = await db
    .insert(players)
    .values({
      id: crypto.randomUUID(),
      displayName: parsed.data.name.trim(),
      email,
      position: parsed.data.position || null,
      experience: parsed.data.experience,
      invitedByManagerId: managerId,
    })
    .returning({ id: players.id, name: players.displayName });

  return { success: true, data: created };
}

function validationError(fieldErrors: Record<string, string[] | undefined>) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).filter(([, value]) => value?.length),
      ) as Record<string, string[]>,
    },
  } as const;
}
