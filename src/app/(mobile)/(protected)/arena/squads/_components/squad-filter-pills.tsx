import { cn } from "@/lib/utils";

export type SquadFilterKey = "all" | "confirmed" | "reserve" | "pending";

interface SquadFilter {
  key: SquadFilterKey;
  label: string;
}

interface SquadFilterPillsProps {
  activeFilter: SquadFilterKey;
  filters: SquadFilter[];
  onFilterChange: (filter: SquadFilterKey) => void;
}

export function SquadFilterPills({
  activeFilter,
  filters,
  onFilterChange,
}: SquadFilterPillsProps) {
  return (
    <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onFilterChange(key)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all duration-150 active:scale-[0.96]",
            activeFilter === key
              ? "bg-arena-primary text-arena-bg"
              : "border border-arena-border bg-arena-surface text-arena-text-sec hover:border-arena-primary/30 hover:text-arena-text",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
