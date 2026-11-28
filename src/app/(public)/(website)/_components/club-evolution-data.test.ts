import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PLAN_LIMITS } from "@/constants/plans";
import {
  EVOLUTION_EDGES,
  EVOLUTION_LAYERS,
  EVOLUTION_NODES,
  getDefaultNodeForStage,
  getNodeById,
  getNodeConnections,
  getStageTelemetry,
  STAGE_UNLOCK_NODES,
} from "./club-evolution-data";

const projectRoot = resolve(__dirname, "../../../../..");

function collectLeafKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) =>
      collectLeafKeys(child, prefix ? `${prefix}.${key}` : key),
    )
    .sort();
}

describe("club evolution map topology & telemetry", () => {
  it("groups all 11 modules across the 4 progressive club layers", () => {
    expect(EVOLUTION_LAYERS).toHaveLength(4);
    const layeredIds = EVOLUTION_LAYERS.flatMap(layer =>
      layer.nodes.map(node => node.id),
    );
    expect(layeredIds).toEqual(EVOLUTION_NODES.map(node => node.id));
    expect(EVOLUTION_NODES).toHaveLength(11);
  });

  it("keeps every architectural edge valid and flowing forward or laterally", () => {
    for (const edge of EVOLUTION_EDGES) {
      const from = getNodeById(edge.from);
      const to = getNodeById(edge.to);
      expect(from.stageIndex).toBeLessThanOrEqual(to.stageIndex);
    }
  });

  it("resolves upstream and downstream connections for interactive signal tracing", () => {
    const secretary = getNodeConnections("secretary");
    expect(secretary.upstream).toEqual(["fixtures", "staff"]);
    expect(secretary.downstream).toEqual(["governance"]);
    expect(secretary.edgeIds.size).toBe(3);

    for (let stage = 0; stage < 4; stage++) {
      expect(getNodeById(getDefaultNodeForStage(stage)).stageIndex).toBe(stage);
      for (const unlockNodeId of STAGE_UNLOCK_NODES[stage]) {
        expect(() => getNodeById(unlockNodeId)).not.toThrow();
      }
    }
  });

  it("derives live stage telemetry directly from PLAN_LIMITS with 100% human control", () => {
    expect(getStageTelemetry(0)).toMatchObject({
      planTier: "free",
      maxTeams: PLAN_LIMITS.free.maxTeams,
      maxPlayersPerTeam: PLAN_LIMITS.free.maxPlayersPerTeam,
      humanControlPercent: 100,
    });
    expect(getStageTelemetry(1)).toMatchObject({
      planTier: "basic",
      maxTeams: PLAN_LIMITS.basic.maxTeams,
      maxPlayersPerTeam: PLAN_LIMITS.basic.maxPlayersPerTeam,
      humanControlPercent: 100,
    });
    expect(getStageTelemetry(2)).toMatchObject({
      planTier: "amateur",
      maxTeams: PLAN_LIMITS.amateur.maxTeams,
      maxPlayersPerTeam: PLAN_LIMITS.amateur.maxPlayersPerTeam,
      humanControlPercent: 100,
    });
    expect(getStageTelemetry(3)).toMatchObject({
      planTier: "pro",
      maxTeams: PLAN_LIMITS.pro.maxTeams,
      maxPlayersPerTeam: PLAN_LIMITS.pro.maxPlayersPerTeam,
      humanControlPercent: 100,
    });
  });

  it("keeps homePage.evolution.map keys synchronized across pt, en, es, and fr", () => {
    const locales = ["pt", "en", "es", "fr"].map(code => {
      const raw = readFileSync(
        resolve(projectRoot, `src/locales/${code}.json`),
        "utf8",
      );
      const parsed = JSON.parse(raw) as {
        homePage: { evolution: { map: Record<string, unknown> } };
      };
      return { code, map: parsed.homePage.evolution.map };
    });

    const baseKeys = collectLeafKeys(locales[0].map);
    expect(baseKeys.length).toBeGreaterThan(40);

    for (const locale of locales.slice(1)) {
      expect(collectLeafKeys(locale.map)).toEqual(baseKeys);
    }

    for (const node of EVOLUTION_NODES) {
      for (const locale of locales) {
        const nodes = locale.map.nodes as Record<string, unknown>;
        expect(nodes[node.id]).toBeDefined();
      }
    }
  });
});
