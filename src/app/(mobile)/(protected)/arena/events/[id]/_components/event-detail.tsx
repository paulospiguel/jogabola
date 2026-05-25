"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Bus,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  List,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Settings2,
  Share2,
  Sparkles,
  Train,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { JbAvatar } from "@/components/arena/avatar";
import { type Guest, GuestsSheet } from "@/components/arena/guests-sheet";
import { ShareEventSheet } from "@/components/arena/share-event-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatTime } from "@/lib/utils";
import type { EventStatus } from "@/types/events";

// High-fidelity Roster Mock Players (Mockup Screen 1 & 2)
const MAIN_ROSTER = [
  {
    id: "1",
    name: "Diogo Ferreira",
    pos: "GR",
    rating: 8.2,
    status: "PAGO",
    verified: true,
    star: true,
    initials: "DF",
    color: "#FACC15",
  },
  {
    id: "2",
    name: "André Costa",
    pos: "DD",
    rating: 7.5,
    status: "PAGO",
    verified: true,
    star: false,
    initials: "AC",
    color: "#38BDF8",
  },
  {
    id: "3",
    name: "Tiago Mendes",
    pos: "DC",
    rating: 7.8,
    status: "A VALIDAR",
    verified: true,
    star: false,
    initials: "TM",
    color: "#EF4444",
  },
  {
    id: "4",
    name: "Bruno Alves",
    pos: "DC",
    rating: 8.0,
    status: "PENDENTE",
    verified: true,
    star: false,
    initials: "BA",
    color: "#22C55E",
  },
  {
    id: "5",
    name: "Ricardo Pinto",
    pos: "DE",
    rating: 8.5,
    status: "PAGO",
    verified: true,
    star: true,
    initials: "RP",
    color: "#B97FFF",
  },
  {
    id: "6",
    name: "Fábio Rodrigues",
    pos: "MC",
    rating: 7.2,
    status: "PENDENTE",
    verified: false,
    star: false,
    initials: "FR",
    color: "#3B82F6",
  },
  {
    id: "7",
    name: "Nuno Santos",
    pos: "MC",
    rating: 7.9,
    status: "PAGO",
    verified: true,
    star: false,
    initials: "NS",
    color: "#F97316",
  },
  {
    id: "8",
    name: "Carlos Sousa",
    pos: "ME",
    rating: 7.3,
    status: "PENDENTE",
    verified: false,
    star: false,
    initials: "CS",
    color: "#EC4899",
  },
  {
    id: "9",
    name: "Rui Gomes",
    pos: "CA",
    rating: 8.3,
    status: "PAGO",
    verified: true,
    star: false,
    initials: "RG",
    color: "#7CFF4F",
  },
  {
    id: "10",
    name: "Marco Carvalho",
    pos: "GR",
    rating: 7.4,
    status: "A VALIDAR",
    verified: true,
    star: false,
    initials: "MC",
    color: "#14B8A6",
  },
];

const RESERVES_ROSTER = [
  {
    id: "11",
    name: "João Martins",
    pos: "MD",
    rating: 7.0,
    status: "Reserva",
    verified: true,
    star: false,
    initials: "JM",
    color: "#6366F1",
  },
  {
    id: "12",
    name: "Luís Oliveira",
    pos: "PD",
    rating: 7.6,
    status: "Reserva",
    verified: true,
    star: false,
    initials: "LO",
    color: "#8B5CF6",
  },
  {
    id: "13",
    name: "Miguel Pereira",
    pos: "PE",
    rating: 6.8,
    status: "Pendente",
    verified: true,
    star: false,
    initials: "MP",
    color: "#A855F7",
  },
  {
    id: "14",
    name: "Sérgio Lima",
    pos: "DC",
    rating: 7.1,
    status: "Pendente",
    verified: false,
    star: false,
    initials: "SL",
    color: "#6B7280",
  },
];

// Mock Chat Initial History (Tab 4 Mockup)
const INITIAL_CHAT_MESSAGES = [
  {
    id: 1,
    name: "Diogo Ferreira",
    initials: "DF",
    color: "#FACC15",
    text: "Quem leva as bolas para o treino?",
    time: "20:05",
    self: false,
  },
  {
    id: 2,
    name: "André Costa",
    initials: "AC",
    color: "#38BDF8",
    text: "Eu levo uma, mas precisamos de pelo menos mais outra.",
    time: "20:08",
    self: false,
  },
  {
    id: 3,
    name: "Tiago Mendes",
    initials: "TM",
    color: "#EF4444",
    text: "Eu posso levar a bomba de ar por via das dúvidas.",
    time: "20:12",
    self: false,
  },
  {
    id: 4,
    name: "Ricardo Pinto",
    initials: "RP",
    color: "#B97FFF",
    text: "Já me inscrevi! Contem comigo no Campo 3.",
    time: "20:15",
    self: false,
  },
];

interface EventDetailProps {
  event: {
    id: number;
    title: string;
    type: string;
    location: string;
    startDate: Date | string;
    status: EventStatus;
    recurrence: string;
    teamId: number;
    maxParticipants?: string | null;
    priceCents?: number;
    paymentRequired?: boolean;
    paymentDeadlineHours?: number | null;
    rosterOnly?: boolean;
    description?: string | null;
  };
  userId: string;
  canEdit?: boolean;
  initialMyStatus?: string | null;
}

type Tab = "roster" | "teams" | "location" | "chat";

export function EventDetail({
  // biome-ignore lint/correctness/noUnusedFunctionParameters: mock implementation
  event,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: mock implementation
  userId,
  canEdit = false,
  initialMyStatus,
}: EventDetailProps) {
  const t = useTranslations("arenaEventDetail");
  const locale = useLocale();

  const eventDate =
    typeof event.startDate === "string"
      ? new Date(event.startDate)
      : event.startDate;
  const formattedDate = eventDate.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const formattedTime = formatTime(eventDate);

  const eventTypeLabel = t(`types.${event.type}`, {
    defaultValue: event.type === "training" ? t("training") : t("titleJogo"),
  });
  const eventRecurrenceLabel = t(`recurrence.${event.recurrence}`, {
    defaultValue: event.recurrence,
  });
  const [activeTab, setActiveTab] = useState<Tab>("roster");
  const [myStatus, setMyStatus] = useState<string | null>(
    initialMyStatus ?? null,
  );
  const [_isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Tab 2: Equipas State Controls
  const [format, setFormat] = useState<"5vs5" | "7vs7" | "11vs11">("7vs7");
  const [numTeams, setNumTeams] = useState<2 | 3 | 4>(2);
  const [_guestsCount, _setGuestsCount] = useState(0);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestsOpen, setGuestsOpen] = useState(false);

  // Tab 4: Chat State Controls
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const totalSpots = 14;
  const filledSpots = 10 + guests.length;
  const vacancies = Math.max(0, totalSpots - filledSpots); // dynamic spots left

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMessage = {
      id: chatMessages.length + 1,
      name: "Rui Gomes",
      initials: "RG",
      color: "#7CFF4F",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      self: true,
    };
    setChatMessages(prev => [...prev, newMessage]);
    setInputMessage("");
  };

  const handleConfirmAttendance = async () => {
    setActionLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMyStatus("confirmed");
      setActionLoading(false);
    }, 600);
  };

  const handleCancelAttendance = async () => {
    setActionLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMyStatus(null);
      setActionLoading(false);
    }, 600);
  };

  const TABS = [
    { id: "roster", label: "Conv.", icon: List },
    { id: "teams", label: "Equipas", icon: Users },
    { id: "location", label: "Local", icon: MapPin },
    { id: "chat", label: "Chat", icon: MessageSquare },
  ] as const;

  return (
    <motion.div
      className="flex min-h-screen flex-col bg-arena-bg pb-20 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
    >
      {/* HEADER SECTION (Ecrã 1) */}
      <div
        className="px-5 pt-4 pb-3 border-b border-arena-border relative"
        style={{
          background:
            "linear-gradient(180deg, rgba(15, 30, 46, 0.45) 0%, var(--color-arena-bg) 100%)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center border border-[#00f0ff]/20 shrink-0">
              <Compass
                className="w-5.5 h-5.5 text-[#00f0ff]"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00f0ff]">
                  {eventTypeLabel}
                </span>
                <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.25 bg-[#00f0ff]/15 text-[#00f0ff] rounded border border-[#00f0ff]/20 leading-none">
                  {eventRecurrenceLabel}
                </span>
              </div>
              <h1 className="text-[17px] font-extrabold font-sora text-arena-text leading-snug mt-0.5">
                {event.title}
              </h1>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-9 h-9 bg-arena-surface border border-arena-border hover:bg-arena-surface-el text-arena-text-sec hover:text-arena-text rounded-xl flex items-center justify-center transition-all"
            >
              <Settings2 size={16} />
            </button>
          )}
        </div>

        {/* Event Meta Rows */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 px-1 text-arena-text-sec text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-arena-text-muted" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-arena-text-muted" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-arena-text-muted" />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Elevated Vagas Progress Bar card (Ecrã 1) */}
        <div className="bg-arena-surface border border-arena-border rounded-[14px] p-3 mt-4 relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-arena-text-sec">
              {t("spots")}
            </span>
            <span className="text-xs font-bold text-arena-text">
              <span className="text-arena-primary font-sora font-extrabold">
                {filledSpots}
              </span>{" "}
              / {totalSpots}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-arena-border">
            <div
              className="h-full rounded-full bg-arena-primary shadow-[0_0_12px_rgba(124,255,79,0.3)] transition-all duration-300"
              style={{ width: `${(filledSpots / totalSpots) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* HORIZONTAL CUSTOM TABS SELECTOR */}
      <div className="flex border-b border-arena-border bg-arena-surface/40 overflow-hidden relative">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5",
                isActive
                  ? "text-arena-primary"
                  : "text-arena-text-muted hover:text-arena-text-sec",
              )}
            >
              <Icon
                size={14}
                className={cn(
                  "transition-colors",
                  isActive ? "text-arena-primary" : "text-arena-text-muted",
                )}
              />
              {tab.id === "roster"
                ? t("tabs.roster")
                : tab.id === "teams"
                  ? t("tabs.teams")
                  : tab.id === "location"
                    ? t("tabs.location")
                    : t("tabs.chat")}

              {/* Green active underline */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-arena-primary rounded-t-full shadow-[0_-2px_10px_rgba(124,255,79,0.4)]"
                  layoutId="activeTabUnderline"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* DYNAMIC SCROLLABLE TAB CONTENTS */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        {/* TAB 1: CONVOCATÓRIA (Ecrãs 1 & 2) */}
        {activeTab === "roster" && (
          <div className="flex flex-col gap-5">
            {/* LISTA PRINCIPAL (10) */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted px-1.5">
                {t("lists.main", { count: MAIN_ROSTER.length })}
              </div>
              <div className="bg-arena-surface border border-arena-border rounded-[16px] divide-y divide-arena-border/50 overflow-hidden">
                {MAIN_ROSTER.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3.5 gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-4 shrink-0 text-center text-[10px] font-bold text-arena-text-muted">
                        {idx + 1}
                      </span>
                      <div className="relative shrink-0">
                        <JbAvatar
                          id={player.id}
                          name={player.name}
                          size={32}
                          className="rounded-full overflow-hidden"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-arena-text truncate">
                            {player.name}
                          </span>
                          {player.verified && (
                            <CheckCircle2
                              size={12}
                              className="text-arena-primary shrink-0"
                              strokeWidth={2.5}
                            />
                          )}
                          {player.star && (
                            <Sparkles
                              size={11}
                              className="text-arena-highlight shrink-0 fill-arena-highlight"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-arena-text-muted">
                            {player.pos}
                          </span>

                          {/* Payment status badge capsules */}
                          <span
                            className={cn(
                              "text-[8px] uppercase tracking-wide font-extrabold px-1.5 py-0.25 rounded border leading-none",
                              player.status === "PAGO"
                                ? "bg-arena-success/15 border-arena-success/20 text-arena-success"
                                : player.status === "A VALIDAR"
                                  ? "bg-arena-warning/15 border-arena-warning/20 text-arena-warning"
                                  : "bg-arena-text-muted/15 border-arena-border text-arena-text-sec",
                            )}
                          >
                            {t(
                              `interactive.payment${player.status === "PAGO" ? "Approved" : player.status === "A VALIDAR" ? "Review" : "Pending"}`,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Check
                      size={16}
                      className="text-arena-primary shrink-0"
                      strokeWidth={2.8}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RESERVAS (2) */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted px-1.5">
                {t("interactive.reservesMock", { count: RESERVES_ROSTER.length })}
              </div>
              <div className="bg-arena-surface border border-arena-border rounded-[16px] divide-y divide-arena-border/50 overflow-hidden">
                {RESERVES_ROSTER.map(player => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3.5 gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <JbAvatar
                          id={player.id}
                          name={player.name}
                          size={32}
                          className="rounded-full overflow-hidden"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-arena-text truncate">
                            {player.name}
                          </span>
                          {player.verified && (
                            <CheckCircle2
                              size={12}
                              className="text-arena-primary shrink-0"
                              strokeWidth={2.5}
                            />
                          )}
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-arena-text-muted mt-0.5 block">
                          {player.pos}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-xl border leading-none shrink-0",
                        player.status === "Reserva"
                          ? "bg-arena-warning/15 border-arena-warning/20 text-arena-warning"
                          : "bg-arena-text-muted/15 border-arena-border text-arena-text-sec",
                      )}
                    >
                      {player.status === "Reserva"
                        ? t("interactive.reservesStatus")
                        : t("interactive.pendingStatus")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EQUIPAS (Ecrãs 3 & 4) */}
        {activeTab === "teams" && (
          <div className="flex flex-col gap-5">
            {/* Top Warning Alert Card */}
            {vacancies > 0 ? (
              <div className="bg-arena-warning/5 border border-arena-warning/25 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-[0_4px_24px_rgba(245,158,11,0.02)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-arena-warning/10 border border-arena-warning/20 flex items-center justify-center shrink-0">
                    <AlertCircle
                      className="w-5.5 h-5.5 text-arena-warning"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-sm text-arena-text block">
                      {t("interactive.missingAlert", { count: vacancies })}
                    </span>
                    <span className="text-xs text-arena-text-muted block mt-0.5">
                      {t("interactive.missingAlertSub", {
                        format,
                        teamsCount: numTeams,
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-sora font-extrabold text-lg text-arena-text">
                    {filledSpots}
                    <span className="text-xs font-semibold text-arena-text-muted">
                      /{totalSpots}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-arena-success/5 border border-arena-success/25 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-[0_4px_24px_rgba(34,197,94,0.02)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-arena-success/10 border border-arena-success/20 flex items-center justify-center shrink-0">
                    <Check
                      className="w-5.5 h-5.5 text-arena-primary"
                      strokeWidth={2.8}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-sm text-arena-text block">
                      {t("interactive.squadFull")}
                    </span>
                    <span className="text-xs text-arena-text-muted block mt-0.5">
                      {t("interactive.readyToBalance")}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-sora font-extrabold text-lg text-arena-text">
                    {filledSpots}
                    <span className="text-xs font-semibold text-arena-text-muted">
                      /{totalSpots}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* FORMAT SELECTOR PANEL */}
            <div className="bg-arena-surface border border-arena-border rounded-[16px] p-3.5 flex flex-col gap-3.5">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-arena-text-muted uppercase tracking-wider">
                  {t("interactive.formatLabel")}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["5vs5", "7vs7", "11vs11"] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={cn(
                        "h-10 rounded-xl font-extrabold text-xs border transition-all active:scale-97 flex items-center justify-center",
                        format === f
                          ? "bg-arena-surface border-arena-primary/40 text-arena-primary"
                          : "bg-arena-bg-sec/50 border-arena-border text-arena-text-sec hover:border-arena-border/80",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-arena-border/30 pt-3.5">
                <span className="text-xs font-bold text-arena-text-sec">
                  {t("interactive.teamsNumLabel")}
                </span>
                <div className="flex items-center gap-2">
                  {([2, 3, 4] as const).map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumTeams(n)}
                      className={cn(
                        "w-8 h-8 rounded-lg border font-extrabold text-xs transition-all active:scale-97 flex items-center justify-center",
                        numTeams === n
                          ? "border-arena-primary text-arena-primary bg-arena-primary/10"
                          : "border-arena-border bg-arena-bg-sec/50 text-arena-text-sec hover:border-arena-border/80",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PLANTEL (10) with Ratings */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted px-1.5">
                {t("interactive.squadCount", { count: filledSpots })}
              </div>
              <div className="bg-arena-surface border border-arena-border rounded-[16px] divide-y divide-arena-border/50 overflow-hidden">
                {MAIN_ROSTER.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3.5 gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-4 shrink-0 text-center text-[10px] font-bold text-arena-text-muted">
                        {idx + 1}
                      </span>
                      <div className="relative shrink-0">
                        <JbAvatar
                          id={player.id}
                          name={player.name}
                          size={32}
                          className="rounded-full overflow-hidden"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-arena-text truncate">
                            {player.name}
                          </span>
                          {player.star && (
                            <Sparkles
                              size={11}
                              className="text-arena-highlight shrink-0 fill-arena-highlight"
                            />
                          )}
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-arena-text-muted mt-0.5 block">
                          {player.pos}
                        </span>
                      </div>
                    </div>

                    {/* Rating values */}
                    <span className="font-sora font-extrabold text-sm text-arena-primary shrink-0">
                      {player.rating.toFixed(1)}
                    </span>
                  </div>
                ))}

                {guests.map((guest, idx) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3.5 gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-4 shrink-0 text-center text-[10px] font-bold text-arena-text-muted">
                        {MAIN_ROSTER.length + idx + 1}
                      </span>
                      <div className="relative shrink-0">
                        <JbAvatar
                          id={guest.id}
                          name={guest.name}
                          size={32}
                          className="rounded-full overflow-hidden"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-arena-text truncate">
                            {guest.name}
                          </span>
                          <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.25 bg-arena-primary/15 text-arena-primary rounded border border-arena-primary/20 leading-none">
                            {t("interactive.guest")}
                          </span>
                        </div>
                        <span
                          className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5 block font-bold"
                          style={{ color: guest.levelColor }}
                        >
                          {guest.levelLabel}
                        </span>
                      </div>
                    </div>

                    <span className="font-sora font-extrabold text-sm text-arena-primary shrink-0">
                      {guest.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GUESTS ADD CARD (Ecrã 4) */}
            <button
              type="button"
              onClick={() => setGuestsOpen(true)}
              className="w-full flex items-center justify-between p-3.5 border border-dashed border-arena-primary/30 bg-arena-surface rounded-[16px] active:scale-97 text-left transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-arena-primary/10 border border-arena-primary/20 flex items-center justify-center shrink-0">
                  <UserPlus
                    className="w-5.5 h-5.5 text-arena-primary"
                    strokeWidth={1.8}
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-sm text-arena-text block">
                    {t("interactive.addGuests")}
                  </span>
                  <span className="text-xs text-arena-text-muted block mt-0.5 truncate">
                    {t("interactive.addGuestsSub", { count: vacancies })}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-arena-text-muted" />
            </button>

            {/* IA TEAM BALANCER SECTION (Ecrã 4) */}
            <div
              className="bg-arena-surface border border-arena-primary/30 rounded-[16px] p-4 flex flex-col gap-4 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124, 255, 79, 0.08) 0%, var(--color-arena-surface) 60%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-arena-primary/15 border border-arena-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles
                    className="w-4.5 h-4.5 text-arena-primary animate-pulse"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-arena-text block">
                      {t("interactive.aiBalancerBeta")}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.25 bg-arena-primary/20 text-arena-primary rounded border border-arena-primary/30 leading-none">
                      BETA
                    </span>
                  </div>
                  <span className="text-xs text-arena-text-muted block mt-0.5">
                    {t("interactive.aiBalancerBetaSub")}
                  </span>
                </div>
              </div>

              <Button className="w-full bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/95 font-bold h-11 rounded-xl text-sm transition-all gap-1.5 shadow-[0_0_24px_rgba(124,255,79,0.22)]">
                <Sparkles className="w-4 h-4 shrink-0 fill-current" />
                {t("interactive.aiBalancerCta", { count: numTeams })}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: LOCAL (Ecrã 5) */}
        {activeTab === "location" && (
          <div className="flex flex-col gap-5 animate-[fadeIn_.2s_ease-out]">
            {/* MINI STYLIZED DARK MAP CONTAINER */}
            <div className="relative w-full h-[180px] bg-arena-surface border border-arena-border rounded-[16px] overflow-hidden flex items-center justify-center">
              {/* Technical Pitch/Grid overlay lines */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--color-arena-text) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              {/* Visual simulated soccer pitch lines */}
              <div className="absolute inset-x-8 inset-y-6 border border-arena-border/30 rounded-lg flex items-center justify-center pointer-events-none">
                <div className="absolute inset-y-0 left-0 w-1/4 border-r border-arena-border/25" />
                <div className="absolute inset-y-0 right-0 w-1/4 border-l border-arena-border/25" />
                <div className="w-12 h-12 rounded-full border border-arena-border/25 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-arena-border/40" />
                </div>
              </div>

              {/* Pulsing neon green location indicator dot */}
              <div className="relative flex items-center justify-center z-10">
                <motion.div
                  className="absolute w-[60px] h-[60px] bg-arena-primary/10 rounded-full border border-arena-primary/20"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute w-[36px] h-[36px] bg-arena-primary/15 rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.4,
                  }}
                />
                <div className="w-5 h-5 bg-arena-primary rounded-full border-2 border-arena-bg shadow-[0_0_15px_rgba(124,255,79,0.7)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#0B0F14] rounded-full" />
                </div>
              </div>

              {/* Dynamic inline map address tag */}
              <div className="absolute bottom-3 left-3 bg-arena-bg-sec/90 border border-arena-border/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-arena-primary" />
                <span className="text-[10px] font-bold text-arena-text">
                  {event.location}
                </span>
              </div>
            </div>

            {/* Address Details Card */}
            <div className="bg-arena-surface border border-arena-border rounded-[16px] p-4 flex flex-col gap-4">
              <div>
                <span className="font-extrabold text-sm text-arena-text block">
                  {event.location}
                </span>
                <span className="text-xs text-arena-text-muted block mt-1">
                  Travessa da Boa Hora, 12 · Lisboa
                </span>
              </div>

              {/* Navigation CTAs */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-arena-bg-sec border border-arena-border text-arena-text hover:bg-arena-surface-el font-bold text-xs h-10 rounded-xl gap-1.5 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-arena-primary" />
                  Google Maps
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-arena-bg-sec border border-arena-border text-arena-text hover:bg-arena-surface-el font-bold text-xs h-10 rounded-xl gap-1.5 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-arena-primary" />
                  Apple Maps
                </Button>
                <Button
                  onClick={() => setShareOpen(true)}
                  variant="outline"
                  className="press w-10 h-10 bg-arena-bg-sec border border-arena-border hover:bg-arena-surface-el flex items-center justify-center shrink-0 rounded-xl"
                >
                  <Share2 className="w-4 h-4 text-arena-text-sec" />
                </Button>
              </div>
            </div>

            {/* Directions list ("Como chegar") */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted px-1">
                {t("interactive.howToGet")}
              </span>

              <div className="bg-arena-surface border border-arena-border rounded-[16px] p-3.5 flex flex-col gap-4">
                {/* Metro */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-arena-bg-sec flex items-center justify-center shrink-0 border border-arena-border/60">
                    <Train className="w-4.5 h-4.5 text-arena-text-sec" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-arena-text block">
                      {t("interactive.metro")}
                    </span>
                    <span className="text-xs text-arena-text-muted block mt-0.5 leading-relaxed">
                      {t("interactive.metroDesc")}
                    </span>
                  </div>
                </div>

                {/* Autocarro */}
                <div className="flex gap-3 border-t border-arena-border/30 pt-3.5">
                  <div className="w-8 h-8 rounded-lg bg-arena-bg-sec flex items-center justify-center shrink-0 border border-arena-border/60">
                    <Bus className="w-4.5 h-4.5 text-arena-text-sec" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-arena-text block">
                      {t("interactive.bus")}
                    </span>
                    <span className="text-xs text-arena-text-muted block mt-0.5 leading-relaxed">
                      {t("interactive.busDesc")}
                    </span>
                  </div>
                </div>

                {/* Carro */}
                <div className="flex gap-3 border-t border-arena-border/30 pt-3.5">
                  <div className="w-8 h-8 rounded-lg bg-arena-bg-sec flex items-center justify-center shrink-0 border border-arena-border/60">
                    <Car className="w-4.5 h-4.5 text-[#EF4444]" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-arena-text block">
                      {t("interactive.car")}
                    </span>
                    <span className="text-xs text-arena-text-muted block mt-0.5 leading-relaxed">
                      {t("interactive.carDesc")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CHAT (NEW premium chat interactive emulator) */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-[60vh] border border-arena-border bg-arena-surface/40 rounded-2xl overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[fadeIn_.2s_ease-out]">
            {/* Chat Body messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-none">
              {chatMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare
                    className="w-8 h-8 text-arena-text-muted mb-2"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs text-arena-text-muted">
                    {t("interactive.chatEmpty")}
                  </span>
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start gap-2.5 max-w-[85%]",
                      msg.self ? "self-end flex-row-reverse" : "self-start",
                    )}
                  >
                    {/* Teammate avatar */}
                    {!msg.self && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 border border-black/10 text-arena-bg shadow-sm"
                        style={{ backgroundColor: msg.color }}
                      >
                        {msg.initials}
                      </div>
                    )}

                    <div className="flex flex-col">
                      {/* Name header for teammate bubble */}
                      {!msg.self && (
                        <span className="text-[10px] font-bold text-arena-text-muted ml-1.5 mb-0.5">
                          {msg.name}
                        </span>
                      )}
                      {/* Chat text box */}
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm",
                          msg.self
                            ? "bg-arena-primary text-[#0B0F14] font-semibold rounded-tr-none"
                            : "bg-arena-surface border border-arena-border text-arena-text rounded-tl-none",
                        )}
                      >
                        {msg.text}
                      </div>
                      <span
                        className={cn(
                          "text-[8px] text-arena-text-muted mt-0.5 px-1.5",
                          msg.self ? "text-right" : "text-left",
                        )}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom send chat field panel */}
            <div className="p-3 border-t border-arena-border bg-arena-surface flex items-center gap-2">
              <Input
                placeholder={t("interactive.chatPlaceholder")}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="flex-1 bg-arena-surface-el border-arena-border text-arena-text h-10 rounded-xl px-3.5 text-xs"
              />
              <Button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-arena-primary hover:bg-arena-primary/90 text-[#0B0F14] flex items-center justify-center shrink-0 rounded-xl"
              >
                <Send className="w-4.5 h-4.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM ACTION BAR (Present on all tabs for premium UX) */}
      {activeTab !== "chat" && (
        <motion.div
          className="fixed bottom-[68px] left-0 right-0 px-5 pb-3.5 pt-2 flex items-center gap-2.5 z-40 md:hidden"
          style={{
            background:
              "linear-gradient(0deg, var(--color-arena-bg) 60%, transparent)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {/* Share/upload icon button on the left */}
          <Button
            onClick={() => setShareOpen(true)}
            variant="outline"
            className="press w-12 h-12 bg-arena-surface border border-arena-border hover:bg-arena-surface-el flex items-center justify-center shrink-0 rounded-xl"
          >
            <Share2 className="w-5 h-5 text-arena-text-sec" strokeWidth={1.8} />
          </Button>

          {/* Glowing neon green large button */}
          <Button
            onClick={
              myStatus === "confirmed"
                ? handleCancelAttendance
                : handleConfirmAttendance
            }
            disabled={actionLoading}
            className={cn(
              "flex-1 h-12 font-extrabold text-sm rounded-xl transition-all gap-2 shadow-[0_0_24px_rgba(124,255,79,0.22)]",
              myStatus === "confirmed"
                ? "bg-arena-danger/10 border border-arena-danger/25 text-arena-danger hover:bg-arena-danger/15"
                : "bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/95",
            )}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : myStatus === "confirmed" ? (
              <>
                <X className="w-4.5 h-4.5" strokeWidth={2.5} />
                {t("actions.cancel")}
              </>
            ) : (
              <>
                <Check className="w-4.5 h-4.5" strokeWidth={2.8} />
                {t("actions.confirm")}
              </>
            )}
          </Button>
        </motion.div>
      )}

      {shareOpen && (
        <ShareEventSheet
          event={{
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            location: event.location,
          }}
          onClose={() => setShareOpen(false)}
        />
      )}

      {guestsOpen && (
        <GuestsSheet
          guests={guests}
          setGuests={setGuests}
          suggestedMissing={vacancies}
          onClose={() => setGuestsOpen(false)}
        />
      )}
    </motion.div>
  );
}
