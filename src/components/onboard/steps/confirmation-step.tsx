"use client";

import { countries } from "country-data-list";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import { WalletConnectSection } from "@/components/wallet/wallet-connect-section";
import { translateFieldValue } from "@/constants/field-translations";
import { JOURNEY_OPTIONS } from "@/constants/onboard";
import type { RoleQuestions } from "@/constants/onboarding-questions";
import { getPositionConfig, getPositionLabel } from "@/constants/positions";

interface ConfirmationStepProps {
  name: string;
  email: string;
  nickname?: string;
  dateOfBirth?: Date | null;
  nationality?: string;
  country?: string;
  city?: string;
  location?: string;
  role?: string;
  experience?: string;
  goals: string[];
  roleQuestions?: RoleQuestions;
  getCustomFieldValue: (
    fieldId: string,
  ) => string | string[] | number | boolean | null;
}

// Mapeamento de nomes em inglês para português (principais países)
const countryNamesPT: Record<string, string> = {
  Portugal: "Portugal",
  Brazil: "Brasil",
  Angola: "Angola",
  Mozambique: "Moçambique",
  "Cape Verde": "Cabo Verde",
  "Guinea-Bissau": "Guiné-Bissau",
  "São Tomé and Príncipe": "São Tomé e Príncipe",
  Spain: "Espanha",
  France: "França",
  Italy: "Itália",
  Germany: "Alemanha",
  "United Kingdom": "Reino Unido",
  "United States": "Estados Unidos",
  Canada: "Canadá",
  Argentina: "Argentina",
  Mexico: "México",
  Chile: "Chile",
  Colombia: "Colômbia",
  Peru: "Peru",
  Uruguay: "Uruguai",
  Venezuela: "Venezuela",
  Ecuador: "Equador",
  Paraguay: "Paraguai",
  Bolivia: "Bolívia",
};

// Função para obter o nome do país a partir do código
const getCountryName = (code?: string): string => {
  if (!code) return "";
  const country = countries.all.find(c => c.alpha2 === code.toUpperCase());
  if (!country) return code;
  return countryNamesPT[country.name] || country.name;
};

export function ConfirmationStep({
  name,
  email,
  nickname,
  dateOfBirth,
  nationality,
  country,
  city,
  location,
  role,
  experience,
  goals,
  roleQuestions,
  getCustomFieldValue,
}: ConfirmationStepProps) {
  const t = useTranslations();
  const tc = useTranslations("onboardingPage.steps.confirmation");
  const journeyOption = JOURNEY_OPTIONS.find(j => j.id === role);
  const selectedGoals = (goals || [])
    .map(goalId => {
      const allGoals = roleQuestions?.goals || [];
      return allGoals.find(g => g.id === goalId);
    })
    .filter((goal): goal is NonNullable<typeof goal> => goal !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <OnboardStepHeader title={tc("title")} description={tc("description")} />

      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        {/* Informações Básicas */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
            <CheckCircle className="h-4 w-4 text-brand-green sm:h-5 sm:w-5" />
            {tc("basicInfo")}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-white/60">{t("common.name")}</p>
              <p className="font-medium text-white">
                {name || t("common.notFilled")}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/60">{t("common.email")}</p>
              <p className="font-medium text-white">
                {email || t("common.notFilled")}
              </p>
            </div>
            {nickname && (
              <div>
                <p className="text-sm text-white/60">Nickname</p>
                <p className="font-medium text-white">{nickname}</p>
              </div>
            )}
            {dateOfBirth && (
              <div>
                <p className="text-sm text-white/60">
                  {t("onboardingPage.steps.basicInfo.fields.dateOfBirth")}
                </p>
                <p className="font-medium text-white">
                  {(() => {
                    try {
                      const date =
                        dateOfBirth instanceof Date
                          ? dateOfBirth
                          : new Date(dateOfBirth);
                      if (isNaN(date.getTime())) return t("common.invalidDate");
                      return format(date, "PPP", { locale: pt });
                    } catch {
                      return t("common.invalidDate");
                    }
                  })()}
                </p>
              </div>
            )}
            {nationality && (
              <div>
                <p className="text-sm text-white/60">
                  {t("onboardingPage.steps.basicInfo.fields.nationality")}
                </p>
                <p className="font-medium text-white">
                  {getCountryName(nationality)}
                </p>
              </div>
            )}
            {country && (
              <div>
                <p className="text-sm text-white/60">
                  {t("onboardingPage.steps.basicInfo.fields.country")}
                </p>
                <p className="font-medium text-white">
                  {getCountryName(country)}
                </p>
              </div>
            )}
            {city && (
              <div>
                <p className="text-sm text-white/60">
                  {t("onboardingPage.steps.basicInfo.fields.city")}
                </p>
                <p className="font-medium text-white">{city}</p>
              </div>
            )}
            {location && (
              <div>
                <p className="text-sm text-white/60">
                  {t("onboardingPage.steps.basicInfo.fields.location")}
                </p>
                <p className="font-medium text-white">{location}</p>
              </div>
            )}
          </div>
        </div>

        {/* Jornada */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
            <CheckCircle className="h-4 w-4 text-brand-green sm:h-5 sm:w-5" />
            {tc("selectedJourney")}
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
              <CheckCircle className="h-4 w-4 text-brand-green sm:h-5 sm:w-5" />
              {tc("experience")}
            </h3>
            <p className="text-sm font-medium text-white sm:text-base">
              {t(`experience.${experience}`) || experience}
            </p>
          </div>
        )}

        {/* Campos Personalizados do Role */}
        {roleQuestions?.personalInfo &&
          roleQuestions.personalInfo.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:rounded-2xl sm:p-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white sm:mb-4 sm:text-lg">
                <CheckCircle className="h-4 w-4 text-brand-green sm:h-5 sm:w-5" />
                {tc("specificInfo")}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {roleQuestions.personalInfo.map(question => {
                  const value = getCustomFieldValue(question.id);
                  if (!value || (Array.isArray(value) && value.length === 0))
                    return null;

                  // Se for a posição, exibir com ícone e tradução
                  if (question.id === "position" && typeof value === "string") {
                    const positionConfig = getPositionConfig(value);
                    const PositionIcon = positionConfig?.icon;
                    const positionLabel = getPositionLabel(value);

                    return (
                      <div key={question.id}>
                        <p className="text-sm text-white/60">
                          {question.label}
                        </p>
                        <div className="flex items-center gap-2">
                          {PositionIcon && (
                            <PositionIcon className="h-4 w-4 text-brand-green" />
                          )}
                          {positionConfig?.emoji && (
                            <span className="text-base">
                              {positionConfig.emoji}
                            </span>
                          )}
                          <p className="font-medium text-white">
                            {positionLabel}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Traduzir o valor se necessário
                  const translatedValue = translateFieldValue(
                    question.id,
                    String(value),
                  );

                  return (
                    <div key={question.id}>
                      <p className="text-sm text-white/60">{question.label}</p>
                      <p className="font-medium text-white">
                        {translatedValue ||
                          (Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value))}
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
              <CheckCircle className="h-4 w-4 text-brand-green sm:h-5 sm:w-5" />
              {tc("selectedGoals")}
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {selectedGoals.map(goal => (
                <div
                  key={goal.id}
                  className="flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-1.5 sm:gap-2 sm:px-4 sm:py-2"
                >
                  {goal.icon && (
                    <goal.icon className="h-3.5 w-3.5 text-brand-green sm:h-4 sm:w-4" />
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
                <CheckCircle className="h-4 w-4 text-brand-green sm:h-5 sm:w-5" />
                {tc("additionalInfo")}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {roleQuestions.customFields.map(question => {
                  const value = getCustomFieldValue(question.id);
                  if (!value || (Array.isArray(value) && value.length === 0))
                    return null;

                  // Traduzir o valor se necessário
                  const translatedValue = translateFieldValue(
                    question.id,
                    String(value),
                  );

                  return (
                    <div key={question.id}>
                      <p className="text-sm text-white/60">{question.label}</p>
                      <p className="font-medium text-white">
                        {translatedValue ||
                          (Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value))}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Wallet Solana — secção opcional, não bloqueia o onboarding */}
        <WalletConnectSection variant="onboarding" />

        {/* Mensagem final */}
        <div className="rounded-xl border border-brand-green/30 bg-linear-to-br from-brand-green/10 to-transparent p-4 text-center sm:rounded-2xl sm:p-6">
          <p className="text-sm text-white/80 sm:text-base">
            <span className="font-semibold text-brand-green">
              {tc("allGood")}
            </span>{" "}
            {tc("proceed")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
