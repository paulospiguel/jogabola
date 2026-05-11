"use client";

import { BadgeCheck, Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Participant } from "@/hooks/use-event-attendance";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/payments";
import { JbAvatar } from "./jb-avatar";
import { PaymentStatusBadge } from "./payment-status-badge";

type RowPosition = "first" | "middle" | "last" | "only";

interface ParticipantRowProps {
  participant: Participant;
  index?: number;
  position: RowPosition;
  trailing?: ReactNode;
  showPayment?: boolean;
  dimmed?: boolean;
  currentUserId?: string;
}

const POSITION_CLASS: Record<RowPosition, string> = {
  first: "rounded-t-[14px] rounded-b-[4px]",
  middle: "rounded-[4px] border-t-0",
  last: "rounded-t-[4px] rounded-b-[14px] border-t-0",
  only: "rounded-[14px]",
};

function isPaymentStatus(
  status: Participant["paymentStatus"],
): status is PaymentStatus {
  return (
    status === "pending" ||
    status === "paid_unverified" ||
    status === "review_required" ||
    status === "approved" ||
    status === "rejected" ||
    status === "refunded"
  );
}

export function participantRowPosition(
  index: number,
  total: number,
): RowPosition {
  if (total <= 1) {
    return "only";
  }
  if (index === 0) {
    return "first";
  }
  if (index === total - 1) {
    return "last";
  }
  return "middle";
}

export function ParticipantRow({
  participant,
  index,
  position,
  trailing,
  showPayment = false,
  dimmed = false,
  currentUserId,
}: ParticipantRowProps) {
  const paymentStatus = isPaymentStatus(participant.paymentStatus)
    ? participant.paymentStatus
    : null;
  const shouldShowPayment = showPayment && paymentStatus;
  const profileHref = String(participant.id).startsWith("guest-")
    ? null
    : `/arena/squads/player/${participant.id}`;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border border-arena-border bg-arena-surface px-3.5 py-3",
        POSITION_CLASS[position],
        dimmed && "opacity-70",
      )}
    >
      {index !== undefined && (
        <span className="w-5 shrink-0 text-center text-[11px] font-bold text-arena-text-muted">
          {index + 1}
        </span>
      )}
      <JbAvatar
        name={participant.name}
        size={32}
        id={participant.id}
        image={participant.image}
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          {profileHref ? (
            <Link
              href={profileHref}
              className="truncate text-[13px] font-semibold text-arena-text transition-colors hover:text-arena-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-primary/60"
            >
              {participant.name}
            </Link>
          ) : (
            <div className="truncate text-[13px] font-semibold text-arena-text">
              {participant.name}
            </div>
          )}
          {participant.verified && (
            <BadgeCheck
              size={13}
              className="shrink-0 text-arena-info"
              strokeWidth={2.4}
              aria-label="Verificado"
            />
          )}
        </div>
        <div className="truncate text-[10px] text-arena-text-muted">
          {participant.role}
        </div>
      </div>
      {shouldShowPayment ? (
        <PaymentStatusBadge
          status={paymentStatus}
          method={participant.paymentMethod ?? undefined}
          canViewRejected={participant.id === currentUserId}
        />
      ) : (
        (trailing ?? (
          <Check
            size={15}
            className="shrink-0 text-arena-success"
            strokeWidth={2.5}
          />
        ))
      )}
    </div>
  );
}
