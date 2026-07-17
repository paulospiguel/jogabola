export const C = {
  bg: "#0B0F14",
  bgSec: "#111827",
  surface: "#151C26",
  surfaceEl: "#1B2430",
  border: "#263244",
  text: "#F5F7FA",
  textSec: "#A7B0BE",
  textMuted: "#6B7280",
  primary: "#7CFF4F",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#38BDF8",
  highlight: "#FACC15",
} as const;

export const AVATAR_COLORS = [
  "#7CFF4F",
  "#38BDF8",
  "#F59E0B",
  "#B97FFF",
  "#FF7FAA",
  "#22C55E",
];

export function avatarColor(id: number | string): string {
  const n =
    typeof id === "string"
      ? id.charCodeAt(0) + id.charCodeAt(id.length - 1)
      : id;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
