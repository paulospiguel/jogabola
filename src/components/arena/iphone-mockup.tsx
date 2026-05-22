"use client";

import { useEffect, useState } from "react";
import DotGrid from "@/components/arena/dot-grid";

interface IPhoneMockupProps {
  children: React.ReactNode;
}


function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function format() {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    }

    setTime(format());
    const id = setInterval(() => setTime(format()), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="iphone-status-time">{time}</span>
  );
}

/** Ícones SVG inline para a status bar */
function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
      <rect x="0" y="7" width="3" height="5" rx="0.8" opacity="0.4" />
      <rect x="4.5" y="5" width="3" height="7" rx="0.8" opacity="0.6" />
      <rect x="9" y="2.5" width="3" height="9.5" rx="0.8" opacity="0.8" />
      <rect x="13.5" y="0" width="3" height="12" rx="0.8" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
      <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
      <path d="M4.1 7a5.5 5.5 0 0 1 7.8 0L10.5 8.4a3.5 3.5 0 0 0-5 0L4.1 7z" opacity="0.7" />
      <path d="M1.2 4.1a9.5 9.5 0 0 1 13.6 0L13.4 5.5a7.5 7.5 0 0 0-10.8 0L1.2 4.1z" opacity="0.4" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor" aria-hidden="true">
      <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="1.5" y="2.5" width="15" height="7" rx="1.5" opacity="0.9" />
      <path d="M22.5 4v4a2 2 0 0 0 0-4z" />
    </svg>
  );
}

export function IPhoneMockup({ children }: IPhoneMockupProps) {
  return (
    <div className="iphone-scene">
      {/* Background interativo do dashboard atrás do iPhone */}
      <div className="jb-arena-bg absolute inset-0 z-0 opacity-[0.54]" aria-hidden="true">
        <DotGrid
          activeColor="#7CFF4F"
          baseColor="#263244"
          dotSize={3}
          gap={26}
          proximity={130}
          resistance={760}
          returnDuration={1.4}
          shockRadius={230}
          shockStrength={4.5}
          speedTrigger={120}
        />
      </div>

      <div className="iphone-frame z-10">
        {/* Câmera + Dynamic Island */}
        <div className="iphone-island" aria-hidden="true">
          <div className="iphone-island-pill" />
        </div>

        {/* Status Bar */}
        <div className="iphone-statusbar" aria-hidden="true">
          <LiveClock />
          <div className="iphone-statusbar-icons">
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        {/* Conteúdo da app */}
        <div className="iphone-screen">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="iphone-home-indicator" aria-hidden="true">
          <div className="iphone-home-bar" />
        </div>
      </div>

      {/* Botões laterais decorativos */}
      <div className="iphone-btn-vol-up z-10" aria-hidden="true" />
      <div className="iphone-btn-vol-down z-10" aria-hidden="true" />
      <div className="iphone-btn-power z-10" aria-hidden="true" />
    </div>
  );
}
