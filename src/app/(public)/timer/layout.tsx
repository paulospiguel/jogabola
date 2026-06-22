import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Cronómetro · JogaBola",
  description:
    "Cronómetro e gestor de jogos e treinos — marca golos, assistências e cartões em direto. Sem login.",
};

export default function TimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-arena-bg text-arena-text">{children}</div>
  );
}
