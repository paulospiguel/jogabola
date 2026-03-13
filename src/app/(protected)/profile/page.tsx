"use client";

import { getProfileData, saveProfileData } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast-custom";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { Availability } from "@/schemas/profile";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  Cog,
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
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] tracking-widest text-white/40 uppercase">
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
        <span className="tracking-wider text-white/50 uppercase">{label}</span>
        <span className="font-semibold text-[#02a7ff]">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-[#02a7ff]"
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0e1117] text-white">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#0e1117]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/arena" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#02a7ff]">
              <Swords className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Jogabola</span>
          </Link>

          {/* Nav links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/arena"
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              Explorar
            </Link>
            <Link
              href="/arena/calendar"
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              Partidas
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-[#02a7ff] transition-colors hover:text-[#02a7ff]/80"
            >
              Meu Perfil
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#02a7ff] text-[9px] font-bold text-white">
                3
              </span>
            </button>
            <Link
              href="/arena"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Configurações"
            >
              <Cog className="h-4 w-4" />
            </Link>
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-[#02a7ff]/40">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="bg-[#02a7ff]/20 text-sm font-semibold text-[#02a7ff]">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#02a7ff]" />
          </div>
        ) : (
          <>
            {/* ── Profile Hero ─────────────────────────────────────────────── */}
            <div className="mb-6 rounded-2xl border border-white/8 bg-[#131928] p-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="rounded-full p-1 ring-2 ring-[#02a7ff]/60">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-[#1e2a45] text-2xl font-bold text-[#02a7ff]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <button
                    type="button"
                    className="absolute right-0 bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#02a7ff] text-white shadow-lg transition-transform hover:scale-110"
                    aria-label="Editar foto"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    {/* Name + badge */}
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold text-white sm:text-3xl">
                        {profileData.name || "Utilizador"}
                      </h1>
                      <Badge className="border-[#02a7ff]/30 bg-[#02a7ff]/15 text-xs text-[#02a7ff]">
                        <Shield className="mr-1 h-3 w-3" />
                        Premium Member
                      </Badge>
                    </div>

                    {/* Subtitle */}
                    <p className="mb-4 text-sm text-white/50">
                      {roleLabel[profileData.role] || "Atleta"}
                      {profileData.location && ` • ${profileData.location}`}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-8">
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

                  {/* Edit button */}
                  <div className="shrink-0">
                    <Button
                      onClick={() => setActiveTab("settings")}
                      className="border border-[#02a7ff]/40 bg-[#02a7ff]/15 text-[#02a7ff] hover:bg-[#02a7ff]/25 hover:text-white"
                      variant="outline"
                    >
                      Editar Perfil
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────────────── */}
            <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/8 pb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "border-b-2 border-[#02a7ff] text-[#02a7ff]"
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
                {/* Left column */}
                <div className="space-y-4">
                  {/* Bio */}
                  <div className="rounded-2xl border border-white/8 bg-[#131928] p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#02a7ff]/15">
                        <Info className="h-4 w-4 text-[#02a7ff]" />
                      </div>
                      <h3 className="font-semibold text-white">Bio</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">
                      {profileData.bio ||
                        "Apaixonado por futebol desde pequeno. Atleta amador buscando sempre melhorar o condicionamento físico e técnica."}
                    </p>
                  </div>

                  {/* Attributes */}
                  <div className="rounded-2xl border border-white/8 bg-[#131928] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#02a7ff]/15">
                        <TrendingUp className="h-4 w-4 text-[#02a7ff]" />
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

                {/* Right column */}
                <div className="space-y-6">
                  {/* Teams */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Equipes Atuais
                      </h3>
                      <button
                        type="button"
                        className="text-sm font-medium text-[#02a7ff] hover:underline"
                      >
                        Ver todas
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {mockTeams.map((team) => (
                        <div
                          key={team.id}
                          className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#131928] p-4 transition-colors hover:border-white/15"
                        >
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
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
                    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#131928]">
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
                    <div className="relative overflow-hidden rounded-2xl border border-white/8">
                      {/* Map placeholder */}
                      <div className="h-48 bg-[linear-gradient(135deg,#1a2a1a_0%,#2a3a2a_50%,#1a2a1a_100%)]">
                        <div className="flex h-full items-center justify-center">
                          <MapPin className="h-8 w-8 text-white/20" />
                        </div>
                      </div>
                      {/* Overlay info */}
                      <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-[#0e1117]/90 px-5 py-4 backdrop-blur-sm">
                        <div>
                          <p className="mb-0.5 text-xs font-semibold tracking-wider text-[#02a7ff] uppercase">
                            Sábado, 15:00
                          </p>
                          <p className="text-sm font-semibold text-white">
                            Arena Ibirapuera • Campo 2
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#02a7ff] text-white hover:bg-[#0290e6]"
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
              <div className="rounded-2xl border border-white/8 bg-[#131928] p-8 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-white/20" />
                <h3 className="mb-1 text-lg font-semibold text-white">
                  Minhas Equipes
                </h3>
                <p className="mb-4 text-sm text-white/40">
                  Gere as tuas equipas e convites pendentes.
                </p>
                <Button
                  onClick={() => router.push("/arena")}
                  className="bg-[#02a7ff] text-white hover:bg-[#0290e6]"
                >
                  Explorar Equipes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === "activities" && (
              <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#131928]">
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
                {/* Personal info */}
                <div className="rounded-2xl border border-white/8 bg-[#131928] p-6">
                  <h3 className="mb-5 font-semibold text-white">
                    Informações Pessoais
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white/50">Nome</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#02a7ff]/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white/50">Email</Label>
                      <Input
                        value={profileData.email}
                        disabled
                        className="border-white/10 bg-white/5 text-white/40 placeholder:text-white/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white/50">
                        Localização
                      </Label>
                      <Input
                        value={profileData.location || ""}
                        placeholder="Cidade, País"
                        onChange={(e) =>
                          setProfileData((p) => ({
                            ...p,
                            location: e.target.value,
                          }))
                        }
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#02a7ff]/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white/50">
                        Disponibilidade
                      </Label>
                      <Input
                        value={profileData.availability || ""}
                        placeholder="Ex: Fins de semana"
                        onChange={(e) =>
                          setProfileData((p) => ({
                            ...p,
                            availability: e.target.value,
                          }))
                        }
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#02a7ff]/50"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs text-white/50">Bio</Label>
                      <Textarea
                        value={profileData.bio || ""}
                        placeholder="Conta um pouco sobre ti..."
                        rows={3}
                        onChange={(e) =>
                          setProfileData((p) => ({
                            ...p,
                            bio: e.target.value,
                          }))
                        }
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#02a7ff]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="rounded-2xl border border-white/8 bg-[#131928] p-6">
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

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#02a7ff] text-white hover:bg-[#0290e6]"
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

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-white/8 bg-[#0e1117]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/30 sm:flex-row md:px-6">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#02a7ff]/20">
              <Swords className="h-3 w-3 text-[#02a7ff]/60" />
            </div>
            <span>© 2024 Jogabola. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white/60">
              Termos
            </Link>
            <Link href="/privacy" className="hover:text-white/60">
              Privacidade
            </Link>
            <Link href="/support" className="hover:text-white/60">
              Suporte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
