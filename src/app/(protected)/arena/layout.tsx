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
    <div className="relative min-h-screen bg-[#111111] text-white">
      {/* Sidebar (Fixed Full Height) */}
      <ArenaSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Fixed header (offset for sidebar on desktop) */}
      <div className="fixed top-0 left-0 right-0 z-40 md:left-64">
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
