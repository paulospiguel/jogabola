"use client";

import type { Team } from "@repo/db";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

import telegram from "@/components/icons/telegram.svg";
import whatsapp from "@/components/icons/whatsapp.svg";
import email from "@/components/icons/email.svg";
import { Copy, Shapes, Sparkles } 
import Image from "next/image";

type InviteModalProps = {
  triggerComponent: React.ReactNode;
  team: Partial<Team> | undefined;
};

export default function InviteModal({
  triggerComponent,
  team,
}: InviteModalProps) {
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
          <DialogDescription>
            Enter the details of the new player below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="items-center space-y-2">
            <Label htmlFor="name" className="text-right">
              Player Identifier
            </Label>
            <Input
              id="playerIdentifier"
              value={playerIdentifier}
              onChange={e => setPlayerIdentifier(e.target.value)}
              className="col-span-3 rounded-lg"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button onClick={handleInvitePlayer}>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate invite
          </Button>
          <div className="flex items-center space-x-2 opacity-50">
            <Copy className="h-6 w-6" />
            <Image alt="" src={telegram} className="h-6 w-6" />
            <Image alt="" src={whatsapp} className="h-6 w-6" />
            <Image alt="" src={email} className="h-6 w-6" />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
2;
