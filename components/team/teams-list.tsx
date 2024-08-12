"use client";

import { getTeamsByUserId } from "@/actions/team";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import TeamTable from "../team-table";
import { User } from "next-auth";
import { useGetTeams } from "@/hooks/use-create-team";

export const TeamsList = ({ userId }: { userId: string | undefined }) => {
  if (!userId) return null;

  const { data } = useGetTeams(userId);

  return <TeamTable teams={data} />;
};
