"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import noLogo from "@/assets/images/no-logo.png";
import { Edit, GlobeIcon, LockIcon, Trash, TrendingDown, TrendingUp, Eye as ViewIcon } from "@repo/ui/icons";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import type { Team } from "@/types";
import { teamStore } from "@/store/team.store";
import PlayerAvatarList from "../player-avatar-list";

type TeamTableProps = {
	teams: Team[];
};

export default function TeamsTable({ teams }: TeamTableProps) {
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [newTeamName, setNewTeamName] = useState("");
	const { push } = useRouter();

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

	const calculatePerformance = useMemo(() => {
		return {
			average: 6.5,
			increase: true,
		};
	}, []);

	useEffect(() => {
		teamStore.setState((state) => ({ ...state, createdTeamCounter: teams?.length || 0 }));
	}, [teams]);

	return (
		<div className="overflow-x-auto">
			{teams?.map((team) => (
				<div
					key={team?.id}
					className="shadow-sm rounded-2xl p-2 bg-white mb-2 gap-2 grid grid-cols-12 place-content-stretch transition-colors hover:bg-slate-300"
				>
					<div className=" flex items-center">
						<Image className="object-cover rounded-xl" src={team?.logo || noLogo} alt="" width={58} height={58} />
					</div>

					<div className=" flex items-center"> {team?.name}</div>
					<div className=" flex items-center"> {"0/0/0"}</div>
					<div className=" flex items-center"> {team?.name}</div>
					<div className=" flex items-center"> {team?.name}</div>
					<div className=" flex items-center"> {team?.name}</div>
					<div className=" flex items-center"> {team?.name}</div>
					<div className=" flex items-center"> {team?.name}</div>
					<div className=" flex items-center"> {team?.name}</div>
					<div className=" flex items-center"> {team?.name}</div>
					<div className=" flex items-center"> {team?.name}</div>

					<div className="border-l-2 flex items-center justify-end">
						<Button variant="ghost" onClick={() => handleOpenTeam(team?.id || "")}>
							<Edit className="w-5 h-5" />
						</Button>
						<Button variant="ghost" className="">
							<Trash className="w-5 h-5" />
						</Button>
					</div>
				</div>
			))}
		</div>
	);
}
