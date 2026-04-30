"use client";

import {
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
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
import { Button } from "@/components/ui/button";

const MOCK_EVENTS = [
  {
    id: 1,
    type: "jogo",
    title: "FC Bairro Alto vs Benfica B",
    date: "Sáb, 26 Abr",
    time: "18h00",
    location: "Campo 5, Bairro Alto",
    confirmed: 9,
    total: 14,
  },
  {
    id: 2,
    type: "treino",
    title: "Treino Técnico",
    date: "Ter, 22 Abr",
    time: "20h30",
    location: "Campo 3, Chiado",
    confirmed: 11,
    total: 14,
  },
  {
    id: 3,
    type: "treino",
    title: "Treino Tático",
    date: "Qui, 24 Abr",
    time: "20h30",
    location: "Campo 3, Chiado",
    confirmed: 7,
    total: 14,
  },
];

const MOCK_SQUAD = [
  { id: 1, name: "Diogo Ferreira", role: "GR", status: "confirmed" as const, isVerified: true },
  { id: 5, name: "Ricardo Pinto", role: "DE", status: "confirmed" as const, isVerified: false },
  { id: 8, name: "João Martins", role: "MD", status: "reserve" as const, isVerified: false },
  { id: 11, name: "Miguel Pereira", role: "PE", status: "pending" as const, isVerified: true },
];

const confirmedCount = MOCK_SQUAD.filter(p => p.status === "confirmed").length;
const reserveCount = MOCK_SQUAD.filter(p => p.status === "reserve").length;
const pendingCount = MOCK_SQUAD.filter(p => p.status === "pending").length;

interface ArenaDashboardClientProps {
  userId: string;
  userName: string;
  clubName: string;
}

export function ArenaDashboardClient({
  userId,
  userName,
  clubName,
}: ArenaDashboardClientProps) {
  const t = useTranslations("arenaDashboard");
  const [sheet, setSheet] = useState<"create-event" | "add-player" | null>(
    null,
  );
  const nextEvent = MOCK_EVENTS[0];
  const weekEvents = MOCK_EVENTS.slice(1);

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
              <h1 className="jb-title">{clubName}</h1>
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
              <JbAvatar id={userId} name={userName} size={40} />
            </div>
          </header>

          <div className="jb-dashboard-grid">
            <section className="jb-stack">
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
                    { Icon: Calendar, t: nextEvent.date },
                    { Icon: Clock, t: nextEvent.time },
                    { Icon: MapPin, t: nextEvent.location },
                  ].map(({ Icon, t }) => (
                    <span className="flex items-center gap-1.5" key={t}>
                      <Icon size={12} className="text-arena-text-muted" />
                      <span className="text-xs text-arena-text-sec">{t}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex -space-x-1">
                    {MOCK_SQUAD.filter(p => p.status === "confirmed").map(p => (
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
              <section>
                <div className="jb-section-label flex items-center justify-between">
                  <span>{t("sections.thisWeek")}</span>
                  <Link
                    href="/arena/calendar"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-arena-info transition-colors hover:bg-arena-info/10"
                  >
                    <Calendar size={13} />
                    {t("sections.viewCalendar")}
                  </Link>
                </div>
                <div className="jb-stack">
                  {weekEvents.map(e => {
                    const isGame = e.type === "jogo";
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
                  })}
                </div>
              </section>

              <section>
                <div className="jb-section-label">{t("sections.squad")}</div>
                <div className="jb-stack">
                  {MOCK_SQUAD.map(p => (
                    <Link
                      className="jb-card jb-list-row"
                      href="/arena/teams"
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
                  ))}

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
