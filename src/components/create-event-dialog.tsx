"use client";

import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  ConfirmationMode,
  CreateEventFormValues,
  CreateEventType,
  EventStatus,
  RecurrenceType,
} from "@/features/events/create-event-dialog.types";
import {
  buildDateFromInputs,
  EVENT_TYPE_META,
  getDefaultEventFormValues,
  getEventConfirmationStatus,
  getNextRecurringDate,
  getRecurrenceLabelKey,
  RECURRENCE_OCCURRENCES,
} from "@/features/events/create-event-dialog.utils";
import { useToast } from "@/hooks/use-toast-custom";

export function CreateEventDialog() {
  const t = useTranslations("playZone.createEventDialog");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<CreateEventFormValues>(
    getDefaultEventFormValues(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormValue = <K extends keyof CreateEventFormValues>(
    field: K,
    value: CreateEventFormValues[K],
  ) => {
    setFormValues(currentValues => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const eventDate = buildDateFromInputs(formValues.date, formValues.time);
    if (!eventDate) {
      toast.error(t("feedback.errorTitle"), t("feedback.invalidDate"));
      setIsSubmitting(false);
      return;
    }

    // Simular criação de eventos (aqui você integraria com a API real)
    const eventsToCreate = [
      {
        id: crypto.randomUUID(),
        ...formValues,
        date: eventDate,
        createdBy: "Equipa Jogabola",
        responses: [],
      },
    ];

    // Se for recorrente, gerar eventos futuros
    if (formValues.isRecurring && formValues.recurrenceType !== "none") {
      let currentDate = new Date(eventDate);

      for (let i = 0; i < RECURRENCE_OCCURRENCES; i++) {
        currentDate = getNextRecurringDate(
          currentDate,
          formValues.recurrenceType,
        );

        eventsToCreate.push({
          id: crypto.randomUUID(),
          ...formValues,
          date: new Date(currentDate),
          status: getEventConfirmationStatus(formValues.confirmationMode),
          createdBy: "Equipa Jogabola",
          responses: [],
        });
      }

      toast.success(
        t("feedback.recurringCreatedTitle"),
        t("feedback.recurringCreatedDescription", {
          count: eventsToCreate.length,
          recurrence: t(getRecurrenceLabelKey(formValues.recurrenceType)),
        }),
      );
    } else {
      toast.success(
        t("feedback.createdTitle"),
        t("feedback.createdDescription"),
      );
    }

    setIsSubmitting(false);
    setOpen(false);
    setFormValues(getDefaultEventFormValues());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="group min-w-[180px] bg-neon-secondary font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-neon-secondary/90">
          <Plus className="mr-2 h-4 w-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0a1628]/95 text-white backdrop-blur-xl sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neon-secondary">
            {EVENT_TYPE_META[formValues.type].emoji} {t("title")}
          </DialogTitle>
          <DialogDescription className="text-base text-white/70">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-white"
              >
                {t("fields.title.label")}
              </Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={event => updateFormValue("title", event.target.value)}
                placeholder={t("fields.title.placeholder")}
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="type"
                  className="text-sm font-semibold text-white"
                >
                  {t("fields.type.label")}
                </Label>
                <Select
                  value={formValues.type}
                  onValueChange={(value: CreateEventType) =>
                    updateFormValue("type", value)
                  }
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0a1628] text-white">
                    {Object.entries(EVENT_TYPE_META).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>
                        {meta.emoji} {t(meta.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-semibold text-white"
                >
                  {t("fields.status.label")}
                </Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value: EventStatus) =>
                    updateFormValue("status", value)
                  }
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0a1628] text-white">
                    <SelectItem value="confirmado">
                      ✅ {t("statusOptions.confirmado")}
                    </SelectItem>
                    <SelectItem value="pendente">
                      ⏳ {t("statusOptions.pendente")}
                    </SelectItem>
                    <SelectItem value="cancelado">
                      ❌ {t("statusOptions.cancelado")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className="text-sm font-semibold text-white"
                >
                  {t("fields.date.label")}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formValues.date}
                  onChange={event =>
                    updateFormValue("date", event.target.value)
                  }
                  required
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="time"
                  className="text-sm font-semibold text-white"
                >
                  {t("fields.time.label")}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formValues.time}
                  onChange={event =>
                    updateFormValue("time", event.target.value)
                  }
                  required
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-sm font-semibold text-white"
              >
                {t("fields.location.label")}
              </Label>
              <Input
                id="location"
                value={formValues.location}
                onChange={event =>
                  updateFormValue("location", event.target.value)
                }
                placeholder={t("fields.location.placeholder")}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-white"
              >
                {t("fields.description.label")}
              </Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={event =>
                  updateFormValue("description", event.target.value)
                }
                placeholder={t("fields.description.placeholder")}
                rows={3}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="isRecurring"
                    className="text-sm font-semibold text-white"
                  >
                    {t("fields.isRecurring.label")}
                  </Label>
                  <p className="text-xs text-white/60">
                    {t("fields.isRecurring.description")}
                  </p>
                </div>
                <Switch
                  id="isRecurring"
                  checked={formValues.isRecurring}
                  onCheckedChange={checked =>
                    updateFormValue("isRecurring", checked)
                  }
                />
              </div>

              {formValues.isRecurring && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="recurrenceType"
                      className="text-sm font-semibold text-white"
                    >
                      {t("fields.recurrenceType.label")}
                    </Label>
                    <Select
                      value={formValues.recurrenceType}
                      onValueChange={(value: RecurrenceType) =>
                        updateFormValue("recurrenceType", value)
                      }
                    >
                      <SelectTrigger
                        id="recurrenceType"
                        className="border-white/10 bg-white/5 text-white"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#0a1628] text-white">
                        <SelectItem value="daily">
                          📅 {t("recurrenceLabels.daily")}
                        </SelectItem>
                        <SelectItem value="weekly">
                          📆 {t("recurrenceLabels.weekly")}
                        </SelectItem>
                        <SelectItem value="monthly">
                          🗓️ {t("recurrenceLabels.monthly")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmationMode"
                      className="text-sm font-semibold text-white"
                    >
                      {t("fields.confirmationMode.label")}
                    </Label>
                    <Select
                      value={formValues.confirmationMode}
                      onValueChange={(value: ConfirmationMode) =>
                        updateFormValue("confirmationMode", value)
                      }
                    >
                      <SelectTrigger
                        id="confirmationMode"
                        className="border-white/10 bg-white/5 text-white"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#0a1628] text-white">
                        <SelectItem value="automatic">
                          ✅ {t("confirmationModeOptions.automatic")}
                        </SelectItem>
                        <SelectItem value="manual">
                          ⏳ {t("confirmationModeOptions.manual")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formValues.confirmationMode === "manual" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="advanceNoticeDays"
                        className="text-sm font-semibold text-white"
                      >
                        {t("fields.advanceNoticeDays.label")}
                      </Label>
                      <Input
                        id="advanceNoticeDays"
                        type="number"
                        min="1"
                        max="30"
                        value={formValues.advanceNoticeDays}
                        onChange={event =>
                          updateFormValue(
                            "advanceNoticeDays",
                            parseInt(event.target.value, 10) || 7,
                          )
                        }
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neon-secondary font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all hover:bg-neon-secondary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("submit")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
