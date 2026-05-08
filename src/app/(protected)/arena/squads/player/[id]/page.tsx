"use client";

import { ShieldUserIcon } from "@animateicons/react/lucide";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Mail,
  Star,
  Trophy,
  UserMinus,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { removePlayerFromRoster } from "@/actions/teams.actions";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { VerifiedBadge } from "@/components/arena/verified-badge";
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
import { useDashboardData } from "@/hooks/use-dashboard";
import { useTeams } from "@/hooks/use-teams";
import { cn, formatDate } from "@/lib/utils";

export default function AthleteProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations();
  const { activeTeamId } = useTeams();
  const { events, isLoading: dashboardLoading } = useDashboardData();
  const { profile: athlete, isLoading: profileLoading } = useAthleteProfile(
    id as string,
  );

  const arenaAthleteProfileTranslation = (sentence: string) => {
    return t(`arenaAthleteProfile.${sentence}`);
  };

  const isLoading = dashboardLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="jb-page flex items-center justify-center">
        <Loading text={arenaAthleteProfileTranslation("loading")} />
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="jb-page">
        <div className="jb-page-inner text-center">
          <h1 className="text-xl font-bold">
            {arenaAthleteProfileTranslation("notFound")}
          </h1>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="mr-2" size={16} />
            {arenaAthleteProfileTranslation("actions.back")}
          </Button>
        </div>
      </div>
    );
  }

  if (!athlete.isVerified) {
    return (
      <div className="jb-page">
        <div className="jb-page-inner">
          <header className="mb-8 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full bg-arena-surface-el hover:bg-arena-primary/10 hover:text-arena-primary"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <div className="jb-kicker uppercase">
                {arenaAthleteProfileTranslation("pendingValidation")}
              </div>
              <div className="flex items-center gap-2">
                <ShieldUserIcon className="size-6 text-arena-text-muted" />
                <h1 className="jb-title">
                  {arenaAthleteProfileTranslation("title")}
                </h1>
              </div>
            </div>
          </header>

          <div className="max-w-md mx-auto">
            <section className="jb-card p-6 flex flex-col items-center text-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-[18px] border border-arena-border bg-arena-surface">
                <Clock
                  size={28}
                  className="text-arena-text-muted"
                  strokeWidth={1.5}
                />
              </div>
              <JbAvatar
                id={athlete.id.toString()}
                name={athlete.name}
                image={null}
                size={72}
              />
              <div>
                <h2 className="text-lg font-bold text-arena-text">
                  {athlete.name}
                </h2>
                {athlete.email && (
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-sm text-arena-text-muted">
                    <Mail size={13} />
                    {athlete.email}
                  </div>
                )}
              </div>
              <div className="rounded-[10px] border border-arena-warning/30 bg-arena-warning/10 px-4 py-3 text-sm text-arena-warning">
                <p className="font-semibold">
                  {arenaAthleteProfileTranslation("notValidated")}
                </p>
                <p className="mt-1 text-xs opacity-80">
                  {arenaAthleteProfileTranslation("notValidatedDesc")}
                </p>
              </div>
              <RemoveFromRosterDialog
                activeTeamId={activeTeamId}
                playerId={athlete.id.toString()}
                playerName={athlete.name}
                onRemoved={() => router.push("/arena/squads")}
                t={arenaAthleteProfileTranslation}
              />
            </section>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: arenaAthleteProfileTranslation("stats.rating"),
      value: athlete.rating || "-",
      Icon: Star,
      color: "text-arena-highlight",
    },
    {
      label: arenaAthleteProfileTranslation("stats.goals"),
      value: athlete.goals || 0,
      Icon: Zap,
      color: "text-arena-primary",
    },
    {
      label: arenaAthleteProfileTranslation("stats.assists"),
      value: athlete.assists || 0,
      Icon: Trophy,
      color: "text-arena-success",
    },
    {
      label: arenaAthleteProfileTranslation("stats.matches"),
      value: athlete.games || 0,
      Icon: Calendar,
      color: "text-arena-info",
    },
  ];

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full bg-arena-surface-el hover:bg-arena-primary/10 hover:text-arena-primary"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <div className="jb-kicker uppercase">{athlete.role}</div>
              <div className="flex items-center gap-2">
                <ShieldUserIcon className="size-6 text-arena-primary" />
                <h1 className="jb-title">
                  {arenaAthleteProfileTranslation("title")}
                </h1>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              className="border-arena-border hover:bg-arena-primary/10 hover:text-arena-primary"
            >
              <Edit2 className="mr-2" size={16} />
              {t("common.edit")}
            </Button>
            <Button className="jb-action-primary">
              <MessageSquare className="mr-2" size={16} />
              {arenaAthleteProfileTranslation("actions.message")}
            </Button> */}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6">
            {/* Athlete Identity Card */}
            <section className="jb-card p-6 flex flex-col items-center text-center">
              <div className="relative">
                {true && (
                  <span className="absolute z-10 top-0 right-0 flex h-5 items-center gap-1 rounded-full px-2 text-[10px] font-black tracking-widest text-arena-highlight uppercase">
                    <Star size={10} fill="currentColor" />
                  </span>
                )}
                <JbAvatar
                  id={athlete.id.toString()}
                  name={athlete.name}
                  image={athlete.image}
                  size={100}
                />
              </div>
              <div className="mt-4 flex items-center gap-2 flex-col">
                <h2 className="text-xl font-bold text-arena-text">
                  {athlete.name}
                </h2>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {/* <JbBadge status={athlete.status as BadgeStatus} /> */}
                <VerifiedBadge verified={!!athlete.isVerified} />
              </div>

              <div className="mt-8 w-full space-y-4 text-left border-t border-arena-border pt-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
                    {arenaAthleteProfileTranslation("info.role")}
                  </div>
                  <div className="mt-1 font-semibold text-arena-text capitalize">
                    {arenaAthleteProfileTranslation(`roles.${athlete.role}`)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
                    {arenaAthleteProfileTranslation("info.joined")}
                  </div>
                  <div className="mt-1 font-semibold text-arena-text">
                    {athlete?.createdAt &&
                      formatDate(athlete?.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
                    {arenaAthleteProfileTranslation("info.contact")}
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-semibold text-arena-text">
                    <Mail size={14} className="text-arena-text-muted" />
                    {athlete.email}
                  </div>
                </div>
              </div>

              <RemoveFromRosterDialog
                activeTeamId={activeTeamId}
                className="mt-8"
                playerId={athlete.id.toString()}
                playerName={athlete.name}
                onRemoved={() => router.push("/arena/squads")}
                t={arenaAthleteProfileTranslation}
              />
            </section>
          </aside>

          <main className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {statCards.map(({ label, value, Icon, color }) => (
                <div
                  key={label}
                  className="jb-card p-4 flex flex-col items-center text-center transition-transform hover:scale-[1.02]"
                >
                  <Icon className={cn("mb-3 size-6", color)} />
                  <div className="text-[24px] font-black text-arena-text">
                    {value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Chart Placeholder */}
            <section className="jb-card overflow-hidden">
              <div className="border-b border-arena-border bg-arena-surface-el/50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                  {arenaAthleteProfileTranslation("analysis.title")}
                </h2>
                <select className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-arena-text-muted focus:outline-none">
                  <option>
                    {arenaAthleteProfileTranslation("analysis.periods.last10")}
                  </option>
                  <option>
                    {arenaAthleteProfileTranslation("analysis.periods.season")}
                  </option>
                </select>
              </div>
              <div className="p-12 flex flex-col items-center justify-center text-arena-text-muted bg-gradient-to-b from-transparent to-arena-primary/5">
                <div className="flex h-32 items-end gap-3 mb-6">
                  {[40, 60, 45, 90, 65, 80, 50, 75, 85, 95].map((h, i) => (
                    <div
                      key={`rating-bar-${i}-${h}`}
                      className="w-4 bg-arena-primary/20 rounded-t-sm transition-all hover:bg-arena-primary hover:h-40"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium">
                  {arenaAthleteProfileTranslation("analysis.evolution")}
                </p>
              </div>
            </section>

            {/* History Card */}
            <section className="jb-card overflow-hidden">
              <div className="border-b border-arena-border bg-arena-surface-el/50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                  {arenaAthleteProfileTranslation("history.title")}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase"
                >
                  {arenaAthleteProfileTranslation("actions.viewAll")}
                </Button>
              </div>
              <div className="divide-y divide-arena-border">
                {events.map((item, i) => (
                  <div
                    key={`${item.title}-${item.date}-${i}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-arena-surface-el transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-arena-text truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-arena-text-muted flex items-center gap-2">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-arena-primary">
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[14px] font-black text-arena-text">
                          {item.total}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-arena-text-muted">
                          {arenaAthleteProfileTranslation("history.players")}
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-arena-text-muted"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
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
  t: (sentence: string) => string;
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

    const result = await removePlayerFromRoster({
      teamId: activeTeamId,
      playerId,
    });

    setIsRemoving(false);

    if (!result.success) {
      const code = result.error.code;
      const errorKey = [
        "TEAM_NOT_FOUND",
        "CANNOT_REMOVE_OWNER",
        "PLAYER_NOT_IN_TEAM",
      ].includes(code)
        ? code
        : "UNKNOWN_ERROR";

      setError(t(`removeDialog.errors.${errorKey}`));
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["squad", activeTeamId] });
    await queryClient.invalidateQueries({
      queryKey: ["athlete-profile", playerId, activeTeamId],
    });
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
          <AlertDialogTitle className="text-arena-text">
            {t("removeDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-arena-text-sec">
            {t("removeDialog.description").replace("{name}", playerName)}
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
            {isRemoving
              ? t("removeDialog.removing")
              : t("removeDialog.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
