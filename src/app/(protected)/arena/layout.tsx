import DotGrid from "@/components/arena/dot-grid";
import { JbBottomNav } from "@/components/arena/jb-bottom-nav";
import { JbSidebar } from "@/components/arena/jb-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="jb-arena flex min-h-screen w-full">
        <div className="jb-arena-bg" aria-hidden="true">
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

        <JbSidebar />

        <main className="jb-arena-shell relative flex-1">{children}</main>

        <JbBottomNav />
      </div>
    </SidebarProvider>
  );
}
