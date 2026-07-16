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
    expect(source).toContain("hasActivatedAnalytics");
    expect(source).toMatch(
      /\{hasActivatedAnalytics && hasClientKey \? \([\s\S]*<StatsigRuntime[\s\S]*enabled=\{analyticsAllowed\}/,
    );
  });

  it("does not attach automatic capture or session replay plugins", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/providers/analytics.tsx"),
      "utf8",
    );
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };

    expect(source).not.toContain("StatsigAutoCapturePlugin");
    expect(source).not.toContain("StatsigSessionReplayPlugin");
    expect(source).not.toMatch(/plugins\s*:/);
    expect(packageJson.dependencies).not.toHaveProperty(
      "@statsig/web-analytics",
    );
    expect(packageJson.dependencies).not.toHaveProperty(
      "@statsig/session-replay",
    );
  });
});
