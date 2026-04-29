"use client";

import { Calendar, Check, Clock, List, MapPin, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { JbScreenHeader } from "@/components/arena/jb-screen-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MOCK_CONFIRMED = [
  { id: 1, name: "Diogo Ferreira", role: "GR" },
  { id: 5, name: "Ricardo Pinto", role: "DE" },
  { id: 4, name: "Bruno Alves", role: "DC" },
  { id: 7, name: "Nuno Santos", role: "MC" },
  { id: 12, name: "Rui Gomes", role: "CA" },
];

const MOCK_RESERVES = [
  { id: 8, name: "João Martins", role: "MD" },
  { id: 10, name: "Luís Oliveira", role: "PD" },
];

const MOCK_PENDING = [
  { id: 11, name: "Miguel Pereira", role: "PE" },
  { id: 14, name: "Sérgio Lima", role: "DC" },
];

interface EventDetailClientProps {
  event: {
    id: number;
    title: string;
    type: string;
    location: string;
    startDate: Date | string;
    maxParticipants?: string | null;
    description?: string | null;
  };
  userId: string;
}

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Tab = "conv" | "local";

export function EventDetailClient({ event }: EventDetailClientProps) {
  const t = useTranslations("arenaEventDetail");
  const [tab, setTab] = useState<Tab>("conv");
  const [myStatus, setMyStatus] = useState<"pending" | "confirmed">("pending");

  const isJogo = event.type === "partida" || event.type === "jogo";
  const total = Number(event.maxParticipants) || 14;
  const fillPct = (MOCK_CONFIRMED.length / total) * 100;

  const TABS_DATA = [
    { id: "conv" as Tab, label: t("tabs.call"), icon: List },
    { id: "local" as Tab, label: t("tabs.local"), icon: MapPin },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-arena-bg">
      <JbScreenHeader title={isJogo ? t("titleJogo") : t("titleTreino")} />

      {/* ── Event header card ──────────────────────────────── */}
      <div
        className="border-b border-arena-border px-5 py-3.5"
        style={{
          background: "linear-gradient(180deg,#0F1E2E 0%,var(--color-arena-bg) 100%)",
        }}
      >
        {/* Title row */}
        <div className="mb-3 flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border",
              isJogo
                ? "border-arena-primary/27 bg-arena-primary/[0.13]"
                : "border-arena-info/27 bg-arena-info/[0.13]",
            )}
          >
            <Trophy
              size={18}
              className={isJogo ? "text-arena-primary" : "text-arena-info"}
            />
          </div>
          <div className="flex-1">
            <div
              className={cn(
                "text-[10px] font-bold uppercase tracking-[1px]",
                isJogo ? "text-arena-primary" : "text-arena-info",
              )}
            >
              {isJogo ? t("officialMatch") : t("training")}
            </div>
            <div className="text-[15px] font-bold leading-snug text-arena-text">
              {event.title}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mb-3 flex flex-wrap gap-2.5">
          {[
            { Icon: Calendar, label: formatDate(event.startDate) },
            { Icon: Clock, label: formatTime(event.startDate) },
            { Icon: MapPin, label: event.location },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={12} className="text-arena-text-muted" />
              <span className="text-[12px] text-arena-text-sec">{label}</span>
            </div>
          ))}
        </div>

        {/* Attendance bar */}
        <div className="rounded-[12px] border border-arena-border bg-arena-surface px-3 py-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-arena-text-sec">{t("spots")}</span>
            <span className="text-xs font-bold text-arena-text">
              <span className="text-arena-success">{MOCK_CONFIRMED.length}</span>
              {" "}/ {total}
            </span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-arena-border">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                fillPct >= 100 ? "bg-arena-danger" : "bg-arena-success",
              )}
              style={{ width: `${Math.min(fillPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex shrink-0 border-b border-arena-border">
        {TABS_DATA.map(tab_item => {
          const Icon = tab_item.icon;
          const isActive = tab === tab_item.id;
          return (
            <button
              key={tab_item.id}
              onClick={() => setTab(tab_item.id)}
              type="button"
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 border-b-2 py-[11px] text-[12px] transition-colors",
                isActive
                  ? "border-arena-primary font-bold text-arena-primary"
                  : "border-transparent font-medium text-arena-text-muted hover:text-arena-text-sec",
              )}
              style={{ marginBottom: -1 }}
            >
              <Icon size={13} />
              {tab_item.label}
            </button>
          );
        })}
      </div>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div className="flex-1 overflow-auto pb-20">
        {tab === "conv" && (
          <div className="px-5 py-3.5">
            {/* Confirmed list */}
            <div className="jb-section-label pb-2">
              {t("lists.main", { count: MOCK_CONFIRMED.length })}
            </div>
            <div className="mb-3.5 flex flex-col">
              {MOCK_CONFIRMED.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-2.5 border border-arena-border bg-arena-surface px-3.5 py-2.5",
                    i === 0
                      ? "rounded-t-[14px] rounded-b-[4px]"
                      : i === MOCK_CONFIRMED.length - 1
                        ? "rounded-t-[4px] rounded-b-[14px] border-t-0"
                        : "rounded-[4px] border-t-0",
                  )}
                >
                  <span className="w-5 text-center text-[11px] font-bold text-arena-text-muted">
                    {i + 1}
                  </span>
                  <JbAvatar name={p.name} size={30} id={p.id} />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-arena-text">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-arena-text-muted">
                      {p.role}
                    </div>
                  </div>
                  <Check size={15} className="text-arena-success" strokeWidth={2.5} />
                </div>
              ))}
            </div>

            {/* Reserves + Pending list */}
            <div className="jb-section-label pb-2">
              {t("lists.reserves", {
                count: MOCK_RESERVES.length + MOCK_PENDING.length,
              })}
            </div>
            <div className="flex flex-col">
              {[
                ...MOCK_RESERVES.map(p => ({ ...p, status: "reserve" as const })),
                ...MOCK_PENDING.map(p => ({ ...p, status: "pending" as const })),
              ].map((p, i, arr) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-2.5 border border-arena-border bg-arena-surface px-3.5 py-2.5 opacity-80",
                    i === 0
                      ? "rounded-t-[14px] rounded-b-[4px]"
                      : i === arr.length - 1
                        ? "rounded-t-[4px] rounded-b-[14px] border-t-0"
                        : "rounded-[4px] border-t-0",
                  )}
                >
                  <JbAvatar name={p.name} size={30} id={p.id} />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-arena-text">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-arena-text-muted">
                      {p.role}
                    </div>
                  </div>
                  <JbBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "local" && (
          <div className="px-5 py-3.5">
            <div className="mb-3.5 overflow-hidden rounded-[16px] border border-arena-border bg-arena-surface">
              {/* Map placeholder */}
              <div className="flex h-24 items-center justify-center bg-arena-bg-sec">
                <MapPin size={32} className="text-arena-primary" />
              </div>
              <div className="px-3.5 py-3">
                <div className="mb-2.5 text-[13px] font-semibold text-arena-text">
                  {event.location}
                </div>
                <div className="flex gap-1.5">
                  <Link
                    href={`https://www.google.com/maps/search/${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 flex-1 items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el text-[12px] font-semibold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
                  >
                    Google Maps
                  </Link>
                  <Link
                    href={`https://maps.apple.com/?q=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 flex-1 items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el text-[12px] font-semibold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
                  >
                    Apple Maps
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile CTA ─────────────────────────────────────── */}
      <div
        className="fixed bottom-[72px] left-0 right-0 px-5 pb-3.5 pt-2.5 md:hidden"
        style={{
          background:
            "linear-gradient(0deg,var(--color-arena-bg) 60%,transparent)",
        }}
      >
        <Button
          onClick={() =>
            setMyStatus(s => (s === "confirmed" ? "pending" : "confirmed"))
          }
          type="button"
          className={cn(
            "h-[50px] w-full rounded-[14px] text-[15px] font-bold",
            myStatus === "confirmed"
              ? "border border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface"
              : "bg-arena-primary text-arena-bg hover:bg-arena-primary/90",
          )}
        >
          {myStatus === "confirmed" ? (
            <>
              <X size={18} strokeWidth={2.5} />
              {t("actions.cancel")}
            </>
          ) : (
            <>
              <Check size={18} strokeWidth={2.5} />
              {t("actions.confirm")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
