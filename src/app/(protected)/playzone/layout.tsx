"use client";

import PlayZoneHeader from "@/components/play-zone/play-zone-header";
import { useState } from "react";

export default function PlayZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Header fixo */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <PlayZoneHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Conteúdo com scroll - padding top para compensar o header fixo */}
      <div className="pt-20">
        {children}
      </div>
    </>
  );
}

