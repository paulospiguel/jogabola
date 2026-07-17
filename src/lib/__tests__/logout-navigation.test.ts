import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const profileMenuSource = readFileSync(
  path.join(
    process.cwd(),
    "src/app/(mobile)/(protected)/arena/profile/_components/profile-menu.tsx",
  ),
  "utf8",
);

describe("logout navigation contract", () => {
  it("signs out from the profile menu before returning home", () => {
    expect(profileMenuSource).not.toContain("/auth/sign-out");
    expect(profileMenuSource).toMatch(
      /await signOut\(\);[\s\S]*window\.location\.href = "\/"/,
    );
  });
});
