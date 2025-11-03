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
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-[#ba93ff]"
        >
          Passo {currentStep + 1} de {totalSteps}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium text-[#00cfb1]"
        >
          {Math.round(progress)}% concluído
        </motion.div>
      </div>

      <Progress value={progress} className="h-2 bg-white/10" />
    </div>
  );
}
