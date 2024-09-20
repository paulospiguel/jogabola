"use client";

import type { Team } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useState } from "react";

type InviteModalProps = {
	triggerComponent: React.ReactNode;
	team: Partial<Team> | undefined;
};

export default function InviteModal({ triggerComponent, team }: InviteModalProps) {
	const [playerIdentifier, setPlayerIdentifier] = useState("");

	const handleInvitePlayer = () => {
		// Add player to team
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{triggerComponent}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite New Player to {team?.name}</DialogTitle>
					<DialogDescription>Enter the details of the new player below.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="items-center space-y-2">
						<Label htmlFor="name" className="text-right">
							Player Identifier
						</Label>
						<Input
							id="playerIdentifier"
							value={playerIdentifier}
							onChange={(e) => setPlayerIdentifier(e.target.value)}
							className="col-span-3 rounded-lg"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={handleInvitePlayer}>Sent invite</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
2;
