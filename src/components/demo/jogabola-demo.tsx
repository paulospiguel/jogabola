"use client";

import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  PhoneMockup,
  type PhoneScreen,
} from "@/components/landing/phone-mockup";

export const DEMO_FPS = 30;
export const DEMO_DURATION_S = 42;
export const DEMO_FRAMES = DEMO_DURATION_S * DEMO_FPS; // 1260

const PRIMARY = "#7CFF4F";
const BG = "#0B0F14";
const SURFACE = "#151C26";
const BORDER = "#263244";
const TEXT = "#F5F7FA";
const TEXT_SEC = "#A7B0BE";
const TEXT_MUTED = "#6B7280";

// ─── Scene config ────────────────────────────────────────────────────────────

interface SceneConfig {
  id: number;
  screen: PhoneScreen;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const SCENES: SceneConfig[] = [
  {
    id: 0,
    screen: "journey",
    eyebrow: "COMEÇA AQUI",
    title: "Escolhe a tua jornada",
    subtitle: "Capitão ou Atleta — configurado em segundos",
  },
  {
    id: 1,
    screen: "team",
    eyebrow: "PLANTEL",
    title: "Gere o teu plantel",
    subtitle: "Todos os jogadores num só lugar",
  },
  {
    id: 2,
    screen: "convoca",
    eyebrow: "CONVOCATÓRIA",
    title: "Convoca a tua equipa",
    subtitle: "Presenças confirmadas em tempo real",
  },
  {
    id: 3,
    screen: "create",
    eyebrow: "EVENTOS",
    title: "Agenda jogos facilmente",
    subtitle: "Cria um evento em menos de 1 minuto",
  },
  {
    id: 4,
    screen: "paid",
    eyebrow: "PAGAMENTOS",
    title: "Pagamentos integrados",
    subtitle: "MBWay, cartão ou numerário",
  },
];

// Frame boundaries
const INTRO_END = 4 * DEMO_FPS; // 0-4s: intro
const SCENE_DURATION = 7 * DEMO_FPS; // 7s per scene
const OUTRO_START = INTRO_END + SCENES.length * SCENE_DURATION; // 39s
// Total: 4 + 5*7 + 3 = 42s ✓

function sceneStart(i: number) {
  return INTRO_END + i * SCENE_DURATION;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const spring = Easing.bezier(0.16, 1, 0.3, 1);
const ease = Easing.bezier(0.4, 0, 0.2, 1);

function fadeIn(frame: number, start: number, dur = 15) {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function fadeOut(frame: number, end: number, dur = 12) {
  return interpolate(frame, [end - dur, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ─── IntroScene ───────────────────────────────────────────────────────────────

function IntroScene() {
  const frame = useCurrentFrame();

  const logoOpacity = fadeIn(frame, 5, 20);
  const logoY = interpolate(frame, [5, 25], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: spring,
  });

  const taglineOpacity = fadeIn(frame, 25, 20);
  const taglineY = interpolate(frame, [25, 45], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: spring,
  });

  const exitOpacity = fadeOut(frame, INTRO_END, 15);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
        opacity: exitOpacity,
      }}
    >
      {/* Logo wordmark */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Shield icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: `${PRIMARY}22`,
            border: `2px solid ${PRIMARY}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={PRIMARY}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <div
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 52,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: "-2px",
            textTransform: "lowercase",
          }}
        >
          jogabola
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          fontFamily: "'Inter', sans-serif",
          fontSize: 18,
          color: TEXT_SEC,
          fontWeight: 500,
          textAlign: "center",
          maxWidth: 420,
          lineHeight: 1.5,
        }}
      >
        Gere a tua equipa.{" "}
        <span style={{ color: PRIMARY, fontWeight: 700 }}>Convoca. Joga.</span>
      </div>
    </AbsoluteFill>
  );
}

// ─── PhoneScene ───────────────────────────────────────────────────────────────

interface PhoneSceneProps {
  config: SceneConfig;
  sceneIndex: number;
  totalScenes: number;
}

function PhoneScene({ config, sceneIndex, totalScenes }: PhoneSceneProps) {
  const frame = useCurrentFrame();
  const ENTER = 18;
  const EXIT_START = SCENE_DURATION - 15;

  // Phone enter
  const phoneY = interpolate(frame, [0, ENTER], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: spring,
  });
  const phoneOpacity = fadeIn(frame, 0, ENTER);

  // Phone exit
  const phoneExitOpacity = fadeOut(frame, SCENE_DURATION, 12);
  const phoneExitY = interpolate(frame, [EXIT_START, SCENE_DURATION], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  const phoneFinalOpacity = phoneOpacity * phoneExitOpacity;
  const phoneFinalY = phoneY + (frame >= EXIT_START ? phoneExitY : 0);

  // Text enter (staggered after phone)
  const eyebrowOpacity = fadeIn(frame, ENTER, 12) * phoneExitOpacity;
  const eyebrowX = interpolate(frame, [ENTER, ENTER + 15], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: spring,
  });

  const titleOpacity = fadeIn(frame, ENTER + 8, 15) * phoneExitOpacity;
  const titleX = interpolate(frame, [ENTER + 8, ENTER + 23], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: spring,
  });

  const subtitleOpacity = fadeIn(frame, ENTER + 18, 15) * phoneExitOpacity;
  const subtitleX = interpolate(frame, [ENTER + 18, ENTER + 33], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: spring,
  });

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 80,
        paddingRight: 60,
        gap: 64,
      }}
    >
      {/* Left: text */}
      <div
        style={{
          flex: "0 0 380px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            opacity: eyebrowOpacity,
            transform: `translateX(${eyebrowX}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 2,
              background: PRIMARY,
              borderRadius: 99,
            }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 800,
              color: PRIMARY,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {config.eyebrow}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateX(${titleX}px)`,
            fontFamily: "'Sora', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            color: TEXT,
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}
        >
          {config.title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateX(${subtitleX}px)`,
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            color: TEXT_SEC,
            lineHeight: 1.6,
          }}
        >
          {config.subtitle}
        </div>

        {/* Scene dots */}
        <div
          style={{
            opacity: subtitleOpacity,
            display: "flex",
            gap: 8,
            marginTop: 8,
          }}
        >
          {Array.from({ length: totalScenes }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: stable order
              key={i}
              style={{
                width: i === sceneIndex ? 20 : 6,
                height: 6,
                borderRadius: 99,
                background: i === sceneIndex ? PRIMARY : BORDER,
                transition: "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Right: phone */}
      <div
        style={{
          opacity: phoneFinalOpacity,
          transform: `translateY(${phoneFinalY}px)`,
          flexShrink: 0,
          filter: `drop-shadow(0 40px 80px rgba(124,255,79,0.12))`,
        }}
      >
        <PhoneMockup scale={0.82} screen={config.screen} />
      </div>
    </AbsoluteFill>
  );
}

// ─── OutroScene ───────────────────────────────────────────────────────────────

function OutroScene() {
  const frame = useCurrentFrame();
  const OUTRO_DURATION = DEMO_FRAMES - OUTRO_START;

  const opacity = fadeIn(frame, 5, 20);
  const scale = interpolate(frame, [5, 25], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: spring,
  });

  const subtitleOpacity = fadeIn(frame, 20, 15);

  const glowOpacity = interpolate(
    frame,
    [0, OUTRO_DURATION * 0.4, OUTRO_DURATION * 0.7, OUTRO_DURATION],
    [0, 0.7, 0.7, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${PRIMARY}18 0%, transparent 70%)`,
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            background: `${PRIMARY}22`,
            border: `2px solid ${PRIMARY}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={PRIMARY}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <div
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 44,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: "-1.5px",
            textTransform: "lowercase",
          }}
        >
          jogabola
        </div>
      </div>

      <div
        style={{
          opacity: subtitleOpacity,
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          color: TEXT_MUTED,
          letterSpacing: "0.06em",
          textAlign: "center",
        }}
      >
        O campo chama-te. A vitória espera por ti.
      </div>
    </AbsoluteFill>
  );
}

// ─── Background ───────────────────────────────────────────────────────────────

function Background() {
  const frame = useCurrentFrame();

  // Subtle pulsing glow
  const glowOpacity = interpolate(
    frame % (3 * DEMO_FPS),
    [0, 1.5 * DEMO_FPS, 3 * DEMO_FPS],
    [0.06, 0.12, 0.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Top-left radial glow */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${PRIMARY}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Bottom-right subtle blue glow */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(38,50,68,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(38,50,68,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}

// ─── Main composition ─────────────────────────────────────────────────────────

export function JogabolaDemo() {
  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif" }}>
      <Background />

      {/* Intro */}
      <Sequence from={0} durationInFrames={INTRO_END + 15}>
        <IntroScene />
      </Sequence>

      {/* Phone scenes */}
      {SCENES.map((config, i) => (
        <Sequence
          key={config.id}
          from={sceneStart(i)}
          durationInFrames={SCENE_DURATION}
        >
          <PhoneScene
            config={config}
            sceneIndex={i}
            totalScenes={SCENES.length}
          />
        </Sequence>
      ))}

      {/* Outro */}
      <Sequence from={OUTRO_START} durationInFrames={DEMO_FRAMES - OUTRO_START}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
}
