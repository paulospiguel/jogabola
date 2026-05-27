"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { createEvent } from "@/actions/match-sessions.actions";
import { useSquad } from "@/hooks/use-squad";
import { useTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import type { CreateEventFormState } from "@/components/arena/create-event-form-types";

interface UseCreateEventFormOptions {
  teamId?: number;
  onCreated?: () => void;
}

export function useCreateEventForm({ teamId, onCreated }: UseCreateEventFormOptions) {
  const t = useTranslations("arenaCreateEvent");
  const { players } = useSquad();
  const { settings } = useTeamPaymentSettings(teamId);

  const [step, setStep] = useState(0);

  function defaultDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d;
  }

  const [form, setForm] = useState<CreateEventFormState>({
    type: "game",
    title: "",
    location: "",
    startDate: defaultDate(),
    maxPlayers: "14",
    recurrence: "once",
    priceCents: 0,
    paymentRequired: false,
    paymentDeadlineHours: "",
    rosterOnly: false,
    rosterPriorityHours: 0,
    mbwayEnabled: false,
    mbwayPhone: "",
    transferRequiresProof: true,
  });

  const [inputFee, setInputFee] = useState(t("placeholders.fee"));
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  useEffect(() => {
    if (settings) {
      setForm(f => ({
        ...f,
        mbwayEnabled: settings.mbwayEnabled,
        mbwayPhone: settings.mbwayPhone || f.mbwayPhone,
      }));
    }
  }, [settings]);

  const rosterPlayers = useMemo(
    () => players.filter(player => player.status !== "refused"),
    [players],
  );

  const filteredPlayers = useMemo(
    () =>
      rosterPlayers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [rosterPlayers, searchQuery],
  );

  const set = <K extends keyof CreateEventFormState>(
    k: K,
    v: CreateEventFormState[K],
  ) => setForm(f => ({ ...f, [k]: v }));

  const canAdvance =
    step === 0
      ? form.title.trim().length > 0 && !!form.type
      : step === 1
        ? !!form.startDate && form.location.trim().length > 0
        : true;

  function handleFeeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputFee(e.target.value);
  }

  function handleFeeFocus() {
    const freeLabel = t("placeholders.fee");
    if (inputFee === freeLabel) {
      setInputFee("");
    } else {
      setInputFee(inputFee.replace("€", "").trim());
    }
  }

  function handleFeeBlur() {
    const sanitized = inputFee.replace(",", ".").replace(/[^0-9.]/g, "");
    const parsed = parseFloat(sanitized);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setInputFee(t("placeholders.fee"));
      set("priceCents", 0);
    } else {
      setInputFee(`${parsed.toFixed(2)}€`);
      set("priceCents", Math.round(parsed * 100));
    }
  }

  async function handleSend() {
    setSending(true);
    setError(null);
    const result = await createEvent({
      title: form.title || t("noTitle"),
      type: form.type === "other" ? "challenge" : form.type,
      location: form.location || "",
      startDate: form.startDate || new Date(),
      maxParticipants: form.maxPlayers,
      isPublic: true,
      recurrence: form.recurrence,
      teamId,
      priceCents: form.priceCents,
      paymentRequired: form.paymentRequired,
      paymentDeadlineHours: form.paymentDeadlineHours
        ? Number.parseInt(form.paymentDeadlineHours, 10)
        : null,
      rosterOnly: form.rosterOnly,
      rosterPriorityHours: form.rosterPriorityHours,
      mbwayEnabled: form.mbwayEnabled,
      mbwayPhone: form.mbwayPhone,
      transferRequiresProof: form.transferRequiresProof,
      invitedPlayers: rosterPlayers
        .filter(player => selectedPlayerIds.includes(player.id))
        .map(player => ({
          id: player.id,
          name: player.name,
          email: player.email,
          isVerified: player.isVerified,
        })),
    });
    setSending(false);
    if (result.success) {
      setDone(true);
      onCreated?.();
    } else {
      setError(t("error"));
    }
  }

  function togglePlayer(id: string) {
    setSelectedPlayerIds(current =>
      current.includes(id) ? current.filter(i => i !== id) : [...current, id],
    );
  }

  function selectAllPlayers() {
    setSelectedPlayerIds(rosterPlayers.map(p => p.id));
  }

  function clearAllPlayers() {
    setSelectedPlayerIds([]);
  }

  return {
    t,
    step,
    setStep,
    form,
    set,
    inputFee,
    searchQuery,
    setSearchQuery,
    sending,
    done,
    error,
    selectedPlayerIds,
    rosterPlayers,
    filteredPlayers,
    canAdvance,
    handleFeeChange,
    handleFeeFocus,
    handleFeeBlur,
    handleSend,
    togglePlayer,
    selectAllPlayers,
    clearAllPlayers,
  };
}
