"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error("[profile error]", error);
  }, [error]);

  return (
    <div className="jb-page flex items-center justify-center">
      <div className="jb-page-inner text-center space-y-4">
        <h2 className="text-lg font-bold text-red-400">
          {t("loadError")}
        </h2>
        <p className="text-sm text-arena-text-muted font-mono break-all max-w-lg">
          {error.message}
        </p>
        {error.digest && (
          <p className="text-xs text-arena-text-muted">
            digest: {error.digest}
          </p>
        )}
        <button onClick={reset} className="jb-action jb-action-primary text-sm">
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
