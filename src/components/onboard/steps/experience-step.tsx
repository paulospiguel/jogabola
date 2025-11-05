"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import { motion } from "framer-motion";

interface ExperienceStepProps {
  experience?: string;
  onExperienceChange: (value: string) => void;
}

export function ExperienceStep({
  experience,
  onExperienceChange,
}: ExperienceStepProps) {
  const experienceOptions = [
    {
      value: "beginner",
      label: "Iniciante",
      description: "Estou a começar agora",
    },
    {
      value: "intermediate",
      label: "Intermédio",
      description: "Jogo regularmente",
    },
    {
      value: "advanced",
      label: "Avançado",
      description: "Jogo competitivamente",
    },
    {
      value: "professional",
      label: "Profissional",
      description: "Nível elevado",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <OnboardStepHeader
        title="Experiência e Disponibilidade"
        description="Conta-nos mais sobre o teu nível e quando estás disponível."
      />

      <div className="mx-auto max-w-xl space-y-6 sm:space-y-8">
        <div>
          <Label className="text-sm font-medium text-white sm:text-base">
            Experiência no Futebol
          </Label>
          <RadioGroup
            value={experience}
            onValueChange={onExperienceChange}
            className="mt-3 space-y-2 sm:mt-4 sm:space-y-3"
          >
            {experienceOptions.map(option => (
              <div
                key={option.value}
                id={option.value}
                onClick={() => onExperienceChange(option.value)}
                className="hover:border-brand-green/50 flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors sm:p-4"
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="text-brand-green mt-1 border-white/40"
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={option.value}
                    className="text-sm font-medium text-white sm:text-base"
                  >
                    {option.label}
                  </Label>
                  <p className="mt-1 text-xs text-white/60 sm:text-sm">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </motion.div>
  );
}

