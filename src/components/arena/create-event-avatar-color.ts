const AVATAR_COLOR_MAP: Record<string, string> = {
  DF: "bg-amber-600/20 text-amber-500 border border-amber-500/20",
  AC: "bg-purple-600/20 text-purple-400 border border-purple-500/20",
  TM: "bg-pink-600/20 text-pink-400 border border-pink-500/20",
  BA: "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20",
  RP: "bg-violet-600/20 text-violet-400 border border-violet-500/20",
  FR: "bg-sky-600/20 text-sky-400 border border-sky-500/20",
  NS: "bg-yellow-600/20 text-yellow-500 border border-yellow-500/20",
  JM: "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20",
  CS: "bg-rose-600/20 text-rose-400 border border-rose-500/20",
  LO: "bg-green-600/20 text-green-400 border border-green-500/20",
};

export function getAvatarColor(initials: string): string {
  return (
    AVATAR_COLOR_MAP[initials.toUpperCase()] ||
    "bg-arena-primary/20 text-arena-primary border border-arena-primary/25"
  );
}
