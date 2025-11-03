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
      className="space-y-8"
    >
      <OnboardStepHeader
        title="Experiência e Disponibilidade"
        description="Conta-nos mais sobre o teu nível e quando estás disponível."
      />

      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <Label className="font-medium text-white">
            Experiência no Futebol
          </Label>
          <RadioGroup
            value={experience}
            onValueChange={onExperienceChange}
            className="mt-4 space-y-3"
          >
            {experienceOptions.map(option => (
              <div
                key={option.value}
                id={option.value}
                onClick={() => onExperienceChange(option.value)}
                className="hover:border-brand-green/50 flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors"
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="text-brand-green mt-1 border-white/40"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className="font-medium text-white"
                  >
                    {option.label}
                  </Label>
                  <p className="mt-1 text-sm text-white/60">
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

