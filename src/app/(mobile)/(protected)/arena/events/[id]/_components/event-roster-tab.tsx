"use client";

import { Check } from "lucide-react";
import type { useTranslations } from "next-intl";
import { JbBadge } from "@/components/arena/badge";
import {
  ParticipantRow,
  participantRowPosition,
} from "@/components/arena/participant-row";
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import { useEventAttendance } from "@/hooks/use-event-attendance";

interface EventRosterTabProps {
  eventId: number;
  userId: string;
  isManager: boolean;
  priceCents: number;
  t: ReturnType<typeof useTranslations<"arenaEventDetail">>;
}

export function EventRosterTab({
  eventId,
  userId,
  isManager,
  priceCents,
  t,
}: EventRosterTabProps) {
  const { confirmed, reserves, pending, isLoading } =
    useEventAttendance(eventId);

  const waiting = [
    ...reserves.map(p => ({ ...p, status: ATTENDANCE_STATUS.RESERVE })),
    ...pending.map(p => ({ ...p, status: ATTENDANCE_STATUS.PENDING })),
  ];

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-arena-text-muted">
        {t("lists.loading")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col">
        <div className="mb-1 flex items-center justify-between px-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
            {t("lists.main", { count: confirmed.length })}
          </span>
          <span className="text-[11px] font-bold text-arena-success">
            {confirmed.length}
          </span>
        </div>
        {confirmed.length === 0 ? (
          <div className="rounded-[14px] border border-arena-border bg-arena-surface px-4 py-5 text-center text-[13px] text-arena-text-muted">
            {t("lists.emptyConfirmed")}
          </div>
        ) : (
          <div className="flex flex-col">
            {confirmed.map((p, i) => (
              <ParticipantRow
                key={p.id}
                participant={p}
                index={i}
                position={participantRowPosition(i, confirmed.length)}
                currentUserId={userId}
                isManager={isManager}
                eventId={eventId}
                showPayment={isManager || priceCents > 0}
                isFreeEvent={priceCents === 0}
                trailing={
                  <Check
                    size={15}
                    className="shrink-0 text-arena-success"
                    strokeWidth={2.5}
                  />
                }
              />
            ))}
          </div>
        )}
      </div>

      {waiting.length > 0 && (
        <div className="flex flex-col">
          <div className="mb-1 flex items-center justify-between px-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
              {t("interactive.reservesMock", { count: waiting.length })}
            </span>
            <span className="text-[11px] font-bold text-arena-text-muted">
              {waiting.length}
            </span>
          </div>
          <div className="flex flex-col">
            {waiting.map((p, i) => (
              <ParticipantRow
                key={p.id}
                participant={p}
                position={participantRowPosition(i, waiting.length)}
                currentUserId={userId}
                isManager={isManager}
                eventId={eventId}
                showPayment={isManager || priceCents > 0}
                isFreeEvent={priceCents === 0}
                dimmed
                trailing={<JbBadge status={p.status} />}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
