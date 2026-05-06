import { CheckCircle2, Sparkles, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS, type PlanTier } from "@/constants/plans";
import { cn } from "@/lib/utils";

const planIcons = {
  free: Zap,
  pro: Sparkles,
  elite: Trophy,
} satisfies Record<PlanTier, typeof Zap>;

const planOrder: PlanTier[] = ["free", "pro", "elite"];

export default async function PricingPage() {
  const t = await getTranslations("pricingPage");

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 pt-32 text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 left-[12%] h-80 w-80 rounded-full bg-accent-blue/10 blur-[120px]" />
        <div className="absolute right-[10%] bottom-24 h-96 w-96 rounded-full bg-arena-primary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,255,79,0.06),transparent_42%)]" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-28 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <Logo
            href="home"
            isAnimate
            size="medium"
            className="mx-auto mb-6"
          />

          <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-arena-primary">
            {t("eyebrow")}
          </p>
          <h1 className="text-4xl font-black tracking-normal text-white md:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {planOrder.map(plan => {
            const Icon = planIcons[plan];
            const featured = plan === "pro";
            const limits = PLAN_LIMITS[plan];
            const features = t.raw(`plans.${plan}.features`) as string[];

            return (
              <article
                key={plan}
                className={cn(
                  "relative flex min-h-[620px] flex-col rounded-[28px] border p-6 shadow-[0_24px_80px_-52px_rgba(36,255,230,0.8)] backdrop-blur-md transition-all",
                  featured
                    ? "border-arena-primary/40 bg-arena-primary/10"
                    : "border-border-default bg-white/5",
                )}
              >
                {featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-arena-primary/30 bg-arena-primary px-4 py-1.5 text-xs font-black uppercase tracking-widest text-black">
                    {t("recommended")}
                  </div>
                )}

                <div className="mb-7 flex items-center justify-between gap-4">
                  <div
                    className={cn(
                      "flex size-13 items-center justify-center rounded-2xl border",
                      featured
                        ? "border-arena-primary/30 bg-arena-primary/15 text-arena-primary"
                        : "border-border-default bg-white/5 text-accent-blue",
                    )}
                  >
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full border border-border-default bg-white/5 px-3 py-1 text-xs font-bold text-text-muted">
                    {t(`plans.${plan}.badge`)}
                  </span>
                </div>

                <div className="mb-7">
                  <h2 className="text-2xl font-black text-white">
                    {t(`plans.${plan}.name`)}
                  </h2>
                  <p className="mt-2 min-h-12 text-sm leading-relaxed text-text-secondary">
                    {t(`plans.${plan}.description`)}
                  </p>
                </div>

                <div className="mb-7">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black leading-none text-white">
                      {t(`plans.${plan}.price`)}
                    </span>
                    <span className="pb-1 text-sm font-semibold text-text-muted">
                      {t(`plans.${plan}.period`)}
                    </span>
                  </div>
                </div>

                <div className="mb-7 grid grid-cols-3 gap-2">
                  <LimitTile
                    label={t("limits.teams")}
                    value={limits.maxTeams}
                  />
                  <LimitTile
                    label={t("limits.players")}
                    value={limits.maxPlayersPerTeam}
                  />
                  <LimitTile
                    label={t("limits.events")}
                    value={limits.maxEventsPerMonth}
                  />
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {features.map(feature => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-arena-primary" />
                      <span className="text-sm leading-relaxed text-text-secondary">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    "h-13 rounded-full text-base font-black transition-all hover:scale-[1.02]",
                    featured
                      ? "bg-arena-primary text-black hover:bg-[#6ee847]"
                      : "border border-border-default bg-white/5 text-white hover:bg-white/10",
                  )}
                >
                  <Link href={plan === "free" ? "/auth" : "/waitlist"}>
                    {t(`plans.${plan}.cta`)}
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-[28px] border border-border-default bg-white/5 p-6 text-center backdrop-blur-md">
          <h2 className="text-xl font-black text-white">{t("note.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {t("note.description")}
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex text-sm font-bold text-arena-primary transition-colors hover:text-neon-primary"
          >
            {t("note.cta")}
          </Link>
        </div>
      </section>
    </main>
  );
}

function LimitTile({ label, value }: { label: string; value: number }) {
  const displayValue = value >= 999 ? "∞" : String(value);

  return (
    <div className="rounded-2xl border border-border-default bg-white/5 p-3 text-center">
      <div className="text-xl font-black text-white">{displayValue}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
        {label}
      </div>
    </div>
  );
}
