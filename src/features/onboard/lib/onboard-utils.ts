import type { RoleQuestions } from "@/constants/onboarding-questions";

export function normalizeOptionalDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

export function getJourneyDashboardRoute(role?: string | null) {
  const journeyRoutes: Record<string, string> = {
    PLAYER: "/playzone",
    MANAGER: "/arena",
    FAN: "/fan-zone",
    ORGANIZER: "/organizer",
  };

  return role ? journeyRoutes[role] || "/arena" : "/arena";
}

export function canProceedToNextOnboardStep({
  currentStep,
  formData,
  roleQuestions,
  getCustomFieldValue,
}: {
  currentStep: number;
  formData: {
    role?: string;
    name?: string;
    email?: string;
    goals?: string[];
  };
  roleQuestions?: RoleQuestions;
  getCustomFieldValue: (fieldId: string) => unknown;
}) {
  switch (currentStep) {
    case 0:
      return true;
    case 1:
      return !!formData.role;
    case 2:
      return !!formData.name && !!formData.email;
    case 4:
      if (!roleQuestions?.personalInfo) {
        return true;
      }

      return roleQuestions.personalInfo
        .filter((question) => question.required)
        .every((field) => {
          const value = getCustomFieldValue(field.id);
          return Boolean(value) && (!Array.isArray(value) || value.length > 0);
        });
    case 5:
      return (formData.goals || []).length > 0;
    default:
      return true;
  }
}
