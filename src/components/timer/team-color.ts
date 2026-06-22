/** Team accent palette — pulled from arena tokens + a few complementary hues. */
export const TEAM_COLORS = [
  "#7CFF4F", // arena primary (neon green)
  "#38BDF8", // info blue
  "#FACC15", // highlight yellow
  "#F472B6", // pink
  "#A78BFA", // violet
  "#FB923C", // orange
] as const;

export function defaultTeamColor(side: "A" | "B"): string {
  return side === "A" ? TEAM_COLORS[0] : TEAM_COLORS[1];
}

/** Readable text color on top of a given team color. */
export function onColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0B0F14" : "#F5F7FA";
}
