"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GoalCard } from "@/components/goal-card";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import type { RoleQuestions } from "@/constants/onboarding-questions";

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
  const t = useTranslations("onboardingPage.steps.goals");
  const goalsToDisplay = roleQuestions?.goals || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <OnboardStepHeader title={t("title")} description={t("description")} />

      <div className="grid grid-cols-1 gap-3 p-4 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goalsToDisplay.map((goal) => (
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
