"use client";

import { AlertTriangle, ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Cta } from "@/components/arena/cta";

interface TournamentRecoveryStateProps {
  kind: "notFound" | "loadError" | "invalid";
  onBack: () => void;
  onRetry?: () => void;
}

export function TournamentRecoveryState({
  kind,
  onBack,
  onRetry,
}: TournamentRecoveryStateProps) {
  const t = useTranslations("Tournament.view");
  const Icon = kind === "notFound" ? Trophy : AlertTriangle;

  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="max-w-sm">
        <Icon
          className={
            kind === "notFound"
              ? "mx-auto text-arena-text-muted"
              : "mx-auto text-arena-warning"
          }
          size={36}
          aria-hidden="true"
        />
        <h1 className="mt-3 text-lg font-extrabold text-arena-text">
          {t(`${kind}Title`)}
        </h1>
        <p className="mt-1 text-sm text-arena-text-muted">
          {t(`${kind}Description`)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {onRetry ? (
            <Cta onClick={onRetry} className="btn-press gap-2">
              <RefreshCw size={17} aria-hidden="true" /> {t("retry")}
            </Cta>
          ) : null}
          <Cta variant="secondary" onClick={onBack} className="btn-press gap-2">
            <ArrowLeft size={17} aria-hidden="true" /> {t("back")}
          </Cta>
        </div>
      </div>
    </main>
  );
}
