"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Loader2,
  Zap,
  Lock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { registerPasskey } from "@/lib/auth-client";

interface PasskeyPromptGateProps {
  hasPasskey: boolean;
  userId: string;
  translations: {
    title: string;
    description: string;
    feature1Title: string;
    feature1Sub: string;
    feature2Title: string;
    feature2Sub: string;
    yes: string;
    no: string;
    skip: string;
    success: string;
    error: string;
  };
}

export function PasskeyPromptGate({
  hasPasskey,
  userId,
  translations,
}: PasskeyPromptGateProps) {
  const tErr = useTranslations("passkeyErrors");
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "adding" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hasPasskey) return;

    const refused = localStorage.getItem(
      `jogabola-passkey-prompt-refused-${userId}`,
    );
    const skipped = sessionStorage.getItem(
      `jogabola-passkey-prompt-skipped-${userId}`,
    );

    if (!refused && !skipped) {
      // Pequeno delay para uma experiência de transição suave ao carregar a página
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mounted, hasPasskey, userId]);

  if (!mounted) return null;

  async function handleRegister() {
    setStatus("adding");
    setErrorMsg("");
    const result = await registerPasskey();
    if (!result.ok) {
      setErrorMsg(tErr(result.code));
      setStatus("error");
      return;
    }
    setStatus("success");
    setTimeout(() => {
      setIsOpen(false);
    }, 1500);
  }

  function handleRefuse() {
    localStorage.setItem(`jogabola-passkey-prompt-refused-${userId}`, "true");
    setIsOpen(false);
  }

  function handleSkip() {
    sessionStorage.setItem(`jogabola-passkey-prompt-skipped-${userId}`, "true");
    setIsOpen(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleSkip();
      }}
    >
      <DialogContent className="border-arena-border bg-[#0B0F14]/98 max-w-[360px] p-6 sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(124,255,79,0.08)] outline-none overflow-hidden [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:bg-[#151C26]/80 [&>button]:border [&>button]:border-arena-border [&>button]:rounded-xl [&>button]:p-1.5 [&>button]:text-arena-text-sec [&>button]:hover:text-arena-text [&>button]:hover:bg-[#1B2430] [&>button]:transition-all [&>button]:opacity-100">
        <DialogHeader className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[20px] border border-arena-primary/20 bg-arena-primary/5 text-arena-primary mb-5 relative shadow-[inset_0_0_12px_rgba(124,255,79,0.15)]">
            <Fingerprint className="h-10 w-10 text-arena-primary" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-2xl font-extrabold text-arena-text text-center font-sora tracking-tight mt-1">
            {translations.title}
          </DialogTitle>
          <DialogDescription className="text-arena-text-sec text-sm mt-3 max-w-[280px] text-center leading-relaxed">
            {translations.description}
          </DialogDescription>
        </DialogHeader>

        {/* Painéis de Benefícios */}
        <div className="flex flex-col gap-3 mt-6 mb-6 w-full text-left">
          {/* Benefício 1 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-arena-border/50 bg-[#151C26]/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-arena-primary/5 border border-arena-primary/10 text-arena-primary">
              <Zap className="h-5 w-5 text-arena-primary" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-arena-text font-bold text-sm leading-tight">
                {translations.feature1Title}
              </span>
              <span className="text-arena-text-muted text-xs mt-0.5 leading-normal">
                {translations.feature1Sub}
              </span>
            </div>
          </div>

          {/* Benefício 2 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-arena-border/50 bg-[#151C26]/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-arena-primary/5 border border-arena-primary/10 text-arena-primary">
              <Lock className="h-5 w-5 text-arena-primary" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-arena-text font-bold text-sm leading-tight">
                {translations.feature2Title}
              </span>
              <span className="text-arena-text-muted text-xs mt-0.5 leading-normal">
                {translations.feature2Sub}
              </span>
            </div>
          </div>
        </div>

        {status === "success" && (
          <div className="flex items-center gap-2 justify-center rounded-xl border border-green-500/20 bg-green-500/10 px-3.5 py-2.5 text-sm text-green-300 my-2">
            <CheckCircle2 size={16} />
            {translations.success}
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300 my-2 text-center">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg || translations.error}</span>
          </div>
        )}

        <DialogFooter className="flex flex-col gap-0 sm:flex-col sm:space-x-0 w-full">
          <Button
            className="w-full h-12 bg-arena-primary hover:bg-[#8eff64] text-arena-bg font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_24px_rgba(124,255,79,0.25)] hover:shadow-[0_0_32px_rgba(124,255,79,0.4)] btn-press press"
            disabled={status === "adding" || status === "success"}
            onClick={handleRegister}
          >
            {status === "adding" ? (
              <>
                <Loader2 className="size-5 animate-spin text-arena-bg" />
                <span>{translations.yes}...</span>
              </>
            ) : (
              <>
                <Fingerprint className="size-5 text-arena-bg" strokeWidth={2} />
                <span>{translations.yes}</span>
              </>
            )}
          </Button>

          <button
            className="w-full text-center mt-5 text-arena-text-sec hover:text-arena-text text-sm font-semibold transition-colors cursor-pointer outline-none bg-transparent border-none py-1 press btn-press"
            disabled={status === "adding" || status === "success"}
            onClick={handleSkip}
          >
            {translations.skip}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
