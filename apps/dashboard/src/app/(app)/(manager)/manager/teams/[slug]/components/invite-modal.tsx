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

import telegram from "@repo/ui/icons/telegram.svg";
import whatsapp from "@repo/ui/icons/whatsapp.svg";
import email from "@repo/ui/icons/email.svg";
import { Copy, Shapes, Sparkles } from "@repo/ui/icons";
import Image from "next/image";

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
				<DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
					<Button onClick={handleInvitePlayer}>
						<Sparkles className="w-5 h-5 mr-2" />
						Generate invite
					</Button>
					<div className="flex items-center space-x-2 opacity-50">
						<Copy className="w-6 h-6" />
						<Image alt="" src={telegram} className="w-6 h-6" />
						<Image alt="" src={whatsapp} className="w-6 h-6" />
						<Image alt="" src={email} className="w-6 h-6" />
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
2;
