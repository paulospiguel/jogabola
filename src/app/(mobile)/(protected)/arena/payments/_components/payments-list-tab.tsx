import { ChevronRight, FileText, Wallet } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { JbAvatar } from "@/components/arena/avatar";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  PAYMENT_OVERVIEW_STATUS,
  type PaymentOverviewStatus,
} from "@/constants/payments";
import type { Payment } from "@/hooks/use-payments";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { PaymentsFilter } from "../_hooks/use-payments-page-state";

type TranslationFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

interface PaymentsListTabProps {
  activeFilter: PaymentsFilter;
  badgeT: TranslationFn;
  filteredPayments: Payment[];
  isLoading: boolean;
  onSelectProofPayment: (payment: Payment) => void;
  setActiveFilter: (filter: PaymentsFilter) => void;
  t: TranslationFn;
}

const PAYMENT_FILTERS = [
  "all",
  PAYMENT_OVERVIEW_STATUS.VALIDATING,
  PAYMENT_OVERVIEW_STATUS.PENDING,
  PAYMENT_OVERVIEW_STATUS.CONFIRMED,
  PAYMENT_OVERVIEW_STATUS.REFUSED,
] as const;

function getFilterLabel(
  filter: "all" | PaymentOverviewStatus,
  t: TranslationFn,
) {
  if (filter === "all") {
    return t("filters.all");
  }
  if (filter === PAYMENT_OVERVIEW_STATUS.VALIDATING) {
    return t("filters.validating");
  }
  if (filter === PAYMENT_OVERVIEW_STATUS.PENDING) {
    return t("filters.pending");
  }
  if (filter === PAYMENT_OVERVIEW_STATUS.CONFIRMED) {
    return t("filters.confirmed");
  }

  return t("filters.overdue");
}

function PaymentStatusBadge({
  active,
  children,
  tone,
}: {
  active: boolean;
  children: string;
  tone: "success" | "warning" | "danger";
}) {
  if (!active) {
    return null;
  }

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
        tone === "success" &&
          "border-arena-success/35 bg-arena-success/15 text-arena-success",
        tone === "warning" &&
          "border-arena-warning/35 bg-arena-warning/15 text-arena-warning",
        tone === "danger" &&
          "border-arena-danger/35 bg-arena-danger/15 text-arena-danger",
      )}
    >
      {children}
    </span>
  );
}

export function PaymentsListTab({
  activeFilter,
  badgeT,
  filteredPayments,
  isLoading,
  onSelectProofPayment,
  setActiveFilter,
  t,
}: PaymentsListTabProps) {
  const locale = useLocale();
  return (
    <>
      <div className="overflow-x-auto pb-3 scrollbar-none w-full">
        <ButtonGroup className="!flex border border-arena-border rounded-[10px] p-[3px] bg-arena-surface min-w-max w-full">
          {PAYMENT_FILTERS.map(filter => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "press flex-1 text-center py-2 px-3 text-[11px] font-bold tracking-wide rounded-[8px] transition-all cursor-pointer whitespace-nowrap",
                activeFilter === filter
                  ? "bg-arena-primary text-arena-bg font-extrabold"
                  : "text-arena-text-sec hover:text-arena-text",
              )}
            >
              {getFilterLabel(filter, t)}
            </button>
          ))}
        </ButtonGroup>
      </div>

      <div className="grid gap-3 mt-2">
        {isLoading ? (
          <div className="jb-card flex items-center justify-center p-12 text-arena-text-muted">
            <span className="animate-pulse">{t("loading")}</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <ArenaEmptyState
            icon={Wallet}
            title={t("noPayments")}
            description={t("noPaymentsSub")}
          />
        ) : (
          filteredPayments.map(payment => {
            const isValidating =
              payment.status === PAYMENT_OVERVIEW_STATUS.VALIDATING;
            const isConfirmed =
              payment.status === PAYMENT_OVERVIEW_STATUS.CONFIRMED;
            const isPending =
              payment.status === PAYMENT_OVERVIEW_STATUS.PENDING;
            const isRefused =
              payment.status === PAYMENT_OVERVIEW_STATUS.REFUSED;

            return (
              <div
                key={payment.id}
                className="jb-card group relative overflow-hidden p-3.5 transition-all hover:border-arena-primary/30"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <JbAvatar
                      id={payment.player.id}
                      name={payment.player.name}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate text-xs font-bold text-arena-text">
                          {payment.player.name}
                        </span>
                        <VerifiedBadge
                          verified={payment.player.isVerified}
                          variant="icon"
                        />
                      </div>
                      <p className="text-[11px] text-arena-text-muted truncate mt-0.5">
                        {t(`methods.${payment.method}`)} · {payment.event.title}
                      </p>
                    </div>

                    <div className="text-right">
                      <strong className="font-sora text-base font-black text-arena-primary">
                        {payment.amount}
                      </strong>
                      <p className="text-[9px] text-arena-text-muted mt-0.5">
                        {t("ago", {
                          time: formatRelativeTime(payment.date, locale),
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between border-t border-arena-border/30 pt-3">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <PaymentStatusBadge active={isConfirmed} tone="success">
                        {badgeT("confirmed")}
                      </PaymentStatusBadge>
                      <PaymentStatusBadge active={isValidating} tone="warning">
                        {badgeT("validating")}
                      </PaymentStatusBadge>
                      <PaymentStatusBadge active={isPending} tone="danger">
                        {badgeT("pending")}
                      </PaymentStatusBadge>
                      <PaymentStatusBadge active={isRefused} tone="danger">
                        {badgeT("refused")}
                      </PaymentStatusBadge>

                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                          payment.score === "low"
                            ? "bg-arena-success/10 border-arena-success/30 text-arena-success"
                            : payment.score === "medium"
                              ? "bg-arena-warning/10 border-arena-warning/30 text-arena-warning"
                              : "bg-arena-danger/10 border-arena-danger/30 text-arena-danger",
                        )}
                      >
                        {payment.score === "low"
                          ? badgeT("low")
                          : payment.score === "medium"
                            ? badgeT("medium")
                            : badgeT("high")}
                      </span>
                    </div>

                    {isValidating ? (
                      <button
                        type="button"
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          onSelectProofPayment(payment);
                        }}
                        className="press flex items-center gap-1 rounded-lg border border-arena-primary/30 bg-arena-primary/5 px-2.5 py-1 text-[10px] font-bold text-arena-primary transition-all hover:bg-arena-primary/15"
                      >
                        <FileText size={11} />
                        {t("verifyProof")}
                      </button>
                    ) : (
                      <Link
                        href={`/arena/payments/${payment.id}`}
                        className="press flex items-center gap-0.5 text-[10px] font-bold text-arena-text-sec hover:text-arena-primary"
                      >
                        {t("viewDetail")}
                        <ChevronRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
