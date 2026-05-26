import { Sparkles } from "lucide-react";

type TranslationFn = (key: string) => string;

interface AiProTabProps {
  t: TranslationFn;
}

function AiProFeature({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-arena-primary/15 text-arena-primary">
        <span className="text-[11px] font-black">✓</span>
      </div>
      <span className="text-xs font-bold text-arena-text">{children}</span>
    </div>
  );
}

export function AiProTab({ t }: AiProTabProps) {
  return (
    <div className="rounded-[22px] border border-arena-primary/30 bg-gradient-to-b from-arena-primary/10 via-arena-surface/90 to-arena-surface p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-12 -right-12 size-24 rounded-full bg-arena-primary/20 blur-2xl" />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-arena-primary/15 text-arena-primary border border-arena-primary/30">
          <Sparkles className="size-5 fill-arena-primary/10 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-sora text-[17px] font-black text-arena-text">
              {t("iapro.title")}
            </h3>
            <span className="rounded-full bg-arena-primary px-2 py-0.5 text-[8px] font-black text-arena-bg tracking-widest uppercase">
              {t("iapro.premium")}
            </span>
          </div>
          <p className="text-[11px] text-arena-text-muted mt-0.5">
            {t("iapro.subtitle")}
          </p>
        </div>
      </div>

      <p className="text-xs text-arena-text-sec leading-relaxed mt-2.5">
        {t("iapro.description")}
      </p>

      <div className="flex flex-col gap-3 mt-6">
        <AiProFeature>{t("iapro.feature1")}</AiProFeature>
        <AiProFeature>{t("iapro.feature2")}</AiProFeature>
        <AiProFeature>{t("iapro.feature3")}</AiProFeature>
      </div>

      <button
        type="button"
        className="press mt-8 flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-xs font-bold text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.25)] transition-all hover:bg-arena-primary/95"
      >
        <Sparkles className="size-4" />
        {t("iapro.cta")}
      </button>
    </div>
  );
}
