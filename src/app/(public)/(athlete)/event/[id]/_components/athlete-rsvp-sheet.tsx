"use client";

import {
  CheckIcon,
  LoaderIcon,
  LoginIcon,
  MailIcon,
  UserIcon,
} from "@animateicons/react/lucide";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { confirmUserAttendance } from "@/actions/attendance.actions";
import { requestGuestOTP, verifyGuestOTP } from "@/actions/guest-rsvp.actions";
import { createPayment, submitPaymentProof } from "@/actions/payments.actions";
import { JbBottomSheet } from "@/components/arena/jb-bottom-sheet";
import { PaymentMethodCard } from "@/components/arena/payment-method-card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useEvent } from "@/hooks/use-events";
import { useTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { emailOtp, signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { PaymentMethod, TeamPaymentConfig } from "@/types/payments";

type Step =
  | "choose"
  | "login-email"
  | "login-otp"
  | "guest-info"
  | "guest-otp"
  | "payment"
  | "success";

interface AthleteRsvpSheetProps {
  eventId: number;
  userId?: string | null;
  onClose: () => void;
  onSuccess: (status: string) => void;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-arena-primary hover:text-arena-primary/80"
    >
      <ArrowLeft size={13} />
      Voltar
    </button>
  );
}

function EmailInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-arena-text-muted">
        <MailIcon size={16} color="currentColor" />
      </span>
      <input
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="o-teu@email.com"
        className="h-[50px] w-full rounded-[12px] border border-arena-border bg-arena-bg-sec/50 pl-10 pr-4 text-[14px] text-arena-text placeholder:text-arena-text-muted outline-none transition-all focus:border-arena-primary focus:ring-2 focus:ring-arena-primary/10"
        required
        autoComplete="email"
      />
    </div>
  );
}

function OtpField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex justify-center py-2">
      <InputOTP
        maxLength={6}
        value={value}
        onChange={onChange}
        inputMode="numeric"
        autoComplete="one-time-code"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

function SubmitBtn({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-[14px] font-bold text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.2)] transition-all hover:bg-arena-primary/90 disabled:opacity-60"
    >
      {loading ? <LoaderIcon size={18} color="currentColor" /> : children}
    </button>
  );
}

const RESEND_SECONDS = 30;

function useResendTimer() {
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setSeconds(RESEND_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          const id = intervalRef.current;
          if (id) clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [start]);

  return { seconds, canResend: seconds === 0, restart: start };
}

function ResendTimer({
  onResend,
  loading,
}: {
  onResend: () => Promise<void>;
  loading: boolean;
}) {
  const { seconds, canResend, restart } = useResendTimer();
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setResending(true);
    await onResend();
    setResending(false);
    restart();
  }

  const circumference = 2 * Math.PI * 10; // r=10
  const progress = (seconds / RESEND_SECONDS) * circumference;

  return (
    <div className="flex items-center justify-center gap-2.5 pt-1">
      {canResend ? (
        <button
          type="button"
          disabled={loading || resending}
          onClick={handleResend}
          className="flex items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface px-4 py-2 text-[12px] font-bold text-arena-primary transition-all hover:bg-arena-primary/10 disabled:opacity-50"
        >
          {resending ? (
            <LoaderIcon size={14} color="currentColor" />
          ) : (
            <RotateCcw size={13} strokeWidth={2.5} />
          )}
          Reenviar código
        </button>
      ) : (
        <div className="flex items-center gap-2 text-[12px] text-arena-text-muted">
          {/* Circular countdown */}
          <div className="relative flex size-7 items-center justify-center">
            <svg
              width="28"
              height="28"
              className="-rotate-90"
              aria-hidden="true"
            >
              {/* Track */}
              <circle
                cx="14"
                cy="14"
                r="10"
                fill="none"
                stroke="var(--color-arena-border)"
                strokeWidth="2"
              />
              {/* Progress */}
              <circle
                cx="14"
                cy="14"
                r="10"
                fill="none"
                stroke="var(--color-arena-primary)"
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            </svg>
            <span className="absolute text-[9px] font-bold tabular-nums text-arena-primary">
              {seconds}
            </span>
          </div>
          <span>Reenviar em {seconds}s</span>
        </div>
      )}
    </div>
  );
}

export function AthleteRsvpSheet({
  eventId,
  userId,
  onClose,
  onSuccess,
}: AthleteRsvpSheetProps) {
  const [step, setStep] = useState<Step>(userId ? "payment" : "choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestOtp, setGuestOtp] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");

  const [reservationId, setReservationId] = useState<number | null>(null);

  const { event } = useEvent(eventId);
  const { settings } = useTeamPaymentSettings(event?.teamId);

  useEffect(() => {
    if (userId && step === "payment" && !reservationId && !loading) {
      setLoading(true);
      confirmUserAttendance(eventId).then(res => {
        setLoading(false);
        if (res.success) {
          setReservationId(res.reservationId);
        } else {
          setError(res.error || "Erro ao confirmar presença");
        }
      });
    }
  }, [userId, step, reservationId, eventId, loading]);

  function clearError() {
    setError("");
  }

  const handleNextAfterRsvp = useCallback(
    (resId?: number) => {
      if (event?.priceCents && event.priceCents > 0) {
        if (resId) setReservationId(resId);
        setStep("payment");
      } else {
        setStep("success");
      }
    },
    [event],
  );

  async function handleGuestSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      setError("Preenche o nome e email.");
      return;
    }
    setLoading(true);
    clearError();
    const res = await requestGuestOTP(
      eventId,
      guestName.trim(),
      guestEmail.trim(),
    );
    setLoading(false);
    if (res.success) {
      setStep("guest-otp");
    } else {
      setError(res.error || "Erro ao enviar código.");
    }
  }

  async function handleGuestVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (guestOtp.length < 6) {
      setError("Introduz o código de 6 dígitos.");
      return;
    }
    setLoading(true);
    clearError();
    const res = await verifyGuestOTP(eventId, guestEmail, guestOtp, guestName);
    setLoading(false);
    if (res.success) {
      onSuccess("confirmed");
      setStep("success");
    } else {
      setError(res.error || "Código inválido.");
    }
  }

  async function handleLoginSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setError("Introduz o teu email.");
      return;
    }
    setLoading(true);
    clearError();
    const result = await emailOtp.sendVerificationOtp({
      email: loginEmail.trim().toLowerCase(),
      type: "sign-in",
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message || "Erro ao enviar código.");
    } else {
      setStep("login-otp");
    }
  }

  async function handleLoginVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (loginOtp.length < 6) {
      setError("Introduz o código de 6 dígitos.");
      return;
    }
    setLoading(true);
    clearError();

    const name =
      loginEmail
        .split("@")[0]
        ?.replace(/[._-]+/g, " ")
        .trim() || "Atleta";

    const result = await signIn.emailOtp({
      email: loginEmail,
      otp: loginOtp,
      name,
    });

    if (result.error) {
      setError(result.error.message || "Código inválido.");
      setLoading(false);
      return;
    }

    const confirm = await confirmUserAttendance(eventId);
    setLoading(false);
    if (confirm.success) {
      onSuccess("confirmed");
      handleNextAfterRsvp(confirm.reservationId);
    } else {
      setError("Sessão criada mas erro ao confirmar presença. Tenta de novo.");
    }
  }

  async function handlePaymentIntent(method: PaymentMethod) {
    if (!reservationId || !event) return;

    const res = await createPayment({
      matchReservationId: reservationId,
      amountCents: event.priceCents,
      currency: event.currency,
      method,
    });

    if (res.success) {
      if (method === "cash") {
        setStep("success");
      }
      return res.data;
    } else {
      setError("Erro ao processar pagamento.");
    }
  }

  async function handleMbwayProof(paymentId: number) {
    // Placeholder for real proof upload
    // For now, we'll just submit a dummy URL to mark as paid_unverified
    await submitPaymentProof({
      paymentId,
      fileUrl: "https://example.com/placeholder-proof.jpg",
      notes: "Pagamento via MBWay confirmado pelo atleta",
    });
    setStep("success");
  }

  const TITLES: Record<Step, string> = {
    choose: "Confirmar Presença",
    "login-email": "Entrar na conta",
    "login-otp": "Verificar email",
    "guest-info": "Confirmar como Convidado",
    "guest-otp": "Verificar email",
    payment: "Pagamento",
    success: "Presença Confirmada!",
  };

  const defaultPaymentConfig: TeamPaymentConfig = {
    stripe: { enabled: false },
    mbway: { enabled: false },
    cash: { enabled: true, instructions: "Paga ao capitão no início do jogo." },
  };

  const paymentConfig: TeamPaymentConfig = settings
    ? {
        stripe: {
          enabled: settings.stripeEnabled,
          accountId: settings.stripeAccountId ?? undefined,
        },
        mbway: {
          enabled: settings.mbwayEnabled,
          phone: settings.mbwayPhone ?? undefined,
          name: settings.mbwayName ?? undefined,
        },
        cash: {
          enabled: settings.cashEnabled,
          instructions: settings.cashInstructions ?? undefined,
        },
      }
    : defaultPaymentConfig;

  return (
    <JbBottomSheet title={TITLES[step]} onClose={onClose}>
      <div className="flex flex-col p-5">
        {error && (
          <div className="mb-4 rounded-[10px] bg-arena-danger/10 p-3 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        {/* STEP: choose */}
        {step === "choose" && (
          <div className="flex flex-col gap-3">
            <p className="mb-2 text-[13px] text-arena-text-muted">
              Como queres confirmar a tua presença?
            </p>

            <button
              type="button"
              onClick={() => {
                clearError();
                setStep("login-email");
              }}
              className="group flex items-center gap-4 rounded-[14px] border border-arena-border bg-arena-surface p-4 text-left transition-all hover:border-arena-primary/40 hover:bg-arena-primary/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-arena-primary/30 bg-arena-primary/10 text-arena-primary">
                <LoginIcon size={20} color="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-arena-text">
                  Tenho conta JogaBola
                </p>
                <p className="text-[12px] text-arena-text-muted">
                  Histórico de presenças e pagamentos
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-arena-text-muted transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                clearError();
                setStep("guest-info");
              }}
              className="group flex items-center gap-4 rounded-[14px] border border-arena-border bg-arena-surface p-4 text-left transition-all hover:border-arena-info/40 hover:bg-arena-info/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-arena-info/30 bg-arena-info/10 text-arena-info">
                <UserIcon size={20} color="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-arena-text">
                  Continuar como Convidado
                </p>
                <p className="text-[12px] text-arena-text-muted">
                  Rápido — verificamos por email
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-arena-text-muted transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <p className="mt-1 text-center text-[11px] text-arena-text-muted">
              Não tens conta?{" "}
              <Link
                href="/auth"
                className="font-semibold text-arena-primary hover:underline"
              >
                Cria agora
              </Link>{" "}
              — é grátis
            </p>
          </div>
        )}

        {/* STEP: login-email */}
        {step === "login-email" && (
          <form onSubmit={handleLoginSendOTP} className="flex flex-col gap-4">
            <BackButton
              onClick={() => {
                clearError();
                setStep("choose");
              }}
            />
            <p className="text-[13px] text-arena-text-muted">
              Introduz o teu email e enviamos um código de acesso.
            </p>
            <EmailInput value={loginEmail} onChange={setLoginEmail} />
            <SubmitBtn loading={loading}>
              Receber código <ArrowRight size={16} />
            </SubmitBtn>
          </form>
        )}

        {/* STEP: login-otp */}
        {step === "login-otp" && (
          <form onSubmit={handleLoginVerifyOTP} className="flex flex-col gap-4">
            <BackButton
              onClick={() => {
                clearError();
                setStep("login-email");
              }}
            />
            <p className="text-[13px] text-arena-text-muted">
              Código enviado para{" "}
              <span className="font-semibold text-arena-text-sec">
                {loginEmail}
              </span>
            </p>
            <OtpField value={loginOtp} onChange={setLoginOtp} />
            <SubmitBtn loading={loading}>
              <CheckIcon size={18} color="currentColor" />
              Entrar e confirmar
            </SubmitBtn>
            <ResendTimer
              loading={loading}
              onResend={async () => {
                clearError();
                const result = await emailOtp.sendVerificationOtp({
                  email: loginEmail.trim().toLowerCase(),
                  type: "sign-in",
                });
                if (result.error)
                  setError(result.error.message || "Erro ao reenviar.");
              }}
            />
          </form>
        )}

        {/* STEP: guest-info */}
        {step === "guest-info" && (
          <form onSubmit={handleGuestSendOTP} className="flex flex-col gap-4">
            <BackButton
              onClick={() => {
                clearError();
                setStep("choose");
              }}
            />
            <p className="text-[13px] text-arena-text-muted">
              Sem conta? Sem problema — confirmamos via email.
            </p>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-arena-text-muted">
                <UserIcon size={16} color="currentColor" />
              </span>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Nome completo"
                className="h-[50px] w-full rounded-[12px] border border-arena-border bg-arena-bg-sec/50 pl-10 pr-4 text-[14px] text-arena-text placeholder:text-arena-text-muted outline-none transition-all focus:border-arena-primary focus:ring-2 focus:ring-arena-primary/10"
                required
                autoComplete="name"
              />
            </div>

            <EmailInput value={guestEmail} onChange={setGuestEmail} />

            <SubmitBtn loading={loading}>
              Receber PIN <ArrowRight size={16} />
            </SubmitBtn>

            <p className="text-center text-[10px] text-arena-text-muted">
              Ao continuar, aceitas os{" "}
              <Link
                href="/terms"
                className="underline hover:text-arena-text transition-colors"
              >
                Termos
              </Link>{" "}
              e{" "}
              <Link
                href="/privacy"
                className="underline hover:text-arena-text transition-colors"
              >
                Privacidade
              </Link>
              .
            </p>
          </form>
        )}

        {/* STEP: guest-otp */}
        {step === "guest-otp" && (
          <form onSubmit={handleGuestVerifyOTP} className="flex flex-col gap-4">
            <BackButton
              onClick={() => {
                clearError();
                setStep("guest-info");
              }}
            />
            <p className="text-[13px] text-arena-text-muted">
              Código enviado para{" "}
              <span className="font-semibold text-arena-text-sec">
                {guestEmail}
              </span>
            </p>
            <OtpField value={guestOtp} onChange={setGuestOtp} />
            <SubmitBtn loading={loading}>
              <CheckIcon size={18} color="currentColor" />
              Confirmar presença
            </SubmitBtn>
            <ResendTimer
              loading={loading}
              onResend={async () => {
                clearError();
                const res = await requestGuestOTP(
                  eventId,
                  guestName.trim(),
                  guestEmail.trim(),
                );
                if (!res.success)
                  setError(res.error || "Erro ao reenviar PIN.");
              }}
            />
          </form>
        )}

        {/* STEP: payment */}
        {step === "payment" && event && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 rounded-[12px] border border-arena-primary/20 bg-arena-primary/5 p-3.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-arena-primary text-arena-bg">
                  <CheckIcon size={14} color="currentColor" />
                </div>
                <p className="text-[13px] font-bold text-arena-text">
                  Vaga reservada!
                </p>
              </div>
              <p className="text-[12px] text-arena-text-muted">
                Garante o teu lugar efetuando o pagamento agora.
              </p>
            </div>

            <PaymentMethodCard
              config={paymentConfig}
              amountCents={event.priceCents}
              currency={event.currency}
              onCashIntent={() => handlePaymentIntent("cash")}
              onMbwayProof={async () => {
                const p = await handlePaymentIntent("mbway");
                if (p) handleMbwayProof(p.id);
              }}
            />

            <button
              type="button"
              onClick={() => setStep("success")}
              className="mt-2 text-center text-[12px] font-bold text-arena-text-muted hover:text-arena-text"
            >
              Pagar mais tarde
            </button>
          </div>
        )}

        {/* STEP: success */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border border-arena-success/30 bg-arena-success/15 text-arena-success">
              <CheckIcon size={32} color="currentColor" />
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-arena-text">
                Presença confirmada!
              </h2>
              <p className="mt-1 text-[13px] text-arena-text-muted">
                {guestName ? `Olá, ${guestName}!` : "Estás na lista."} Até ao
                jogo!
              </p>
            </div>

            <div className="w-full rounded-[16px] border border-arena-border bg-arena-surface p-4 text-left">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-arena-primary" />
                <span className="text-[13px] font-bold text-arena-text">
                  Cria a tua conta de atleta
                </span>
              </div>
              <p className="mb-3 text-[12px] text-arena-text-muted">
                Acede ao teu histórico de presenças, pagamentos e perfil de
                atleta. Grátis.
              </p>
              <Link
                href={`/auth?mode=register&email=${encodeURIComponent(guestEmail || loginEmail)}&callbackURL=/event/${eventId}`}
                className={cn(
                  "flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-arena-primary text-[13px] font-bold text-arena-bg no-underline transition-all hover:bg-arena-primary/90",
                )}
              >
                <Sparkles size={15} />
                Criar conta gratuita
              </Link>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[12px] text-arena-text-muted transition-colors hover:text-arena-text"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </JbBottomSheet>
  );
}
