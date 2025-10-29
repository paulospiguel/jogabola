"use client";

import { saveProfileData } from "@/actions/profile";
import { CommunicationPreferences } from "@/components/communication-preferences";
import { FloatingOrb } from "@/components/floating-orb";
import { GoalCard } from "@/components/goal-card";
import { JourneyOptionCard } from "@/components/journey-option-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WaitlistAppCard } from "@/components/waitlist-app-card";
import { WelcomeNavigation } from "@/components/welcome-navigation";
import { WelcomeProgressHeader } from "@/components/welcome-progress-header";
import { WelcomeStepHeader } from "@/components/welcome-step-header";
import { AVAILABLE_APPS, GOALS, JOURNEY_OPTIONS } from "@/constants/welcome";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/schemas/profile";
import { useProfileStore } from "@/stores/profile";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

  const totalSteps = 5;

  // Initialize with search params
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && !formData.role) {
      updateData({ role: roleParam as any });
    }
  }, [searchParams, formData.role, updateData]);

  const validateStep = (step: number): boolean => {
    try {
      switch (step) {
        case 1:
          step1Schema.parse({ role: formData.role });
          return true;
        case 2:
          step2Schema.parse({
            name: formData.name,
            email: formData.email,
            location: formData.location,
            experience: formData.experience,
            availability: formData.availability,
          });
          return true;
        case 3:
          step3Schema.parse({ goals: formData.goals });
          return true;
        case 4:
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
          toast.error("Erro", result.error || "Ocorreu um erro ao guardar os dados.");
          setIsSubmitting(false);
          return;
        }

        // Mark as completed in store
        setCompleted(true);
        
        toast.success(
          "Onboarding Concluído!",
          "Os teus dados foram guardados com sucesso!"
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
          "Cria a tua conta para continuar e guardar os dados."
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
      ? currentGoals.filter((g) => g !== goal)
      : [...currentGoals, goal];
    updateData({ goals: newGoals });
  };

  const toggleWaitlistApp = (appId: string) => {
    const currentApps = formData.waitlistApps || [];
    const newApps = currentApps.includes(appId)
      ? currentApps.filter((id) => id !== appId)
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
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                <Sparkles className="h-10 w-10 text-white" />
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
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Vamos Conhecer-te Melhor"
              description="Estas informações ajudam-nos a personalizar a tua experiência no JogaBola."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-medium text-white">
                    Nome Completo
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
                    Email
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
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-medium text-white">
                    Experiência no Futebol
                  </Label>
                  <RadioGroup
                    value={formData.experience}
                    onValueChange={value => updateFormData("experience", value)}
                    className="mt-2 space-y-2"
                  >
                    {[
                      {
                        value: "beginner",
                        label: "Iniciante - Estou a começar",
                      },
                      {
                        value: "intermediate",
                        label: "Intermédio - Jogo regularmente",
                      },
                      {
                        value: "advanced",
                        label: "Avançado - Jogo competitivamente",
                      },
                      {
                        value: "professional",
                        label: "Profissional/Semi-profissional",
                      },
                    ].map(option => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="border-white/40"
                        />
                        <Label
                          htmlFor={option.value}
                          className="text-sm text-white/90"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="font-medium text-white">
                    Disponibilidade
                  </Label>
                  <RadioGroup
                    value={formData.availability}
                    onValueChange={value =>
                      updateFormData("availability", value)
                    }
                    className="mt-2 space-y-2"
                  >
                    {[
                      { value: "weekends", label: "Fins de semana" },
                      { value: "evenings", label: "Noites durante a semana" },
                      { value: "flexible", label: "Horário flexível" },
                      { value: "specific", label: "Horários específicos" },
                    ].map(option => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="border-white/40"
                        />
                        <Label
                          htmlFor={option.value}
                          className="text-sm text-white/90"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
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
              {GOALS.map(goal => (
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

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <WelcomeStepHeader
              title="Junta-te à Lista de Espera"
              description="Sê um dos primeiros a experimentar as nossas aplicações quando forem lançadas. Seleciona as que te interessam mais."
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
              preferences={formData.preferences || {
                notifications: true,
                newsletter: true,
                earlyAccess: true,
              }}
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
          canProceed={currentStep !== 1 || !!formData.role}
          isSubmitting={isSubmitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
