import { cn } from "@/lib/utils";
import { WaitlistApp } from "@/types/onboard";
import { motion } from "framer-motion";
import { Calendar, CheckCircle } from "lucide-react";

interface WaitlistAppCardProps {
  app: WaitlistApp;
  isSelected: boolean;
  onToggle: (appId: string) => void;
  index: number;
}

export function WaitlistAppCard({
  app,
  isSelected,
  onToggle,
  index,
}: WaitlistAppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-2xl border p-6 transition-all duration-300",
        isSelected
          ? "border-[#00cfb1] bg-gradient-to-br from-[#00cfb1]/10 to-[#1effbf]/5 shadow-lg shadow-[#00cfb1]/25"
          : "border-white/20 bg-gradient-to-br from-white/5 to-white/2 hover:border-[#00cfb1]/50",
      )}
      onClick={() => onToggle(app.id)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{app.name}</h3>
            <p className="text-sm text-[#ba93ff]">{app.description}</p>
          </div>

          <div
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              app.status === "beta"
                ? "border border-orange-500/30 bg-orange-500/20 text-orange-300"
                : "border border-blue-500/30 bg-blue-500/20 text-blue-300",
            )}
          >
            {app.status === "beta" ? "Beta" : "Em Breve"}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#00cfb1]">
          <Calendar className="h-4 w-4" />
          <span>{app.estimatedLaunch}</span>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#00cfb1]"
        >
          <CheckCircle className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
