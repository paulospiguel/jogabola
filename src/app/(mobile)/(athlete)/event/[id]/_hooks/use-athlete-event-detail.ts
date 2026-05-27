"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  cancelUserAttendance,
  confirmUserAttendance,
} from "@/actions/attendance.actions";
import type { Participant } from "@/hooks/use-event-attendance";
import { ATTENDANCE_STATUS } from "@/constants/attendance";

interface UseAthleteEventDetailOptions {
  eventId: number;
  userId: string;
  userName: string;
  initialMyStatus: string | null;
  priceCents: number;
  rosterOnly?: boolean;
  t: (key: string) => string;
  refetch: () => void;
}

type AttendanceLists = {
  confirmed: Participant[];
  reserves: Participant[];
  pending: Participant[];
};

export function useAthleteEventDetail({
  eventId,
  userId,
  userName,
  initialMyStatus,
  priceCents,
  rosterOnly,
  t,
  refetch,
}: UseAthleteEventDetailOptions) {
  const queryClient = useQueryClient();
  const [myStatus, setMyStatus] = useState<string | null>(initialMyStatus);
  const [guestReservationId, setGuestReservationId] = useState<number | null>(
    null,
  );
  const [showRsvpSheet, setShowRsvpSheet] = useState(false);
  const [resumePayment, setResumePayment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  function updateAttendanceCache(
    updater: (current: AttendanceLists) => AttendanceLists,
  ) {
    queryClient.setQueryData<AttendanceLists>(
      ["event", eventId, "attendance"],
      current => {
        const base =
          current ??
          ({
            confirmed: [],
            reserves: [],
            pending: [],
          } satisfies AttendanceLists);
        return updater(base);
      },
    );
  }

  function handleAttendanceSuccess(status: string, reservationId?: number) {
    if (reservationId && !userId) {
      setGuestReservationId(reservationId);
    }
    setMyStatus(status);
    setShowRsvpSheet(false);
    updateAttendanceCache(current => {
      const participant = { id: userId, name: userName, role: "Jogador" };
      const filteredConfirmed = current.confirmed.filter(p => p.id !== userId);
      const filteredReserves = current.reserves.filter(p => p.id !== userId);
      const filteredPending = current.pending.filter(p => p.id !== userId);
      return {
        confirmed: [participant, ...filteredConfirmed],
        reserves: filteredReserves,
        pending: filteredPending,
      };
    });
    void refetch();
  }

  async function handleConfirm(isCancelled: boolean, isFull: boolean) {
    if (isCancelled) return;
    setActionError("");

    if (!userId || (priceCents && priceCents > 0)) {
      setResumePayment(false);
      setShowRsvpSheet(true);
      return;
    }

    setActionLoading(true);
    const res = await confirmUserAttendance(eventId);
    if (res.success) {
      handleAttendanceSuccess(ATTENDANCE_STATUS.CONFIRMED);
    } else if (res.error === "EVENT_ROSTER_ONLY") {
      setActionError(t("rosterOnlyError"));
    } else {
      setActionError(t("errors.confirmAttendance"));
    }
    setActionLoading(false);
  }

  async function handleCancel() {
    setActionLoading(true);
    const res = await cancelUserAttendance(eventId);
    if (res.success) {
      setMyStatus(null);
      updateAttendanceCache(current => ({
        confirmed: current.confirmed.filter(p => p.id !== userId),
        reserves: current.reserves.filter(p => p.id !== userId),
        pending: current.pending.filter(p => p.id !== userId),
      }));
      void refetch();
    }
    setActionLoading(false);
  }

  return {
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
  };
}
