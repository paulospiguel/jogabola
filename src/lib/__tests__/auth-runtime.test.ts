import { readFileSync } from "node:fs";
import path from "node:path";
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

describe("auth runtime contract", () => {
  const originalPublicVersion = process.env.NEXT_PUBLIC_APP_VERSION;

  afterEach(() => {
    if (originalPublicVersion === undefined) {
      delete process.env.NEXT_PUBLIC_APP_VERSION;
    } else {
      process.env.NEXT_PUBLIC_APP_VERSION = originalPublicVersion;
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
