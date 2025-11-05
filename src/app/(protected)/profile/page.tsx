"use client";

import { getProfileData, saveProfileData } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getJourneyRoute } from "@/components/journey-router";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import type { Availability, Role } from "@/schemas/profile";
import {
  Camera,
  Globe,
  Mail,
  MapPin,
  Save,
  User,
  UserCircle,
  Bell,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ProfileData {
  name: string;
  email: string;
  location?: string;
  experience?: string;
  availability?: string;
  bio?: string;
  language: string;
  notificationsEnabled: boolean;
  newsletterEnabled: boolean;
  earlyAccessEnabled: boolean;
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
    location: "",
    experience: "",
    availability: "",
    bio: "",
    language: "pt-BR",
    notificationsEnabled: true,
    newsletterEnabled: true,
    earlyAccessEnabled: true,
  });

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
            location: result.data.location || "",
            experience: result.data.experience || "",
            availability: result.data.availability || "",
            bio: (result.data.customFields?.bio as string) || "",
            language: (result.data.customFields?.language as string) || "pt-BR",
            notificationsEnabled: result.data.notificationsEnabled ?? true,
            newsletterEnabled: result.data.newsletterEnabled ?? true,
            earlyAccessEnabled: result.data.earlyAccessEnabled ?? true,
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
        location: profileData.location || undefined,
        experience: (profileData.experience as any) || undefined,
        availability: (profileData.availability as Availability | "" | undefined) || undefined,
        goals: [],
        waitlistApps: [],
        customFields: {
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

  const handleCancel = () => {
    // Verificar se há um referrer válido (página anterior no mesmo domínio)
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    const hasValidReferrer = referrer && referrer.startsWith(currentOrigin) && !referrer.includes("/profile");
    
    if (hasValidReferrer) {
      // Se houver referrer válido, usar router.back()
      router.back();
    } else {
      // Se não houver histórico válido, redirecionar para a rota padrão da jornada
      if (userRole) {
        const defaultRoute = getJourneyRoute(userRole as Role);
        router.push(defaultRoute);
      } else {
        // Fallback: se não tiver role ainda, usar play-zone como padrão
        router.push("/play-zone");
      }
    }
  };

  if (loading) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-linear-to-br from-emerald-50/60 via-white to-sky-50 text-slate-900 transition-colors dark:from-[#050312] dark:via-[#080a25] dark:to-[#0f163f] dark:text-white">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-200/30 via-white to-sky-200/20 dark:bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(56,189,248,0.15)_0%,rgba(255,255,255,0)_72%)] dark:bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-400/40 border-t-emerald-500 dark:border-[#6fffe9]/30 dark:border-t-[#6fffe9]" />
          <p className="text-slate-600 dark:text-slate-300">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-emerald-50/60 via-white to-sky-50 text-slate-900 transition-colors dark:from-[#050312] dark:via-[#080a25] dark:to-[#0f163f] dark:text-white">
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-200/30 via-white to-sky-200/20 dark:bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(56,189,248,0.15)_0%,rgba(255,255,255,0)_72%)] dark:bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-500 dark:text-[#6fffe9]">
            Configurações
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl dark:text-white">
            Configurações do Perfil
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Gerencie suas informações pessoais, preferências e configurações da conta
          </p>
        </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl border border-emerald-100/70 bg-white/90 p-1 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <TabsTrigger 
            value="account" 
            className="rounded-xl text-slate-500 transition-all data-[state=active]:bg-emerald-500 data-[state=active]:font-semibold data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-[#24ffe6] dark:data-[state=active]:text-slate-900"
          >
            Conta
          </TabsTrigger>
          <TabsTrigger 
            value="language" 
            className="rounded-xl text-slate-500 transition-all data-[state=active]:bg-emerald-500 data-[state=active]:font-semibold data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-[#24ffe6] dark:data-[state=active]:text-slate-900"
          >
            Idioma
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="rounded-xl text-slate-500 transition-all data-[state=active]:bg-emerald-500 data-[state=active]:font-semibold data-[state=active]:text-white dark:text-slate-300 dark:data-[state=active]:bg-[#24ffe6] dark:data-[state=active]:text-slate-900"
          >
            Dados Fundamentais
          </TabsTrigger>
        </TabsList>

        {/* Tab: Detalhes da Conta */}
        <TabsContent value="account" className="space-y-6">
          <Card className="rounded-3xl border border-emerald-100/70 bg-white backdrop-blur shadow-[0_35px_80px_-45px_rgba(16,185,129,0.28)] transition-colors dark:border-white/10 dark:bg-white/6 dark:shadow-[0_35px_80px_-45px_rgba(36,255,230,0.3)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <UserCircle className="h-5 w-5 text-emerald-500 dark:text-[#6fffe9]" />
                Detalhes da Conta
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Atualize suas informações básicas e foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto de Perfil */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-200/60 blur-xl dark:bg-[#6fffe9]/30" />
                  <Avatar className="relative h-20 w-20 border-2 border-emerald-400/70 shadow-[0_0_35px_rgba(16,185,129,0.25)] dark:border-[#6fffe9]/80 dark:shadow-[0_0_35px_rgba(111,255,233,0.35)]">
                    <AvatarImage src={session?.user?.image || ""} alt={profileData.name} />
                    <AvatarFallback className="bg-emerald-100 text-xl font-semibold text-emerald-700 dark:bg-[#101b46] dark:text-[#6fffe9]">
                      {profileData.name
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-fit border-emerald-200 bg-white text-slate-700 backdrop-blur hover:border-emerald-400 hover:bg-emerald-50/80 hover:text-emerald-600 transition-all dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:border-[#24ffe6]/60 dark:hover:bg-[#24ffe6]/15"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Alterar foto
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    JPG, PNG ou GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              <Separator className="bg-emerald-100 dark:bg-white/10" />

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-slate-700 dark:text-white">
                  <User className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                  Nome completo
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  placeholder="Seu nome completo"
                  className="border-emerald-100 bg-white text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#24ffe6] dark:focus:ring-[#24ffe6]/20"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-700 dark:text-white">
                  <Mail className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={e => handleInputChange("email", e.target.value)}
                  placeholder="seu@email.com"
                  disabled
                  className="cursor-not-allowed border-emerald-100 bg-emerald-50/70 text-slate-500 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  O email não pode ser alterado.
                </p>
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2 text-slate-700 dark:text-white">
                  <MapPin className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                  Localização
                </Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={e => handleInputChange("location", e.target.value)}
                  placeholder="Cidade, Estado ou País"
                  className="border-emerald-100 bg-white text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#24ffe6] dark:focus:ring-[#24ffe6]/20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Idioma */}
        <TabsContent value="language" className="space-y-6">
          <Card className="rounded-3xl border border-emerald-100/70 bg-white backdrop-blur shadow-[0_35px_80px_-45px_rgba(16,185,129,0.28)] transition-colors dark:border-white/10 dark:bg-white/6 dark:shadow-[0_35px_80px_-45px_rgba(36,255,230,0.3)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Globe className="h-5 w-5 text-emerald-500 dark:text-[#6fffe9]" />
                Configurações de Idioma
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Escolha seu idioma preferido para a interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-slate-700 dark:text-white">Idioma da Interface</Label>
                <Select
                  value={profileData.language}
                  onValueChange={value => handleInputChange("language", value)}
                >
                  <SelectTrigger 
                    id="language"
                    className="border-emerald-100 bg-white text-slate-700 placeholder:text-slate-400 hover:bg-emerald-50/70 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:hover:bg-white/10 dark:focus:border-[#24ffe6] dark:focus:ring-[#24ffe6]/20"
                  >
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent className="border-emerald-100 bg-white text-slate-700 backdrop-blur dark:border-white/10 dark:bg-[#0b1933] dark:text-white">
                    {languages.map(lang => (
                      <SelectItem 
                        key={lang.value} 
                        value={lang.value}
                        className="text-slate-700 hover:bg-emerald-50/80 focus:bg-emerald-50/80 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Esta configuração altera o idioma de todos os textos da interface.
                </p>
              </div>

              <Separator className="bg-emerald-100 dark:bg-white/10" />

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 backdrop-blur dark:border-[#24ffe6]/25 dark:bg-[#24ffe6]/10">
                <p className="text-sm text-emerald-600 dark:text-[#6fffe9]">
                  <strong className="text-slate-900 dark:text-white">Nota:</strong> Alguns conteúdos podem continuar em seus idiomas
                  originais, dependendo da disponibilidade.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Dados Fundamentais */}
        <TabsContent value="details" className="space-y-6">
          {/* Informações Pessoais */}
          <Card className="rounded-3xl border border-emerald-100/70 bg-white backdrop-blur shadow-[0_35px_80px_-45px_rgba(16,185,129,0.28)] transition-colors dark:border-white/10 dark:bg-white/6 dark:shadow-[0_35px_80px_-45px_rgba(36,255,230,0.3)]">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Informações Pessoais</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Complete seu perfil com informações adicionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-700 dark:text-white">Sobre você</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={e => handleInputChange("bio", e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                  className="border-emerald-100 bg-white text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#24ffe6] dark:focus:ring-[#24ffe6]/20"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compartilhe suas experiências, objetivos ou interesses.
                </p>
              </div>

              <Separator className="bg-emerald-100 dark:bg-white/10" />

              {/* Nível de Experiência */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-slate-700 dark:text-white">Nível de Experiência</Label>
                <Select
                  value={profileData.experience || ""}
                  onValueChange={value => handleInputChange("experience", value)}
                >
                  <SelectTrigger 
                    id="experience"
                    className="border-emerald-100 bg-white text-slate-700 placeholder:text-slate-400 hover:bg-emerald-50/70 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:hover:bg-white/10 dark:focus:border-[#24ffe6] dark:focus:ring-[#24ffe6]/20"
                  >
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent className="border-emerald-100 bg-white text-slate-700 backdrop-blur dark:border-white/10 dark:bg-[#0b1933] dark:text-white">
                    {experienceLevels.map(level => (
                      <SelectItem 
                        key={level.value} 
                        value={level.value}
                        className="text-slate-700 hover:bg-emerald-50/80 focus:bg-emerald-50/80 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disponibilidade */}
              <div className="space-y-2">
                <Label htmlFor="availability" className="text-slate-700 dark:text-white">Disponibilidade</Label>
                <Select
                  value={profileData.availability || ""}
                  onValueChange={value => handleInputChange("availability", value)}
                >
                  <SelectTrigger 
                    id="availability"
                    className="border-emerald-100 bg-white text-slate-700 placeholder:text-slate-400 hover:bg-emerald-50/70 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:hover:bg-white/10 dark:focus:border-[#24ffe6] dark:focus:ring-[#24ffe6]/20"
                  >
                    <SelectValue placeholder="Selecione sua disponibilidade" />
                  </SelectTrigger>
                  <SelectContent className="border-emerald-100 bg-white text-slate-700 backdrop-blur dark:border-white/10 dark:bg-[#0b1933] dark:text-white">
                    {availabilityOptions.map(option => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-slate-700 hover:bg-emerald-50/80 focus:bg-emerald-50/80 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preferências */}
          <Card className="rounded-3xl border border-emerald-100/70 bg-white backdrop-blur shadow-[0_35px_80px_-45px_rgba(16,185,129,0.28)] transition-colors dark:border-white/10 dark:bg-white/6 dark:shadow-[0_35px_80px_-45px_rgba(36,255,230,0.3)]">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Preferências</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Configure suas preferências de notificações e comunicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="flex items-center gap-2 text-slate-700 dark:text-white">
                    <Bell className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                    Notificações
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
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

              <Separator className="bg-emerald-100 dark:bg-white/10" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="newsletter" className="flex items-center gap-2 text-slate-700 dark:text-white">
                    <Newspaper className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                    Newsletter
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
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

              <Separator className="bg-emerald-100 dark:bg-white/10" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="earlyAccess" className="flex items-center gap-2 text-slate-700 dark:text-white">
                    <Sparkles className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                    Acesso Antecipado
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
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
      </Tabs>

        {/* Botão de Salvar */}
        <div className="mt-8 flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-emerald-200 bg-white text-slate-700 backdrop-blur hover:border-emerald-400 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:border-[#24ffe6]/60 dark:hover:bg-[#24ffe6]/15"
          >
            Cancelar
          </Button>
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
