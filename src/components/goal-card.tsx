import { cn } from "@/lib/utils";
import { Goal } from "@/types/onboard";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  isSelected: boolean;
  onToggle: (goalId: string) => void;
}

export function GoalCard({ goal, isSelected, onToggle }: GoalCardProps) {
  const Icon = goal.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all duration-300 sm:p-4",
        isSelected
          ? "border-[#00cfb1] bg-gradient-to-br from-[#00cfb1]/10 to-[#1effbf]/5 shadow-lg shadow-[#00cfb1]/25"
          : "border-white/20 bg-gradient-to-br from-white/5 to-white/2 hover:border-[#00cfb1]/50",
      )}
      onClick={() => onToggle(goal.id)}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors sm:h-10 sm:w-10",
            isSelected ? "bg-[#00cfb1]" : "bg-white/10",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 transition-colors sm:h-5 sm:w-5",
              isSelected ? "text-white" : "text-[#00cfb1]",
            )}
          />
        </div>
        <span className="text-sm font-medium text-white sm:text-base">{goal.label}</span>
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#00cfb1]"
        >
          <CheckCircle className="h-3 w-3 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
