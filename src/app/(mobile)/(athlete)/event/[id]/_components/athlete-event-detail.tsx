"use client";

import { MessageSquare } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { EventChatTab } from "@/components/arena/event-chat-tab";
import { LocationMap } from "@/components/arena/location-map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import { EVENT_STATUS } from "@/constants/event-status";
import { PAYMENT_STATUS } from "@/constants/payments";
import { useEventAttendance } from "@/hooks/use-event-attendance";
import { useEventDetailChat } from "@/hooks/use-event-chat";
import { useAthleteEventDetail } from "../_hooks/use-athlete-event-detail";
import { AthleteEventHero } from "./athlete-event-header";
import { AthleteEventListTab } from "./athlete-event-list-tab";
import { AthleteEventRsvpBar } from "./athlete-event-rsvp-bar";
import { AthleteRsvpSheet } from "./athlete-rsvp-sheet";
import { MyPaymentTab } from "./my-payment-tab";

interface Event {
  id: number;
  teamId: number;
  title: string;
  type: string;
  location: string;
  startDate: Date;
  status: string;
  recurrence: string;
  maxParticipants?: string | null;
  priceCents: number;
  currency: string;
  rosterOnly?: boolean;
  description?: string | null;
  images?: string[];
}

import type { getEvent } from "@/actions/match-sessions.actions";

type EventData = NonNullable<
  Extract<Awaited<ReturnType<typeof getEvent>>, { success: true }>["data"]
>;

interface AthleteEventDetailProps {
  event: EventData;
  userId: string;
  userName: string;
  initialMyStatus: string | null;
}

export function AthleteEventDetail({
  event,
  userId,
  userName,
  initialMyStatus,
}: AthleteEventDetailProps) {
  const t = useTranslations("athleteEventPublic");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<string>("list");

  const { confirmed, reserves, pending, isLoading, refetch } =
    useEventAttendance(event.id);

  const {
    myStatus,
    guestReservationId,
    showRsvpSheet,
    setShowRsvpSheet,
    resumePayment,
    setResumePayment,
    actionLoading,
    actionError,
    handleAttendanceSuccess,
    handleConfirm,
    handleCancel,
  } = useAthleteEventDetail({
    eventId: event.id,
    userId,
    userName,
    initialMyStatus,
    priceCents: event.priceCents,
    rosterOnly: event.rosterOnly,
    t: (key: string) => t(key as Parameters<typeof t>[0]),
    refetch,
  });

  const isCancelled =
    event.status === EVENT_STATUS.CANCELLED ||
    String(event.status) === "canceled";
  const total = Number(event.maxParticipants) || 14;
  const isFull = confirmed.length >= total;
  const myPaymentStatus =
    confirmed.find(p => p.id === userId)?.paymentStatus ?? null;
  const canResumePayment =
    myStatus === ATTENDANCE_STATUS.CONFIRMED &&
    !isCancelled &&
    !isLoading &&
    event.priceCents > 0 &&
    (!myPaymentStatus ||
      myPaymentStatus === PAYMENT_STATUS.PENDING ||
      myPaymentStatus === PAYMENT_STATUS.REJECTED ||
      myPaymentStatus === PAYMENT_STATUS.REFUNDED);

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
    canChat: myStatus === ATTENDANCE_STATUS.CONFIRMED,
    isCaptain: false,
    initialMessages: [],
    active: activeTab === "chat",
    locale,
  });

  return (
    <div className="flex min-h-screen flex-col bg-arena-bg">
      <AthleteEventHero
        event={event}
        confirmedCount={confirmed.length}
        myStatus={myStatus}
        myPaymentStatus={myPaymentStatus}
        userName={userName}
        isLoading={isLoading}
        onCancel={handleCancel}
        t={t}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col gap-0 overflow-hidden"
      >
        <TabsList
          variant="line"
          className="h-auto w-full shrink-0 justify-start rounded-none border-b border-arena-border bg-arena-bg px-0"
        >
          <TabsTrigger
            value="list"
            className="flex-1 rounded-none border-b-2 border-transparent py-3 text-[13px] font-semibold text-arena-text-muted transition-colors after:hidden data-[state=active]:border-arena-primary data-[state=active]:bg-transparent data-[state=active]:text-arena-primary dark:data-[state=active]:border-arena-primary dark:data-[state=active]:bg-transparent"
          >
            {t("tabs.squad")}
          </TabsTrigger>
          <TabsTrigger
            value="location"
            className="flex-1 rounded-none border-b-2 border-transparent py-3 text-[13px] font-semibold text-arena-text-muted transition-colors after:hidden data-[state=active]:border-arena-primary data-[state=active]:bg-transparent data-[state=active]:text-arena-primary dark:data-[state=active]:border-arena-primary dark:data-[state=active]:bg-transparent"
          >
            {t("tabs.location")}
          </TabsTrigger>
          {userId && event.priceCents > 0 && (
            <TabsTrigger
              value="payment"
              className="flex-1 rounded-none border-b-2 border-transparent py-3 text-[13px] font-semibold text-arena-text-muted transition-colors after:hidden data-[state=active]:border-arena-primary data-[state=active]:bg-transparent data-[state=active]:text-arena-primary dark:data-[state=active]:border-arena-primary dark:data-[state=active]:bg-transparent"
            >
              {t("tabs.payment")}
            </TabsTrigger>
          )}
          {myStatus === ATTENDANCE_STATUS.CONFIRMED && (
            <TabsTrigger
              value="chat"
              className="flex-1 rounded-none border-b-2 border-transparent py-3 text-[13px] font-semibold text-arena-text-muted transition-colors after:hidden data-[state=active]:border-arena-primary data-[state=active]:bg-transparent data-[state=active]:text-arena-primary dark:data-[state=active]:border-arena-primary dark:data-[state=active]:bg-transparent"
            >
              {t("tabs.chat") ?? "Chat"}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="flex-1 overflow-auto pb-5">
          <AthleteEventListTab
            eventId={event.id}
            userId={userId}
            confirmed={confirmed}
            reserves={reserves}
            pending={pending}
            priceCents={event.priceCents}
            isLoading={isLoading}
            t={t}
          />
        </TabsContent>

        <TabsContent value="location" className="flex-1 overflow-auto pb-5">
          <div className="px-4 py-4">
            <LocationMap location={event.location} />
            {event.description && (
              <div className="mt-4 rounded-[14px] border border-arena-border bg-arena-surface p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                  {t("notes")}
                </p>
                <p className="text-[13px] text-arena-text-sec">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {userId && event.priceCents > 0 && (
          <TabsContent value="payment" className="flex-1 overflow-auto pb-5">
            <MyPaymentTab eventId={event.id} />
          </TabsContent>
        )}

        {myStatus === ATTENDANCE_STATUS.CONFIRMED && (
          <TabsContent
            value="chat"
            className="flex flex-col flex-1 min-h-0 overflow-hidden pb-1"
          >
            <EventChatTab
              chatMessages={chatMessages}
              chatEndRef={chatEndRef}
              inputMessage={inputMessage}
              onInputChange={setInputMessage}
              onSend={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              onCensorMessage={handleCensorMessage}
              canChat={true}
              isCaptain={false}
              sending={sending}
              t={t as any}
            />
          </TabsContent>
        )}
      </Tabs>

      {!(myStatus === ATTENDANCE_STATUS.CONFIRMED && !canResumePayment) && (
        <AthleteEventRsvpBar
          eventSlug={event.slug}
          eventId={event.id}
          userId={userId}
          myStatus={myStatus}
          isCancelled={isCancelled}
          isFull={isFull}
          canResumePayment={canResumePayment}
          actionLoading={actionLoading}
          actionError={actionError}
          onConfirm={() => handleConfirm(isCancelled, isFull)}
          onCancel={handleCancel}
          onResumePayment={() => {
            setResumePayment(true);
            setShowRsvpSheet(true);
          }}
          t={t}
        />
      )}

      {showRsvpSheet && (
        <AthleteRsvpSheet
          eventSlug={event.slug}
          eventId={event.id}
          userId={userId}
          resumePayment={resumePayment}
          guestReservationId={guestReservationId}
          onClose={() => {
            setShowRsvpSheet(false);
            setResumePayment(false);
          }}
          onSuccess={handleAttendanceSuccess}
        />
      )}
    </div>
  );
}
