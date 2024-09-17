"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Progress } from "@repo/ui/components/progress";
import { Trophy, UserPlus, Pencil, Trash2, Star, Calendar, MapPin, Users, Award, Table } from "@repo/ui/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/card";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { getTeamInfo } from "@/actions";
import { useAction } from "next-safe-action/hooks";

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
	const [editMode, setEditMode] = useState(false);
	const [newPlayerName, setNewPlayerName] = useState("");
	const [newPlayerPosition, setNewPlayerPosition] = useState("");
	const [newPlayerNumber, setNewPlayerNumber] = useState("");

	const { result } = useAction(getTeamInfo, {
		executeOnMount: {
			input: {
				teamSlug: params.slug,
			},
		},
	});

	const teamInfo = result?.data;

	const handleEditTeam = () => {
		setEditMode(true);
	};

	const handleSaveTeam = () => {
		setEditMode(false);
		// In a real application, you would save the changes to the backend here
	};

	const handleDeleteTeam = () => {
		// In a real application, you would delete the team from the backend here
		alert("Team deleted successfully!");
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

	return (
		<div className="container mx-auto p-6 space-y-8">
			<Card className="w-full">
				<CardHeader className="flex flex-row items-center space-x-4 pb-2">
					<Avatar className="h-20 w-20">
						<AvatarImage src={teamInfo?.logo || ""} alt={teamInfo?.name} />
						<AvatarFallback>{teamInfo?.name.slice(0, 2)?.toUpperCase()}</AvatarFallback>
					</Avatar>
					<div>
						<CardTitle className="text-3xl font-bold">{teamInfo?.name}</CardTitle>
						<CardDescription className="text-xl">{teamInfo?.location}</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="overview" className="w-full">
						<TabsList className="grid w-full grid-cols-4 bg-primary">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="players">Players</TabsTrigger>
							<TabsTrigger value="achievements">Achievements</TabsTrigger>
							<TabsTrigger value="fixtures">Fixtures</TabsTrigger>
						</TabsList>
						<TabsContent value="overview" className="space-y-4">
							<div className="grid grid-cols-2 gap-4 mt-4">
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<Calendar className="h-5 w-5 text-muted-foreground" />
										<span>Founded: {teamInfo?.founded?.toDateString()}</span>
									</div>
									<div className="flex items-center space-x-2">
										<MapPin className="h-5 w-5 text-muted-foreground" />
										<span>Home Ground: {teamData.homeGround}</span>
									</div>
									<div className="flex items-center space-x-2">
										<Users className="h-5 w-5 text-muted-foreground" />
										<span>Manager: {teamData.manager}</span>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span>League Position:</span>
										<span className="font-bold">{teamData.position}rd</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Matches Played:</span>
										<span className="font-bold">{teamData.played}</span>
									</div>
									<div className="flex items-center justify-between">
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
										<Progress value={(teamData.drawn / teamData.played) * 100} className="flex-1" />
										<span className="ml-2 w-10 text-right">{teamData.drawn}</span>
									</div>
									<div className="flex items-center">
										<span className="w-20">Lost:</span>
										<Progress value={(teamData.lost / teamData.played) * 100} className="flex-1" />
										<span className="ml-2 w-10 text-right">{teamData.lost}</span>
									</div>
								</div>
							</div>
						</TabsContent>
						<TabsContent value="players">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Player</TableHead>
										<TableHead>Position</TableHead>
										<TableHead>Number</TableHead>
										<TableHead>Nationality</TableHead>
										<TableHead>Age</TableHead>
										<TableHead>Appearances</TableHead>
										<TableHead>Goals</TableHead>
										<TableHead>Assists</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{teamData.players.map((player) => (
										<TableRow key={player.id}>
											<TableCell className="font-medium">
												<div className="flex items-center space-x-2">
													<Avatar className="h-8 w-8">
														<AvatarImage src={player.image} alt={player.name} />
														<AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
													</Avatar>
													<span>{player.name}</span>
												</div>
											</TableCell>
											<TableCell>{player.position}</TableCell>
											<TableCell>{player.number}</TableCell>
											<TableCell>{player.nationality}</TableCell>
											<TableCell>{player.age}</TableCell>
											<TableCell>{player.appearances}</TableCell>
											<TableCell>{player.goals}</TableCell>
											<TableCell>{player.assists}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
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
					</Tabs>
				</CardContent>
				<CardFooter className="flex justify-between">
					<div className="space-x-2">
						{editMode ? (
							<Button onClick={handleSaveTeam}>Save Changes</Button>
						) : (
							<Button onClick={handleEditTeam}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit Team
							</Button>
						)}
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">
									<UserPlus className="mr-2 h-4 w-4" />
									Invite Player
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Invite New Player</DialogTitle>
									<DialogDescription>Enter the details of the new player below.</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="name" className="text-right">
											Name
										</Label>
										<Input
											id="name"
											value={newPlayerName}
											onChange={(e) => setNewPlayerName(e.target.value)}
											className="col-span-3"
										/>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="position" className="text-right">
											Position
										</Label>
										<Input
											id="position"
											value={newPlayerPosition}
											onChange={(e) => setNewPlayerPosition(e.target.value)}
											className="col-span-3"
										/>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="number" className="text-right">
											Number
										</Label>
										<Input
											id="number"
											type="number"
											value={newPlayerNumber}
											onChange={(e) => setNewPlayerNumber(e.target.value)}
											className="col-span-3"
										/>
									</div>
								</div>
								<DialogFooter>
									<Button onClick={handleInvitePlayer}>Invite Player</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Team
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete your team and remove all data from our
									servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleDeleteTeam}>Delete Team</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardFooter>
			</Card>
		</div>
	);
}
