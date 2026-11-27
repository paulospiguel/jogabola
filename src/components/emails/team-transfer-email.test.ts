import { render } from "@react-email/components";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { APP_URL } from "./base/email-layout";
import { TeamTransferEmail } from "./team-transfer-email";

describe("TeamTransferEmail", () => {
  it("renders team, sender, expiry and the CTA link", async () => {
    const html = await render(
      React.createElement(TeamTransferEmail, {
        teamName: "Os <Craques>",
        fromName: "João Silva",
        expiresAt: "4 de dezembro de 2026",
        token: "tok_123-abc",
      }),
    );

    expect(html).toContain(`href="${APP_URL}/transfer/tok_123-abc"`);
    expect(html).toContain("João Silva");
    expect(html).toContain("4 de dezembro de 2026");
    // React escapes user-provided names.
    expect(html).toContain("Os &lt;Craques&gt;");
    expect(html).not.toContain("Os <Craques>");
  });
});
