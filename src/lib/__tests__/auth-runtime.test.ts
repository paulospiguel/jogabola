import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { type ComponentType, createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import packageJson from "../../../package.json";

const authSource = readFileSync(
  path.join(process.cwd(), "src/lib/auth.ts"),
  "utf8",
);
const authErrorSource = authSource.slice(
  authSource.indexOf("onAPIError:"),
  authSource.indexOf("baseURL:"),
);
const authPageSource = readFileSync(
  path.join(process.cwd(), "src/app/(mobile)/auth/page.tsx"),
  "utf8",
);
const appVersionComponentPath = path.join(
  process.cwd(),
  "src/app/(mobile)/auth/_components/app-version.tsx",
);

describe("auth runtime contract", () => {
  const originalPublicVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const originalServerVersion = process.env.VERSION;

  afterEach(() => {
    if (originalPublicVersion === undefined) {
      delete process.env.NEXT_PUBLIC_APP_VERSION;
    } else {
      process.env.NEXT_PUBLIC_APP_VERSION = originalPublicVersion;
    }
    if (originalServerVersion === undefined) {
      delete process.env.VERSION;
    } else {
      process.env.VERSION = originalServerVersion;
    }
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("uses the public application version when configured", async () => {
    process.env.NEXT_PUBLIC_APP_VERSION = "9.8.7";
    vi.resetModules();

    const { APP } = await import("@/constants/app");

    expect(APP.VERSION).toBe("9.8.7");
  });

  it("falls back to the package version without a server-only variable", async () => {
    delete process.env.NEXT_PUBLIC_APP_VERSION;
    vi.resetModules();

    const { APP } = await import("@/constants/app");

    expect(APP.VERSION).toBe(packageJson.version);
    expect(
      readFileSync(path.join(process.cwd(), "src/constants/app.ts"), "utf8"),
    ).not.toContain("process.env.VERSION");
  });

  it("renders identical auth version markup on the server and client", async () => {
    expect(existsSync(appVersionComponentPath)).toBe(true);
    expect(authPageSource).toContain("<AppVersion");
    if (!existsSync(appVersionComponentPath)) return;

    delete process.env.NEXT_PUBLIC_APP_VERSION;
    process.env.VERSION = "server-only-release";
    vi.resetModules();
    const { APP: serverApp } = await import("@/constants/app");

    delete process.env.VERSION;
    vi.resetModules();
    const { APP: clientApp } = await import("@/constants/app");
    const componentModule = await vi.importActual<Record<string, unknown>>(
      "@/app/(mobile)/auth/_components/app-version",
    );
    const AppVersion = Reflect.get(
      componentModule,
      "AppVersion",
    ) as ComponentType<{
      label: string;
      version: string;
    }>;
    const label = "Construído para campeões";

    const serverMarkup = renderToString(
      createElement(AppVersion, { label, version: serverApp.VERSION }),
    );
    const clientMarkup = renderToString(
      createElement(AppVersion, { label, version: clientApp.VERSION }),
    );

    expect(serverMarkup).toBe(clientMarkup);
    expect(serverMarkup).toContain(`v${packageJson.version}`);
  });

  it("delegates API errors without request metadata", () => {
    expect(authErrorSource).toContain("logAuthErrorSafely(error)");
    expect(authErrorSource).not.toContain("getRequestMethodSafely");
    expect(authErrorSource).not.toContain("method");
    expect(authSource).not.toMatch(/from ["'](?:node:)?fs["']/);
    expect(authSource).not.toContain("appendFileSync");
    expect(authSource).not.toContain("auth-error.log");
    expect(authErrorSource).not.toContain("request?.url");
    expect(authErrorSource).not.toContain("error.stack");
    expect(authErrorSource).not.toContain("error.message");
    expect(authErrorSource).not.toMatch(/headers|body|email/);
  });

  it("logs the exact safe shape without error details or PII", async () => {
    const loggerModule = await import("@/lib/auth-error-logger");
    expect(loggerModule).toHaveProperty("logAuthErrorSafely");

    const logger: unknown = Reflect.get(loggerModule, "logAuthErrorSafely");
    expect(logger).toBeTypeOf("function");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = Object.assign(new Error("user@example.com"), {
      method: "POST",
      url: "https://example.com/auth?email=user@example.com",
    });

    Reflect.apply(logger as (...args: unknown[]) => unknown, undefined, [
      error,
    ]);

    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith("[auth] request failed", {
      error: { name: "Error" },
    });
  });

  it("does not expose unused password authentication", () => {
    expect(authSource).not.toContain("emailAndPassword");
  });
});
