"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";
import { sendRosterPlayerEmail } from "@/actions/teams.actions";
import type { SquadPlayer } from "@/hooks/use-squad";
import { useSquad } from "@/hooks/use-squad";
import { useTeams } from "@/hooks/use-teams";
import type { SquadFilterKey } from "../_components/squad-filter-pills";

export interface RosterGroup {
  id: string;
  name: string;
  playerIds: string[];
}

const FILTERS: { key: SquadFilterKey; labelKey: string }[] = [
  { key: "all", labelKey: "filters.all" },
  { key: "confirmed", labelKey: "filters.confirmed" },
  { key: "reserve", labelKey: "filters.reserves" },
  { key: "pending", labelKey: "filters.pending" },
];

function emailLimitFor(planTier: string) {
  if (planTier === "elite") return Number.POSITIVE_INFINITY;
  if (planTier === "pro") return 10;
  return 3;
}

function matchesFilter(player: SquadPlayer, filter: SquadFilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "confirmed") return player.status === "confirmed";
  if (filter === "reserve") return player.status === "reserve";
  if (filter === "pending") {
    return player.status === "pending" || player.status === "new";
  }
  return true;
}

export function useSquadClientState() {
  const t = useTranslations("arenaSquad");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SquadFilterKey>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [emailPlayer, setEmailPlayer] = useState<SquadPlayer | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupSelection, setGroupSelection] = useState<string[]>([]);
  const [groups, setGroups] = useState<RosterGroup[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);
  const [isSendingEmail, startEmailTransition] = useTransition();
  const [emailUsage, setEmailUsage] = useState(0);

  const { players, activeTeamId, isLoading } = useSquad();
  const { planTier } = useTeams();
  const emailLimit = emailLimitFor(planTier);
  const filters = FILTERS.map(({ key, labelKey }) => ({
    key,
    label: t(labelKey),
  }));
  const emailStorageKey = `jogabola.rosterEmailUsage.${new Date().toISOString().slice(0, 7)}`;
  const groupStorageKey = activeTeamId
    ? `jogabola.rosterGroups.${activeTeamId}`
    : null;

  useEffect(() => {
    if (!groupStorageKey || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(groupStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as RosterGroup[];
      setGroups(Array.isArray(parsed) ? parsed : []);
    } catch {
      setGroups([]);
    }
  }, [groupStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setEmailUsage(Number(window.localStorage.getItem(emailStorageKey) ?? "0"));
  }, [emailStorageKey]);

  const filteredPlayers = useMemo(
    () =>
      players.filter(player => {
        const normalizedSearch = search.toLowerCase();
        const matchSearch =
          player.name.toLowerCase().includes(normalizedSearch) ||
          (player.position ?? "").toLowerCase().includes(normalizedSearch) ||
          (player.email ?? "").toLowerCase().includes(normalizedSearch);
        return matchSearch && matchesFilter(player, filter);
      }),
    [players, search, filter],
  );

  function saveGroups(next: RosterGroup[]) {
    setGroups(next);
    if (groupStorageKey && typeof window !== "undefined") {
      window.localStorage.setItem(groupStorageKey, JSON.stringify(next));
    }
  }

  function openCreateGroup() {
    setEditingGroupId(null);
    setGroupName("");
    setGroupSelection([]);
    setGroupOpen(true);
  }

  function openEditGroup(group: RosterGroup) {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setGroupSelection(group.playerIds);
    setGroupOpen(true);
  }

  function saveGroup() {
    if (!groupName.trim() || groupSelection.length === 0) return;
    if (editingGroupId) {
      saveGroups(
        groups.map(group =>
          group.id === editingGroupId
            ? { ...group, name: groupName.trim(), playerIds: groupSelection }
            : group,
        ),
      );
    } else {
      saveGroups([
        ...groups,
        {
          id: crypto.randomUUID(),
          name: groupName.trim(),
          playerIds: groupSelection,
        },
      ]);
    }
    setGroupName("");
    setGroupSelection([]);
    setEditingGroupId(null);
    setGroupOpen(false);
  }

  function closeGroupSheet() {
    setGroupOpen(false);
    setEditingGroupId(null);
  }

  function toggleGroupPlayer(playerId: string) {
    setGroupSelection(current =>
      current.includes(playerId)
        ? current.filter(id => id !== playerId)
        : [...current, playerId],
    );
  }

  function openEmail(player: SquadPlayer) {
    setEmailPlayer(player);
    setEmailSubject(t("email.defaultSubject"));
    setEmailMessage("");
    setEmailFeedback(null);
  }

  function sendEmailToPlayer() {
    if (!emailPlayer || !activeTeamId) return;
    if (emailUsage >= emailLimit) {
      setEmailFeedback(t("email.limitReached"));
      return;
    }
    setEmailFeedback(null);
    startEmailTransition(async () => {
      const result = await sendRosterPlayerEmail({
        teamId: activeTeamId,
        playerId: emailPlayer.id,
        subject: emailSubject,
        message: emailMessage,
      });
      if (result.success) {
        const nextUsage = emailUsage + 1;
        setEmailUsage(nextUsage);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(emailStorageKey, String(nextUsage));
        }
        setEmailFeedback(t("email.sent"));
      } else {
        setEmailFeedback(t("email.error"));
      }
    });
  }

  return {
    activeTeamId,
    closeGroupSheet,
    editingGroupId,
    emailFeedback,
    emailLimit,
    emailMessage,
    emailPlayer,
    emailSubject,
    emailUsage,
    filter,
    filteredPlayers,
    filters,
    groupName,
    groupOpen,
    groups,
    groupSelection,
    isLoading,
    isSendingEmail,
    openCreateGroup,
    openEditGroup,
    openEmail,
    players,
    saveGroup,
    search,
    sendEmailToPlayer,
    setEmailMessage,
    setEmailPlayer,
    setEmailSubject,
    setFilter,
    setGroupName,
    setSearch,
    setShowAdd,
    showAdd,
    toggleGroupPlayer,
  };
}
