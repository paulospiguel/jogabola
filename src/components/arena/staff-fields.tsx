"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  STAFF_PERMISSIONS,
  STAFF_TITLES,
  type StaffPermission,
  type StaffTitle,
} from "@/lib/staff-permissions";
import { permissionLabelKey, togglePermission } from "@/lib/staff-ui";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const staffLabelClass =
  "mb-1.5 block text-xs font-semibold text-arena-text-sec";

interface StaffTitleSelectProps {
  id: string;
  value: StaffTitle;
  onChange: (title: StaffTitle) => void;
}

/** Title (cargo) picker shared by the promote and edit staff sheets. */
export function StaffTitleSelect({
  id,
  value,
  onChange,
}: StaffTitleSelectProps) {
  const t = useTranslations("teamStaff");

  return (
    <div>
      <Label className={staffLabelClass} htmlFor={id}>
        {t("promoteSheet.titleLabel")}
      </Label>
      <Select
        onValueChange={next => onChange(next as StaffTitle)}
        value={value}
      >
        <SelectTrigger
          className="h-11 w-full rounded-xl border border-arena-border bg-arena-surface px-3 text-sm text-arena-text focus-visible:border-arena-primary/50 focus-visible:ring-1 focus-visible:ring-arena-primary/30 focus-visible:ring-offset-0"
          id={id}
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
  );
}

interface StaffPermissionChipsProps {
  value: StaffPermission[];
  onChange: (permissions: StaffPermission[]) => void;
  hint?: string;
  action?: React.ReactNode;
}

/** Toggleable permission chips, always in catalog order. */
export function StaffPermissionChips({
  value,
  onChange,
  hint,
  action,
}: StaffPermissionChipsProps) {
  const t = useTranslations("teamStaff");

  return (
    <fieldset>
      <div className="flex items-start justify-between gap-3">
        <legend className={staffLabelClass}>
          {t("promoteSheet.permissionsLabel")}
        </legend>
        {action}
      </div>
      {hint && <p className="mb-3 text-[11px] text-arena-text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {STAFF_PERMISSIONS.map(permission => {
          const active = value.includes(permission);
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
              onClick={() => onChange(togglePermission(value, permission))}
              type="button"
            >
              {active && <Check size={12} strokeWidth={2.5} />}
              {t(`permissions.${permissionLabelKey(permission)}`)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
