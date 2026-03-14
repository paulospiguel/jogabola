"use client";

import { Calendar, Heart, Plus, Star, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ProtectedDashboardShell,
  ProtectedEmptyState,
  ProtectedHeroCard,
  ProtectedSectionCard,
  ProtectedStatCard,
  ProtectedStatGrid,
} from "@/components/protected/protected-dashboard-shell";
import { ProtectedPageHeader } from "@/components/protected-page-header";
import { Button } from "@/components/ui/button";

const statIcons = [Heart, Trophy, Calendar, Star] as const;
const statAccents = ["rose", "amber", "mint", "blue"] as const;

export default function FanZonePage() {
  const t = useTranslations("fanzonePage");
  const stats = [
    {
      label: t("stats.followedTeams"),
      value: "8",
      detail: t("stats.newTeams"),
    },
    {
      label: t("stats.watchedMatches"),
      value: "24",
      detail: t("stats.thisMonth"),
    },
    {
      label: t("stats.upcomingMatches"),
      value: "7",
      detail: t("stats.thisWeek"),
    },
    {
      label: t("stats.favorites"),
      value: "3",
      detail: t("stats.preferredTeams"),
    },
  ];

  return (
    <div className="relative flex flex-col overflow-hidden">
      <ProtectedPageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
      />
      <ProtectedDashboardShell>
        <div className="space-y-6">
          <ProtectedHeroCard
            eyebrow={t("hero.eyebrow")}
            title={t("hero.title")}
            description={t("hero.description")}
            actions={
              <Button
                size="lg"
                className="bg-neon-primary text-[#04111f] hover:bg-neon-primary/90 font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("followTeam")}
              </Button>
            }
          />

          <ProtectedStatGrid>
            {stats.map((stat, index) => {
              const Icon = statIcons[index];
              return (
                <ProtectedStatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  detail={stat.detail}
                  icon={Icon}
                  accent={statAccents[index]}
                />
              );
            })}
          </ProtectedStatGrid>

          <ProtectedSectionCard
            eyebrow={t("community.eyebrow")}
            title={t("community.title")}
            description={t("community.description")}
          >
            <ProtectedEmptyState
              title={t("comingSoon.title")}
              description={t("comingSoon.description")}
            />
          </ProtectedSectionCard>
        </div>
      </ProtectedDashboardShell>
    </div>
  );
}
