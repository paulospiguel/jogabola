import { Calendar, Wallet } from "lucide-react";
import { type BadgeStatus, JbBadge } from "@/components/arena/badge";
import type { Payment } from "@/hooks/use-payments";

type TranslationFn = (key: string) => string;

interface PaymentSummaryCardProps {
  payment: Payment;
  t: TranslationFn;
}

export function PaymentSummaryCard({ payment, t }: PaymentSummaryCardProps) {
  return (
    <section className="jb-card overflow-hidden">
      <div className="border-b border-arena-border bg-arena-surface-el/45 px-6 py-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
          {t("detail.summary")}
        </h2>
      </div>
      <div className="grid gap-x-10 gap-y-5 p-6 md:grid-cols-2">
        {[
          [t("table.amount"), payment.amount],
          [t("table.event"), payment.event.title],
          [t("table.status"), payment.status],
          [t("table.date"), payment.date],
          [t("table.method"), payment.method],
          [t("table.risk"), payment.score],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 border-b border-arena-border/55 pb-3"
          >
            <span className="text-[13px] text-arena-text-muted">{label}</span>
            {label === t("table.amount") ? (
              <span className="font-sora text-2xl font-extrabold text-arena-primary">
                {value}
              </span>
            ) : label === t("table.status") ? (
              <JbBadge status={payment.status as BadgeStatus} animate />
            ) : label === t("table.method") ? (
              <span className="flex items-center gap-2 font-bold text-arena-text">
                <Wallet size={16} className="text-arena-primary" />
                {value}
              </span>
            ) : label === t("table.date") ? (
              <span className="flex items-center gap-2 font-bold text-arena-text">
                <Calendar size={16} className="text-arena-text-muted" />
                {value}
              </span>
            ) : label === t("table.risk") ? (
              <JbBadge status={payment.score as BadgeStatus} />
            ) : (
              <span className="text-right font-bold text-arena-text">
                {value}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
