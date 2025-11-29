"use client";

import { CustomFieldRenderer } from "@/components/custom-field-renderer";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import type { RoleQuestions } from "@/constants/onboarding-questions";
import { motion } from "framer-motion";

interface AdditionalInfoStepProps {
  roleQuestions?: RoleQuestions;
  getCustomFieldValue: (fieldId: string) => string | string[] | number | boolean | null;
  updateCustomField: (fieldId: string, value: string | string[] | number | boolean | null) => void;
}

export function AdditionalInfoStep({
  roleQuestions,
  getCustomFieldValue,
  updateCustomField,
}: AdditionalInfoStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <OnboardStepHeader
        title="Mais Algumas Informações"
        description="Últimos detalhes para personalizar completamente a tua experiência."
      />

      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
        {roleQuestions && roleQuestions.customFields.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {roleQuestions.customFields.map((question, index) => (
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
            Nenhuma informação adicional necessária. Continua para o próximo
            passo!
          </p>
        )}
      </div>
    </motion.div>
  );
}

