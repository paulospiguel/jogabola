"use client";

import {
  Calendar,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Shield,
  Trophy,
  Users,
  VerifiedIcon,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { CreateEventSheet } from "@/components/arena/create-event-sheet";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/use-dashboard";

interface ArenaDashboardProps {
  userId: string;
  userName: string;
}

export function ArenaDashboard({ userId, userName }: ArenaDashboardProps) {
  const t = useTranslations("arenaDashboard");
  const [sheet, setSheet] = useState<"create-event" | "add-player" | null>(null);

  const {
    activeTeamId,
    myTeams,
    events,
    squad,
    confirmedCount,
    reserveCount,
    pendingCount,
    isLoading,
  } = useDashboardData();

  const activeTeam = myTeams.find((team: any) => team.id === activeTeamId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-arena-bg text-arena-text-muted">
        <div className="text-center">
          <Loader2 className="animate-spin" size={18} />
          <p className="text-sm text-arena-text-muted">{t("loadingArena")}</p>
        </div>
      </div>
    );
  }

  // No team selected / manager has no teams yet
  if (!activeTeamId || !activeTeam) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-arena-bg text-arena-text-muted">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-arena-surface-el">
          <Shield className="size-7 text-arena-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-arena-text">
            {t("noTeam.title")}
          </h2>
          <p className="mt-1 text-sm text-arena-text-muted">
            {t("noTeam.description")}
          </p>
        </div>
        <Link
          href="/arena/teams"
          className="jb-action jb-action-primary text-sm"
        >
          <Plus size={15} />
          {t("noTeam.cta")}
        </Link>
      </div>
    );
  }

  const nextEvent = events[0];
  const weekEvents = events.slice(1);

  return (
    <>
      {sheet === "create-event" && (
        <CreateEventSheet organizerId={userId} onClose={() => setSheet(null)} />
      )}
      {sheet === "add-player" && (
        <AddPlayerSheet managerId={userId} onClose={() => setSheet(null)} />
      )}

      <div className="jb-page">
        <div className="jb-page-inner">
          <header className="jb-topbar">
            <div>
              <div className="jb-kicker">{t("kicker")}</div>
              <h1 className="jb-title">{activeTeam.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="jb-action hidden md:inline-flex"
                onClick={() => setSheet("add-player")}
                type="button"
                variant="ghost"
                size="sm"
              >
                <Users size={15} />
                {t("actions.player")}
              </Button>
              <Button
                className="jb-action jb-action-primary hidden md:inline-flex"
                onClick={() => setSheet("create-event")}
                type="button"
                variant="ghost"
                size="sm"
              >
                <Plus size={15} />
                {t("actions.event")}
              </Button>
              <JbUserMenu onlyAvatar />
            </div>
          </header>

          <div className="jb-dashboard-grid">
            <section className="jb-stack">
              {nextEvent ? (
                <Link
                  className="jb-hero-card"
                  href={`/arena/events/${nextEvent.id}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-[26px] place-items-center rounded-[7px] bg-arena-primary/[0.13]">
                        <Zap size={13} className="text-arena-primary" strokeWidth={2} />
                      </span>
                      <span className="jb-kicker text-arena-primary">
                        {t("hero.nextMatch")}
                      </span>
                      <span
                        className="size-[5px] rounded-full bg-arena-primary"
                        style={{ animation: "jb-pulse 2s infinite" }}
                      />
                    </div>
                    <JbBadge status="confirmed" />
                  </div>

                  <h2 className="mb-3 text-base font-bold leading-tight text-arena-text md:text-xl">
                    {nextEvent.title}
                  </h2>

                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {[
                      { Icon: Calendar, label: nextEvent.date },
                      { Icon: Clock, label: nextEvent.time },
                      { Icon: MapPin, label: nextEvent.location },
                    ].map(({ Icon, label }) => (
                      <span className="flex items-center gap-1.5" key={label}>
                        <Icon size={12} className="text-arena-text-muted" />
                        <span className="text-xs text-arena-text-sec">{label}</span>
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex -space-x-1">
                      {squad.filter(p => p.status === "confirmed").map(p => (
                        <JbAvatar
                          className="ring-2 ring-[#1B2430]"
                          id={p.id}
                          key={p.id}
                          name={p.name}
                          size={28}
                        />
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-arena-primary">
                      {t("hero.view")}
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              ) : (
                /* Empty state — no events yet */
                <div className="jb-hero-card flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-arena-surface-el">
                    <Calendar className="size-6 text-arena-primary/60" />
                  </div>
                  <p className="text-sm font-semibold text-arena-text-sec">
                    {t("hero.noEvents")}
                  </p>
                  <Button
                    className="jb-action jb-action-primary"
                    onClick={() => setSheet("create-event")}
                    variant="ghost"
                    size="sm"
                  >
                    <Plus size={14} />
                    {t("actions.createEvent")}
                  </Button>
                </div>
              )}

              <div className="jb-stat-grid">
                {([
                  { l: t("stats.confirmed"), v: confirmedCount, cls: "text-arena-success" },
                  { l: t("stats.reserves"), v: reserveCount, cls: "text-arena-warning" },
                  { l: t("stats.pending"), v: pendingCount, cls: "text-arena-text-muted" },
                ] as const).map(s => (
                  <div className="jb-card px-2 py-3 text-center" key={s.l}>
                    <div className={`text-[22px] font-extrabold ${s.cls}`}>
                      {s.v}
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold text-arena-text-muted">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="jb-action jb-action-primary md:hidden"
                onClick={() => setSheet("create-event")}
                type="button"
                variant="ghost"
                size="sm"
              >
                <Plus size={16} strokeWidth={2.5} />
                {t("actions.createEvent")}
              </Button>
            </section>

            <aside className="jb-stack">
              {/* This Week */}
              <section>
                <div className="jb-section-label flex items-center justify-between">
                  <span>{t("sections.thisWeek")}</span>
                  <Link
                    href="/arena/events"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-arena-info transition-colors hover:bg-arena-info/10"
                  >
                    <Calendar size={13} />
                    {t("sections.viewCalendar")}
                  </Link>
                </div>
                <div className="jb-stack">
                  {weekEvents.length > 0 ? (
                    weekEvents.map(e => {
                      const isGame = e.type === "match" || e.type === "partida";
                      return (
                        <Link
                          className="jb-card jb-list-row"
                          href={`/arena/events/${e.id}`}
                          key={e.id}
                        >
                          <span
                            className={`jb-icon-tile ${isGame ? "bg-arena-primary/[0.08]" : "bg-arena-info/[0.08]"}`}
                          >
                            {isGame ? (
                              <Trophy size={20} className="text-arena-primary" />
                            ) : (
                              <Calendar size={20} className="text-arena-info" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-arena-text">
                              {e.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-arena-text-muted">
                              {e.date} · {e.time}
                            </span>
                          </span>
                          <JbBadge status="pending" />
                        </Link>
                      );
                    })
                  ) : (
                    <div className="jb-card px-4 py-6 text-center text-sm text-arena-text-muted">
                      {t("sections.noWeekEvents")}
                    </div>
                  )}
                </div>
              </section>

              {/* Squad preview */}
              <section>
                <div className="jb-section-label">{t("sections.squad")}</div>
                <div className="jb-stack">
                  {squad.length > 0 ? (
                    squad.slice(0, 5).map(p => (
                      <Link
                        className="jb-card jb-list-row"
                        href={`/arena/teams/${p.id}`}
                        key={p.id}
                      >
                        <JbAvatar id={p.id} name={p.name} size={34} />
                        <span className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="block truncate text-sm font-semibold text-arena-text">
                              {p.name}
                            </span>
                            {p.isVerified && (
                              <VerifiedIcon
                                color="var(--user-verified)"
                                size={12}
                                className="text-arena-verified fill-arena-verified"
                              />
                            )}
                          </div>
                          <span className="mt-0.5 block text-[11px] text-arena-text-muted">
                            {p.role}
                          </span>
                        </span>
                        <JbBadge status={p.status} />
                      </Link>
                    ))
                  ) : (
                    <div className="jb-card px-4 py-6 text-center text-sm text-arena-text-muted">
                      {t("sections.noSquad")}
                    </div>
                  )}

                  <Link className="jb-action" href="/arena/teams">
                    {t("sections.viewFullSquad")}
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
