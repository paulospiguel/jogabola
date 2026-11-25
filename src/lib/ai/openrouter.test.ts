import { describe, expect, it, vi } from "vitest";
import {
  type CompleteChatInput,
  createOpenRouterProvider,
  OpenRouterProviderError,
} from "@/lib/ai/openrouter";

const input: CompleteChatInput = {
  messages: [
    { role: "system", content: "És o assistente do JogaBola." },
    { role: "user", content: "Como organizo um jogo?" },
  ],
};

function response(body: unknown, status = 200, json = true): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: json
      ? vi.fn().mockResolvedValue(body)
      : vi.fn().mockRejectedValue(new Error()),
  } as unknown as Response;
}

function completion() {
  return {
    id: "gen-123",
    model: "test/model",
    choices: [
      { finish_reason: "stop", message: { content: "Cria uma convocatória." } },
    ],
    usage: {
      prompt_tokens: 21,
      completion_tokens: 8,
      total_tokens: 29,
      cost: 0.00002,
    },
  };
}

describe("OpenRouter provider", () => {
  it("requires both server configuration values", async () => {
    const provider = createOpenRouterProvider({ apiKey: "", model: "" });
    await expect(provider.complete(input)).rejects.toMatchObject({
      code: "CONFIG_MISSING",
    });
  });

  it("uses the configured model, bounded token cap, and omits usage by default", async () => {
    const fetcher = vi.fn(async () => response(completion()));
    const provider = createOpenRouterProvider({
      apiKey: "test-secret",
      model: "test/model",
      fetcher: fetcher as typeof fetch,
    });

    const result = await provider.complete(input);
    const [url, init] = fetcher.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(String(init.body));

    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer test-secret",
    );
    expect(body).toMatchObject({
      model: "test/model",
      max_completion_tokens: 512,
    });
    expect(result).toMatchObject({
      content: "Cria uma convocatória.",
      model: "test/model",
    });
    expect(result).not.toHaveProperty("usage");
  });

  it("returns token and cost details only when explicitly requested", async () => {
    const provider = createOpenRouterProvider({
      apiKey: "test-secret",
      model: "test/model",
      fetcher: vi.fn(async () => response(completion())) as typeof fetch,
    });
    await expect(
      provider.complete({ ...input, includeUsage: true }),
    ).resolves.toMatchObject({
      usage: {
        promptTokens: 21,
        completionTokens: 8,
        totalTokens: 29,
        cost: 0.00002,
      },
    });
  });

  it("rejects a token cap above the safe maximum before making a request", async () => {
    const fetcher = vi.fn();
    const provider = createOpenRouterProvider({
      apiKey: "test-secret",
      model: "test/model",
      fetcher: fetcher as typeof fetch,
    });
    await expect(
      provider.complete({ ...input, maxTokens: 2_049 }),
    ).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("classifies upstream errors without exposing response text", async () => {
    const provider = createOpenRouterProvider({
      apiKey: "test-secret",
      model: "test/model",
      fetcher: vi.fn(async () =>
        response({ error: "private prompt text" }, 429),
      ) as typeof fetch,
    });
    try {
      await provider.complete(input);
      throw new Error("expected completion to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(OpenRouterProviderError);
      expect(error).toMatchObject({
        code: "UPSTREAM_ERROR",
        status: 429,
        retryable: true,
      });
      expect((error as Error).message).not.toContain("private prompt text");
    }
  });

  it("preserves upstream status when the error body is not JSON", async () => {
    const provider = createOpenRouterProvider({
      apiKey: "test-secret",
      model: "test/model",
      fetcher: vi.fn(async () =>
        response(undefined, 503, false),
      ) as typeof fetch,
    });
    await expect(provider.complete(input)).rejects.toMatchObject({
      code: "UPSTREAM_ERROR",
      status: 503,
      retryable: true,
    });
  });

  it("maps transport errors to a safe retryable error", async () => {
    const provider = createOpenRouterProvider({
      apiKey: "test-secret",
      model: "test/model",
      fetcher: vi.fn(async () => {
        throw new Error("secret transport details");
      }) as typeof fetch,
    });
    await expect(provider.complete(input)).rejects.toMatchObject({
      code: "REQUEST_FAILED",
      retryable: true,
      message: "Could not reach OpenRouter.",
    });
  });

  it("detects malformed and empty successful responses", async () => {
    const makeProvider = (body: unknown) =>
      createOpenRouterProvider({
        apiKey: "test-secret",
        model: "test/model",
        fetcher: vi.fn(async () => response(body)) as typeof fetch,
      });
    await expect(
      makeProvider({ choices: [] }).complete(input),
    ).rejects.toMatchObject({ code: "EMPTY_RESPONSE" });
    await expect(
      makeProvider("invalid shape").complete(input),
    ).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("reports a timeout even when cancellation happens while reading JSON", async () => {
    const fetcher = vi.fn(
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        const signal = init?.signal as AbortSignal;
        return {
          ok: true,
          status: 200,
          json: () =>
            new Promise((_, reject) =>
              signal.addEventListener(
                "abort",
                () => reject(new Error("aborted")),
                { once: true },
              ),
            ),
        } as unknown as Response;
      },
    );
    const provider = createOpenRouterProvider({
      apiKey: "test-secret",
      model: "test/model",
      timeoutMs: 5,
      fetcher: fetcher as typeof fetch,
    });
    await expect(provider.complete(input)).rejects.toMatchObject({
      code: "REQUEST_TIMEOUT",
      retryable: true,
    });
  });

  it("honours a caller abort", async () => {
    const abort = new AbortController();
    const fetcher = vi.fn(
      async (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_, reject) =>
          (init?.signal as AbortSignal).addEventListener(
            "abort",
            () => reject(new Error()),
            {
              once: true,
            },
          ),
        ),
    );
    const provider = createOpenRouterProvider({
      apiKey: "test-secret",
      model: "test/model",
      fetcher: fetcher as typeof fetch,
    });
    const result = provider.complete({ ...input, signal: abort.signal });
    abort.abort();
    await expect(result).rejects.toMatchObject({ code: "REQUEST_ABORTED" });
  });
});
