"use client";

import ArenaFooter from "@/components/arena/arena-footer";
import ArenaHeader from "@/components/arena/arena-header";
import ArenaSidebar from "@/components/arena/arena-sidebar";
import { useState } from "react";

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="h-full w-full bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
      </div>

      {/* Header fixo */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <ArenaHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Conteúdo com scroll */}
      <div className="relative z-10 flex pt-20">
        <ArenaSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="relative z-10 flex-1 min-h-[calc(100vh-5rem)] pb-12 md:ml-72">
          {children}
        </main>
      </div>

      <ArenaFooter className="relative z-10" />
    </div>
  );
}
