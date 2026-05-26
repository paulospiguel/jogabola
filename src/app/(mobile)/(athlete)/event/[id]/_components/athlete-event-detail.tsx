"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocationMap } from "@/components/arena/location-map";
import { useEventAttendance } from "@/hooks/use-event-attendance";
import { cn } from "@/lib/utils";
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

interface AthleteEventDetailProps {
  event: Event;
  userId: string;
  userName: string;
  initialMyStatus: string | null;
}

type Tab = "list" | "location" | "payment";

export function AthleteEventDetail({
  event,
  userId,
  userName,
  initialMyStatus,
}: AthleteEventDetailProps) {
  const t = useTranslations("athleteEventPublic");
  const [activeTab, setActiveTab] = useState<Tab>("list");

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
    event.status === "cancelled" || event.status === "canceled";
  const total = Number(event.maxParticipants) || 14;
  const isFull = confirmed.length >= total;
  const myPaymentStatus =
    confirmed.find(p => p.id === userId)?.paymentStatus ?? null;
  const canResumePayment =
    myStatus === "confirmed" &&
    !isCancelled &&
    !isLoading &&
    event.priceCents > 0 &&
    (!myPaymentStatus ||
      myPaymentStatus === "pending" ||
      myPaymentStatus === "rejected" ||
      myPaymentStatus === "refunded");

  const TABS: { id: Tab; label: string }[] = [
    { id: "list", label: t("tabs.squad") },
    { id: "location", label: t("tabs.location") },
  ];

  if (userId && event.priceCents > 0) {
    TABS.push({ id: "payment", label: t("tabs.payment") });
  }

  return (
    <div className="flex min-h-screen flex-col bg-arena-bg">
      <AthleteEventHero
        event={event}
        confirmedCount={confirmed.length}
        myStatus={myStatus}
        userName={userName}
        isLoading={isLoading}
        t={t}
      />

      <div className="flex shrink-0 border-b border-arena-border bg-arena-bg">
        {TABS.map(tabItem => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setActiveTab(tabItem.id)}
            className={cn(
              "flex flex-1 items-center justify-center border-b-2 py-3 text-[13px] font-semibold transition-colors",
              activeTab === tabItem.id
                ? "border-arena-primary text-arena-primary"
                : "border-transparent text-arena-text-muted hover:text-arena-text-sec",
            )}
            style={{ marginBottom: -1 }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto pb-5">
        {activeTab === "list" && (
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
        )}

        {activeTab === "location" && (
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
        )}

        {activeTab === "payment" && userId && event.priceCents > 0 && (
          <MyPaymentTab eventId={event.id} />
        )}
      </div>

      <AthleteEventRsvpBar
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

      {showRsvpSheet && (
        <AthleteRsvpSheet
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
