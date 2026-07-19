"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Compass,
  List,
  type LucideIcon,
  MapPin,
  MessageSquare,
  Settings2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  cancelUserAttendance,
  confirmUserAttendance,
  type EventRosterEntry,
} from "@/actions/attendance.actions";
import type { ChatMessage } from "@/actions/event-chat.actions";
import { EditEventSheet } from "@/components/arena/edit-event-sheet";
import { EventChatTab } from "@/components/arena/event-chat-tab";
import { ShareEventSheet } from "@/components/arena/share-event-sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import { useEventDetailChat } from "@/hooks/use-event-chat";
import { cn, formatTime } from "@/lib/utils";
import type { EventStatus } from "@/types/events";
import { EventActionBar } from "./event-action-bar";
import { EventLocationTab } from "./event-location-tab";
import { EventRosterTab } from "./event-roster-tab";
import { EventSpotsProgress } from "./event-spots-progress";
import { EventTeamsTab } from "./event-teams-tab";

interface EventDetailProps {
  event: {
    id: number;
    title: string;
    type: string;
    location: string;
    startDate: Date | string;
    status: EventStatus;
    recurrence: string;
    recurrenceGroupId: string | null;
    teamId: number;
    maxParticipants?: string | null;
    priceCents?: number;
    paymentRequired?: boolean;
    paymentDeadlineHours?: number | null;
    rosterOnly?: boolean;
    description?: string | null;
    transferRequiresProof?: boolean;
  };
  userId: string;
  canEdit?: boolean;
  mainRoster: EventRosterEntry[];
  canChat: boolean;
  initialChatMessages: ChatMessage[];
  initialMyStatus?: string | null;
}

type Tab = "roster" | "teams" | "location" | "chat";

export function EventDetail({
  event,
  userId,
  canEdit = false,
  mainRoster,
  canChat,
  initialChatMessages,
  initialMyStatus,
}: EventDetailProps) {
  const t = useTranslations("arenaEventDetail");
  const locale = useLocale();
  const router = useRouter();

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
    handleDeleteMessage,
    handleCensorMessage,
    inputMessage,
    setInputMessage,
    sending,
  } = useEventDetailChat({
    eventId: event.id,
    currentUserId: userId,
    canChat,
    isCaptain: canEdit,
    initialMessages: initialChatMessages,
    active: activeTab === "chat",
    locale,
  });

  const parsedCapacity = event.maxParticipants
    ? Number.parseInt(event.maxParticipants, 10)
    : Number.NaN;
  const filledSpots = mainRoster.length;
  const totalSpots = Number.isFinite(parsedCapacity)
    ? parsedCapacity
    : filledSpots;

  const handleConfirmAttendance = async () => {
    setActionLoading(true);
    try {
      const result = await confirmUserAttendance(event.id);
      if (result.success) {
        setMyStatus(ATTENDANCE_STATUS.CONFIRMED);
        router.refresh();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAttendance = async () => {
    setActionLoading(true);
    try {
      const result = await cancelUserAttendance(event.id);
      if (result.success) {
        setMyStatus(null);
        router.refresh();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "roster", label: t("tabs.roster"), icon: List },
    { id: "teams", label: t("tabs.teams"), icon: Users },
    { id: "location", label: t("tabs.location"), icon: MapPin },
    // { id: "chat", label: t("tabs.chat"), icon: MessageSquare },
  ];

  const TAB_NAME = {
    roster: t("tabs.roster"),
    teams: t("tabs.teams"),
    location: t("tabs.location"),
    chat: t("tabs.chat"),
  } as const;

  return (
    <motion.div
      className={cn(
        "flex flex-col relative",
        activeTab === "chat" ? "h-screen" : "min-h-screen pb-20",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-arena-border relative">
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

          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab("chat")}
              className="w-9 h-9 bg-arena-surface border border-arena-border hover:bg-arena-surface-el text-arena-text-sec hover:text-arena-text rounded-xl flex items-center justify-center transition-all"
            >
              <MessageSquare size={16} />
            </Button>

            {canEdit && (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-9 h-9 bg-arena-surface border border-arena-border hover:bg-arena-surface-el text-arena-text-sec hover:text-arena-text rounded-xl flex items-center justify-center transition-all"
              >
                <Settings2 size={16} />
              </Button>
            )}
          </div>
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
        <div className="bg-arena-surface border border-arena-border rounded-[14px] p-3.5 mt-4 relative">
          <EventSpotsProgress
            filledSpots={filledSpots}
            totalSpots={totalSpots}
            label={t("spots")}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={val => setActiveTab(val as Tab)}
        className="flex flex-col flex-1 min-h-0"
      >
        {/* Tab selector */}
        <TabsList
          variant="line"
          className="flex w-full border-b border-arena-border bg-arena-surface/40 h-auto px-5 py-0 rounded-none shrink-0"
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group flex-1 py-3 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 data-[state=active]:!text-arena-primary text-arena-text-muted hover:text-arena-text-sec data-[state=active]:bg-transparent border-none dark:data-[state=active]:bg-transparent after:bg-arena-primary after:bottom-0 after:h-[2.5px] rounded-none after:shadow-[0_-2px_10px_rgba(124,255,79,0.4)]"
              >
                <Icon
                  size={14}
                  className="transition-colors text-arena-text-muted group-data-[state=active]:!text-arena-primary"
                />
                {TAB_NAME[tab.id]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab content */}
        <TabsContent
          value="roster"
          className="flex-1 overflow-y-auto px-5 py-4 pb-24 outline-none focus-visible:ring-0 focus-visible:outline-none"
        >
          <EventRosterTab
            eventId={event.id}
            userId={userId}
            isManager={canEdit}
            priceCents={event.priceCents ?? 0}
            t={t}
          />
        </TabsContent>

        <TabsContent
          value="teams"
          className="flex-1 overflow-y-auto px-5 py-4 pb-24 outline-none focus-visible:ring-0 focus-visible:outline-none"
        >
          <EventTeamsTab
            eventId={event.id}
            roster={mainRoster}
            filledSpots={filledSpots}
            totalSpots={totalSpots}
            t={t}
          />
        </TabsContent>

        <TabsContent
          value="location"
          className="flex-1 overflow-y-auto px-5 py-4 pb-24 outline-none focus-visible:ring-0 focus-visible:outline-none"
        >
          <EventLocationTab
            location={event.location}
            eventId={event.id}
            canEdit={canEdit}
            t={t}
          />
        </TabsContent>

        <TabsContent
          value="chat"
          className="flex flex-col flex-1 min-h-0 overflow-hidden outline-none focus-visible:ring-0 focus-visible:outline-none"
        >
          <EventChatTab
            chatMessages={chatMessages}
            chatEndRef={chatEndRef}
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSend={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onCensorMessage={handleCensorMessage}
            onRequestValidate={() => setActiveTab("roster")}
            canChat={canChat}
            isCaptain={canEdit}
            sending={sending}
            t={t}
          />
        </TabsContent>
      </Tabs>

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

      {_isEditing && (
        <EditEventSheet event={event} onClose={() => setIsEditing(false)} />
      )}
    </motion.div>
  );
}
