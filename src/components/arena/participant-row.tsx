"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeCheck,
  Check,
  MoreVertical,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import {
  managerBlockParticipant,
  managerRemoveParticipant,
  managerUpdateParticipantStatus,
} from "@/actions/attendance.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Participant } from "@/hooks/use-event-attendance";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/payments";
import { JbAvatar } from "./avatar";
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
  isManager?: boolean;
  eventId?: number;
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
  isManager = false,
  eventId,
}: ParticipantRowProps) {
  const t = useTranslations("arenaEventDetail");
  const tSquad = useTranslations("arenaSquad");
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const paymentStatus = isPaymentStatus(participant.paymentStatus)
    ? participant.paymentStatus
    : (showPayment ? ("pending" as const) : null);
  const shouldShowPayment = showPayment && paymentStatus;
  const profileHref = String(participant.id).startsWith("guest-")
    ? null
    : `/arena/squads/player/${participant.id}`;

  async function handleStatusChange(newStatus: "confirmed" | "reserve") {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await managerUpdateParticipantStatus(
        eventId,
        String(participant.id),
        newStatus,
      );
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["event", eventId, "attendance"],
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await managerRemoveParticipant(
        eventId,
        String(participant.id),
      );
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["event", eventId, "attendance"],
        });
        setIsRemoveDialogOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock() {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await managerBlockParticipant(
        eventId,
        String(participant.id),
      );
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: ["event", eventId, "attendance"],
        });
        setIsBlockDialogOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }

  const managerActions = isManager ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={loading}>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-arena-text-muted transition-colors hover:bg-arena-surface-el focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-arena-primary/50 active:scale-95">
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 rounded-[12px] border-arena-border bg-arena-surface shadow-xl shadow-black/40"
      >
        {participant.status === "reserve" ? (
          <DropdownMenuItem
            onClick={() => handleStatusChange("confirmed")}
            className="gap-2.5 px-3 py-2.5 text-[13px] font-medium text-arena-text focus:bg-arena-surface-el focus:text-arena-primary"
          >
            <ArrowUpCircle className="h-4 w-4 text-arena-success" />
            <span>{t("management.moveToConfirmed")}</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleStatusChange("reserve")}
            className="gap-2.5 px-3 py-2.5 text-[13px] font-medium text-arena-text focus:bg-arena-surface-el focus:text-arena-info"
          >
            <ArrowDownCircle className="h-4 w-4 text-arena-info" />
            <span>{t("management.moveToReserve")}</span>
          </DropdownMenuItem>
        )}

        <div className="mx-1 my-1 h-px bg-arena-border" />

        <DropdownMenuItem
          onClick={() => setIsRemoveDialogOpen(true)}
          className="gap-2.5 px-3 py-2.5 text-[13px] font-medium text-arena-text focus:bg-arena-surface-el focus:text-arena-warning"
        >
          <Trash2 className="h-4 w-4 text-arena-warning" />
          <span>{t("management.revokePresence")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setIsBlockDialogOpen(true)}
          className="gap-2.5 px-3 py-2.5 text-[13px] font-medium text-arena-danger focus:bg-arena-danger/10 focus:text-arena-danger"
        >
          <ShieldAlert className="h-4 w-4" />
          <span>{t("management.blockParticipant")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 border border-arena-border bg-arena-surface px-3.5 py-3 transition-opacity",
          POSITION_CLASS[position],
          (dimmed || loading) && "opacity-70",
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
            {participant.role
              ? (tSquad.has(`roles.${participant.role.toLowerCase()}`)
                ? tSquad(`roles.${participant.role.toLowerCase()}`)
                : participant.role)
              : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
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
          {managerActions}
        </div>
      </div>

      {/* Revoke Presence Dialog */}
      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
          <AlertDialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-arena-warning/25 bg-arena-warning/10 text-arena-warning">
              <Trash2 size={24} strokeWidth={2} />
            </div>
            <AlertDialogTitle className="text-arena-text">
              {t("management.revokeTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-arena-text-sec">
              {t("management.revokeDescription", { name: participant.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface hover:text-arena-text"
              disabled={loading}
            >
              {t("management.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-arena-warning text-arena-bg hover:bg-arena-warning/90"
              disabled={loading}
              onClick={handleRemove}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {loading ? "..." : t("management.revokeConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Participant Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
          <AlertDialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-arena-danger/25 bg-arena-danger/10 text-arena-danger">
              <ShieldAlert size={24} strokeWidth={2} />
            </div>
            <AlertDialogTitle className="text-arena-text">
              {t("management.blockTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-arena-text-sec">
              {t("management.blockDescription", { name: participant.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface hover:text-arena-text"
              disabled={loading}
            >
              {t("management.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-arena-danger text-white hover:bg-arena-danger/90"
              disabled={loading}
              onClick={handleBlock}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              {loading ? "..." : t("management.blockConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
