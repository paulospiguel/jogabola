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
      className="space-y-8"
    >
      <OnboardStepHeader
        title="Confirma os Teus Dados"
        description="Revisa todas as informações preenchidas antes de finalizar. Podes voltar para editar qualquer campo."
      />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Informações Básicas */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <CheckCircle className="h-5 w-5 text-[#00cfb1]" />
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <CheckCircle className="h-5 w-5 text-[#00cfb1]" />
            Jornada Escolhida
          </h3>
          {journeyOption && (
            <div className="flex items-center gap-3">
              <Image
                src={journeyOption.icon}
                alt={journeyOption.title}
                className="h-12 w-12"
              />
              <div>
                <p className="font-semibold text-white">
                  {journeyOption.title}
                </p>
                <p className="text-sm text-white/60">
                  {journeyOption.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Experiência */}
        {experience && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <CheckCircle className="h-5 w-5 text-[#00cfb1]" />
              Experiência
            </h3>
            <p className="font-medium text-white">
              {experienceLabels[experience] || experience}
            </p>
          </div>
        )}

        {/* Campos Personalizados do Role */}
        {roleQuestions?.personalInfo &&
          roleQuestions.personalInfo.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <CheckCircle className="h-5 w-5 text-[#00cfb1]" />
                Informações Específicas
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <CheckCircle className="h-5 w-5 text-[#00cfb1]" />
              Objetivos Selecionados
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedGoals.map(goal => (
                <div
                  key={goal.id}
                  className="flex items-center gap-2 rounded-full border border-[#00cfb1]/30 bg-[#00cfb1]/10 px-4 py-2"
                >
                  {goal.icon && (
                    <goal.icon className="h-4 w-4 text-[#00cfb1]" />
                  )}
                  <span className="text-sm font-medium text-white">
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <CheckCircle className="h-5 w-5 text-[#00cfb1]" />
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        <div className="rounded-2xl border border-[#00cfb1]/30 bg-gradient-to-br from-[#00cfb1]/10 to-transparent p-6 text-center">
          <p className="text-white/80">
            <span className="font-semibold text-[#00cfb1]">Tudo certo?</span>{" "}
            Avança para finalizar o teu cadastro.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

