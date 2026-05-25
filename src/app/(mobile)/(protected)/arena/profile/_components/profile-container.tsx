"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bolt,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit3,
  Loader2,
  Lock,
  LogOut,
  Save,
  Shield,
  ShieldCheck,
  Sliders,
  Smartphone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateUserProfile } from "@/actions/profile.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { passkey } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// Mock user stats to match mockup Screen 1 exactly
const USER_STATS = [
  { value: "24", labelKey: "dashboard.games" },
  { value: "6", labelKey: "dashboard.goals" },
  { value: "7", labelKey: "dashboard.assists" },
  { value: "8.3", labelKey: "dashboard.rating" },
];

// Mock associated teams to match mockup Screen 1 and 2 exactly
const INITIAL_TEAMS = [
  {
    id: 1,
    name: "FC Bairro Alto",
    role: "Gestor",
    league: "Liga Regional de Lisboa",
    color: "#7CFF4F", // Neon green shield
    stats: [
      { value: "15", labelKey: "dashboard.playersCount" },
      { value: "2º", labelKey: "dashboard.position" },
      { value: "11", labelKey: "dashboard.wins" },
      { value: "2024", labelKey: "dashboard.season" },
    ],
    expanded: true,
  },
  {
    id: 2,
    name: "Sporting Bairro B",
    role: "Staff",
    league: "Distrital de Lisboa",
    color: "#38BDF8", // Cyan shield
    stats: [
      { value: "18", labelKey: "dashboard.playersCount" },
      { value: "5º", labelKey: "dashboard.position" },
      { value: "8", labelKey: "dashboard.wins" },
      { value: "2024", labelKey: "dashboard.season" },
    ],
    expanded: false,
  },
  {
    id: 3,
    name: "Os Amigos SC",
    role: "Gestor",
    league: "Liga Amigos",
    color: "#FACC15", // Gold shield
    stats: [
      { value: "14", labelKey: "dashboard.playersCount" },
      { value: "1º", labelKey: "dashboard.position" },
      { value: "13", labelKey: "dashboard.wins" },
      { value: "2024", labelKey: "dashboard.season" },
    ],
    expanded: false,
  },
];

interface ProfileContainerProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    phone?: string;
  };
  realTeams: Array<{
    id: number;
    name: string;
    slug: string;
    location: string | null;
  }>;
  passkeysCount: number;
}

export function ProfileContainer({
  user,
  realTeams: _realTeams,
  passkeysCount,
}: ProfileContainerProps) {
  const t = useTranslations("profilePage");
  const [teamsList, setTeamsList] = useState(INITIAL_TEAMS);
  const [activeSheet, setActiveSheet] = useState<
    "notifications" | "security" | "edit-profile" | null
  >(null);

  // States for Edit Profile Sheet
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "+351 910 297 571", // Mock Portuguese phone as in Screen 4
  });
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );

  // States for Notifications Sheet (PUSH / E-MAIL states for 5 items as in Screen 3)
  const [notificationSettings, setNotificationSettings] = useState({
    presence: { push: true, email: true },
    chat: { push: true, email: false },
    results: { push: false, email: true },
    payments: { push: true, email: true },
    notices: { push: true, email: false },
  });

  // States for Security Sheet
  const [passkeyStatus, setPasskeyStatus] = useState<
    "idle" | "adding" | "added" | "error"
  >("idle");
  const [hasPasskey, setHasPasskey] = useState<boolean>(
    passkeysCount > 0 || true,
  ); // Mock active FaceID as in Screen 5

  const toggleTeamExpand = (id: number) => {
    setTeamsList(prev =>
      prev.map(t => {
        if (t.id === id) {
          return { ...t, expanded: !t.expanded };
        }
        return { ...t, expanded: false }; // Collapse others to maintain visual neatness
      }),
    );
  };

  const handleUpdateProfile = () => {
    startTransition(async () => {
      const result = await updateUserProfile({ name: profileForm.name });
      if (result.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus("error");
      }
    });
  };

  const handleRegisterPasskey = async () => {
    setPasskeyStatus("adding");
    try {
      const result = await passkey.addPasskey();
      if (result?.error) throw new Error(result.error.message);
      setPasskeyStatus("added");
      setHasPasskey(true);
      setTimeout(() => setPasskeyStatus("idle"), 2500);
    } catch {
      setPasskeyStatus("error");
      setTimeout(() => setPasskeyStatus("idle"), 2500);
    }
  };

  const handleLogout = async () => {
    if (confirm("Deseja realmente terminar a sessão?")) {
      window.location.href = "/auth/sign-out"; // Or whichever logout route
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[480px] mx-auto px-1 py-4">
      {/* 1. ELEVATED HEADER (Screen 1 Mockup) */}
      <div className="flex flex-col items-center text-center mt-4 mb-2 relative">
        <div className="relative group">
          <div className="w-[88px] h-[88px] rounded-full border-2 border-arena-border p-1 bg-arena-bg-sec/50">
            <JbAvatar
              id={user.id}
              name={profileForm.name}
              image={user.image}
              size={76}
              className="rounded-full overflow-hidden"
            />
          </div>
          {/* Green verified badge bottom-right */}
          <div className="absolute -bottom-1 -right-1 bg-arena-bg p-[3px] rounded-full">
            <div className="w-[20px] h-[20px] bg-arena-primary rounded-full flex items-center justify-center shadow-lg">
              <ShieldCheck
                className="w-3.5 h-3.5 text-[#0B0F14]"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        <h1 className="text-xl font-extrabold font-sora mt-3 text-arena-text flex items-center gap-1.5 justify-center">
          {profileForm.name}
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-arena-primary/10 border border-arena-primary/30 text-arena-primary">
            Gestor
          </span>
          <span className="text-xs text-arena-text-muted select-all">
            {user.email}
          </span>
        </div>
      </div>

      {/* 2. UNIFIED METRICS BOARD (Screen 1 Mockup) */}
      <div className="grid grid-cols-4 bg-arena-surface border border-arena-border rounded-[14px] p-3 text-center divide-x divide-arena-border/50">
        {USER_STATS.map(stat => (
          <div key={stat.labelKey} className="flex flex-col">
            <span className="text-lg font-bold font-sora text-arena-text leading-tight">
              {stat.value}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-arena-text-muted mt-0.5">
              {t(stat.labelKey)}
            </span>
          </div>
        ))}
      </div>

      {/* 3. EQUIPAS ASSOCIADAS (Screen 1 & 2 Mockup) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted">
            {t("dashboard.associatedTeams")}
          </span>
          <span className="text-[10px] text-arena-text-muted font-medium">
            {t("dashboard.associatedTeamsCount", { count: teamsList.length })}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {teamsList.map(team => (
            <div
              key={team.id}
              className={cn(
                "rounded-[16px] border bg-arena-surface/85 transition-all duration-300 overflow-hidden",
                team.expanded
                  ? "border-arena-primary/40 ring-1 ring-arena-primary/10"
                  : "border-arena-border hover:border-arena-border/80",
              )}
            >
              {/* Card Header (Clickable for Toggle) */}
              <button
                type="button"
                onClick={() => toggleTeamExpand(team.id)}
                className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${team.color}15`,
                      border: `1px solid ${team.color}35`,
                    }}
                  >
                    <Shield
                      className="w-5 h-5"
                      style={{ color: team.color }}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-arena-text truncate">
                        {team.name}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] uppercase font-bold px-1.5 py-0.25 rounded",
                          team.role === "Gestor"
                            ? "bg-arena-primary/15 text-arena-primary border border-arena-primary/20"
                            : "bg-arena-info/15 text-arena-info border border-arena-info/20",
                        )}
                      >
                        {team.role}
                      </span>
                    </div>
                    <span className="text-xs text-arena-text-muted block mt-0.5 truncate">
                      {team.league}
                    </span>
                  </div>
                </div>

                <div className="text-arena-text-muted">
                  {team.expanded ? (
                    <ChevronDown size={18} className="text-arena-text-sec" />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </div>
              </button>

              {/* Expanded Card Details */}
              <AnimatePresence initial={false}>
                {team.expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-arena-border/30"
                  >
                    <div className="p-3.5 flex flex-col gap-4">
                      {/* Grid Stats */}
                      <div className="grid grid-cols-4 bg-arena-bg-sec/55 border border-arena-border/40 rounded-xl p-2.5 divide-x divide-arena-border/30">
                        {team.stats.map(s => (
                          <div
                            key={s.labelKey}
                            className="text-center flex flex-col"
                          >
                            <span className="text-sm font-extrabold font-sora text-arena-text">
                              {s.value}
                            </span>
                            <span className="text-[8px] uppercase font-bold tracking-wide text-arena-text-muted mt-0.5">
                              {t(s.labelKey)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          className="flex-1 bg-arena-surface border border-arena-primary/30 text-arena-primary font-bold hover:bg-arena-primary/10 h-10 rounded-xl text-xs gap-1.5 transition-all"
                          variant="outline"
                        >
                          <Shield className="w-3.5 h-3.5" strokeWidth={2.2} />
                          {t("dashboard.viewRound")}
                        </Button>
                        <Button className="flex-1 bg-arena-bg-sec border border-arena-border text-arena-text font-bold hover:bg-arena-surface-el h-10 rounded-xl text-xs gap-1.5 transition-all">
                          <Calendar className="w-3.5 h-3.5 text-arena-text-sec" />
                          {t("dashboard.events")}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-10 h-10 bg-arena-bg-sec border border-arena-border rounded-xl hover:bg-arena-surface-el flex items-center justify-center shrink-0"
                        >
                          <Sliders className="w-4 h-4 text-arena-text-sec" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SETTINGS OPTIONS LIST (Screen 2 Mockup) */}
      <div className="bg-arena-surface border border-arena-border rounded-[16px] divide-y divide-arena-border/50 overflow-hidden">
        {/* Notificações */}
        <button
          type="button"
          onClick={() => setActiveSheet("notifications")}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-arena-bg-sec/80 flex items-center justify-center text-arena-text-sec border border-arena-border/60">
              <Bell
                className="w-4.5 h-4.5 text-arena-text-sec"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <span className="font-bold text-sm text-arena-text block">
                {t("menu.notifications")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("menu.notificationsSub")}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </button>

        {/* Segurança */}
        <button
          type="button"
          onClick={() => setActiveSheet("security")}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-arena-bg-sec/80 flex items-center justify-center text-arena-text-sec border border-arena-border/60">
              <Lock
                className="w-4.5 h-4.5 text-arena-text-sec"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <span className="font-bold text-sm text-arena-text block">
                {t("menu.security")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("menu.securitySub")}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </button>

        {/* Editar Perfil */}
        <button
          type="button"
          onClick={() => setActiveSheet("edit-profile")}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-arena-bg-sec/80 flex items-center justify-center text-arena-text-sec border border-arena-border/60">
              <Edit3
                className="w-4.5 h-4.5 text-arena-text-sec"
                strokeWidth={1.8}
              />
            </div>
            <div>
              <span className="font-bold text-sm text-arena-text block">
                {t("menu.editProfile")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("menu.editProfileSub")}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </button>

        {/* Plano Pro */}
        <button
          type="button"
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] border border-[#00f0ff]/20">
              <Bolt className="w-4.5 h-4.5 text-[#00f0ff]" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-arena-text block">
                  {t("menu.proPlan")}
                </span>
                <span className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.25 bg-[#00f0ff]/20 text-[#00f0ff] rounded border border-[#00f0ff]/30 leading-none">
                  PRO
                </span>
              </div>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("menu.proPlanSub")}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </button>
      </div>

      {/* 5. TERMINAR SESSÃO (Screen 2 Mockup) */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full h-12 bg-arena-danger/10 border border-arena-danger/25 text-arena-danger font-bold hover:bg-arena-danger/15 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2"
      >
        <LogOut className="w-4 h-4" strokeWidth={2.2} />
        {t("menu.logout")}
      </button>

      {/* ──────── BOTTOM SHEETS ──────── */}
      <AnimatePresence>
        {/* BOTTOM SHEET 1: NOTIFICAÇÕES (Screen 3) */}
        {activeSheet === "notifications" && (
          <BottomSheet
            title={t("notificationsSheet.title")}
            onClose={() => setActiveSheet(null)}
            noPad
          >
            <div className="px-5 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              {/* Switches table header */}
              <div className="flex justify-end gap-9 text-[9px] uppercase tracking-widest font-extrabold text-arena-text-muted px-1.5 pb-2 border-b border-arena-border/30">
                <span>{t("notificationsSheet.push")}</span>
                <span>{t("notificationsSheet.email")}</span>
              </div>

              {/* Notification Categories */}
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 border-b border-arena-border/20 last:border-b-0"
                >
                  <div className="flex-1 pr-4">
                    <span className="font-bold text-sm text-arena-text block leading-snug">
                      {t(`notificationsSheet.${key}`)}
                    </span>
                    <span className="text-xs text-arena-text-muted block mt-0.5 leading-normal">
                      {t(`notificationsSheet.${key}Sub`)}
                    </span>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Push Switch */}
                    <Switch
                      checked={value.push}
                      onCheckedChange={checked =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          [key]: {
                            ...prev[key as keyof typeof prev],
                            push: checked,
                          },
                        }))
                      }
                      className={cn(
                        "data-[state=checked]:bg-arena-primary data-[state=checked]:border-arena-primary",
                        "h-6 w-11 shrink-0 rounded-full border-2 border-white/20 bg-white/10",
                      )}
                    />
                    {/* Email Switch */}
                    <Switch
                      checked={value.email}
                      onCheckedChange={checked =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          [key]: {
                            ...prev[key as keyof typeof prev],
                            email: checked,
                          },
                        }))
                      }
                      className={cn(
                        "data-[state=checked]:bg-arena-primary data-[state=checked]:border-arena-primary",
                        "h-6 w-11 shrink-0 rounded-full border-2 border-white/20 bg-white/10",
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BottomSheet>
        )}

        {/* BOTTOM SHEET 2: EDITAR PERFIL (Screen 4) */}
        {activeSheet === "edit-profile" && (
          <BottomSheet
            title={t("editProfileSheet.title")}
            onClose={() => setActiveSheet(null)}
            noPad
          >
            <div className="px-5 py-4 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
              {/* Profile Image with Edit Pen */}
              <div className="flex flex-col items-center justify-center py-2 relative">
                <div className="relative group cursor-pointer">
                  <div className="w-[88px] h-[88px] rounded-full border-2 border-arena-border p-1 bg-arena-bg-sec/50">
                    <JbAvatar
                      id={user.id}
                      name={profileForm.name}
                      image={user.image}
                      size={76}
                    />
                  </div>
                  {/* Pencil badge overlay */}
                  <div className="absolute -bottom-1 -right-1 bg-arena-bg p-[3px] rounded-full">
                    <div className="w-[20px] h-[20px] bg-arena-primary rounded-full flex items-center justify-center shadow-lg">
                      <Edit3
                        className="w-3.5 h-3.5 text-[#0B0F14]"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Form Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-bold text-arena-text-muted uppercase tracking-wider">
                    {t("editProfileSheet.fullName")}
                  </Label>
                  <Input
                    className="border-arena-border bg-arena-surface-el/50 text-arena-text h-11 rounded-xl px-3.5"
                    value={profileForm.name}
                    onChange={e =>
                      setProfileForm(p => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2 relative">
                  <Label className="text-[10px] font-bold text-arena-text-muted uppercase tracking-wider">
                    {t("editProfileSheet.email")}
                  </Label>
                  <div className="relative">
                    <Input
                      disabled
                      className="border-arena-border bg-arena-surface-el/20 text-arena-text-sec/60 h-11 rounded-xl px-3.5 pr-24"
                      value={profileForm.email}
                    />
                    {/* Verified inline badge */}
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-arena-primary/10 border border-arena-primary/20 text-arena-primary px-2 py-1 rounded-lg text-[9px] uppercase tracking-wide font-extrabold">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("editProfileSheet.verified")}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-bold text-arena-text-muted uppercase tracking-wider">
                    {t("editProfileSheet.phone")}
                  </Label>
                  <Input
                    className="border-arena-border bg-arena-surface-el/50 text-arena-text h-11 rounded-xl px-3.5"
                    value={profileForm.phone}
                    onChange={e =>
                      setProfileForm(p => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Atleta verificado bottom alert row */}
              <div className="bg-arena-surface border border-arena-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-arena-primary/10 flex items-center justify-center shrink-0 border border-arena-primary/20">
                  <ShieldCheck
                    className="w-4 h-4 text-arena-primary"
                    strokeWidth={2.2}
                  />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-arena-text block">
                    {t("editProfileSheet.verifiedAthlete")}
                  </span>
                  <span className="text-xs text-arena-text-muted block mt-0.5">
                    {t("editProfileSheet.verifiedAthleteDesc")}
                  </span>
                </div>
              </div>

              {/* Status Feedbacks */}
              {saveStatus === "saved" && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-300">
                  <CheckCircle2 size={16} />
                  {t("feedback.updatedDescription")}
                </div>
              )}
              {saveStatus === "error" && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {t("feedback.saveError")}
                </div>
              )}

              {/* CTA save */}
              <Button
                onClick={handleUpdateProfile}
                disabled={isPending}
                className="w-full bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/90 font-bold h-11 rounded-xl text-sm transition-all gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isPending ? t("actions.saving") : t("actions.save")}
              </Button>
            </div>
          </BottomSheet>
        )}

        {/* BOTTOM SHEET 3: SEGURANÇA (Screen 5) */}
        {activeSheet === "security" && (
          <BottomSheet
            title={t("securitySheet.title")}
            onClose={() => setActiveSheet(null)}
            noPad
          >
            <div className="px-5 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <Tabs defaultValue="passkeys" className="w-full">
                {/* Standard tabs switcher */}
                <TabsList className="grid grid-cols-3 bg-arena-surface border border-arena-border/80 p-1 rounded-xl h-11">
                  <TabsTrigger
                    value="passkeys"
                    className="rounded-lg font-bold text-xs data-[state=active]:bg-arena-primary data-[state=active]:text-[#0B0F14]"
                  >
                    {t("securitySheet.tabs.passkeys")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="sessions"
                    className="rounded-lg font-bold text-xs data-[state=active]:bg-arena-primary data-[state=active]:text-[#0B0F14]"
                  >
                    {t("securitySheet.tabs.sessions")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="2fa"
                    className="rounded-lg font-bold text-xs data-[state=active]:bg-arena-primary data-[state=active]:text-[#0B0F14]"
                  >
                    {t("securitySheet.tabs.twoFactor")}
                  </TabsTrigger>
                </TabsList>

                {/* Tab content 1: Passkeys */}
                <TabsContent
                  value="passkeys"
                  className="mt-4 flex flex-col gap-4"
                >
                  {hasPasskey ? (
                    <div className="bg-arena-surface border border-arena-border rounded-[14px] p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-arena-primary/10 flex items-center justify-center text-arena-primary border border-arena-primary/20">
                          <Smartphone
                            className="w-5 h-5 text-arena-primary"
                            strokeWidth={1.8}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-arena-text">
                              iPhone — Face ID
                            </span>
                            <div className="w-3.5 h-3.5 rounded-full bg-arena-primary/20 flex items-center justify-center">
                              <CheckCircle2
                                className="w-2.5 h-2.5 text-arena-primary"
                                strokeWidth={2.5}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-arena-text-muted block mt-0.5">
                            {t("securitySheet.addedOn", { date: "12 Abr" })} ·{" "}
                            <span className="text-arena-primary font-medium">
                              {t("securitySheet.deviceActive")}
                            </span>
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => setHasPasskey(false)}
                        variant="outline"
                        size="sm"
                        className="bg-arena-bg-sec border border-arena-border text-arena-text hover:bg-arena-surface-el font-bold text-xs px-3 h-8 rounded-lg"
                      >
                        {t("securitySheet.remove")}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-arena-border rounded-xl flex flex-col items-center justify-center p-4">
                      <Smartphone
                        className="w-8 h-8 text-arena-text-muted mb-2"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm font-bold text-arena-text">
                        {t("security.noPasskeys")}
                      </span>
                      <span className="text-xs text-arena-text-muted mt-1 max-w-[280px]">
                        {t("security.passkeysDesc")}
                      </span>
                    </div>
                  )}

                  {/* Add Passkey button */}
                  <Button
                    onClick={handleRegisterPasskey}
                    disabled={passkeyStatus === "adding"}
                    className="w-full bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/90 font-bold h-11 rounded-xl text-sm transition-all gap-1.5"
                  >
                    {passkeyStatus === "adding" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                    {passkeyStatus === "adding"
                      ? t("actions.saving")
                      : t("actions.addPasskey")}
                  </Button>
                </TabsContent>

                {/* Tab content 2: Sessions */}
                <TabsContent value="sessions" className="mt-4">
                  <div className="bg-arena-surface border border-arena-border rounded-[14px] p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-arena-primary/10 flex items-center justify-center text-arena-primary border border-arena-primary/20">
                        <Smartphone
                          className="w-5 h-5 text-arena-primary"
                          strokeWidth={1.8}
                        />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-arena-text block">
                          iPhone (Safari)
                        </span>
                        <span className="text-xs text-arena-text-muted block mt-0.5">
                          Lisboa, Portugal · 192.168.1.10
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-arena-primary/15 text-arena-primary border border-arena-primary/20">
                      Atual
                    </span>
                  </div>
                </TabsContent>

                {/* Tab content 3: 2FA */}
                <TabsContent
                  value="2fa"
                  className="mt-4 text-center py-6 border border-arena-border rounded-xl bg-arena-surface p-4"
                >
                  <Lock
                    className="w-8 h-8 text-arena-text-muted mx-auto mb-2"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-bold text-arena-text block">
                    Autenticação de Dois Fatores
                  </span>
                  <span className="text-xs text-arena-text-muted mt-1 block max-w-[280px] mx-auto">
                    Configure um código PIN adicional de verificação para
                    aumentar a proteção da sua conta.
                  </span>
                </TabsContent>
              </Tabs>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
