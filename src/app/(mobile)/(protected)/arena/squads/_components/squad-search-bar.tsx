import { Search, X } from "lucide-react";

interface SquadSearchBarProps {
  onSearchChange: (value: string) => void;
  placeholder: string;
  search: string;
}

export function SquadSearchBar({
  onSearchChange,
  placeholder,
  search,
}: SquadSearchBarProps) {
  return (
    <div className="shrink-0 px-4 pt-4 pb-3">
      <div className="flex h-11 items-center gap-2.5 rounded-[14px] border border-arena-border bg-arena-surface px-3.5">
        <Search
          size={15}
          className="shrink-0 text-arena-text-muted"
          strokeWidth={1.7}
        />
        <input
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="flex-1 border-none bg-transparent p-0 text-[13px] text-arena-text shadow-none placeholder:text-arena-text-muted/60 focus-visible:ring-0 outline-none"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            type="button"
            className="flex size-5 items-center justify-center text-arena-text-muted transition-colors hover:text-arena-text active:scale-[0.97]"
            aria-label="Limpar pesquisa"
          >
            <X size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
