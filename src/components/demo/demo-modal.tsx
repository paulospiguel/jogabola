"use client";

import { Player } from "@remotion/player";
import { Play, X } from "lucide-react";
import { useCallback, useState } from "react";
import {
  DEMO_FPS,
  DEMO_FRAMES,
  JogabolaDemo,
} from "@/components/demo/jogabola-demo";

interface DemoModalProps {
  label?: string;
  className?: string;
}

export function DemoModal({ label = "Ver demo · 0:42", className }: DemoModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose],
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className={className}
      >
        <Play className="mr-2 size-4" />
        {label}
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close */}
      <div
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div
          className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-arena-border shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
          style={{ background: "#0B0F14" }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-arena-surface/80 text-arena-text-muted hover:text-arena-text hover:bg-arena-surface transition-all"
            aria-label="Fechar demo"
          >
            <X size={16} />
          </button>

          {/* Remotion Player */}
          <Player
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
            autoPlay
            loop={false}
            clickToPlay
            doubleClickToFullscreen
            spaceKeyToPlayOrPause
          />
        </div>
      </div>
    </>
  );
}
