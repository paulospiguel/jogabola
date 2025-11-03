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
import { useEffect, useState } from "react";

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
      if (!session?.user?.id) return;

      try {
        const result = await getProfileData(session.user.id);
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
  }, [session, toast]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    if (!userRole) {
      toast.error("Erro", "Role do usuário não encontrado");
      return;
    }

    setSaving(true);
    try {
      const result = await saveProfileData(session.user.id, {
        role: userRole as any,
        name: profileData.name,
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
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#050312] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#6fffe9]/30 border-t-[#6fffe9]" />
          <p className="text-slate-300">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050312] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[#6fffe9]">
            Configurações
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
            Configurações do Perfil
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Gerencie suas informações pessoais, preferências e configurações da conta
          </p>
        </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 border border-white/8 bg-white/5 backdrop-blur rounded-2xl p-1">
          <TabsTrigger 
            value="account" 
            className="text-slate-400 data-[state=active]:bg-[#24ffe6] data-[state=active]:text-slate-900 data-[state=active]:font-semibold rounded-xl transition-all"
          >
            Conta
          </TabsTrigger>
          <TabsTrigger 
            value="language" 
            className="text-slate-400 data-[state=active]:bg-[#24ffe6] data-[state=active]:text-slate-900 data-[state=active]:font-semibold rounded-xl transition-all"
          >
            Idioma
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="text-slate-400 data-[state=active]:bg-[#24ffe6] data-[state=active]:text-slate-900 data-[state=active]:font-semibold rounded-xl transition-all"
          >
            Dados Fundamentais
          </TabsTrigger>
        </TabsList>

        {/* Tab: Detalhes da Conta */}
        <TabsContent value="account" className="space-y-6">
          <Card className="rounded-3xl border border-white/8 bg-white/5 backdrop-blur shadow-[0_35px_80px_-45px_rgba(36,255,230,0.3)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserCircle className="h-5 w-5 text-[#6fffe9]" />
                Detalhes da Conta
              </CardTitle>
              <CardDescription className="text-slate-300">
                Atualize suas informações básicas e foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto de Perfil */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[#6fffe9]/30 blur-xl" />
                  <Avatar className="relative h-20 w-20 border-2 border-[#6fffe9]/80 shadow-[0_0_35px_rgba(111,255,233,0.35)]">
                    <AvatarImage src={session?.user?.image || ""} alt={profileData.name} />
                    <AvatarFallback className="bg-[#101b46] text-xl font-semibold text-[#6fffe9]">
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
                    className="w-fit border-white/25 bg-white/10 text-white backdrop-blur hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15 transition-all"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Alterar foto
                  </Button>
                  <p className="text-xs text-slate-400">
                    JPG, PNG ou GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-white">
                  <User className="h-4 w-4 text-[#6fffe9]" />
                  Nome completo
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  placeholder="Seu nome completo"
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[#24ffe6] focus:ring-[#24ffe6]/20 backdrop-blur"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-white">
                  <Mail className="h-4 w-4 text-[#6fffe9]" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={e => handleInputChange("email", e.target.value)}
                  placeholder="seu@email.com"
                  disabled
                  className="border-white/10 bg-white/5 text-slate-400 cursor-not-allowed backdrop-blur"
                />
                <p className="text-xs text-slate-400">
                  O email não pode ser alterado.
                </p>
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2 text-white">
                  <MapPin className="h-4 w-4 text-[#6fffe9]" />
                  Localização
                </Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={e => handleInputChange("location", e.target.value)}
                  placeholder="Cidade, Estado ou País"
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[#24ffe6] focus:ring-[#24ffe6]/20 backdrop-blur"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Idioma */}
        <TabsContent value="language" className="space-y-6">
          <Card className="rounded-3xl border border-white/8 bg-white/5 backdrop-blur shadow-[0_35px_80px_-45px_rgba(36,255,230,0.3)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5 text-[#6fffe9]" />
                Configurações de Idioma
              </CardTitle>
              <CardDescription className="text-slate-300">
                Escolha seu idioma preferido para a interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-white">Idioma da Interface</Label>
                <Select
                  value={profileData.language}
                  onValueChange={value => handleInputChange("language", value)}
                >
                  <SelectTrigger 
                    id="language"
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 hover:bg-white/10 focus:border-[#24ffe6] focus:ring-[#24ffe6]/20 backdrop-blur"
                  >
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0b1933] text-white backdrop-blur">
                    {languages.map(lang => (
                      <SelectItem 
                        key={lang.value} 
                        value={lang.value}
                        className="text-white hover:bg-white/10 focus:bg-white/10"
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  Esta configuração altera o idioma de todos os textos da interface.
                </p>
              </div>

              <Separator className="bg-white/10" />

              <div className="rounded-2xl border border-[#24ffe6]/25 bg-[#24ffe6]/10 p-4 backdrop-blur">
                <p className="text-sm text-[#6fffe9]">
                  <strong className="text-white">Nota:</strong> Alguns conteúdos podem continuar em seus idiomas
                  originais, dependendo da disponibilidade.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Dados Fundamentais */}
        <TabsContent value="details" className="space-y-6">
          {/* Informações Pessoais */}
          <Card className="rounded-3xl border border-white/8 bg-white/5 backdrop-blur shadow-[0_35px_80px_-45px_rgba(36,255,230,0.3)]">
            <CardHeader>
              <CardTitle className="text-white">Informações Pessoais</CardTitle>
              <CardDescription className="text-slate-300">
                Complete seu perfil com informações adicionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Sobre você</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={e => handleInputChange("bio", e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[#24ffe6] focus:ring-[#24ffe6]/20 backdrop-blur"
                />
                <p className="text-xs text-slate-400">
                  Compartilhe suas experiências, objetivos ou interesses.
                </p>
              </div>

              <Separator className="bg-white/10" />

              {/* Nível de Experiência */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-white">Nível de Experiência</Label>
                <Select
                  value={profileData.experience || ""}
                  onValueChange={value => handleInputChange("experience", value)}
                >
                  <SelectTrigger 
                    id="experience"
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 hover:bg-white/10 focus:border-[#24ffe6] focus:ring-[#24ffe6]/20 backdrop-blur"
                  >
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0b1933] text-white backdrop-blur">
                    {experienceLevels.map(level => (
                      <SelectItem 
                        key={level.value} 
                        value={level.value}
                        className="text-white hover:bg-white/10 focus:bg-white/10"
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disponibilidade */}
              <div className="space-y-2">
                <Label htmlFor="availability" className="text-white">Disponibilidade</Label>
                <Select
                  value={profileData.availability || ""}
                  onValueChange={value => handleInputChange("availability", value)}
                >
                  <SelectTrigger 
                    id="availability"
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 hover:bg-white/10 focus:border-[#24ffe6] focus:ring-[#24ffe6]/20 backdrop-blur"
                  >
                    <SelectValue placeholder="Selecione sua disponibilidade" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0b1933] text-white backdrop-blur">
                    {availabilityOptions.map(option => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-white/10 focus:bg-white/10"
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
          <Card className="rounded-3xl border border-white/8 bg-white/5 backdrop-blur shadow-[0_35px_80px_-45px_rgba(36,255,230,0.3)]">
            <CardHeader>
              <CardTitle className="text-white">Preferências</CardTitle>
              <CardDescription className="text-slate-300">
                Configure suas preferências de notificações e comunicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="flex items-center gap-2 text-white">
                    <Bell className="h-4 w-4 text-[#6fffe9]" />
                    Notificações
                  </Label>
                  <p className="text-sm text-slate-300">
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

              <Separator className="bg-white/10" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="newsletter" className="flex items-center gap-2 text-white">
                    <Newspaper className="h-4 w-4 text-[#6fffe9]" />
                    Newsletter
                  </Label>
                  <p className="text-sm text-slate-300">
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

              <Separator className="bg-white/10" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="earlyAccess" className="flex items-center gap-2 text-white">
                    <Sparkles className="h-4 w-4 text-[#6fffe9]" />
                    Acesso Antecipado
                  </Label>
                  <p className="text-sm text-slate-300">
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
            className="border-white/25 bg-white/10 text-white backdrop-blur hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15 transition-all"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="group bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#24ffe6]/90 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
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
