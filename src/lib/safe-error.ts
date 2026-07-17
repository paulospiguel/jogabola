const SAFE_ERROR_NAMES = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "DrizzleQueryError",
] as const);

type SafeErrorName =
  | "Error"
  | "TypeError"
  | "RangeError"
  | "ReferenceError"
  | "SyntaxError"
  | "DrizzleQueryError"
  | "UnknownError";

export interface SafeErrorClassification {
  name: SafeErrorName;
}

export function classifyErrorSafely(error: unknown): SafeErrorClassification {
  try {
    if (!(error instanceof Error)) {
      return { name: "UnknownError" };
    }

    const name: unknown = Reflect.get(error, "name");
    if (
      typeof name === "string" &&
      SAFE_ERROR_NAMES.has(name as Exclude<SafeErrorName, "UnknownError">)
    ) {
      return { name: name as Exclude<SafeErrorName, "UnknownError"> };
    }

    return { name: "UnknownError" };
  } catch {
    return { name: "UnknownError" };
  }
}
