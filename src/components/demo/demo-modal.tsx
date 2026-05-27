"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { Play, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
  DEMO_FPS,
  DEMO_FRAMES,
  JogabolaDemo,
} from "@/components/demo/jogabola-demo";

interface DemoModalProps {
  label?: string;
  className?: string;
}

export function DemoModal({
  label,
  className,
}: DemoModalProps) {
  const t = useTranslations("videoDemo");
  const resolvedLabel = label ?? t("openLabel");
  const [open, setOpen] = useState(false);
  // Increment key each time modal opens → forces Player remount
  const [sessionKey, setSessionKey] = useState(0);

  const handleOpen = useCallback(() => {
    setSessionKey(k => k + 1);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose],
  );

  const playerRefCallback = useCallback((player: PlayerRef | null) => {
    if (player) {
      setTimeout(() => {
        if (!player.isPlaying()) {
          player.play();
        }
      }, 50);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  return (
    <>
      {/* Trigger button */}
      <button type="button" onClick={handleOpen} className={className}>
        <Play className="mr-2 size-4" />
        {resolvedLabel}
      </button>

      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-arena-border shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
            style={{ background: "#0B0F14" }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-arena-surface/80 text-arena-text-muted hover:text-arena-text hover:bg-arena-surface transition-all"
              aria-label={t("closeModal")}
            >
              <X size={16} />
            </button>

            <Player
              ref={playerRefCallback}
              key={sessionKey}
              component={JogabolaDemo}
              durationInFrames={DEMO_FRAMES}
              fps={DEMO_FPS}
              compositionWidth={1280}
              compositionHeight={720}
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                display: "block",
              }}
              controls
              autoPlay={false}
              loop={false}
              clickToPlay
              doubleClickToFullscreen
              spaceKeyToPlayOrPause
            />
          </div>
        </div>
      )}
    </>
  );
}
