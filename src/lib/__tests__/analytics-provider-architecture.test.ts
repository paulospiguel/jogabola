import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("AnalyticsProvider architecture", () => {
  it("keeps the application subtree stable while analytics toggles", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/providers/analytics.tsx"),
      "utf8",
    );

    expect(source).not.toContain("StatsigClientProvider");
    expect(source).not.toContain("<StatsigProvider");
    expect(source).toMatch(
      /<AnalyticsConsentContext\.Provider[^>]*>[\s\S]*\{children\}[\s\S]*<StatsigRuntime/,
    );
  });
});
