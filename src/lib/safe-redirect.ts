const PROBE_ORIGIN = "http://redirect.invalid";

/**
 * Returns `value` only when it is a same-origin relative path (`/arena`,
 * `/transfer/abc?x=1`). Anything that could leave the app — protocol-relative
 * `//host`, backslash tricks (`/\host`), schemes, control characters that
 * browsers strip — falls back to `fallback`.
 */
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/arena",
): string {
  if (!value || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("\\")) return fallback;
  // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting them is the point
  if (/[\u0000-\u001f\u007f\s]/.test(value)) return fallback;

  try {
    const url = new URL(value, PROBE_ORIGIN);
    if (url.origin !== PROBE_ORIGIN) return fallback;
  } catch {
    return fallback;
  }
  return value;
}

export type RedirectDestination = "arena" | "transfer" | "event";

/** What the post-login toast should say the user is entering. */
export function redirectDestination(path: string): RedirectDestination {
  if (path === "/arena" || path.startsWith("/arena/")) return "arena";
  if (path.startsWith("/transfer/")) return "transfer";
  return "event";
}
