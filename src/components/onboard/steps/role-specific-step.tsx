"use client";

import { CustomFieldRenderer } from "@/components/custom-field-renderer";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import { JOURNEY_OPTIONS } from "@/constants/onboard";
import type { RoleQuestions } from "@/constants/onboarding-questions";
import { motion } from "framer-motion";

interface RoleSpecificStepProps {
  role?: string;
  roleQuestions?: RoleQuestions;
  getCustomFieldValue: (fieldId: string) => string | string[] | number | boolean | null;
  updateCustomField: (fieldId: string, value: string | string[] | number | boolean | null) => void;
}

export function RoleSpecificStep({
  role,
  roleQuestions,
  getCustomFieldValue,
  updateCustomField,
}: RoleSpecificStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <OnboardStepHeader
        title="Habilidades Específicas"
        description={`Agora vamos personalizar para a tua jornada como ${
          JOURNEY_OPTIONS.find(j => j.id === role)?.title || ""
        }.`}
      />

      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
        {roleQuestions && roleQuestions.personalInfo.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {roleQuestions.personalInfo.map((question, index) => (
              <CustomFieldRenderer
                key={question.id}
                question={question}
                value={getCustomFieldValue(question.id)}
                onChange={value => updateCustomField(question.id, value)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-white/60 sm:text-base">
            Não há campos adicionais para este tipo de jornada.
          </p>
        )}
      </div>
    </motion.div>
  );
}

