"use client";

import { useTranslations } from "next-intl";
import { ComparisonMatrix } from "@/components/comparison-matrix";
import { PricingCard } from "@/components/pricing-card";

import { plans } from "@/inputs/plans.json";

export default function PlanosPage() {
  const t = useTranslations("plansPage");

  const baseFeatures = [
    t("tiers.base.features.0"),
    t("tiers.base.features.1"),
    t("tiers.base.features.2"),
    t("tiers.base.features.3"),
  ];

  const proFeatures = [
    t("tiers.pro.features.0"),
    t("tiers.pro.features.1"),
    t("tiers.pro.features.2"),
    t("tiers.pro.features.3"),
    t("tiers.pro.features.4"),
  ];

  const eliteFeatures = [
    t("tiers.elite.features.0"),
    t("tiers.elite.features.1"),
    t("tiers.elite.features.2"),
    t("tiers.elite.features.3"),
    t("tiers.elite.features.4"),
  ];

  return (
    <main className="relative min-h-screen pt-38 pb-24 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-1] bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)] opacity-50" />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-neon-primary/20 bg-neon-primary/5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-neon-primary uppercase">
              {t("hero.badge")}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            {t.rich("hero.title", {
              blue: (children) => (
                <span className="text-neon-primary">{children}</span>
              ),
            })}
          </h1>

          <p className="text-lg text-white/60 leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-stretch">
          <PricingCard
            tier={t("tiers.base.tier")}
            name={t("tiers.base.name")}
            price={plans.base.price}
            features={baseFeatures}
            cta={t("tiers.base.cta")}
            isPopular={plans.base.isPopular}
          />
          <PricingCard
            tier={t("tiers.pro.tier")}
            name={t("tiers.pro.name")}
            price={plans.pro.price}
            period={t("tiers.pro.period")}
            features={proFeatures}
            cta={t("tiers.pro.cta")}
            isPopular={plans.pro.isPopular}
          />
          <PricingCard
            tier={t("tiers.elite.tier")}
            name={t("tiers.elite.name")}
            price={plans.elite.price}
            period={t("tiers.elite.period")}
            features={eliteFeatures}
            cta={t("tiers.elite.cta")}
            isPopular={plans.elite.isPopular}
          />
        </div>

        {/* Comparison Matrix Section */}
        <ComparisonMatrix
          title={t("comparison.title")}
          subtitle={t("comparison.subtitle")}
          modules={{
            stats: {
              id: t("comparison.modules.stats.id"),
              title: t("comparison.modules.stats.title"),
              description: t("comparison.modules.stats.description"),
              availability: t("comparison.modules.stats.availability"),
            },
            finance: {
              id: t("comparison.modules.finance.id"),
              title: t("comparison.modules.finance.title"),
              description: t("comparison.modules.finance.description"),
              availability: t("comparison.modules.finance.availability"),
            },
            pages: {
              id: t("comparison.modules.pages.id"),
              title: t("comparison.modules.pages.title"),
              description: t("comparison.modules.pages.description"),
              availability: t("comparison.modules.pages.availability"),
            },
            health: {
              id: t("comparison.modules.health.id"),
              title: t("comparison.modules.health.title"),
              description: t("comparison.modules.health.description"),
              availability: t("comparison.modules.health.availability"),
            },
          }}
        />
      </div>
    </main>
  );
}
