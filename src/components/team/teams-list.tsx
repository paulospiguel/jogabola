import { getTeamsByUserId } from "@/actions/team";
import TeamsTable, { type Team } from "./teams-table";

import noImage from "@/assets/images/JOGABOLA-shield.svg";

const transformData = async (userId: string): Promise<Team[]> => {
  const response = await getTeamsByUserId({ userId });

  const teams = response?.data?.map(team => ({
    rank: team?.rank,
    id: team?.id,
    logo: team?.logo || noImage,
    name: team?.name,
    city: team?.location,
    coach: team?.manager,
    stats: {
      wins: team?.wins,
      losses: team?.losses,
      draws: team?.draws,
      goalsFor: team?.goalsFor,
      goalsAgainst: team?.goalsAgainst,
    },
    performance: team?.performance,
    players: team.teamMembers.length,
  }));

  return teams;
};

export const TeamsList = async ({ userId }: { userId: string | undefined }) => {
  if (!userId) return null;

  const teams = await transformData(userId);

  return <TeamsTable teamsList={teams} />;
};
