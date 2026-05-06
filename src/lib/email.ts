import * as React from "react";
import { Resend } from "resend";
import { AttendanceConfirmedEmail } from "@/components/emails/attendance-confirmed-email";
import { AuthOtpEmail } from "@/components/emails/auth-otp-email";
import { EventReminderEmail } from "@/components/emails/event-reminder-email";
import { GuestRsvpOtpEmail } from "@/components/emails/guest-rsvp-otp-email";
import { WelcomeEmail } from "@/components/emails/welcome-email";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  process.env.RESEND_EMAIL_FROM ||
  "JogaBola <noreply@jogabola.app>";

export type EmailDeliveryErrorCode =
  | "RESEND_API_KEY_MISSING"
  | "RESEND_API_KEY_INVALID"
  | "RESEND_FROM_INVALID"
  | "RESEND_DOMAIN_NOT_VERIFIED"
  | "RESEND_DEV_DOMAIN_RESTRICTED"
  | "EMAIL_SEND_FAILED";

function isDev() {
  return process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY;
}

function errorText(error: unknown) {
  if (!error) return "";
  if (error instanceof Error) {
    return `${error.name} ${error.message} ${String(error.cause ?? "")}`;
  }
  if (typeof error === "object") {
    return JSON.stringify(normalizeEmailError(error));
  }
  return String(error);
}

export function getEmailDeliveryErrorCode(
  error: unknown,
): EmailDeliveryErrorCode {
  const text = errorText(error).toLowerCase();

  if (text.includes("resend_api_key is not configured")) {
    return "RESEND_API_KEY_MISSING";
  }
  if (text.includes("invalid_api_key") || text.includes("api key is invalid")) {
    return "RESEND_API_KEY_INVALID";
  }
  if (
    text.includes("invalid `from`") ||
    text.includes("invalid from") ||
    text.includes("sender email address")
  ) {
    return "RESEND_FROM_INVALID";
  }
  if (
    text.includes("resend.dev") &&
    (text.includes("only send testing emails") ||
      text.includes("only send") ||
      text.includes("verify a domain"))
  ) {
    return "RESEND_DEV_DOMAIN_RESTRICTED";
  }
  if (
    text.includes("domain is not verified") ||
    text.includes("domain has not been verified") ||
    text.includes("please, add and verify your domain")
  ) {
    return "RESEND_DOMAIN_NOT_VERIFIED";
  }

  return "EMAIL_SEND_FAILED";
}

function normalizeEmailError(error: unknown) {
  if (!error) return { message: "Unknown email error" };
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause,
    };
  }
  if (typeof error === "object") {
    return Object.fromEntries(
      Object.getOwnPropertyNames(error).map(key => [
        key,
        (error as Record<string, unknown>)[key],
      ]),
    );
  }
  return { message: String(error) };
}

async function send({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (isDev()) {
    console.log(`[email:dev] to=${to} subject="${subject}"`);
    return { success: true as const };
  }

  if (!process.env.RESEND_API_KEY) {
    const error = new Error("RESEND_API_KEY is not configured");
    console.error("[email] send failed:", error.message);
    return { success: false as const, error };
  }

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
    });

    if (response.error) {
      console.error(
        "[email] resend rejected:",
        normalizeEmailError(response.error),
      );
      return { success: false as const, error: response.error };
    }

    console.info("[email] sent:", {
      id: response.data?.id,
      to,
      subject,
      from: FROM_EMAIL,
    });

    return { success: true as const, data: response.data };
  } catch (error) {
    console.error("[email] send failed:", normalizeEmailError(error));
    return { success: false as const, error };
  }
}

// ── Public send functions ─────────────────────────────────────────────────

export async function sendAuthOtp(to: string, otp: string) {
  return send({
    to,
    subject: `${otp} — Código de acesso JogaBola`,
    react: React.createElement(AuthOtpEmail, { otp, email: to }),
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  return send({
    to,
    subject: "Bem-vindo à Arena JogaBola! ⚽",
    react: React.createElement(WelcomeEmail, { name, email: to }),
  });
}

export async function sendGuestRsvpOtp(
  to: string,
  name: string,
  otp: string,
  event?: { title?: string; date?: string; location?: string },
) {
  return send({
    to,
    subject: `${otp} — PIN de confirmação de presença`,
    react: React.createElement(GuestRsvpOtpEmail, {
      name,
      otp,
      eventTitle: event?.title,
      eventDate: event?.date,
      eventLocation: event?.location,
    }),
  });
}

export async function sendAttendanceConfirmed(
  to: string,
  name: string,
  event: {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    spotsLeft?: number;
  },
  isGuest = false,
) {
  return send({
    to,
    subject: `✅ Presença confirmada — ${event.title}`,
    react: React.createElement(AttendanceConfirmedEmail, {
      name,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      eventId: event.id,
      isGuest,
      spotsLeft: event.spotsLeft,
    }),
  });
}

export async function sendEventReminder(
  to: string,
  name: string,
  event: {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    hoursUntil: number;
    confirmedCount: number;
    totalSpots: number;
  },
) {
  return send({
    to,
    subject: `🏆 Lembrete: ${event.title} ${event.hoursUntil <= 24 ? "amanhã" : `em ${Math.round(event.hoursUntil / 24)} dias`}`,
    react: React.createElement(EventReminderEmail, {
      name,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      eventId: event.id,
      hoursUntil: event.hoursUntil,
      confirmedCount: event.confirmedCount,
      totalSpots: event.totalSpots,
    }),
  });
}

// Legacy: kept for backwards compat with direct html sends
export async function sendEmail({
  to,
  subject,
  html,
  react,
}: {
  to: string;
  subject: string;
  html?: string;
  react?: React.ReactElement;
}) {
  if (isDev()) {
    console.log(`[email:dev] to=${to} subject="${subject}"`);
    return { success: true };
  }

  if (!process.env.RESEND_API_KEY) {
    const error = new Error("RESEND_API_KEY is not configured");
    console.error("[email] sendEmail failed:", error.message);
    return { success: false, error };
  }

  try {
    const payload = react
      ? { from: FROM_EMAIL, to, subject, react }
      : { from: FROM_EMAIL, to, subject, html: html ?? "" };
    const response = await resend.emails.send(
      payload as Parameters<typeof resend.emails.send>[0],
    );
    if (response.error) {
      console.error(
        "[email] resend rejected:",
        normalizeEmailError(response.error),
      );
      return { success: false, error: response.error };
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.error("[email] sendEmail failed:", normalizeEmailError(error));
    return { success: false, error };
  }
}
