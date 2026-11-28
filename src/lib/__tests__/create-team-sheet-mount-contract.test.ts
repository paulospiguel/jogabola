import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The dashboard switches branch (empty state → skeleton → main view) when the
 * first team is created and becomes active. CreateTeamSheet must be the first
 * child of every branch's root fragment so React keeps the same instance and
 * its post-create athlete prompt state. No DOM test environment exists, so
 * this guards the structure at source level.
 */
const source = readFileSync(
  resolve(
    __dirname,
    "../../app/(mobile)/(protected)/arena/_components/arena-dashboard.tsx",
  ),
  "utf8",
);

describe("arena dashboard CreateTeamSheet mount", () => {
  it("creates the sheet element in exactly one place", () => {
    expect(source.match(/<CreateTeamSheet\b/g)).toHaveLength(1);
  });

  it("renders it first in each branch's root fragment", () => {
    const branchReturns = source.match(/return \(\s*<>\s*\{createTeamSheet\}/g);
    expect(branchReturns).toHaveLength(3);
    expect(source).not.toMatch(/return <DashboardSkeleton \/>/);
  });
});
