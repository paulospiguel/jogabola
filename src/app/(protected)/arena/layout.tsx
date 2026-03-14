"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const pathname = usePathname();
  const t = useTranslations("arenaPage");

  const isArenaHome = pathname === "/arena";
  const headerCopy = isArenaHome
    ? {
        eyebrow: "Arena",
        title: t("header.title"),
        description: t("header.description"),
      }
    : {};

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
        <ArenaHeader
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          eyebrow={headerCopy.eyebrow}
          title={headerCopy.title}
          description={headerCopy.description}
        />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex pt-36">
        <main className="min-h-[calc(100vh-9rem)] flex-1 pb-12 md:ml-64">
          {children}
        </main>
      </div>

      <ArenaFooter className="relative z-10 md:ml-64" />
    </div>
  );
}
