import { randomUUID } from "node:crypto";
import { env } from "node:process";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_TOKENS = 512;
const MAX_TOKENS = 2_048;

export type OpenRouterRole = "system" | "developer" | "user" | "assistant";
export type OpenRouterMessage = { role: OpenRouterRole; content: string };
export type OpenRouterUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  cost?: number;
};
export type OpenRouterCompletion = {
  id: string;
  requestId: string;
  model: string;
  content: string;
  finishReason: string | null;
  usage?: OpenRouterUsage;
};
export type CompleteChatInput = {
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  includeUsage?: boolean;
};
export type OpenRouterErrorCode =
  | "CONFIG_MISSING"
  | "INVALID_INPUT"
  | "REQUEST_TIMEOUT"
  | "REQUEST_ABORTED"
  | "REQUEST_FAILED"
  | "UPSTREAM_ERROR"
  | "INVALID_RESPONSE"
  | "EMPTY_RESPONSE";
export type OpenRouterProviderOptions = {
  apiKey?: string;
  model?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export class OpenRouterProviderError extends Error {
  constructor(
    readonly code: OpenRouterErrorCode,
    message: string,
    readonly status?: number,
    readonly retryable = false,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "OpenRouterProviderError";
  }
}

type Json = Record<string, unknown>;
const isJson = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const num = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
const fail = (
  code: OpenRouterErrorCode,
  message: string,
  requestId?: string,
  status?: number,
  retryable = false,
) => new OpenRouterProviderError(code, message, status, retryable, requestId);

function parseUsage(value: unknown): OpenRouterUsage | undefined {
  if (!isJson(value)) return;
  const usage = {
    promptTokens: num(value.prompt_tokens),
    completionTokens: num(value.completion_tokens),
    totalTokens: num(value.total_tokens),
    cost: num(value.cost),
  };
  return Object.values(usage).some(item => item !== undefined)
    ? usage
    : undefined;
}

function validate(input: CompleteChatInput) {
  if (
    !input.messages?.length ||
    input.messages.some(message => !message?.content?.trim())
  ) {
    throw fail("INVALID_INPUT", "Provide at least one non-empty chat message.");
  }
  if (
    input.temperature !== undefined &&
    (!Number.isFinite(input.temperature) ||
      input.temperature < 0 ||
      input.temperature > 2)
  ) {
    throw fail("INVALID_INPUT", "Temperature must be between 0 and 2.");
  }
  if (
    input.maxTokens !== undefined &&
    (!Number.isInteger(input.maxTokens) ||
      input.maxTokens < 1 ||
      input.maxTokens > MAX_TOKENS)
  ) {
    throw fail(
      "INVALID_INPUT",
      `maxTokens must be an integer from 1 to ${MAX_TOKENS}.`,
    );
  }
}

function requestFailure(
  input: CompleteChatInput,
  timeout: AbortSignal,
  requestId: string,
) {
  const code = timeout.aborted
    ? "REQUEST_TIMEOUT"
    : input.signal?.aborted
      ? "REQUEST_ABORTED"
      : "REQUEST_FAILED";
  const message =
    code === "REQUEST_TIMEOUT"
      ? "The OpenRouter request timed out."
      : code === "REQUEST_ABORTED"
        ? "The OpenRouter request was aborted."
        : "Could not reach OpenRouter.";
  return fail(code, message, requestId, undefined, code !== "REQUEST_ABORTED");
}

export function createOpenRouterProvider(
  options: OpenRouterProviderOptions = {},
) {
  const apiKey = (options.apiKey ?? env.OPENROUTER_API_KEY)?.trim();
  const model = (options.model ?? env.OPENROUTER_MODEL)?.trim();
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async complete(input: CompleteChatInput): Promise<OpenRouterCompletion> {
      validate(input);
      if (!apiKey || !model)
        throw fail(
          "CONFIG_MISSING",
          "Set OPENROUTER_API_KEY and OPENROUTER_MODEL.",
        );
      if (!Number.isFinite(timeoutMs) || timeoutMs < 1)
        throw fail("INVALID_INPUT", "Invalid provider timeout.");
      if (input.signal?.aborted)
        throw fail("REQUEST_ABORTED", "The OpenRouter request was aborted.");

      const requestId = randomUUID();
      const timeout = AbortSignal.timeout(timeoutMs);
      const signal = input.signal
        ? AbortSignal.any([input.signal, timeout])
        : timeout;
      const body = {
        model,
        messages: input.messages,
        max_completion_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
        ...(input.temperature === undefined
          ? {}
          : { temperature: input.temperature }),
      };

      try {
        const response = await fetcher(ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "JogaBola",
            "X-Client-Request-Id": requestId,
          },
          body: JSON.stringify(body),
          signal,
        });

        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          if (timeout.aborted || input.signal?.aborted)
            throw requestFailure(input, timeout, requestId);
          if (response.ok)
            throw fail(
              "INVALID_RESPONSE",
              "OpenRouter returned invalid JSON.",
              requestId,
            );
        }
        if (!response.ok) {
          const status = response.status;
          throw fail(
            "UPSTREAM_ERROR",
            `OpenRouter returned HTTP ${status}.`,
            requestId,
            status,
            status === 408 || status === 429 || status >= 500,
          );
        }
        if (!isJson(payload) || !Array.isArray(payload.choices)) {
          throw fail(
            "INVALID_RESPONSE",
            "OpenRouter returned an unexpected response.",
            requestId,
          );
        }

        const choice = payload.choices[0];
        const content =
          isJson(choice) && isJson(choice.message)
            ? choice.message.content
            : undefined;
        if (typeof content !== "string" || !content.trim()) {
          throw fail(
            "EMPTY_RESPONSE",
            "OpenRouter returned no text completion.",
            requestId,
          );
        }
        if (
          typeof payload.id !== "string" ||
          typeof payload.model !== "string"
        ) {
          throw fail(
            "INVALID_RESPONSE",
            "OpenRouter returned an incomplete response.",
            requestId,
          );
        }

        const result: OpenRouterCompletion = {
          id: payload.id,
          requestId,
          model: payload.model,
          content,
          finishReason:
            isJson(choice) && typeof choice.finish_reason === "string"
              ? choice.finish_reason
              : null,
        };
        if (input.includeUsage === true)
          result.usage = parseUsage(payload.usage) ?? {};
        return result;
      } catch (error) {
        if (error instanceof OpenRouterProviderError) throw error;
        throw requestFailure(input, timeout, requestId);
      }
    },
  };
}

export const completeOpenRouterChat = (input: CompleteChatInput) =>
  createOpenRouterProvider().complete(input);
