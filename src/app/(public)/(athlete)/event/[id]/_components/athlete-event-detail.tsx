"use client";

import {
  CheckIcon,
  LinkIcon,
  MapPinIcon,
  SendIcon,
  ShareIcon,
  XIcon,
} from "@animateicons/react/lucide";
import { ArrowLeft, Calendar, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  cancelUserAttendance,
  confirmUserAttendance,
} from "@/actions/attendance.actions";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { Logo } from "@/components/logo";
import { useEventAttendance } from "@/hooks/use-event-attendance";
import { cn } from "@/lib/utils";
import { AthleteRsvpSheet } from "./athlete-rsvp-sheet";
import { CountdownTimer } from "./countdown-timer";

interface Event {
  id: number;
  title: string;
  type: string;
  location: string;
  startDate: Date;
  status: string;
  recurrence: string;
  maxParticipants?: string | null;
  description?: string | null;
  images?: string[];
}

interface AthleteEventDetailProps {
  event: Event;
  userId: string;
  userName: string;
  initialMyStatus: string | null;
}

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Tab = "lista" | "local";

function EventHeader({ eventTitle }: { eventTitle: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: eventTitle, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-arena-border bg-arena-bg/90 px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex size-9 items-center justify-center rounded-xl text-arena-text-muted transition-colors hover:bg-arena-surface hover:text-arena-text"
        aria-label="Voltar"
      >
        <ArrowLeft size={20} />
      </button>

      <Logo href="/" size="mini" variant="white" className="opacity-80" />

      <button
        type="button"
        onClick={handleShare}
        className="flex size-9 items-center justify-center rounded-xl text-arena-text-muted transition-colors hover:bg-arena-surface hover:text-arena-text"
        aria-label="Partilhar"
      >
        {copied ? (
          <CheckIcon size={18} color="var(--color-arena-primary)" />
        ) : (
          <ShareIcon size={18} color="currentColor" />
        )}
      </button>
    </header>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    scheduled: {
      label: "Agendado",
      color: "text-arena-info border-arena-info/30 bg-arena-info/10",
    },
    ongoing: {
      label: "A Decorrer",
      color: "text-arena-success border-arena-success/30 bg-arena-success/10",
    },
    completed: {
      label: "Concluído",
      color: "text-arena-text-muted border-arena-border bg-arena-surface",
    },
    cancelled: {
      label: "Cancelado",
      color: "text-arena-danger border-arena-danger/30 bg-arena-danger/10",
    },
  };
  const s = map[status] ?? map.scheduled;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        s.color,
      )}
    >
      {s.label}
    </span>
  );
}

function AttendanceBar({
  confirmed,
  total,
}: {
  confirmed: number;
  total: number;
}) {
  const pct = Math.min((confirmed / total) * 100, 100);
  const isFull = confirmed >= total;

  return (
    <div className="rounded-[14px] border border-arena-border bg-arena-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-arena-text-sec">
          Vagas preenchidas
        </span>
        <span className="text-[13px] font-bold text-arena-text">
          <span className={isFull ? "text-arena-danger" : "text-arena-success"}>
            {confirmed}
          </span>{" "}
          / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-arena-border">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isFull ? "bg-arena-danger" : "bg-arena-success",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isFull && (
        <p className="mt-2 text-center text-[11px] font-semibold text-arena-danger">
          Vagas esgotadas — podes entrar na lista de espera
        </p>
      )}
    </div>
  );
}

function ShareBar({
  eventId,
  eventTitle,
}: {
  eventId: number;
  eventTitle: string;
}) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/event/${eventId}`);
  }, [eventId]);

  const message = `Joga connosco! ${eventTitle}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;

  return (
    <div className="mb-5 rounded-[14px] border border-arena-border bg-arena-surface p-3.5">
      <div className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
        Convidar atletas
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
          }
          className="flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el py-2.5 text-[11px] font-semibold text-arena-text-sec transition-colors hover:border-arena-primary/30 hover:bg-arena-primary/10 hover:text-arena-primary"
        >
          {copied ? (
            <CheckIcon size={18} color="var(--color-arena-primary)" />
          ) : (
            <LinkIcon size={18} color="currentColor" />
          )}
          {copied ? "Copiado!" : "Copiar link"}
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
          WhatsApp
        </Link>
        <Link
          href={tgHref}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el py-2.5 text-[11px] font-semibold text-arena-text-sec no-underline transition-colors hover:border-[#2ca5e0]/30 hover:bg-[#2ca5e0]/10 hover:text-[#2ca5e0]"
        >
          <SendIcon size={18} color="currentColor" />
          Telegram
        </Link>
      </div>
    </div>
  );
}

export function AthleteEventDetail({
  event,
  userId,
  userName,
  initialMyStatus,
}: AthleteEventDetailProps) {
  const [tab, setTab] = useState<Tab>("lista");
  const [myStatus, setMyStatus] = useState<string | null>(initialMyStatus);
  const [showRsvpSheet, setShowRsvpSheet] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { confirmed, reserves, pending, isLoading, refetch } =
    useEventAttendance(event.id);

  const isJogo = event.type === "partida" || event.type === "jogo";
  const total = Number(event.maxParticipants) || 14;
  const isFull = confirmed.length >= total;

  async function handleConfirm() {
    if (!userId) {
      setShowRsvpSheet(true);
      return;
    }
    setActionLoading(true);
    const res = await confirmUserAttendance(event.id);
    if (res.success) {
      setMyStatus("confirmed");
      refetch();
    }
    setActionLoading(false);
  }

  async function handleCancel() {
    setActionLoading(true);
    const res = await cancelUserAttendance(event.id);
    if (res.success) {
      setMyStatus(null);
      refetch();
    }
    setActionLoading(false);
  }

  const TABS = [
    { id: "lista" as Tab, label: "Convocados" },
    { id: "local" as Tab, label: "Local" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-arena-bg">
      <EventHeader eventTitle={event.title} />

      {/* Event Hero */}
      <div
        className="border-b border-arena-border px-4 pb-5 pt-4"
        style={{
          background:
            "linear-gradient(180deg, #0F1E2E 0%, var(--color-arena-bg) 100%)",
        }}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-[13px] border",
              isJogo
                ? "border-arena-primary/30 bg-arena-primary/10"
                : "border-arena-info/30 bg-arena-info/10",
            )}
          >
            <Trophy
              size={20}
              className={isJogo ? "text-arena-primary" : "text-arena-info"}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isJogo ? "text-arena-primary" : "text-arena-info",
                )}
              >
                {isJogo ? "Jogo Oficial" : "Treino"}
              </span>
              <StatusBadge status={event.status} />
            </div>
            <h1 className="text-[18px] font-bold leading-snug text-arena-text">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-center justify-center rounded-[24px] border border-arena-border/50 bg-arena-surface-el/30 py-5 shadow-inner backdrop-blur-sm">
          <div className="mb-3.5 flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-arena-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-arena-text-muted">
              CONTAGEM DECRESCENTE
            </p>
          </div>
          <CountdownTimer targetDate={event.startDate} />
        </div>

        <div className="mb-4 flex flex-col gap-2">
          {[
            {
              Icon: <Calendar size={14} className="text-arena-text-muted" />,
              label: formatDate(event.startDate),
            },
            {
              Icon: <Clock size={14} className="text-arena-text-muted" />,
              label: formatTime(event.startDate),
            },
            {
              Icon: <MapPinIcon size={14} color="currentColor" />,
              label: event.location,
            },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-arena-surface text-arena-text-muted">
                {Icon}
              </div>
              <span className="text-[13px] text-arena-text-sec">{label}</span>
            </div>
          ))}
        </div>

        {!isLoading && (
          <AttendanceBar confirmed={confirmed.length} total={total} />
        )}

        {/* My status card */}
        {myStatus === "confirmed" && (
          <div className="mt-3 flex items-center gap-2.5 rounded-[12px] border border-arena-success/30 bg-arena-success/10 px-3.5 py-2.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-arena-success/20 text-arena-success">
              <CheckIcon size={14} color="currentColor" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-arena-success">
                Presença confirmada!
              </p>
              <p className="text-[11px] text-arena-text-muted">
                {userName ? `Olá, ${userName}` : "Estás na lista confirmada"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-arena-border bg-arena-bg">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center border-b-2 py-3 text-[13px] font-semibold transition-colors",
              tab === t.id
                ? "border-arena-primary text-arena-primary"
                : "border-transparent text-arena-text-muted hover:text-arena-text-sec",
            )}
            style={{ marginBottom: -1 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto pb-28">
        {tab === "lista" && (
          <div className="px-4 py-4">
            <ShareBar eventId={event.id} eventTitle={event.title} />

            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-arena-text-muted text-sm">
                A carregar...
              </div>
            ) : (
              <>
                {/* Confirmed */}
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
                    Confirmados
                  </span>
                  <span className="text-[11px] font-bold text-arena-success">
                    {confirmed.length}
                  </span>
                </div>
                <div className="mb-4 flex flex-col">
                  {confirmed.length === 0 ? (
                    <div className="rounded-[14px] border border-arena-border bg-arena-surface px-4 py-5 text-center text-[13px] text-arena-text-muted">
                      Ainda ninguém confirmou. Sê o primeiro!
                    </div>
                  ) : (
                    confirmed.map((p, i) => (
                      <div
                        key={p.id}
                        className={cn(
                          "flex items-center gap-3 border border-arena-border bg-arena-surface px-3.5 py-3",
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
                        <JbAvatar name={p.name} size={32} id={p.id} />
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-[13px] font-semibold text-arena-text">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-arena-text-muted">
                            {p.role}
                          </div>
                        </div>
                        <span className="text-arena-success">
                          <CheckIcon size={15} color="currentColor" />
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Waiting list */}
                {(reserves.length > 0 || pending.length > 0) && (
                  <>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
                        Lista de espera
                      </span>
                      <span className="text-[11px] font-bold text-arena-text-muted">
                        {reserves.length + pending.length}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      {[
                        ...reserves.map(p => ({
                          ...p,
                          status: "reserve" as const,
                        })),
                        ...pending.map(p => ({
                          ...p,
                          status: "pending" as const,
                        })),
                      ].map((p, i, arr) => (
                        <div
                          key={p.id}
                          className={cn(
                            "flex items-center gap-3 border border-arena-border bg-arena-surface px-3.5 py-3 opacity-70",
                            i === 0
                              ? "rounded-t-[14px] rounded-b-[4px]"
                              : i === arr.length - 1
                                ? "rounded-t-[4px] rounded-b-[14px] border-t-0"
                                : "rounded-[4px] border-t-0",
                          )}
                        >
                          <JbAvatar name={p.name} size={32} id={p.id} />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-[13px] font-semibold text-arena-text">
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
                  </>
                )}
              </>
            )}
          </div>
        )}

        {tab === "local" && (
          <div className="px-4 py-4">
            <div className="overflow-hidden rounded-[16px] border border-arena-border bg-arena-surface">
              <div className="flex h-28 items-center justify-center bg-arena-bg-sec">
                <span className="text-arena-primary">
                  <MapPinIcon size={36} color="currentColor" />
                </span>
              </div>
              <div className="px-4 py-4">
                <p className="mb-3 text-[14px] font-semibold text-arena-text">
                  {event.location}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`https://www.google.com/maps/search/${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el text-[12px] font-semibold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
                  >
                    Google Maps
                  </Link>
                  <Link
                    href={`https://maps.apple.com/?q=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el text-[12px] font-semibold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
                  >
                    Apple Maps
                  </Link>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="mt-4 rounded-[14px] border border-arena-border bg-arena-surface p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                  Notas
                </p>
                <p className="text-[13px] text-arena-text-sec">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky RSVP bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-4"
        style={{
          background:
            "linear-gradient(0deg, var(--color-arena-bg) 60%, transparent)",
        }}
      >
        {myStatus === "confirmed" ? (
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleCancel}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface-el text-[14px] font-bold text-arena-text-sec transition-colors hover:bg-arena-surface disabled:opacity-60"
          >
            <XIcon size={18} color="currentColor" />
            Cancelar presença
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirm}
              className={cn(
                "flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] text-[15px] font-bold transition-all disabled:opacity-60",
                isFull
                  ? "border border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface"
                  : "bg-arena-primary text-arena-bg shadow-[0_0_24px_rgba(124,255,79,0.25)] hover:bg-arena-primary/90",
              )}
            >
              <CheckIcon size={18} color="currentColor" />
              {isFull ? "Entrar na lista de espera" : "Confirmar presença"}
            </button>
            {!userId && (
              <p className="text-center text-[11px] text-arena-text-muted">
                Já tens conta?{" "}
                <Link
                  href={`/auth?callbackURL=/event/${event.id}`}
                  className="font-semibold text-arena-primary hover:underline"
                >
                  Entra para confirmar mais rápido
                </Link>
              </p>
            )}
          </div>
        )}
      </div>

      {showRsvpSheet && (
        <AthleteRsvpSheet
          eventId={event.id}
          onClose={() => setShowRsvpSheet(false)}
          onSuccess={status => {
            setMyStatus(status);
            setShowRsvpSheet(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
