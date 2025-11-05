"use client";

import { OnboardStepHeader } from "@/components/onboard-step-header";
import { JOURNEY_OPTIONS } from "@/constants/onboard";
import type { RoleQuestions } from "@/constants/onboarding-questions";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ConfirmationStepProps {
  name: string;
  email: string;
  location?: string;
  role?: string;
  experience?: string;
  goals: string[];
  roleQuestions?: RoleQuestions;
  getCustomFieldValue: (fieldId: string) => any;
}

const experienceLabels: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermédio",
  advanced: "Avançado",
  professional: "Profissional",
};

export function ConfirmationStep({
  name,
  email,
  location,
  role,
  experience,
  goals,
  roleQuestions,
  getCustomFieldValue,
}: ConfirmationStepProps) {
  const journeyOption = JOURNEY_OPTIONS.find(j => j.id === role);
  const selectedGoals = (goals || [])
    .map(goalId => {
      const allGoals = roleQuestions?.goals || [];
      return allGoals.find(g => g.id === goalId);
    })
    .filter(
      (goal): goal is NonNullable<typeof goal> => goal !== undefined,
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <OnboardStepHeader
        title="Confirma os Teus Dados"
        description="Revisa todas as informações preenchidas antes de finalizar. Podes voltar para editar qualquer campo."
      />

      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        {/* Informações Básicas */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
            <CheckCircle className="h-4 w-4 text-[#00cfb1] sm:h-5 sm:w-5" />
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-white/60">Nome</p>
              <p className="font-medium text-white">{name || "Não preenchido"}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Email</p>
              <p className="font-medium text-white">
                {email || "Não preenchido"}
              </p>
            </div>
            {location && (
              <div>
                <p className="text-sm text-white/60">Localização</p>
                <p className="font-medium text-white">{location}</p>
              </div>
            )}
          </div>
        </div>

        {/* Jornada */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
            <CheckCircle className="h-4 w-4 text-[#00cfb1] sm:h-5 sm:w-5" />
            Jornada Escolhida
          </h3>
          {journeyOption && (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Image
                src={journeyOption.icon}
                alt={journeyOption.title}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white sm:text-base">
                  {journeyOption.title}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {journeyOption.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="border-brand-green/30 bg-brand-green/10 text-brand-green rounded-full border px-2 py-0.5 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Experiência */}
        {experience && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
              <CheckCircle className="h-4 w-4 text-[#00cfb1] sm:h-5 sm:w-5" />
              Experiência
            </h3>
            <p className="text-sm font-medium text-white sm:text-base">
              {experienceLabels[experience] || experience}
            </p>
          </div>
        )}

        {/* Campos Personalizados do Role */}
        {roleQuestions?.personalInfo &&
          roleQuestions.personalInfo.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
                <CheckCircle className="h-4 w-4 text-[#00cfb1] sm:h-5 sm:w-5" />
                Informações Específicas
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {roleQuestions.personalInfo.map(question => {
                  const value = getCustomFieldValue(question.id);
                  if (
                    !value ||
                    (Array.isArray(value) && value.length === 0)
                  )
                    return null;

                  return (
                    <div key={question.id}>
                      <p className="text-sm text-white/60">{question.label}</p>
                      <p className="font-medium text-white">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Objetivos */}
        {selectedGoals.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
              <CheckCircle className="h-4 w-4 text-[#00cfb1] sm:h-5 sm:w-5" />
              Objetivos Selecionados
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {selectedGoals.map(goal => (
                <div
                  key={goal.id}
                  className="flex items-center gap-1.5 rounded-full border border-[#00cfb1]/30 bg-[#00cfb1]/10 px-2.5 py-1.5 sm:gap-2 sm:px-4 sm:py-2"
                >
                  {goal.icon && (
                    <goal.icon className="h-3.5 w-3.5 text-[#00cfb1] sm:h-4 sm:w-4" />
                  )}
                  <span className="text-xs font-medium text-white sm:text-sm">
                    {goal.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campos Adicionais */}
        {roleQuestions?.customFields &&
          roleQuestions.customFields.length > 0 &&
          roleQuestions.customFields.some(q => {
            const value = getCustomFieldValue(q.id);
            return value && (!Array.isArray(value) || value.length > 0);
          }) && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
                <CheckCircle className="h-4 w-4 text-[#00cfb1] sm:h-5 sm:w-5" />
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {roleQuestions.customFields.map(question => {
                  const value = getCustomFieldValue(question.id);
                  if (
                    !value ||
                    (Array.isArray(value) && value.length === 0)
                  )
                    return null;

                  return (
                    <div key={question.id}>
                      <p className="text-sm text-white/60">{question.label}</p>
                      <p className="font-medium text-white">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Mensagem final */}
        <div className="rounded-xl border border-[#00cfb1]/30 bg-gradient-to-br from-[#00cfb1]/10 to-transparent p-4 text-center sm:rounded-2xl sm:p-6">
          <p className="text-sm text-white/80 sm:text-base">
            <span className="font-semibold text-[#00cfb1]">Tudo certo?</span>{" "}
            Avança para finalizar o teu cadastro.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

