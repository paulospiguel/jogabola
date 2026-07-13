"use client";

import { motion } from "framer-motion";
import { Plus, Users2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { Cta } from "@/components/arena/cta";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useSquadClientState } from "../_hooks/use-squad-client-state";
import { SquadEmailSheet } from "./squad-email-sheet";
import { SquadFilterPills } from "./squad-filter-pills";
import { SquadGroupSheet } from "./squad-group-sheet";
import { SquadGroupsStrip } from "./squad-groups-strip";
import { SquadPlayerRow } from "./squad-player-row";
import { SquadSearchBar } from "./squad-search-bar";

export function SquadClient({ userId }: { userId: string }) {
  const t = useTranslations("arenaSquad");
  const {
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
  } = useSquadClientState();

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
        <SquadEmailSheet
          emailFeedback={emailFeedback}
          emailLimit={emailLimit}
          emailMessage={emailMessage}
          emailPlayer={emailPlayer}
          emailSubject={emailSubject}
          emailUsage={emailUsage}
          isSendingEmail={isSendingEmail}
          onClose={() => setEmailPlayer(null)}
          onEmailMessageChange={setEmailMessage}
          onEmailSubjectChange={setEmailSubject}
          onSend={sendEmailToPlayer}
          t={t}
        />
      )}

      {groupOpen && (
        <SquadGroupSheet
          editing={Boolean(editingGroupId)}
          groupName={groupName}
          groupSelection={groupSelection}
          onClose={closeGroupSheet}
          onGroupNameChange={setGroupName}
          onSave={saveGroup}
          onTogglePlayer={toggleGroupPlayer}
          players={players}
          t={t}
        />
      )}

      <motion.div
        className="mx-auto h-full max-w-screen-lg "
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="jb-page-inner flex flex-col">
          <header className="flex w-full items-center justify-between py-4 mb-5 border-b border-arena-border/20 shrink-0">
            <h1 className="text-xl font-extrabold text-arena-text tracking-tight">
              {t("title")}
            </h1>

            <div className="flex items-center gap-2"></div>
          </header>

          {/* Search Bar */}
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
            {filteredPlayers.length === 0 ? (
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
                <Cta
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAdd(true)}
                >
                  {t("actions.addPlayer")}
                </Cta>
              </div>
            ) : (
              <>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.08em] text-arena-text-muted">
                  {t("stats.playerCount", { count: filteredPlayers.length })}
                </p>
                <div className="space-y-2">
                  {filteredPlayers.map((p, i) => (
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
