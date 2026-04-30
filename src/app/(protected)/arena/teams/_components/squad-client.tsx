"use client";

import { Plus, Search, Star, VerifiedIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

const PLAYERS = [
  {
    id: 1,
    name: "Diogo Ferreira",
    role: "GR",
    status: "confirmed" as const,
    goals: 0,
    assists: 1,
    rating: 8.2,
    games: 22,
    highlight: true,
    isVerified: true,
  },
  {
    id: 2,
    name: "André Costa",
    role: "DD",
    status: "confirmed" as const,
    goals: 1,
    assists: 3,
    rating: 7.5,
    games: 19,
    highlight: false,
    isVerified: true,
  },
  {
    id: 3,
    name: "Tiago Mendes",
    role: "DC",
    status: "confirmed" as const,
    goals: 0,
    assists: 0,
    rating: 7.8,
    games: 21,
    highlight: false,
  },
  {
    id: 4,
    name: "Bruno Alves",
    role: "DC",
    status: "confirmed" as const,
    goals: 2,
    assists: 1,
    rating: 8.0,
    games: 20,
    highlight: false,
  },
  {
    id: 5,
    name: "Ricardo Pinto",
    role: "DE",
    status: "confirmed" as const,
    goals: 0,
    assists: 5,
    rating: 8.5,
    games: 24,
    highlight: true,
  },
  {
    id: 6,
    name: "Fábio Rodrigues",
    role: "MC",
    status: "confirmed" as const,
    goals: 3,
    assists: 4,
    rating: 7.2,
    games: 18,
    highlight: false,
  },
  {
    id: 7,
    name: "Nuno Santos",
    role: "MC",
    status: "confirmed" as const,
    goals: 1,
    assists: 6,
    rating: 7.9,
    games: 23,
    highlight: false,
  },
  {
    id: 8,
    name: "João Martins",
    role: "MD",
    status: "reserve" as const,
    goals: 5,
    assists: 8,
    rating: 8.8,
    games: 20,
    highlight: false,
  },
  {
    id: 9,
    name: "Carlos Sousa",
    role: "ME",
    status: "confirmed" as const,
    goals: 2,
    assists: 2,
    rating: 7.3,
    games: 17,
    highlight: false,
  },
  {
    id: 10,
    name: "Luís Oliveira",
    role: "PD",
    status: "reserve" as const,
    goals: 4,
    assists: 3,
    rating: 7.6,
    games: 19,
    highlight: false,
  },
  {
    id: 11,
    name: "Miguel Pereira",
    role: "PE",
    status: "pending" as const,
    goals: 7,
    assists: 9,
    rating: 9.1,
    games: 22,
    highlight: false,
  },
  {
    id: 12,
    name: "Rui Gomes",
    role: "CA",
    status: "confirmed" as const,
    goals: 6,
    assists: 7,
    rating: 8.3,
    games: 24,
    highlight: false,
  },
  {
    id: 13,
    name: "Paulo Fernandes",
    role: "MC",
    status: "refused" as const,
    goals: 0,
    assists: 1,
    rating: 6.8,
    games: 10,
    highlight: false,
  },
  {
    id: 14,
    name: "Sérgio Lima",
    role: "DC",
    status: "pending" as const,
    goals: 1,
    assists: 0,
    rating: 7.1,
    games: 14,
    highlight: false,
  },
  {
    id: 15,
    name: "Marco Carvalho",
    role: "GR",
    status: "confirmed" as const,
    goals: 0,
    assists: 0,
    rating: 7.4,
    games: 11,
    highlight: false,
  },
];

const FILTERS_DATA = [
  { id: "all", l: "filters.all" },
  { id: "confirmed", l: "filters.confirmed" },
  { id: "reserve", l: "filters.reserves" },
  { id: "pending", l: "filters.pending" },
];

export function SquadClient({ userId }: { userId: string }) {
  const t = useTranslations("arenaSquad");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = PLAYERS.filter(p => {
    const ms =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || p.status === filter;
    return ms && mf;
  });

  return (
    <>
      {showAdd && (
        <AddPlayerSheet onClose={() => setShowAdd(false)} managerId={userId} />
      )}

      <div className="jb-page">
        <div className="jb-page-inner">
          <header className="jb-topbar">
            <div>
              <div className="jb-kicker">{t("kicker")}</div>
              <h1 className="jb-title">{t("title")}</h1>
            </div>
            <Button
              className="jb-action jb-action-primary hidden md:inline-flex"
              onClick={() => setShowAdd(true)}
              type="button"
              variant="ghost"
              size="sm"
            >
              <Plus size={15} strokeWidth={2.5} />
              {t("actions.add")}
            </Button>
          </header>

          <div>
            {/* Search bar */}
            <div className="flex h-11 items-center gap-2.5 rounded-[12px] border border-arena-border bg-arena-surface px-3.5">
              <Search size={16} className="shrink-0 text-arena-text-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("search.placeholder")}
                className="flex-1 border-none bg-transparent p-0 text-sm text-arena-text shadow-none placeholder:text-arena-text-muted/70 focus-visible:ring-0"
              />
              {search && (
                <Button
                  onClick={() => setSearch("")}
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  className="h-6 w-6 min-h-0 min-w-0 text-arena-text-muted hover:text-arena-text"
                  aria-label="Limpar pesquisa"
                >
                  <X size={14} strokeWidth={2} />
                </Button>
              )}
            </div>

            {/* Filter chips */}
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={v => v && setFilter(v)}
              className="jb-toolbar mt-2.5 pb-1 justify-start"
            >
              {FILTERS_DATA.map(f => (
                <ToggleGroupItem
                  key={f.id}
                  value={f.id}
                  className="jb-chip h-auto data-[state=on]:border-arena-primary/40 data-[state=on]:bg-arena-primary/8 data-[state=on]:text-arena-primary"
                >
                  {t(f.l)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-[18px] border border-arena-border bg-arena-surface">
                <Search size={24} className="text-arena-text-muted" strokeWidth={1.5} />
              </div>
              <div className="text-[15px] font-semibold text-arena-text">
                {t("search.noResults")}
              </div>
              <Button
                onClick={() => setShowAdd(true)}
                className="h-[42px] rounded-[12px] bg-arena-primary px-5 text-[13px] font-bold text-arena-bg hover:bg-arena-primary/90"
                type="button"
              >
                {t("actions.addPlayer")}
              </Button>
            </div>
          ) : (
            <>
              <div className="jb-section-label">
                {t("stats.playerCount", { count: filtered.length })}
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3.5 py-3"
                  >
                    <JbAvatar name={p.name} size={40} id={p.id} />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-arena-text">
                          {p.name}
                        </span>
                        {p.isVerified && (
                          <VerifiedIcon
                            color="var(--user-verified)"
                            size={12}
                            className="text-arena-verified fill-arena-verified"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-[5px] border border-arena-border bg-arena-surface-el px-1.5 py-0.5 text-[10px] font-bold text-arena-text-muted">
                          {p.role}
                        </span>
                        <span className="text-[11px] text-arena-text-muted">
                          ⭐ {p.rating}
                        </span>
                      </div>
                    </div>
                    <JbBadge status={p.status} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FAB — mobile only */}
        <Button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-[90px] right-6 z-[100] flex size-[52px] items-center justify-center rounded-full bg-arena-primary text-arena-bg shadow-[0_4px_20px_color-mix(in_srgb,var(--color-arena-primary)_33%,transparent)] hover:bg-arena-primary/90 md:hidden"
          type="button"
          aria-label={t("actions.add")}
        >
          <Plus size={22} strokeWidth={2.5} />
        </Button>
      </div>
    </>
  );
}
