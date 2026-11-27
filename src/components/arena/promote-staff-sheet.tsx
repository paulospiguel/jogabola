"use client";

import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { promoteToStaff } from "@/actions/team-staff.actions";
import {
  STAFF_PERMISSIONS,
  STAFF_TITLES,
  type StaffPermission,
  type StaffTitle,
  TITLE_PRESETS,
} from "@/lib/staff-permissions";
import {
  permissionLabelKey,
  staffErrorKey,
  togglePermission,
} from "@/lib/staff-ui";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BottomSheet } from "./bottom-sheet";

interface PromoteStaffSheetProps {
  teamId: number;
  userId: string;
  name: string;
  onClose: () => void;
  onPromoted: () => void;
}

const DEFAULT_TITLE: StaffTitle = "coach";
const labelClass = "mb-1.5 block text-xs font-semibold text-arena-text-sec";

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

  const handleTitleChange = (value: string) => {
    const next = value as StaffTitle;
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
          <Label className={labelClass} htmlFor="staff-title">
            {t("promoteSheet.titleLabel")}
          </Label>
          <Select onValueChange={handleTitleChange} value={title}>
            <SelectTrigger
              className="h-11 w-full rounded-xl border border-arena-border bg-arena-surface px-3 text-sm text-arena-text focus-visible:border-arena-primary/50 focus-visible:ring-1 focus-visible:ring-arena-primary/30 focus-visible:ring-offset-0"
              id="staff-title"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[10000] border-arena-border bg-arena-bg-sec text-arena-text">
              {STAFF_TITLES.map(option => (
                <SelectItem key={option} value={option}>
                  {t(`titles.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset>
          <legend className={labelClass}>
            {t("promoteSheet.permissionsLabel")}
          </legend>
          <p className="mb-3 text-[11px] text-arena-text-muted">
            {t("promoteSheet.permissionsHint")}
          </p>
          <div className="flex flex-wrap gap-2">
            {STAFF_PERMISSIONS.map(permission => {
              const active = permissions.includes(permission);
              return (
                <button
                  key={permission}
                  aria-pressed={active}
                  className={cn(
                    "press inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition-colors",
                    active
                      ? "border-arena-primary/40 bg-arena-primary/15 text-arena-primary"
                      : "border-arena-border bg-arena-surface text-arena-text-sec hover:bg-arena-surface-el",
                  )}
                  onClick={() =>
                    setPermissions(current =>
                      togglePermission(current, permission),
                    )
                  }
                  type="button"
                >
                  {active && <Check size={12} strokeWidth={2.5} />}
                  {t(`permissions.${permissionLabelKey(permission)}`)}
                </button>
              );
            })}
          </div>
        </fieldset>

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
