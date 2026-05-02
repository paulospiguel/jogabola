"use client";

import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  ChevronRight, 
  Clock, 
  Download, 
  ExternalLink, 
  History, 
  ShieldCheck, 
  User, 
  Wallet, 
  X 
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type BadgeStatus, JbBadge } from "@/components/arena/jb-badge";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { Button } from "@/components/ui/button";
import { usePayments } from "@/hooks/use-payments";
import { cn } from "@/lib/utils";

export default function PaymentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations("arenaPayments");
  const { payments, isLoading } = usePayments();
  
  const payment = payments.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="jb-page flex items-center justify-center">
        <div className="animate-pulse text-arena-text-muted">{t("loading")}</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="jb-page">
        <div className="jb-page-inner text-center">
          <h1 className="text-xl font-bold">Payment not found</h1>
          <Button variant="ghost" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2" size={16} />
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full bg-arena-surface-el hover:bg-arena-primary/10 hover:text-arena-primary"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <div className="jb-kicker uppercase">{payment.id}</div>
              <h1 className="jb-title">{t("detail.title")}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-arena-danger/20 text-arena-danger hover:bg-arena-danger/10">
              <X className="mr-2" size={16} />
              {t("detail.reject")}
            </Button>
            <Button className="jb-action-primary">
              <Check className="mr-2" size={16} />
              {t("detail.accept")}
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            {/* Info Card */}
            <section className="jb-card overflow-hidden">
              <div className="border-b border-arena-border bg-arena-surface-el/50 px-6 py-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                  {t("detail.summary")}
                </h2>
              </div>
              <div className="grid gap-8 p-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-arena-border/50 pb-2">
                    <span className="text-sm text-arena-text-muted">{t("table.amount")}</span>
                    <span className="text-2xl font-black text-arena-primary">{payment.amount}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-arena-border/50 pb-2">
                    <span className="text-sm text-arena-text-muted">{t("table.status")}</span>
                    <JbBadge status={payment.status as BadgeStatus} animate />
                  </div>
                  <div className="flex items-center justify-between border-b border-arena-border/50 pb-2">
                    <span className="text-sm text-arena-text-muted">{t("table.method")}</span>
                    <span className="flex items-center gap-2 font-bold text-arena-text">
                      <Wallet size={16} className="text-arena-primary" />
                      {payment.method}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-arena-border/50 pb-2">
                    <span className="text-sm text-arena-text-muted">{t("table.event")}</span>
                    <span className="font-bold text-arena-text">{t(`table.match.${payment.match}`)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-arena-border/50 pb-2">
                    <span className="text-sm text-arena-text-muted">Date & Time</span>
                    <span className="flex items-center gap-2 font-bold text-arena-text">
                      <Calendar size={16} className="text-arena-text-muted" />
                      {payment.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-arena-border/50 pb-2">
                    <span className="text-sm text-arena-text-muted">{t("table.risk")}</span>
                    <JbBadge status={payment.score as BadgeStatus} />
                  </div>
                </div>
              </div>
            </section>

            {/* Proof Card */}
            <section className="jb-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-arena-border bg-arena-surface-el/50 px-6 py-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                  {t("detail.proof")}
                </h2>
                {payment.proofUrl && (
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase">
                    <Download className="mr-2" size={14} />
                    Download
                  </Button>
                )}
              </div>
              <div className="p-6">
                {payment.proofUrl ? (
                  <div className="relative aspect-[3/4] max-w-sm overflow-hidden rounded-2xl border border-arena-border bg-arena-surface shadow-2xl">
                    <img 
                      src={payment.proofUrl} 
                      alt="Payment Proof" 
                      className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                      <Button variant="secondary" className="bg-white text-black hover:bg-white/90">
                        <ExternalLink className="mr-2" size={16} />
                        {t("detail.viewProof")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-arena-border py-12 text-arena-text-muted">
                    <ShieldCheck size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">{t("detail.noProof")}</p>
                    <p className="mt-1 text-sm opacity-60">Wait for athlete to upload or manually verify.</p>
                    <Button variant="outline" className="mt-6 border-arena-primary/30 text-arena-primary hover:bg-arena-primary/10">
                      {t("detail.verify")}
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {/* Athlete Profile */}
            <section className="jb-card p-6">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                {t("detail.athlete")}
              </h2>
              <div className="flex flex-col items-center text-center">
                <JbAvatar id={payment.playerId} name={payment.player} size={80} />
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="text-lg font-bold text-arena-text">{payment.player}</h3>
                  <VerifiedBadge verified={payment.isVerified} />
                </div>
                <p className="mt-1 text-sm text-arena-text-muted">Club Member since 2023</p>
                
                <div className="mt-8 grid w-full gap-2">
                  <Link href={`/arena/teams?id=${payment.playerId}`}>
                    <Button variant="outline" className="w-full border-arena-border hover:bg-arena-primary/10 hover:text-arena-primary">
                      <User className="mr-2" size={16} />
                      {t("table.viewProfile")}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full text-arena-text-muted hover:text-arena-text">
                    <History className="mr-2" size={16} />
                    {t("detail.history")}
                  </Button>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="jb-card p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                {t("detail.status")}
              </h2>
              <div className="space-y-2">
                {(["pending", "validating", "confirmed", "refused"] as BadgeStatus[]).map(status => (
                  <button
                    key={status}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border border-arena-border p-3 transition-all hover:border-arena-primary/30 hover:bg-arena-primary/5",
                      payment.status === status && "border-arena-primary bg-arena-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    )}
                  >
                    <JbBadge status={status} />
                    {payment.status === status && <Check size={16} className="text-arena-primary" />}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
