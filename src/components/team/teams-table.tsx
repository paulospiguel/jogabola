"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import noLogo from "@/assets/images/no-logo.png";
import {
  Edit,
  GlobeIcon,
  LayoutPanelTop,
  LockIcon,
  MessageSquare,
  PanelBottom,
  PanelLeft,
  Trash,
  TrendingDown,
  TrendingUp,
  Eye as ViewIcon,
} 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
//import type { Team } from "@/types";
import { teamStore } from "@/store/team.store";
import PlayerAvatarList from "../player-avatar-list";
import { useTranslations } from "next-intl";
import type { Player } from "@repo/db";

export interface TeamStats {
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface Team {
  rank: number;
  id: string;
  logo: string;
  name: string;
  city: string;
  coach: string;
  stats: TeamStats;
  performance: number;
  players: number;
}

type TeamTableProps = {
  teamsList: Team[];
};

export default function TeamsTable({ teamsList }: TeamTableProps) {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const { push } = useRouter();

  const t = useTranslations("global");

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeamName(team.name);
  };
  const handleSaveTeam = () => {
    //setTeams(teams.map((team) => (team.id === editingTeam.id ? { ...team, name: newTeamName } : team)))
    setEditingTeam(null);
  };
  const handleDeleteTeam = (teamId: string | undefined) => {
    //setTeams(teams.filter((team) => team.id !== teamId))
  };
  const handleTogglePublic = (teamId: string | undefined) => {
    // setTeams(teams.map((team) => (team.id === teamId ? { ...team, isPublic: !team.isPublic } : team)))
  };

  const handleInvite = (teamId: string) => {
    //push(`/manager/teams/${teamId}/invite`);
  };

  const handleOpenTeam = (teamId: string) => {
    push(`/manager/teams/${teamId}`);
  };

  const calculatePerformance = (performance: number) => {
    if (!performance) {
      return {
        average: performance,
        increase: false,
        component: null,
        suffix: null,
      };
    }

    if (performance < 6.5) {
      return {
        average: performance,
        increase: false,
        component: <TrendingDown className="text-red-500" />,
        suffix: "Bad",
      };
    }

    return {
      average: performance,
      increase: true,
      component: <TrendingUp className="text-green-500" />,
      suffix: "Good",
    };
  };

  const renderPerformance = (performance: number) => {
    const { average, increase, component, suffix } =
      calculatePerformance(performance);
    return (
      <div className="flex items-center gap-1">
        {component}
        <span className="text-slate-500">{average || "N/A"}</span>
        {suffix && <span className="text-slate-500">{suffix}</span>}
      </div>
    );
  };

  const renderPlayers = (players: Player[]) => {
    return <PlayerAvatarList showOnlyCount players={players} />;
  };

  const renderSeason = (stats: {
    wins: number;
    losses: number;
    draws: number;
    goalsFor: number;
    goalsAgainst: number;
  }) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-slate-500">{stats.wins || 0}</span>
        <div className="h-1 w-1 rounded-full bg-slate-500" />
        <span className="text-slate-500">{stats.losses || 0}</span>
        <div className="h-1 w-1 rounded-full bg-slate-500" />
        <span className="text-slate-500">{stats.draws || 0}</span>
      </div>
    );
  };

  const renderLogo = (logo: string) => {
    return (
      <Image
        src={logo || noLogo}
        alt="team logo"
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  };

  useEffect(() => {
    teamStore.setState(state => ({
      ...state,
      createdTeamCounter: teamsList?.length || 0,
    }));
  }, [teamsList]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto bg-slate-50 dark:bg-slate-800">
        {/* Table header */}
        <thead className="text-[13px] text-slate-500/70">
          <tr>
            {[
              "#",
              "logo",
              "teamName",
              "city",
              "season",
              "players",
              "performance",
              "actions",
            ].map((header, index) => (
              <th
                key={index}
                className="bg-slate-100 px-5 py-2 first:rounded-l first:pl-3 last:sticky last:right-0 last:rounded-r last:pl-5 last:pr-3"
              >
                <div className="text-left font-medium">{t(header)}</div>
              </th>
            ))}
          </tr>
        </thead>
        {/* Table body */}
        <tbody className="text-sm font-medium">
          {teamsList.map((team, index) => (
            <tr key={index}>
              <td className="border-b border-slate-200 px-5 py-3 first:pl-3 last:sticky last:right-0 last:bg-gradient-to-r last:from-transparent last:to-white last:pl-5 last:pr-3">
                <div className="text-slate-500">{team.rank}</div>
              </td>
              <td className="border-b border-slate-200 px-5 py-3 first:pl-3 last:sticky last:right-0 last:bg-gradient-to-r last:from-transparent last:to-white last:pl-5 last:pr-3">
                {renderLogo(team?.logo)}
              </td>
              <td className="border-b border-slate-200 px-5 py-3 first:pl-3 last:sticky last:right-0 last:bg-gradient-to-r last:from-transparent last:to-white last:pl-5 last:pr-3">
                <div className="text-slate-900">{team.name}</div>
              </td>
              <td className="border-b border-slate-200 px-5 py-3 first:pl-3 last:sticky last:right-0 last:bg-gradient-to-r last:from-transparent last:to-white last:pl-5 last:pr-3">
                <div className="text-slate-500">{team.city}</div>
              </td>
              <td className="border-b border-slate-200 px-5 py-3 first:pl-3 last:sticky last:right-0 last:bg-gradient-to-r last:from-transparent last:to-white last:pl-5 last:pr-3">
                <div className="text-slate-900">{renderSeason(team.stats)}</div>
              </td>
              <td className="border-b border-slate-200 px-5 py-3 first:pl-3 last:sticky last:right-0 last:bg-gradient-to-r last:from-transparent last:to-white last:pl-5 last:pr-3">
                <div className="text-slate-900">
                  {renderPlayers(Array.from({ length: team.players }))}
                </div>
              </td>
              <td className="border-b border-slate-200 px-5 py-3 first:pl-3 last:sticky last:right-0 last:bg-gradient-to-r last:from-transparent last:to-white last:pl-5 last:pr-3">
                <div className="text-slate-900">
                  {renderPerformance(team.performance)}
                </div>
              </td>
              <td className="border-b border-slate-200 px-5 py-3 first:pl-3 last:sticky last:right-0 last:bg-gradient-to-r last:from-transparent last:to-white last:pl-5 last:pr-3">
                <Button
                  onClick={() => handleOpenTeam(team?.slug || team?.id)}
                  className="hover:bg-green-600/75"
                >
                  <LayoutPanelTop className="mr-1 h-4 w-4" />
                  {t("manage")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
