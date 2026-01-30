"use client";

import { Grid3x3, List, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { AthleteCard } from "@/components/athlete-card";
import { ClubCard } from "@/components/club-card";
import { CommunityFilters } from "@/components/community-filters";
import { FriendlyMatchCard } from "@/components/friendly-match-card";
import { Button } from "@/components/ui/button";

const SAMPLE_ATHLETES = [
  {
    name: "Carlos Eduardo",
    position: "DEFENDER",
    age: "24 YEARS",
    bio: "Experience in solid defense and aerial play. Available for training on Tuesdays and Thursdays.",
  },
  {
    name: 'Rodrigo "Mago" Silva',
    position: "MIDFIELDER",
    age: "22 YEARS",
    bio: "Exceptional game vision and precise passes. Looking for competitive amateur club.",
  },
  {
    name: "Gabriel P.",
    position: "GOALKEEPER",
    age: "27 YEARS",
    bio: "Experienced goalkeeper. Quick reflexes and leadership on the field.",
  },
  {
    name: "Fábio Lima",
    position: "FORWARD",
    age: "25 YEARS",
    bio: "Speed and precise finishing. Available for weekend games.",
  },
];

const SAMPLE_CLUBS = [
  {
    name: "Esporte Clube Aliança",
    initials: "ECA",
    category: "DIV 2 • São Paulo, SP",
    description:
      "Looking for left back and defensive midfielder to complete 2024 season roster. Training on Tuesdays and Thursdays.",
    urgency: true,
  },
  {
    name: "Vitória Futebol Clube",
    initials: "VFC",
    category: "Amateur • Curitiba, PR",
    description: "Building roster for 2024 season. All positions open.",
    urgency: false,
  },
];

const SAMPLE_MATCHES = [
  {
    team: "Juventude FC",
    initials: "JFC",
    players: "22/22",
    matchType: "Synthetic Grass",
    time: "10:00 AM",
    date: "02/15/25",
    availability: "Waiting for Opponent",
  },
  {
    team: "Lobos da Colina",
    initials: "LBC",
    players: "20/22",
    matchType: "RT (Short side)",
    time: "08:00 PM",
    date: "02/18/25",
    availability: "Waiting for Opponent",
  },
];

export default function CommunityPage() {
  const t = useTranslations("communityPage");

  const athletes = [
    {
      ...SAMPLE_ATHLETES[0],
      cta: t("athletes.cta"),
    },
    {
      ...SAMPLE_ATHLETES[1],
      cta: t("athletes.cta"),
    },
    {
      ...SAMPLE_ATHLETES[2],
      cta: t("athletes.cta"),
    },
    {
      ...SAMPLE_ATHLETES[3],
      cta: t("athletes.cta"),
    },
  ];

  const clubs = [
    {
      ...SAMPLE_CLUBS[0],
      cta: t("clubs.cta"),
    },
    {
      ...SAMPLE_CLUBS[1],
      cta: t("clubs.cta"),
    },
  ];

  const matches = [
    {
      ...SAMPLE_MATCHES[0],
      cta: t("matches.cta"),
    },
    {
      ...SAMPLE_MATCHES[1],
      cta: t("matches.cta"),
    },
    {
      ...SAMPLE_MATCHES[2],
      cta: t("matches.cta"),
    },
  ];

  return (
    <main className="relative min-h-screen pt-38 pb-24 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-1] bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)] opacity-50" />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-neon-primary/20 bg-neon-primary/5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-neon-primary uppercase">
              {t("hero.badge")}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            {t.rich("hero.title", {
              green: (children) => (
                <span className="text-neon-primary">{children}</span>
              ),
            })}
          </h1>

          <p className="text-lg text-white/60 max-w-2xl">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Filters */}
        <CommunityFilters
          categoryLabel={t("filters.category")}
          locationLabel={t("filters.location")}
          availabilityLabel={t("filters.availability")}
          dateLabel={t("filters.date")}
          searchLabel={t("filters.search")}
          className="mb-12"
        />

        {/* Athletes Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-neon-primary" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {t("athletes.title")}
              </h2>
            </div>
            <Button
              variant="ghost"
              className="text-xs text-neon-primary hover:text-neon-primary/80 hover:bg-neon-primary/10"
            >
              {t("filters.viewAll")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {athletes.map((athlete, index) => (
              <AthleteCard
                key={`${athlete.name}-${index}`}
                name={athlete.name}
                position={athlete.position}
                age={athlete.age}
                bio={athlete.bio}
                cta={t("athletes.cta")}
              />
            ))}
          </div>
        </section>

        {/* Clubs Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Grid3x3 className="h-6 w-6 text-neon-primary" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {t("clubs.title")}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubs.map((club, index) => (
              <ClubCard
                key={`${club.name}-${index}`}
                name={club.name}
                initials={club.initials}
                category={club.category}
                description={club.description}
                cta={t("clubs.cta")}
                urgency={club.urgency}
                urgencyLabel={t("clubs.urgency")}
              />
            ))}
          </div>
        </section>

        {/* Friendly Matches Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <List className="h-6 w-6 text-neon-primary" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {t("friendlyMatches.title")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white/60 hover:text-neon-primary hover:bg-neon-primary/10"
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-neon-primary hover:text-neon-primary/80 hover:bg-neon-primary/10"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {matches.map((match, index) => (
              <FriendlyMatchCard
                key={`${match.team}-${index}`}
                team={match.team}
                initials={match.initials}
                players={match.players}
                matchType={match.matchType}
                time={match.time}
                date={match.date}
                availability={match.availability}
                cta={t("friendlyMatches.cta")}
                playersLabel={t("friendlyMatches.metadata.players")}
                matchTypeLabel={t("friendlyMatches.metadata.matchType")}
                timeLabel={t("friendlyMatches.metadata.time")}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
