import { CreditCard, FileUp, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PaymentsPage() {
  const t = useTranslations("arenaPayments");

  const MOCK_PAYMENTS = [
    {
      id: "PAY-001",
      player: "Diogo Ferreira",
      match: t("table.mockMatch"),
      amount: "€5,00",
      status: t("table.mockStatusPending"),
    },
    {
      id: "PAY-002",
      player: "Ricardo Pinto",
      match: t("table.mockMatch"),
      amount: "€5,00",
      status: t("table.mockStatusValidating"),
    },
  ];

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="jb-topbar">
          <div>
            <div className="jb-kicker">{t("kicker")}</div>
            <h1 className="jb-title">{t("title")}</h1>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: t("stats.method"),
              value: t("stats.methodValue"),
              Icon: CreditCard,
            },
            {
              label: t("stats.proofs"),
              value: t("stats.proofsValue"),
              Icon: FileUp,
            },
            {
              label: t("stats.validation"),
              value: t("stats.validationValue"),
              Icon: ShieldCheck,
            },
          ].map(({ label, value, Icon }) => (
            <div className="jb-card p-4" key={label}>
              <Icon className="mb-3 size-5 text-arena-primary" />
              <div className="text-xs font-semibold uppercase tracking-wide text-arena-text-muted">
                {label}
              </div>
              <div className="mt-1 text-lg font-bold text-arena-text">
                {value}
              </div>
            </div>
          ))}
        </section>

        <section className="jb-card mt-6 overflow-hidden">
          <div className="border-arena-border border-b px-4 py-3">
            <h2 className="text-sm font-bold text-arena-text">
              {t("table.title")}
            </h2>
          </div>
          <div className="divide-y divide-arena-border">
            {MOCK_PAYMENTS.map(payment => (
              <div
                className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_1fr_auto_auto] md:items-center"
                key={payment.id}
              >
                <div className="font-semibold text-arena-text">
                  {payment.player}
                </div>
                <div className="text-arena-text-sec">{payment.match}</div>
                <div className="font-bold text-arena-primary">
                  {payment.amount}
                </div>
                <div className="text-xs text-arena-text-muted">
                  {payment.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
