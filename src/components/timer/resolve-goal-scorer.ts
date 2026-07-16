import type { Player } from "./types";

export type GoalScorerSelection =
  | { kind: "player"; playerId: string }
  | { kind: "unassigned" }
  | null;

interface ResolveGoalScorerInput {
  draft: string;
  selection: GoalScorerSelection;
  players: Player[];
}

export type GoalScorerResolution =
  | { type: "blocked" }
  | { type: "select-existing"; playerId: string }
  | { type: "create-and-select"; name: string }
  | { type: "confirm"; playerId: string };

function normalizePlayerName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

export function resolveGoalScorer({
  draft,
  selection,
  players,
}: ResolveGoalScorerInput): GoalScorerResolution {
  const name = draft.trim();

  if (name) {
    const existingPlayer = players.find(
      player => normalizePlayerName(player.name) === normalizePlayerName(name),
    );

    if (existingPlayer) {
      return { type: "select-existing", playerId: existingPlayer.id };
    }

    return { type: "create-and-select", name };
  }

  if (selection?.kind === "player") {
    return { type: "confirm", playerId: selection.playerId };
  }

  if (selection?.kind === "unassigned") {
    return { type: "confirm", playerId: "" };
  }

  return { type: "blocked" };
}
