"use client";

import { GoalCard } from "@/components/goal-card";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import type { RoleQuestions } from "@/constants/onboarding-questions";
import { motion } from "framer-motion";

interface GoalsStepProps {
  roleQuestions?: RoleQuestions;
  selectedGoals: string[];
  onToggleGoal: (goalId: string) => void;
}

export function GoalsStep({
  roleQuestions,
  selectedGoals,
  onToggleGoal,
}: GoalsStepProps) {
  const goalsToDisplay = roleQuestions?.goals || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <OnboardStepHeader
        title="Quais São os Teus Objetivos?"
        description="Seleciona todos os objetivos que se aplicam a ti. Isto ajuda-nos a sugerir as melhores funcionalidades."
      />

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goalsToDisplay.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            isSelected={selectedGoals.includes(goal.id)}
            onToggle={onToggleGoal}
          />
        ))}
      </div>
    </motion.div>
  );
}

