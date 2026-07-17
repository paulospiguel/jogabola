import { readFileSync } from "node:fs";
import path from "node:path";
import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { passkey } from "@/db/schema";

describe("passkey database contract", () => {
  it("persists the authenticator AAGUID returned by Better Auth", () => {
    const columns = getTableColumns(passkey);

    expect(columns).toHaveProperty("aaguid");
  });

  it("includes a migration for the AAGUID column", () => {
    const migration = readFileSync(
      path.join(
        process.cwd(),
        "src/db/migrations/0026_passkey_authenticator_aaguid.sql",
      ),
      "utf8",
    );

    expect(migration).toContain(
      'ALTER TABLE "passkey" ADD COLUMN IF NOT EXISTS "aaguid" text',
    );
  });
});
