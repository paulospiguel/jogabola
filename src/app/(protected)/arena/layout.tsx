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

  let headerCopy: { eyebrow?: string; title?: string; description?: string } = {};

  if (pathname === "/arena") {
    headerCopy = {
      eyebrow: t("eyebrows.arena"),
      title: t("header.title"),
      description: t("header.description"),
    };
  } else if (pathname === "/arena/teams" || pathname.includes("/teams")) {
    headerCopy = {
      eyebrow: t("eyebrows.teams"),
      title: t("teamsHeader.title"),
      description: t("teamsHeader.description"),
    };
  } else if (pathname.includes("/calendar")) {
    headerCopy = {
      eyebrow: t("eyebrows.calendar"),
      title: t("calendarHeader.title"),
      description: t("calendarHeader.description"),
    };
  } else if (pathname.includes("/club")) {
    headerCopy = {
      eyebrow: t("eyebrows.club"),
      title: t("clubHeader.title"),
      description: t("clubHeader.description"),
    };
  } else if (pathname.includes("/events")) {
    headerCopy = {
      eyebrow: t("eyebrows.events"),
      title: t("eventsHeader.title"),
      description: t("eventsHeader.description"),
    };
  } else if (pathname.includes("/billing")) {
    headerCopy = {
      eyebrow: t("eyebrows.billing"),
      title: t("billingHeader.title"),
      description: t("billingHeader.description"),
    };
  }

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
      <div className="relative z-10 flex pt-44 md:pt-48">
        <main className="min-h-[calc(100vh-8rem)] flex-1 pb-12 md:ml-64">
          {children}
        </main>
      </div>

      <ArenaFooter className="relative z-10 md:ml-64" />
    </div>
  );
}
