"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ShieldMinus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { demoteStaff } from "@/actions/team-staff.actions";
import { PromoteStaffSheet } from "@/components/arena/promote-staff-sheet";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast-custom";
import type { StaffAction as StaffActionKind } from "@/lib/staff-ui";
import { invalidateStaffChange, staffErrorKey } from "@/lib/staff-ui";
import { cn } from "@/lib/utils";

interface StaffActionProps {
  action: Exclude<StaffActionKind, null>;
  teamId: number;
  userId: string;
  name: string;
}

/** Owner-only promote/demote entry on the athlete profile. */
export function StaffAction({
  action,
  teamId,
  userId,
  name,
}: StaffActionProps) {
  const t = useTranslations("teamStaff");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [demoting, setDemoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPromote = action === "promote";

  const refresh = () => invalidateStaffChange(queryClient, teamId);

  const handlePromoted = async () => {
    setSheetOpen(false);
    toast.success(t("feedback.promoted", { name }));
    await refresh();
  };

  const handleDemote = async () => {
    setDemoting(true);
    setError(null);
    try {
      const result = await demoteStaff({ teamId, userId });
      if (!result.success) {
        setError(t(staffErrorKey(result.error.code)));
        return;
      }
      setConfirmOpen(false);
      toast.success(t("feedback.demoted", { name }));
      await refresh();
    } catch {
      setError(t(staffErrorKey(undefined)));
    } finally {
      setDemoting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (isPromote ? setSheetOpen(true) : setConfirmOpen(true))}
        className="press flex w-full items-center justify-between gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-4 py-3.5 text-left transition-colors hover:bg-arena-surface-el"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[10px] border",
              isPromote
                ? "border-arena-info/20 bg-arena-info/10 text-arena-info"
                : "border-arena-danger/20 bg-arena-danger/10 text-arena-danger",
            )}
          >
            {isPromote ? (
              <ShieldCheck size={16} strokeWidth={2} />
            ) : (
              <ShieldMinus size={16} strokeWidth={2} />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-arena-text">
              {isPromote ? t("actions.promote") : t("actions.demote")}
            </p>
            <p className="text-[11px] text-arena-text-muted">
              {isPromote ? t("actions.promoteDesc") : t("actions.demoteDesc")}
            </p>
          </div>
        </div>
      </button>

      {sheetOpen && (
        <PromoteStaffSheet
          teamId={teamId}
          userId={userId}
          name={name}
          onClose={() => setSheetOpen(false)}
          onPromoted={handlePromoted}
        />
      )}

      <AlertDialog
        open={confirmOpen}
        onOpenChange={open => {
          setConfirmOpen(open);
          if (!open) setError(null);
        }}
      >
        <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
          <AlertDialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-arena-danger/25 bg-arena-danger/10 text-arena-danger">
              <ShieldMinus size={24} strokeWidth={2} />
            </div>
            <AlertDialogTitle className="text-arena-text">
              {t("demoteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-arena-text-sec">
              {t("demoteDialog.description", { name })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <div
              className="rounded-[12px] border border-arena-danger/25 bg-arena-danger/10 px-4 py-3 text-[13px] text-arena-danger"
              role="alert"
            >
              {error}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              className="press border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface hover:text-arena-text"
              disabled={demoting}
            >
              {t("actions.cancel")}
            </AlertDialogCancel>
            <Button
              className="press bg-arena-danger text-white hover:bg-arena-danger/90"
              disabled={demoting}
              onClick={handleDemote}
              type="button"
            >
              <ShieldMinus className="mr-2" size={16} />
              {demoting ? t("actions.demoting") : t("actions.confirmDemote")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
