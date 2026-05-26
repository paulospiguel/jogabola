"use client";

import { CheckIcon } from "@animateicons/react/lucide";
import { useTranslations } from "next-intl";
import { JbBadge } from "@/components/arena/badge";
import { EventNoticeWall } from "@/components/arena/event-notice-wall";
import {
  ParticipantRow,
  participantRowPosition,
} from "@/components/arena/participant-row";
import type { Participant } from "@/hooks/use-event-attendance";

interface AthleteEventListTabProps {
  eventId: number;
  userId: string;
  confirmed: Participant[];
  reserves: Participant[];
  pending: Participant[];
  priceCents: number;
  isLoading: boolean;
  t: ReturnType<typeof useTranslations<"athleteEventPublic">>;
}

export function AthleteEventListTab({
  eventId,
  userId,
  confirmed,
  reserves,
  pending,
  priceCents,
  isLoading,
  t,
}: AthleteEventListTabProps) {
  return (
    <div className="px-4 py-4">
      <EventNoticeWall eventId={eventId} isManager={false} />
      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-arena-text-muted text-sm">
          {t("loading")}
        </div>
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
              {t("confirmed")}
            </span>
            <span className="text-[11px] font-bold text-arena-success">
              {confirmed.length}
            </span>
          </div>
          <div className="mb-4 flex flex-col">
            {confirmed.length === 0 ? (
              <div className="rounded-[14px] border border-arena-border bg-arena-surface px-4 py-5 text-center text-[13px] text-arena-text-muted">
                {t("noOneConfirmed")}
              </div>
            ) : (
              confirmed.map((p, i) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  index={i}
                  position={participantRowPosition(i, confirmed.length)}
                  currentUserId={userId}
                  showPayment={priceCents > 0}
                  trailing={
                    <span className="text-arena-success">
                      <CheckIcon size={15} color="currentColor" />
                    </span>
                  }
                />
              ))
            )}
          </div>

          {(reserves.length > 0 || pending.length > 0) && (
            <>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
                  {t("waitingList")}
                </span>
                <span className="text-[11px] font-bold text-arena-text-muted">
                  {reserves.length + pending.length}
                </span>
              </div>
              <div className="flex flex-col">
                {[
                  ...reserves.map(p => ({ ...p, status: "reserve" as const })),
                  ...pending.map(p => ({ ...p, status: "pending" as const })),
                ].map((p, i, arr) => (
                  <ParticipantRow
                    key={p.id}
                    participant={p}
                    position={participantRowPosition(i, arr.length)}
                    currentUserId={userId}
                    showPayment={priceCents > 0}
                    dimmed
                    trailing={<JbBadge status={p.status} />}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
