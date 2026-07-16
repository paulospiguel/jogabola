import { describe, expect, it } from "vitest";
import { classifyErrorSafely } from "@/lib/safe-error";

describe("classifyErrorSafely", () => {
  it("returns only the error name for a standard Error", () => {
    const error = new Error("secret player name");
    Object.assign(error, {
      query: "select * from user",
      params: ["private-note"],
      cause: new Error("database credentials"),
    });

    const classification = classifyErrorSafely(error);

    expect(classification).toEqual({ name: "Error" });
    expect(JSON.stringify(classification)).not.toContain("secret player name");
    expect(JSON.stringify(classification)).not.toContain("select * from user");
    expect(JSON.stringify(classification)).not.toContain("private-note");
    expect(JSON.stringify(classification)).not.toContain(
      "database credentials",
    );
  });

  it.each(["token=secret", 42])("never includes an error code: %s", code => {
    const error = Object.assign(new Error("sensitive message"), { code });

    expect(classifyErrorSafely(error)).toEqual({ name: "Error" });
  });

  it("classifies a non-Error value without exposing its properties", () => {
    const error = {
      name: "ForgedError",
      code: "PRIVATE_CODE",
      message: "secret",
      query: "select private data",
      params: ["private"],
      cause: "private cause",
    };

    expect(classifyErrorSafely(error)).toEqual({ name: "UnknownError" });
  });

  it("ignores structured error codes", () => {
    const error = Object.assign(new Error("sensitive message"), {
      code: { internal: "secret" },
    });

    expect(classifyErrorSafely(error)).toEqual({ name: "Error" });
  });

  it("does not read a throwing code getter", () => {
    const error = new Error("sensitive message");
    Object.defineProperty(error, "code", {
      get() {
        throw new Error("sensitive getter failure");
      },
    });

    expect(classifyErrorSafely(error)).toEqual({ name: "Error" });
  });

  it("keeps classification non-throwing when reading the name fails", () => {
    const error = new Error("sensitive message");
    Object.defineProperty(error, "name", {
      get() {
        throw new Error("sensitive getter failure");
      },
    });

    expect(classifyErrorSafely(error)).toEqual({ name: "UnknownError" });
  });

  it("does not copy an arbitrary error name", () => {
    const error = Object.assign(new Error("sensitive message"), {
      name: "user@example.com",
      code: "token=secret",
    });

    const classification = classifyErrorSafely(error);

    expect(classification).toEqual({ name: "UnknownError" });
    expect(JSON.stringify(classification)).not.toContain("user@example.com");
    expect(JSON.stringify(classification)).not.toContain("token=secret");
  });

  it("classifies a revoked proxy without throwing", () => {
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();

    expect(classifyErrorSafely(proxy)).toEqual({ name: "UnknownError" });
  });
});
