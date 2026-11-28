"use client";

import { useTranslations } from "next-intl";
import type { CSSProperties, ReactNode } from "react";

export type PhoneScreen =
  | "team"
  | "journey"
  | "create"
  | "convoca"
  | "paid"
  | "secretary"
  | "timer";

interface PhoneMockupProps {
  scale?: number;
  screen?: PhoneScreen;
  accent?: string;
  className?: string;
}

const NAMES = [
  "Diogo F",
  "André C",
  "Tiago M",
  "Bruno A",
  "Ricardo P",
  "João S",
  "Pedro M",
  "Hugo F",
];

const initials = (name: string) =>
  name
    .split(" ")
    .map(part => part[0])
    .slice(0, 2)
    .join("");

export function PhoneMockup({
  scale = 1,
  screen = "team",
  accent = "#7CFF4F",
  className,
}: PhoneMockupProps) {
  const t = useTranslations("homePage.phoneMockup");
  const px = (value: number) => value * scale;
  const W = px(320);
  const H = px(660);

  const wrap: CSSProperties = {
    width: W,
    height: H,
    borderRadius: px(44),
    background: "#0B0F14",
    border: `${Math.max(1, px(1.5))}px solid #1B2430`,
    boxShadow: `0 ${px(30)}px ${px(80)}px rgba(0,0,0,0.55), inset 0 0 0 ${px(5)}px #06090D`,
    padding: px(5),
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  };

  const Avatar = ({ name, size = 28 }: { name: string; size?: number }) => {
    const hues = [10, 55, 130, 200, 260, 320];
    const hue = hues[name.charCodeAt(0) % hues.length];

    return (
      <div
        style={{
          width: px(size),
          height: px(size),
          borderRadius: "50%",
          background: `oklch(58% 0.13 ${hue})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: px(size * 0.36),
          fontWeight: 800,
          color: "#0B0F14",
          flexShrink: 0,
        }}
      >
        {initials(name)}
      </div>
    );
  };

  const Card = ({
    children,
    glow,
    tone = "default",
  }: {
    children: ReactNode;
    glow?: boolean;
    tone?: "default" | "info" | "warning";
  }) => {
    const borderColor = glow
      ? `${accent}44`
      : tone === "info"
        ? "rgba(56,189,248,0.38)"
        : tone === "warning"
          ? "rgba(245,158,11,0.38)"
          : "#263244";
    const bg = glow
      ? `linear-gradient(135deg, ${accent}22, ${accent}05)`
      : tone === "info"
        ? "rgba(56,189,248,0.1)"
        : tone === "warning"
          ? "rgba(245,158,11,0.1)"
          : "#151C26";

    return (
      <div
        style={{
          background: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: px(14),
          padding: px(12),
        }}
      >
        {children}
      </div>
    );
  };

  const StatusBar = () => (
    <div
      style={{
        height: px(36),
        padding: `0 ${px(20)}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: px(11),
        fontWeight: 700,
        position: "relative",
        zIndex: 2,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: px(4), alignItems: "center" }}>
        <div style={{ display: "flex", gap: px(1.5), alignItems: "flex-end" }}>
          {[3, 5, 7, 9].map(height => (
            <span
              key={height}
              style={{
                width: px(2),
                height: px(height),
                background: "#F5F7FA",
                borderRadius: px(0.5),
              }}
            />
          ))}
        </div>
        <div
          style={{
            width: px(22),
            height: px(10),
            border: "1px solid #F5F7FA",
            borderRadius: px(2.5),
            padding: px(1),
            marginLeft: px(3),
          }}
        >
          <div
            style={{
              width: "70%",
              height: "100%",
              background: "#F5F7FA",
              borderRadius: px(1),
            }}
          />
        </div>
      </div>
    </div>
  );

  const ScreenShell = ({ children }: { children: ReactNode }) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0B0F14",
        borderRadius: px(38),
        overflow: "hidden",
        position: "relative",
        fontFamily: "Inter, sans-serif",
        color: "#F5F7FA",
      }}
    >
      <StatusBar />
      {children}
    </div>
  );

  const TeamScreen = () => (
    <div
      style={{
        padding: `0 ${px(18)}px`,
        display: "flex",
        flexDirection: "column",
        gap: px(14),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: px(4),
        }}
      >
        <div>
          <div
            style={{
              fontSize: px(10),
              color: "#6B7280",
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            {t("team.eyebrow")}
          </div>
          <div
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: px(20),
              fontWeight: 800,
            }}
          >
            Os Lobos FC
          </div>
        </div>
        <div
          style={{
            width: px(36),
            height: px(36),
            borderRadius: "50%",
            background: `${accent}22`,
            border: `1px solid ${accent}55`,
          }}
        />
      </div>

      <Card glow>
        <div
          style={{
            fontSize: px(9),
            color: accent,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {t("team.nextMatch")}
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(18),
            fontWeight: 800,
            marginTop: px(6),
          }}
        >
          {t("team.matchTime")}
        </div>
        <div style={{ fontSize: px(11), color: "#A7B0BE", marginTop: px(2) }}>
          {t("team.venue")}
        </div>
        <div
          style={{
            display: "flex",
            gap: px(10),
            marginTop: px(12),
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex" }}>
            {NAMES.slice(0, 4).map((name, index) => (
              <div key={name} style={{ marginLeft: index === 0 ? 0 : px(-7) }}>
                <Avatar name={name} size={22} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: px(11), fontWeight: 700 }}>
            {t("team.confirmedCount")}
          </div>
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: px(8),
        }}
      >
        {[
          ["14", t("team.stats.confirmed"), accent],
          ["3", t("team.stats.pending"), "#F59E0B"],
          ["11", t("team.stats.paid"), "#F5F7FA"],
        ].map(([value, label, color]) => (
          <Card key={label}>
            <div
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: px(20),
                fontWeight: 800,
                color,
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontSize: px(8),
                color: "#6B7280",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          </Card>
        ))}
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: px(8),
            fontSize: px(12),
            fontWeight: 800,
          }}
        >
          <span>{t("team.roster")}</span>
          <span style={{ color: "#6B7280", fontSize: px(10) }}>
            {t("team.playersCount")}
          </span>
        </div>
        {["Diogo Ferreira", "André Costa", "Ricardo Pinto", "Bruno Alves"].map(
          (name, index) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: px(10),
                padding: `${px(10)}px 0`,
                borderBottom: index < 3 ? "1px solid #1B2430" : "none",
              }}
            >
              <Avatar name={name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: px(12), fontWeight: 700 }}>{name}</div>
                <div style={{ fontSize: px(10), color: "#6B7280" }}>
                  {t("team.athlete")}
                </div>
              </div>
              <span
                style={{
                  fontSize: px(8),
                  color: index === 2 ? "#F59E0B" : "#22C55E",
                  fontWeight: 900,
                }}
              >
                {index === 2 ? t("team.pendingShort") : t("team.okShort")}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );

  const ConvocaScreen = () => (
    <div
      style={{
        padding: `0 ${px(18)}px`,
        display: "flex",
        flexDirection: "column",
        gap: px(12),
      }}
    >
      <div style={{ marginTop: px(4) }}>
        <div
          style={{
            fontSize: px(10),
            color: "#6B7280",
            fontWeight: 800,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          {t("convoca.eyebrow")}
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(18),
            fontWeight: 800,
          }}
        >
          {t("team.matchTime")}
        </div>
      </div>
      <Card glow>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: px(11), fontWeight: 800 }}>
            {t("convoca.confirmed")}
          </span>
          <span
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: px(20),
              fontWeight: 800,
              color: accent,
            }}
          >
            14<span style={{ fontSize: px(12), color: "#A7B0BE" }}>/14</span>
          </span>
        </div>
        <div
          style={{
            height: px(5),
            background: "rgba(11,15,20,0.5)",
            borderRadius: 99,
            overflow: "hidden",
            marginTop: px(8),
          }}
        >
          <div style={{ width: "100%", height: "100%", background: accent }} />
        </div>
      </Card>
      <Card>
        <div
          style={{
            fontSize: px(9),
            color: "#6B7280",
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginBottom: px(10),
          }}
        >
          {t("convoca.squadLabel")}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: px(6) }}>
          {NAMES.slice(0, 7).map(name => (
            <Avatar key={name} name={name} />
          ))}
          <div
            style={{
              width: px(28),
              height: px(28),
              borderRadius: "50%",
              background: "#1B2430",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              fontWeight: 800,
              fontSize: px(10),
            }}
          >
            +7
          </div>
        </div>
      </Card>
      <Card>
        <div
          style={{
            fontSize: px(9),
            color: "#6B7280",
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginBottom: px(8),
          }}
        >
          {t("convoca.activityTitle")}
        </div>
        {(t.raw("convoca.activityItems") as string[]).map(text => (
          <div
            key={text}
            style={{
              fontSize: px(10),
              color: "#A7B0BE",
              padding: `${px(6)}px 0`,
            }}
          >
            {text}
          </div>
        ))}
      </Card>
    </div>
  );

  const PaidScreen = () => (
    <div
      style={{
        padding: `0 ${px(18)}px`,
        display: "flex",
        flexDirection: "column",
        height: "90%",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: px(220),
          height: px(220),
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}33, transparent 65%)`,
          filter: "blur(20px)",
        }}
      />
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: "center", position: "relative" }}>
        <div
          style={{
            width: px(76),
            height: px(76),
            borderRadius: "50%",
            background: accent,
            margin: "0 auto",
            boxShadow: `0 0 ${px(40)}px ${accent}88`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0B0F14",
            fontSize: px(40),
            fontWeight: 900,
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(20),
            fontWeight: 800,
            marginTop: px(18),
          }}
        >
          {t("paid.title")}
        </div>
        <div
          style={{
            fontSize: px(11),
            color: "#A7B0BE",
            marginTop: px(6),
            lineHeight: 1.4,
          }}
        >
          {t("paid.subtitle")}
        </div>
      </div>
      <div style={{ marginTop: px(22) }}>
        <Card>
          {[
            [t("paid.from"), "Bruno Alves"],
            [t("paid.to"), "Os Lobos FC"],
            [t("paid.method"), "MB Way"],
            [t("paid.total"), "5,00 €"],
          ].map(([label, value], idx) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: px(10),
                padding: `${px(4)}px 0`,
              }}
            >
              <span style={{ color: "#6B7280" }}>{label}</span>
              <span
                style={{
                  color: idx === 3 ? accent : "#F5F7FA",
                  fontWeight: 800,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </Card>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );

  const SecretaryScreen = () => (
    <div
      style={{
        padding: `0 ${px(18)}px`,
        display: "flex",
        flexDirection: "column",
        gap: px(11),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: px(4),
        }}
      >
        <div>
          <div
            style={{
              fontSize: px(9),
              color: "#38BDF8",
              fontWeight: 800,
              letterSpacing: 0.7,
              textTransform: "uppercase",
            }}
          >
            {t("secretary.eyebrow")}
          </div>
          <div
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: px(18),
              fontWeight: 800,
            }}
          >
            {t("secretary.title")}
          </div>
        </div>
        <span
          style={{
            fontSize: px(8),
            fontWeight: 800,
            color: accent,
            background: `${accent}1A`,
            border: `1px solid ${accent}44`,
            borderRadius: px(6),
            padding: `${px(3)}px ${px(7)}px`,
            textTransform: "uppercase",
          }}
        >
          {t("secretary.scopeBadge")}
        </span>
      </div>

      <Card tone="info">
        <div
          style={{
            fontSize: px(9),
            color: "#38BDF8",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {t("secretary.draftLabel")}
        </div>
        <div
          style={{
            fontSize: px(11),
            color: "#F5F7FA",
            marginTop: px(5),
            lineHeight: 1.45,
          }}
        >
          {t("secretary.draftText")}
        </div>
      </Card>

      <Card>
        <div
          style={{
            fontSize: px(9),
            color: "#22C55E",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {t("secretary.clearReplyLabel")}
        </div>
        <div style={{ fontSize: px(11), color: "#F5F7FA", marginTop: px(4) }}>
          {t("secretary.clearReplyText")}
        </div>
      </Card>

      <Card tone="warning">
        <div
          style={{
            fontSize: px(9),
            color: "#F59E0B",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {t("secretary.ambiguousLabel")}
        </div>
        <div style={{ fontSize: px(11), color: "#F5F7FA", marginTop: px(4) }}>
          {t("secretary.ambiguousText")}
        </div>
      </Card>

      <div style={{ marginTop: px(6) }}>
        <div
          style={{
            background: accent,
            color: "#0B0F14",
            borderRadius: px(11),
            padding: `${px(11)}px ${px(12)}px`,
            textAlign: "center",
            fontSize: px(11),
            fontWeight: 900,
          }}
        >
          {t("secretary.approveCta")}
        </div>
      </div>
    </div>
  );

  const TimerScreen = () => (
    <div
      style={{
        padding: `0 ${px(18)}px`,
        display: "flex",
        flexDirection: "column",
        gap: px(12),
      }}
    >
      <div style={{ marginTop: px(4) }}>
        <div
          style={{
            fontSize: px(9),
            color: accent,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {t("timer.eyebrow")}
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(18),
            fontWeight: 800,
          }}
        >
          {t("timer.title")}
        </div>
      </div>
      <Card glow>
        <div style={{ textAlign: "center", padding: `${px(8)}px 0` }}>
          <div
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: px(38),
              fontWeight: 800,
              letterSpacing: -1,
              color: accent,
            }}
          >
            12:48
          </div>
          <div
            style={{
              marginTop: px(10),
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: px(8),
            }}
          >
            <div>
              <div style={{ fontSize: px(10), color: "#A7B0BE" }}>
                {t("timer.teamA")}
              </div>
              <div
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: px(24),
                  fontWeight: 800,
                }}
              >
                3
              </div>
            </div>
            <div
              style={{ fontSize: px(11), color: "#6B7280", fontWeight: 800 }}
            >
              VS
            </div>
            <div>
              <div style={{ fontSize: px(10), color: "#A7B0BE" }}>
                {t("timer.teamB")}
              </div>
              <div
                style={{
                  fontFamily: "Sora, sans-serif",
                  fontSize: px(24),
                  fontWeight: 800,
                }}
              >
                2
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div
          style={{
            fontSize: px(9),
            color: "#6B7280",
            fontWeight: 800,
            textTransform: "uppercase",
            marginBottom: px(6),
          }}
        >
          {t("timer.timelineLabel")}
        </div>
        {(t.raw("timer.events") as string[]).map(item => (
          <div
            key={item}
            style={{
              fontSize: px(10),
              color: "#A7B0BE",
              padding: `${px(5)}px 0`,
              borderBottom: "1px solid #1B2430",
            }}
          >
            {item}
          </div>
        ))}
      </Card>
    </div>
  );

  const JourneyScreen = () => <TeamScreen />;
  const CreateScreen = () => <ConvocaScreen />;

  const screens: Record<PhoneScreen, ReactNode> = {
    team: <TeamScreen />,
    journey: <JourneyScreen />,
    create: <CreateScreen />,
    convoca: <ConvocaScreen />,
    paid: <PaidScreen />,
    secretary: <SecretaryScreen />,
    timer: <TimerScreen />,
  };

  return (
    <div className={className} style={wrap}>
      <ScreenShell>{screens[screen]}</ScreenShell>
    </div>
  );
}
