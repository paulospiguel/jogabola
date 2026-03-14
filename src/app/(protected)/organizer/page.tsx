"use client";

import { Calendar, MapPin, Plus, Trophy, Users } from "lucide-react";
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

const statIcons = [Trophy, Calendar, Users, MapPin] as const;
const statAccents = ["amber", "mint", "blue", "rose"] as const;

export default function OrganizerPage() {
  const t = useTranslations("organizerPage");
  const stats = [
    {
      label: t("stats.activeTournaments"),
      value: "3",
      detail: t("stats.inProgress"),
    },
    {
      label: t("stats.scheduledEvents"),
      value: "8",
      detail: t("stats.next30days"),
    },
    {
      label: t("stats.participants"),
      value: "156",
      detail: t("stats.participantsThisMonth"),
    },
    {
      label: t("stats.venues"),
      value: "5",
      detail: t("stats.registered"),
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
                {t("newTournament")}
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
            eyebrow={t("roadmap.eyebrow")}
            title={t("roadmap.title")}
            description={t("roadmap.description")}
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
