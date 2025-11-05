"use client";

import {
  createProfileFromOnboarding,
  getPendingOnboarding,
  getProfileData,
  linkOnboardingToUser,
  saveOnboarding,
  saveProfileData,
} from "@/actions/profile";
import { FloatingOrb } from "@/components/floating-orb";
import { OnboardNavigation } from "@/components/onboard-navigation";
import { OnboardProgressHeader } from "@/components/onboard-progress-header";
import { AdditionalInfoStep } from "@/components/onboard/steps/additional-info-step";
import { BasicInfoStep } from "@/components/onboard/steps/basic-info-step";
import { ConfirmationStep } from "@/components/onboard/steps/confirmation-step";
import { ExperienceStep } from "@/components/onboard/steps/experience-step";
import { GoalsStep } from "@/components/onboard/steps/goals-step";
import { JourneySelectionStep } from "@/components/onboard/steps/journey-selection-step";
import { OnboardIntroStep } from "@/components/onboard/steps/onboard-intro-step";
import { RoleSpecificStep } from "@/components/onboard/steps/role-specific-step";
import { useOnboardValidation } from "@/components/onboard/use-onboard-validation";
import { Button } from "@/components/ui/button";
import { getQuestionsByRole } from "@/constants/onboarding-questions";
import { useProfileSync } from "@/hooks/use-profile-sync";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import { useProfileStore } from "@/stores/profile";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function OnboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("onboard");

  // Sync profile data when user logs in (para vincular onboarding pendente)
  useProfileSync(session?.user?.id, saveProfileData);
  const [autoFilledFields, setAutoFilledFields] = useState<{
    name?: boolean;
    email?: boolean;
  }>({});
  const [originalValues, setOriginalValues] = useState<{
    name?: string;
    email?: string;
  }>({});

  // Zustand store
  const {
    data: formData,
    currentStep,
    updateData,
    setCurrentStep,
    setCompleted,
    reset,
  } = useProfileStore();

  const totalSteps = 8;

  // Get role-specific questions
  const roleQuestions = useMemo(
    () => getQuestionsByRole(formData.role as any) || undefined,
    [formData.role],
  );

  // Update custom fields in form data
  const updateCustomField = (fieldId: string, value: any) => {
    const currentCustomFields = formData.customFields || {};
    updateData({
      customFields: {
        ...currentCustomFields,
        [fieldId]: value,
      },
    });
  };

  const getCustomFieldValue = (fieldId: string) => {
    return formData.customFields?.[fieldId] || "";
  };

  // Validation hook
  const { validateStep } = useOnboardValidation({
    formData,
    roleQuestions,
    getCustomFieldValue,
  });

  // Limpar dados ao carregar a página (refresh = perde tudo)
  // Mas não limpar se:
  // 1. Há migração em andamento (migrate=true)
  // 2. Usuário já está logado e pode ter dados para carregar
  useEffect(() => {
    const { completed } = useProfileStore.getState();
    const migrateParam = searchParams.get("migrate");
    const hasActiveSession = !!session?.user?.id;

    // Se não está completado e não há migração nem sessão ativa, limpar ao montar (refresh)
    // Isso garante que cada visita à página comece limpo, exceto quando há contexto especial
    if (!completed && !migrateParam && !hasActiveSession) {
      reset();
    }
  }, [reset, searchParams, session?.user?.id]); // Executar quando parâmetros mudarem

  // Initialize with search params
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && !formData.role) {
      updateData({ role: roleParam as any });
    }

    // Se há parâmetro migrate=true e usuário está logado, vincular onboarding pendente
    const migrateParam = searchParams.get("migrate");
    if (migrateParam === "true" && session?.user?.id && session?.user?.email) {
      // Primeiro buscar os dados do onboarding pendente
      getPendingOnboarding(session.user.email).then(pendingResult => {
        if (pendingResult.success && pendingResult.data) {
          // Carregar dados no formulário antes de vincular
          const pendingData = pendingResult.data;
          updateData({
            role: pendingData.role as any,
            name: pendingData.name,
            email: pendingData.email,
            location: pendingData.location,
            experience: pendingData.experience as any,
            availability: pendingData.availability as any,
            goals: pendingData.goals || [],
            waitlistApps: pendingData.waitlistApps || [],
            customFields: pendingData.customFields || {},
            preferences: pendingData.preferences || {
              notifications: true,
              newsletter: true,
              earlyAccess: true,
            },
          });
          setCompleted(true);

          // Vincular onboarding ao user e criar profile se completo
          linkOnboardingToUser(session.user.id, session.user.email).then(
            linkResult => {
              if (linkResult.success) {
                toast.success(
                  t("success.recovered"),
                  t("success.recoveredMessage"),
                );
              }
            },
          );
        }
      });
    }
  }, [
    searchParams,
    formData.role,
    updateData,
    session?.user?.id,
    session?.user?.email,
    setCompleted,
    toast,
  ]);

  // Bloquear acesso se já completou onboarding
  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!session?.user?.id) return;

      try {
        const profileResult = await getProfileData(session.user.id);

        // Se já completou onboarding, redirecionar para dashboard
        if (profileResult.success && profileResult.data?.completed) {
          const role = profileResult.data.role;
          if (role) {
            // Redirecionar para dashboard da jornada
            const journeyRoutes: Record<string, string> = {
              PLAYER: "/play-zone",
              MANAGER: "/arena",
              FAN: "/fan-zone",
              ORGANIZER: "/organizer",
            };
            const dashboardRoute = journeyRoutes[role] || "/arena";
            router.push(dashboardRoute);
          } else {
            router.push("/arena");
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    }

    checkOnboardingStatus();
  }, [session?.user?.id, router]);

  // Preencher nome e email automaticamente quando usuário estiver logado
  useEffect(() => {
    async function loadUserData() {
      if (!session?.user?.id) return;

      const filledFields: typeof autoFilledFields = {};
      const updates: Partial<typeof formData> = {};

      try {
        // Tentar carregar dados do perfil existente
        const profileResult = await getProfileData(session.user.id);

        // Sempre preencher nome e email da sessão quando usuário estiver logado
        if (session.user.name) {
          updates.name = session.user.name;
          filledFields.name = true;
          setOriginalValues(prev => ({ ...prev, name: session.user.name }));
        }

        if (session.user.email) {
          updates.email = session.user.email;
          filledFields.email = true;
          setOriginalValues(prev => ({
            ...prev,
            email: session.user.email,
          }));
        }

        // Se já tem perfil, preencher outros dados do perfil
        if (profileResult.success && profileResult.data) {
          // Usar nome do perfil se existir e for diferente do nome da sessão
          if (
            profileResult.data.name &&
            profileResult.data.name !== session.user.name
          ) {
            updates.name = profileResult.data.name;
            setOriginalValues(prev => ({
              ...prev,
              name: profileResult.data.name,
            }));
          }

          if (profileResult.data.role && !formData.role) {
            updates.role = profileResult.data.role as any;
          }

          if (profileResult.data.location && !formData.location) {
            updates.location = profileResult.data.location;
          }

          if (profileResult.data.experience && !formData.experience) {
            updates.experience = profileResult.data.experience as any;
          }

          if (
            profileResult.data.goals &&
            profileResult.data.goals.length > 0 &&
            (!formData.goals || formData.goals.length === 0)
          ) {
            updates.goals = profileResult.data.goals;
          }
        }

        // Aplicar atualizações
        if (Object.keys(updates).length > 0) {
          updateData(updates);
        }

        // Marcar campos como auto-preenchidos
        if (Object.keys(filledFields).length > 0) {
          setAutoFilledFields(filledFields);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        // Em caso de erro, pelo menos tentar preencher com dados da sessão
        if (session.user.name) {
          updates.name = session.user.name;
          filledFields.name = true;
          setOriginalValues(prev => ({ ...prev, name: session.user.name }));
        }

        if (session.user.email) {
          updates.email = session.user.email;
          filledFields.email = true;
          setOriginalValues(prev => ({
            ...prev,
            email: session.user.email,
          }));
        }

        if (Object.keys(updates).length > 0) {
          updateData(updates);
        }

        if (Object.keys(filledFields).length > 0) {
          setAutoFilledFields(filledFields);
        }
      }
    }

    loadUserData();
  }, [session?.user?.id, session?.user?.name, session?.user?.email]);

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!formData.email || !formData.name || !formData.role) {
        toast.error(t("errors.title"), t("errors.requiredFields"));
        setIsSubmitting(false);
        return;
      }

      // Sempre salvar onboarding (com ou sem user_id)
      const onboardingResult = await saveOnboarding(
        formData as any,
        session?.user?.id,
      );

      if (!onboardingResult.success) {
        toast.error(
          t("errors.title"),
          onboardingResult.error || t("errors.saveError"),
        );
        setIsSubmitting(false);
        return;
      }

      // Se usuário está logado, criar profile também
      if (session?.user?.id) {
        const profileResult = await createProfileFromOnboarding(
          session.user.id,
        );

        if (!profileResult.success) {
          toast.error(
            t("errors.title"),
            profileResult.error || t("errors.createProfileError"),
          );
          setIsSubmitting(false);
          return;
        }

        // Mark as completed in store
        setCompleted(true);

        toast.success(t("success.completed"), t("success.completedMessage"));

        // Redirect to arena with delay
        setTimeout(() => {
          router.push("/arena");
        }, 1500);
      } else {
        // User not logged in - onboarding salvo como pendente
        // Mark as completed in store
        setCompleted(true);

        toast.success(
          t("success.completedPending"),
          t("success.completedPendingMessage"),
        );

        // Redirect to sign-in with email and name as query params
        setTimeout(() => {
          const params = new URLSearchParams({
            email: formData.email || "",
            name: formData.name || "",
          });
          router.push(`/sign-in?${params.toString()}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      toast.error(t("errors.title"), t("errors.saveDataError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    updateData({ [field]: value });
  };

  const toggleGoal = (goal: string) => {
    const currentGoals = formData.goals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    updateData({ goals: newGoals });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OnboardIntroStep />;

      case 1:
        return (
          <JourneySelectionStep
            selectedRole={formData.role}
            onRoleSelect={id => updateFormData("role", id)}
          />
        );

      case 2:
        return (
          <BasicInfoStep
            name={formData.name || ""}
            email={formData.email || ""}
            location={formData.location || ""}
            autoFilledFields={autoFilledFields}
            onNameChange={value => updateFormData("name", value)}
            onEmailChange={value => updateFormData("email", value)}
            onLocationChange={value => updateFormData("location", value)}
          />
        );

      case 3:
        return (
          <ExperienceStep
            experience={formData.experience}
            onExperienceChange={value => updateFormData("experience", value)}
          />
        );

      case 4:
        return (
          <RoleSpecificStep
            role={formData.role}
            roleQuestions={roleQuestions}
            getCustomFieldValue={getCustomFieldValue}
            updateCustomField={updateCustomField}
          />
        );

      case 5:
        return (
          <GoalsStep
            roleQuestions={roleQuestions}
            selectedGoals={formData.goals || []}
            onToggleGoal={toggleGoal}
          />
        );

      case 6:
        return (
          <AdditionalInfoStep
            roleQuestions={roleQuestions}
            getCustomFieldValue={getCustomFieldValue}
            updateCustomField={updateCustomField}
          />
        );

      case 7:
        return (
          <ConfirmationStep
            name={formData.name || ""}
            email={formData.email || ""}
            location={formData.location}
            role={formData.role}
            experience={formData.experience}
            goals={formData.goals || []}
            roleQuestions={roleQuestions}
            getCustomFieldValue={getCustomFieldValue}
          />
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Boas-vindas sempre pode avançar
      case 1:
        return !!formData.role; // Precisa escolher role
      case 2:
        return !!formData.name && !!formData.email; // Precisa nome e email
      case 3:
        return true; // Experiência e disponibilidade são opcionais
      case 4:
        // Validar campos obrigatórios específicos do role
        if (roleQuestions?.personalInfo) {
          const requiredFields = roleQuestions.personalInfo.filter(
            q => q.required,
          );
          return requiredFields.every(field => {
            const value = getCustomFieldValue(field.id);
            return value && (!Array.isArray(value) || value.length > 0);
          });
        }
        return true;
      case 5:
        return (formData.goals || []).length > 0; // Precisa selecionar pelo menos 1 objetivo
      case 6:
        return true; // Campos adicionais geralmente são opcionais
      case 7:
        return true; // Confirmação sempre pode avançar
      default:
        return true;
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#21005a] via-[#2b0071] to-[#21005a]">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb delay={0} size={200} position="top-20 left-10" />
        <FloatingOrb delay={1} size={150} position="top-40 right-20" />
        <FloatingOrb delay={2} size={100} position="bottom-20 left-1/4" />
        <FloatingOrb delay={3} size={120} position="bottom-40 right-1/3" />
      </div>

      {/* Botão de fechar flutuante */}
      <Button
        onClick={handleClose}
        variant="ghost"
        size="icon"
        className="fixed top-3 right-3 z-50 h-8 w-8 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-all hover:bg-white/20 hover:text-[#00cfb1] sm:top-4 sm:right-4 sm:h-10 sm:w-10"
        aria-label={t("close")}
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:py-12">
        <OnboardProgressHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
        />

        {/* Conteúdo do passo atual */}
        <div className="mb-6 sm:mb-8 md:mb-12">{renderStep()}</div>

        <OnboardNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          canProceed={canProceed()}
          isSubmitting={isSubmitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
