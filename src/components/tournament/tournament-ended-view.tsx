"use client";

import { Check, Copy, Share2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import trophyIcon from "@/assets/images/trophy.svg";
import { Cta } from "@/components/arena/cta";
import { computeStandings, computeTopScorers } from "./standings";
import {
  buildTournamentShareUrl,
  canRenderTournamentQr,
} from "./tournament-share-url";
import { StandingsTable } from "./tournament-standings-table";
import type { Tournament } from "./types";

interface TournamentEndedViewProps {
  tournament: Tournament;
  onNewTournament: () => void;
}

type ShareFeedback = "copyError" | "shareError" | null;

function isShareCancellation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

export function TournamentEndedView({
  tournament,
  onNewTournament,
}: TournamentEndedViewProps) {
  const t = useTranslations("Tournament.view.champion");
  const standings = computeStandings(tournament);
  const scorers = computeTopScorers(tournament);
  const championId = standings[0]?.teamId;
  const champion = championId
    ? tournament.teams.find(team => team.id === championId)
    : undefined;
  const topGoals = scorers[0]?.goals ?? 0;
  const topScorers = scorers.filter(
    scorer => scorer.goals > 0 && scorer.goals === topGoals,
  );
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareUnavailable, setShareUnavailable] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<ShareFeedback>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);
  const canRenderQr = shareUrl ? canRenderTournamentQr(shareUrl) : false;

  useEffect(() => {
    mountedRef.current = true;
    const result = buildTournamentShareUrl(window.location.origin, tournament);
    if (result.ok) {
      setShareUrl(result.url);
      setShareUnavailable(false);
    } else {
      setShareUrl(null);
      setShareUnavailable(true);
    }

    return () => {
      mountedRef.current = false;
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, [tournament]);

  async function copyLink() {
    if (!shareUrl) return;
    setFeedback(null);
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (!mountedRef.current) return;
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setCopied(false);
      }, 1800);
    } catch {
      if (mountedRef.current) setFeedback("copyError");
    }
  }

  async function shareResult() {
    if (!shareUrl) return;
    setFeedback(null);
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({ title: t("shareTitle"), url: shareUrl });
    } catch (error) {
      if (mountedRef.current && !isShareCancellation(error)) {
        setFeedback("shareError");
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4">
        <section className="flex flex-col items-center gap-2 rounded-[18px] border border-arena-primary/40 bg-arena-primary/10 py-6 text-center">
          <Image src={trophyIcon} alt="" width={40} height={40} />
          {champion ? (
            <>
              <span className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
                {t("title")}
              </span>
              <h1 className="font-sora text-xl font-extrabold text-arena-text">
                {champion.name}
              </h1>
            </>
          ) : null}
        </section>

        <StandingsTable tournament={tournament} />

        {topScorers.length > 0 ? (
          <section className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
              {t("topScorer")}
            </h2>
            {topScorers.map(scorer => (
              <div
                key={scorer.playerId}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-semibold text-arena-text">
                  {scorer.name}
                </span>
                <span className="font-sora font-extrabold tabular-nums text-arena-primary">
                  {scorer.goals}
                </span>
              </div>
            ))}
          </section>
        ) : null}

        {shareUrl ? (
          <section className="flex items-center gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3">
            {canRenderQr ? (
              <div
                role="img"
                aria-label={t("qrAria")}
                className="rounded-lg bg-arena-surface-el p-1.5 text-arena-primary"
              >
                <QRCode
                  value={shareUrl}
                  size={76}
                  level="L"
                  bgColor="transparent"
                  fgColor="currentColor"
                  aria-hidden="true"
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col gap-2">
              <Cta
                size="sm"
                fullWidth
                className="min-h-11"
                onClick={shareResult}
              >
                <Share2 size={15} className="mr-1.5" aria-hidden="true" />
                {t("share")}
              </Cta>
              <Cta
                size="sm"
                variant="secondary"
                fullWidth
                className="min-h-11"
                onClick={copyLink}
              >
                {copied ? (
                  <Check
                    size={15}
                    className="mr-1.5 text-arena-primary"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy size={15} className="mr-1.5" aria-hidden="true" />
                )}
                {copied ? t("copied") : t("copy")}
              </Cta>
            </div>
          </section>
        ) : null}

        {shareUnavailable ? (
          <p role="alert" className="text-sm text-arena-danger">
            {t("unavailable")}
          </p>
        ) : null}
        {feedback ? (
          <p role="alert" className="text-sm text-arena-danger">
            {t(feedback)}
          </p>
        ) : null}

        <Cta variant="secondary" fullWidth onClick={onNewTournament}>
          {t("newTournament")}
        </Cta>
      </div>
    </main>
  );
}
