import { CheckCircle2, ListPlus } from "lucide-react";
import { JbAvatar } from "@/components/arena/avatar";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { Input } from "@/components/ui/input";
import type { SquadPlayer } from "@/hooks/use-squad";
import { cn } from "@/lib/utils";

type TranslationFn = (key: string) => string;

interface SquadGroupSheetProps {
  editing: boolean;
  groupName: string;
  groupSelection: string[];
  onClose: () => void;
  onGroupNameChange: (value: string) => void;
  onSave: () => void;
  onTogglePlayer: (playerId: string) => void;
  players: SquadPlayer[];
  t: TranslationFn;
}

export function SquadGroupSheet({
  editing,
  groupName,
  groupSelection,
  onClose,
  onGroupNameChange,
  onSave,
  onTogglePlayer,
  players,
  t,
}: SquadGroupSheetProps) {
  return (
    <BottomSheet
      title={editing ? t("groups.editTitle") : t("groups.createTitle")}
      onClose={onClose}
    >
      <div className="space-y-3 overflow-auto">
        <Input
          value={groupName}
          onChange={event => onGroupNameChange(event.target.value)}
          placeholder={t("groups.namePlaceholder")}
          className="border-arena-border bg-arena-surface text-arena-text"
        />
        <div className="max-h-72 space-y-2 overflow-auto">
          {players.map(player => {
            const checked = groupSelection.includes(player.id);
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => onTogglePlayer(player.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[12px] border px-3 py-2 text-left",
                  checked
                    ? "border-arena-primary/50 bg-arena-primary/10"
                    : "border-arena-border bg-arena-surface",
                )}
              >
                <JbAvatar
                  image={player.image}
                  name={player.name}
                  size={32}
                  id={player.id}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-arena-text">
                  {player.name}
                </span>
                {checked && (
                  <CheckCircle2 size={16} className="text-arena-primary" />
                )}
              </button>
            );
          })}
        </div>
        <Cta
          variant="primary"
          size="md"
          fullWidth
          onClick={onSave}
          disabled={!groupName.trim() || groupSelection.length === 0}
        >
          <ListPlus size={15} />
          {editing ? t("groups.update") : t("groups.create")}
        </Cta>
      </div>
    </BottomSheet>
  );
}
