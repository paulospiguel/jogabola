import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { argv, env, stderr, stdout } from "node:process";
import {
  completeOpenRouterChat,
  OpenRouterProviderError,
} from "../../src/lib/ai/openrouter";

function readOption(args: string[], name: string) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

async function main() {
  const args = argv.slice(2);
  if (args.includes("--help")) {
    stdout.write(
      "Usage: pnpm exec tsx scripts/ai/run-openrouter.ts --prompt <text> [--system <text>] [--context <path>] [--max-tokens <n>] [--usage]\n",
    );
    return;
  }

  const prompt = readOption(args, "--prompt");
  if (!prompt?.trim()) throw new Error("A non-empty --prompt is required.");

  let system =
    readOption(args, "--system") ??
    "Responde em português europeu, com clareza e foco no JogaBola.";
  const contextFile = readOption(args, "--context");
  if (contextFile) {
    const contextPath = resolve(contextFile);
    const context = await readFile(contextPath, "utf8");
    system += `\n\nContexto do produto:\n${context}`;
  }

  const maxTokensText = readOption(args, "--max-tokens");
  const maxTokens =
    maxTokensText === undefined ? undefined : Number(maxTokensText);
  if (maxTokensText !== undefined && !Number.isInteger(maxTokens)) {
    throw new Error("--max-tokens must be an integer between 1 and 2048.");
  }

  const result = await completeOpenRouterChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    ...(maxTokens === undefined ? {} : { maxTokens }),
    includeUsage:
      args.includes("--usage") || env.OPENROUTER_INCLUDE_USAGE === "true",
  });

  stdout.write(`${result.content}\n`);
  if (result.usage)
    stderr.write(`[OpenRouter usage] ${JSON.stringify(result.usage)}\n`);
}

main().catch(error => {
  if (error instanceof OpenRouterProviderError) {
    stderr.write(`[${error.code}] ${error.message}\n`);
  } else {
    stderr.write(
      `${error instanceof Error ? error.message : "Local runner failed."}\n`,
    );
  }
  process.exitCode = 1;
});
