import { Pencil, Plus } from "lucide-react";

interface RosterGroup {
  id: string;
  name: string;
  playerIds: string[];
}

type TranslationFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

interface SquadGroupsStripProps {
  groups: RosterGroup[];
  onCreateGroup: () => void;
  onEditGroup: (group: RosterGroup) => void;
  t: TranslationFn;
}

export function SquadGroupsStrip({
  groups,
  onCreateGroup,
  onEditGroup,
  t,
}: SquadGroupsStripProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 px-4 pb-3">
      <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-arena-text-muted">
            {t("groups.title")}
          </span>
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] text-arena-text-sec transition-colors hover:text-arena-primary"
            onClick={onCreateGroup}
          >
            <Plus size={11} />
            {t("groups.new")}
          </button>
        </div>
        <div className="flex gap-2 overflow-auto pb-0.5">
          {groups.map(group => (
            <div
              key={group.id}
              className="flex shrink-0 items-center gap-2 rounded-[10px] border border-arena-border bg-arena-bg px-2.5 py-2"
            >
              <div>
                <div className="text-[12px] font-bold text-arena-text">
                  {group.name}
                </div>
                <div className="text-[10px] text-arena-text-muted">
                  {t("groups.count", { count: group.playerIds.length })}
                </div>
              </div>
              <button
                type="button"
                aria-label={t("groups.edit")}
                className="flex size-6 items-center justify-center rounded-[7px] border border-arena-border bg-arena-surface text-arena-text-muted transition-colors hover:text-arena-primary active:scale-[0.97]"
                onClick={() => onEditGroup(group)}
              >
                <Pencil size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
