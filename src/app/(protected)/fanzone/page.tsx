"use client";

import { Calendar, Heart, Plus, Star, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FanZonePage() {
  const t = useTranslations("fanzonePage");
  return (
    <div className="relative flex flex-col overflow-hidden">
      <div className="relative container mx-auto p-4 md:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-linear-to-br dark:from-slate-900/60 dark:to-slate-800/40 dark:shadow-black/40">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl dark:from-pink-400 dark:to-purple-400">
                {t("title")} ⭐
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {t("subtitle")}
              </p>
            </div>
            <Button
              size="lg"
              className="bg-linear-to-r from-pink-500 to-purple-600 font-bold text-white shadow-xl hover:from-pink-600 hover:to-purple-700 dark:from-pink-700 dark:to-purple-700 dark:hover:from-pink-600 dark:hover:to-purple-600"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("followTeam")}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.followedTeams")}
              </CardTitle>
              <Heart className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-muted-foreground text-xs">{t("stats.newTeams")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.watchedMatches")}
              </CardTitle>
              <Trophy className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-muted-foreground text-xs">{t("stats.thisMonth")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.upcomingMatches")}
              </CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-muted-foreground text-xs">{t("stats.thisWeek")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("stats.favorites")}</CardTitle>
              <Star className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-muted-foreground text-xs">{t("stats.preferredTeams")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>{t("comingSoon.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t("comingSoon.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
