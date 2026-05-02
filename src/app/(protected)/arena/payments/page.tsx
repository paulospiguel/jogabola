"use client";

import {
  ChevronRight,
  CreditCard,
  FileUp,
  Shield,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { type BadgeStatus, JbBadge } from "@/components/arena/jb-badge";
import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { Button } from "@/components/ui/button";
import { type Payment, usePayments } from "@/hooks/use-payments";

export default function PaymentsPage() {
  const t = useTranslations("arenaPayments");
  const { payments, isLoading } = usePayments();

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="jb-topbar">
          <div>
            <div className="jb-kicker">{t("kicker")}</div>
            <div className="flex items-center gap-2">
              <Shield className="size-6 text-arena-primary" />
              <h1 className="jb-title">{t("title")}</h1>
            </div>
          </div>
          <JbUserMenu onlyAvatar />
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: t("stats.method"),
              value: t("stats.methodValue"),
              Icon: CreditCard,
              action: t("actions.setMethods"),
              href: "#methods",
            },
            {
              label: t("stats.proofs"),
              value: t("stats.proofsValue"),
              Icon: FileUp,
              action: t("actions.uploadProof"),
              href: "#upload",
            },
            {
              label: t("stats.validation"),
              value: t("stats.validationValue"),
              Icon: ShieldCheck,
              action: t("actions.autoValidate"),
              href: "#validate",
            },
          ].map(({ label, value, Icon, action, href }) => (
            <Link
              href={href}
              className="jb-card group p-4 transition-all hover:border-arena-primary/50 hover:bg-arena-primary/5"
              key={label}
            >
              <div className="flex items-center justify-between">
                <Icon className="mb-3 size-5 text-arena-primary transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold text-arena-primary opacity-0 transition-opacity group-hover:opacity-100 uppercase">
                  {action}
                </span>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-arena-text-muted">
                {label}
              </div>
              <div className="mt-1 text-lg font-bold text-arena-text">
                {value}
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-arena-text-muted">
              {t("table.title")}
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="jb-action text-xs">
                {t("actions.relevant")}
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {isLoading ? (
              <div className="jb-card flex items-center justify-center p-12 text-arena-text-muted">
                <span className="animate-pulse">{t("loading")}</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="jb-card flex items-center justify-center p-12 text-arena-text-muted">
                {t("noPayments")}
              </div>
            ) : (
              payments.map((payment: Payment) => (
                <Link
                  key={payment.id}
                  href={`/arena/payments/${payment.id}`}
                  className="jb-card group relative overflow-hidden transition-all hover:border-arena-primary/30"
                >
                  <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                    {/* Atleta Info */}
                    <div className="flex flex-1 items-center gap-3">
                      <JbAvatar
                        id={payment.playerId}
                        name={payment.player}
                        size={44}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-arena-text group-hover:text-arena-primary transition-colors">
                            {payment.player}
                          </span>
                          <VerifiedBadge
                            verified={payment.isVerified}
                            variant="icon"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-arena-text-muted">
                          <span className="flex items-center gap-1">
                            <Wallet size={12} className="text-arena-primary" />
                            {payment.method}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">
                            {t(`table.match.${payment.match}`)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Risk */}
                    <div className="flex flex-wrap items-center gap-4 md:gap-8">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                          {t("table.status")}
                        </span>
                        <JbBadge
                          status={payment.status as BadgeStatus}
                          animate
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                          {t("table.risk")}
                        </span>
                        <JbBadge status={payment.score as BadgeStatus} />
                      </div>

                      <div className="flex flex-col gap-1 md:items-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                          {t("table.amount")}
                        </span>
                        <span className="text-lg font-black text-arena-primary">
                          {payment.amount}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arena-surface-el text-arena-text-muted transition-all group-hover:bg-arena-primary group-hover:text-arena-bg">
                      <ChevronRight size={20} />
                    </div>
                  </div>

                  {/* Glass highlight on hover */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-arena-primary/0 via-arena-primary/5 to-arena-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
