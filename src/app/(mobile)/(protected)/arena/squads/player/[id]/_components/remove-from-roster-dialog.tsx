"use client";

import { useQueryClient } from "@tanstack/react-query";
import { UserMinus } from "lucide-react";
import { useState } from "react";
import { removePlayerFromRoster } from "@/actions/teams.actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REMOVE_ERROR_CODES = ["TEAM_NOT_FOUND", "CANNOT_REMOVE_OWNER", "PLAYER_NOT_IN_TEAM"] as const;

interface RemoveFromRosterDialogProps {
  activeTeamId: number | null;
  className?: string;
  playerId: string;
  playerName: string;
  onRemoved: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function RemoveFromRosterDialog({
  activeTeamId,
  className,
  playerId,
  playerName,
  onRemoved,
  t,
}: RemoveFromRosterDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    if (!activeTeamId) {
      setError(t("removeDialog.errors.TEAM_NOT_FOUND"));
      return;
    }
    setIsRemoving(true);
    setError(null);

    const result = await removePlayerFromRoster({ teamId: activeTeamId, playerId });
    setIsRemoving(false);

    if (!result.success) {
      const code = result.error.code;
      const errorKey = (REMOVE_ERROR_CODES as readonly string[]).includes(code)
        ? code
        : "UNKNOWN_ERROR";
      setError(t(`removeDialog.errors.${errorKey}`));
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["squad", activeTeamId] });
    await queryClient.invalidateQueries({ queryKey: ["athlete-profile", playerId, activeTeamId] });
    setOpen(false);
    onRemoved();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full text-arena-danger hover:bg-arena-danger/10 hover:text-arena-danger",
            className,
          )}
        >
          <UserMinus className="mr-2" size={16} />
          {t("actions.remove")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
        <AlertDialogHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-arena-danger/25 bg-arena-danger/10 text-arena-danger">
            <UserMinus size={24} strokeWidth={2} />
          </div>
          <AlertDialogTitle className="text-arena-text">{t("removeDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-arena-text-sec">
            {t("removeDialog.description", { name: playerName })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-[14px] border border-arena-warning/25 bg-arena-warning/10 px-4 py-3 text-[13px] font-semibold text-arena-warning">
          {t("removeDialog.warning")}
        </div>

        {error && (
          <div className="rounded-[12px] border border-arena-danger/25 bg-arena-danger/10 px-4 py-3 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            className="border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface hover:text-arena-text"
            disabled={isRemoving}
          >
            {t("removeDialog.cancel")}
          </AlertDialogCancel>
          <Button
            className="bg-arena-danger text-white hover:bg-arena-danger/90"
            disabled={isRemoving}
            onClick={handleRemove}
            type="button"
          >
            <UserMinus className="mr-2" size={16} />
            {isRemoving ? t("removeDialog.removing") : t("removeDialog.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
