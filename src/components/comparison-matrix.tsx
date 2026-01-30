"use client";

import { Activity, BarChart3, Globe, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  availability: string;
  icon: React.ReactNode;
  className?: string;
  isElite?: boolean;
}

function ModuleCard({
  id,
  title,
  description,
  availability,
  icon,
  className,
  isElite,
}: ModuleCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col p-8 rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-lg bg-white/10 text-neon-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className="text-[10px] font-mono text-white/40">{id}</span>
      </div>

      <h4 className="text-lg font-bold text-white mb-3 tracking-wide">
        {title}
      </h4>
      <p className="text-sm text-white/60 leading-relaxed mb-8 flex-1">
        {description}
      </p>

      {/* Decorative Status Bar Mockup */}
      <div className="mb-6 h-[22px] w-full bg-white/5 rounded-sm overflow-hidden flex items-center px-3 border border-white/5">
        <div className="flex gap-1 items-center w-full">
          <div
            className={cn(
              "h-1.5 rounded-full",
              isElite
                ? "bg-amber-500 w-1/3"
                : "bg-neon-secondary w-full opacity-60",
            )}
          ></div>
          {isElite && (
            <div className="h-1.5 rounded-full bg-neon-secondary w-2/3"></div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-[10px] font-bold tracking-widest uppercase",
            isElite ? "text-amber-500" : "text-neon-primary",
          )}
        >
          {availability}
        </span>
      </div>
    </div>
  );
}

interface ModuleContent {
  id: string;
  title: string;
  description: string;
  availability: string;
}

interface ComparisonMatrixProps {
  title: string;
  subtitle: string;
  modules: {
    stats: ModuleContent;
    finance: ModuleContent;
    pages: ModuleContent;
    health: ModuleContent;
  };
}

export function ComparisonMatrix({
  title,
  subtitle,
  modules,
}: ComparisonMatrixProps) {
  return (
    <section className="py-24">
      <div className="mb-12">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
          {title}
        </h2>
        <p className="text-[10px] font-mono text-white/40 tracking-[0.2em]">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModuleCard
          id={modules.stats.id}
          title={modules.stats.title}
          description={modules.stats.description}
          availability={modules.stats.availability}
          icon={<BarChart3 className="w-6 h-6" />}
        />
        <ModuleCard
          id={modules.finance.id}
          title={modules.finance.title}
          description={modules.finance.description}
          availability={modules.finance.availability}
          icon={<Wallet className="w-6 h-6" />}
        />
        <ModuleCard
          id={modules.pages.id}
          title={modules.pages.title}
          description={modules.pages.description}
          availability={modules.pages.availability}
          icon={<Globe className="w-6 h-6" />}
        />
        <ModuleCard
          id={modules.health.id}
          title={modules.health.title}
          description={modules.health.description}
          availability={modules.health.availability}
          icon={<Activity className="w-6 h-6" />}
          isElite
        />
      </div>
    </section>
  );
}
