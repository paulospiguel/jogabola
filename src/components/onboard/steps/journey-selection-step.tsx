"use client";

import { JourneyOptionCard } from "@/components/journey-option-card";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import { JOURNEY_OPTIONS } from "@/constants/onboard";
import { AnimatePresence, motion } from "framer-motion";
import { Grid3x3 } from "lucide-react";
import { useState } from "react";

interface JourneySelectionStepProps {
  selectedRole?: string;
  onRoleSelect: (roleId: string) => void;
}

export function JourneySelectionStep({
  selectedRole,
  onRoleSelect,
}: JourneySelectionStepProps) {
  const [focusMode, setFocusMode] = useState(false);

  const handleCardSelect = (roleId: string) => {
    onRoleSelect(roleId);
    setFocusMode(true);
  };

  const handleToggleFocus = () => {
    setFocusMode(false);
  };

  const selectedOption = JOURNEY_OPTIONS.find(opt => opt.id === selectedRole);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex static md:relative items-center justify-center flex-col">
        <OnboardStepHeader
          title="Escolhe a Tua Jornada"
          description={focusMode ? "Revê os detalhes da tua escolha" : "Cada jornada oferece uma experiência única. Seleciona a que melhor se adequa aos teus objetivos."}
        />
        
        {focusMode && selectedRole && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleToggleFocus}
            className="md:absolute top-0 left-0 z-10 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20"
          >
            <Grid3x3 className="h-4 w-4" />
            Voltar à lista
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {focusMode && selectedOption ? (
          // Focus Mode - Single Card Expanded
          <motion.div
            key="focus-mode"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-2xl">
              <JourneyOptionCard
                option={selectedOption}
                isSelected={true}
                isFocused={true}
                onSelect={handleCardSelect}
                onToggleFocus={handleToggleFocus}
                index={0}
              />
            </div>
          </motion.div>
        ) : (
          // Grid Mode - All Cards
          <motion.div
            key="grid-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="m-4 grid grid-cols-1 gap-3 sm:gap-3 md:grid-cols-2 md:gap-4"
          >
            {JOURNEY_OPTIONS.map((option, index) => (
              <JourneyOptionCard
                key={option.id}
                option={option}
                isSelected={selectedRole === option.id}
                isFocused={false}
                onSelect={handleCardSelect}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
