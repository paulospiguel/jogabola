"use client";

import { Plus, Search, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { C } from "@/components/arena/tokens";

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
            <button
              className="jb-action jb-action-primary hidden md:inline-flex"
              onClick={() => setShowAdd(true)}
              type="button"
            >
              <Plus size={15} strokeWidth={2.5} />
              {t("actions.add")}
            </button>
          </header>

          <div>
            <div
              style={{
                height: 44,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 14px",
              }}
            >
              <Search size={16} color={C.textMuted} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("search.placeholder")}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} color={C.textMuted} strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="jb-toolbar mt-2.5 pb-1">
              {FILTERS_DATA.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`jb-chip ${filter === f.id ? "jb-chip-active" : ""}`}
                  type="button"
                >
                  {t(f.l)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "40px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search size={24} color={C.textMuted} strokeWidth={1.5} />
              </div>
              <div style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>
                {t("search.noResults")}
              </div>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  height: 42,
                  padding: "0 20px",
                  borderRadius: 12,
                  background: C.primary,
                  border: "none",
                  color: "#0B0F14",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("actions.addPlayer")}
              </button>
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
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <JbAvatar name={p.name} size={40} id={p.id} />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginBottom: 3,
                        }}
                      >
                        <span
                          style={{
                            color: C.text,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {p.name}
                        </span>
                        {p.highlight && (
                          <Star
                            size={12}
                            color={C.highlight}
                            fill={C.highlight}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            background: C.surfaceEl,
                            border: `1px solid ${C.border}`,
                            color: C.textMuted,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 5,
                          }}
                        >
                          {p.role}
                        </span>
                        <span style={{ color: C.textMuted, fontSize: 11 }}>
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

        <button
          onClick={() => setShowAdd(true)}
          className="md:hidden"
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: C.primary,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 20px ${C.primary}55`,
            cursor: "pointer",
            zIndex: 100,
          }}
        >
          <Plus size={22} color="#0B0F14" strokeWidth={2.5} />
        </button>
      </div>

      <style>{`
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}
