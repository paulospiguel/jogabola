"use client";

import { useState } from "react";
import ArenaFooter from "@/components/arena/arena-footer";
import ArenaHeader from "@/components/arena/arena-header";
import ArenaSidebar from "@/components/arena/arena-sidebar";

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)] text-white">
      {/* Radial neon glow overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.12)_0%,transparent_70%)]" />

      {/* Sidebar (Fixed Full Height) */}
      <ArenaSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Fixed header (offset for sidebar on desktop) */}
      <div className="fixed top-0 right-0 left-0 z-40 md:left-64">
        <ArenaHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex pt-16">
        <main className="min-h-[calc(100vh-4rem)] flex-1 pb-12 md:ml-64">
          {children}
        </main>
      </div>

      <ArenaFooter className="relative z-10 md:ml-64" />
    </div>
  );
}
