"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ExperienceStepProps {
  experience?: string;
  onExperienceChange: (value: string) => void;
}

const EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
] as const;

export function ExperienceStep({
  experience,
  onExperienceChange,
}: ExperienceStepProps) {
  const t = useTranslations("onboardingPage.steps.experience");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <OnboardStepHeader title={t("title")} description={t("description")} />

      <div className="mx-auto max-w-xl space-y-6 sm:space-y-8">
        <div>
          <Label className="text-sm font-medium text-white sm:text-base">
            {t("label")}
          </Label>
          <RadioGroup
            value={experience}
            onValueChange={onExperienceChange}
            className="mt-3 space-y-2 sm:mt-4 sm:space-y-3"
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <div
                key={level}
                id={level}
                onClick={() => onExperienceChange(level)}
                className="hover:border-brand-green/50 flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors sm:p-4"
              >
                <RadioGroupItem
                  value={level}
                  id={level}
                  className="text-brand-green mt-1 border-white/40"
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={level}
                    className="text-sm font-medium text-white sm:text-base"
                  >
                    {t(`levels.${level}.label`)}
                  </Label>
                  <p className="mt-1 text-xs text-white/60 sm:text-sm">
                    {t(`levels.${level}.description`)}
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
