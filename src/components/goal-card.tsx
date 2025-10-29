import { cn } from "@/lib/utils";
import { Goal } from "@/types/welcome";
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
        "relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-300",
        isSelected
          ? "border-[#00cfb1] bg-gradient-to-br from-[#00cfb1]/10 to-[#1effbf]/5 shadow-lg shadow-[#00cfb1]/25"
          : "border-white/20 bg-gradient-to-br from-white/5 to-white/2 hover:border-[#00cfb1]/50",
      )}
      onClick={() => onToggle(goal.id)}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            isSelected ? "bg-[#00cfb1]" : "bg-white/10",
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5 transition-colors",
              isSelected ? "text-white" : "text-[#00cfb1]",
            )}
          />
        </div>
        <span className="font-medium text-white">{goal.label}</span>
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
