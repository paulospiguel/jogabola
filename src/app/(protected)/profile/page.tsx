"use client";

import { getProfileData, saveProfileData } from "@/actions/profile";
import { CountrySelector } from "@/components/country-selector";
import { GoalCard } from "@/components/goal-card";
import { getJourneyRoute } from "@/components/journey-router";
import { DashboardWidgets } from "@/components/profile/dashboard-widgets";
import { PerformanceTab } from "@/components/profile/performance-radar-chart";
import { ProfileHeader } from "@/components/profile/profile-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getQuestionsByRole } from "@/constants/onboarding-questions";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import type { Availability, Role } from "@/schemas/profile";
import {
  ArrowLeft,
  Bell,
  Globe,
  Mail,
  MapPin,
  Newspaper,
  Save,
  Sparkles,
  Target,
  User,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ProfileData {
  name: string;
  email: string;
  nationality?: string;
  location?: string;
  experience?: string;
  availability?: string;
  bio?: string;
  language: string;
  notificationsEnabled: boolean;
  newsletterEnabled: boolean;
  earlyAccessEnabled: boolean;
  goals: string[];
  customFields: Record<string, any>;
}

const languages = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "pt-PT", label: "Português (Portugal)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
];

const experienceLevels = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
  { value: "professional", label: "Profissional" },
];

const availabilityOptions = [
  { value: "weekends", label: "Finais de semana" },
  { value: "evenings", label: "Noites" },
  { value: "flexible", label: "Flexível" },
  { value: "specific", label: "Horários específicos" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const loadedUserIdRef = useRef<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    nationality: "",
    location: "",
    experience: "",
    availability: "",
    bio: "",
    language: "pt-BR",
    notificationsEnabled: true,
    newsletterEnabled: true,
    earlyAccessEnabled: true,
    goals: [],
    customFields: {},
  });

  const journeyRoute = getJourneyRoute(userRole as Role);

  useEffect(() => {
    async function loadProfile() {
      const userId = session?.user?.id;
      if (!userId) return;

      // Evitar múltiplas chamadas para o mesmo usuário
      if (loadedUserIdRef.current === userId) return;
      loadedUserIdRef.current = userId;

      setLoading(true);
      try {
        const result = await getProfileData(userId);
        if (result.success && result.data) {
          setUserRole(result.data.role || "");
          setProfileData({
            name: result.data.name || "",
            email: session.user.email || "",
            nationality: result.data.nationality || "",
            location: result.data.location || "",
            experience: result.data.experience || "",
            availability: result.data.availability || "",
            bio: (result.data.customFields?.bio as string) || "",
            language: (result.data.customFields?.language as string) || "pt-BR",
            notificationsEnabled: result.data.notificationsEnabled ?? true,
            newsletterEnabled: result.data.newsletterEnabled ?? true,
            earlyAccessEnabled: result.data.earlyAccessEnabled ?? true,
            goals: result.data.goals || [],
            customFields: result.data.customFields || {},
          });
        } else {
          // Se não tem perfil, usar dados da sessão
          setProfileData(prev => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || "",
          }));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Erro", "Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    if (!userRole) {
      toast.error("Erro", "Role do usuário não encontrado");
      return;
    }

    setSaving(true);
    try {
      // Validar campos obrigatórios
      if (!profileData.name || !profileData.email || !userRole) {
        toast.error("Erro", "Nome, email e role são obrigatórios");
        setSaving(false);
        return;
      }

      const result = await saveProfileData(session.user.id, {
        role: userRole as any,
        name: profileData.name,
        email: profileData.email,
        nationality: profileData.nationality || undefined,
        location: profileData.location || undefined,
        experience: (profileData.experience as any) || undefined,
        availability:
          (profileData.availability as Availability | "" | undefined) ||
          undefined,
        goals: profileData.goals,
        waitlistApps: [],
        customFields: {
          ...profileData.customFields,
          ...(profileData.bio && { bio: profileData.bio }),
          language: profileData.language,
        },
        preferences: {
          notifications: profileData.notificationsEnabled,
          newsletter: profileData.newsletterEnabled,
          earlyAccess: profileData.earlyAccessEnabled,
        },
      });

      if (result.success) {
        toast.success("Perfil atualizado com sucesso!");
      } else {
        toast.error("Erro", result.error || "Erro ao salvar perfil");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro", "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomFieldChange = (id: string, value: any) => {
    // Check if it maps to a top-level field
    if (id === "experience" || id === "availability" || id === "location") {
      handleInputChange(id as keyof ProfileData, value);
    } else {
      // Otherwise update customFields
      setProfileData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [id]: value,
        },
      }));
    }
  };

  const toggleGoal = (goalId: string) => {
    setProfileData(prev => {
      const currentGoals = prev.goals || [];
      if (currentGoals.includes(goalId)) {
        return {
          ...prev,
          goals: currentGoals.filter(g => g !== goalId),
        };
      } else {
        if (currentGoals.length >= 10) return prev; // Max 10 goals
        return {
          ...prev,
          goals: [...currentGoals, goalId],
        };
      }
    });
  };

  const roleQuestions = getQuestionsByRole(userRole as Role);

  const handleCancel = () => {
    // Verificar se há um referrer válido (página anterior no mesmo domínio)
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    const hasValidReferrer =
      referrer &&
      referrer.startsWith(currentOrigin) &&
      !referrer.includes("/profile");

    if (hasValidReferrer) {
      // Se houver referrer válido, usar router.back()
      router.back();
    } else {
      // Se não houver histórico válido, redirecionar para a rota padrão da jornada
      if (userRole) {
        const defaultRoute = getJourneyRoute(userRole as Role);
        router.push(defaultRoute);
      } else {
        // Fallback: se não tiver role ainda, usar playzone como padrão
        router.push("/playzone");
      }
    }
  };

  if (loading) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,var(--color-background-gradient-start)_0%,var(--color-background-gradient-mid)_45%,var(--color-background-gradient-end)_100%)]" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(90%_90%_at_50%_0%,var(--color-radial-glow)_0%,rgba(5,3,18,0)_72%)]" />
        <div className="text-center">
          <div className="border-neon-primary/30 border-t-neon-primary mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 shadow-[0_0_15px_rgba(36,255,230,0.5)]" />
          <p className="text-text-secondary animate-pulse text-lg font-medium">
            Carregando perfil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-text-primary relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,var(--color-background-gradient-start)_0%,var(--color-background-gradient-mid)_45%,var(--color-background-gradient-end)_100%)] transition-colors">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,var(--color-background-gradient-start)_0%,var(--color-background-gradient-mid)_45%,var(--color-background-gradient-end)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(90%_90%_at_50%_0%,var(--color-radial-glow)_0%,rgba(5,3,18,0)_72%)]" />
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8 lg:px-12">
        {/* Back Button & Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(journeyRoute)}
            className="text-text-secondary hover:text-neon-primary -ml-2 gap-2 hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Arena
          </Button>
        </div>

        <ProfileHeader
          name={profileData.name}
          role={userRole}
          image={session?.user?.image || ""}
          level={5} // Mock level
          nationality={profileData.nationality}
          onEditImage={() => {
            // Implement image upload logic or open modal
            toast.info("Info", "Funcionalidade de upload em breve!");
          }}
        />

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="w-full justify-start overflow-x-auto rounded-xl border-white/10 bg-black/20 p-1 backdrop-blur-xl">
            <TabsTrigger
              value="overview"
              className="text-text-muted data-[state=active]:bg-neon-primary rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(111,255,233,0.3)]"
            >
              Overview
            </TabsTrigger>
            {userRole === "PLAYER" && (
              <TabsTrigger
                value="performance"
                className="text-text-muted data-[state=active]:bg-neon-primary rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(111,255,233,0.3)]"
              >
                Performance
              </TabsTrigger>
            )}
            <TabsTrigger
              value="details"
              className="text-text-muted data-[state=active]:bg-neon-primary rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(111,255,233,0.3)]"
            >
              Profile Details
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="text-text-muted data-[state=active]:bg-neon-primary rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(111,255,233,0.3)]"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="language"
              className="text-text-muted data-[state=active]:bg-neon-primary rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(111,255,233,0.3)]"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tab: Overview */}
          <TabsContent
            value="overview"
            className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500"
          >
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              </div>
              <DashboardWidgets role={userRole} />

              {/* Quick Stats / Summary for all roles */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-white/10 bg-white/5 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white">Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-secondary italic">
                      {profileData.bio ||
                        "No bio yet. Go to Profile Details to add one!"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white">My Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileData.goals.length > 0 ? (
                        profileData.goals.map(goal => (
                          <span
                            key={goal}
                            className="bg-neon-primary/10 text-neon-primary border-neon-primary/20 rounded-full border px-3 py-1 text-xs font-medium"
                          >
                            {roleQuestions?.goals.find(g => g.id === goal)
                              ?.label || goal}
                          </span>
                        ))
                      ) : (
                        <span className="text-text-muted text-sm">
                          No goals selected yet.
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Detalhes da Conta */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border-border-default bg-overlay-light rounded-3xl border shadow-[0_35px_80px_-45px_var(--color-shadow-neon-soft)] backdrop-blur transition-colors">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <UserCircle className="text-neon-primary h-5 w-5" />
                  Detalhes da Conta
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Atualize suas informações básicas e foto de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Foto de Perfil - Removed from here as it is in header now, but kept structure for other fields */}
                <div className="hidden">
                  {/* Hidden old avatar section to preserve structure if needed, or just remove */}
                </div>

                <Separator className="bg-border-default" />

                {/* Nome */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-text-primary flex flex-row items-center gap-2"
                  >
                    <User className="text-neon-primary h-4 w-4" />
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={e => handleInputChange("name", e.target.value)}
                    placeholder="Seu nome completo"
                    className="text-text-primary placeholder:text-text-muted focus:border-neon-primary/50 focus:ring-neon-primary/20 rounded-xl border-white/10 bg-white/5 backdrop-blur transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-text-primary flex flex-row items-center gap-2"
                  >
                    <Mail className="text-neon-primary h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={e => handleInputChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    disabled
                    className="text-text-muted cursor-not-allowed rounded-xl border-white/10 bg-white/5 backdrop-blur"
                  />
                  <p className="text-text-muted text-xs">
                    O email não pode ser alterado.
                  </p>
                </div>

                {/* Localização */}
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-text-primary flex flex-row items-center gap-2"
                  >
                    <MapPin className="text-neon-primary h-4 w-4" />
                    Localização
                  </Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={e =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Cidade, Estado ou País"
                    className="text-text-primary placeholder:text-text-muted focus:border-neon-primary/50 focus:ring-neon-primary/20 rounded-xl border-white/10 bg-white/5 backdrop-blur transition-all"
                  />
                </div>

                {/* Nacionalidade */}
                <div className="space-y-2">
                  <Label
                    htmlFor="nationality"
                    className="text-text-primary flex flex-row items-center gap-2"
                  >
                    <Globe className="text-neon-primary h-4 w-4" />
                    Nacionalidade
                  </Label>
                  <CountrySelector
                    value={profileData.nationality}
                    onValueChange={value =>
                      handleInputChange("nationality", value)
                    }
                    placeholder="Selecione sua nacionalidade"
                    className="text-text-primary placeholder:text-text-muted focus:border-neon-primary/50 focus:ring-neon-primary/20 rounded-xl border-white/10 bg-white/5 backdrop-blur transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Idioma */}
          <TabsContent value="language" className="space-y-6">
            <Card className="border-border-default bg-overlay-light rounded-3xl border shadow-[0_35px_80px_-45px_var(--color-shadow-neon-soft)] backdrop-blur transition-colors">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Globe className="text-neon-primary h-5 w-5" />
                  Configurações de Idioma
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Escolha seu idioma preferido para a interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-text-primary">
                    Idioma da Interface
                  </Label>
                  <Select
                    value={profileData.language}
                    onValueChange={value =>
                      handleInputChange("language", value)
                    }
                  >
                    <SelectTrigger
                      id="language"
                      className="border-border-default bg-overlay-light text-text-primary placeholder:text-text-muted hover:bg-overlay-medium focus:border-border-focus focus:ring-border-focus backdrop-blur"
                    >
                      <SelectValue placeholder="Selecione um idioma" />
                    </SelectTrigger>
                    <SelectContent className="border-border-default bg-background-surface text-text-primary backdrop-blur">
                      {languages.map(lang => (
                        <SelectItem
                          key={lang.value}
                          value={lang.value}
                          className="text-text-primary hover:bg-overlay-medium focus:bg-overlay-medium"
                        >
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-text-muted text-xs">
                    Esta configuração altera o idioma de todos os textos da
                    interface.
                  </p>
                </div>

                <Separator className="bg-border-default" />

                <div className="border-neon-secondary/25 bg-neon-secondary/10 rounded-2xl border p-4 backdrop-blur">
                  <p className="text-neon-primary text-sm">
                    <strong className="text-text-primary">Nota:</strong> Alguns
                    conteúdos podem continuar em seus idiomas originais,
                    dependendo da disponibilidade.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Dados Fundamentais */}
          <TabsContent value="details" className="space-y-6">
            {/* Informações Pessoais */}
            <Card className="border-border-default bg-overlay-light rounded-3xl border shadow-[0_35px_80px_-45px_var(--color-shadow-neon-soft)] backdrop-blur transition-colors">
              <CardHeader>
                <CardTitle className="text-text-primary">
                  Informações Pessoais
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Complete seu perfil com informações adicionais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-text-primary">
                    Sobre você
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={e => handleInputChange("bio", e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    rows={4}
                    className="border-border-default bg-overlay-light text-text-primary placeholder:text-text-muted focus:border-border-focus focus:ring-border-focus backdrop-blur"
                  />
                  <p className="text-text-muted text-xs">
                    Compartilhe suas experiências, objetivos ou interesses.
                  </p>
                </div>

                <Separator className="bg-border-default" />

                {/* Dynamic Fields based on Role */}
                {roleQuestions && (
                  <div className="space-y-6">
                    {/* Personal Info Questions */}
                    {roleQuestions.personalInfo.map(question => (
                      <div key={question.id} className="space-y-2">
                        <Label
                          htmlFor={question.id}
                          className="text-text-primary flex items-center gap-2"
                        >
                          {question.icon && (
                            <question.icon className="text-neon-primary h-4 w-4" />
                          )}
                          {question.label}
                        </Label>

                        {question.type === "select" && question.options && (
                          <Select
                            value={
                              (question.id === "experience"
                                ? profileData.experience
                                : question.id === "availability"
                                  ? profileData.availability
                                  : profileData.customFields[question.id]) || ""
                            }
                            onValueChange={value =>
                              handleCustomFieldChange(question.id, value)
                            }
                          >
                            <SelectTrigger
                              id={question.id}
                              className="border-border-default bg-overlay-light text-text-primary placeholder:text-text-muted hover:bg-overlay-medium focus:border-border-focus focus:ring-border-focus backdrop-blur"
                            >
                              <SelectValue
                                placeholder={
                                  question.placeholder || "Selecione"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="border-border-default bg-background-surface text-text-primary backdrop-blur">
                              {question.options.map(option => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="text-text-primary hover:bg-overlay-medium focus:bg-overlay-medium"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {question.type === "text" && (
                          <Input
                            id={question.id}
                            value={profileData.customFields[question.id] || ""}
                            onChange={e =>
                              handleCustomFieldChange(
                                question.id,
                                e.target.value,
                              )
                            }
                            placeholder={question.placeholder}
                            className="border-border-default bg-overlay-light text-text-primary placeholder:text-text-muted focus:border-border-focus focus:ring-border-focus backdrop-blur"
                          />
                        )}

                        {question.type === "radio" && question.options && (
                          <RadioGroup
                            value={
                              (question.id === "availability"
                                ? profileData.availability
                                : profileData.customFields[question.id]) || ""
                            }
                            onValueChange={value =>
                              handleCustomFieldChange(question.id, value)
                            }
                            className="flex flex-col space-y-2"
                          >
                            {question.options.map(option => (
                              <div
                                key={option.value}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`${question.id}-${option.value}`}
                                  className="border-neon-primary text-neon-primary"
                                />
                                <Label
                                  htmlFor={`${question.id}-${option.value}`}
                                  className="text-text-secondary cursor-pointer"
                                >
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {question.type === "multiselect" &&
                          question.options && (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {question.options.map(option => {
                                const currentValues =
                                  (profileData.customFields[
                                    question.id
                                  ] as string[]) || [];
                                const isSelected = currentValues.includes(
                                  option.value,
                                );

                                return (
                                  <div
                                    key={option.value}
                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all ${
                                      isSelected
                                        ? "border-neon-primary bg-neon-primary/10"
                                        : "border-border-default bg-overlay-light hover:border-neon-primary/50"
                                    }`}
                                    onClick={() => {
                                      const newValues = isSelected
                                        ? currentValues.filter(
                                            v => v !== option.value,
                                          )
                                        : [...currentValues, option.value];
                                      handleCustomFieldChange(
                                        question.id,
                                        newValues,
                                      );
                                    }}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      className="border-neon-primary data-[state=checked]:bg-neon-primary data-[state=checked]:text-slate-900"
                                    />
                                    <span className="text-text-primary text-sm">
                                      {option.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    ))}

                    {/* Custom Fields Questions */}
                    {roleQuestions.customFields.map(question => (
                      <div key={question.id} className="space-y-2">
                        <Label
                          htmlFor={question.id}
                          className="text-text-primary flex items-center gap-2"
                        >
                          {question.icon && (
                            <question.icon className="text-neon-primary h-4 w-4" />
                          )}
                          {question.label}
                        </Label>

                        {question.type === "select" && question.options && (
                          <Select
                            value={
                              (question.id === "experience"
                                ? profileData.experience
                                : question.id === "availability"
                                  ? profileData.availability
                                  : profileData.customFields[question.id]) || ""
                            }
                            onValueChange={value =>
                              handleCustomFieldChange(question.id, value)
                            }
                          >
                            <SelectTrigger
                              id={question.id}
                              className="border-border-default bg-overlay-light text-text-primary placeholder:text-text-muted hover:bg-overlay-medium focus:border-border-focus focus:ring-border-focus backdrop-blur"
                            >
                              <SelectValue
                                placeholder={
                                  question.placeholder || "Selecione"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="border-border-default bg-background-surface text-text-primary backdrop-blur">
                              {question.options.map(option => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="text-text-primary hover:bg-overlay-medium focus:bg-overlay-medium"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {question.type === "text" && (
                          <Input
                            id={question.id}
                            value={profileData.customFields[question.id] || ""}
                            onChange={e =>
                              handleCustomFieldChange(
                                question.id,
                                e.target.value,
                              )
                            }
                            placeholder={question.placeholder}
                            className="border-border-default bg-overlay-light text-text-primary placeholder:text-text-muted focus:border-border-focus focus:ring-border-focus backdrop-blur"
                          />
                        )}

                        {question.type === "radio" && question.options && (
                          <RadioGroup
                            value={
                              (question.id === "availability"
                                ? profileData.availability
                                : profileData.customFields[question.id]) || ""
                            }
                            onValueChange={value =>
                              handleCustomFieldChange(question.id, value)
                            }
                            className="flex flex-col space-y-2"
                          >
                            {question.options.map(option => (
                              <div
                                key={option.value}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`${question.id}-${option.value}`}
                                  className="border-neon-primary text-neon-primary"
                                />
                                <Label
                                  htmlFor={`${question.id}-${option.value}`}
                                  className="text-text-secondary cursor-pointer"
                                >
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      </div>
                    ))}

                    <Separator className="bg-border-default" />

                    {/* Goals Section */}
                    <div className="space-y-4">
                      <Label className="text-text-primary flex items-center gap-2">
                        <Target className="text-neon-primary h-4 w-4" />
                        Objetivos
                      </Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {roleQuestions.goals.map(goal => (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            isSelected={profileData.goals.includes(goal.id)}
                            onToggle={toggleGoal}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferências */}
            <Card className="border-border-default bg-overlay-light rounded-3xl border shadow-[0_35px_80px_-45px_var(--color-shadow-neon-soft)] backdrop-blur transition-colors">
              <CardHeader>
                <CardTitle className="text-text-primary">
                  Preferências
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Configure suas preferências de notificações e comunicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="notifications"
                      className="text-text-primary flex items-center gap-2"
                    >
                      <Bell className="text-neon-primary h-4 w-4" />
                      Notificações
                    </Label>
                    <p className="text-text-secondary text-sm">
                      Receba notificações sobre atividades e atualizações
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={profileData.notificationsEnabled}
                    onCheckedChange={checked =>
                      handleInputChange("notificationsEnabled", checked)
                    }
                  />
                </div>

                <Separator className="bg-border-default" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="newsletter"
                      className="text-text-primary flex items-center gap-2"
                    >
                      <Newspaper className="text-neon-primary h-4 w-4" />
                      Newsletter
                    </Label>
                    <p className="text-text-secondary text-sm">
                      Receba emails com novidades e dicas
                    </p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={profileData.newsletterEnabled}
                    onCheckedChange={checked =>
                      handleInputChange("newsletterEnabled", checked)
                    }
                  />
                </div>

                <Separator className="bg-border-default" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="earlyAccess"
                      className="text-text-primary flex items-center gap-2"
                    >
                      <Sparkles className="text-neon-primary h-4 w-4" />
                      Acesso Antecipado
                    </Label>
                    <p className="text-text-secondary text-sm">
                      Receba acesso a novos recursos antes do lançamento
                    </p>
                  </div>
                  <Switch
                    id="earlyAccess"
                    checked={profileData.earlyAccessEnabled}
                    onCheckedChange={checked =>
                      handleInputChange("earlyAccessEnabled", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Performance - Apenas para Jogadores */}
          {userRole === "PLAYER" && (
            <TabsContent value="performance" className="space-y-6">
              <Card className="border-border-default bg-overlay-light rounded-3xl border shadow-[0_35px_80px_-45px_var(--color-shadow-neon-soft)] backdrop-blur transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    Performance
                  </CardTitle>
                  <CardDescription className="text-text-secondary">
                    Visualize suas estatísticas de desempenho
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PerformanceTab />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Botão de Salvar */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="group bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.45)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-[#24ffe6] dark:text-slate-900 dark:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] dark:hover:bg-[#24ffe6]/90"
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-slate-900" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
