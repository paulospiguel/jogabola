import { useTranslations } from "next-intl";
import type { RoleQuestions } from "@/constants/onboarding-questions";
import { useToast } from "@/hooks/use-toast-custom";
import { step1Schema, step3Schema } from "@/schemas/profile";

interface UseOnboardValidationProps {
  formData: {
    role?: string;
    name?: string;
    email?: string;
    nickname?: string;
    dateOfBirth?: Date | null;
    goals?: string[];
  };
  roleQuestions?: RoleQuestions;
  getCustomFieldValue: (
    fieldId: string,
  ) => string | string[] | number | boolean | null;
}

export function useOnboardValidation({
  formData,
  roleQuestions,
  getCustomFieldValue,
}: UseOnboardValidationProps) {
  const { toast } = useToast();
  const t = useTranslations("onboard.validation");

  const validateStep = (step: number): boolean => {
    try {
      switch (step) {
        case 0:
          return true; // Boas-vindas - sempre válido
        case 1:
          step1Schema.parse({ role: formData.role });
          return true;
        case 2:
          // Validar nome e email (obrigatórios)
          if (!formData.name || formData.name.length < 2) {
            toast.error(t("title"), t("nameMin"));
            return false;
          }
          if (
            !formData.email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
          ) {
            toast.error(t("title"), t("invalidEmail"));
            return false;
          }
          // Validar nickname se fornecido (opcional)
          if (formData.nickname && formData.nickname.trim()) {
            const trimmedNickname = formData.nickname.trim();
            if (trimmedNickname.length < 3) {
              toast.error(t("title"), t("nicknameMin"));
              return false;
            }
            if (trimmedNickname.length > 30) {
              toast.error(t("title"), t("nicknameMax"));
              return false;
            }
            if (!/^[a-z0-9-]+$/.test(trimmedNickname)) {
              toast.error(t("title"), t("nicknamePattern"));
              return false;
            }
          }
          // Validar data de nascimento se fornecida
          if (formData.dateOfBirth) {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const birthDate =
              formData.dateOfBirth instanceof Date
                ? formData.dateOfBirth
                : new Date(formData.dateOfBirth);

            if (birthDate > today) {
              toast.error(t("title"), t("birthDateFuture"));
              return false;
            }

            const minDate = new Date("1900-01-01");
            if (birthDate < minDate) {
              toast.error(t("title"), t("birthDateMin"));
              return false;
            }
          }
          return true;
        case 3:
          // Experiência e disponibilidade - opcionais mas validar formato se preenchidos
          return true;
        case 4:
          // Informações específicas por role - validar campos obrigatórios
          if (roleQuestions?.personalInfo) {
            const requiredFields = roleQuestions.personalInfo.filter(
              q => q.required,
            );
            for (const field of requiredFields) {
              const value = getCustomFieldValue(field.id);
              if (!value || (Array.isArray(value) && value.length === 0)) {
                toast.error(
                  t("title"),
                  t("requiredField", { field: field.label }),
                );
                return false;
              }
            }
          }
          return true;
        case 5:
          step3Schema.parse({ goals: formData.goals });
          return true;
        case 6:
          // Informações adicionais - geralmente opcionais
          return true;
        case 7:
          // Step de confirmação - sempre válido, só revisão
          return true;
        default:
          return true;
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { errors?: { message: string }[] })?.errors?.[0]?.message ||
        t("generic");
      toast.error(t("title"), errorMessage);
      return false;
    }
  };

  return { validateStep };
}
