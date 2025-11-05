import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface OnboardProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardProgressHeader({
  currentStep,
  totalSteps,
}: OnboardProgressHeaderProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-6 sm:mb-8 md:mb-12">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-[#ba93ff] sm:text-sm"
        >
          Passo {currentStep + 1} de {totalSteps}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-medium text-[#00cfb1] sm:text-sm"
        >
          {Math.round(progress)}% concluído
        </motion.div>
      </div>

      <Progress value={progress} className="h-1.5 bg-white/10 sm:h-2" />
    </div>
  );
}
