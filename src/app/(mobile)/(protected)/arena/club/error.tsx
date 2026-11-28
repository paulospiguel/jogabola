"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { ArenaQueryError } from "@/components/arena/query-state";

/**
 * Error boundary for the club area. Shows a localized, retryable state and
 * never renders the raw error message (it may carry internal details).
 */
export default function ClubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("arenaClubCalendar.states");

  useEffect(() => {
    console.error("[club error]", error.digest ?? error.name);
  }, [error]);

  return (
    <div className="jb-page">
      <div className="jb-page-inner mx-auto max-w-md pt-10">
        <ArenaQueryError
          title={t("errorTitle")}
          description={t("errorDescription")}
          retryLabel={t("retry")}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
