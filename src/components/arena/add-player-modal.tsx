"use client";

import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { addPlayerToRoster } from "@/actions/arena";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POSITIONS } from "@/constants/positions";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  position: string;
  experience: string;
  jerseyNumber: string;
  dateOfBirth: string;
}

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Iniciante", sub: "Estou a começar" },
  { value: "intermediate", label: "Intermédio", sub: "Jogo regularmente" },
  { value: "advanced", label: "Avançado", sub: "Jogo competitivamente" },
  { value: "professional", label: "Profissional", sub: "Alto nível" },
];

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  position: "",
  experience: "beginner",
  jerseyNumber: "",
  dateOfBirth: "",
};

// ─── Field components ─────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-bold uppercase tracking-[0.2em] text-white/60"
        >
          {label}
          {required && <span className="ml-1 text-[#6fffe9]">*</span>}
        </label>
      ) : (
        <p className="block text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          {label}
          {required && <span className="ml-1 text-[#6fffe9]">*</span>}
        </p>
      )}
      {children}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur outline-none transition-all duration-200 focus:border-[#6fffe9]/50 focus:ring-2 focus:ring-[#6fffe9]/20";

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface AddPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managerId?: string;
  onSuccess?: (name: string) => void;
}

export function AddPlayerModal({
  open,
  onOpenChange,
  managerId,
  onSuccess,
}: AddPlayerModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
      setServerError(null);
    };

  const validate = (): boolean => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = "Nome obrigatório";
    if (!form.email.trim()) next.email = "Email obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Email inválido";
    if (!form.position) next.position = "Seleciona uma posição";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    if (isPending) return;
    setForm(INITIAL_FORM);
    setErrors({});
    setServerError(null);
    setSuccess(null);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      const result = await addPlayerToRoster({
        name: form.name.trim(),
        email: form.email.trim(),
        position: form.position,
        experience: form.experience,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        managerId,
      });

      if (!result.success) {
        setServerError(result.error ?? "Erro desconhecido.");
        return;
      }

      setSuccess(form.name.trim());
      onSuccess?.(form.name.trim());
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
        {/* ── Success state ─────────────────────────────────────────────── */}
        {success ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#24ffe6]/20 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#24ffe6]/60 bg-[#080a25]">
                <CheckCircle2 className="h-10 w-10 text-[#24ffe6]" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
                Jogador Adicionado
              </p>
              <h3 className="mt-1 text-2xl font-bold text-white">{success}</h3>
              <p className="mt-2 text-sm text-white/50">
                O jogador foi registado e aguarda confirmação.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm(INITIAL_FORM);
                  setSuccess(null);
                  setServerError(null);
                  setErrors({});
                }}
                className="rounded-2xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
              >
                Adicionar outro
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl bg-[#24ffe6] px-5 py-2.5 text-sm font-bold text-black shadow-[0_8px_25px_-8px_rgba(36,255,230,0.7)] transition-all hover:bg-[#24ffe6]/90"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ──────────────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#6fffe9]/30 bg-[#6fffe9]/10">
                  <UserPlus className="h-5 w-5 text-[#6fffe9]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
                    Arena · Roster
                  </p>
                  <DialogTitle className="text-lg font-bold leading-tight">
                    Adicionar Jogador
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="mt-1">
                Regista um novo jogador no plantel do clube.
              </DialogDescription>
            </DialogHeader>

            {/* ── Identity ───────────────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome completo"
                htmlFor="player-name"
                required
                error={errors.name}
              >
                <input
                  id="player-name"
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Ex: João Silva"
                  autoComplete="off"
                  className={cn(
                    inputClass,
                    errors.name && "border-rose-500/60 bg-rose-500/5",
                  )}
                />
              </Field>
              <Field
                label="Email"
                htmlFor="player-email"
                required
                error={errors.email}
              >
                <input
                  id="player-email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="jogador@email.com"
                  autoComplete="off"
                  className={cn(
                    inputClass,
                    errors.email && "border-rose-500/60 bg-rose-500/5",
                  )}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nº Camisola"
                htmlFor="player-jersey-number"
                error={errors.jerseyNumber}
              >
                <input
                  id="player-jersey-number"
                  type="number"
                  min={1}
                  max={99}
                  value={form.jerseyNumber}
                  onChange={set("jerseyNumber")}
                  placeholder="Ex: 10"
                  className={inputClass}
                />
              </Field>
              <Field label="Data de Nascimento" htmlFor="player-date-of-birth">
                <input
                  id="player-date-of-birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={set("dateOfBirth")}
                  max={new Date().toISOString().split("T")[0]}
                  className={cn(
                    inputClass,
                    "text-white/70 [color-scheme:dark]",
                  )}
                />
              </Field>
            </div>

            {/* ── Position picker ─────────────────────────────────────────── */}
            <Field label="Posição" required error={errors.position}>
              <div className="grid grid-cols-5 gap-2">
                {Object.values(POSITIONS).map(pos => {
                  const active = form.position === pos.value;
                  return (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, position: pos.value }));
                        setErrors(prev => ({ ...prev, position: undefined }));
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-1 transition-all duration-200",
                        active
                          ? "border-[#24ffe6]/70 bg-[#24ffe6]/10 shadow-[0_0_20px_-5px_rgba(36,255,230,0.4)]"
                          : "border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/8",
                      )}
                    >
                      <span className="text-xl leading-none">{pos.emoji}</span>
                      <span
                        className={cn(
                          "text-[10px] font-bold leading-tight",
                          active ? "text-[#6fffe9]" : "text-white/50",
                        )}
                      >
                        {pos.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* ── Experience ─────────────────────────────────────────────── */}
            <Field label="Nível de Experiência">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {EXPERIENCE_OPTIONS.map(opt => {
                  const active = form.experience === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm(prev => ({ ...prev, experience: opt.value }))
                      }
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-2xl border px-3 py-2.5 text-left transition-all duration-200",
                        active
                          ? "border-[#6fffe9]/50 bg-[#6fffe9]/10"
                          : "border-white/8 bg-white/5 hover:border-white/20",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-bold",
                          active ? "text-[#6fffe9]" : "text-white/70",
                        )}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {opt.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* ── Server error ────────────────────────────────────────────── */}
            {serverError && (
              <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                {serverError}
              </p>
            )}

            {/* ── Actions ────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-2xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 backdrop-blur transition-all hover:bg-white/10 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-[#24ffe6] px-6 py-2.5 text-sm font-bold text-black shadow-[0_8px_25px_-8px_rgba(36,255,230,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24ffe6]/90 disabled:opacity-60 disabled:translate-y-0"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />A adicionar…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Adicionar Jogador
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
