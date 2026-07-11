"use client";

import { Check, Clock, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import { cn } from "@/lib/utils";

function shortDate(raw: string | Date) {
  return new Date(raw).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
  });
}

interface AthleteHistoryRowProps {
  item: { id: number; title: string; startsAt: string | Date; status: string };
  index: number;
}

export function AthleteHistoryRow({ item, index }: AthleteHistoryRowProps) {
  const t = useTranslations("arenaAthleteProfile");

  const statusMap: Record<
    string,
    { label: string; icon: React.ReactNode; cls: string }
  > = {
    [ATTENDANCE_STATUS.CONFIRMED]: {
      label: t("attendanceStatus.confirmed"),
      icon: <Check size={10} strokeWidth={2.5} />,
      cls: "border-arena-success/25 bg-arena-success/10 text-arena-success",
    },
    [ATTENDANCE_STATUS.REJECTED]: {
      label: t("attendanceStatus.refused"),
      icon: <X size={10} strokeWidth={2.5} />,
      cls: "border-arena-danger/25 bg-arena-danger/10 text-arena-danger",
    },
    [ATTENDANCE_STATUS.RESERVE]: {
      label: t("attendanceStatus.reserve"),
      icon: <Clock size={10} strokeWidth={2.5} />,
      cls: "border-arena-warning/25 bg-arena-warning/10 text-arena-warning",
    },
  };

  const badge = statusMap[item.status] ?? {
    label: item.status,
    icon: null,
    cls: "border-arena-border bg-arena-surface-el text-arena-text-muted",
  };

  return (
    <div
      className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-4 py-3.5 transition-colors hover:border-arena-border/60 hover:bg-arena-surface-el"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-arena-text">
          {item.title}
        </span>
        <span className="mt-0.5 block text-[11px] font-medium text-arena-text-muted">
          {shortDate(item.startsAt)}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-[8px] border px-2 py-1 text-[10px] font-bold",
          badge.cls,
        )}
      >
        {badge.icon}
        {badge.label}
      </span>
    </div>
  );
}
