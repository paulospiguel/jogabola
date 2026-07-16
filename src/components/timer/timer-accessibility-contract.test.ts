import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readTimerSource(fileName: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), "src/components/timer", fileName),
    "utf8",
  );
}

describe("timer accessibility contract", () => {
  it("exposes player selection state and 44px player targets", () => {
    const source = readTimerSource("player-picker.tsx");

    expect(source).toContain("aria-pressed={active}");
    expect(source).toContain("min-h-11");
  });

  it("gives team actions distinct translated names and 44px targets", () => {
    const source = readTimerSource("match-controls.tsx");

    expect(source).toContain(
      'aria-label={t("logGoalForTeam", { team: team.name })}',
    );
    expect(source).toContain(
      'aria-label={t("logCardForTeam", { team: team.name })}',
    );
    expect(source).toContain("min-h-11");
    expect(source).toContain("min-w-11");
  });

  it("keeps the timeline remove command at least 44px and press-responsive", () => {
    const source = readTimerSource("event-timeline.tsx");

    expect(source).toContain("press grid size-11");
  });
});
