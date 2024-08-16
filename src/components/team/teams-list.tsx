"use client";

import { useGetTeams } from "@/hooks/use-create-team";
import TeamTable from "../team-table";

export const TeamsList = ({ userId }: { userId: string | undefined }) => {
  if (!userId) return null;

  const { data } = useGetTeams(userId);

  return <TeamTable teams={data} />;
};
