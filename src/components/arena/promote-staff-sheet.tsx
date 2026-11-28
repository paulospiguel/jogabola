"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { promoteToStaff } from "@/actions/team-staff.actions";
import {
  type StaffPermission,
  type StaffTitle,
  TITLE_PRESETS,
} from "@/lib/staff-permissions";
import { staffErrorKey } from "@/lib/staff-ui";
import { Button } from "../ui/button";
import { BottomSheet } from "./bottom-sheet";
import { StaffPermissionChips, StaffTitleSelect } from "./staff-fields";

interface PromoteStaffSheetProps {
  teamId: number;
  userId: string;
  name: string;
  onClose: () => void;
  onPromoted: () => void;
}

const DEFAULT_TITLE: StaffTitle = "coach";

export function PromoteStaffSheet({
  teamId,
  userId,
  name,
  onClose,
  onPromoted,
}: PromoteStaffSheetProps) {
  const t = useTranslations("teamStaff");
  const [title, setTitle] = useState<StaffTitle>(DEFAULT_TITLE);
  const [permissions, setPermissions] = useState<StaffPermission[]>(() => [
    ...TITLE_PRESETS[DEFAULT_TITLE],
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (next: StaffTitle) => {
    setTitle(next);
    setPermissions([...TITLE_PRESETS[next]]);
  };

  const handlePromote = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await promoteToStaff({
        teamId,
        userId,
        title,
        permissions,
      });
      if (!result.success) {
        setError(t(staffErrorKey(result.error.code)));
        return;
      }
      onPromoted();
    } catch {
      setError(t(staffErrorKey(undefined)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet onClose={onClose} noPad title={t("promoteSheet.title")}>
      <div className="min-h-0 flex-1 overflow-auto px-5 pb-6 pt-4">
        <div className="mb-5 flex items-center gap-3 rounded-[14px] border border-arena-info/20 bg-arena-info/10 px-4 py-3">
          <ShieldCheck
            className="shrink-0 text-arena-info"
            size={18}
            strokeWidth={2}
          />
          <p className="text-[13px] font-semibold text-arena-text">
            {t("promoteSheet.sub", { name })}
          </p>
        </div>

        <div className="mb-5">
          <StaffTitleSelect
            id="staff-title"
            onChange={handleTitleChange}
            value={title}
          />
        </div>

        <StaffPermissionChips
          hint={t("promoteSheet.permissionsHint")}
          onChange={setPermissions}
          value={permissions}
        />

        {error && (
          <div
            className="mt-4 rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-[13px] text-arena-danger"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3">
        <Button
          className="press h-[50px] w-full rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg hover:bg-arena-primary/90"
          disabled={saving}
          onClick={handlePromote}
          type="button"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <ShieldCheck size={16} strokeWidth={2.5} />
          )}
          {saving ? t("actions.promoting") : t("actions.confirmPromote")}
        </Button>
      </div>
    </BottomSheet>
  );
}
