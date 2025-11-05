"use client";

import { JourneyOptionCard } from "@/components/journey-option-card";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import { JOURNEY_OPTIONS } from "@/constants/onboard";
import { motion } from "framer-motion";

interface JourneySelectionStepProps {
  selectedRole?: string;
  onRoleSelect: (roleId: string) => void;
}

export function JourneySelectionStep({
  selectedRole,
  onRoleSelect,
}: JourneySelectionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      <OnboardStepHeader
        title="Escolhe a Tua Jornada"
        description="Cada jornada oferece uma experiência única. Seleciona a que melhor se adequa aos teus objetivos."
      />

      <div className="grid grid-cols-1 gap-3 sm:gap-3 md:grid-cols-2 md:gap-4">
        {JOURNEY_OPTIONS.map((option, index) => (
          <JourneyOptionCard
            key={option.id}
            option={option}
            isSelected={selectedRole === option.id}
            onSelect={onRoleSelect}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}
