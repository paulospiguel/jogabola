"use server";

import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { notifyPaymentValidationRequired } from "@/actions/notifications.actions";
import {
  PAYMENT_OVERVIEW_STATUS,
  PAYMENT_REVIEW_STATUS,
  PAYMENT_STATUS,
} from "@/constants/payments";
import { db } from "@/db/client";
import {
  matchReservations,
  matchSessions,
  paymentProofs,
  payments,
  teams,
  user,
} from "@/db/schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import { sendPaymentProofRequest } from "@/lib/email";
import { getPresignedUploadUrl, getR2PublicUrl } from "@/lib/s3";
import { userCanAccessTeam } from "@/lib/team-access";
import {
  createPaymentSchema,
  requestPresignedUrlSchema,
  submitPaymentProofSchema,
} from "@/schemas/payments.schema";

const updatePaymentStatusSchema = z.object({
  paymentId: z.number().int().positive(),
  status: z.enum([
    PAYMENT_REVIEW_STATUS.APPROVED,
    PAYMENT_REVIEW_STATUS.REJECTED,
  ]),
});

const requestPaymentProofSchema = z.object({
  paymentId: z.number().int().positive(),
});

function toUiPaymentStatus(status: string) {
  if (status === PAYMENT_STATUS.PAID_UNVERIFIED) {
    return PAYMENT_OVERVIEW_STATUS.VALIDATING;
  }
  if (status === PAYMENT_STATUS.APPROVED) {
    return PAYMENT_OVERVIEW_STATUS.CONFIRMED;
  }
  if (status === PAYMENT_STATUS.REJECTED) {
    return PAYMENT_OVERVIEW_STATUS.REFUSED;
  }
  return status;
}

export const createPayment = withAction(createPaymentSchema, async data => {
  let initialStatus:
    | typeof PAYMENT_STATUS.PENDING
    | typeof PAYMENT_STATUS.PAID_UNVERIFIED = PAYMENT_STATUS.PENDING;

  if (data.method === "transfer") {
    const matchSessionRow = await db
      .select({
        transferRequiresProof: matchSessions.transferRequiresProof,
      })
      .from(matchReservations)
      .innerJoin(
        matchSessions,
        eq(matchSessions.id, matchReservations.matchSessionId),
      )
      .where(eq(matchReservations.id, data.matchReservationId))
      .limit(1)
      .then(rows => rows[0]);

    if (matchSessionRow && !matchSessionRow.transferRequiresProof) {
      initialStatus = PAYMENT_STATUS.PAID_UNVERIFIED;
    }
  }

  const [payment] = await db
    .insert(payments)
    .values({ ...data, status: initialStatus })
    .returning();
  return { success: true, data: payment };
});

export const submitPaymentProof = withAction(
  submitPaymentProofSchema,
  async data => {
    const [proof] = await db.insert(paymentProofs).values(data).returning();
    await db
      .update(payments)
      .set({ status: PAYMENT_STATUS.PAID_UNVERIFIED, updatedAt: new Date() })
      .where(eq(payments.id, data.paymentId));

    // Notify team manager that proof needs validation
    try {
      const [paymentRow] = await db
        .select({
          managerId: teams.ownerId,
          athleteName: user.name,
          eventTitle: matchSessions.title,
          eventId: matchSessions.id,
          eventSlug: matchSessions.slug,
        })
        .from(payments)
        .innerJoin(
          matchReservations,
          eq(matchReservations.id, payments.matchReservationId),
        )
        .innerJoin(
          matchSessions,
          eq(matchSessions.id, matchReservations.matchSessionId),
        )
        .innerJoin(teams, eq(teams.id, matchSessions.teamId))
        .innerJoin(user, eq(user.id, matchReservations.playerId))
        .where(eq(payments.id, data.paymentId))
        .limit(1);

      if (paymentRow) {
        await notifyPaymentValidationRequired({
          managerId: paymentRow.managerId,
          athleteName: paymentRow.athleteName ?? "Atleta",
          eventTitle: paymentRow.eventTitle,
          paymentId: data.paymentId,
          eventId: paymentRow.eventId,
        });
      }
    } catch {
      // Non-blocking: notification failure should not break payment flow
    }

    return { success: true, data: proof };
  },
);

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

function normalizeContentType(contentType: string) {
  const normalized = contentType.trim().toLowerCase();
  return normalized === "image/jpg" ? "image/jpeg" : normalized;
}

export const requestPresignedUrl = withAction(
  requestPresignedUrlSchema,
  async data => {
    const { paymentId, sizeBytes } = data;
    const contentType = normalizeContentType(data.contentType);

    if (!ALLOWED_TYPES.has(contentType)) {
      return {
        success: false,
        error: {
          code: "INVALID_FILE_TYPE",
          message:
            "Tipo de ficheiro não permitido. Use JPEG, PNG, WebP, HEIC ou HEIF.",
        },
      };
    }

    if (sizeBytes > MAX_SIZE_BYTES) {
      return {
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "Ficheiro demasiado grande. Máximo 2 MB.",
        },
      };
    }

    const [paymentRow] = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!paymentRow) {
      return {
        success: false,
        error: {
          code: "PAYMENT_NOT_FOUND",
          message: "Pagamento não encontrado.",
        },
      };
    }

    // Auth check: guests are allowed
    const session = await auth.api.getSession({ headers: await headers() });
    const uploaderLabel = session?.user?.id ? "user" : "guest";

    const ext = EXTENSION_BY_CONTENT_TYPE[contentType] ?? "jpg";
    const key = `payment-proofs/${paymentId}/${uploaderLabel}-${randomUUID()}.${ext}`;

    try {
      const uploadUrl = await getPresignedUploadUrl(key, contentType);
      const publicUrl = getR2PublicUrl(key);

      return {
        success: true,
        data: {
          uploadUrl,
          publicUrl,
          key,
          headers: { "Content-Type": contentType },
        },
      };
    } catch (err) {
      console.error("[requestPresignedUrl]", err);
      return {
        success: false,
        error: {
          code: "PRESIGNED_URL_ERROR",
          message: "Erro ao gerar URL de upload.",
        },
      };
    }
  },
);

export const getTeamPayments = withAuthAction(
  z.object({ teamId: z.number() }),
  async (currentUser, { teamId }) => {
    const canAccessTeam = await userCanAccessTeam(currentUser.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    const rawPayments = await db
      .select({
        id: payments.id,
        amountCents: payments.amountCents,
        method: payments.method,
        status: payments.status,
        createdAt: payments.createdAt,
        proofUrl: paymentProofs.fileUrl,
        playerId: user.id,
        playerName: user.name,
        playerEmail: user.email,
        playerImage: user.image,
        playerVerified: user.emailVerified,
        playerCreatedAt: user.createdAt,
        matchId: matchSessions.id,
        matchTitle: matchSessions.title,
        matchStatus: matchSessions.status,
      })
      .from(payments)
      .innerJoin(
        matchReservations,
        eq(payments.matchReservationId, matchReservations.id),
      )
      .innerJoin(
        matchSessions,
        eq(matchReservations.matchSessionId, matchSessions.id),
      )
      .innerJoin(user, eq(matchReservations.playerId, user.id))
      .leftJoin(paymentProofs, eq(paymentProofs.paymentId, payments.id))
      .where(eq(matchSessions.teamId, teamId))
      .orderBy(desc(payments.createdAt));

    const formattedPayments = rawPayments.map(p => ({
      id: `PAY-${p.id}`,
      amount: `€${(p.amountCents / 100).toFixed(2).replace(".", ",")}`,
      method: p.method,
      status: toUiPaymentStatus(p.status),
      score: "low" as const,
      date: p.createdAt
        ? p.createdAt.toISOString().slice(0, 16).replace("T", " ")
        : "",
      proofUrl: p.proofUrl ?? undefined,
      player: {
        id: p.playerId,
        name: p.playerName,
        email: p.playerEmail,
        image: p.playerImage,
        isVerified: p.playerVerified ?? false,
        createdAt: p.playerCreatedAt
          ? p.playerCreatedAt.toISOString()
          : new Date().toISOString(),
      },
      event: {
        id: p.matchId,
        title: p.matchTitle,
        status: p.matchStatus,
      },
    }));

    return { success: true, data: formattedPayments };
  },
);

export const updatePaymentStatus = withAuthAction(
  updatePaymentStatusSchema,
  async (currentUser, { paymentId, status }) => {
    const [paymentRow] = await db
      .select({
        id: payments.id,
        teamId: matchSessions.teamId,
        eventId: matchSessions.id,
      })
      .from(payments)
      .innerJoin(
        matchReservations,
        eq(payments.matchReservationId, matchReservations.id),
      )
      .innerJoin(
        matchSessions,
        eq(matchReservations.matchSessionId, matchSessions.id),
      )
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!paymentRow) {
      return { success: false, error: { code: "PAYMENT_NOT_FOUND" } };
    }

    const canAccessTeam = await userCanAccessTeam(
      currentUser.id,
      paymentRow.teamId,
    );
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, paymentId));

    revalidatePath("/arena/payments");
    revalidatePath(`/arena/payments/PAY-${paymentId}`);
    revalidatePath(`/arena/events/${paymentRow.eventId}`);
    revalidatePath(`/event/${paymentRow.eventId}`);

    return { success: true, data: { status } };
  },
);

export const requestPaymentProof = withAuthAction(
  requestPaymentProofSchema,
  async (currentUser, { paymentId }) => {
    const [paymentRow] = await db
      .select({
        id: payments.id,
        amountCents: payments.amountCents,
        currency: payments.currency,
        teamId: matchSessions.teamId,
        eventId: matchSessions.id,
        eventTitle: matchSessions.title,
        eventStartsAt: matchSessions.startsAt,
        playerName: user.name,
        playerEmail: user.email,
      })
      .from(payments)
      .innerJoin(
        matchReservations,
        eq(payments.matchReservationId, matchReservations.id),
      )
      .innerJoin(
        matchSessions,
        eq(matchReservations.matchSessionId, matchSessions.id),
      )
      .innerJoin(user, eq(matchReservations.playerId, user.id))
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!paymentRow) {
      return { success: false, error: { code: "PAYMENT_NOT_FOUND" } };
    }

    const canAccessTeam = await userCanAccessTeam(
      currentUser.id,
      paymentRow.teamId,
    );
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    const emailResult = await sendPaymentProofRequest(paymentRow.playerEmail, {
      name: paymentRow.playerName,
      eventTitle: paymentRow.eventTitle,
      eventDate: paymentRow.eventStartsAt.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      eventTime: paymentRow.eventStartsAt.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      amountCents: paymentRow.amountCents,
      currency: paymentRow.currency,
      eventId: paymentRow.eventId,
      paymentId: paymentRow.id,
    });

    if (!emailResult.success) {
      return { success: false, error: { code: "EMAIL_SEND_FAILED" } };
    }

    return { success: true, data: { sent: true } };
  },
);

export async function markPaymentManually(
  eventId: number,
  athleteId: string,
  method: string,
  note?: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  const managerId = session.user.id;

  try {
    // Verify manager has access to the team that owns this event
    const [matchSession] = await db
      .select({
        teamId: matchSessions.teamId,
        priceCents: matchSessions.priceCents,
        currency: matchSessions.currency,
      })
      .from(matchSessions)
      .where(eq(matchSessions.id, eventId))
      .limit(1);

    if (!matchSession) {
      return { success: false as const, error: "Evento não encontrado" };
    }

    const canAccess = await userCanAccessTeam(managerId, matchSession.teamId);
    if (!canAccess) {
      return { success: false as const, error: "Sem permissão" };
    }

    // Upsert reservation
    const [reservation] = await db
      .insert(matchReservations)
      .values({
        matchSessionId: eventId,
        playerId: athleteId,
        status: "reserved_unpaid",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [matchReservations.matchSessionId, matchReservations.playerId],
        set: { updatedAt: new Date() },
      })
      .returning();

    // Check for existing payment
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.matchReservationId, reservation.id))
      .limit(1);

    if (existingPayment) {
      await db
        .update(payments)
        .set({
          status: "approved",
          method,
          markedByUserId: managerId,
          manualNote: note ?? null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await db.insert(payments).values({
        matchReservationId: reservation.id,
        amountCents: matchSession.priceCents ?? 0,
        currency: matchSession.currency ?? "EUR",
        method,
        status: "approved",
        markedByUserId: managerId,
        manualNote: note ?? null,
      });
    }

    revalidatePath(`/arena/events/${eventId}`);
    revalidatePath(`/event/${eventId}`);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erro ao registar pagamento" };
  }
}

export async function getPaymentById(paymentId: number): Promise<
  | {
      success: true;
      data: {
        id: number;
        status: string;
        method: string;
        amountCents: number;
        currency: string;
        payerName: string | null;
        teamName: string;
        eventTitle: string;
        eventId: number;
        eventSlug: string | null;
        transferRequiresProof: boolean;
      };
    }
  | { success: false; error: string }
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    const [row] = await db
      .select({
        id: payments.id,
        status: payments.status,
        method: payments.method,
        amountCents: payments.amountCents,
        currency: payments.currency,
        payerName: user.name,
        payerId: matchReservations.playerId,
        teamOwnerId: teams.ownerId,
        teamName: teams.name,
        eventTitle: matchSessions.title,
        eventId: matchSessions.id,
        eventSlug: matchSessions.slug,
        transferRequiresProof: matchSessions.transferRequiresProof,
      })
      .from(payments)
      .innerJoin(
        matchReservations,
        eq(matchReservations.id, payments.matchReservationId),
      )
      .innerJoin(
        matchSessions,
        eq(matchSessions.id, matchReservations.matchSessionId),
      )
      .innerJoin(teams, eq(teams.id, matchSessions.teamId))
      .leftJoin(user, eq(user.id, matchReservations.playerId))
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!row) {
      return { success: false, error: "Pagamento não encontrado" };
    }

    // If authenticated, verify ownership: must be payer or team owner
    if (session?.user?.id) {
      const userId = session.user.id;
      const isPayer = row.payerId === userId;
      const isTeamOwner = row.teamOwnerId === userId;
      if (!isPayer && !isTeamOwner) {
        return { success: false, error: "Sem permissão" };
      }
    }
    // No session = guest user; allow (they were redirected here immediately after paying)

    return {
      success: true,
      data: {
        id: row.id,
        status: row.status,
        method: row.method,
        amountCents: row.amountCents,
        currency: row.currency,
        payerName: row.payerName,
        teamName: row.teamName,
        eventTitle: row.eventTitle,
        eventId: row.eventId,
        eventSlug: row.eventSlug,
        transferRequiresProof: row.transferRequiresProof,
      },
    };
  } catch {
    return { success: false, error: "Erro ao carregar pagamento" };
  }
}

export async function getMyPaymentForEvent(eventId: number): Promise<
  | {
      success: true;
      data: {
        id: number;
        amountCents: number;
        currency: string;
        method: string;
        status: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        proofUrl: string | null;
      } | null;
    }
  | { success: false; error: string }
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Não autenticado" };
    }

    const userId = session.user.id;

    const [row] = await db
      .select({
        id: payments.id,
        amountCents: payments.amountCents,
        currency: payments.currency,
        method: payments.method,
        status: payments.status,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        proofUrl: paymentProofs.fileUrl,
      })
      .from(payments)
      .innerJoin(
        matchReservations,
        eq(payments.matchReservationId, matchReservations.id),
      )
      .leftJoin(paymentProofs, eq(paymentProofs.paymentId, payments.id))
      .where(
        and(
          eq(matchReservations.matchSessionId, eventId),
          eq(matchReservations.playerId, userId),
        ),
      )
      .orderBy(desc(paymentProofs.createdAt))
      .limit(1);

    return { success: true, data: row || null };
  } catch (error) {
    console.error("[getMyPaymentForEvent]", error);
    return { success: false, error: "Erro ao carregar pagamento" };
  }
}

export async function markPaymentAsRefunded(paymentId: number) {
  return await updatePaymentStatusByOwner(paymentId, PAYMENT_STATUS.REFUNDED);
}

export async function markPaymentAsCredited(paymentId: number) {
  return await updatePaymentStatusByOwner(paymentId, PAYMENT_STATUS.CREDITED);
}

async function updatePaymentStatusByOwner(paymentId: number, status: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false as const, error: "Não autenticado" };
  
  const userId = session.user.id;

  const [row] = await db.select({
    teamId: matchSessions.teamId,
    eventId: matchSessions.id,
  })
  .from(payments)
  .innerJoin(matchReservations, eq(matchReservations.id, payments.matchReservationId))
  .innerJoin(matchSessions, eq(matchSessions.id, matchReservations.matchSessionId))
  .where(eq(payments.id, paymentId))
  .limit(1);

  if (!row) return { success: false as const, error: "Pagamento não encontrado" };

  const canAccess = await userCanAccessTeam(userId, row.teamId);
  if (!canAccess) return { success: false as const, error: "Sem permissão" };

  await db.update(payments).set({ status, updatedAt: new Date(), markedByUserId: userId }).where(eq(payments.id, paymentId));
  
  revalidatePath(`/arena/events/${row.eventId}`);
  revalidatePath(`/arena/payments`);
  
  return { success: true as const };
}
