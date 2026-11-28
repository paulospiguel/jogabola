import { PLAN_LIMITS, type PlanTier } from "@/constants/plans";

export type EvolutionNodeId =
  | "roster"
  | "callup"
  | "split"
  | "payments"
  | "chat"
  | "history"
  | "multiteam"
  | "fixtures"
  | "staff"
  | "secretary"
  | "governance";

export type EvolutionLayerKey = "core" | "routine" | "club" | "ai";

export type EvolutionAccent = "primary" | "info" | "highlight";

export interface EvolutionNodeSpec {
  id: EvolutionNodeId;
  stageIndex: 0 | 1 | 2 | 3;
  layerKey: EvolutionLayerKey;
  accent: EvolutionAccent;
  icon:
    | "users"
    | "calendarCheck"
    | "wallet"
    | "receipt"
    | "messageSquare"
    | "barChart"
    | "layers"
    | "trophy"
    | "userCog"
    | "bot"
    | "shieldCheck";
}

export interface EvolutionEdgeSpec {
  id: string;
  from: EvolutionNodeId;
  to: EvolutionNodeId;
  orientation?: "vertical" | "horizontal";
}

export interface EvolutionLayerSpec {
  stageIndex: 0 | 1 | 2 | 3;
  key: EvolutionLayerKey;
  code: string;
  accent: EvolutionAccent;
  nodes: EvolutionNodeSpec[];
}

export interface StageTelemetrySpec {
  planTier: PlanTier;
  maxTeams: number;
  maxPlayersPerTeam: number;
  maxEventsPerMonth: number;
  aiModeKey: "manual" | "alerts" | "secretary" | "fullOs";
  humanControlPercent: 100;
}

export const EVOLUTION_NODES: readonly EvolutionNodeSpec[] = [
  // Stage 01 — Core
  {
    id: "roster",
    stageIndex: 0,
    layerKey: "core",
    accent: "primary",
    icon: "users",
  },
  {
    id: "callup",
    stageIndex: 0,
    layerKey: "core",
    accent: "primary",
    icon: "calendarCheck",
  },
  {
    id: "split",
    stageIndex: 0,
    layerKey: "core",
    accent: "primary",
    icon: "wallet",
  },
  // Stage 02 — Routine & Finance
  {
    id: "history",
    stageIndex: 1,
    layerKey: "routine",
    accent: "info",
    icon: "barChart",
  },
  {
    id: "chat",
    stageIndex: 1,
    layerKey: "routine",
    accent: "info",
    icon: "messageSquare",
  },
  {
    id: "payments",
    stageIndex: 1,
    layerKey: "routine",
    accent: "info",
    icon: "receipt",
  },
  // Stage 03 — Structured Club
  {
    id: "multiteam",
    stageIndex: 2,
    layerKey: "club",
    accent: "primary",
    icon: "layers",
  },
  {
    id: "fixtures",
    stageIndex: 2,
    layerKey: "club",
    accent: "primary",
    icon: "trophy",
  },
  {
    id: "staff",
    stageIndex: 2,
    layerKey: "club",
    accent: "primary",
    icon: "userCog",
  },
  // Stage 04 — AI Club OS
  {
    id: "secretary",
    stageIndex: 3,
    layerKey: "ai",
    accent: "highlight",
    icon: "bot",
  },
  {
    id: "governance",
    stageIndex: 3,
    layerKey: "ai",
    accent: "highlight",
    icon: "shieldCheck",
  },
] as const;

export const EVOLUTION_LAYERS: readonly EvolutionLayerSpec[] = [
  {
    stageIndex: 0,
    key: "core",
    code: "01",
    accent: "primary",
    nodes: EVOLUTION_NODES.filter(node => node.stageIndex === 0),
  },
  {
    stageIndex: 1,
    key: "routine",
    code: "02",
    accent: "info",
    nodes: EVOLUTION_NODES.filter(node => node.stageIndex === 1),
  },
  {
    stageIndex: 2,
    key: "club",
    code: "03",
    accent: "primary",
    nodes: EVOLUTION_NODES.filter(node => node.stageIndex === 2),
  },
  {
    stageIndex: 3,
    key: "ai",
    code: "04",
    accent: "highlight",
    nodes: EVOLUTION_NODES.filter(node => node.stageIndex === 3),
  },
] as const;

export const EVOLUTION_EDGES: readonly EvolutionEdgeSpec[] = [
  // Stage 1 -> Stage 2
  { id: "roster-history", from: "roster", to: "history" },
  { id: "callup-history", from: "callup", to: "history" },
  { id: "callup-chat", from: "callup", to: "chat" },
  { id: "split-payments", from: "split", to: "payments" },
  // Stage 2 -> Stage 3
  { id: "history-multiteam", from: "history", to: "multiteam" },
  { id: "chat-fixtures", from: "chat", to: "fixtures" },
  { id: "history-fixtures", from: "history", to: "fixtures" },
  { id: "payments-staff", from: "payments", to: "staff" },
  // Stage 3 -> Stage 4
  { id: "fixtures-secretary", from: "fixtures", to: "secretary" },
  { id: "staff-secretary", from: "staff", to: "secretary" },
  { id: "multiteam-governance", from: "multiteam", to: "governance" },
  { id: "staff-governance", from: "staff", to: "governance" },
  {
    id: "secretary-governance",
    from: "secretary",
    to: "governance",
    orientation: "horizontal",
  },
] as const;

const DEFAULT_STAGE_NODES: readonly EvolutionNodeId[] = [
  "callup",
  "payments",
  "fixtures",
  "secretary",
] as const;

export const STAGE_UNLOCK_NODES: readonly (readonly EvolutionNodeId[])[] = [
  ["roster", "callup", "split", "callup"],
  ["payments", "payments", "chat", "history"],
  ["multiteam", "fixtures", "staff", "secretary"],
  ["governance", "secretary", "history", "governance"],
] as const;

const STAGE_PLAN_TIERS: readonly {
  tier: PlanTier;
  aiModeKey: StageTelemetrySpec["aiModeKey"];
}[] = [
  { tier: "free", aiModeKey: "manual" },
  { tier: "basic", aiModeKey: "alerts" },
  { tier: "amateur", aiModeKey: "secretary" },
  { tier: "pro", aiModeKey: "fullOs" },
] as const;

export function getNodeById(id: EvolutionNodeId): EvolutionNodeSpec {
  const found = EVOLUTION_NODES.find(node => node.id === id);
  if (!found) {
    throw new Error(`Unknown evolution node: ${id}`);
  }
  return found;
}

export function getDefaultNodeForStage(stageIndex: number): EvolutionNodeId {
  const clamped = Math.min(Math.max(stageIndex, 0), 3);
  return DEFAULT_STAGE_NODES[clamped] ?? "callup";
}

export function getNodeConnections(nodeId: EvolutionNodeId): {
  upstream: EvolutionNodeId[];
  downstream: EvolutionNodeId[];
  edgeIds: Set<string>;
} {
  const upstream: EvolutionNodeId[] = [];
  const downstream: EvolutionNodeId[] = [];
  const edgeIds = new Set<string>();

  for (const edge of EVOLUTION_EDGES) {
    if (edge.to === nodeId) {
      upstream.push(edge.from);
      edgeIds.add(edge.id);
    }
    if (edge.from === nodeId) {
      downstream.push(edge.to);
      edgeIds.add(edge.id);
    }
  }

  return { upstream, downstream, edgeIds };
}

export function getStageTelemetry(stageIndex: number): StageTelemetrySpec {
  const clamped = Math.min(Math.max(stageIndex, 0), 3);
  const config = STAGE_PLAN_TIERS[clamped] ?? STAGE_PLAN_TIERS[0];
  const limits = PLAN_LIMITS[config.tier];

  return {
    planTier: config.tier,
    maxTeams: limits.maxTeams,
    maxPlayersPerTeam: limits.maxPlayersPerTeam,
    maxEventsPerMonth: limits.maxEventsPerMonth,
    aiModeKey: config.aiModeKey,
    humanControlPercent: 100,
  };
}
