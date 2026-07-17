import { CheckCircle2, Circle, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

type PhaseStatus = "done" | "inProgress" | "planned" | "future";

const statusConfig: Record<
  PhaseStatus,
  {
    icon: typeof CheckCircle2;
    color: string;
    bg: string;
    border: string;
  }
> = {
  done: {
    icon: CheckCircle2,
    color: "text-arena-success",
    bg: "bg-arena-success/10",
    border: "border-arena-success/30",
  },
  inProgress: {
    icon: Zap,
    color: "text-arena-primary",
    bg: "bg-arena-primary/10",
    border: "border-arena-primary/30",
  },
  planned: {
    icon: Clock,
    color: "text-arena-info",
    bg: "bg-arena-info/10",
    border: "border-arena-info/30",
  },
  future: {
    icon: Circle,
    color: "text-arena-text-muted",
    bg: "bg-arena-surface",
    border: "border-arena-border",
  },
};

export default async function RoadmapPage() {
  const t = await getTranslations("roadmapPage");

  const phases = t.raw("phases") as Array<{
    id: string;
    label: string;
    period: string;
    status: PhaseStatus;
    items: string[];
  }>;

  const legend = [
    { key: "done" as const, label: t("legend.done") },
    { key: "inProgress" as const, label: t("legend.inProgress") },
    { key: "planned" as const, label: t("legend.planned") },
    { key: "future" as const, label: t("legend.future") },
  ];

  return (
    <main className="min-h-screen bg-[#080a25] px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <Logo isAnimate href="/" className="mx-auto mb-6" size="medium" />
          <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-neon-primary/80">
            {t("eyebrow")}
          </p>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            {t("title")}
          </h1>
          <p className="text-lg text-white/55">{t("subtitle")}</p>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {legend.map(({ key, label }) => {
            const cfg = statusConfig[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <cfg.icon size={14} className={cfg.color} />
                <span className="text-xs font-semibold text-white/55">
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="relative">
          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-white/8" />

          <div className="flex flex-col gap-8">
            {phases.map(phase => {
              const cfg = statusConfig[phase.status];
              const Icon = cfg.icon;

              return (
                <div key={phase.id} className="relative flex gap-6">
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                      cfg.bg,
                      cfg.border,
                    )}
                  >
                    <Icon size={18} className={cfg.color} />
                  </div>

                  <div
                    className={cn(
                      "flex-1 rounded-2xl border p-5",
                      phase.status === "inProgress"
                        ? "border-arena-primary/30 bg-arena-primary/5 shadow-[0_0_30px_rgba(124,255,79,0.05)]"
                        : "border-white/8 bg-white/2",
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            cfg.color,
                          )}
                        >
                          {phase.label}
                        </span>
                        <p className="mt-0.5 text-xs text-white/38">
                          {phase.period}
                        </p>
                      </div>
                      {phase.status === "inProgress" && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arena-primary opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-arena-primary" />
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1.5">
                      {phase.items.map(item => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "mt-0.5 shrink-0",
                              phase.status === "done"
                                ? "text-arena-success"
                                : "text-white/25",
                            )}
                          >
                            <CheckCircle2 size={13} />
                          </span>
                          <span
                            className={cn(
                              "text-sm",
                              phase.status === "done"
                                ? "text-white/65 line-through decoration-white/20"
                                : phase.status === "inProgress"
                                  ? "font-medium text-white/85"
                                  : "text-white/40",
                            )}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 rounded-3xl border border-white/8 bg-white/2 p-10 text-center">
          <h2 className="mb-3 text-2xl font-black text-white">
            {t("cta.title")}
          </h2>
          <p className="mb-8 text-white/55">{t("cta.subtitle")}</p>
          <Link
            href="/waitlist"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-neon-primary px-8 text-sm font-bold text-[#080a25] transition-opacity hover:opacity-90"
          >
            {t("cta.button")}
          </Link>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm text-white/38 transition-colors hover:text-white/65"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
