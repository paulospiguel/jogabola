import { describe, expect, it, vi } from "vitest";

vi.mock("@/db/client", () => ({ db: {} }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/ably", () => ({
  EVENT_CHAT_MESSAGE_EVENT: "message",
  eventChannelName: vi.fn(),
  getAblyRest: vi.fn(),
}));

describe("event-chat.actions exports", () => {
  it("does not expose the chat access check as a Server Action", async () => {
    const mod = await import("@/actions/event-chat.actions");
    expect("canParticipateInChat" in mod).toBe(false);
  });
});
