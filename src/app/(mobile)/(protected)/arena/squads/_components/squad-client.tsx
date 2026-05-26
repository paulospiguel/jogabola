"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ListPlus, Plus, Send, Users2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";
import { sendRosterPlayerEmail } from "@/actions/teams.actions";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { JbAvatar } from "@/components/arena/avatar";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import Loading from "@/components/loading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SquadPlayer } from "@/hooks/use-squad";
import { useSquad } from "@/hooks/use-squad";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";
import { type SquadFilterKey, SquadFilterPills } from "./squad-filter-pills";
import { SquadGroupsStrip } from "./squad-groups-strip";
import { SquadPlayerRow } from "./squad-player-row";
import { SquadSearchBar } from "./squad-search-bar";

const FILTERS: { key: SquadFilterKey; labelKey: string }[] = [
  { key: "all", labelKey: "filters.all" },
  { key: "confirmed", labelKey: "filters.confirmed" },
  { key: "reserve", labelKey: "filters.reserves" },
  { key: "pending", labelKey: "filters.pending" },
];

interface RosterGroup {
  id: string;
  name: string;
  playerIds: string[];
}

function emailLimitFor(planTier: string) {
  if (planTier === "elite") return Number.POSITIVE_INFINITY;
  if (planTier === "pro") return 10;
  return 3;
}

function matchesFilter(p: SquadPlayer, filter: SquadFilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "confirmed") return p.status === "confirmed";
  if (filter === "reserve") return p.status === "reserve";
  if (filter === "pending") return p.status === "pending" || p.status === "new";
  return true;
}

export function SquadClient({ userId }: { userId: string }) {
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
  const [emailUsage, setEmailUsage] = useState(0);

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

  const filtered = useMemo(
    () =>
      players.filter(p => {
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.position ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.email ?? "").toLowerCase().includes(search.toLowerCase());
        return matchSearch && matchesFilter(p, filter);
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

  function openEmail(player: SquadPlayer) {
    setEmailPlayer(player);
    setEmailSubject("Mensagem da equipa");
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading text={t("loading")} />
      </div>
    );
  }

  return (
    <>
      {showAdd && (
        <AddPlayerSheet
          onClose={() => setShowAdd(false)}
          managerId={userId}
          teamId={activeTeamId}
        />
      )}

      {emailPlayer && (
        <BottomSheet
          title={t("email.title", { name: emailPlayer.name })}
          onClose={() => setEmailPlayer(null)}
        >
          <div className="space-y-3 overflow-auto">
            <div className="rounded-[14px] border border-arena-border bg-arena-surface px-3 py-2 text-[12px] text-arena-text-sec">
              {Number.isFinite(emailLimit)
                ? t("email.usage", { used: emailUsage, limit: emailLimit })
                : t("email.unlimited")}
            </div>
            <Input
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              placeholder={t("email.subject")}
              className="border-arena-border bg-arena-surface text-arena-text"
            />
            <Textarea
              value={emailMessage}
              onChange={e => setEmailMessage(e.target.value)}
              placeholder={t("email.message")}
              className="min-h-32 border-arena-border bg-arena-surface text-arena-text"
            />
            {emailFeedback && (
              <div className="rounded-[12px] border border-arena-border bg-arena-bg px-3 py-2 text-[12px] text-arena-text-sec">
                {emailFeedback}
              </div>
            )}
            <Cta
              variant="primary"
              size="md"
              fullWidth
              onClick={sendEmailToPlayer}
              disabled={
                isSendingEmail ||
                !emailSubject.trim() ||
                !emailMessage.trim() ||
                emailUsage >= emailLimit
              }
            >
              <Send size={15} />
              {t("email.send")}
            </Cta>
          </div>
        </BottomSheet>
      )}

      {groupOpen && (
        <BottomSheet
          title={
            editingGroupId ? t("groups.editTitle") : t("groups.createTitle")
          }
          onClose={() => {
            setGroupOpen(false);
            setEditingGroupId(null);
          }}
        >
          <div className="space-y-3 overflow-auto">
            <Input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder={t("groups.namePlaceholder")}
              className="border-arena-border bg-arena-surface text-arena-text"
            />
            <div className="max-h-72 space-y-2 overflow-auto">
              {players.map(player => {
                const checked = groupSelection.includes(player.id);
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() =>
                      setGroupSelection(current =>
                        checked
                          ? current.filter(id => id !== player.id)
                          : [...current, player.id],
                      )
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[12px] border px-3 py-2 text-left",
                      checked
                        ? "border-arena-primary/50 bg-arena-primary/10"
                        : "border-arena-border bg-arena-surface",
                    )}
                  >
                    <JbAvatar
                      image={player.image}
                      name={player.name}
                      size={32}
                      id={player.id}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-arena-text">
                      {player.name}
                    </span>
                    {checked && (
                      <CheckCircle2 size={16} className="text-arena-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            <Cta
              variant="primary"
              size="md"
              fullWidth
              onClick={saveGroup}
              disabled={!groupName.trim() || groupSelection.length === 0}
            >
              <ListPlus size={15} />
              {editingGroupId ? t("groups.update") : t("groups.create")}
            </Cta>
          </div>
        </BottomSheet>
      )}

      <motion.div
        className="flex h-full flex-col bg-arena-bg"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        <SquadSearchBar
          onSearchChange={setSearch}
          placeholder={t("search.placeholder")}
          search={search}
        />

        <SquadFilterPills
          activeFilter={filter}
          filters={filters}
          onFilterChange={setFilter}
        />

        <SquadGroupsStrip
          groups={groups}
          onCreateGroup={openCreateGroup}
          onEditGroup={openEditGroup}
          t={t}
        />

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-[16px] border border-arena-border bg-arena-surface">
                <Users2
                  size={24}
                  className="text-arena-text-muted"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-[15px] font-bold text-arena-text">
                  {t("search.noResults")}
                </p>
              </div>
              <Cta variant="primary" size="sm" onClick={() => setShowAdd(true)}>
                {t("actions.addPlayer")}
              </Cta>
            </div>
          ) : (
            <>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.08em] text-arena-text-muted">
                {t("stats.playerCount", { count: filtered.length })}
              </p>
              <div className="space-y-2">
                {filtered.map((p, i) => (
                  <SquadPlayerRow
                    key={p.id}
                    player={p}
                    index={i}
                    onEmail={openEmail}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-[90px] right-6 z-[100] flex size-[52px] items-center justify-center rounded-full bg-arena-primary text-arena-bg shadow-[0_4px_20px_color-mix(in_srgb,var(--color-arena-primary)_33%,transparent)] transition-all hover:bg-arena-primary/90 active:scale-[0.97] md:hidden"
        type="button"
        aria-label={t("actions.add")}
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
    </>
  );
}
