"use client";

import directorIcon from "@/assets/icons/director.png";
import footballIcon from "@/assets/icons/football.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { RoleValues } from "@/schemas";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

// Tipos para o questionário
interface WelcomeFormData {
  role: string;
  name: string;
  email: string;
  location: string;
  experience: string;
  goals: string[];
  availability: string;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    earlyAccess: boolean;
  };
  waitlistApps: string[];
}

// Componente para orbs flutuantes
const FloatingOrb = ({
  delay,
  size,
  position,
}: {
  delay: number;
  size: number;
  position: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      x: [0, Math.random() * 100 - 50],
      y: [0, Math.random() * 100 - 50],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
    className={cn(
      "absolute rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl",
      position,
    )}
    style={{ width: size, height: size }}
  />
);

export default function WelcomePage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WelcomeFormData>({
    role: searchParams.get("role") || "",
    name: "",
    email: "",
    location: "",
    experience: "",
    goals: [],
    availability: "",
    preferences: {
      notifications: true,
      newsletter: true,
      earlyAccess: true,
    },
    waitlistApps: [],
  });

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Opções de jornada
  const journeyOptions = [
    {
      id: RoleValues.PLAYER,
      title: "Jogador",
      description:
        "Encontra equipas, melhora as tuas habilidades e conquista a glória",
      icon: footballIcon,
      color: "from-emerald-500 to-teal-600",
      features: [
        "Encontrar equipas",
        "Estatísticas pessoais",
        "Torneios",
        "Treinos",
      ],
    },
    {
      id: RoleValues.MANAGER,
      title: "Gestor/Treinador",
      description:
        "Gere a tua equipa, organiza treinos e lidera para a vitória",
      icon: directorIcon,
      color: "from-purple-500 to-indigo-600",
      features: [
        "Gestão de equipa",
        "Planeamento de treinos",
        "Análise de performance",
        "Recrutamento",
      ],
    },
    {
      id: RoleValues.COACH,
      title: "Treinador Especializado",
      description:
        "Desenvolve talentos e cria programas de treino personalizados",
      icon: directorIcon,
      color: "from-orange-500 to-red-600",
      features: [
        "Programas de treino",
        "Desenvolvimento técnico",
        "Análise táctica",
        "Mentoria",
      ],
    },
    {
      id: RoleValues.FAN,
      title: "Adepto/Organizador",
      description: "Organiza eventos, apoia equipas e conecta a comunidade",
      icon: footballIcon,
      color: "from-blue-500 to-cyan-600",
      features: [
        "Organização de eventos",
        "Apoio a equipas",
        "Comunidade",
        "Networking",
      ],
    },
  ];

  // Apps disponíveis para lista de espera
  const availableApps = [
    {
      id: "jogabola-mobile",
      name: "JogaBola Mobile",
      description: "App principal para jogadores e gestores",
      status: "coming-soon",
      estimatedLaunch: "Q2 2024",
    },
    {
      id: "jogabola-timer",
      name: "JogaBola Timer",
      description: "Cronómetro avançado para treinos e jogos",
      status: "beta",
      estimatedLaunch: "Disponível em Beta",
    },
    {
      id: "jogabola-academy",
      name: "JogaBola Academy",
      description: "Plataforma de treino e desenvolvimento",
      status: "coming-soon",
      estimatedLaunch: "Q3 2024",
    },
    {
      id: "jogabola-manager",
      name: "JogaBola Manager",
      description: "Ferramenta avançada para gestores",
      status: "coming-soon",
      estimatedLaunch: "Q4 2024",
    },
  ];

  const handleNext = () => {
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
    // Aqui implementarias a lógica para enviar os dados
    console.log("Dados do formulário:", formData);
    // Redirecionar ou mostrar mensagem de sucesso
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const toggleWaitlistApp = (appId: string) => {
    setFormData(prev => ({
      ...prev,
      waitlistApps: prev.waitlistApps.includes(appId)
        ? prev.waitlistApps.filter(id => id !== appId)
        : [...prev.waitlistApps, appId],
    }));
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
            <div className="space-y-4 text-center">
              <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                Escolhe a Tua Jornada
              </h2>
              <p className="mx-auto max-w-2xl text-[#ba93ff]">
                Cada jornada oferece uma experiência única. Seleciona a que
                melhor se adequa aos teus objetivos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {journeyOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300",
                    formData.role === option.id
                      ? "border-[#00cfb1] bg-gradient-to-br from-[#00cfb1]/10 to-[#1effbf]/5 shadow-lg shadow-[#00cfb1]/25"
                      : "border-white/20 bg-gradient-to-br from-white/5 to-white/2 hover:border-[#00cfb1]/50",
                  )}
                  onClick={() => updateFormData("role", option.id)}
                >
                  <div className="space-y-4 p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r",
                          option.color,
                        )}
                      >
                        <Image
                          src={option.icon}
                          alt={option.title}
                          width={24}
                          height={24}
                          className="invert"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {option.title}
                        </h3>
                        <p className="text-sm text-[#ba93ff]">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#00cfb1]">
                        Funcionalidades principais:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {option.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-[#ba93ff]"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-[#00cfb1]" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {formData.role === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#00cfb1]"
                    >
                      <CheckCircle className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
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
            <div className="space-y-4 text-center">
              <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                Vamos Conhecer-te Melhor
              </h2>
              <p className="mx-auto max-w-2xl text-[#ba93ff]">
                Estas informações ajudam-nos a personalizar a tua experiência no
                JogaBola.
              </p>
            </div>

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
            <div className="space-y-4 text-center">
              <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                Quais São os Teus Objetivos?
              </h2>
              <p className="mx-auto max-w-2xl text-[#ba93ff]">
                Seleciona todos os objetivos que se aplicam a ti. Isto ajuda-nos
                a sugerir as melhores funcionalidades.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "improve-skills",
                  label: "Melhorar habilidades",
                  icon: Target,
                },
                { id: "find-team", label: "Encontrar uma equipa", icon: Users },
                {
                  id: "organize-games",
                  label: "Organizar jogos",
                  icon: Calendar,
                },
                {
                  id: "track-stats",
                  label: "Acompanhar estatísticas",
                  icon: Trophy,
                },
                {
                  id: "make-friends",
                  label: "Fazer novos amigos",
                  icon: Heart,
                },
                { id: "compete", label: "Competir em torneios", icon: Star },
                { id: "coach-others", label: "Treinar outros", icon: User },
                { id: "stay-fit", label: "Manter-me em forma", icon: Clock },
                { id: "have-fun", label: "Divertir-me", icon: Sparkles },
              ].map(goal => {
                const Icon = goal.icon;
                const isSelected = formData.goals.includes(goal.id);

                return (
                  <motion.div
                    key={goal.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-300",
                      isSelected
                        ? "border-[#00cfb1] bg-gradient-to-br from-[#00cfb1]/10 to-[#1effbf]/5 shadow-lg shadow-[#00cfb1]/25"
                        : "border-white/20 bg-gradient-to-br from-white/5 to-white/2 hover:border-[#00cfb1]/50",
                    )}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                          isSelected ? "bg-[#00cfb1]" : "bg-white/10",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isSelected ? "text-white" : "text-[#00cfb1]",
                          )}
                        />
                      </div>
                      <span className="font-medium text-white">
                        {goal.label}
                      </span>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#00cfb1]"
                      >
                        <CheckCircle className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
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
            <div className="space-y-4 text-center">
              <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                Junta-te à Lista de Espera
              </h2>
              <p className="mx-auto max-w-2xl text-[#ba93ff]">
                Sê um dos primeiros a experimentar as nossas aplicações quando
                forem lançadas. Seleciona as que te interessam mais.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {availableApps.map((app, index) => {
                const isSelected = formData.waitlistApps.includes(app.id);

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "relative cursor-pointer overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                      isSelected
                        ? "border-[#00cfb1] bg-gradient-to-br from-[#00cfb1]/10 to-[#1effbf]/5 shadow-lg shadow-[#00cfb1]/25"
                        : "border-white/20 bg-gradient-to-br from-white/5 to-white/2 hover:border-[#00cfb1]/50",
                    )}
                    onClick={() => toggleWaitlistApp(app.id)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white">
                            {app.name}
                          </h3>
                          <p className="text-sm text-[#ba93ff]">
                            {app.description}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium",
                            app.status === "beta"
                              ? "border border-orange-500/30 bg-orange-500/20 text-orange-300"
                              : "border border-blue-500/30 bg-blue-500/20 text-blue-300",
                          )}
                        >
                          {app.status === "beta" ? "Beta" : "Em Breve"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#00cfb1]">
                        <Calendar className="h-4 w-4" />
                        <span>{app.estimatedLaunch}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#00cfb1]"
                      >
                        <CheckCircle className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Preferências de notificação */}
            <div className="space-y-4 rounded-2xl bg-white/5 p-6">
              <h3 className="text-lg font-bold text-white">
                Preferências de Comunicação
              </h3>
              <div className="space-y-3">
                {[
                  {
                    key: "notifications",
                    label: "Receber notificações sobre atualizações",
                  },
                  {
                    key: "newsletter",
                    label: "Subscrever newsletter com dicas e novidades",
                  },
                  {
                    key: "earlyAccess",
                    label: "Acesso antecipado a novas funcionalidades",
                  },
                ].map(pref => (
                  <div key={pref.key} className="flex items-center space-x-3">
                    <Checkbox
                      id={pref.key}
                      checked={
                        formData.preferences[
                          pref.key as keyof typeof formData.preferences
                        ]
                      }
                      onCheckedChange={checked =>
                        setFormData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            [pref.key]: checked,
                          },
                        }))
                      }
                      className="border-white/40"
                    />
                    <Label htmlFor={pref.key} className="text-sm text-white/90">
                      {pref.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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
        {/* Header com progresso */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-[#ba93ff]"
            >
              Passo {currentStep + 1} de {totalSteps}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-medium text-[#00cfb1]"
            >
              {Math.round(progress)}% concluído
            </motion.div>
          </div>

          <Progress value={progress} className="h-2 bg-white/10" />
        </div>

        {/* Conteúdo do passo atual */}
        <div className="mb-12">{renderStep()}</div>

        {/* Navegação */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          {currentStep === totalSteps - 1 ? (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] font-bold text-[#21005a] hover:from-[#1effbf] hover:to-[#00cfb1]"
            >
              Finalizar Configuração
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 && !formData.role}
              className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] font-bold text-[#21005a] hover:from-[#1effbf] hover:to-[#00cfb1] disabled:opacity-50"
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
