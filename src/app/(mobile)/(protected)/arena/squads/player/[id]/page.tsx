"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Clock, UserMinus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { removePlayerFromRoster } from "@/actions/teams.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { ScreenHeader } from "@/components/arena/screen-header";
import Loading from "@/components/loading";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAthleteProfile } from "@/hooks/use-athlete-profile";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";

function shortDate(raw: string | Date) {
  return new Date(raw).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
  });
}

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
            {/* Avatar with subtle ring */}
            <div className="relative">
              <JbAvatar
                id={athlete.id.toString()}
                name={athlete.name}
                image={athlete.image}
                size={80}
              />
              {/* verified glow ring */}
              {athlete.isVerified && (
                <span className="absolute inset-0 rounded-full ring-2 ring-arena-primary/30 ring-offset-2 ring-offset-arena-bg" />
              )}
            </div>

            {/* Name */}
            <h1 className="text-[22px] font-black tracking-tight text-arena-text leading-tight">
              {athlete.name}
            </h1>

            {/* Badges row */}
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
                  <HistoryRow
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
                  Sem atividade registada
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

function HistoryRow({
  item,
  index,
}: {
  item: { id: number; title: string; startsAt: string | Date; status: string };
  index: number;
}) {
  const t = useTranslations("arenaAthleteProfile");
  const statusMap: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    confirmed: {
      label: t("attendanceStatus.confirmed"),
      icon: <Check size={10} strokeWidth={2.5} />,
      cls: "border-arena-success/25 bg-arena-success/10 text-arena-success",
    },
    refused: {
      label: t("attendanceStatus.refused"),
      icon: <X size={10} strokeWidth={2.5} />,
      cls: "border-arena-danger/25 bg-arena-danger/10 text-arena-danger",
    },
    reserve: {
      label: t("attendanceStatus.reserve"),
      icon: <Clock size={10} strokeWidth={2.5} />,
      cls: "border-arena-warning/25 bg-arena-warning/10 text-arena-warning",
    },
  };

  const badge = statusMap[item.status] ?? {
    label: item.status,
    icon: null,
    cls: "border-arena-border bg-arena-surface-el text-arena-text-muted",
  };

  return (
    <div
      className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-4 py-3.5 transition-colors hover:border-arena-border/60 hover:bg-arena-surface-el"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-arena-text">
          {item.title}
        </span>
        <span className="mt-0.5 block text-[11px] font-medium text-arena-text-muted">
          {shortDate(item.startsAt)}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-[8px] border px-2 py-1 text-[10px] font-bold",
          badge.cls,
        )}
      >
        {badge.icon}
        {badge.label}
      </span>
    </div>
  );
}

function RemoveFromRosterDialog({
  activeTeamId,
  className,
  playerId,
  playerName,
  onRemoved,
  t,
}: {
  activeTeamId: number | null;
  className?: string;
  playerId: string;
  playerName: string;
  onRemoved: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    if (!activeTeamId) {
      setError(t("removeDialog.errors.TEAM_NOT_FOUND"));
      return;
    }
    setIsRemoving(true);
    setError(null);

    const result = await removePlayerFromRoster({ teamId: activeTeamId, playerId });
    setIsRemoving(false);

    if (!result.success) {
      const code = result.error.code;
      const key = ["TEAM_NOT_FOUND", "CANNOT_REMOVE_OWNER", "PLAYER_NOT_IN_TEAM"].includes(code)
        ? code
        : "UNKNOWN_ERROR";
      setError(t(`removeDialog.errors.${key}`));
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["squad", activeTeamId] });
    await queryClient.invalidateQueries({ queryKey: ["athlete-profile", playerId, activeTeamId] });
    setOpen(false);
    onRemoved();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full text-arena-danger hover:bg-arena-danger/10 hover:text-arena-danger",
            className,
          )}
        >
          <UserMinus className="mr-2" size={16} />
          {t("actions.remove")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
        <AlertDialogHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-arena-danger/25 bg-arena-danger/10 text-arena-danger">
            <UserMinus size={24} strokeWidth={2} />
          </div>
          <AlertDialogTitle className="text-arena-text">{t("removeDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-arena-text-sec">
            {t("removeDialog.description", { name: playerName })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-[14px] border border-arena-warning/25 bg-arena-warning/10 px-4 py-3 text-[13px] font-semibold text-arena-warning">
          {t("removeDialog.warning")}
        </div>

        {error && (
          <div className="rounded-[12px] border border-arena-danger/25 bg-arena-danger/10 px-4 py-3 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            className="border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface hover:text-arena-text"
            disabled={isRemoving}
          >
            {t("removeDialog.cancel")}
          </AlertDialogCancel>
          <Button
            className="bg-arena-danger text-white hover:bg-arena-danger/90"
            disabled={isRemoving}
            onClick={handleRemove}
            type="button"
          >
            <UserMinus className="mr-2" size={16} />
            {isRemoving ? t("removeDialog.removing") : t("removeDialog.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
