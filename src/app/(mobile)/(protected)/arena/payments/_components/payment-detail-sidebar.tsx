import { History, User } from "lucide-react";
import Link from "next/link";
import { JbAvatar } from "@/components/arena/avatar";
import { type BadgeStatus, JbBadge } from "@/components/arena/badge";
import { ScoreBar, type ScoreLevel } from "@/components/arena/score-bar";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_OVERVIEW_STATUS,
  PAYMENT_OVERVIEW_STATUSES,
  type PaymentOverviewStatus,
} from "@/constants/payments";
import type { Payment } from "@/hooks/use-payments";
import { cn } from "@/lib/utils";

type TranslationFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

interface PaymentDetailSidebarProps {
  badgeT: TranslationFn;
  payment: Payment;
  t: TranslationFn;
}

const STATUS_DOT_CLASS: Record<PaymentOverviewStatus, string> = {
  [PAYMENT_OVERVIEW_STATUS.PENDING]: "bg-arena-text-muted",
  [PAYMENT_OVERVIEW_STATUS.VALIDATING]: "bg-arena-warning",
  [PAYMENT_OVERVIEW_STATUS.CONFIRMED]: "bg-arena-success",
  [PAYMENT_OVERVIEW_STATUS.REFUSED]: "bg-arena-danger",
};

export function PaymentDetailSidebar({
  badgeT,
  payment,
  t,
}: PaymentDetailSidebarProps) {
  return (
    <aside className="space-y-6">
      <section className="jb-card p-6">
        <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-arena-text-muted">
          {t("detail.athlete")}
        </h2>
        <div className="flex flex-col items-center text-center">
          <JbAvatar
            id={payment.player.id}
            name={payment.player.name}
            image={payment.player.image}
            size={80}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <h3 className="font-sora text-lg font-bold text-arena-text">
              {payment.player.name}
            </h3>
            <VerifiedBadge verified={payment.player.isVerified} />
          </div>
          <p className="mt-1 text-sm text-arena-text-muted">
            {t("detail.memberSince", {
              year: new Date(payment.player.createdAt).getFullYear(),
            })}
          </p>

          <div className="mt-8 grid w-full gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-[12px] border-arena-border bg-arena-surface text-arena-text hover:border-arena-primary/40 hover:bg-arena-primary/10 hover:text-arena-primary"
            >
              <Link href={`/arena/squads/player/${payment.player.id}`}>
                <User className="mr-2" size={16} />
                {t("table.viewProfile")}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="rounded-[12px] text-arena-text-muted hover:bg-arena-surface-el hover:text-arena-text"
            >
              <Link href={`/arena/squads/player/${payment.player.id}#history`}>
                <History className="mr-2" size={16} />
                {t("detail.history")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="jb-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
            {t("detail.status")}
          </h2>
        </div>
        <div className="rounded-[14px] border border-arena-primary/35 bg-arena-primary/8 px-4 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-arena-text-muted">
            {t("detail.currentStatus")}
          </div>
          <JbBadge status={payment.status as BadgeStatus} animate />
        </div>
        <div className="mt-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-arena-text-muted">
            {t("detail.possibleStatuses")}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {PAYMENT_OVERVIEW_STATUSES.map(status => (
              <span
                key={status}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[10px] font-semibold text-arena-text-muted",
                  payment.status === status && "text-arena-text",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    STATUS_DOT_CLASS[status],
                  )}
                />
                {badgeT(status as BadgeStatus)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="jb-card px-5 pb-5 pt-4">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-arena-text-muted">
          {t("table.risk")}
        </h2>
        <ScoreBar score={payment.score as ScoreLevel} />
      </section>
    </aside>
  );
}
