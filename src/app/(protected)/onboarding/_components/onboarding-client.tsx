"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Lock, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { completeOnboarding, type UserRole } from "@/actions/onboarding.actions";

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  badge?: string;
  disabled?: boolean;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({
  icon,
  title,
  description,
  features,
  badge,
  disabled,
  selected,
  onClick,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        "relative w-full rounded-2xl border p-6 text-left transition-all duration-200",
        disabled
          ? "cursor-not-allowed border-white/8 bg-white/3 opacity-50"
          : selected
            ? "border-[#7CFF4F]/60 bg-[#7CFF4F]/8 shadow-[0_0_24px_rgba(124,255,79,0.08)]"
            : "border-white/12 bg-white/5 hover:border-white/24 hover:bg-white/8",
      ].join(" ")}
    >
      {badge && (
        <span className="absolute top-4 right-4 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
          {badge}
        </span>
      )}

      {disabled && (
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/30 uppercase">
          <Lock size={9} />
          Em breve
        </span>
      )}

      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white/8">
        {icon}
      </div>

      <h3 className="mb-1.5 text-base font-bold text-white">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-white/50">{description}</p>

      <ul className="space-y-2">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-white/40">
            <span className="size-1 rounded-full bg-[#7CFF4F]/50 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {selected && !disabled && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#7CFF4F]">
          <span className="size-1.5 rounded-full bg-[#7CFF4F] animate-pulse" />
          Selecionado
        </div>
      )}
    </button>
  );
}

interface OnboardingClientProps {
  userName: string;
}

export function OnboardingClient({ userName }: OnboardingClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = userName.split(" ")[0];

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setError(null);

    try {
      const result = await completeOnboarding(selected);
      if (!result.success) {
        setError("Erro ao guardar preferência. Tenta novamente.");
        return;
      }
      router.push("/arena");
      router.refresh();
    } catch {
      setError("Erro inesperado. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#7CFF4F]/20 bg-[#7CFF4F]/8 px-3 py-1">
            <span className="size-1.5 rounded-full bg-[#7CFF4F] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-[#7CFF4F] uppercase">
              Bem-vindo à Arena
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            Olá, {firstName}!
          </h1>
          <p className="text-sm text-white/45">
            Como queres usar a JogaBola Arena?
          </p>
        </div>

        {/* Role cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <RoleCard
            icon={<Shield size={22} className="text-[#7CFF4F]" />}
            title="Capitão"
            description="Gere a tua equipa, marca jogos e convida atletas."
            features={[
              "Criar e gerir equipas",
              "Agendar partidas e eventos",
              "Convidar e gerir atletas",
              "Controlar pagamentos",
            ]}
            selected={selected === "captain"}
            onClick={() => setSelected("captain")}
          />

          <RoleCard
            icon={<User size={22} className="text-white/30" />}
            title="Atleta"
            description="Junta-te a equipas, confirma presença e gere o teu perfil de jogador."
            features={[
              "Perfil de atleta",
              "Confirmar presença em jogos",
              "Histórico de partidas",
              "Ver estatísticas",
            ]}
            disabled
            selected={selected === "athlete"}
            onClick={() => setSelected("athlete")}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-center text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected || loading}
            className={[
              "flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-200",
              selected && !loading
                ? "bg-[#7CFF4F] text-black hover:bg-[#7CFF4F]/90 shadow-[0_0_20px_rgba(124,255,79,0.25)]"
                : "cursor-not-allowed bg-white/8 text-white/25",
            ].join(" ")}
          >
            {loading ? "A guardar..." : "Continuar"}
            {!loading && <ChevronRight size={16} />}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          Podes alterar isto mais tarde nas definições.
        </p>
      </motion.div>
    </div>
  );
}
