import { LoaderIcon, MailIcon } from "@animateicons/react/lucide";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const RESEND_SECONDS = 30;

export function BackButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-arena-primary hover:text-arena-primary/80"
    >
      <ArrowLeft size={13} />
      {label}
    </button>
  );
}

export function EmailInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <InputGroup className="h-[50px] rounded-[12px]  border-arena-border">
      <InputGroupInput
        type="email"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="email@email.com"
        className="w-full"
        required
        autoComplete="email"
      />
      <InputGroupAddon>
        <MailIcon size={17} color="currentColor" />
      </InputGroupAddon>
    </InputGroup>
  );
}

export function OtpField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
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

export function SubmitBtn({
  loading,
  onClick,
  children,
}: {
  loading: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      disabled={loading}
      onClick={onClick}
      className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-[14px] font-bold text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.2)] transition-all hover:bg-arena-primary/90 disabled:opacity-60"
    >
      {loading ? <LoaderIcon size={18} color="currentColor" /> : children}
    </button>
  );
}

function useResendTimer() {
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setSeconds(RESEND_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds(value => {
        if (value <= 1) {
          const id = intervalRef.current;
          if (id) clearInterval(id);
          return 0;
        }
        return value - 1;
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

export function ResendTimer({
  onResend,
  loading,
  resendCodeLabel,
  resendInLabel,
}: {
  onResend: () => Promise<void>;
  loading: boolean;
  resendCodeLabel: string;
  resendInLabel: (seconds: number) => string;
}) {
  const { seconds, canResend, restart } = useResendTimer();
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setResending(true);
    await onResend();
    setResending(false);
    restart();
  }

  const circumference = 2 * Math.PI * 10;
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
          {resendCodeLabel}
        </button>
      ) : (
        <div className="flex items-center gap-2 text-[12px] text-arena-text-muted">
          <div className="relative flex size-7 items-center justify-center">
            <svg
              width="28"
              height="28"
              className="-rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="14"
                cy="14"
                r="10"
                fill="none"
                stroke="var(--color-arena-border)"
                strokeWidth="2"
              />
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
          <span>{resendInLabel(seconds)}</span>
        </div>
      )}
    </div>
  );
}
