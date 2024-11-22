import { getTeamsByUserId } from "@/actions/team";
import TeamsTable, { type Team } from "./teams-table";

const teamsData = [
	{
		rank: 1,
		name: "FC Example",
		city: "Example City",
		coach: "John Doe",
		stats: {
			wins: 20,
			losses: 5,
			draws: 10,
			goalsFor: 50,
			goalsAgainst: 30,
		},
		performance: 3.5,
		players: 22,
	},
	{
		rank: 2,
		name: "United Stars",
		city: "Starville",
		stats: {
			wins: 15,
			losses: 8,
			draws: 7,
			goalsFor: 40,
			goalsAgainst: 25,
		},
		coach: "Jane Smith",
		performance: 7.8,
		players: 18,
	},
];

const transformData = async (userId: string): Promise<Team[]> => {
	const response = await getTeamsByUserId({ userId });

	const teams = response?.data?.map((team) => ({
		rank: team?.rank,
		id: team?.id,
		logo: team?.logo,
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
