"use client";

import {
  Calendar,
  Check,
  Clock,
  Link2,
  List,
  MapPin,
  Send,
  Settings2,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { JbScreenHeader } from "@/components/arena/jb-screen-header";
import { EditEventSheet } from "@/components/arena/edit-event-sheet";
import { Button } from "@/components/ui/button";
import { useEventAttendance } from "@/hooks/use-event-attendance";
import { cn } from "@/lib/utils";

interface EventDetailProps {
  event: {
    id: number;
    title: string;
    type: string;
    location: string;
    startDate: Date | string;
    status: string;
    recurrence: string;
    maxParticipants?: string | null;
    description?: string | null;
  };
  userId: string;
  canEdit?: boolean;
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

function ShareBar({
  eventId,
  eventTitle,
}: {
  eventId: number;
  eventTitle: string;
}) {
  const t = useTranslations("arenaEventDetail");
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/arena/events/${eventId}`);
  }, [eventId]);

  const message = t("share.message", { title: eventTitle });
  const fullText = `${message} ${url}`;

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const waHref = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;

  return (
    <div className="mb-4 rounded-[14px] border border-arena-border bg-arena-surface p-3.5">
      <div className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
        {t("share.label")}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el py-2.5 text-[11px] font-semibold text-arena-text-sec transition-colors hover:border-arena-primary/30 hover:bg-arena-primary/10 hover:text-arena-primary"
        >
          {copied ? (
            <Check size={18} className="text-arena-primary" strokeWidth={2.5} />
          ) : (
            <Link2 size={18} />
          )}
          {copied ? t("share.copied") : t("share.copyLink")}
        </button>

        <Link
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el py-2.5 text-[11px] font-semibold text-arena-text-sec no-underline transition-colors hover:border-[#25d366]/30 hover:bg-[#25d366]/10 hover:text-[#25d366]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t("share.whatsapp")}
        </Link>

        <Link
          href={tgHref}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el py-2.5 text-[11px] font-semibold text-arena-text-sec no-underline transition-colors hover:border-[#2ca5e0]/30 hover:bg-[#2ca5e0]/10 hover:text-[#2ca5e0]"
        >
          <Send size={18} />
          {t("share.telegram")}
        </Link>
      </div>
    </div>
  );
}

export function EventDetail({ event, userId, canEdit = false }: EventDetailProps) {
  const t = useTranslations("arenaEventDetail");
  const [tab, setTab] = useState<Tab>("conv");
  const [myStatus, setMyStatus] = useState<"pending" | "confirmed">("pending");
  const [isEditing, setIsEditing] = useState(false);

  const { confirmed, reserves, pending, isLoading } = useEventAttendance(
    event.id,
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-arena-bg text-arena-text-muted">
        Carregando detalhes...
      </div>
    );
  }

  const isJogo = event.type === "partida" || event.type === "jogo";
  const total = Number(event.maxParticipants) || 14;
  const fillPct = (confirmed.length / total) * 100;

  const TABS_DATA = [
    { id: "conv" as Tab, label: t("tabs.call"), icon: List },
    { id: "local" as Tab, label: t("tabs.local"), icon: MapPin },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-arena-bg">
      <JbScreenHeader 
        title={isJogo ? t("titleJogo") : t("titleTreino")} 
        right={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-arena-text-muted hover:text-arena-text"
            onClick={() => setIsEditing(true)}
          >
            <Settings2 size={18} />
          </Button>
        }
      />

      {isEditing && (
        <EditEventSheet event={event as any} onClose={() => setIsEditing(false)} />
      )}

      <div
        className="border-b border-arena-border px-5 py-3.5"
        style={{
          background:
            "linear-gradient(180deg,#0F1E2E 0%,var(--color-arena-bg) 100%)",
        }}
      >
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

        <div className="rounded-[12px] border border-arena-border bg-arena-surface px-3 py-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-arena-text-sec">{t("spots")}</span>
            <span className="text-xs font-bold text-arena-text">
              <span className="text-arena-success">{confirmed.length}</span> /{" "}
              {total}
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

      <div className="flex-1 overflow-auto pb-20">
        {tab === "conv" && (
          <div className="px-5 py-3.5">
            <ShareBar eventId={event.id} eventTitle={event.title} />

            <div className="jb-section-label pb-2">
              {t("lists.main", { count: confirmed.length })}
            </div>
            <div className="mb-3.5 flex flex-col">
              {confirmed.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-2.5 border border-arena-border bg-arena-surface px-3.5 py-2.5",
                    i === 0
                      ? "rounded-t-[14px] rounded-b-[4px]"
                      : i === confirmed.length - 1
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
                  <Check
                    size={15}
                    className="text-arena-success"
                    strokeWidth={2.5}
                  />
                </div>
              ))}
            </div>

            <div className="jb-section-label pb-2">
              {t("lists.reserves", {
                count: reserves.length + pending.length,
              })}
            </div>
            <div className="flex flex-col">
              {[
                ...reserves.map(p => ({ ...p, status: "reserve" as const })),
                ...pending.map(p => ({ ...p, status: "pending" as const })),
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
