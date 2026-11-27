"use client";

import { Loader2, RotateCcw, Save, ShieldMinus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { demoteStaff, updateStaffMember } from "@/actions/team-staff.actions";
import { JbAvatar } from "@/components/arena/avatar";
import {
  StaffPermissionChips,
  StaffTitleSelect,
} from "@/components/arena/staff-fields";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast-custom";
import {
  type StaffPermission,
  type StaffTitle,
  TITLE_PRESETS,
} from "@/lib/staff-permissions";
import { staffErrorKey } from "@/lib/staff-ui";
import { type StaffRow, sameMembers } from "../_utils/staff-view";

interface StaffMemberSheetProps {
  teamId: number;
  member: StaffRow;
  onClose: () => void;
  onChanged: () => Promise<void>;
}

/**
 * Owner edits a staff member's title and permissions, or demotes them.
 * Full-screen on mobile, side drawer on desktop.
 */
export function StaffMemberSheet({
  teamId,
  member,
  onClose,
  onChanged,
}: StaffMemberSheetProps) {
  const t = useTranslations("teamStaff");
  const { toast } = useToast();
  const initialTitle: StaffTitle =
    member.title === "owner" ? "other" : member.title;
  const [title, setTitle] = useState<StaffTitle>(initialTitle);
  const [permissions, setPermissions] = useState<StaffPermission[]>(
    member.permissions,
  );
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [demoting, setDemoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preset = TITLE_PRESETS[title];
  const matchesPreset = sameMembers(permissions, preset);
  const dirty =
    title !== initialTitle || !sameMembers(permissions, member.permissions);
  const busy = saving || demoting;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await updateStaffMember({
        teamId,
        userId: member.userId,
        title,
        permissions,
      });
      if (!result.success) {
        setError(t(staffErrorKey(result.error.code)));
        return;
      }
      toast.success(t("feedback.updated", { name: member.name }));
      await onChanged();
      onClose();
    } catch {
      setError(t(staffErrorKey(undefined)));
    } finally {
      setSaving(false);
    }
  };

  const handleDemote = async () => {
    setDemoting(true);
    setError(null);
    try {
      const result = await demoteStaff({ teamId, userId: member.userId });
      if (!result.success) {
        setError(t(staffErrorKey(result.error.code)));
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      toast.success(t("feedback.demoted", { name: member.name }));
      await onChanged();
      onClose();
    } catch {
      setError(t(staffErrorKey(undefined)));
      setConfirmOpen(false);
    } finally {
      setDemoting(false);
    }
  };

  return (
    <Sheet
      open
      onOpenChange={open => {
        if (!open && !busy) onClose();
      }}
    >
      <SheetContent
        className="flex w-full flex-col gap-0 border-arena-border bg-arena-bg-sec p-0 text-arena-text sm:max-w-md"
        side="right"
      >
        <SheetHeader className="border-b border-arena-border px-5 pt-5 pb-4 text-left">
          <SheetTitle className="text-base font-bold text-arena-text">
            {t("editSheet.title")}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("editSheet.description", { name: member.name })}
          </SheetDescription>
          <div className="flex items-center gap-3 pt-2">
            <JbAvatar
              id={member.userId}
              image={member.image}
              name={member.name}
              size={40}
            />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-arena-text">
                {member.name}
              </p>
              <p className="text-[11px] text-arena-text-muted">
                {member.isAthlete
                  ? t("editSheet.isAthlete")
                  : t("editSheet.notAthlete")}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-5">
          <StaffTitleSelect
            id="edit-staff-title"
            onChange={setTitle}
            value={title}
          />

          <StaffPermissionChips
            action={
              !matchesPreset && (
                <button
                  className="press -mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-arena-border bg-arena-surface px-2.5 py-1 text-[11px] font-semibold text-arena-text-sec transition-colors hover:bg-arena-surface-el hover:text-arena-text"
                  onClick={() => setPermissions([...preset])}
                  type="button"
                >
                  <RotateCcw size={11} strokeWidth={2.2} />
                  {t("editSheet.applyPreset")}
                </button>
              )
            }
            hint={t("editSheet.permissionsHint")}
            onChange={setPermissions}
            value={permissions}
          />

          {error && (
            <div
              className="rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-[13px] text-arena-danger"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="rounded-[14px] border border-arena-danger/20 bg-arena-danger/5 p-4">
            <p className="text-[13px] font-semibold text-arena-text">
              {t("actions.demote")}
            </p>
            <p className="mt-0.5 text-[11px] text-arena-text-muted">
              {t("actions.demoteDesc")}
            </p>
            <Button
              className="press mt-3 h-9 rounded-[10px] border border-arena-danger/30 bg-transparent text-[12px] font-semibold text-arena-danger hover:bg-arena-danger/10"
              disabled={busy}
              onClick={() => setConfirmOpen(true)}
              type="button"
              variant="ghost"
            >
              <ShieldMinus size={14} strokeWidth={2} />
              {t("actions.demote")}
            </Button>
          </div>
        </div>

        <div className="border-t border-arena-border px-5 pt-3 pb-5">
          <Button
            className="press h-[50px] w-full rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg hover:bg-arena-primary/90"
            disabled={!dirty || busy}
            onClick={handleSave}
            type="button"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} strokeWidth={2.2} />
            )}
            {saving ? t("editSheet.saving") : t("editSheet.save")}
          </Button>
        </div>
      </SheetContent>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={open => {
          if (!demoting) setConfirmOpen(open);
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
              {member.isAthlete
                ? t("demoteDialog.description", { name: member.name })
                : t("demoteDialog.descriptionNotAthlete", {
                    name: member.name,
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
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
              {demoting ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <ShieldMinus className="mr-2" size={16} />
              )}
              {demoting ? t("actions.demoting") : t("actions.confirmDemote")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
