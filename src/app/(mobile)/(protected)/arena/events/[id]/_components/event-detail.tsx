"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Compass,
  List,
  MapPin,
  MessageSquare,
  Settings2,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { ShareEventSheet } from "@/components/arena/share-event-sheet";
import { cn, formatTime } from "@/lib/utils";
import type { EventStatus } from "@/types/events";
import { useEventDetailChat } from "../_hooks/use-event-detail-chat";
import { EventActionBar } from "./event-action-bar";
import { EventChatTab } from "./event-chat-tab";
import { EventLocationTab } from "./event-location-tab";
import { EventRosterTab } from "./event-roster-tab";
import { EventTeamsTab } from "./event-teams-tab";
import { MAIN_ROSTER, RESERVES_ROSTER } from "../_fixtures/event-detail-mock";

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

  const {
    chatEndRef,
    chatMessages,
    handleSendMessage,
    inputMessage,
    setInputMessage,
  } = useEventDetailChat({ active: activeTab === "chat", locale });

  const totalSpots = 14;
  const filledSpots = 10;

  const handleConfirmAttendance = async () => {
    setActionLoading(true);
    setTimeout(() => {
      setMyStatus("confirmed");
      setActionLoading(false);
    }, 600);
  };

  const handleCancelAttendance = async () => {
    setActionLoading(true);
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
      {/* Header */}
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

        {/* Spots progress bar */}
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

      {/* Tab selector */}
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

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        {activeTab === "roster" && (
          <EventRosterTab
            mainRoster={MAIN_ROSTER}
            reservesRoster={RESERVES_ROSTER}
            t={t}
          />
        )}

        {activeTab === "teams" && (
          <EventTeamsTab
            filledSpots={filledSpots}
            totalSpots={totalSpots}
            t={t}
          />
        )}

        {activeTab === "location" && (
          <EventLocationTab
            location={event.location}
            onShare={() => setShareOpen(true)}
            t={t}
          />
        )}

        {activeTab === "chat" && (
          <EventChatTab
            chatMessages={chatMessages}
            chatEndRef={chatEndRef}
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSend={handleSendMessage}
            t={t}
          />
        )}
      </div>

      {activeTab !== "chat" && (
        <EventActionBar
          myStatus={myStatus}
          actionLoading={actionLoading}
          onConfirm={handleConfirmAttendance}
          onCancel={handleCancelAttendance}
          onShare={() => setShareOpen(true)}
          t={t}
        />
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
    </motion.div>
  );
}
