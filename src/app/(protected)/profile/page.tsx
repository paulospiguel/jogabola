"use client";

import { getProfileData, saveProfileData } from "@/actions/profile";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast-custom";
import { signOut, useSession } from "@/lib/auth-client";
import { resolveProfileImage } from "@/lib/profile-image";
import { cn } from "@/lib/utils";
import type { Availability } from "@/schemas/profile";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  ChevronRight,
  Edit2,
  Info,
  Loader2,
  LogOut,
  MapPin,
  Save,
  Settings,
  Shield,
  Star,
  Swords,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  email: string;
  authImage?: string | null;
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
  role: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customFields: Record<string, any>;
}

type Tab = "overview" | "teams" | "activities" | "settings";

// ─── Mock data helpers ────────────────────────────────────────────────────────

const mockTeams = [
  {
    id: "1",
    name: "Real Vila FC",
    role: "Capitão",
    players: 12,
    color: "bg-blue-600",
  },
  {
    id: "2",
    name: "Galáticos da Noite",
    role: "Atleta",
    players: 18,
    color: "bg-red-600",
  },
];

const mockActivities = [
  {
    id: "1",
    icon: <Swords className="h-5 w-5 text-[#02a7ff]" />,
    bg: "bg-[#02a7ff]/10",
    text: (
      <>
        Marcou <strong className="text-white">2 gols</strong> na partida contra
        União Futebol.
      </>
    ),
    time: "Ontem às 19:30",
    location: "Arena Central",
  },
  {
    id: "2",
    icon: <Star className="h-5 w-5 text-emerald-400" />,
    bg: "bg-emerald-500/10",
    text: (
      <>
        Eleito <strong className="text-white">Homem do Jogo</strong> no
        confronto semanal.
      </>
    ),
    time: "3 dias atrás",
    location: "Liga Amadora",
  },
  {
    id: "3",
    icon: <Users className="h-5 w-5 text-[#02a7ff]" />,
    bg: "bg-[#02a7ff]/10",
    text: (
      <>
        Entrou para a equipe{" "}
        <strong className="text-white">Galáticos da Noite.</strong>
      </>
    ),
    time: "1 semana atrás",
    location: "",
  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatItem({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[10px] tracking-[0.22em] text-white/45 uppercase">
        {label}
      </div>
    </div>
  );
}

// ─── Attribute Bar ────────────────────────────────────────────────────────────

function AttributeBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="tracking-[0.18em] text-white/55 uppercase">
          {label}
        </span>
        <span className="font-semibold text-neon-primary">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="from-neon-primary to-accent-blue h-full rounded-full bg-linear-to-r"
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const loadedRef = useRef<string | null>(null);

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
    role: "",
    customFields: {},
  });

  // ── Load profile ───────────────────────────────────────────────────────────

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || loadedRef.current === userId) return;
    loadedRef.current = userId;

    setLoading(true);
    getProfileData(userId)
      .then((result) => {
        if (result.success && result.data) {
          const d = result.data;
          setProfileData({
            name: d.name || session.user.name || "",
            email: session.user.email || "",
            authImage: d.authImage || session.user.image || "",
            nationality: d.nationality || "",
            location: d.location || "",
            experience: d.experience || "",
            availability: d.availability || "",
            bio: (d.customFields?.bio as string) || "",
            language: (d.customFields?.language as string) || "pt-BR",
            notificationsEnabled: d.notificationsEnabled ?? true,
            newsletterEnabled: d.newsletterEnabled ?? true,
            earlyAccessEnabled: d.earlyAccessEnabled ?? true,
            goals: d.goals || [],
            role: d.role || "",
            customFields: d.customFields || {},
          });
        } else {
          setProfileData((prev) => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || "",
          }));
        }
      })
      .catch(() => toast.error("Erro", "Erro ao carregar perfil"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // ── Save profile ───────────────────────────────────────────────────────────

  async function handleSave() {
    if (!session?.user?.id || !profileData.role) return;
    setSaving(true);
    try {
      const result = await saveProfileData(session.user.id, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: profileData.role as any,
        name: profileData.name,
        email: profileData.email,
        nationality: profileData.nationality || undefined,
        location: profileData.location || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        experience: (profileData.experience as any) || undefined,
        availability:
          (profileData.availability as Availability | "" | undefined) ||
          undefined,
        goals: profileData.goals,
        waitlistApps: [],
        customFields: {
          ...profileData.customFields,
          bio: profileData.bio,
          language: profileData.language,
        },
        preferences: {
          notifications: profileData.notificationsEnabled,
          newsletter: profileData.newsletterEnabled,
          earlyAccess: profileData.earlyAccessEnabled,
        },
      });

      if (result.success) {
        toast.success("Perfil atualizado", "As alterações foram guardadas.");
      } else {
        toast.error("Erro", result.error || "Não foi possível guardar.");
      }
    } catch {
      toast.error("Erro", "Não foi possível guardar.");
    } finally {
      setSaving(false);
    }
  }

  // ── Sign out ───────────────────────────────────────────────────────────────

  async function handleSignOut() {
    await signOut({
      fetchOptions: { onSuccess: () => router.push("/auth") },
    });
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const initials = profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const roleLabel: Record<string, string> = {
    PLAYER: "Atleta Amador",
    MANAGER: "Gestor",
    ORGANIZER: "Organizador",
    FAN: "Adepto",
  };

  const attributes = [
    {
      label: "Velocidade",
      value: (profileData.customFields?.speed as number) ?? 85,
    },
    {
      label: "Finalização",
      value: (profileData.customFields?.finishing as number) ?? 78,
    },
    {
      label: "Passe",
      value: (profileData.customFields?.passing as number) ?? 72,
    },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Visão Geral",
      icon: <Target className="h-4 w-4" />,
    },
    {
      id: "teams",
      label: "Minhas Equipes",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "activities",
      label: "Atividades",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const profileImage = resolveProfileImage(
    profileData.customFields,
    profileData.authImage || session?.user?.image,
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(2,167,255,0.14),transparent_28%),linear-gradient(180deg,#050312_0%,#080a25_42%,#050312_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050312]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Logo size="small" className="h-12 w-20 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-white/45 uppercase">
                Workspace
              </p>
              <h1 className="truncate font-heading text-2xl tracking-[0.08em] text-white">
                Profile Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-neon-primary" />
            </button>
            <Avatar className="h-11 w-11 border border-white/10 bg-white/5">
              <AvatarImage src={profileImage} />
              <AvatarFallback className="bg-white/8 text-sm font-semibold text-neon-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-neon-primary" />
          </div>
        ) : (
          <>
            <section className="mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
              <div className="border-b border-white/8 px-6 py-4 sm:px-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.24em] text-white/45 uppercase">
                      Identity
                    </p>
                    <h2 className="mt-1 font-heading text-3xl tracking-[0.08em] text-white sm:text-4xl">
                      O teu posto no jogo
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
                      {roleLabel[profileData.role] || "Atleta"}
                    </Badge>
                    <Badge className="border-neon-primary/20 bg-neon-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-neon-primary uppercase">
                      Perfil ativo
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8 px-6 py-6 sm:px-8 lg:flex-row lg:items-start">
                <div className="relative shrink-0">
                  <div className="rounded-[26px] border border-white/10 bg-white/4 p-3">
                    <Avatar className="h-24 w-24 rounded-[22px] sm:h-28 sm:w-28">
                      <AvatarImage src={profileImage} />
                      <AvatarFallback className="bg-[#101b46] text-2xl font-bold text-neon-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <button
                    type="button"
                    className="absolute right-2 bottom-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#050312]/90 text-neon-primary transition-colors hover:bg-[#101b46]"
                    aria-label="Editar foto"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-3xl font-semibold text-white sm:text-4xl">
                        {profileData.name || "Utilizador"}
                      </h3>
                      <Badge className="border-white/10 bg-white/6 text-xs text-white/62">
                        <Shield className="mr-1 h-3 w-3" />
                        Member since 2024
                      </Badge>
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-white/60">
                      {roleLabel[profileData.role] || "Atleta"}
                      {profileData.location && ` • ${profileData.location}`}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <StatItem
                        value={
                          (profileData.customFields?.matches as number) ?? 24
                        }
                        label="Partidas"
                      />
                      <StatItem
                        value={
                          (profileData.customFields?.goals as number) ?? 12
                        }
                        label="Gols"
                      />
                      <StatItem
                        value={
                          (profileData.customFields?.assists as number) ?? 8
                        }
                        label="Assistências"
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 lg:w-60">
                    <Button
                      onClick={() => setActiveTab("settings")}
                      className="bg-neon-primary text-[#050312] hover:bg-neon-primary/90"
                    >
                      Editar Perfil
                    </Button>
                    <div className="rounded-2xl border border-white/8 bg-[#050312]/55 px-4 py-3">
                      <p className="text-[11px] font-semibold tracking-[0.22em] text-white/45 uppercase">
                        Disponibilidade
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        {profileData.availability || "Atualiza quando podes jogar"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mb-6 flex gap-2 overflow-x-auto rounded-full border border-white/8 bg-white/4 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-white/10 text-neon-primary"
                      : "text-white/50 hover:text-white/80",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab Content ──────────────────────────────────────────────── */}

            {/* Overview */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-white/5 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/8 bg-[#050312]/80">
                        <Info className="h-4 w-4 text-neon-primary" />
                      </div>
                      <h3 className="font-semibold text-white">Bio</h3>
                    </div>
                    <p className="text-sm leading-7 text-white/60">
                      {profileData.bio ||
                        "Apaixonado por futebol desde pequeno. Atleta amador buscando sempre melhorar o condicionamento físico e técnica."}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-white/5 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/8 bg-[#050312]/80">
                        <TrendingUp className="h-4 w-4 text-neon-primary" />
                      </div>
                      <h3 className="font-semibold text-white">Atributos</h3>
                    </div>
                    <div className="space-y-3">
                      {attributes.map((attr) => (
                        <AttributeBar
                          key={attr.label}
                          label={attr.label}
                          value={attr.value}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Equipes Atuais
                      </h3>
                      <button type="button" className="text-sm font-medium text-neon-primary hover:text-white">
                        Ver todas
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {mockTeams.map((team) => (
                        <div
                          key={team.id}
                          className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/5 p-4 transition-colors hover:border-white/15"
                        >
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                              team.color,
                            )}
                          >
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-white">
                              {team.name}
                            </div>
                            <div className="text-xs text-white/40">
                              {team.role} • {team.players} Jogadores
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-white/30" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-white">
                      Atividade Recente
                    </h3>
                    <div className="overflow-hidden rounded-[24px] border border-white/8 bg-white/5">
                      {mockActivities.map((activity, i) => (
                        <div
                          key={activity.id}
                          className={cn(
                            "flex items-start gap-3 px-5 py-4",
                            i < mockActivities.length - 1 &&
                              "border-b border-white/5",
                          )}
                        >
                          <div
                            className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
                            activity.bg,
                          )}
                        >
                            {activity.icon}
                          </div>
                          <div>
                            <p className="text-sm text-white/70">
                              {activity.text}
                            </p>
                            <p className="mt-0.5 text-xs text-white/35">
                              {activity.time}
                              {activity.location && ` • ${activity.location}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Match */}
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-white">
                      Próxima Partida
                    </h3>
                    <div className="relative overflow-hidden rounded-[24px] border border-white/8">
                      <div className="h-48 bg-[linear-gradient(135deg,rgba(5,3,18,0.9)_0%,rgba(16,27,70,0.94)_50%,rgba(5,3,18,1)_100%)]">
                        <div className="flex h-full items-center justify-center">
                          <MapPin className="h-8 w-8 text-white/20" />
                        </div>
                      </div>
                      <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-[#050312]/88 px-5 py-4 backdrop-blur-sm">
                        <div>
                          <p className="mb-0.5 text-xs font-semibold tracking-[0.2em] text-neon-primary uppercase">
                            Sábado, 15:00
                          </p>
                          <p className="text-sm font-semibold text-white">
                            Arena Ibirapuera • Campo 2
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-neon-primary text-[#050312] hover:bg-neon-primary/90"
                          onClick={() => router.push("/arena/calendar")}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === "teams" && (
              <div className="rounded-[24px] border border-white/8 bg-white/5 p-8 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-white/20" />
                <h3 className="mb-1 text-lg font-semibold text-white">
                  Minhas Equipes
                </h3>
                <p className="mb-4 text-sm text-white/40">
                  Gere as tuas equipas e convites pendentes.
                </p>
                <Button
                  onClick={() => router.push("/arena")}
                  className="bg-neon-primary text-[#050312] hover:bg-neon-primary/90"
                >
                  Explorar Equipes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === "activities" && (
              <div className="overflow-hidden rounded-[24px] border border-white/8 bg-white/5">
                <div className="border-b border-white/5 px-5 py-4">
                  <h3 className="font-semibold text-white">
                    Histórico de Atividades
                  </h3>
                </div>
                {mockActivities.map((activity, i) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-start gap-3 px-5 py-4",
                      i < mockActivities.length - 1 && "border-b border-white/5",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        activity.bg,
                      )}
                    >
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm text-white/70">{activity.text}</p>
                      <p className="mt-0.5 text-xs text-white/35">
                        {activity.time}
                        {activity.location && ` • ${activity.location}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-white/5 p-6">
                  <h3 className="mb-5 font-semibold text-white">
                    Informações Pessoais
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-name" className="text-xs tracking-[0.18em] text-white/50 uppercase">Nome</Label>
                      <Input
                        id="profile-name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="border-white/10 bg-[#050312]/60 text-white placeholder:text-white/30 focus:border-neon-primary/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-email" className="text-xs tracking-[0.18em] text-white/50 uppercase">Email</Label>
                      <Input
                        id="profile-email"
                        value={profileData.email}
                        disabled
                        className="border-white/10 bg-[#050312]/40 text-white/40 placeholder:text-white/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-location" className="text-xs tracking-[0.18em] text-white/50 uppercase">
                        Localização
                      </Label>
                      <Input
                        id="profile-location"
                        value={profileData.location || ""}
                        placeholder="Cidade, País"
                        onChange={(e) =>
                          setProfileData((p) => ({
                            ...p,
                            location: e.target.value,
                          }))
                        }
                        className="border-white/10 bg-[#050312]/60 text-white placeholder:text-white/30 focus:border-neon-primary/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-availability" className="text-xs tracking-[0.18em] text-white/50 uppercase">
                        Disponibilidade
                      </Label>
                      <Input
                        id="profile-availability"
                        value={profileData.availability || ""}
                        placeholder="Ex: Fins de semana"
                        onChange={(e) =>
                          setProfileData((p) => ({
                            ...p,
                            availability: e.target.value,
                          }))
                        }
                        className="border-white/10 bg-[#050312]/60 text-white placeholder:text-white/30 focus:border-neon-primary/40"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="profile-bio" className="text-xs tracking-[0.18em] text-white/50 uppercase">Bio</Label>
                      <Textarea
                        id="profile-bio"
                        value={profileData.bio || ""}
                        placeholder="Conta um pouco sobre ti..."
                        rows={3}
                        onChange={(e) =>
                          setProfileData((p) => ({
                            ...p,
                            bio: e.target.value,
                          }))
                        }
                        className="border-white/10 bg-[#050312]/60 text-white placeholder:text-white/30 focus:border-neon-primary/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/5 p-6">
                  <h3 className="mb-5 font-semibold text-white">
                    Notificações & Privacidade
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        key: "notificationsEnabled" as keyof ProfileData,
                        label: "Notificações push",
                        desc: "Receber alertas de partidas e convites",
                      },
                      {
                        key: "newsletterEnabled" as keyof ProfileData,
                        label: "Newsletter",
                        desc: "Receber novidades e dicas por email",
                      },
                      {
                        key: "earlyAccessEnabled" as keyof ProfileData,
                        label: "Acesso antecipado",
                        desc: "Testar novas funcionalidades em primeira mão",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-sm font-medium text-white">
                            {item.label}
                          </div>
                          <div className="text-xs text-white/40">
                            {item.desc}
                          </div>
                        </div>
                        <Switch
                          checked={profileData[item.key] as boolean}
                          onCheckedChange={(v) =>
                            setProfileData((p) => ({ ...p, [item.key]: v }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-neon-primary text-[#050312] hover:bg-neon-primary/90"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {saving ? "A guardar..." : "Guardar Alterações"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Terminar Sessão
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-14 border-t border-white/8 bg-[#050312]/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 md:px-6">
          <div className="flex flex-col gap-2 border-t border-white/8 pt-4 text-xs text-white/32 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Logo size="small" className="h-8 w-12" />
              <span>© {new Date().getFullYear()} Jogabola. Todos os direitos reservados.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { href: "/terms-and-conditions", label: "Termos" },
                { href: "/privacy-policy", label: "Privacidade" },
                { href: "/contact", label: "Suporte" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs font-medium text-white/55 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
