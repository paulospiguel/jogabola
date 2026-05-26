import type { useTranslations } from "next-intl";

const EMAIL_ERROR_CODES = new Set([
  "RESEND_API_KEY_MISSING",
  "RESEND_API_KEY_INVALID",
  "RESEND_FROM_INVALID",
  "RESEND_DOMAIN_NOT_VERIFIED",
  "RESEND_DEV_DOMAIN_RESTRICTED",
  "EMAIL_SEND_FAILED",
]);

type AthleteRsvpTranslator = ReturnType<typeof useTranslations>;

export function getGuestOtpErrorMessage(
  t: AthleteRsvpTranslator,
  res: { error?: string; errorCode?: string },
  fallback: string,
  rosterPriorityHours?: number,
) {
  if (res.errorCode && EMAIL_ERROR_CODES.has(res.errorCode)) {
    return t(`errors.email.${res.errorCode}`);
  }

  if (res.errorCode === "ROSTER_PRIORITY_ACTIVE") {
    return t("errors.rosterPriority", { hours: rosterPriorityHours || 0 });
  }

  if (res.error === "EVENT_HAS_FINES") {
    return t("errors.hasFines");
  }

  return res.error || fallback;
}

export function getAttendanceErrorMessage(
  t: AthleteRsvpTranslator,
  error: string | undefined,
  fallback: string,
  rosterPriorityHours?: number,
) {
  if (error === "EVENT_ROSTER_ONLY") return t("errors.rosterOnly");
  if (error === "EVENT_CANCELLED") return t("errors.eventCancelled");
  if (error === "EVENT_ROSTER_PRIORITY") {
    return t("errors.rosterPriority", { hours: rosterPriorityHours || 0 });
  }
  if (error === "EVENT_HAS_FINES") return t("errors.hasFines");
  return error || fallback;
}
