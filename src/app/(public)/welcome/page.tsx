"use client";

import { saveProfileData } from "@/actions/profile";
import { CommunicationPreferences } from "@/components/communication-preferences";
import { CustomFieldRenderer } from "@/components/custom-field-renderer";
import { FloatingOrb } from "@/components/floating-orb";
import { GoalCard } from "@/components/goal-card";
import { JourneyOptionCard } from "@/components/journey-option-card";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WaitlistAppCard } from "@/components/waitlist-app-card";
import { WelcomeNavigation } from "@/components/welcome-navigation";
import { WelcomeProgressHeader } from "@/components/welcome-progress-header";
import { WelcomeStepHeader } from "@/components/welcome-step-header";
import { getQuestionsByRole } from "@/constants/onboarding-questions";
import { AVAILABLE_APPS, JOURNEY_OPTIONS } from "@/constants/welcome";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import { step1Schema, step3Schema, step4Schema } from "@/schemas/profile";
import { useProfileStore } from "@/stores/profile";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function WelcomePage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zustand store
  const {
    data: formData,
    currentStep,
    updateData,
    setCurrentStep,
    setCompleted,
  } = useProfileStore();

  const totalSteps = 8;

  // Get role-specific questions
  const roleQuestions = useMemo(
    () => getQuestionsByRole(formData.role as any),
    [formData.role],
  );

  // Initialize with search params
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && !formData.role) {
      updateData({ role: roleParam as any });
    }
  }, [searchParams, formData.role, updateData]);

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

  const validateStep = (step: number): boolean => {
    try {
      switch (step) {
        case 0:
          return true; // Boas-vindas - sempre válido
        case 1:
          step1Schema.parse({ role: formData.role });
          return true;
        case 2:
          // Validar apenas nome e email
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
          step4Schema.parse({
            waitlistApps: formData.waitlistApps,
            preferences: formData.preferences,
          });
          return true;
        default:
          return true;
      }
    } catch (error: any) {
      const errorMessage = error?.errors?.[0]?.message || "Erro de validação";
      toast.error("Erro de Validação", errorMessage);
      return false;
    }
  };

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
      // If user is logged in, save to database
      if (session?.user?.id) {
        const result = await saveProfileData(session.user.id, formData as any);

        if (!result.success) {
          toast.error(
            "Erro",
            result.error || "Ocorreu um erro ao guardar os dados.",
          );
          setIsSubmitting(false);
          return;
        }

        // Mark as completed in store
        setCompleted(true);

        toast.success(
          "Onboarding Concluído!",
          "Os teus dados foram guardados com sucesso!",
        );

        // Redirect to arena with delay
        setTimeout(() => {
          router.push("/arena");
        }, 1500);
      } else {
        // User not logged in - save to store and redirect to sign-in
        setCompleted(true);

        toast.success(
          "Onboarding Concluído!",
          "Cria a tua conta para continuar e guardar os dados.",
        );

        // Redirect to sign-in with delay
        setTimeout(() => {
          router.push("/sign-in");
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      toast.error("Erro", "Ocorreu um erro ao guardar os dados.");
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

  const toggleWaitlistApp = (appId: string) => {
    const currentApps = formData.waitlistApps || [];
    const newApps = currentApps.includes(appId)
      ? currentApps.filter(id => id !== appId)
      : [...currentApps, appId];
    updateData({ waitlistApps: newApps });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto flex items-center justify-center p-4"
              >
                <Logo />
              </motion.div>
              <h1 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Bem-vindo ao JogaBola!
              </h1>
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-[#ba93ff]">
                Estás prestes a embarcar numa jornada épica no mundo do futebol
                amador. Vamos configurar a tua experiência perfeita em apenas
                alguns passos.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <div className="flex items-center gap-2 text-[#00cfb1]">
                <CheckCircle className="h-5 w-5" />
                <span>Escolha da jornada</span>
              </div>
              <div className="flex items-center gap-2 text-[#00cfb1]">
                <CheckCircle className="h-5 w-5" />
                <span>Configuração personalizada</span>
              </div>
              <div className="flex items-center gap-2 text-[#00cfb1]">
                <CheckCircle className="h-5 w-5" />
                <span>Acesso antecipado</span>
              </div>
            </motion.div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Escolhe a Tua Jornada"
              description="Cada jornada oferece uma experiência única. Seleciona a que melhor se adequa aos teus objetivos."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {JOURNEY_OPTIONS.map((option, index) => (
                <JourneyOptionCard
                  key={option.id}
                  option={option}
                  isSelected={formData.role === option.id}
                  onSelect={id => updateFormData("role", id)}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        );

      case 2:
        // Step 2: Informações Básicas (Nome, Email, Localização)
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Informações Básicas"
              description="Vamos começar com as tuas informações essenciais."
            />

            <div className="mx-auto max-w-xl space-y-6">
              <div>
                <Label htmlFor="name" className="font-medium text-white">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => updateFormData("name", e.target.value)}
                  placeholder="O teu nome"
                  className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60"
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-medium text-white">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => updateFormData("email", e.target.value)}
                  placeholder="teu@email.com"
                  className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60"
                />
              </div>

              <div>
                <Label htmlFor="location" className="font-medium text-white">
                  Localização
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => updateFormData("location", e.target.value)}
                  placeholder="Cidade, País"
                  className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60"
                />
                <p className="mt-1 text-xs text-white/60">
                  Ajuda-nos a mostrar eventos e equipas perto de ti
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        // Step 3: Experiência e Disponibilidade
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Experiência e Disponibilidade"
              description="Conta-nos mais sobre o teu nível e quando estás disponível."
            />

            <div className="mx-auto max-w-xl space-y-8">
              <div>
                <Label className="font-medium text-white">
                  Experiência no Futebol
                </Label>
                <RadioGroup
                  value={formData.experience}
                  onValueChange={value => updateFormData("experience", value)}
                  className="mt-4 space-y-3"
                >
                  {[
                    {
                      value: "beginner",
                      label: "Iniciante",
                      description: "Estou a começar agora",
                    },
                    {
                      value: "intermediate",
                      label: "Intermédio",
                      description: "Jogo regularmente",
                    },
                    {
                      value: "advanced",
                      label: "Avançado",
                      description: "Jogo competitivamente",
                    },
                    {
                      value: "professional",
                      label: "Profissional",
                      description: "Nível elevado",
                    },
                  ].map(option => (
                    <div
                      key={option.value}
                      id={option.value}
                      onClick={() => updateFormData("experience", option.value)}
                      className="hover:border-brand-green/50 flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="text-brand-green mt-1 border-white/40"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={option.value}
                          className="font-medium text-white"
                        >
                          {option.label}
                        </Label>
                        <p className="mt-1 text-sm text-white/60">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* <div>
                <Label className="font-medium text-white">
                  Disponibilidade
                </Label>
                <RadioGroup
                  value={formData.availability}
                  onValueChange={value => updateFormData("availability", value)}
                  className="mt-4 space-y-3"
                >
                  {[
                    { value: "weekends", label: "Fins de semana" },
                    { value: "evenings", label: "Noites durante a semana" },
                    { value: "flexible", label: "Horário flexível" },
                    { value: "specific", label: "Horários específicos" },
                  ].map(option => (
                    <div
                      key={option.value}
                      className="hover:border-brand-green/50 flex items-center space-x-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="text-brand-green border-white/40"
                      />
                      <Label htmlFor={option.value} className="text-white">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div> */}
            </div>
          </motion.div>
        );

      case 4:
        // Step 4: Informações Específicas por Role
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Habilidades Específicas"
              description={`Agora vamos personalizar para a tua jornada como ${
                JOURNEY_OPTIONS.find(j => j.id === formData.role)?.title || ""
              }.`}
            />

            <div className="mx-auto max-w-2xl space-y-6">
              {roleQuestions && roleQuestions.personalInfo.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <p className="text-center text-white/60">
                  Não há campos adicionais para este tipo de jornada.
                </p>
              )}
            </div>
          </motion.div>
        );

      case 5:
        // Step 5: Objetivos
        const goalsToDisplay = roleQuestions?.goals || [];

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Quais São os Teus Objetivos?"
              description="Seleciona todos os objetivos que se aplicam a ti. Isto ajuda-nos a sugerir as melhores funcionalidades."
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goalsToDisplay.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isSelected={(formData.goals || []).includes(goal.id)}
                  onToggle={toggleGoal}
                />
              ))}
            </div>
          </motion.div>
        );

      case 6:
        // Step 6: Informações Adicionais (Custom Fields do step 3)
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Mais Algumas Informações"
              description="Últimos detalhes para personalizar completamente a tua experiência."
            />

            <div className="mx-auto max-w-2xl space-y-6">
              {roleQuestions && roleQuestions.customFields.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <p className="text-center text-white/60">
                  Nenhuma informação adicional necessária. Continua para o
                  próximo passo!
                </p>
              )}
            </div>
          </motion.div>
        );

      case 7:
        // Step 7: Waitlist e Preferências
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Lista de Espera e Preferências"
              description="Sê um dos primeiros a experimentar as nossas aplicações e configura as tuas preferências de comunicação."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {AVAILABLE_APPS.map((app, index) => (
                <WaitlistAppCard
                  key={app.id}
                  app={app}
                  isSelected={(formData.waitlistApps || []).includes(app.id)}
                  onToggle={toggleWaitlistApp}
                  index={index}
                />
              ))}
            </div>

            <CommunicationPreferences
              preferences={
                formData.preferences || {
                  notifications: true,
                  newsletter: true,
                  earlyAccess: true,
                }
              }
              onPreferenceChange={(key: string, value: boolean) =>
                updateData({
                  preferences: {
                    ...(formData.preferences || {
                      notifications: true,
                      newsletter: true,
                      earlyAccess: true,
                    }),
                    [key]: value,
                  },
                })
              }
            />
          </motion.div>
        );

      default:
        return null;
    }
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

      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
        <WelcomeProgressHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
        />

        {/* Conteúdo do passo atual */}
        <div className="mb-12">{renderStep()}</div>

        <WelcomeNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          canProceed={(() => {
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
                return true; // Waitlist e preferências são opcionais
              default:
                return true;
            }
          })()}
          isSubmitting={isSubmitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
