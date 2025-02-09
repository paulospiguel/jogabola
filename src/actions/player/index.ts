"use server";

import db from "@/lib/db";
import type { PlayerCreateInput } from "@/types";

export const createNewPlayer = async (inputs: PlayerCreateInput) => {
  const newPlayer = await db.player.create({
    data: inputs,
  });

  return newPlayer.id;
};

export const getPlayersByUserId = async (userId: string) => {
  const players = await db.player.findMany();

  return players;
};
