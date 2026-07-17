"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { PAYMENT_STATUS } from "@/constants/payments";
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
import { trackServerEvent } from "@/lib/analytics-server";
import { auth } from "@/lib/auth";
import { sendPaymentProofRequest } from "@/lib/email";
import { notifyPaymentValidationRequired } from "@/lib/notifications";
import { canActOnReservation } from "@/lib/reservation-access";
import { getPresignedUploadUrl, getR2PublicUrl } from "@/lib/s3";
import { classifyErrorSafely } from "@/lib/safe-error";
import { canManageTeam } from "@/lib/team-access";
import {
  requestPresignedUrlSchema,
  submitPaymentProofSchema,
} from "@/schemas/payments.schema";

const requestPaymentProofSchema = z.object({
  paymentId: z.number().int().positive(),
});

export const submitPaymentProof = withAction(
  submitPaymentProofSchema,
  async data => {
    const payment = await db.query.payments.findFirst({
      columns: { matchReservationId: true },
      where: eq(payments.id, data.paymentId),
    });
    if (!payment) {
      return { success: false, error: { code: "PAYMENT_NOT_FOUND" } };
    }
    if (
      !(await canActOnReservation(
        payment.matchReservationId,
        data.guestAccessToken,
      ))
    ) {
      return { success: false, error: { code: "FORBIDDEN" } };
    }

    const { guestAccessToken: _, ...proofData } = data;
    const [proof] = await db
      .insert(paymentProofs)
      .values(proofData)
      .returning();
    await db
      .update(payments)
      .set({ status: PAYMENT_STATUS.PAID_UNVERIFIED, updatedAt: new Date() })
      .where(eq(payments.id, data.paymentId));

    // Notify team manager that proof needs validation
    try {
      const [paymentRow] = await db
        .select({
          managerId: teams.ownerId,
          athleteId: matchReservations.playerId,
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
        await trackServerEvent(paymentRow.athleteId, "payment_submitted", {
          payment_id: data.paymentId,
          event_id: paymentRow.eventId,
        });
      }
    } catch (error) {
      console.error(
        "payments:submitPaymentProof notification failed",
        classifyErrorSafely(error),
      );
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
    const { guestAccessToken, paymentId, sizeBytes } = data;
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

    const paymentRow = await db.query.payments.findFirst({
      columns: { id: true, matchReservationId: true },
      where: eq(payments.id, paymentId),
    });

    if (!paymentRow) {
      return {
        success: false,
        error: {
          code: "PAYMENT_NOT_FOUND",
          message: "Pagamento não encontrado.",
        },
      };
    }

    if (
      !(await canActOnReservation(
        paymentRow.matchReservationId,
        guestAccessToken,
      ))
    ) {
      return { success: false, error: { code: "FORBIDDEN" } };
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

    const canAccessTeam = await canManageTeam(
      currentUser.id,
      paymentRow.teamId,
    );
    if (!canAccessTeam) {
      return { success: false, error: { code: "FORBIDDEN" } };
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
