import { useState } from "react";
import { Label } from "@repo/ui/components/label";
import { Progress } from "@repo/ui/components/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Calendar, MapPin, Trophy, Users } from "@repo/ui/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { formatDate } from "@/utils";
import Counter from "@/components/counter";
import NotificationCenter from "@/components/notification-center";
import type { Team } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { saveTeamInfo } from "@/actions";
import PlayersList from "@/components/team/players-list";
import EditableInput from "../editable-input";

// Mock data (replace with actual data fetching in a real application)
const initialTeamData = {
	name: "Thunderbolts FC",
	founded: "2010",
	homeGround: "Thunder Stadium",
	logo: "/placeholder.svg?height=100&width=100",
	manager: "Alex Ferguson",
	league: "Premier League",
	position: 3,
	played: 38,
	won: 25,
	drawn: 8,
	lost: 5,
	goalsFor: 80,
	goalsAgainst: 35,
	players: [
		{
			id: 1,
			name: "John Doe",
			position: "Forward",
			number: 10,
			nationality: "England",
			age: 28,
			appearances: 36,
			goals: 22,
			assists: 15,
			image: "/placeholder.svg?height=40&width=40",
		},
		{
			id: 2,
			name: "Jane Smith",
			position: "Midfielder",
			number: 8,
			nationality: "Spain",
			age: 26,
			appearances: 34,
			goals: 7,
			assists: 20,
			image: "/placeholder.svg?height=40&width=40",
		},
		{
			id: 3,
			name: "Mike Johnson",
			position: "Defender",
			number: 4,
			nationality: "Italy",
			age: 29,
			appearances: 38,
			goals: 2,
			assists: 3,
			image: "/placeholder.svg?height=40&width=40",
		},
	],
	cups: [
		{ name: "FA Cup", year: 2022, image: "/placeholder.svg?height=40&width=40" },
		{ name: "League Cup", year: 2023, image: "/placeholder.svg?height=40&width=40" },
		{ name: "Community Shield", year: 2023, image: "/placeholder.svg?height=40&width=40" },
	],
	upcomingMatches: [
		{ opponent: "City Rovers", date: "2023-08-15", venue: "Home" },
		{ opponent: "United FC", date: "2023-08-22", venue: "Away" },
		{ opponent: "Athletico", date: "2023-08-29", venue: "Home" },
	],
};

export const TabsTeam = ({ team }: { team: Team }) => {
	const [teamData, setTeamData] = useState(initialTeamData);
	const [newPlayerName, setNewPlayerName] = useState("");
	const [newPlayerPosition, setNewPlayerPosition] = useState("");
	const [newPlayerNumber, setNewPlayerNumber] = useState("");

	const handleInvitePlayer = () => {
		if (newPlayerName && newPlayerPosition && newPlayerNumber) {
			const newPlayer = {
				id: teamData.players.length + 1,
				name: newPlayerName,
				position: newPlayerPosition,
				number: Number.parseInt(newPlayerNumber),
				nationality: "Unknown",
				age: 25,
				appearances: 0,
				goals: 0,
				assists: 0,
				image: "/placeholder.svg?height=40&width=40",
			};
			setTeamData({
				...teamData,
				players: [...teamData.players, newPlayer],
			});
			setNewPlayerName("");
			setNewPlayerPosition("");
			setNewPlayerNumber("");
		}
	};

	// const handleDeletePlayer = (playerId: number) => {
	// 	setTeamData({
	// 		...teamData,
	// 		players: teamData.players.filter((player) => player.id !== playerId),
	// 	});
	// };

	const handleSaveInfo = async (key: string, value: string) => {
		await saveTeamInfo({
			teamId: team?.id,
			input: {
				key,
				value,
			},
		});
	};

	return (
		<Tabs defaultValue="overview" className="w-full">
			<TabsList className="grid w-full grid-cols-5 bg-primary">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="players">Players</TabsTrigger>
				<TabsTrigger value="achievements">Achievements</TabsTrigger>
				<TabsTrigger value="fixtures">Fixtures</TabsTrigger>
				<TabsTrigger value="notifications">Notifications</TabsTrigger>
			</TabsList>
			<TabsContent value="overview" className="space-y-4 px-4">
				<HeaderTitle
					title="Overview"
					description="Here have sumary info about your team performance end basic information"
				/>

				<div className="grid grid-cols-2 gap-4 mt-4">
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<Calendar className="h-5 w-5 text-muted-foreground" />
							<div className="flex items-center space-x-2">
								<Label className="mr-1">Founded Date:</Label>
								<EditableInput
									type="date"
									initialValue={team?.founded ? formatDate(team?.founded) : ""}
									onSave={(value) => handleSaveInfo("founded", value)}
								/>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<div className="flex items-center space-x-2">
								<Label className="mr-1">Home Ground:</Label>
								<EditableInput
									initialValue={team?.homeGround || ""}
									onSave={(value) => handleSaveInfo("homeGround", value)}
								/>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Users className="h-5 w-5 text-muted-foreground" />
							<div className="flex items-center space-x-2">
								<Label className="mr-1">Manager:</Label>
								<EditableInput
									initialValue={team?.manager || ""}
									onSave={(value) => handleSaveInfo("manager", value)}
								/>
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<div className="flex items-center justify-start space-x-2">
							<span>Rank Position:</span>
							<span className="font-bold">{teamData.position}rd</span>
						</div>
						<div className="flex items-center justify-start space-x-2">
							<span>Matches Played:</span>
							<Counter className="text-md" targetValue={teamData.played} />
						</div>
						<div className="flex items-center justify-start space-x-2">
							<span>Goal Difference:</span>
							<span className="font-bold">{teamData.goalsFor - teamData.goalsAgainst}</span>
						</div>
					</div>
				</div>
				<div className="mt-6">
					<h3 className="text-lg font-semibold mb-2">Season Performance</h3>
					<div className="space-y-2">
						<div className="flex items-center">
							<span className="w-20">Won:</span>
							<Progress value={(teamData.won / teamData.played) * 100} className="flex-1" />
							<span className="ml-2 w-10 text-right">{teamData.won}</span>
						</div>
						<div className="flex items-center">
							<span className="w-20">Drawn:</span>
							<Progress color="warning" value={(teamData.drawn / teamData.played) * 100} className="flex-1" />
							<span className="ml-2 w-10 text-right">{teamData.drawn}</span>
						</div>
						<div className="flex items-center">
							<span className="w-20">Lost:</span>
							<Progress color="error" value={(teamData.lost / teamData.played) * 100} className="flex-1" />
							<span className="ml-2 w-10 text-right">{teamData.lost}</span>
						</div>
					</div>
				</div>
			</TabsContent>
			<TabsContent value="players" className="px-4 space-y-4">
				<HeaderTitle title="Players" description="Here contens your players that have into you team" />
				<PlayersList />
			</TabsContent>
			<TabsContent value="achievements">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{teamData.cups.map((cup, index) => (
						<Card key={index}>
							<CardHeader className="flex flex-row items-center space-x-4 pb-2">
								<Avatar>
									<AvatarImage src={cup.image} alt={cup.name} />
									<AvatarFallback>
										<Trophy />
									</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle>{cup.name}</CardTitle>
									<CardDescription>{cup.year}</CardDescription>
								</div>
							</CardHeader>
						</Card>
					))}
				</div>
			</TabsContent>
			<TabsContent value="fixtures">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Opponent</TableHead>
							<TableHead>Venue</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{teamData.upcomingMatches.map((match, index) => (
							<TableRow key={index}>
								<TableCell>{match.date}</TableCell>
								<TableCell>{match.opponent}</TableCell>
								<TableCell>{match.venue}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TabsContent>
			<TabsContent value="notifications">
				<NotificationCenter className="max-w-full border-none" />
			</TabsContent>
		</Tabs>
	);
};

const HeaderTitle = ({ title, description }) => (
	<div className="mt-4 text-center">
		<h1 className="text-2xl">{title}</h1>
		<p className="text-gray-400 italic">{description}</p>
	</div>
);
