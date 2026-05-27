"use client";

import { Calendar } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { JbAvatar } from "@/components/arena/avatar";
import { ScreenHeader } from "@/components/arena/screen-header";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useAthleteProfile } from "@/hooks/use-athlete-profile";
import { useTeams } from "@/hooks/use-teams";
import { AthleteHistoryRow } from "./_components/athlete-history-row";
import { RemoveFromRosterDialog } from "./_components/remove-from-roster-dialog";
import { Clock } from "lucide-react";

export default function AthleteProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations();
  const { activeTeamId } = useTeams();
  const { profile: athlete, history, isLoading } = useAthleteProfile(id as string);

  const tr = (key: string, values?: Record<string, string | number>) =>
    t(`arenaAthleteProfile.${key}`, values);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading text={tr("loading")} />
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <span className="text-base font-bold text-arena-text">{tr("notFound")}</span>
        <Button variant="ghost" onClick={() => router.back()} className="text-arena-text-sec">
          {tr("actions.back")}
        </Button>
      </div>
    );
  }

  const stats = [
    { value: athlete.games ?? 0, label: tr("stats.matches") },
    { value: athlete.goals ?? 0, label: tr("stats.goals") },
    { value: athlete.assists ?? 0, label: tr("stats.assists") },
    { value: athlete.rating ?? "—", label: tr("stats.rating") },
  ];

  return (
    <div className="flex h-full flex-col bg-arena-bg">
      <ScreenHeader title="" />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-4 pb-10 pt-6">

          {/* ── Hero ─────────────────────────────────── */}
          <div className="mb-6 flex flex-col items-center gap-2.5">
            <div className="relative">
              <JbAvatar
                id={athlete.id.toString()}
                name={athlete.name}
                image={athlete.image}
                size={80}
              />
              {athlete.isVerified && (
                <span className="absolute inset-0 rounded-full ring-2 ring-arena-primary/30 ring-offset-2 ring-offset-arena-bg" />
              )}
            </div>

            <h1 className="text-[22px] font-black tracking-tight text-arena-text leading-tight">
              {athlete.name}
            </h1>

            <div className="flex items-center gap-2">
              {athlete.position && (
                <span className="inline-flex items-center rounded-[6px] border border-arena-primary/30 bg-arena-primary/10 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-arena-primary">
                  {athlete.position}
                </span>
              )}
              {!athlete.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-[6px] border border-arena-text-muted/20 bg-arena-text-muted/8 px-2 py-0.5 text-[11px] font-bold text-arena-text-muted">
                  <Clock size={9} strokeWidth={2.5} />
                  {tr("pendingValidation")}
                </span>
              )}
            </div>
          </div>

          {/* ── Stats strip ──────────────────────────── */}
          <div className="mb-6 overflow-hidden rounded-[16px] border border-arena-border bg-arena-surface">
            <div className="flex divide-x divide-arena-border">
              {stats.map(({ value, label }) => (
                <div key={label} className="flex flex-1 flex-col items-center py-4 gap-1">
                  <span className="text-[22px] font-black text-arena-text leading-none tabular-nums">
                    {value}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-arena-text-muted">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pending notice for unverified ────────── */}
          {!athlete.isVerified && (
            <div className="mb-6 rounded-[14px] border border-arena-warning/25 bg-arena-warning/10 px-4 py-3">
              <p className="text-[13px] font-semibold text-arena-warning">{tr("notValidated")}</p>
              <p className="mt-0.5 text-[12px] text-arena-warning opacity-75">{tr("notValidatedDesc")}</p>
            </div>
          )}

          {/* ── History ──────────────────────────────── */}
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.1em] text-arena-text-muted">
              {tr("history.title")}
            </p>

            {history && history.length > 0 ? (
              <div className="space-y-2">
                {history.map((item, i) => (
                  <AthleteHistoryRow
                    key={`${item.id}-${i}`}
                    item={item}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface py-10 text-center">
                <Calendar size={28} className="text-arena-text-muted opacity-30" strokeWidth={1.5} />
                <span className="text-sm font-medium text-arena-text-muted opacity-60">
                  {tr("history.empty")}
                </span>
              </div>
            )}
          </div>

          {/* ── Remove action ─────────────────────────── */}
          <div className="mt-8">
            <RemoveFromRosterDialog
              activeTeamId={activeTeamId}
              playerId={athlete.id.toString()}
              playerName={athlete.name}
              onRemoved={() => router.push("/arena/squads")}
              t={tr}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
