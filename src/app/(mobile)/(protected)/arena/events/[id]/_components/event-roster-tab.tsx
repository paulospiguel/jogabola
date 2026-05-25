import { Check, CheckCircle2, Sparkles } from "lucide-react";
import { JbAvatar } from "@/components/arena/avatar";
import {
  EVENT_PAYMENT_STATUS,
  type EventPaymentStatus,
} from "@/constants/event-payment-status";
import { cn } from "@/lib/utils";
import type { EventRosterPlayer } from "../_fixtures/event-detail-mock";

interface EventRosterTabProps {
  mainRoster: EventRosterPlayer[];
  reservesRoster: EventRosterPlayer[];
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

function getPaymentBadgeClass(status: EventPaymentStatus) {
  if (status === EVENT_PAYMENT_STATUS.PAID) {
    return "bg-arena-success/15 border-arena-success/20 text-arena-success";
  }

  if (status === EVENT_PAYMENT_STATUS.REVIEW) {
    return "bg-arena-warning/15 border-arena-warning/20 text-arena-warning";
  }

  return "bg-arena-text-muted/15 border-arena-border text-arena-text-sec";
}

function getPaymentLabelKey(status: EventPaymentStatus) {
  if (status === EVENT_PAYMENT_STATUS.PAID)
    return "interactive.paymentApproved";
  if (status === EVENT_PAYMENT_STATUS.REVIEW)
    return "interactive.paymentReview";
  return "interactive.paymentPending";
}

export function EventRosterTab({
  mainRoster,
  reservesRoster,
  t,
}: EventRosterTabProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted px-1.5">
          {t("lists.main", { count: mainRoster.length })}
        </div>
        <div className="bg-arena-surface border border-arena-border rounded-[16px] divide-y divide-arena-border/50 overflow-hidden">
          {mainRoster.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3.5 gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-4 shrink-0 text-center text-[10px] font-bold text-arena-text-muted">
                  {idx + 1}
                </span>
                <div className="relative shrink-0">
                  <JbAvatar
                    id={player.id}
                    name={player.name}
                    size={32}
                    className="rounded-full overflow-hidden"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-arena-text truncate">
                      {player.name}
                    </span>
                    {player.verified && (
                      <CheckCircle2
                        size={12}
                        className="text-arena-primary shrink-0"
                        strokeWidth={2.5}
                      />
                    )}
                    {player.star && (
                      <Sparkles
                        size={11}
                        className="text-arena-highlight shrink-0 fill-arena-highlight"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-arena-text-muted">
                      {player.pos}
                    </span>
                    <span
                      className={cn(
                        "text-[8px] uppercase tracking-wide font-extrabold px-1.5 py-0.25 rounded border leading-none",
                        getPaymentBadgeClass(player.status),
                      )}
                    >
                      {t(getPaymentLabelKey(player.status))}
                    </span>
                  </div>
                </div>
              </div>

              <Check
                size={16}
                className="text-arena-primary shrink-0"
                strokeWidth={2.8}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted px-1.5">
          {t("interactive.reservesMock", { count: reservesRoster.length })}
        </div>
        <div className="bg-arena-surface border border-arena-border rounded-[16px] divide-y divide-arena-border/50 overflow-hidden">
          {reservesRoster.map(player => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3.5 gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <JbAvatar
                    id={player.id}
                    name={player.name}
                    size={32}
                    className="rounded-full overflow-hidden"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-arena-text truncate">
                      {player.name}
                    </span>
                    {player.verified && (
                      <CheckCircle2
                        size={12}
                        className="text-arena-primary shrink-0"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-arena-text-muted mt-0.5 block">
                    {player.pos}
                  </span>
                </div>
              </div>

              <span
                className={cn(
                  "text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-xl border leading-none shrink-0",
                  player.status === EVENT_PAYMENT_STATUS.RESERVE
                    ? "bg-arena-warning/15 border-arena-warning/20 text-arena-warning"
                    : "bg-arena-text-muted/15 border-arena-border text-arena-text-sec",
                )}
              >
                {player.status === EVENT_PAYMENT_STATUS.RESERVE
                  ? t("interactive.reservesStatus")
                  : t("interactive.pendingStatus")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
