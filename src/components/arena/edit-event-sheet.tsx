"use client";

import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader2,
  Repeat,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  checkEventDeletable,
  deleteEvent,
  updateEvent,
} from "@/actions/match-sessions.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EventDatePicker } from "@/components/ui/event-date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types/events";
import { BottomSheet } from "./bottom-sheet";

interface EditEventSheetProps {
  event: {
    id: number;
    teamId: number;
    startDate: Date | string;
    status: EventStatus;
    recurrence: string;
    recurrenceGroupId: string | null;
    priceCents?: number;
    paymentRequired?: boolean;
    paymentDeadlineHours?: number | null;
    rosterOnly?: boolean;
    transferRequiresProof?: boolean;
  };
  onClose: () => void;
}

const labelClass = "mb-1 text-xs font-semibold text-arena-text-sec";
const inputClass =
  "h-11 rounded-xl border-arena-border bg-arena-bg text-sm text-arena-text placeholder:text-arena-text-muted/70 focus-visible:ring-arena-primary/40 focus-visible:border-arena-primary/50";

export function EditEventSheet({ event, onClose }: EditEventSheetProps) {
  const router = useRouter();
  const t = useTranslations("arenaCreateEvent");
  const tEvents = useTranslations("arenaEvents");
  const tCommon = useTranslations("common");

  const [form, setForm] = useState({
    startDate: new Date(event.startDate),
    status: event.status || "scheduled",
    priceCents: event.priceCents ?? 0,
    paymentRequired: event.paymentRequired ?? false,
    paymentDeadlineHours: event.paymentDeadlineHours?.toString() ?? "",
    rosterOnly: event.rosterOnly ?? false,
    mbwayEnabled: false,
    mbwayPhone: "",
    transferRequiresProof: event.transferRequiresProof ?? true,
  });
  const [transferEnabled, setTransferEnabled] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<
    "idle" | "checking" | "confirm" | "cannot_delete" | "deleting"
  >("idle");

  useEffect(() => {
    import("@/actions/team-payment-settings.actions").then(
      ({ getTeamPaymentSettings }) => {
        getTeamPaymentSettings({ teamId: event.teamId }).then(res => {
          if (res.success && res.data) {
            const data = res.data;
            setTransferEnabled(data.transferEnabled);
            setForm(f => ({
              ...f,
              mbwayEnabled: data.mbwayEnabled,
              mbwayPhone: data.mbwayPhone || f.mbwayPhone,
            }));
          }
        });
      },
    );
  }, [event.teamId]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleDeleteCheck = async () => {
    setDeleteState("checking");
    const res = await checkEventDeletable(event.id);
    if (res.success && res.data?.hasPayments) {
      setDeleteState("cannot_delete");
    } else {
      setDeleteState("confirm");
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteState("deleting");
    const res = await deleteEvent(event.id);
    if (res.success) {
      router.push("/arena/events"); // redirect to events list
    } else {
      setError(tEvents("deleteError"));
      setDeleteState("idle");
    }
  };

  const handleCancelEventInstead = async () => {
    setDeleteState("deleting");
    const res = await updateEvent(event.id, { status: "cancelled" });
    if (res.success) {
      router.refresh();
      onClose();
    } else {
      setError(tEvents("errorUpdating"));
      setDeleteState("idle");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await updateEvent(event.id, {
      startDate: form.startDate,
      status: form.status,
      priceCents: form.priceCents,
      paymentRequired: form.paymentRequired,
      paymentDeadlineHours:
        form.paymentRequired && form.paymentDeadlineHours
          ? Number.parseInt(form.paymentDeadlineHours, 10)
          : null,
      rosterOnly: form.rosterOnly,
      mbwayEnabled: form.mbwayEnabled,
      mbwayPhone: form.mbwayPhone,
      transferRequiresProof: form.transferRequiresProof,
    });
    setSaving(false);
    if (res.success) {
      router.refresh();
      onClose();
    } else {
      setError(tEvents("errorUpdating"));
    }
  };

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex flex-col gap-4 px-5 pb-8 pt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-arena-text">
            {tEvents("editInfo")}
          </h2>
        </div>

        <div>
          <Label className={labelClass}>{t("labels.date")}</Label>
          <EventDatePicker
            id="edit-date"
            value={form.startDate}
            onChange={date => date && set("startDate", date)}
            placeholder={t("labels.date")}
          />
        </div>

        {event.recurrenceGroupId && (
          <div className="flex items-center gap-2 rounded-xl border border-arena-border bg-arena-surface px-4 py-3 text-[13px] font-semibold text-arena-text-sec">
            <Repeat size={15} className="text-arena-primary shrink-0" />
            {t("edit.partOfSeries", {
              frequency: t(`recurrence.${event.recurrence}`),
            })}
          </div>
        )}

        <div>
          <Label className={labelClass}>{tEvents("statusLabel")}</Label>
          <Select
            value={form.status}
            onValueChange={v => set("status", v as EventStatus)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text">
              <SelectValue placeholder={tEvents("statusLabel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">
                {tEvents("status.scheduled")}
              </SelectItem>
              <SelectItem value="confirmed">
                {tEvents("status.confirmed")}
              </SelectItem>
              <SelectItem value="cancelled">
                {tEvents("status.cancelled")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment section */}
        <div className="rounded-xl border border-arena-border bg-arena-surface overflow-hidden">
          <button
            type="button"
            onClick={() => setPaymentOpen(o => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-[13px] font-semibold text-arena-text">
              <CreditCard size={15} className="text-arena-primary" />
              {t("payment.section")}
            </span>
            {paymentOpen ? (
              <ChevronUp size={15} className="text-arena-text-muted" />
            ) : (
              <ChevronDown size={15} className="text-arena-text-muted" />
            )}
          </button>

          {paymentOpen && (
            <div className="flex flex-col gap-3 border-t border-arena-border px-4 pb-4 pt-3">
              <div>
                <Label className={labelClass} htmlFor="edit-price">
                  {t("payment.price")}
                </Label>
                <input
                  className={inputClass}
                  id="edit-price"
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="0.00"
                  value={
                    form.priceCents > 0
                      ? (form.priceCents / 100).toFixed(2)
                      : ""
                  }
                  onChange={e => {
                    const val = Number.parseFloat(e.target.value) || 0;
                    set("priceCents", Math.round(val * 100));
                  }}
                />
              </div>

              {/* MBWay Config */}
              {form.priceCents > 0 && (
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => set("mbwayEnabled", !form.mbwayEnabled)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                      form.mbwayEnabled
                        ? "border-arena-primary/40 bg-arena-primary/5"
                        : "border-arena-border bg-arena-bg",
                    )}
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-arena-text">
                        {t("payment.acceptMbway")}
                      </p>
                      <p className="text-[11px] text-arena-text-muted">
                        {t("payment.acceptMbwayHint")}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-5 w-9 rounded-full transition-colors",
                        form.mbwayEnabled
                          ? "bg-arena-primary"
                          : "bg-arena-border",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                          form.mbwayEnabled
                            ? "translate-x-4 ml-0.5"
                            : "translate-x-0.5",
                        )}
                      />
                    </div>
                  </button>
                  {form.mbwayEnabled && (
                    <div>
                      <Label className={labelClass} htmlFor="edit-mbway-phone">
                        {t("payment.mbwayPhone")}
                      </Label>
                      <input
                        className={inputClass}
                        id="edit-mbway-phone"
                        type="tel"
                        placeholder={t("payment.mbwayPhonePlaceholder")}
                        value={form.mbwayPhone}
                        onChange={e => set("mbwayPhone", e.target.value)}
                      />
                    </div>
                  )}

                  {/* Transfer Proof Toggle */}
                  {transferEnabled && (
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "transferRequiresProof",
                          !form.transferRequiresProof,
                        )
                      }
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                        form.transferRequiresProof
                          ? "border-arena-primary/40 bg-arena-primary/5"
                          : "border-arena-border bg-arena-bg",
                      )}
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-arena-text">
                          {t("payment.transferRequiresProof")}
                        </p>
                        <p className="text-[11px] text-arena-text-muted">
                          {t("payment.transferRequiresProofHint")}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "h-5 w-9 rounded-full transition-colors",
                          form.transferRequiresProof
                            ? "bg-arena-primary"
                            : "bg-arena-border",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                            form.transferRequiresProof
                              ? "translate-x-4 ml-0.5"
                              : "translate-x-0.5",
                          )}
                        />
                      </div>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => set("paymentRequired", !form.paymentRequired)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                  form.paymentRequired
                    ? "border-arena-primary/40 bg-arena-primary/5"
                    : "border-arena-border bg-arena-bg",
                )}
              >
                <div>
                  <p className="text-[13px] font-semibold text-arena-text">
                    {t("payment.required")}
                  </p>
                  <p className="text-[11px] text-arena-text-muted">
                    {t("payment.requiredHint")}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-5 w-9 rounded-full transition-colors",
                    form.paymentRequired
                      ? "bg-arena-primary"
                      : "bg-arena-border",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      form.paymentRequired
                        ? "translate-x-4 ml-0.5"
                        : "translate-x-0.5",
                    )}
                  />
                </div>
              </button>

              {form.paymentRequired && (
                <div>
                  <Label className={labelClass} htmlFor="edit-deadline">
                    {t("payment.deadlineHours")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      className={cn(inputClass, "flex-1")}
                      id="edit-deadline"
                      type="number"
                      min={1}
                      max={168}
                      placeholder="24"
                      value={form.paymentDeadlineHours}
                      onChange={e =>
                        set("paymentDeadlineHours", e.target.value)
                      }
                    />
                    <span className="shrink-0 text-[12px] text-arena-text-muted">
                      {t("payment.deadlineHoursUnit")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => set("rosterOnly", !form.rosterOnly)}
          className={cn(
            "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
            form.rosterOnly
              ? "border-arena-primary/40 bg-arena-primary/5"
              : "border-arena-border bg-arena-surface",
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-arena-border bg-arena-bg text-arena-primary">
              <Users size={15} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-arena-text">
                {t("access.rosterOnly")}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-arena-text-muted">
                {t("access.rosterOnlyHint")}
              </span>
            </span>
          </div>
          <div
            className={cn(
              "ml-3 h-5 w-9 shrink-0 rounded-full transition-colors",
              form.rosterOnly ? "bg-arena-primary" : "bg-arena-border",
            )}
          >
            <div
              className={cn(
                "mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                form.rosterOnly ? "ml-0.5 translate-x-4" : "translate-x-0.5",
              )}
            />
          </div>
        </button>

        {error && (
          <div className="rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-6 pt-6 border-t border-arena-border">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-arena-danger/80">
            {tEvents("dangerZone")}
          </h3>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl border-arena-danger/30 text-arena-danger hover:bg-arena-danger/10 hover:border-arena-danger/50 font-semibold"
            onClick={handleDeleteCheck}
            disabled={saving || deleteState !== "idle"}
          >
            {deleteState === "checking" ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : null}
            {tEvents("deleteEvent")}
          </Button>
        </div>

        <div className="mt-4 flex gap-2.5">
          <Button
            className="h-[50px] flex-1 rounded-[14px] border-arena-border text-[15px] font-semibold text-arena-text-sec"
            onClick={onClose}
            type="button"
            variant="outline"
            disabled={saving}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            className="h-[50px] flex-[2] rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg hover:bg-arena-primary/90"
            onClick={handleSave}
            type="button"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              tCommon("save")
            )}
          </Button>
        </div>
      </div>

      {/* Modals for Deletion */}
      <AlertDialog
        open={deleteState === "confirm"}
        onOpenChange={open => !open && setDeleteState("idle")}
      >
        <AlertDialogContent className="bg-arena-surface border-arena-border rounded-2xl w-[90vw] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-arena-text text-lg">
              {tEvents("deleteWarningTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-arena-text-muted">
              {tEvents("deleteWarningDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-row gap-2 sm:space-x-0">
            <AlertDialogCancel
              className="flex-1 mt-0 bg-arena-bg border-arena-border text-arena-text hover:bg-arena-surface-el hover:text-arena-text"
              disabled={deleteState === "deleting"}
            >
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 bg-arena-danger hover:bg-arena-danger/90 text-white"
              onClick={e => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteState === "deleting"}
            >
              {deleteState === "deleting" ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                tEvents("deleteEvent")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteState === "cannot_delete"}
        onOpenChange={open => !open && setDeleteState("idle")}
      >
        <AlertDialogContent className="bg-arena-surface border-arena-border rounded-2xl w-[90vw] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-arena-text text-lg">
              {tEvents("cancelWarningTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-arena-text-muted">
              {tEvents("cannotDeletePaidEvent")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-col gap-2 sm:space-x-0 sm:flex-col">
            <AlertDialogAction
              className="w-full bg-arena-warning hover:bg-arena-warning/90 text-white"
              onClick={e => {
                e.preventDefault();
                handleCancelEventInstead();
              }}
              disabled={deleteState === "deleting"}
            >
              {deleteState === "deleting" ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                tEvents("cancelEventInstead")
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              className="w-full mt-0 bg-transparent border-0 text-arena-text-muted hover:bg-arena-surface-el hover:text-arena-text"
              disabled={deleteState === "deleting"}
            >
              {tCommon("cancel")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BottomSheet>
  );
}
