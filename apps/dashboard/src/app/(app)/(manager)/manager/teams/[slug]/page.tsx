"use client";

import { getTeamInfo, saveTeamInfo } from "@/actions";
import Counter from "@/components/counter";
import NotificationCenter from "@/components/notification-center";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/card";

import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ArrowLeft, Info, MoreHorizontal, Table, Trash2, Trophy, Users } from "@repo/ui/icons";
import { useAction } from "next-safe-action/hooks";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useState } from "react";
import InviteModal from "./components/invite-modal";
import { Button } from "@repo/ui/components/button";
import type { Team } from "@/types";
import { useRouter } from "next/navigation";
import { OverviewTabContent } from "./components/tabs-team/overview.tab";
import { PlayersTabContent } from "./components/tabs-team/players.tab";
import { AchievementsTabContent } from "./components/tabs-team/achievements.tab";
import routes from "@/constants/routes";
import { ShoesSoccer, PlayerIcon, StadiumIcon } from "@/components/icons";
import { cn } from "@repo/ui/lib/cn";

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

export default function TeamInfoPage({ params }: { params: { slug: string } }) {
	const [teamData, setTeamData] = useState(initialTeamData);
	const [newPlayerName, setNewPlayerName] = useState("");
	const [newPlayerPosition, setNewPlayerPosition] = useState("");
	const [newPlayerNumber, setNewPlayerNumber] = useState("");
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const router = useRouter();

	const { result } = useAction(getTeamInfo, {
		executeOnMount: {
			input: {
				teamSlug: params.slug,
			},
		},
	});

	const teamInfo = result?.data || ({} as Team);

	const optionsTabs = [
		{ value: "overview", label: "Overview", icon: StadiumIcon },
		{ value: "players", label: "Players", icon: PlayerIcon },
		{ value: "cups", label: "Cups", icon: Trophy },
		{ value: "matches", label: "Matches", icon: ShoesSoccer },
		{ value: "notifications", label: "Notifications", icon: Info },
	];

	// const handleSaveTeam = () => {
	// 	setEditMode(false);
	// 	// In a real application, you would save the changes to the backend here
	// };

	const handleDeleteTeam = () => {
		// In a real application, you would delete the team from the backend here
		setShowDeleteDialog(true);

		//	alert("Team deleted successfully!");
	};

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

	const backToTeams = () => {
		router.push(routes.manager.teams);
	};

	return (
		<div className="container mx-auto p-6 space-y-8">
			<h1 className="text-3xl font-bold">Team Info</h1>
			<Button variant="outline" className="w-min" onClick={backToTeams}>
				<ArrowLeft className="h-5 w-5" /> Back to Teams
				<span className="sr-only">Back to teams list</span>
			</Button>
			<Card className="w-full">
				<CardHeader className="flex flex-row items-center justify-between">
					<div className="flex flex-row items-center space-x-4 pb-2">
						<Avatar className="h-20 w-20">
							<AvatarImage src={teamInfo?.logo || ""} alt={teamInfo?.name} />
							<AvatarFallback>{teamInfo?.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle className="text-3xl font-bold">{teamInfo?.name}</CardTitle>
							<CardDescription className="text-xl">{teamInfo?.location}</CardDescription>
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon" className="rounded-full">
								<MoreHorizontal className="h-5 w-5" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{/* <DropdownMenuItem onClick={handleEditTeam}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit Team
							</DropdownMenuItem> */}
							<DropdownMenuItem className="text-red-500" onClick={handleDeleteTeam}>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Team
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="overview" className="w-full">
						<TabsList className={cn("grid w-full bg-primary", `grid-cols-${optionsTabs.length}`)}>
							{optionsTabs.map(({ icon: TabIcon, ...tab }) => (
								<TabsTrigger key={tab.value} value={tab.value}>
									{TabIcon && <TabIcon className="mr-2 h-5 w-5" />} {tab.label}
								</TabsTrigger>
							))}
						</TabsList>
						<TabsContent value="overview" className="space-y-4">
							<OverviewTabContent team={teamInfo} />
						</TabsContent>
						<TabsContent value="players">
							<PlayersTabContent team={teamInfo} />
						</TabsContent>
						{/* <TabsContent value="achievements">
							<AchievementsTabContent team={teamInfo} />
						</TabsContent> */}
						<TabsContent value="notifications">
							<NotificationCenter className="max-w-full border-none" />
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter className="flex justify-between">
					<InviteModal triggerComponent={<Button>Invite Player</Button>} team={teamInfo} />
				</CardFooter>
			</Card>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your team and remove all data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteTeam}>Delete Team</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
