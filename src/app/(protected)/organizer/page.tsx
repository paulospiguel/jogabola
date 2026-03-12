"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, Trophy, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export default function OrganizerPage() {
  const t = useTranslations("organizerPage");
  return (
    <div className="relative flex flex-col overflow-hidden">
      <div className="relative container mx-auto p-4 md:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-linear-to-br dark:from-slate-900/60 dark:to-slate-800/40 dark:shadow-black/40">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl dark:from-orange-400 dark:to-red-400">
                {t("title")} 🎯
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {t("subtitle")}
              </p>
            </div>
            <Button
              size="lg"
              className="bg-linear-to-r from-orange-500 to-red-600 font-bold text-white shadow-xl hover:from-orange-600 hover:to-red-700 dark:from-orange-700 dark:to-red-700 dark:hover:from-orange-600 dark:hover:to-red-600"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t("newTournament")}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.activeTournaments")}
              </CardTitle>
              <Trophy className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-muted-foreground text-xs">{t("stats.inProgress")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.scheduledEvents")}
              </CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-muted-foreground text-xs">{t("stats.next30days")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.participants")}
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-muted-foreground text-xs">{t("stats.participantsThisMonth")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("stats.venues")}</CardTitle>
              <MapPin className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-muted-foreground text-xs">{t("stats.registered")}</p>
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
