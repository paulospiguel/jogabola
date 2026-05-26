import {
  Banknote,
  ChevronRight,
  Coins,
  CreditCard,
  Landmark,
  Settings2,
  Smartphone,
} from "lucide-react";
import type { useTeamPaymentSettings } from "@/hooks/use-team-payment-settings";

type TranslationFn = (key: string) => string;
type TeamPaymentSettings = ReturnType<
  typeof useTeamPaymentSettings
>["settings"];

interface PaymentMethodsTabProps {
  onConfigure: () => void;
  settings: TeamPaymentSettings;
  t: TranslationFn;
}

function MethodStatusPill({
  active,
  t,
}: {
  active: boolean;
  t: TranslationFn;
}) {
  return active ? (
    <span className="rounded-full bg-arena-success/15 border border-arena-success/35 px-1.5 py-0.5 text-[8px] font-bold text-arena-success">
      {t("statusActive")}
    </span>
  ) : (
    <span className="rounded-full bg-arena-surface-el px-1.5 py-0.5 text-[8px] font-bold text-arena-text-muted border border-arena-border">
      {t("statusInactive")}
    </span>
  );
}

export function PaymentMethodsTab({
  onConfigure,
  settings,
  t,
}: PaymentMethodsTabProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
          {t("methodsTitle")}
        </span>
        <button
          type="button"
          onClick={onConfigure}
          className="press inline-flex items-center gap-1 rounded-lg border border-arena-border bg-arena-surface px-2.5 py-1 text-[11px] font-bold text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-primary"
        >
          <Settings2 size={12} />
          {t("configureBtn")}
        </button>
      </div>

      <div className="grid gap-3">
        <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 text-red-500 border border-red-500/30">
            <Smartphone size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-arena-text">
                {t("methods.mbway")}
              </span>
              <MethodStatusPill
                active={Boolean(settings?.mbwayEnabled)}
                t={t}
              />
            </div>
            <p className="text-[11px] text-arena-text-muted mt-0.5 truncate">
              {settings?.mbwayEnabled
                ? settings.mbwayPhone
                : t("statusDisabled")}
            </p>
          </div>
          <ChevronRight size={14} className="text-arena-text-muted" />
        </div>

        <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
            <Landmark size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-arena-text">
                {t("methods.transfer")}
              </span>
              <MethodStatusPill
                active={Boolean(settings?.transferEnabled)}
                t={t}
              />
            </div>
            <p className="text-[11px] text-arena-text-muted mt-0.5 truncate font-mono">
              {settings?.transferEnabled
                ? settings.transferIban
                : t("statusDisabled")}
            </p>
          </div>
          <ChevronRight size={14} className="text-arena-text-muted" />
        </div>

        <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-green-500/15 text-green-500 border border-green-500/30">
            <Banknote size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-arena-text">
                {t("methods.cash")}
              </span>
              <span className="rounded-full bg-arena-success/15 border border-arena-success/35 px-1.5 py-0.5 text-[8px] font-bold text-arena-success">
                {t("statusActive")}
              </span>
            </div>
            <p className="text-[11px] text-arena-text-muted mt-0.5 truncate">
              {t("methods.cashSub")}
            </p>
          </div>
          <ChevronRight size={14} className="text-arena-text-muted" />
        </div>

        <div className="rounded-[14px] border border-arena-border/60 bg-arena-surface/50 p-3.5 flex items-center gap-3 opacity-60">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400/70 border border-arena-border">
            <CreditCard size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-arena-text/70">
                Stripe
              </span>
              <span className="rounded-full bg-arena-border px-1.5 py-0.5 text-[8px] font-bold text-arena-text-muted">
                {t("statusSoon")}
              </span>
            </div>
            <p className="text-[11px] text-arena-text-muted mt-0.5 truncate">
              {t("stripeSoon")}
            </p>
          </div>
          <ChevronRight size={14} className="text-arena-text-muted/50" />
        </div>

        <div className="rounded-[14px] border border-arena-border/60 bg-arena-surface/50 p-3.5 flex items-center gap-3 opacity-60">
          <div className="flex size-9 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400/70 border border-arena-border">
            <Coins size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-arena-text/70">USDC</span>
              <span className="rounded-full bg-arena-border px-1.5 py-0.5 text-[8px] font-bold text-arena-text-muted">
                {t("statusSoon")}
              </span>
            </div>
            <p className="text-[11px] text-arena-text-muted mt-0.5 truncate">
              {t("usdcSoon")}
            </p>
          </div>
          <ChevronRight size={14} className="text-arena-text-muted/50" />
        </div>
      </div>
    </>
  );
}
