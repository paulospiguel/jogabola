"use client";

import { Calendar, Check, Clock, List, MapPin, Trophy, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { JbScreenHeader } from "@/components/arena/jb-screen-header";
import { C } from "@/components/arena/tokens";

const MOCK_CONFIRMED = [
  { id: 1, name: "Diogo Ferreira", role: "GR" },
  { id: 5, name: "Ricardo Pinto", role: "DE" },
  { id: 4, name: "Bruno Alves", role: "DC" },
  { id: 7, name: "Nuno Santos", role: "MC" },
  { id: 12, name: "Rui Gomes", role: "CA" },
];

const MOCK_RESERVES = [
  { id: 8, name: "João Martins", role: "MD" },
  { id: 10, name: "Luís Oliveira", role: "PD" },
];

const MOCK_PENDING = [
  { id: 11, name: "Miguel Pereira", role: "PE" },
  { id: 14, name: "Sérgio Lima", role: "DC" },
];

interface EventDetailClientProps {
  event: {
    id: number;
    title: string;
    type: string;
    location: string;
    startDate: Date | string;
    maxParticipants?: string | null;
    description?: string | null;
  };
  userId: string;
}

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Tab = "conv" | "local";

export function EventDetailClient({ event }: EventDetailClientProps) {
  const t = useTranslations("arenaEventDetail");
  const [tab, setTab] = useState<Tab>("conv");
  const [myStatus, setMyStatus] = useState<"pending" | "confirmed">("pending");

  const isJogo = event.type === "partida" || event.type === "jogo";
  const total = Number(event.maxParticipants) || 14;
  const fillPct = (MOCK_CONFIRMED.length / total) * 100;

  const TABS_DATA = [
    { id: "conv" as Tab, label: t("tabs.call"), icon: List },
    { id: "local" as Tab, label: t("tabs.local"), icon: MapPin },
  ];

  return (
    <div
      style={{
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <JbScreenHeader title={isJogo ? t("titleJogo") : t("titleTreino")} />

      <div
        style={{
          padding: "14px 20px",
          background: `linear-gradient(180deg,#0F1E2E 0%,${C.bg} 100%)`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: isJogo ? `${C.primary}22` : `${C.info}22`,
              border: `1px solid ${isJogo ? `${C.primary}44` : `${C.info}44`}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Trophy size={18} color={isJogo ? C.primary : C.info} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: isJogo ? C.primary : C.info,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {isJogo ? t("officialMatch") : t("training")}
            </div>
            <div
              style={{
                color: C.text,
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {event.title}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {[
            { Icon: Calendar, key: "date", t: formatDate(event.startDate) },
            { Icon: Clock, key: "time", t: formatTime(event.startDate) },
            { Icon: MapPin, key: "location", t: event.location },
          ].map(({ Icon, key, t: label }) => (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Icon size={12} color={C.textMuted} />
              <span style={{ color: C.textSec, fontSize: 12 }}>{label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: C.textSec, fontSize: 12 }}>{t("spots")}</span>
            <span style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: C.success }}>{MOCK_CONFIRMED.length}</span>{" "}
              / {total}
            </span>
          </div>
          <div
            style={{
              height: 5,
              background: C.border,
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(fillPct, 100)}%`,
                background: fillPct >= 100 ? C.danger : C.success,
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        {TABS_DATA.map(t_item => {
          const Icon = t_item.icon;
          const isActive = tab === t_item.id;
          return (
            <button
              key={t_item.id}
              onClick={() => setTab(t_item.id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "11px 0",
                border: "none",
                background: "transparent",
                color: isActive ? C.primary : C.textMuted,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                borderBottom: `2px solid ${isActive ? C.primary : "transparent"}`,
                marginBottom: -1,
                cursor: "pointer",
              }}
            >
              <Icon size={13} color={isActive ? C.primary : C.textMuted} />
              {t_item.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          paddingBottom: 80,
        }}
      >
        {tab === "conv" && (
          <div style={{ padding: "14px 20px" }}>
            <div
              style={{
                color: C.textMuted,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                paddingBottom: 8,
              }}
            >
              {t("lists.main", { count: MOCK_CONFIRMED.length })}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                marginBottom: 14,
              }}
            >
              {MOCK_CONFIRMED.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    background: C.surface,
                    borderRadius:
                      i === 0
                        ? "14px 14px 4px 4px"
                        : i === MOCK_CONFIRMED.length - 1
                          ? "4px 4px 14px 14px"
                          : 4,
                    border: `1px solid ${C.border}`,
                    borderTop: i > 0 ? "none" : undefined,
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      color: C.textMuted,
                      fontSize: 11,
                      fontWeight: 700,
                      width: 20,
                      textAlign: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                  <JbAvatar name={p.name} size={30} id={p.id} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ color: C.text, fontSize: 13, fontWeight: 600 }}
                    >
                      {p.name}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 10 }}>
                      {p.role}
                    </div>
                  </div>
                  <Check size={15} color={C.success} strokeWidth={2.5} />
                </div>
              ))}
            </div>

            <div
              style={{
                color: C.textMuted,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                paddingBottom: 8,
              }}
            >
              {t("lists.reserves", {
                count: MOCK_RESERVES.length + MOCK_PENDING.length,
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                ...MOCK_RESERVES.map(p => ({
                  ...p,
                  status: "reserve" as const,
                })),
                ...MOCK_PENDING.map(p => ({
                  ...p,
                  status: "pending" as const,
                })),
              ].map((p, i, arr) => (
                <div
                  key={p.id}
                  style={{
                    background: C.surface,
                    borderRadius:
                      i === 0
                        ? "14px 14px 4px 4px"
                        : i === arr.length - 1
                          ? "4px 4px 14px 14px"
                          : 4,
                    border: `1px solid ${C.border}`,
                    borderTop: i > 0 ? "none" : undefined,
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    opacity: 0.8,
                  }}
                >
                  <JbAvatar name={p.name} size={30} id={p.id} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ color: C.text, fontSize: 13, fontWeight: 600 }}
                    >
                      {p.name}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 10 }}>
                      {p.role}
                    </div>
                  </div>
                  <JbBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "local" && (
          <div style={{ padding: "14px 20px" }}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  height: 100,
                  background: C.bgSec,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={32} color={C.primary} />
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div
                  style={{
                    color: C.text,
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  {event.location}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      height: 36,
                      borderRadius: 10,
                      background: C.surfaceEl,
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      color: C.textSec,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Google Maps
                  </a>
                  <a
                    href={`https://maps.apple.com/?q=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      height: 36,
                      borderRadius: 10,
                      background: C.surfaceEl,
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      color: C.textSec,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Apple Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 72,
          left: 0,
          right: 0,
          padding: "10px 20px 14px",
          background: `linear-gradient(0deg,${C.bg} 60%,transparent)`,
        }}
        className="md:hidden"
      >
        <button
          onClick={() =>
            setMyStatus(s => (s === "confirmed" ? "pending" : "confirmed"))
          }
          style={{
            width: "100%",
            height: 50,
            borderRadius: 14,
            background: myStatus === "confirmed" ? C.surfaceEl : C.primary,
            border: myStatus === "confirmed" ? `1px solid ${C.border}` : "none",
            color: myStatus === "confirmed" ? C.textSec : "#0B0F14",
            fontSize: 15,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          {myStatus === "confirmed" ? (
            <>
              <X size={18} color={C.textSec} strokeWidth={2.5} />{" "}
              {t("actions.cancel")}
            </>
          ) : (
            <>
              <Check size={18} color="#0B0F14" strokeWidth={2.5} />{" "}
              {t("actions.confirm")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
