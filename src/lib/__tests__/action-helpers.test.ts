import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { withAction, withAuthAction } from "@/lib/action-helpers";

const schema = z.object({ n: z.number() });
const { getSession, headers } = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({ headers }));

beforeEach(() => {
  getSession.mockReset();
});

describe("withAction", () => {
  it("calls the handler with validated data and no session", async () => {
    const handler = vi.fn(async () => ({ success: true as const, data: null }));
    const action = withAction(schema, handler);

    await action({ n: 1 });

    expect(handler).toHaveBeenCalledWith({ n: 1 });
    expect(getSession).not.toHaveBeenCalled();
  });

  it("returns a validation error without calling the handler", async () => {
    const handler = vi.fn(async () => ({ success: true as const, data: null }));
    const action = withAction(schema, handler);

    const result = await action({ n: "1" });

    expect(result).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" },
    });
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("withAuthAction", () => {
  it("returns unauthorized for a null session without calling the handler", async () => {
    getSession.mockResolvedValue(null);
    const handler = vi.fn(async () => ({ success: true as const, data: null }));
    const action = withAuthAction(schema, handler);

    const result = await action({ n: 1 });

    expect(result).toEqual({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls the handler with the authenticated user", async () => {
    getSession.mockResolvedValue({
      session: { teamId: 2 },
      user: { email: "u1@example.com", id: "u1", name: "User One" },
    });
    const handler = vi.fn(async () => ({ success: true as const, data: null }));
    const action = withAuthAction(schema, handler);

    await action({ n: 1 });

    expect(handler).toHaveBeenCalledWith(
      {
        email: "u1@example.com",
        id: "u1",
        name: "User One",
        teamId: 2,
      },
      { n: 1 },
    );
  });
});
