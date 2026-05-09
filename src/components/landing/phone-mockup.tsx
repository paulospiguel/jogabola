"use client";

import type { CSSProperties, ReactNode } from "react";

export type PhoneScreen = "team" | "journey" | "create" | "convoca" | "paid";

type PhoneMockupProps = {
  scale?: number;
  screen?: PhoneScreen;
  accent?: string;
  className?: string;
};

const names = [
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
  const px = (value: number) => value * scale;
  const W = px(320);
  const H = px(660);

  const wrap: CSSProperties = {
    width: W,
    height: H,
    borderRadius: px(44),
    background: "#0B0F14",
    border: `${Math.max(1, px(1.5))}px solid #1B2430`,
    boxShadow: `0 ${px(30)}px ${px(80)}px rgba(0,0,0,.55), inset 0 0 0 ${px(5)}px #06090D`,
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
  }: {
    children: ReactNode;
    glow?: boolean;
  }) => (
    <div
      style={{
        background: glow
          ? `linear-gradient(135deg, ${accent}22, ${accent}05)`
          : "#151C26",
        border: `1px solid ${glow ? `${accent}44` : "#263244"}`,
        borderRadius: px(14),
        padding: px(12),
      }}
    >
      {children}
    </div>
  );

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
            Equipa
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
          Próximo jogo
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(18),
            fontWeight: 800,
            marginTop: px(6),
          }}
        >
          Sábado · 21h
        </div>
        <div style={{ fontSize: px(11), color: "#A7B0BE", marginTop: px(2) }}>
          Pavilhão Municipal · Campo 2
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
            {names.slice(0, 4).map((name, index) => (
              <div key={name} style={{ marginLeft: index === 0 ? 0 : px(-7) }}>
                <Avatar name={name} size={22} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: px(11), fontWeight: 700 }}>
            14 confirmados
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
          ["14", "Confirmados", accent],
          ["3", "Pendentes", "#F59E0B"],
          ["11", "Pagos", "#F5F7FA"],
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
          <span>Plantel</span>
          <span style={{ color: "#6B7280", fontSize: px(10) }}>
            22 jogadores
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
                  Jogador
                </div>
              </div>
              <span
                style={{
                  fontSize: px(8),
                  color: index === 2 ? "#F59E0B" : "#22C55E",
                  fontWeight: 900,
                }}
              >
                {index === 2 ? "PEND" : "OK"}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );

  const JourneyScreen = () => (
    <div
      style={{
        padding: `0 ${px(18)}px`,
        display: "flex",
        flexDirection: "column",
        gap: px(16),
      }}
    >
      <div style={{ marginTop: px(16) }}>
        <div
          style={{
            fontSize: px(10),
            color: "#6B7280",
            fontWeight: 800,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          Bem-vindo ao
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(22),
            fontWeight: 800,
          }}
        >
          jogabola
        </div>
      </div>
      <div style={{ fontSize: px(13), color: "#A7B0BE" }}>
        Como vais usar a app?
      </div>
      {[
        ["Sou Capitão", "Gerir equipa e jogos", true],
        ["Sou Atleta", "Confirmar e jogar", false],
      ].map(([title, text, selected]) => (
        <div
          key={String(title)}
          style={{
            background: selected
              ? `linear-gradient(135deg, ${accent}1F, ${accent}05)`
              : "#151C26",
            border: selected ? `1.5px solid ${accent}` : "1px solid #263244",
            borderRadius: px(16),
            padding: px(14),
            display: "flex",
            gap: px(12),
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: px(44),
              height: px(44),
              borderRadius: px(12),
              background: selected ? accent : "#1B2430",
            }}
          />
          <div>
            <div style={{ fontSize: px(13), fontWeight: 800 }}>{title}</div>
            <div
              style={{ fontSize: px(10), color: "#A7B0BE", marginTop: px(2) }}
            >
              {text}
            </div>
          </div>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <button
        type="button"
        style={{
          background: accent,
          color: "#0B0F14",
          border: "none",
          padding: `${px(13)}px 0`,
          borderRadius: px(12),
          fontSize: px(13),
          fontWeight: 900,
          marginBottom: px(20),
        }}
      >
        Continuar
      </button>
    </div>
  );

  const CreateScreen = () => (
    <div
      style={{
        padding: `0 ${px(18)}px`,
        display: "flex",
        flexDirection: "column",
        gap: px(12),
      }}
    >
      <div style={{ marginTop: px(6), marginBottom: px(4) }}>
        <div
          style={{
            fontSize: px(10),
            color: "#6B7280",
            fontWeight: 800,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          Novo evento
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(18),
            fontWeight: 800,
          }}
        >
          Marca o jogo
        </div>
      </div>
      {[
        ["Data", "Sábado · 21:00"],
        ["Local", "Pavilhão Municipal · Campo 2"],
        ["Valor por jogador", "5,00 €"],
        ["Vagas", "14"],
      ].map(([label, value], index) => (
        <Card key={label} glow={index === 0}>
          <div
            style={{
              fontSize: px(9),
              color: "#6B7280",
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: px(13),
              fontWeight: 800,
              marginTop: px(4),
              color: index === 3 ? accent : "#F5F7FA",
            }}
          >
            {value}
          </div>
        </Card>
      ))}
      <div style={{ flex: 1 }} />
      <button
        type="button"
        style={{
          background: accent,
          color: "#0B0F14",
          border: "none",
          padding: `${px(13)}px 0`,
          borderRadius: px(12),
          fontSize: px(13),
          fontWeight: 900,
          marginBottom: px(20),
        }}
      >
        Convocar plantel
      </button>
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
          Convocatória
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(18),
            fontWeight: 800,
          }}
        >
          Sábado · 21h
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
          <span style={{ fontSize: px(11), fontWeight: 800 }}>Confirmados</span>
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
            background: "rgba(11,15,20,.5)",
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
          Plantel · 14 confirmados
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: px(6) }}>
          {names.slice(0, 7).map(name => (
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
          Atividade · agora
        </div>
        {[
          "Bruno A confirmou presença",
          "Tiago M entrou na lista",
          "Diogo F confirmou presença",
        ].map(text => (
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
            width: px(80),
            height: px(80),
            borderRadius: "50%",
            background: accent,
            margin: "0 auto",
            boxShadow: `0 0 ${px(40)}px ${accent}88`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0B0F14",
            fontSize: px(44),
            fontWeight: 900,
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: px(22),
            fontWeight: 800,
            marginTop: px(20),
          }}
        >
          Pagamento concluído
        </div>
        <div
          style={{
            fontSize: px(12),
            color: "#A7B0BE",
            marginTop: px(6),
            lineHeight: 1.4,
          }}
        >
          5,00 € · Jogo de sábado
          <br />
          Comprovativo enviado ao capitão.
        </div>
      </div>
      <div style={{ marginTop: px(24) }}>
        <Card>
          {[
            ["De", "Bruno Alves"],
            ["Para", "Os Lobos FC"],
            ["Método", "MB Way"],
            ["Total", "5,00 €"],
          ].map(([label, value]) => (
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
                  color: label === "Total" ? accent : "#F5F7FA",
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

  const screens: Record<PhoneScreen, ReactNode> = {
    team: <TeamScreen />,
    journey: <JourneyScreen />,
    create: <CreateScreen />,
    convoca: <ConvocaScreen />,
    paid: <PaidScreen />,
  };

  return (
    <div className={className} style={wrap}>
      <ScreenShell>{screens[screen]}</ScreenShell>
    </div>
  );
}
