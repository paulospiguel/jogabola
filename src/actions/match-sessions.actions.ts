"use server";

import { and, desc, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { queryEventById, queryEvents } from "@/db/queries/events";
import {
  attendance,
  matchReservations,
  matchSessions,
  teams,
  user,
} from "@/db/schema";
import { getAuthUser, withAction } from "@/lib/action-helpers";
import { getAccessibleTeamIds, userCanAccessTeam } from "@/lib/team-access";
import {
  createMatchReservationSchema,
  createMatchSessionSchema,
} from "@/schemas/match-sessions.schema";
import type { EventStatus } from "@/types/events";

function toEventStatus(status: string): EventStatus {
  if (status === "confirmed" || status === "completed") return "confirmed";
  if (status === "cancelled" || status === "canceled") return "cancelled";
  return "scheduled";
}

export const createMatchSession = withAction(
  createMatchSessionSchema,
  async data => {
    const [matchSession] = await db
      .insert(matchSessions)
      .values(data)
      .returning();
    return { success: true, data: matchSession };
  },
);

export const createMatchReservation = withAction(
  createMatchReservationSchema,
  async data => {
    const [reservation] = await db
      .insert(matchReservations)
      .values(data)
      .returning();
    return { success: true, data: reservation };
  },
);

export async function createEvent(input: {
  title: string;
  description?: string;
  type: "game" | "training" | "challenge";
  location: string;
  startDate: Date;
  endDate?: Date;
  maxParticipants?: string;
  isPublic?: boolean;
  organizerId?: string;
  recurrence?: string;
  teamId?: number;
  priceCents?: number;
  paymentRequired?: boolean;
  paymentDeadlineHours?: number | null;
  rosterOnly?: boolean;
  rosterPriorityHours?: number;
  transferRequiresProof?: boolean;
  mbwayEnabled?: boolean;
  mbwayPhone?: string;
  invitedPlayers?: {
    id: string;
    name: string;
    email?: string | null;
    isVerified?: boolean | null;
  }[];
}) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const manager = await db.query.user.findFirst({
    where: eq(user.id, authUser.id),
  });

  if (manager?.role !== "captain") {
    return { success: false as const, error: { code: "MANAGER_REQUIRED" } };
  }

  let teamId = input.teamId ?? authUser.teamId ?? null;
  if (teamId) {
    const canAccessTeam = await userCanAccessTeam(authUser.id, teamId);
    if (!canAccessTeam) {
      return { success: false as const, error: { code: "TEAM_NOT_FOUND" } };
    }
  }

  if (!teamId) {
    const accessibleTeamIds = await getAccessibleTeamIds(authUser.id);
    teamId = accessibleTeamIds[0] ?? null;
  }

  if (!teamId) {
    const slug = `team-${authUser.id.slice(0, 8)}`;
    const [created] = await db
      .insert(teams)
      .values({ name: "Minha Equipa", slug, ownerId: authUser.id })
      .returning({ id: teams.id });
    teamId = created.id;
  }

  const [event] = await db
    .insert(matchSessions)
    .values({
      teamId,
      title: input.title,
      location: input.location,
      startsAt: input.startDate,
      endsAt: input.endDate,
      capacity: input.maxParticipants
        ? Number.parseInt(input.maxParticipants, 10)
        : null,
      recurrence: input.recurrence || "once",
      currency: "EUR",
      priceCents: input.priceCents ?? 0,
      paymentRequired: input.paymentRequired ?? false,
      paymentDeadlineHours: input.paymentDeadlineHours ?? null,
      rosterOnly: input.rosterOnly ?? false,
      rosterPriorityHours: input.rosterPriorityHours ?? 0,
      transferRequiresProof: input.transferRequiresProof ?? true,
    })
    .returning();

  if (
    input.priceCents &&
    input.priceCents > 0 &&
    input.mbwayEnabled !== undefined
  ) {
    const { upsertTeamPaymentSettings, getTeamPaymentSettings } = await import(
      "./team-payment-settings.actions"
    );
    const { getAuthUser } = await import("@/lib/action-helpers");
    const authUser = await getAuthUser();
    let existingSettings = null;
    if (authUser) {
      const res = await getTeamPaymentSettings({ teamId });
      if (res.success) existingSettings = res.data;
    }
    await upsertTeamPaymentSettings({
      teamId,
      mbwayEnabled: input.mbwayEnabled,
      mbwayPhone: input.mbwayPhone || "",
      mbwayName: existingSettings?.mbwayName || "",
      cashEnabled: existingSettings?.cashEnabled ?? true,
      stripeEnabled: existingSettings?.stripeEnabled ?? false,
      stripeAccountId: existingSettings?.stripeAccountId || undefined,
      cashInstructions: existingSettings?.cashInstructions || undefined,
    });
  }

  const invitedPlayers = input.invitedPlayers ?? [];
  for (const player of invitedPlayers) {
    if (player.isVerified) {
      await db
        .insert(attendance)
        .values({
          matchSessionId: event.id,
          playerId: player.id,
          status: "pending",
        })
        .onConflictDoUpdate({
          target: [attendance.matchSessionId, attendance.playerId],
          set: { status: "pending", updatedAt: new Date() },
        });
    } else {
      await db.insert(attendance).values({
        matchSessionId: event.id,
        guestName: player.name,
        guestEmail: player.email ?? null,
        status: "pending",
      });
    }
  }

  revalidatePath("/arena/events");
  revalidatePath(`/event/${event.id}`);
  return { success: true as const, data: toEventView(event) };
}

export async function updateEvent(
  eventId: number,
  input: {
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
    recurrence?: string;
    location?: string;
    priceCents?: number;
    paymentRequired?: boolean;
    paymentDeadlineHours?: number | null;
    rosterOnly?: boolean;
    transferRequiresProof?: boolean;
    mbwayEnabled?: boolean;
    mbwayPhone?: string;
  },
) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const existingEvent = await db.query.matchSessions.findFirst({
    columns: { teamId: true },
    where: eq(matchSessions.id, eventId),
  });

  if (!existingEvent) {
    return { success: false as const, error: { code: "EVENT_NOT_FOUND" } };
  }

  const canAccessTeam = await userCanAccessTeam(
    authUser.id,
    existingEvent.teamId,
  );
  if (!canAccessTeam) {
    return { success: false as const, error: { code: "TEAM_NOT_FOUND" } };
  }

  const [event] = await db
    .update(matchSessions)
    .set({
      ...(input.status && { status: input.status }),
      ...(input.startDate && { startsAt: input.startDate }),
      ...(input.endDate && { endsAt: input.endDate }),
      ...(input.recurrence && { recurrence: input.recurrence }),
      ...(input.location && { location: input.location }),
      ...(input.priceCents !== undefined && { priceCents: input.priceCents }),
      ...(input.paymentRequired !== undefined && {
        paymentRequired: input.paymentRequired,
      }),
      ...(input.paymentDeadlineHours !== undefined && {
        paymentDeadlineHours: input.paymentDeadlineHours,
      }),
      ...(input.rosterOnly !== undefined && { rosterOnly: input.rosterOnly }),
      ...(input.transferRequiresProof !== undefined && {
        transferRequiresProof: input.transferRequiresProof,
      }),
      updatedAt: new Date(),
    })
    .where(eq(matchSessions.id, eventId))
    .returning();

  if (
    input.priceCents !== undefined &&
    input.priceCents > 0 &&
    input.mbwayEnabled !== undefined
  ) {
    const { upsertTeamPaymentSettings, getTeamPaymentSettings } = await import(
      "./team-payment-settings.actions"
    );
    const { getAuthUser } = await import("@/lib/action-helpers");
    const authUser = await getAuthUser();
    let existingSettings = null;
    if (authUser) {
      const res = await getTeamPaymentSettings({
        teamId: existingEvent.teamId,
      });
      if (res.success) existingSettings = res.data;
    }
    await upsertTeamPaymentSettings({
      teamId: existingEvent.teamId,
      mbwayEnabled: input.mbwayEnabled,
      mbwayPhone: input.mbwayPhone || "",
      mbwayName: existingSettings?.mbwayName || "",
      cashEnabled: existingSettings?.cashEnabled ?? true,
      stripeEnabled: existingSettings?.stripeEnabled ?? false,
      stripeAccountId: existingSettings?.stripeAccountId || undefined,
      cashInstructions: existingSettings?.cashInstructions || undefined,
    });
  }

  revalidatePath("/arena/events");
  revalidatePath(`/arena/events/${eventId}`);
  return { success: true as const, data: toEventView(event) };
}

export async function getEvent(eventId: number) {
  const eventData = await queryEventById(eventId);
  if (!eventData) {
    return { success: false as const, error: { code: "EVENT_NOT_FOUND" } };
  }
  return { success: true as const, data: toEventView(eventData) };
}

export async function getCalendarEvents(
  from: Date,
  to: Date,
  teamId?: number | string,
) {
  const authUser = await getAuthUser();
  let resolvedTeamId = Number(teamId ?? authUser?.teamId ?? 0) || null;

  if (authUser && !resolvedTeamId) {
    const accessibleTeamIds = await getAccessibleTeamIds(authUser.id);
    resolvedTeamId = accessibleTeamIds[0] ?? null;
  }

  if (authUser && resolvedTeamId) {
    const canAccessTeam = await userCanAccessTeam(authUser.id, resolvedTeamId);
    if (!canAccessTeam) {
      return { success: false as const, error: { code: "TEAM_NOT_FOUND" } };
    }
  }

  if (authUser && !resolvedTeamId) {
    return { success: true as const, data: [] };
  }

  const events = await db
    .select()
    .from(matchSessions)
    .where(
      and(
        gte(matchSessions.startsAt, from),
        lt(matchSessions.startsAt, to),
        ...(resolvedTeamId ? [eq(matchSessions.teamId, resolvedTeamId)] : []),
      ),
    )
    .orderBy(matchSessions.startsAt);
  return {
    success: true as const,
    data: events.map(event => ({
      ...event,
      status: toEventStatus(event.status),
    })),
  };
}

export async function getEvents(options?: {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
  teamId?: number | string;
}) {
  const { limit = 10, upcomingOnly = true, teamId } = options || {};
  const authUser = await getAuthUser();
  let resolvedTeamId = teamId ?? authUser?.teamId ?? undefined;

  if (authUser && !resolvedTeamId) {
    const accessibleTeamIds = await getAccessibleTeamIds(authUser.id);
    resolvedTeamId = accessibleTeamIds[0];
  }

  if (authUser && resolvedTeamId) {
    const canAccessTeam = await userCanAccessTeam(
      authUser.id,
      Number(resolvedTeamId),
    );
    if (!canAccessTeam) {
      return { success: false as const, error: { code: "TEAM_NOT_FOUND" } };
    }
  }

  if (authUser && !resolvedTeamId) {
    return { success: true as const, data: [] };
  }

  const events = await queryEvents({
    limit,
    upcomingOnly,
    teamId: resolvedTeamId,
  });
  return { success: true as const, data: events.map(toEventView) };
}

export async function getLastEventSquad(teamId: number) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const canAccess = await userCanAccessTeam(authUser.id, teamId);
  if (!canAccess) {
    return { success: false as const, error: { code: "TEAM_NOT_FOUND" } };
  }

  const lastEvent = await db.query.matchSessions.findFirst({
    where: eq(matchSessions.teamId, teamId),
    orderBy: desc(matchSessions.startsAt),
  });

  if (!lastEvent) {
    return { success: true as const, data: [] };
  }

  const participants = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.emailVerified,
      guestName: attendance.guestName,
      guestEmail: attendance.guestEmail,
    })
    .from(attendance)
    .leftJoin(user, eq(attendance.playerId, user.id))
    .where(
      and(
        eq(attendance.matchSessionId, lastEvent.id),
        eq(attendance.status, "confirmed"),
      ),
    );

  return {
    success: true as const,
    data: participants.map(p => ({
      id: p.id ?? "",
      name: p.guestName || p.name || "",
      email: p.guestEmail || p.email || "",
      isVerified: !!p.id && p.isVerified,
    })),
  };
}

function toEventView(event: typeof matchSessions.$inferSelect) {
  return {
    id: event.id,
    teamId: event.teamId,
    title: event.title,
    description: null,
    type: "partida" as const,
    location: event.location,
    city: null,
    country: null,
    startDate: event.startsAt,
    endDate: event.endsAt,
    gameStyle: null,
    experienceLevel: null,
    minAge: null,
    maxAge: null,
    gender: null,
    positionNeeded: null,
    participationCriteria: {} as Record<string, unknown>,
    currentParticipants: "0",
    maxParticipants: event.capacity?.toString() ?? null,
    priceCents: event.priceCents ?? 0,
    currency: event.currency || "EUR",
    paymentRequired: event.paymentRequired,
    paymentDeadlineHours: event.paymentDeadlineHours ?? null,
    rosterOnly: event.rosterOnly ?? false,
    rosterPriorityHours: event.rosterPriorityHours ?? 0,
    organizerId: "",
    organizer: null,
    language: null,
    images: [] as string[],
    status: toEventStatus(event.status),
    recurrence: event.recurrence,
    transferRequiresProof: event.transferRequiresProof,
    createdAt: event.createdAt ?? new Date(),
    updatedAt: event.updatedAt ?? new Date(),
  };
}
