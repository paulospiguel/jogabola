import { classifyErrorSafely } from "@/lib/safe-error";

export function logAuthErrorSafely(error: unknown): void {
  console.error("[auth] request failed", {
    error: classifyErrorSafely(error),
  });
}
