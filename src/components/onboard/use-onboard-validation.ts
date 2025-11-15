import { useToast } from "@/hooks/use-toast-custom";
import type { RoleQuestions } from "@/constants/onboarding-questions";
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
  getCustomFieldValue: (fieldId: string) => any;
}

export function useOnboardValidation({
  formData,
  roleQuestions,
  getCustomFieldValue,
}: UseOnboardValidationProps) {
  const { toast } = useToast();

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
            toast.error(
              "Erro de Validação",
              "Nome deve ter pelo menos 2 caracteres",
            );
            return false;
          }
          if (
            !formData.email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
          ) {
            toast.error("Erro de Validação", "Email inválido");
            return false;
          }
          // Validar nickname se fornecido (opcional)
          if (formData.nickname && formData.nickname.trim()) {
            const trimmedNickname = formData.nickname.trim();
            if (trimmedNickname.length < 3) {
              toast.error(
                "Erro de Validação",
                "O nickname deve ter pelo menos 3 caracteres",
              );
              return false;
            }
            if (trimmedNickname.length > 30) {
              toast.error(
                "Erro de Validação",
                "O nickname deve ter no máximo 30 caracteres",
              );
              return false;
            }
            if (!/^[a-z0-9-]+$/.test(trimmedNickname)) {
              toast.error(
                "Erro de Validação",
                "O nickname deve conter apenas letras minúsculas, números e traços",
              );
              return false;
            }
          }
          // Validar data de nascimento se fornecida
          if (formData.dateOfBirth) {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const birthDate = formData.dateOfBirth instanceof Date 
              ? formData.dateOfBirth 
              : new Date(formData.dateOfBirth);
            
            if (birthDate > today) {
              toast.error(
                "Erro de Validação",
                "A data de nascimento não pode ser no futuro",
              );
              return false;
            }
            
            const minDate = new Date("1900-01-01");
            if (birthDate < minDate) {
              toast.error(
                "Erro de Validação",
                "A data de nascimento deve ser após 1900",
              );
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
                  "Erro de Validação",
                  `${field.label} é obrigatório`,
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
    } catch (error: any) {
      const errorMessage =
        error?.errors?.[0]?.message || "Erro de validação";
      toast.error("Erro de Validação", errorMessage);
      return false;
    }
  };

  return { validateStep };
}

